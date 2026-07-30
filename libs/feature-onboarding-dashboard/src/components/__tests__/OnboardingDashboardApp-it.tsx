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
  error: byText('default_error_message'),

  // The overview LoadingContainer announces this message (the react-intl mock renders the key
  // literally) while skeletons are shown; it clears once the data resolves.
  loading: byText('onboarding_dashboard.loading'),

  // Header — the ring label reflects the backend overallMaturityPct (75 in the mock), which is
  // unique across the fixture (the stepper donuts use importedPct/analyzedPct).
  headerSubtitle: byText('onboarding_dashboard.header.subtitle'),
  headerProgress: byText('onboarding_dashboard.percent.75'),

  // Journey stepper — three selectable step cards rendered as buttons (aria-label === title).
  stepperBinding: byRole('button', {
    name: 'onboarding_dashboard.journey.step.binding.title',
  }),
  stepperRepositories: byRole('button', {
    name: 'onboarding_dashboard.journey.step.repositories.title',
  }),
  stepperProjects: byRole('button', {
    name: 'onboarding_dashboard.journey.step.projects.title',
  }),

  // Journey statistics — progressively unlocked by JourneyLevel.
  overTimeChart: byRole('img', { name: 'onboarding_dashboard.journey.overtime.title' }),
  overTimePlatformsLegend: byText('onboarding_dashboard.journey.overtime.legend.platforms_bound'),
  overTimeImportedLegend: byText(
    'onboarding_dashboard.journey.overtime.legend.repositories_imported',
  ),
  lockedStatsTitle: byText('onboarding_dashboard.journey.locked.stats.title'),
  lockedStatsCta: byRole('button', { name: 'onboarding_dashboard.journey.locked.stats.cta' }),
  lockedMoreTitle: byText('onboarding_dashboard.journey.locked.more.title'),
  lockedMoreCta: byRole('button', { name: 'onboarding_dashboard.journey.locked.more.cta' }),

  // DevOps platforms
  devopsTitle: byText('onboarding_dashboard.devops.title'),
  devopsGithub: byText('alm.github'),
  devopsBitbucket: byText('alm.bitbucket'),
  devopsGitlab: byText('alm.gitlab'),
  devopsAzure: byText('alm.azure'),
  devopsNotBound: byText('onboarding_dashboard.devops.not_bound'),
  devopsGithubBar: byRole('progressbar', { name: 'alm.github' }),

  // All projects table
  projectsTitle: byText('onboarding_dashboard.projects.title'),
  projectsTable: byRole('table', { name: 'onboarding_dashboard.projects.title' }),
  projectsTableColumnHeaders: byRole('table', {
    name: 'onboarding_dashboard.projects.title',
  }).byRole('columnheader'),
  searchInput: byRole('searchbox', { name: 'onboarding_dashboard.projects.search' }),
  notOnboardedFilter: byText('onboarding_dashboard.projects.filter.not_onboarded'),
  colRepository: byText('onboarding_dashboard.projects.col.repository'),
  colScanStatus: byText('onboarding_dashboard.projects.col.onboarding'),
  colAnalysisMode: byText('onboarding_dashboard.projects.col.analysis_mode'),
  colGateStatus: byText('onboarding_dashboard.projects.col.gate_status'),
  repoWebCore: byText('web-core'),
  repoPlatformJobs: byText('platform-jobs'),
  repoGitlabIcon: byRole('img', { name: 'alm.gitlab' }),

  // Stale projects table ("Commits not being scanned")
  staleTitle: byText('onboarding_dashboard.stale.title'),
  staleTable: byRole('table', { name: 'onboarding_dashboard.stale.title' }),
  staleTableColumnHeaders: byRole('table', {
    name: 'onboarding_dashboard.stale.title',
  }).byRole('columnheader'),
  staleSearchInput: byRole('searchbox', { name: 'onboarding_dashboard.stale.search' }),
  staleColProject: byText('onboarding_dashboard.stale.col.project'),
  staleColGateStatus: byText('onboarding_dashboard.stale.col.gate_status'),
  staleColLastScan: byText('onboarding_dashboard.stale.col.last_scan'),
};

function renderOnboardingDashboard() {
  return renderWithRoutes(routes(), { initialEntries: ['/onboarding-dashboard'] });
}

it('shows an error message when the overview request fails', async () => {
  onboardingMock.setFailOverview(true);
  renderOnboardingDashboard();

  expect(await ui.error.find()).toBeInTheDocument();
  expect(ui.headerSubtitle.query()).not.toBeInTheDocument();
});

it('shows loading skeletons before the dashboard data resolves', async () => {
  renderOnboardingDashboard();

  // The overview renders skeletons wrapped in a LoadingContainer, which announces the loading
  // state to screen readers before any query resolves.
  expect(ui.loading.getAll().length).toBeGreaterThan(0);

  // Once the overview and project queries resolve, real content replaces the skeletons and the
  // loading announcement clears.
  expect(await ui.headerSubtitle.find()).toBeInTheDocument();
  expect(await ui.repoWebCore.find()).toBeInTheDocument();
  await waitFor(() => {
    expect(ui.loading.query()).not.toBeInTheDocument();
  });
});

