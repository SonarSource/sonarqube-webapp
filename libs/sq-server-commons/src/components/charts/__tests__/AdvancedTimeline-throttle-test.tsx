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

import { act, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { render } from '~shared/helpers/test-utils';
import { AdvancedTimeline } from '../AdvancedTimeline';

jest.mock('d3-scale', () => {
  const d3scale = jest.requireActual('d3-scale');
  return {
    ...d3scale,
    scaleTime: d3scale.scaleUtc,
  };
});

function renderComponent(updateTooltip: jest.Mock) {
  const ref = React.createRef<AdvancedTimeline>();

  const { container } = render(
    <AdvancedTimeline
      height={100}
      metricType="TEST_METRIC"
      ref={ref}
      series={[
        {
          name: 'test-1',
          type: 'test-type-1',
          translatedName: '',
          data: [
            { x: new Date('2019-10-01T00:00:00.000Z'), y: 1 },
            { x: new Date('2019-10-02T00:00:00.000Z'), y: 2 },
          ],
        },
      ]}
      updateTooltip={updateTooltip}
      width={100}
    />,
  );

  return { container, ref };
}

function getOverlay(container: HTMLElement) {
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const overlay = container.querySelector('.chart-mouse-events-overlay');

  if (!overlay) {
    throw new Error('Could not find the chart mouse events overlay');
  }

  return overlay;
}

it('ignores a stale position update that resolves after the pointer has left', () => {
  const updateTooltip = jest.fn();
  const { container, ref } = renderComponent(updateTooltip);
  const overlay = getOverlay(container);

  fireEvent.mouseEnter(overlay);
  fireEvent.mouseOut(overlay);

  // updateTooltipPos is throttled, so a move made just before the pointer left the graph can
  // still resolve after the mouseOut has already been handled. Simulate that stale, late-arriving
  // call directly: it must not revive the tooltip now that the pointer has left.
  act(() => {
    ref.current?.updateTooltipPos(10);
  });

  expect(updateTooltip).not.toHaveBeenCalled();
});
