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

import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { API_V2_MOCKS_PREFIX } from '~adapters/helpers/urls';
import {
  mockOnboardingEnterpriseOverview,
  mockOnboardingOrganizations,
  OnboardingServiceMock,
} from '~shared/api/mocks/OnboardingServiceMock';
import {
  registerServiceMocks,
  resetServiceMocks,
  server,
  trackRequestedUrls,
} from '~shared/api/mocks/server';
import { renderWithRoutes } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { OnboardingOrganizationRow } from '~shared/types/onboarding';
import { LazyEnterpriseOnboardingDashboardApp } from '../LazyEnterpriseOnboardingDashboardApp';
import { OrganizationAccess } from '../OrganizationAccessContext';

const ENTERPRISE_ID = 'enterprise-uuid';
const PREFIX = 'onboarding_dashboard.enterprise';

/**
 * The enterprise dashboard body, as the enterprise page mounts it. The page chrome around it —
 * header, ring, the admin check — is covered by the page's own suite.
 */
const onboardingMock = new OnboardingServiceMock();

beforeAll(async () => {
  // The dashboard is lazy-loaded: preloading it keeps the first test from timing out on the cold
  // import before any UI is mounted.
  await import('../EnterpriseOnboardingDashboardApp');
});

beforeEach(() => {
  registerServiceMocks(onboardingMock);
});

const ORGANIZATION_NAMES = ['Web core', 'Data platform', 'Legacy tools', 'Payments'];

const ui = {
  error: byText('default_error_message'),
  loading: byText('onboarding_dashboard.loading'),

  // Journey stepper: the first step is an enterprise one, the other two read like an organization's.
  stepperBinding: (count: number) =>
    byRole('button', {
      name: `onboarding_dashboard.journey.step.ring_count_aria_label.${count}.${PREFIX}.step.binding.title`,
    }),
  stepperBindingUnbound: byRole('button', { name: `${PREFIX}.step.binding.title` }),
  stepperRepositories: (percent: number) =>
    byRole('button', {
      name: `onboarding_dashboard.journey.step.ring_count_aria_label.onboarding_dashboard.percent.${percent}.onboarding_dashboard.journey.step.repositories.title`,
    }),
  stepperProjects: (percent: number) =>
    byRole('button', {
      name: `onboarding_dashboard.journey.step.ring_count_aria_label.onboarding_dashboard.percent.${percent}.onboarding_dashboard.journey.step.projects.title`,
    }),
  lockedStep: (titleId: string) =>
    byRole('button', { name: `onboarding_dashboard.journey.step.locked_aria_label.${titleId}` }),
  bindingCaption: (bound: number) => byText(`${PREFIX}.step.binding.count.${bound}`),

  // Detail panels
  bindingPanelTitle: byText(`${PREFIX}.binding.title`),
  importPanelTitle: byText(`${PREFIX}.import.title`),
  analyzePanelTitle: byText(`${PREFIX}.analyze.title`),
  notBoundLegend: byText(`${PREFIX}.binding.legend.not_bound`),

  // Statistics
  overTimeChart: byRole('img', { name: 'onboarding_dashboard.journey.overtime.title' }),
  lockedStatsTitle: byText(`${PREFIX}.locked.stats.title`),
  lockedMoreTitle: byText(`${PREFIX}.locked.more.title`),
  // The organization's placeholders say "Bind organization" / "Import repositories": none of them.
  anyLockedCta: byRole('button', { name: /onboarding_dashboard\.journey\.locked\./ }),

  viewAll: byRole('button', { name: `${PREFIX}.organizations.view_all` }),
  createOrganization: byRole('link', { name: `${PREFIX}.binding.create_organization` }),

  // Coverage and organizations
  banner: (unavailable: number, total: number) =>
    byText(`${PREFIX}.coverage.banner.${unavailable}.${total}`),
  table: byRole('table', { name: `${PREFIX}.organizations.title` }),
  search: byRole('searchbox'),
  sortBy: byRole('combobox', { name: `${PREFIX}.organizations.sort.label` }),
  sortOption: (name: string) => byRole('option', { name: `${PREFIX}.organizations.sort.${name}` }),
  sortAscending: byRole('button', { name: `${PREFIX}.organizations.sort.ascending` }),
  sortDescending: byRole('button', { name: `${PREFIX}.organizations.sort.descending` }),
  unavailable: byText(`${PREFIX}.organizations.unavailable`),
  pageTwo: byRole('button', { name: 'pagination.page_x.2' }),
  viewDashboard: (name: string) =>
    byRole('link', { name: `${PREFIX}.organizations.action.view.label.${name}` }),
  bind: (name: string) =>
    byRole('link', { name: `${PREFIX}.organizations.action.bind.label.${name}` }),

  // Empty enterprise
  emptyTitle: byText(`${PREFIX}.empty.title`),
  addOrganization: byRole('link', { name: `${PREFIX}.empty.cta` }),
  // The organization's own tables must never leak into the enterprise's
  projectsTable: byRole('table', { name: 'onboarding_dashboard.projects.title' }),
};

