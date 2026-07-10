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
import { userEvent } from '@testing-library/user-event';
import { ALM_ICONS_BASE_URL } from '~adapters/helpers/urls';
import {
  mockOnboardingOverview,
  mockOnboardingProjects,
  OnboardingServiceMock,
} from '~shared/api/mocks/OnboardingServiceMock';
import { registerServiceMocks, server } from '~shared/api/mocks/server';
import { renderWithRoutes } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import routes from '../../routes';
import { NO_DATA } from '../dashboardConstants';

let onboardingMock: OnboardingServiceMock;

beforeAll(() => {
  onboardingMock = new OnboardingServiceMock();
});

beforeEach(() => {
  registerServiceMocks(onboardingMock);
});

afterEach(() => {
  onboardingMock.reset();
  // Remove any handlers added by individual tests (e.g. via server.use()) so they
  // don't bleed into the next test. SetupTests-it.ts re-registers shared handlers in
  // its own beforeEach, so this is safe to call unconditionally.
  server.resetHandlers();
});

const ui = {
  repositoriesDiscoveredTitle: byText('onboarding_dashboard.cards.repositories_discovered.title'),
  projectsOnboardedTitle: byText('onboarding_dashboard.cards.projects_onboarded.title'),
  scanHealthTitle: byText('onboarding_dashboard.cards.scan_health.title'),
  prIntegrationTitle: byText('onboarding_dashboard.cards.pr_integration.title'),
  error: byText('default_error_message'),

  // The react-intl mock renders the percent message as `<id>.<value>`. The mock's
  // projectsOnboarded.percentOfImported (16.7) is unique across the fixture, so this text only
  // appears if the card reads the correct API field (guards the percentOfTotal→percentOfImported fix).
  projectsOnboardedPercent: byText('onboarding_dashboard.checklist.percent.16.7'),

  // Header — the ring label reflects the backend overallMaturityPct (75 in the mock), also unique.
  headerSubtitle: byText('onboarding_dashboard.header.subtitle'),
  headerProgress: byText('onboarding_dashboard.checklist.percent.75'),

  // The bare percent message id (no numeric suffix) is never rendered on a healthy page — every
  // percent has a value. It only appears if a null percentage reaches formatMessage, i.e. if a
  // card's NO_DATA guard regressed to a value-less "%". Used as a regression guard.
  barePercent: byText('onboarding_dashboard.checklist.percent'),

  // Checklist
  checklistTitle: byText('onboarding_dashboard.checklist.title'),
  maturityBadge: byText('onboarding_dashboard.checklist.maturity.Advanced'),
  discoverItemTitle: byText('onboarding_dashboard.checklist.item.discover.title'),
  onboardItemTitle: byText('onboarding_dashboard.checklist.item.onboard.title'),
  discoverProgressBar: byRole('progressbar', {
    name: 'onboarding_dashboard.checklist.item.discover.title',
  }),

  // Momentum
  momentumTitle: byText('onboarding_dashboard.momentum.title'),
  momentumChart: byRole('img', { name: 'onboarding_dashboard.momentum.title' }),
  legendTotal: byText('onboarding_dashboard.momentum.legend.total'),
  legendImported: byText('onboarding_dashboard.momentum.legend.imported'),
  legendOnboarded: byText('onboarding_dashboard.momentum.legend.onboarded'),

  // Charts
  scanConfigTitle: byText('onboarding_dashboard.charts.scan_config.title'),
  scanConfigFullCiLegend: byText('onboarding_dashboard.charts.scan_config.full_ci'),
  qualityGateTitle: byText('onboarding_dashboard.charts.quality_gate.title'),
  qualityGatePassingLegend: byText('onboarding_dashboard.charts.quality_gate.passing'),
  qualityGateNotOnboardedLegend: byText('onboarding_dashboard.charts.quality_gate.not_onboarded'),

  // DevOps platforms
  devopsTitle: byText('onboarding_dashboard.devops.title'),
  devopsGithub: byText('alm.github'),
  devopsBitbucket: byText('alm.bitbucket'),
  devopsGitlab: byText('alm.gitlab'),
  devopsAzure: byText('alm.azure'),
  devopsNotBound: byText('onboarding_dashboard.devops.not_bound'),
  devopsGithubBar: byRole('progressbar', { name: 'alm.github' }),

  // Potentially stale projects
  staleTitle: byText('onboarding_dashboard.stale.title'),
  staleProjectsTable: byRole('table', { name: 'onboarding_dashboard.stale.title' }),

  // Repositories & projects
  repositoriesTitle: byText('onboarding_dashboard.projects.title'),
  searchInput: byRole('searchbox', { name: 'onboarding_dashboard.projects.search' }),
  notOnboardedFilter: byText('onboarding_dashboard.projects.filter.not_onboarded'),
  repoWebCore: byText('web-core'),
  repoPlatformJobs: byText('platform-jobs'),
  repoGitlabIcon: byRole('img', { name: 'alm.gitlab' }),
};