it('renders the page header with the progress tagline next to the heading', async () => {
  renderOnboardingDashboard();

  expect(await ui.headerSubtitle.find()).toBeInTheDocument();

  // The header shows the backend overallMaturityPct ring (not a client-side computed value). The
  // 75% label is unique to the header ring — the stepper donuts use importedPct/analyzedPct — so it
  // appears exactly once. The ring only mounts once the overview query resolves.
  expect(await ui.headerProgress.find()).toBeInTheDocument();
});

it('renders the journey stepper with the three step cards, defaulting the active step', async () => {
  renderOnboardingDashboard();

  // All three step cards render as selectable buttons.
  expect(await ui.stepperBinding.find()).toBeInTheDocument();
  expect(ui.stepperRepositories.get()).toBeInTheDocument();
  expect(ui.stepperProjects.get()).toBeInTheDocument();

  // The default mock is bound with analysed projects, so deriveJourneyState selects the "projects"
  // step; only its card is pressed.
  expect(ui.stepperProjects.get()).toHaveAttribute('aria-pressed', 'true');
  expect(ui.stepperBinding.get()).toHaveAttribute('aria-pressed', 'false');
});

it('moves the stepper selection to the card the user clicks', async () => {
  const user = userEvent.setup({ delay: null });
  renderOnboardingDashboard();

  // "projects" is selected by default; clicking the binding card moves the pressed state to it.
  expect(await ui.stepperProjects.find()).toHaveAttribute('aria-pressed', 'true');

  await user.click(ui.stepperBinding.get());

  expect(ui.stepperBinding.get()).toHaveAttribute('aria-pressed', 'true');
  expect(ui.stepperProjects.get()).toHaveAttribute('aria-pressed', 'false');
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

it('renders the all-projects table with only the four redesigned columns', async () => {
  renderOnboardingDashboard();

  expect(await ui.projectsTable.find()).toBeInTheDocument();
  expect(ui.colRepository.get()).toBeInTheDocument();
  expect(ui.colScanStatus.get()).toBeInTheDocument();
  expect(ui.colAnalysisMode.get()).toBeInTheDocument();
  expect(ui.colGateStatus.get()).toBeInTheDocument();

  // Exactly four — the legacy "last scan" and "test coverage" columns went away with the old
  // table and must not creep back in.
  expect(ui.projectsTableColumnHeaders.getAll()).toHaveLength(4);
});

it('renders a no-data row in the all-projects table when the organization has no projects', async () => {
  onboardingMock.setProjects([]);
  renderOnboardingDashboard();

  // One em-dash placeholder per column. The table shows row skeletons while its own query
  // loads, so wait for the no-data row to replace them.
  expect(await ui.projectsTable.byText(NO_DATA).findAll()).toHaveLength(4);
});

it('filters the all-projects table by search and by filter chip', async () => {
  const user = userEvent.setup({ delay: null });
  renderOnboardingDashboard();

  expect(await ui.projectsTitle.find()).toBeInTheDocument();
  // web-core is one of the seeded projects and is listed by default.
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

it('shows pagination in the all-projects table when the total exceeds the page size', async () => {
  // Seed 51 projects to trigger pagination (PAGE_SIZE = 50).
  // Pagination only appears when data.page.total > PAGE_SIZE, confirming the header
  // count uses the server total rather than the local page slice.
  const baseProject = mockOnboardingProjects()[2]; // web-core — analysed
  onboardingMock.setProjects(
    Array.from({ length: 51 }, (_, i) => ({ ...baseProject, key: `repo-${i}`, name: `repo-${i}` })),
  );
  renderOnboardingDashboard();

  expect(await ui.projectsTitle.find()).toBeInTheDocument();
  // Pagination is only rendered when totalPages > 1, which requires data.page.total > 50.
  // Echoes' Pagination component renders a <div> wrapper, not a <nav>, so we probe for the
  // page-2 button whose aria-label is produced by the react-intl mock as 'pagination.page_x.2'
  // (formatMessage({id:'pagination.page_x'}, {page:'2'}) → [id, '2'].join('.')).
  expect(await byRole('button', { name: 'pagination.page_x.2' }).find()).toBeInTheDocument();
});

it('renders the stale-projects table above the all-projects table', async () => {
  renderOnboardingDashboard();

  const staleTable = await ui.staleTable.find();
  const projectsTable = ui.projectsTable.get();

  // The "Commits not being scanned" card sits above "All projects" in the journey column.
  // getAll() returns matches in document order, so comparing indices asserts the ordering.
  const tablesInDocumentOrder = byRole('table').getAll();
  expect(tablesInDocumentOrder.indexOf(staleTable)).toBeLessThan(
    tablesInDocumentOrder.indexOf(projectsTable),
  );

  expect(ui.staleColProject.get()).toBeInTheDocument();
  expect(ui.staleColGateStatus.get()).toBeInTheDocument();
  expect(ui.staleColLastScan.get()).toBeInTheDocument();

  // Project / Gate status / Last scan only — the design's "Commits" column has no backing data yet.
  expect(ui.staleTableColumnHeaders.getAll()).toHaveLength(3);
});

it('lists only stale projects in the stale-projects table, with their last scan date', async () => {
  renderOnboardingDashboard();

  // payments-gateway is flagged stale in the fixture; web-core is not.
  expect(await ui.staleTable.byText('payments-gateway').find()).toBeInTheDocument();
  expect(ui.staleTable.byText('web-core').query()).not.toBeInTheDocument();

  // web-core is still listed by the all-projects table, which has no stale filter.
  expect(ui.projectsTable.byText('web-core').get()).toBeInTheDocument();

  // The last scan is rendered as an absolute date badge (lastScan 1740528000000 → 26 Feb 2025).
  expect(ui.staleTable.byText('Feb 26, 2025').get()).toBeInTheDocument();
});

it('filters the stale-projects table by search', async () => {
  const user = userEvent.setup({ delay: null });
  renderOnboardingDashboard();

  expect(await ui.staleTable.byText('payments-gateway').find()).toBeInTheDocument();
  expect(ui.staleTable.byText('identity-lib').get()).toBeInTheDocument();

  // Search is debounced and applied server-side, on top of the stale filter.
  await user.type(ui.staleSearchInput.get(), 'identity-lib');
  await waitFor(() => {
    expect(ui.staleTable.byText('payments-gateway').query()).not.toBeInTheDocument();
  });
  expect(ui.staleTable.byText('identity-lib').get()).toBeInTheDocument();
});

it('renders a no-data row in the stale-projects table when nothing is stale', async () => {
  onboardingMock.setProjects(
    mockOnboardingProjects().map((project) => ({ ...project, stale: false })),
  );
  renderOnboardingDashboard();

  // One em-dash placeholder per column, scoped to the stale table so the all-projects
  // table (which still lists every project) can't satisfy the assertion.
  expect(await ui.staleTable.byText(NO_DATA).findAll()).toHaveLength(3);
});

it('renders the detail panel for the active step and swaps it when another step is selected', async () => {
  const user = userEvent.setup({ delay: null });
  renderOnboardingDashboard();

  // The default mock is bound with analysed projects, so the derived active step is "projects" and
  // the analyze detail panel renders (its title is unique to the panel, not the stepper card).
  expect(await byText('onboarding_dashboard.journey.analyze.title').find()).toBeInTheDocument();

  // Selecting the binding step swaps the detail panel to the organization-binding panel.
  await user.click(ui.stepperBinding.get());
  expect(await byText('onboarding_dashboard.journey.binding.title').find()).toBeInTheDocument();
  expect(byText('onboarding_dashboard.journey.analyze.title').query()).not.toBeInTheDocument();
});

it('unlocks both over-time series and no placeholder once repositories are imported', async () => {
  // The default mock is bound with imported repositories — the "Imported" journey level.
  renderOnboardingDashboard();

  expect(await ui.overTimeChart.find()).toBeInTheDocument();
  expect(ui.overTimePlatformsLegend.get()).toBeInTheDocument();
  expect(ui.overTimeImportedLegend.get()).toBeInTheDocument();

  // Nothing is left to unlock at this level.
  expect(ui.lockedStatsTitle.query()).not.toBeInTheDocument();
  expect(ui.lockedMoreTitle.query()).not.toBeInTheDocument();
});

it('shows the single-series chart and the "unlock more" placeholder before any import', async () => {
  onboardingMock.setOverview(
    mockOnboardingOverview({
      repositoriesDiscovered: { discovered: 301, imported: 0, notYetImported: 301, byAlm: [] },
    }),
  );
  renderOnboardingDashboard();

  expect(await ui.overTimeChart.find()).toBeInTheDocument();
  expect(ui.overTimePlatformsLegend.get()).toBeInTheDocument();

  // The imported series stays locked until the first repository is imported.
  expect(ui.overTimeImportedLegend.query()).not.toBeInTheDocument();

  expect(ui.lockedMoreTitle.get()).toBeInTheDocument();
  expect(ui.lockedMoreCta.get()).toBeInTheDocument();
  expect(ui.lockedStatsTitle.query()).not.toBeInTheDocument();
});

it('replaces the chart with the "unlock statistics" placeholder while the org is unbound', async () => {
  // No bound DevOps platform: deriveJourneyState reports the Unbound level.
  onboardingMock.setOverview({
    ...mockOnboardingOverview(),
    devopsPlatforms: { total: 0, shares: [] },
  });
  renderOnboardingDashboard();

  expect(await ui.lockedStatsTitle.find()).toBeInTheDocument();
  expect(ui.lockedStatsCta.get()).toBeInTheDocument();

  // The over-time chart is fully locked at this level, and the "unlock more" variant belongs to
  // the next one.
  expect(ui.overTimeChart.query()).not.toBeInTheDocument();
  expect(ui.overTimePlatformsLegend.query()).not.toBeInTheDocument();
  expect(ui.lockedMoreTitle.query()).not.toBeInTheDocument();
});
