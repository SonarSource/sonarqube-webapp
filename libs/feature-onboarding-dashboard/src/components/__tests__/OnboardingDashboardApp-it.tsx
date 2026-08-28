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

jest.mock('~adapters/helpers/useAutoImportToggle', () =>
  jest
    .requireActual<typeof import('./onboardingDashboardTestMocks')>(
      './onboardingDashboardTestMocks',
    )
    .autoImportToggleMock(),
);

const onboardingMock = setupOnboardingMock();

/**
 * The page shell: how the dashboard loads, what it does when a query fails, and which cards it
 * composes. The journey and the modals have their own suites, and each card's own behaviour is
 * covered by that card's suite.
 */

it('shows an error message when the overview request fails', async () => {
  onboardingMock.setFailOverview(true);
  renderOnboardingDashboard();

  expect(await ui.error.find()).toBeInTheDocument();
  expect(ui.headerSubtitle.query()).not.toBeInTheDocument();
});

it('shows an error message instead of silently dropping the DevOps platforms card when statistics fail', async () => {
  onboardingMock.setFailStatistics(true);
  renderOnboardingDashboard();

  expect(await ui.error.find()).toBeInTheDocument();
  expect(ui.devopsTitle.query()).not.toBeInTheDocument();
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
  expect(await ui.headerSubtitle.find()).toBeInTheDocument();
  await waitFor(() => {
    expect(ui.loading.query()).not.toBeInTheDocument();
  });
});

it('renders the page header with the progress tagline next to the heading', async () => {
  renderOnboardingDashboard();

  expect(await ui.headerSubtitle.find()).toBeInTheDocument();

  // The header shows the backend `progressPct` ring, surfaced as `overallPct` (not a client-side
  // computed value). The 75% label is unique to the header ring — the stepper donuts use
  // importedPct and analyzedPct — so it appears exactly once. The ring only mounts once the
  // overview query resolves.
  expect(await ui.headerProgress.find()).toBeInTheDocument();
});

it('renders the DevOps platforms card with brand rows and a not-bound row', async () => {
  renderOnboardingDashboard();

  expect(await ui.devopsTitle.find()).toBeInTheDocument();
  expect(ui.devopsGithub.get()).toBeInTheDocument();
  expect(ui.devopsBitbucket.get()).toBeInTheDocument();
  expect(ui.devopsGitlab.get()).toBeInTheDocument();
  expect(ui.devopsAzure.get()).toBeInTheDocument();
  expect(ui.devopsNotBound.get()).toBeInTheDocument();
  expect(ui.devopsGithubBar.get()).toBeInTheDocument();
});

it('composes the all-projects card but not the stale-projects one — STALE_PROJECTS_FEATURE_ENABLED is off', async () => {
  renderOnboardingDashboard();

  // The all-projects table having content is a reliable signal that the project queries have
  // resolved, at which point the stale card — which has no backing data yet — must be absent.
  expect(await ui.projectsTable.byText('web-core').find()).toBeInTheDocument();

  expect(ui.staleTitle.query()).not.toBeInTheDocument();
  expect(ui.staleTable.query()).not.toBeInTheDocument();
});