function renderEnterpriseDashboard(
  props: Partial<React.ComponentProps<typeof LazyEnterpriseOnboardingDashboardApp>> = {},
) {
  return renderWithRoutes(
    <Route
      element={
        <LazyEnterpriseOnboardingDashboardApp
          addOrganizationUrl={{ pathname: '/enterprise/acme' }}
          createOrganizationUrl={{ pathname: '/create-organization', search: '?enterpriseId=x' }}
          enterpriseId={ENTERPRISE_ID}
          getBindingUrl={(key) => ({ pathname: `/organizations/${key}/edit` })}
          getDashboardUrl={(key) => ({ pathname: `/organizations/${key}/project-coverage` })}
          {...props}
        />
      }
      path="project-coverage"
    />,
    {
      initialEntries: ['/project-coverage'],
      userEventOptions: { delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never },
    },
  );
}

/** The first cell of each organization row: its name and its key. */
function rowNames() {
  return byRole('row')
    .getAll(ui.table.get())
    .slice(1) // The header row
    .map((row) => ORGANIZATION_NAMES.find((name) => row.textContent?.includes(name)));
}

describe('scope', () => {
  it('reads the figures of the enterprise, not those of an organization', async () => {
    renderEnterpriseDashboard();

    // Enterprise dataset, where the default one is a single organization of 301 repositories.
    expect(await ui.stepperBinding(8).find()).toBeInTheDocument();
    expect(ui.bindingCaption(8).get()).toBeInTheDocument();
    expect(ui.stepperRepositories(88).get()).toBeInTheDocument();
    expect(ui.stepperProjects(10).get()).toBeInTheDocument();
  });

  it('shows no table of the projects of a single organization', async () => {
    renderEnterpriseDashboard();

    expect(await ui.table.byText('Web core').find()).toBeInTheDocument();
    expect(ui.projectsTable.query()).not.toBeInTheDocument();
  });
});

