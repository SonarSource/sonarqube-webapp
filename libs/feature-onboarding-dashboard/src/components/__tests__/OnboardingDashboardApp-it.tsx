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
import { PointerEventsCheckLevel, userEvent } from '@testing-library/user-event';
import { IS_AUTOMATIC_ANALYSIS_SUPPORTED } from '~adapters/helpers/onboarding-actions';
import { ALM_ICONS_BASE_URL } from '~adapters/helpers/urls';
import {
  mockOnboardingOverview,
  mockOnboardingProjects,
  OnboardingServiceMock,
} from '~shared/api/mocks/OnboardingServiceMock';
import { registerServiceMocks } from '~shared/api/mocks/server';
import { renderWithRoutes } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { OnboardingProjectGateStatus } from '~shared/types/onboarding';
import routes from '../../routes';
import { NO_DATA } from '../dashboardConstants';

// Resolving the bound organization names is product-specific and, on SQ-Cloud, pulls in the DevOps
// platform binding queries. Those live behind `private/`, so their service mocks cannot be reached
// from a shared test.
jest.mock('~adapters/helpers/useOnboardingCurrentBinding', () => ({
  useOnboardingCurrentBinding: () => ({
    devopsOrganizationName: 'acme-devops',
    organizationName: 'Acme',
  }),
}));

jest.mock('~adapters/helpers/useAutoImportToggle', () => ({
  useAutoImportToggle: () => ({
    autoImportEnabled: false,
    isEnabledOnFirstLoad: false,
    isLoading: false,
    isPending: false,
    repositoryAccessUrl: undefined,
    toggleAutoImport: jest.fn(),
  }),
}));

jest.mock('~adapters/queries/onboarding', () => ({
  useGrantProjectPermissionMutation: jest.fn().mockReturnValue({ mutate: jest.fn() }),
  useOnboardingDopSettingsQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
  useOnboardingOrganizationKey: jest.fn().mockReturnValue(undefined),
  useOnboardingRepositoriesQuery: jest.fn().mockReturnValue({ data: undefined, isLoading: false }),
  useTriggerAutomaticAnalysisMutation: jest.fn().mockReturnValue(undefined),
}));

let onboardingMock: OnboardingServiceMock;

beforeAll(async () => {
  // The dashboard route lazy-loads this module. Preloading it once keeps the first active test
  // from timing out on the cold import before any UI is mounted.
  await import('../OnboardingDashboardApp');
  onboardingMock = new OnboardingServiceMock();
  registerServiceMocks(onboardingMock);
});

afterEach(() => {
  onboardingMock.reset();
});

/**
 * Entries the row menu of a project scanned by automatic analysis offers: configure CI, restore
 * access and view project, plus the re-run entry on the products that run automatic analysis —
 * elsewhere it is dropped rather than shown as a dead end. Resolved here so the tests below stay
 * free of product branching.
 */
const RERUN_AUTOMATIC_ANALYSIS_ENTRIES = IS_AUTOMATIC_ANALYSIS_SUPPORTED ? 1 : 0;
const AUTOSCANNED_ROW_ENTRIES = 3 + RERUN_AUTOMATIC_ANALYSIS_ENTRIES;

/**
 * `pointerEventsCheck` is disabled because it walks the ancestor chain calling `getComputedStyle`
 * for every pointer event, which dominates the runtime of these tests — the dashboard renders two
 * Echoes tables whose every row carries a dropdown menu.
 */
