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

import { renderWithContext } from '~shared/helpers/test-utils';
import { byText } from '~shared/helpers/testSelector';
import { PanelDonut, PanelDonutSegment } from '../PanelDonut';

const SEGMENTS: PanelDonutSegment[] = [
  { color: '#d4333f', label: 'Critical', value: 5 },
  { color: '#f09000', label: 'High', value: 10 },
];

const ui = {
  centerLabel: byText('40%'),
  centerSubLabel: byText('issues found'),
  critical: byText('Critical', { selector: '[data-label="Critical"]' }),
  high: byText('High', { selector: '[data-label="High"]' }),
  viewAll: byText('View all'),
  // In tests, react-intl returns the message key when no messages are loaded.
  tooltipCount: byText('onboarding_dashboard.donut.tooltip.count'),
  tooltipPct: byText('onboarding_dashboard.donut.tooltip.percentage'),
};

function setup(props: Partial<Parameters<typeof PanelDonut>[0]> = {}) {
  return renderWithContext(
    <PanelDonut centerLabel="40%" centerSubLabel="issues found" segments={SEGMENTS} {...props} />,
  );
}

it('renders the center label and sub-label', () => {
  setup();

  expect(ui.centerLabel.get()).toBeInTheDocument();
  expect(ui.centerSubLabel.get()).toBeInTheDocument();
});

it('renders a legend entry for each segment', () => {
  setup();

  expect(ui.critical.get()).toBeInTheDocument();
  expect(ui.high.get()).toBeInTheDocument();
});

it('renders the viewAll slot when provided', () => {
  setup({ viewAll: <button type="button">View all</button> });

  expect(ui.viewAll.get()).toBeInTheDocument();
});

it('shows a tooltip with label, count, and percentage when a legend item is hovered', async () => {
  const { user } = setup();

  await user.hover(ui.critical.get());

  expect(await ui.tooltipCount.find()).toBeInTheDocument();
  expect(byText('5').get()).toBeInTheDocument();
  expect(ui.tooltipPct.get()).toBeInTheDocument();
  expect(byText(/^33%$/).get()).toBeInTheDocument();
});

it('hides the tooltip when the pointer leaves the legend item', async () => {
  const { user } = setup();

  await user.hover(ui.critical.get());
  expect(await ui.tooltipCount.find()).toBeInTheDocument();

  await user.unhover(ui.critical.get());
  expect(ui.tooltipCount.query()).not.toBeInTheDocument();
});

it('shows a tooltip when a legend item receives keyboard focus', async () => {
  const { user } = setup();

  await user.tab();

  expect(await ui.tooltipCount.find()).toBeInTheDocument();
  // Critical (5 / 15) is the first legend item; count value must be present
  expect(byText('5').get()).toBeInTheDocument();
});

it('hides the tooltip when the focused legend item loses focus', async () => {
  const { user } = setup({ viewAll: <button type="button">View all</button> });

  await user.tab(); // Focus first legend item (Critical)
  expect(await ui.tooltipCount.find()).toBeInTheDocument();

  await user.tab(); // Focus second legend item (High)
  expect(await ui.tooltipCount.find()).toBeInTheDocument();

  await user.tab(); // Focus "View all" button — legend blurs, tooltip hides
  expect(ui.tooltipCount.query()).not.toBeInTheDocument();
});

it('shows a tooltip when hovering directly on a ring segment', async () => {
  const { container, user } = setup();

  // eslint-disable-next-line testing-library/no-container -- SVG <path> has no accessible role; no Testing Library query alternative exists
  const [firstArc] = Array.from(container.querySelectorAll<SVGPathElement>('.donut-chart path'));
  await user.hover(firstArc);

  expect(await ui.tooltipCount.find()).toBeInTheDocument();
});

it('does not show the percentage row when all segment values are zero', async () => {
  const zeroSegments: PanelDonutSegment[] = [
    { color: '#d4333f', label: 'Critical', value: 0 },
    { color: '#f09000', label: 'High', value: 0 },
  ];
  const { user } = renderWithContext(
    <PanelDonut centerLabel="0%" centerSubLabel="no issues" segments={zeroSegments} />,
  );

  await user.hover(ui.critical.get());

  expect(await ui.tooltipCount.find()).toBeInTheDocument();
  expect(ui.tooltipPct.query()).not.toBeInTheDocument();
});