describe('journey', () => {
  it('pictures the bound organizations by platform, with those that are not bound', async () => {
    const { user } = renderEnterpriseDashboard();

    await user.click(await ui.stepperBinding(8).find());

    expect(await ui.bindingPanelTitle.find()).toBeInTheDocument();
    expect(byText('alm.github').get()).toBeInTheDocument();
    expect(byText('alm.gitlab').get()).toBeInTheDocument();
    expect(byText('alm.azure').get()).toBeInTheDocument();
    expect(ui.notBoundLegend.get()).toBeInTheDocument();
    expect(ui.bindingCaption(8).getAll()).toHaveLength(2);
  });

  it('moves between the steps, each with its own panel', async () => {
    const { user } = renderEnterpriseDashboard();

    await user.click(await ui.stepperRepositories(88).find());
    expect(await ui.importPanelTitle.find()).toBeInTheDocument();
    expect(byText(`${PREFIX}.import.summary.800.700`).get()).toBeInTheDocument();

    await user.click(ui.stepperProjects(10).get());
    expect(await ui.analyzePanelTitle.find()).toBeInTheDocument();
    expect(byText(`${PREFIX}.analyze.summary.80.800`).get()).toBeInTheDocument();
  });

  describe('create organization', () => {
    it('is offered on the binding panel, to the flow that creates it in the enterprise', async () => {
      const { user } = renderEnterpriseDashboard();

      await user.click(await ui.stepperBinding(8).find());

      expect(await ui.createOrganization.find()).toHaveAttribute(
        'href',
        '/create-organization?enterpriseId=x',
      );
    });

    it('is not on the other panels', async () => {
      const { user } = renderEnterpriseDashboard();

      await user.click(await ui.stepperRepositories(88).find());
      expect(await ui.importPanelTitle.find()).toBeInTheDocument();
      expect(ui.createOrganization.query()).not.toBeInTheDocument();

      await user.click(ui.stepperProjects(10).get());
      expect(await ui.analyzePanelTitle.find()).toBeInTheDocument();
      expect(ui.createOrganization.query()).not.toBeInTheDocument();
    });

    it('is not offered to a user who may not create an organization', async () => {
      const { user } = renderEnterpriseDashboard({ createOrganizationUrl: undefined });

      await user.click(await ui.stepperBinding(8).find());

      expect(await ui.bindingPanelTitle.find()).toBeInTheDocument();
      expect(ui.createOrganization.query()).not.toBeInTheDocument();
    });
  });

  describe('view all', () => {
    const scrollIntoView = jest.fn();

    // Replaces the global stub so the call can be asserted.
    beforeEach(() => {
      scrollIntoView.mockClear();
      HTMLElement.prototype.scrollIntoView = scrollIntoView;
    });

    it.each([
      ['binding step', () => ui.stepperBinding(8)],
      ['repositories step', () => ui.stepperRepositories(88)],
      ['projects step', () => ui.stepperProjects(10)],
    ])(
      'scrolls smoothly from the panel of the %s to the organizations table',
      async (_step, getStepper) => {
        const { user } = renderEnterpriseDashboard();

        await user.click(await getStepper().find());
        await user.click(await ui.viewAll.find());

        expect(scrollIntoView).toHaveBeenCalledTimes(1);
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
        expect(scrollIntoView.mock.contexts[0] as HTMLElement).toContainElement(ui.table.get());
      },
    );
  });

  describe('when the repositories on the platforms could not be counted', () => {
    // The backend sends null totals when no organization could report a discovery count.
    beforeEach(() => {
      onboardingMock.setEnterpriseOverview(mockOnboardingUncountedEnterpriseOverview());
    });

    it('says how many repositories are imported, without inventing a total', async () => {
      const { user } = renderEnterpriseDashboard();

      await user.click(
        await byRole('button', {
          name: 'onboarding_dashboard.journey.step.ring_count_aria_label.9.7K.onboarding_dashboard.journey.step.repositories.title',
        }).find(),
      );

      expect(await byText(`${PREFIX}.import.summary_unknown.9710`).find()).toBeInTheDocument();
      expect(byText(`${PREFIX}.import.total_unknown`).get()).toBeInTheDocument();
    });

    it('counts the analyzed projects against the projects that exist', async () => {
      const { user } = renderEnterpriseDashboard();

      await user.click(await ui.stepperProjects(6).find());

      expect(await byText(`${PREFIX}.analyze.summary.555.9710`).find()).toBeInTheDocument();
    });
  });

  it('shows the timeline of the enterprise', async () => {
    renderEnterpriseDashboard();

    expect(await ui.overTimeChart.find()).toBeInTheDocument();
    expect(ui.lockedStatsTitle.query()).not.toBeInTheDocument();
  });

  it('locks the last two steps and the statistics while no organization is bound', async () => {
    const overview = mockOnboardingEnterpriseOverview();
    onboardingMock.setEnterpriseOverview({
      ...overview,
      progressPct: 0,
      steps: {
        ...overview.steps,
        devopsPlatforms: { byPlatform: [], configured: 0, total: 12 },
      },
    });
    renderEnterpriseDashboard();

    expect(await ui.stepperBindingUnbound.find()).toBeInTheDocument();
    // On the card, and in the panel of the step it opens on.
    expect(ui.bindingCaption(0).getAll()).toHaveLength(2);

    expect(await ui.lockedStatsTitle.find()).toBeInTheDocument();
    expect(ui.overTimeChart.query()).not.toBeInTheDocument();
    // Binding and importing happen in the organizations table.
    expect(ui.organizationLockedStatsCta.query()).not.toBeInTheDocument();
    expect(ui.organizationLockedMoreCta.query()).not.toBeInTheDocument();
  });

  it('keeps the organizations reachable while nothing is bound, to bind them', async () => {
    onboardingMock.setEnterpriseOverview(mockOnboardingUnboundEnterpriseOverview());
    renderEnterpriseDashboard();

    expect(await ui.table.byText('Legacy tools').find()).toBeInTheDocument();
    expect(ui.bind('Legacy tools').get()).toHaveAttribute(
      'href',
      '/organizations/legacy-tools/edit',
    );
  });
});