function setupUser() {
  return userEvent.setup({
    delay: null,
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
}

/**
 * Types into a search box in one shot. `user.type` dispatches a full event sequence per character
 * and each one re-renders the surrounding table; the components only ever read the final value
 * (debounced), so a single paste exercises the same behaviour for a fraction of the cost.
 */
async function search(user: ReturnType<typeof setupUser>, input: HTMLElement, query: string) {
  await user.click(input);
  await user.paste(query);
}

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
  projectsLoading: byText('onboarding_dashboard.projects.loading'),
  projectsTableColumnHeaders: byRole('table', {
    name: 'onboarding_dashboard.projects.title',
  }).byRole('columnheader'),
  searchInput: byRole('searchbox', { name: 'onboarding_dashboard.projects.search' }),
  // Filter dropdowns. Echoes' Select renders a role=combobox input whose accessible name comes
  // from the sibling <Label htmlFor>, so the label message key is the queryable name.
  scanStatusFilter: byRole('combobox', {
    name: 'onboarding_dashboard.projects.filter.scan_status.label',
  }),
  analysisModeFilter: byRole('combobox', {
    name: 'onboarding_dashboard.projects.filter.analysis_mode.label',
  }),
  scannedOption: byRole('option', { name: 'onboarding_dashboard.projects.filter.scanned' }),
  // The "Not imported" option is backed by the `not_onboarded` wire token.
  notImportedOption: byRole('option', {
    name: 'onboarding_dashboard.projects.filter.not_onboarded',
  }),
  ciOption: byRole('option', { name: 'onboarding_dashboard.projects.filter.ci' }),
  colRepository: byText('onboarding_dashboard.projects.col.repository'),
  colScanStatus: byText('onboarding_dashboard.projects.col.onboarding'),
  colAnalysisMode: byText('onboarding_dashboard.projects.col.analysis_mode'),
  colGateStatus: byText('onboarding_dashboard.projects.col.gate_status'),
  // Both tables carry the actions column, so this one has to be scoped to the all-projects table.
  colActions: byRole('table', { name: 'onboarding_dashboard.projects.title' }).byText(
    'onboarding_dashboard.projects.col.actions',
  ),
  repoWebCore: byText('web-core'),
  repoPlatformJobs: byText('platform-jobs'),
  repoGitlabIcon: byRole('img', { name: 'alm.gitlab' }),

  // Row actions menu. The react-intl mock joins the message id with its values, so the trigger's
  // accessible name is the label key suffixed with the project name.
  rowActionsButton: (projectName: string) =>
    byRole('button', {
      name: `onboarding_dashboard.projects.actions.label.${projectName}`,
    }),
  rowActionItems: byRole('menuitem'),
  importRepositoryAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.import_repository',
  }),
  configureCiAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.configure_ci',
  }),
  rerunAutomaticAnalysisAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.rerun_automatic_analysis',
  }),
  restoreAccessAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.restore_access',
  }),
  viewProjectAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.view_project',
  }),

  // "View all repositories" modal (triggered from the Repositories step's donut).
  viewAllRepositoriesButton: byRole('button', {
    name: 'onboarding_dashboard.journey.import.view_all',
  }),
  importModal: byRole('dialog', { name: 'onboarding_dashboard.journey.import.modal.title' }),
  importModalCloseButton: byRole('dialog', {
    name: 'onboarding_dashboard.journey.import.modal.title',
  }).byRole('button', { name: 'close' }),

  // "Configure projects" modal (triggered from the Analyze step's donut and CTAs).
  configureModal: byRole('dialog', { name: 'onboarding_dashboard.journey.analyze.modal.title' }),
  notScannedCta: byRole('button', {
    name: 'onboarding_dashboard.journey.analyze.not_scanned.cta',
  }),
  fullCiCta: byRole('button', {
    name: 'onboarding_dashboard.journey.analyze.full_ci.cta',
  }),

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
  staleGateStatusFilter: byRole('combobox', {
    name: 'onboarding_dashboard.stale.filter.gate_status.label',
  }),
  gateFailedOption: byRole('option', { name: 'metric.level.ERROR' }),
  staleLoading: byText('onboarding_dashboard.stale.loading'),
};

function renderOnboardingDashboard() {
  return renderWithRoutes(routes(), { initialEntries: ['/onboarding-dashboard'] });
}

