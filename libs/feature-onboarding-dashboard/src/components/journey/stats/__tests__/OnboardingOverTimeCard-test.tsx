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
import { OnboardingMomentum } from '~shared/types/onboarding';
import { OnboardingOverTimeCard } from '../OnboardingOverTimeCard';

// The chart only draws once its container has been measured, which never happens in jsdom.
jest.mock('~shared/helpers/useResizeObserver', () => ({
  useResizeObserver: jest.fn(() => [800, 300]),
}));

const WEEK_1 = new Date('2025-02-03T00:00:00Z').getTime();
const WEEK_2 = new Date('2025-02-10T00:00:00Z').getTime();
const WEEK_3 = new Date('2025-02-17T00:00:00Z').getTime();

const momentum: OnboardingMomentum = {
  currentState: {
    ciCount: 70,
    failedScanCount: 11,
    importedEmptyCount: 19,
    localCount: 10,
    managedCount: 7,
  },
  importedCount: 40,
  onboardedCount: 25,
  startDate: WEEK_1,
  totalRepos: 120,
  weeklyDelta: 12,
  // Deliberately out of order: the chart sorts the history before plotting it.
  weeklyHistory: [
    { weekStart: WEEK_2, cumulativeImported: 18, cumulativeOnboarded: 12 },
    { weekStart: WEEK_1, cumulativeImported: 7, cumulativeOnboarded: 3 },
    { weekStart: WEEK_3, cumulativeImported: 40, cumulativeOnboarded: 25 },
  ],
};

const PLATFORMS_LEGEND = 'onboarding_dashboard.journey.overtime.legend.platforms_bound';
const IMPORTED_LEGEND = 'onboarding_dashboard.journey.overtime.legend.repositories_imported';

const ui = {
  title: byText('onboarding_dashboard.journey.overtime.title'),
  chart: byRole('img', { name: 'onboarding_dashboard.journey.overtime.title' }),
  platformsLegend: byText(PLATFORMS_LEGEND),
  importedLegend: byText(IMPORTED_LEGEND),

  tooltip: byRole('tooltip'),
  tooltipPlatformsValue: byRole('tooltip').byText('3'),
  tooltipImportedValue: byRole('tooltip').byText('7'),
};

function renderCard(props: Partial<ComponentProps<typeof OnboardingOverTimeCard>> = {}) {
  return renderWithContext(
    <OnboardingOverTimeCard momentum={momentum} showImportedSeries {...props} />,
  );
}

it('renders only the platforms-bound series before any repository is imported', () => {
  renderCard({ showImportedSeries: false });

  expect(ui.title.get()).toBeInTheDocument();
  expect(ui.chart.get()).toBeInTheDocument();

  expect(ui.platformsLegend.get()).toBeInTheDocument();
  expect(ui.importedLegend.query()).not.toBeInTheDocument();
});

it('adds the repositories-imported series once repositories are imported', () => {
  renderCard({ showImportedSeries: true });

  expect(ui.platformsLegend.get()).toBeInTheDocument();
  expect(ui.importedLegend.get()).toBeInTheDocument();
});

it('shows a tooltip with the hovered week values and hides it again on mouse leave', async () => {
  const { user } = renderCard({ showImportedSeries: true });

  expect(ui.tooltip.query()).not.toBeInTheDocument();

  await user.hover(ui.chart.get());

  // Hovering at the very left of the plot snaps to the earliest week of the sorted history.
  expect(await ui.tooltip.find()).toBeInTheDocument();
  expect(ui.tooltipPlatformsValue.get()).toBeInTheDocument();
  expect(ui.tooltipImportedValue.get()).toBeInTheDocument();

  await user.unhover(ui.chart.get());

  expect(ui.tooltip.query()).not.toBeInTheDocument();
});

it('reports only the visible series in the tooltip', async () => {
  const { user } = renderCard({ showImportedSeries: false });

  await user.hover(ui.chart.get());

  expect(await ui.tooltip.find()).toBeInTheDocument();
  expect(ui.tooltipPlatformsValue.get()).toBeInTheDocument();
  expect(ui.tooltipImportedValue.query()).not.toBeInTheDocument();
  expect(byRole('tooltip').byText(IMPORTED_LEGEND).query()).not.toBeInTheDocument();
});

it('keeps the legend but draws no graph when there is no history yet', () => {
  renderCard({ momentum: { ...momentum, weeklyHistory: [] } });

  expect(ui.title.get()).toBeInTheDocument();
  expect(ui.platformsLegend.get()).toBeInTheDocument();
  expect(ui.chart.query()).not.toBeInTheDocument();
});