describe('organizations coverage', () => {
  it('warns that the totals leave out the organizations that could not be loaded', async () => {
    renderEnterpriseDashboard();

    expect(await ui.banner(1, 12).find()).toBeInTheDocument();
  });

  it('does not warn when every organization could be read', async () => {
    onboardingMock.setEnterpriseOverview(
      mockOnboardingEnterpriseOverview({
        coverage: { organizationsTotal: 12, organizationsUnavailable: 0 },
      }),
    );
    renderEnterpriseDashboard();

    expect(await ui.stepperBinding(8).find()).toBeInTheDocument();
    expect(ui.banner(0, 12).query()).not.toBeInTheDocument();
  });

  it('shows an organization that could not be loaded without any figure', async () => {
    renderEnterpriseDashboard();

    expect(await ui.unavailable.find()).toBeInTheDocument();
    expect(ui.table.byText('Payments').get()).toBeInTheDocument();
  });
});

describe('what the viewer is to each organization', () => {
  const getOrganizationAccess = (key: string) =>
    key === 'web-core' ? OrganizationAccess.Admin : OrganizationAccess.None;

  it('says it on the table and holds back what takes administration rights', async () => {
    renderEnterpriseDashboard({ getOrganizationAccess });

    expect(await ui.table.byText('Web core').find()).toBeInTheDocument();
    expect(ui.table.byText(`${PREFIX}.organizations.access.admin`).get()).toBeInTheDocument();
    expect(ui.table.byText(`${PREFIX}.organizations.access.none`).getAll()).toHaveLength(3);
    // The administered one opens as before; the others do not lead to a page that does not exist for the viewer.
    expect(ui.viewDashboard('Web core').get()).toBeInTheDocument();
    expect(ui.viewDashboard('Data platform').query()).not.toBeInTheDocument();
    expect(
      byRole('button', {
        name: `${PREFIX}.organizations.action.view.blocked.none.Data platform`,
      }).get(),
    ).toBeDisabled();
  });

  it('holds nothing back when it is not provided', async () => {
    renderEnterpriseDashboard();

    expect(await ui.table.byText('Web core').find()).toBeInTheDocument();
    expect(ui.table.byText(/organizations\.access\./).query()).not.toBeInTheDocument();
    expect(ui.viewDashboard('Data platform').get()).toBeInTheDocument();
  });
});

describe('organizations table', () => {
  it('lists the least progressed organization first, with the way to open each', async () => {
    renderEnterpriseDashboard();

    expect(await ui.table.byText('Web core').find()).toBeInTheDocument();
    expect(rowNames()).toEqual(['Legacy tools', 'Data platform', 'Web core', 'Payments']);
    expect(ui.viewDashboard('Web core').get()).toHaveAttribute(
      'href',
      '/organizations/web-core/project-coverage',
    );
  });

  it('reverses the order when asked to, whichever sort it is', async () => {
    const { user } = renderEnterpriseDashboard();
    expect(await ui.table.byText('Web core').find()).toBeInTheDocument();

    // Most progressed first; the organization that could not be read stays last.
    await user.click(ui.sortAscending.get());
    await ui.sortDescending.find();
    await waitFor(() => {
      expect(rowNames()).toEqual(['Web core', 'Data platform', 'Legacy tools', 'Payments']);
    });

    await user.click(ui.sortBy.get());
    await user.click(await ui.sortOption('name').find());

    await waitFor(() => {
      expect(rowNames()).toEqual(['Web core', 'Payments', 'Legacy tools', 'Data platform']);
    });
  });

  it('sorts by name when asked to', async () => {
    const { user } = renderEnterpriseDashboard();
    expect(await ui.table.byText('Web core').find()).toBeInTheDocument();

    await user.click(ui.sortBy.get());
    await user.click(await ui.sortOption('name').find());

    await waitFor(() => {
      expect(rowNames()).toEqual(['Data platform', 'Legacy tools', 'Payments', 'Web core']);
    });
  });

  it('searches the organizations', async () => {
    const { user } = renderEnterpriseDashboard();
    expect(await ui.table.byText('Web core').find()).toBeInTheDocument();

    await user.type(ui.search.get(), 'data');

    // The search is debounced, then fetched: the other organizations leave once it has landed.
    await waitForElementToBeRemoved(() => ui.table.byText('Web core').query());
    expect(ui.table.byText('Data platform').get()).toBeInTheDocument();
  });

  it('pages through the organizations', async () => {
    const many: OnboardingOrganizationRow[] = Array.from({ length: 30 }, (_, index) => ({
      availability: 'AVAILABLE',
      bound: true,
      devopsPlatform: 'github',
      key: `org-${String(index).padStart(2, '0')}`,
      name: `Org ${String(index).padStart(2, '0')}`,
      progressPct: index,
      projects: { analyzed: index, notImported: 0, notScanned: 0, percent: null, total: 30 },
      repositories: { discovered: 30, imported: index, percent: null },
    }));
    onboardingMock.setOrganizations(many);
    const { user } = renderEnterpriseDashboard();

    expect(await ui.table.byText('Org 00').find()).toBeInTheDocument();
    expect(ui.table.byText('Org 29').query()).not.toBeInTheDocument();

    await user.click(ui.pageTwo.get());

    expect(await ui.table.byText('Org 29').find()).toBeInTheDocument();
    expect(ui.table.byText('Org 00').query()).not.toBeInTheDocument();
  });

  it('shows an error in place of the table when the organizations cannot be fetched', async () => {
    server.use(
      http.get(`${API_V2_MOCKS_PREFIX}/onboarding/organizations`, () =>
        HttpResponse.json({ errors: [{ msg: 'boom' }] }, { status: 500 }),
      ),
    );
    renderEnterpriseDashboard();

    // Retried with a backoff before it surfaces, while the rest of the page is already up.
    expect(await ui.stepperBinding(8).find()).toBeInTheDocument();
    expect(await ui.error.find()).toBeInTheDocument();
    expect(ui.table.query()).not.toBeInTheDocument();
  });
});