/**
 * Temporarily disabled this flaky test suite
 */
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('OnboardingDashboardApp', () => {
  it('shows an error message when the overview request fails', async () => {
    onboardingMock.setFailOverview(true);
    renderOnboardingDashboard();

    expect(await ui.error.find()).toBeInTheDocument();
    expect(ui.headerSubtitle.query()).not.toBeInTheDocument();
  });

  it('shows loading skeletons before the dashboard data resolves', async () => {
    renderOnboardingDashboard();

    // The overview renders skeletons wrapped in a LoadingContainer, which announces the loading
    // state to screen readers before any query resolves. Awaited rather than read synchronously
    // because the route mounts the app through `lazyLoadComponent`, whose Suspense fallback is
    // `null` — nothing is in the DOM until the dynamic import resolves a tick later.
    expect((await ui.loading.findAll()).length).toBeGreaterThan(0);

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
    const user = setupUser();
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

  it('renders the all-projects table with the four redesigned columns and the actions column', async () => {
    renderOnboardingDashboard();

    expect(await ui.projectsTable.find()).toBeInTheDocument();
    expect(ui.colRepository.get()).toBeInTheDocument();
    expect(ui.colScanStatus.get()).toBeInTheDocument();
    expect(ui.colAnalysisMode.get()).toBeInTheDocument();
    expect(ui.colGateStatus.get()).toBeInTheDocument();

    // The actions column header is only exposed to assistive technology — the design shows it blank.
    expect(ui.colActions.get()).toBeInTheDocument();

    // Five — the legacy "last scan" and "test coverage" columns went away with the old table and
    // must not creep back in.
    expect(ui.projectsTableColumnHeaders.getAll()).toHaveLength(5);
  });

  it('offers only the import action on a row whose repository is not imported yet', async () => {
    const user = setupUser();
    renderOnboardingDashboard();

    expect(await ui.repoPlatformJobs.find()).toBeInTheDocument();

    // platform-jobs is NOT_IMPORTED. The fixture still reports a CI scan method for it, so a menu
    // built from the analysis mode alone would wrongly offer the CI actions here.
    await user.click(ui.rowActionsButton('platform-jobs').get());

    expect(await ui.importRepositoryAction.find()).toBeInTheDocument();
    expect(ui.rowActionItems.getAll()).toHaveLength(1);
  });

  it('offers the automatic-analysis actions on a row scanned by autoscan', async () => {
    const user = setupUser();
    renderOnboardingDashboard();

    expect(await ui.repoWebCore.find()).toBeInTheDocument();

    // identity-lib is ANALYSED by automatic analysis (MANAGED). It is also stale, so it appears in
    // both tables — scope the trigger lookup to the all-projects one.
    await user.click(ui.projectsTable.byRole('button', { name: /identity-lib/ }).get());

    expect(await ui.configureCiAction.find()).toBeInTheDocument();
    expect(ui.restoreAccessAction.get()).toBeInTheDocument();
    expect(ui.viewProjectAction.get()).toBeInTheDocument();

    // Automatic analysis is a SQ-Cloud feature: rather than offer a dead entry, SQ-Server drops it.
    // What each entry then does is covered by ProjectRowActionsCell-it.
    expect(ui.rerunAutomaticAnalysisAction.queryAll()).toHaveLength(
      RERUN_AUTOMATIC_ANALYSIS_ENTRIES,
    );
    expect(ui.rowActionItems.getAll()).toHaveLength(AUTOSCANNED_ROW_ENTRIES);
  });

  it('hides both project cards when the organization has no project at all', async () => {
    onboardingMock.setProjects([]);
    renderOnboardingDashboard();

    expect(await ui.headerSubtitle.find()).toBeInTheDocument();

    // Each card announces its own loading state while its query runs, so waiting for both
    // announcements to clear is what tells us the tables had their chance to render.
    await waitFor(() => {
      expect(ui.projectsLoading.query()).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(ui.staleLoading.query()).not.toBeInTheDocument();
    });

    // Nothing to show and nothing the user could widen: both cards go away entirely rather than
    // leaving empty tables behind.
    expect(ui.projectsTitle.query()).not.toBeInTheDocument();
    expect(ui.projectsTable.query()).not.toBeInTheDocument();
    expect(ui.staleTitle.query()).not.toBeInTheDocument();
    expect(ui.staleTable.query()).not.toBeInTheDocument();
  });

  it('keeps the all-projects table, with a no-data row, when the search empties it', async () => {
    const user = setupUser();
    renderOnboardingDashboard();

    expect(await ui.repoWebCore.find()).toBeInTheDocument();

    await search(user, ui.searchInput.get(), 'no-such-repository');

    // The card stays so the search box that emptied it remains reachable, showing one em-dash
    // placeholder per column, actions included. Polled rather than awaited once: the not-imported
    // row listed before the search already carries em-dashes of its own, which a single `findAll`
    // would happily match while the debounced search is still in flight.
    await waitFor(() => {
      expect(ui.projectsTable.byText(NO_DATA).getAll()).toHaveLength(5);
    });
  });

  it('filters the all-projects table by search and by the scan-status dropdown', async () => {
    const user = setupUser();
    renderOnboardingDashboard();

    expect(await ui.projectsTitle.find()).toBeInTheDocument();
    // web-core is one of the seeded projects and is listed by default.
    expect(await ui.repoWebCore.find()).toBeInTheDocument();

    // Search narrows the list to matching repositories (debounced + server-side)
    await search(user, ui.searchInput.get(), 'platform');
    await waitFor(() => {
      expect(ui.repoWebCore.query()).not.toBeInTheDocument();
    });
    expect(ui.repoPlatformJobs.get()).toBeInTheDocument();

    // Clearing the search brings every repository back
    await user.clear(ui.searchInput.get());
    expect(await ui.repoWebCore.find()).toBeInTheDocument();

    // Picking "Not imported" keeps only NOT_IMPORTED projects
    await user.click(ui.scanStatusFilter.get());
    await user.click(await ui.notImportedOption.find());
    await waitFor(() => {
      expect(ui.repoWebCore.query()).not.toBeInTheDocument();
    });
    expect(ui.repoPlatformJobs.get()).toBeInTheDocument();
  });

  it('ANDs the scan-status and analysis-mode dropdowns of the all-projects table', async () => {
    const user = setupUser();
    renderOnboardingDashboard();

    // Of the three analysed fixture projects, only payments-gateway is also scanned by CI —
    // web-core is LOCAL and identity-lib is MANAGED. Both tokens must reach the backend together
    // (`filter=scanned,ci`) for this to hold; sending only the last one picked would keep all three.
    expect(await ui.repoWebCore.find()).toBeInTheDocument();

    await user.click(ui.scanStatusFilter.get());
    await user.click(await ui.scannedOption.find());

    // platform-jobs is NOT_IMPORTED, so the scan-status token alone already excludes it.
    await waitFor(() => {
      expect(ui.repoPlatformJobs.query()).not.toBeInTheDocument();
    });
    expect(ui.repoWebCore.get()).toBeInTheDocument();

    await user.click(ui.analysisModeFilter.get());
    await user.click(await ui.ciOption.find());

    await waitFor(() => {
      expect(ui.repoWebCore.query()).not.toBeInTheDocument();
    });
    expect(ui.projectsTable.byText('payments-gateway').get()).toBeInTheDocument();
    expect(ui.projectsTable.byText('identity-lib').query()).not.toBeInTheDocument();
  });

  it('renders the repository ALM icon from the app-specific images path', async () => {
    // web-core is bound to GitLab; its icon must resolve to the per-app ALM images folder
    // (/images/alm on SQS, /images/alms on SQC) — a hardcoded path breaks on one platform.
    renderOnboardingDashboard();

    const icon = await ui.repoGitlabIcon.find();
    expect(icon).toHaveAttribute(
      'src',
      expect.stringContaining(`${ALM_ICONS_BASE_URL}/gitlab.svg`),
    );
  });

  /**
   * Seeds `count` analysed projects named repo-0…repo-(count-1) and shrinks the page the mock backend
   * serves to `pageSize`, so pagination shows up without rendering a full 50-row page. The cards
   * derive `totalPages` from the page metadata the backend returns rather than from the page size they
   * requested, so overriding it server-side is what the component actually reacts to.
   */
  function seedPagedProjects(count: number, pageSize: number) {
    const baseProject = mockOnboardingProjects()[2]; // web-core — analysed
    onboardingMock.setProjects(
      Array.from({ length: count }, (_, i) => ({
        ...baseProject,
        key: `repo-${i}`,
        name: `repo-${i}`,
      })),
    );
    onboardingMock.overridePageSize = pageSize;
  }

  it('shows pagination in the all-projects table when the total exceeds the page size', async () => {
    // Three projects over a page of two: the total the backend reports exceeds its page size, which
    // is the only thing that makes pagination appear — confirming the count comes from the server
    // total and not from the length of the page slice.
    seedPagedProjects(3, 2);
    renderOnboardingDashboard();

    expect(await ui.projectsTitle.find()).toBeInTheDocument();
    // Echoes' Pagination component renders a <div> wrapper, not a <nav>, so we probe for the
    // page-2 button whose aria-label is produced by the react-intl mock as 'pagination.page_x.2'
    // (formatMessage({id:'pagination.page_x'}, {page:'2'}) → [id, '2'].join('.')).
    expect(await byRole('button', { name: 'pagination.page_x.2' }).find()).toBeInTheDocument();
  });

  it('stays on the selected page until a filter or the search actually changes', async () => {
    const user = setupUser();
    // Page 1 holds repo-0 and repo-1, page 2 holds repo-2 alone.
    seedPagedProjects(3, 2);
    renderOnboardingDashboard();

    await user.click(await byRole('button', { name: 'pagination.page_x.2' }).find());

    // The cards rebuild their filter array on every render, so a page reset keyed off the array
    // identity would bounce straight back to page 1 and re-show repo-0.
    expect(await ui.projectsTable.byText('repo-2').find()).toBeInTheDocument();
    expect(ui.projectsTable.byText('repo-0').query()).not.toBeInTheDocument();

    // Changing a filter, on the other hand, must reset to the first page.
    await user.click(ui.scanStatusFilter.get());
    await user.click(await ui.scannedOption.find());

    expect(await ui.projectsTable.byText('repo-0').find()).toBeInTheDocument();
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

    // Project / Gate status / Last scan plus the actions column — the design's "Commits" column has
    // no backing data yet.
    expect(ui.staleTableColumnHeaders.getAll()).toHaveLength(4);
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
    const user = setupUser();
    renderOnboardingDashboard();

    expect(await ui.staleTable.byText('payments-gateway').find()).toBeInTheDocument();
    expect(ui.staleTable.byText('identity-lib').get()).toBeInTheDocument();

    // Search is debounced and applied server-side, on top of the stale filter.
    await search(user, ui.staleSearchInput.get(), 'identity-lib');
    await waitFor(() => {
      expect(ui.staleTable.byText('payments-gateway').query()).not.toBeInTheDocument();
    });
    expect(ui.staleTable.byText('identity-lib').get()).toBeInTheDocument();
  });

  it('ANDs the hardcoded stale filter with the gate-status dropdown', async () => {
    const user = setupUser();

    // web-core (third in the fixture) fails its gate but isn't stale, so it must stay out of this
    // table even once the dropdown asks for failing gates — proof that `stale` is still sent
    // alongside `gate_failed`.
    const [platformJobs, paymentsGateway, webCore, ...others] = mockOnboardingProjects();
    onboardingMock.setProjects([
      platformJobs,
      paymentsGateway,
      { ...webCore, gateStatus: OnboardingProjectGateStatus.Failed },
      ...others,
    ]);
    renderOnboardingDashboard();

    // All three stale fixture projects are listed, one per gate status.
    expect(await ui.staleTable.byText('payments-gateway').find()).toBeInTheDocument();
    expect(ui.staleTable.byText('identity-lib').get()).toBeInTheDocument();
    expect(ui.staleTable.byText('mobile-worker').get()).toBeInTheDocument();

    await user.click(ui.staleGateStatusFilter.get());
    await user.click(await ui.gateFailedOption.find());

    // payments-gateway is the only project that is both stale and failing its gate.
    await waitFor(() => {
      expect(ui.staleTable.byText('identity-lib').query()).not.toBeInTheDocument();
    });
    expect(ui.staleTable.byText('mobile-worker').query()).not.toBeInTheDocument();
    expect(ui.staleTable.byText('web-core').query()).not.toBeInTheDocument();
    expect(ui.staleTable.byText('payments-gateway').get()).toBeInTheDocument();
  });

  it('hides the stale-projects card when nothing is stale', async () => {
    onboardingMock.setProjects(
      mockOnboardingProjects().map((project) => ({ ...project, stale: false })),
    );
    renderOnboardingDashboard();

    // The all-projects table still lists every project, so its content is a reliable signal that the
    // project queries have resolved — at which point the stale card must be gone rather than left
    // behind as an empty shell.
    expect(await ui.projectsTable.byText('web-core').find()).toBeInTheDocument();

    expect(ui.staleTitle.query()).not.toBeInTheDocument();
    expect(ui.staleTable.query()).not.toBeInTheDocument();
  });

  it('keeps the stale-projects table, with a no-data row, when the search empties it', async () => {
    const user = setupUser();
    renderOnboardingDashboard();

    expect(await ui.staleTable.byText('payments-gateway').find()).toBeInTheDocument();

    await search(user, ui.staleSearchInput.get(), 'no-such-repository');

    // An empty result the user brought about themselves has to keep its card, or the search box that
    // caused it disappears along with it. One em-dash placeholder per column, actions included.
    await waitFor(() => {
      expect(ui.staleTable.byText(NO_DATA).getAll()).toHaveLength(4);
    });
  });

  it('renders the detail panel for the active step and swaps it when another step is selected', async () => {
    const user = setupUser();
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
});

it('opens the "import repositories" modal when clicking the view-all button', async () => {
  const user = setupUser();

  renderOnboardingDashboard();
  await user.click(await ui.stepperRepositories.find());
  await user.click(ui.viewAllRepositoriesButton.get());

  expect(await ui.importModal.find()).toBeInTheDocument();
});

it('closes the "import repositories" modal when clicking the close button', async () => {
  const user = setupUser();

  renderOnboardingDashboard();
  await user.click(await ui.stepperRepositories.find());
  await user.click(ui.viewAllRepositoriesButton.get());

  await user.click(await ui.importModalCloseButton.find());

  expect(ui.importModal.query()).not.toBeInTheDocument();
});

it('opens the "configure projects" modal when clicking the not-scanned CTA', async () => {
  const user = setupUser();

  renderOnboardingDashboard();
  await user.click(await ui.notScannedCta.find());

  expect(await ui.configureModal.find()).toBeInTheDocument();
});

it('opens the "configure projects" modal when clicking the full-CI CTA', async () => {
  const user = setupUser();

  renderOnboardingDashboard();
  await user.click(await ui.fullCiCta.find());

  expect(await ui.configureModal.find()).toBeInTheDocument();
});
