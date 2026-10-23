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

import { waitFor } from '@testing-library/react';
import { http } from 'msw';
import { API_V2_MOCKS_PREFIX } from '~adapters/helpers/urls';
import { server } from '~shared/api/mocks/server';
import { renderOnboardingDashboard, setupOnboardingMock, ui } from './onboardingDashboardTestSetup';

jest.mock('~adapters/helpers/useOnboardingCurrentBinding', () =>
  jest
    .requireActual<typeof import('./onboardingDashboardTestMocks')>(
      './onboardingDashboardTestMocks',
    )
    .currentBindingMock(),
);

jest.mock('~adapters/helpers/useCreateDevopsConfigurationUrl', () =>
  jest
    .requireActual<typeof import('./onboardingDashboardTestMocks')>(
      './onboardingDashboardTestMocks',
    )
    .createDevopsConfigurationUrlMock(),
);

jest.mock('~adapters/helpers/useOnboardingDevopsConfigurations', () =>
  jest
    .requireActual<typeof import('./onboardingDashboardTestMocks')>(
      './onboardingDashboardTestMocks',
    )
    .devopsConfigurationsMock(),
);

// The extra card (auto-import on cloud, CLI bulk import on server) is tested at the adapter level;
// the integration test stubs it out to keep platform internals out of the shared test.
jest.mock('~adapters/components/onboarding/ImportRepositoriesExtraCard', () => ({
  ImportRepositoriesExtraCard: () => null,
}));

jest.mock('~adapters/helpers/useCanCreateProjects', () =>
  jest
    .requireActual<typeof import('./onboardingDashboardTestMocks')>(
      './onboardingDashboardTestMocks',
    )
    .canCreateProjectsMock(),
);

const onboardingMock = setupOnboardingMock();

/**
 * The dashboard body: how its sections load independently, what it does when a query fails, and
 * which cards it composes.
 * The page chrome around it lives in each product's OnboardingDashboardPage; the journey and the
 * modals have their own suites, and each card's own behaviour is covered by that card's suite.
 */

it('shows an error message in place of the journey when the overview request fails', async () => {
  onboardingMock.setFailOverview(true);
  renderOnboardingDashboard();

  // The table first: the overview retries with a backoff, so the error only lands after it.
  expect(await ui.projectsTable.byText('web-core').find()).toBeInTheDocument();
  expect(await ui.error.find()).toBeInTheDocument();
  expect(ui.stepperBinding.query()).not.toBeInTheDocument();
});

it('shows an error message in place of the timeline when the statistics request fails', async () => {
  onboardingMock.setFailStatistics(true);
  renderOnboardingDashboard();

  expect(await ui.stepperBinding.find()).toBeInTheDocument();
  expect(await ui.error.find()).toBeInTheDocument();
  expect(ui.overTimeChart.query()).not.toBeInTheDocument();
});

it('shows the project tables without waiting for the overview', async () => {
  const releaseOverview = onboardingMock.holdResponse('overview');
  renderOnboardingDashboard();

  expect(await ui.projectsTable.byText('web-core').find()).toBeInTheDocument();
  expect(ui.stepperBinding.query()).not.toBeInTheDocument();

  releaseOverview();

  expect(await ui.stepperBinding.find()).toBeInTheDocument();
});

it('shows the journey without waiting for the statistics', async () => {
  const releaseStatistics = onboardingMock.holdResponse('statistics');
  renderOnboardingDashboard();

  expect(await ui.stepperBinding.find()).toBeInTheDocument();
  expect(ui.overTimeChart.query()).not.toBeInTheDocument();

  releaseStatistics();

  expect(await ui.overTimeChart.find()).toBeInTheDocument();
});

it('shows loading skeletons before the dashboard data resolves', async () => {
  renderOnboardingDashboard();

  // The overview renders skeletons wrapped in a LoadingContainer, which announces the loading
  // state to screen readers before any query resolves. Awaited rather than read synchronously
  // because the route mounts the app through `lazyLoadComponent`, whose Suspense fallback is
  // `null` — nothing is in the DOM until the dynamic import resolves a tick later.
  expect((await ui.loading.findAll()).length).toBeGreaterThan(0);

  // Once the overview and project queries resolve, real content replaces the skeletons and the
  // loading announcements clear. Polled rather than awaited through `waitForElementToBeRemoved`:
  // several cards announce this same message and they resolve on different queries, so by the time
  // the header is up the last announcement may already be gone — which that helper treats as an
  // error rather than as success.
  expect(await ui.stepperBinding.find()).toBeInTheDocument();
  await waitFor(() => {
    expect(ui.loading.query()).not.toBeInTheDocument();
  });
});

it('composes the all-projects card but not the stale-projects one — STALE_PROJECTS_FEATURE_ENABLED is off', async () => {
  renderOnboardingDashboard();

  // The all-projects table having content is a reliable signal that the project queries have
  // resolved, at which point the stale card — which has no backing data yet — must be absent.
  expect(await ui.projectsTable.byText('web-core').find()).toBeInTheDocument();

  expect(ui.staleTitle.query()).not.toBeInTheDocument();
  expect(ui.staleTable.query()).not.toBeInTheDocument();
});

it('reuses the prefetched statistics and first projects page instead of requesting them again', async () => {
  const statisticsRequested = jest.fn();
  const projectsRequested = jest.fn();
  // Both record the call and fall through to the onboarding service mock for the response.
  server.use(
    http.get(`${API_V2_MOCKS_PREFIX}/onboarding/statistics`, () => {
      statisticsRequested();
    }),
    http.get(`${API_V2_MOCKS_PREFIX}/onboarding/projects`, () => {
      projectsRequested();
    }),
  );
  renderOnboardingDashboard();

  expect(await ui.projectsTable.byText('web-core').find()).toBeInTheDocument();
  expect(await ui.overTimeChart.find()).toBeInTheDocument();

  expect(statisticsRequested).toHaveBeenCalledTimes(1);
  expect(projectsRequested).toHaveBeenCalledTimes(1);
});