function renderOnboardingDashboard() {
  return renderWithRoutes(routes(), { initialEntries: ['/onboarding-dashboard'] });
}

it('renders the four onboarding summary cards with their data', async () => {
  renderOnboardingDashboard();

  expect(await ui.repositoriesDiscoveredTitle.find()).toBeInTheDocument();
  expect(ui.projectsOnboardedTitle.get()).toBeInTheDocument();
  expect(ui.scanHealthTitle.get()).toBeInTheDocument();
  expect(ui.prIntegrationTitle.get()).toBeInTheDocument();

  // The projects-onboarded card renders its percentage from percentOfImported.
  expect(ui.projectsOnboardedPercent.get()).toBeInTheDocument();
});

it('shows a no-data placeholder on the projects and PR cards when their percentage is null', async () => {
  // A null percentage (no imported projects yet) must render the em-dash placeholder and omit the
  // ring, rather than an empty "%". Covers the null branch of both percent-driven cards.
  onboardingMock.setOverview(
    mockOnboardingOverview({
      projectsOnboarded: {
        onboarded: 0,
        totalProjects: 0,
        importedEmpty: 0,
        percentOfImported: null,
      },
      prIntegration: { prDecorationCount: 0, percentOfOnboarded: null },
    }),
  );
  renderOnboardingDashboard();

  // Wait for the cards to mount, then confirm neither shows a percentage value...
  expect(await ui.projectsOnboardedTitle.find()).toBeInTheDocument();
  expect(ui.projectsOnboardedPercent.query()).not.toBeInTheDocument();

  // ...and neither regressed to a value-less "%": a null reaching formatMessage would render the
  // bare message id. Its absence proves both cards took the NO_DATA (em-dash) branch instead.
  expect(ui.barePercent.query()).not.toBeInTheDocument();
});

it('shows an error message when the overview request fails', async () => {
  onboardingMock.setFailOverview(true);
  renderOnboardingDashboard();

  expect(await ui.error.find()).toBeInTheDocument();
  expect(ui.repositoriesDiscoveredTitle.query()).not.toBeInTheDocument();
});

it('renders the page header with the progress tagline next to the heading', async () => {
  renderOnboardingDashboard();

  expect(await ui.headerSubtitle.find()).toBeInTheDocument();
  // The header ring shows the backend overallMaturityPct, not a client-side computed value.
  // The ring only mounts once the overview query resolves, so wait for it.
  expect(await ui.headerProgress.find()).toBeInTheDocument();
});

it('renders the onboarding checklist with maturity badge and progress bars', async () => {
  renderOnboardingDashboard();

  expect(await ui.checklistTitle.find()).toBeInTheDocument();
  expect(ui.maturityBadge.get()).toBeInTheDocument();
  expect(ui.discoverItemTitle.get()).toBeInTheDocument();
  expect(ui.onboardItemTitle.get()).toBeInTheDocument();

  const discoverProgressBar = ui.discoverProgressBar.get();
  expect(discoverProgressBar).toBeInTheDocument();
  expect(discoverProgressBar).toHaveAttribute('aria-valuenow', '100');
});

it('renders the onboarding momentum card with chart and legend', async () => {
  renderOnboardingDashboard();

  expect(await ui.momentumTitle.find()).toBeInTheDocument();
  expect(ui.momentumChart.get()).toBeInTheDocument();

  expect(ui.legendTotal.get()).toBeInTheDocument();
  expect(ui.legendImported.get()).toBeInTheDocument();
  expect(ui.legendOnboarded.get()).toBeInTheDocument();
});

