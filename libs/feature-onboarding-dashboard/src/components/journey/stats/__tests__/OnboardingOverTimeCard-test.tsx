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

import { ComponentProps } from 'react';
import { renderWithContext } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { OnboardingTimelinePoint } from '~shared/types/onboarding';
import { OnboardingOverTimeCard } from '../OnboardingOverTimeCard';

// The chart only draws once its container has been measured, which never happens in jsdom.
jest.mock('~shared/helpers/useResizeObserver', () => ({
  useResizeObserver: jest.fn(() => [800, 300]),
}));

const MONTH_1 = '2025-02-01T00:00:00Z';
const MONTH_2 = '2025-03-01T00:00:00Z';
const MONTH_3 = '2025-04-01T00:00:00Z';

// Deliberately out of order: the chart sorts the timeline before plotting it.
const timeline: OnboardingTimelinePoint[] = [
  { date: MONTH_2, projectsScanned: 12, repositoriesImported: 18 },
  { date: MONTH_1, projectsScanned: 3, repositoriesImported: 7 },
  { date: MONTH_3, projectsScanned: 25, repositoriesImported: 40 },
];

const PROJECTS_SCANNED = 'onboarding_dashboard.journey.overtime.legend.projects_scanned';
const IMPORTED_LEGEND = 'onboarding_dashboard.journey.overtime.legend.repositories_imported';

const ui = {
  title: byText('onboarding_dashboard.journey.overtime.title'),
  chart: byRole('img', { name: 'onboarding_dashboard.journey.overtime.title' }),
  projectsScannedLegend: byText(PROJECTS_SCANNED),
  importedLegend: byText(IMPORTED_LEGEND),

  tooltip: byRole('tooltip'),
  tooltipProjectsScannedValue: byRole('tooltip').byText('3'),
  tooltipImportedValue: byRole('tooltip').byText('7'),
};

function renderCard(props: Partial<ComponentProps<typeof OnboardingOverTimeCard>> = {}) {
  return renderWithContext(
    <OnboardingOverTimeCard showImportedSeries timeline={timeline} {...props} />,
  );
}

it('renders only the projects-scanned series before any repository is imported', () => {
  renderCard({ showImportedSeries: false });

  expect(ui.title.get()).toBeInTheDocument();
  expect(ui.chart.get()).toBeInTheDocument();

  expect(ui.projectsScannedLegend.get()).toBeInTheDocument();
  expect(ui.importedLegend.query()).not.toBeInTheDocument();
});

it('adds the repositories-imported series once repositories are imported', () => {
  renderCard({ showImportedSeries: true });

  expect(ui.projectsScannedLegend.get()).toBeInTheDocument();
  expect(ui.importedLegend.get()).toBeInTheDocument();
});

it('shows a tooltip with the hovered month values and hides it again on mouse leave', async () => {
  const { user } = renderCard({ showImportedSeries: true });

  expect(ui.tooltip.query()).not.toBeInTheDocument();

  await user.hover(ui.chart.get());

  // Hovering at the very left of the plot snaps to the earliest month of the sorted timeline.
  expect(await ui.tooltip.find()).toBeInTheDocument();
  expect(ui.tooltipProjectsScannedValue.get()).toBeInTheDocument();
  expect(ui.tooltipImportedValue.get()).toBeInTheDocument();

  await user.unhover(ui.chart.get());

  expect(ui.tooltip.query()).not.toBeInTheDocument();
});

it('reports only the visible series in the tooltip', async () => {
  const { user } = renderCard({ showImportedSeries: false });

  await user.hover(ui.chart.get());

  expect(await ui.tooltip.find()).toBeInTheDocument();
  expect(ui.tooltipProjectsScannedValue.get()).toBeInTheDocument();
  expect(ui.tooltipImportedValue.query()).not.toBeInTheDocument();
  expect(byRole('tooltip').byText(IMPORTED_LEGEND).query()).not.toBeInTheDocument();
});

it('keeps the legend but draws no graph when there is no history yet', () => {
  renderCard({ timeline: [] });

  expect(ui.title.get()).toBeInTheDocument();
  expect(ui.projectsScannedLegend.get()).toBeInTheDocument();
  expect(ui.chart.query()).not.toBeInTheDocument();
});
