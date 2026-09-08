/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MetricType } from '~shared/types/metrics';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { Serie } from '../../../types/project-activity';
import GraphHistory from '../GraphHistory';

jest.mock('~shared/helpers/useResizeObserver', () => ({
  useResizeObserver: jest.fn(() => [500, 300]),
}));

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');

  return { ...lodash, throttle: (f: unknown) => f };
});

const SERIES: Serie[] = [
  {
    data: [
      { x: new Date('2019-10-01T00:00:00.000Z'), y: 1 },
      { x: new Date('2019-10-02T00:00:00.000Z'), y: 2 },
    ],
    name: 'bugs',
    translatedName: 'Bugs',
    type: MetricType.Integer,
  },
];

function GraphHistoryHarness() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  return (
    <GraphHistory
      analyses={[]}
      graph="issues"
      graphDescription="Bugs over time"
      measuresHistory={[]}
      metricsType={MetricType.Integer}
      selectedDate={selectedDate}
      series={SERIES}
      showAreas={false}
      updateTooltip={setSelectedDate}
    />
  );
}

function renderGraphHistory() {
  return renderComponent(<GraphHistoryHarness />);
}

function hoverChart(container: HTMLElement) {
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const overlay = container.querySelector('.chart-mouse-events-overlay');

  if (!overlay) {
    throw new Error('Could not find the chart mouse events overlay');
  }

  fireEvent.mouseEnter(overlay);
  fireEvent.mouseMove(overlay, { pageX: 400 });

  return overlay;
}

it('keeps the tooltip visible while the pointer moves onto it, and hides it once the pointer truly leaves the graph', async () => {
  const { container } = renderGraphHistory();

  const overlay = hoverChart(container);
  const tooltip = await screen.findByRole('tooltip');

  // Moving the pointer from the overlay towards the tooltip content must not dismiss it.
  fireEvent.mouseOut(overlay, { relatedTarget: tooltip });
  expect(screen.getByRole('tooltip')).toBeInTheDocument();

  // Leaving the graph entirely (not towards the tooltip) dismisses it.
  fireEvent.mouseOut(overlay, { relatedTarget: document.body });
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

it('dismisses the tooltip with the Escape key without moving focus', async () => {
  const { container } = renderGraphHistory();

  hoverChart(container);
  await screen.findByRole('tooltip');

  await userEvent.keyboard('{Escape}');

  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  // Nothing was ever focused, so dismissal via Escape must leave focus on the body.
  expect(document.body).toHaveFocus();
});