it('renders the charts section with the scan configuration and quality gate donuts', async () => {
  renderOnboardingDashboard();

  expect(await ui.scanConfigTitle.find()).toBeInTheDocument();
  expect(ui.scanConfigFullCiLegend.get()).toBeInTheDocument();

  expect(ui.qualityGateTitle.get()).toBeInTheDocument();
  expect(ui.qualityGatePassingLegend.get()).toBeInTheDocument();
  expect(ui.qualityGateNotOnboardedLegend.get()).toBeInTheDocument();
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

it('renders the potentially stale projects card listing only stale projects', async () => {
  renderOnboardingDashboard();

  expect(await ui.staleTitle.find()).toBeInTheDocument();

  // The stale table only lists projects with stale commits (payments-gateway), not healthy ones
  // (web-core), which the API filters server-side.
  expect(await ui.staleProjectsTable.byText('payments-gateway').find()).toBeInTheDocument();
  expect(ui.staleProjectsTable.byText('web-core').query()).not.toBeInTheDocument();
});

it('renders an empty-state row in the stale projects card when there are no stale projects', async () => {
  // Seed only a non-stale project (web-core); the stale filter returns nothing, so the table
  // still renders its header and a no-data row rather than collapsing to an empty card body.
  onboardingMock.setProjects([mockOnboardingProjects()[2]]);
  renderOnboardingDashboard();

  const staleTable = await ui.staleProjectsTable.find();
  expect(staleTable).toBeInTheDocument();
  expect(ui.staleProjectsTable.byText('web-core').query()).not.toBeInTheDocument();
  // One em-dash placeholder per data column (repository, gate status, last scan).
  expect(ui.staleProjectsTable.byText(NO_DATA).getAll()).toHaveLength(3);
});

it('filters the repositories list by search and by filter chip', async () => {
  const user = userEvent.setup({ delay: null });
  renderOnboardingDashboard();

  expect(await ui.repositoriesTitle.find()).toBeInTheDocument();
  // web-core is a non-stale project (only appears in the repositories table)
  expect(await ui.repoWebCore.find()).toBeInTheDocument();

  // Search narrows the list to matching repositories (debounced + server-side)
  await user.type(ui.searchInput.get(), 'platform');
  await waitFor(() => {
    expect(ui.repoWebCore.query()).not.toBeInTheDocument();
  });
  expect(ui.repoPlatformJobs.get()).toBeInTheDocument();

  // Clearing the search brings every repository back
  await user.clear(ui.searchInput.get());
  expect(await ui.repoWebCore.find()).toBeInTheDocument();

  // Filtering by "Not onboarded" keeps only NOT_IMPORTED projects
  await user.click(ui.notOnboardedFilter.get());
  await waitFor(() => {
    expect(ui.repoWebCore.query()).not.toBeInTheDocument();
  });
  expect(ui.repoPlatformJobs.get()).toBeInTheDocument();
});

it('renders the repository ALM icon from the app-specific images path', async () => {
  // web-core is bound to GitLab; its icon must resolve to the per-app ALM images folder
  // (/images/alm on SQS, /images/alms on SQC) — a hardcoded path breaks on one platform.
  renderOnboardingDashboard();

  const icon = await ui.repoGitlabIcon.find();
  expect(icon).toHaveAttribute('src', expect.stringContaining(`${ALM_ICONS_BASE_URL}/gitlab.svg`));
});

it('clamps the checklist progress bar to 100 when completionPct exceeds 100', async () => {
  // The mock data includes pr-deco with completionPct: 600.
  // After the fix both the bar and the label must be capped at 100.
  renderOnboardingDashboard();

  const prDecoBar = await byRole('progressbar', {
    name: 'onboarding_dashboard.checklist.item.pr-deco.title',
  }).find();
  expect(prDecoBar).toHaveAttribute('aria-valuenow', '100');
});

it('shows a cap note in the stale card when the total exceeds the fetched page', async () => {
  // Simulate an org with more stale projects than the 500-row display cap.
  // setProjects provides a 1-item stale list; setStaleTotalOverride makes the mock server
  // report 501 as page.total so isCapped becomes true — without creating hundreds of DOM rows.
  onboardingMock.setProjects([mockOnboardingProjects()[1]]);
  onboardingMock.setStaleTotalOverride(501);
  renderOnboardingDashboard();

  expect(await ui.staleTitle.find()).toBeInTheDocument();
  // The "Showing first {count}" note must appear once the total exceeds the 500-project cap.
  // The react-intl mock joins id + primitive values with dots, so formatMessage({id}, {count: 1})
  // produces 'onboarding_dashboard.stale.capped.1' (count == staleProjects.length == 1).
  expect(await byText('onboarding_dashboard.stale.capped.1').find()).toBeInTheDocument();
});

it('shows pagination in the repositories card when the total exceeds the page size', async () => {
  // Seed 51 projects (all non-stale) to trigger pagination (PAGE_SIZE = 50).
  // Pagination only appears when data.page.total > PAGE_SIZE, confirming the header
  // count uses the server total rather than the local page slice.
  const baseProject = mockOnboardingProjects()[2]; // web-core — non-stale, analysed
  onboardingMock.setProjects(
    Array.from({ length: 51 }, (_, i) => ({ ...baseProject, key: `repo-${i}`, name: `repo-${i}` })),
  );
  renderOnboardingDashboard();

  expect(await ui.repositoriesTitle.find()).toBeInTheDocument();
  // Pagination is only rendered when totalPages > 1, which requires data.page.total > 50.
  // Echoes' Pagination component renders a <div> wrapper, not a <nav>, so we probe for the
  // page-2 button whose aria-label is produced by the react-intl mock as 'pagination.page_x.2'
  // (formatMessage({id:'pagination.page_x'}, {page:'2'}) → [id, '2'].join('.')).
  expect(await byRole('button', { name: 'pagination.page_x.2' }).find()).toBeInTheDocument();
});