describe('states', () => {
  it('shows loading skeletons before the overview resolves', async () => {
    const releaseOverview = onboardingMock.holdResponse('overview');
    renderEnterpriseDashboard();

    expect((await ui.loading.findAll()).length).toBeGreaterThan(0);
    expect(ui.stepperBinding(8).query()).not.toBeInTheDocument();

    releaseOverview();

    expect(await ui.stepperBinding(8).find()).toBeInTheDocument();
  });

  it('shows the organizations without waiting for the overview', async () => {
    const releaseOverview = onboardingMock.holdResponse('overview');
    renderEnterpriseDashboard();

    expect(await ui.table.byText('Web core').find()).toBeInTheDocument();
    expect(ui.stepperBinding(8).query()).not.toBeInTheDocument();

    releaseOverview();

    expect(await ui.stepperBinding(8).find()).toBeInTheDocument();
  });

  it('shows an error in place of the journey when the overview fails', async () => {
    onboardingMock.setFailOverview(true);
    renderEnterpriseDashboard();

    expect(await ui.table.byText('Web core').find()).toBeInTheDocument();
    expect(await ui.error.find()).toBeInTheDocument();
    expect(ui.stepperBinding(8).query()).not.toBeInTheDocument();
  });

  it('renders the enterprise view, with a one-row table, for an enterprise of a single organization', async () => {
    const [onlyOrganization] = mockOnboardingOrganizations();
    onboardingMock.setOrganizations([onlyOrganization]);
    onboardingMock.setEnterpriseOverview(
      mockOnboardingEnterpriseOverview({
        coverage: { organizationsTotal: 1, organizationsUnavailable: 0 },
      }),
    );
    renderEnterpriseDashboard();

    expect(await ui.table.byText('Legacy tools').find()).toBeInTheDocument();
    expect(ui.stepperRepositories(88).get()).toBeInTheDocument();
    expect(rowNames()).toHaveLength(1);
  });

  it('shows an empty state with the way to add an organization for an enterprise with none', async () => {
    onboardingMock.setOrganizations([]);
    onboardingMock.setEnterpriseOverview(
      mockOnboardingEnterpriseOverview({
        coverage: { organizationsTotal: 0, organizationsUnavailable: 0 },
      }),
    );
    renderEnterpriseDashboard();

    expect(await ui.emptyTitle.find()).toBeInTheDocument();
    expect(ui.addOrganization.get()).toHaveAttribute('href', '/enterprise/acme');
    expect(ui.table.query()).not.toBeInTheDocument();
    expect(ui.lockedStatsTitle.query()).not.toBeInTheDocument();
  });
});
