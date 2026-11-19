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
import { mockOnboardingOverview } from '~shared/api/mocks/OnboardingServiceMock';
import { deriveJourneyState } from '~shared/helpers/onboarding/deriveJourneyState';
import { renderWithContext } from '~shared/helpers/test-utils';
import { byRole } from '~shared/helpers/testSelector';
import { JourneyStatistics } from '../JourneyStatistics';

jest.mock('~shared/helpers/useResizeObserver', () => ({
  useResizeObserver: jest.fn(() => [800, 300]),
}));

jest.mock('~adapters/helpers/useCreateDevopsConfigurationUrl', () => ({
  useCreateDevopsConfigurationUrl: () => undefined,
}));

const CHART_WIDTH = 800;

const journeyState = deriveJourneyState(
  mockOnboardingOverview({
    projects: { analyzed: 20, notImported: 0, notScanned: 13, percent: null, total: 33 },
    repositories: { discovered: 26, imported: 26, percent: null },
  }),
);

const ui = {
  chart: byRole('img', { name: 'onboarding_dashboard.journey.overtime.title' }),
  tooltipCount: (count: number) => byRole('tooltip').byText(String(count)),
  tooltipPercent: (percent: number) =>
    byRole('tooltip').byText(`onboarding_dashboard.percent.${percent}`),
  tooltipAnyPercent: byRole('tooltip').byText(/^onboarding_dashboard\.percent\./),
};

function renderStatistics(props: Partial<ComponentProps<typeof JourneyStatistics>> = {}) {
  return renderWithContext(
    <JourneyStatistics
      isBound
      isTimelineError={false}
      timeline={[
        { date: '2026-10-01T00:00:00Z', projectsScanned: 18, repositoriesImported: 30 },
        { date: '2026-11-01T00:00:00Z', projectsScanned: 19, repositoriesImported: 33 },
      ]}
      {...props}
    />,
  );
}

it('plots the latest month from the statistics, without shares, until the overview is there', async () => {
  const { user } = renderStatistics();

  await user.pointer({ coords: { clientX: CHART_WIDTH }, target: ui.chart.get() });

  expect(await ui.tooltipCount(33).find()).toBeInTheDocument();
  expect(ui.tooltipCount(19).get()).toBeInTheDocument();
  expect(ui.tooltipAnyPercent.query()).not.toBeInTheDocument();
});

it('counts the latest month as the overview does once it is there', async () => {
  const { user } = renderStatistics({ journeyState });

  await user.pointer({ coords: { clientX: CHART_WIDTH }, target: ui.chart.get() });

  expect(await ui.tooltipCount(26).find()).toBeInTheDocument();
  expect(ui.tooltipPercent(100).get()).toBeInTheDocument();
  expect(ui.tooltipCount(20).get()).toBeInTheDocument();
  expect(ui.tooltipPercent(61).get()).toBeInTheDocument();
});

it('keeps the earlier months from the statistics', async () => {
  const { user } = renderStatistics({ journeyState });

  await user.pointer({ coords: { clientX: 0 }, target: ui.chart.get() });

  expect(await ui.tooltipCount(30).find()).toBeInTheDocument();
  expect(ui.tooltipCount(18).get()).toBeInTheDocument();
});
