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

import { mockOnboardingOrganizations } from '~shared/api/mocks/OnboardingServiceMock';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import {
  OnboardingOrganizationRow,
  OnboardingOrganizationSort,
  OnboardingSortDirection,
} from '~shared/types/onboarding';
import { OnboardingDashboardAction } from '~shared/types/onboarding-dashboard-telemetry';
import { OrganizationAccess, OrganizationAccessContext } from '../OrganizationAccessContext';
import { OrganizationsCoverageTable } from '../OrganizationsCoverageTable';
import {
  AdminsQueryResult,
  adminsQueryResult,
  PREFIX as ENTERPRISE_PREFIX,
} from './enterpriseDashboardTestSetup';

const PREFIX = `${ENTERPRISE_PREFIX}.organizations`;

const mockUseOrganizationAdminsQuery = jest.fn<AdminsQueryResult, [string]>();

// Product-specific; covered by the adapter tests.
jest.mock('~adapters/queries/onboarding', () => ({
  useOrganizationAdminsQuery: (organizationKey: string) =>
    mockUseOrganizationAdminsQuery(organizationKey),
}));

beforeEach(() => {
  mockUseOrganizationAdminsQuery.mockReset();
  mockUseOrganizationAdminsQuery.mockReturnValue(adminsQueryResult({ isPending: true }));
});

const ui = {
  table: byRole('table', { name: `${PREFIX}.title` }),
  rows: byRole('row'),
  search: byRole('searchbox'),
  sortBy: byRole('combobox', { name: 'projects.sort_by' }),
  sortOption: (name: string) => byRole('option', { name: `${PREFIX}.sort.${name}` }),
  sortAscending: byRole('button', { name: `${PREFIX}.sort.ascending` }),
  sortDescending: byRole('button', { name: `${PREFIX}.sort.descending` }),
  pageTwo: byRole('button', { name: 'pagination.page_x.2' }),
  platformIcon: (platform: string) => byRole('img', { name: platform }),
  platformColumn: byRole('columnheader', { name: `${PREFIX}.col.platform` }),
  unavailable: byText(`${PREFIX}.unavailable`),
  access: (access: string) => byText(`${PREFIX}.access.${access}`),
  actions: (name: string) => byRole('button', { name: `${PREFIX}.actions.label.${name}` }),
  requestAccess: byRole('menuitem', { name: new RegExp(`^${PREFIX}\\.action\\.request_access`) }),
  modalTitle: byText(`${ENTERPRISE_PREFIX}.request_access.title`),
  results: (size: number, total: number) =>
    byText(`onboarding_dashboard.table.results_size.${size}.${total}`),
  viewDashboard: byRole('menuitem', { name: `${PREFIX}.action.view` }),
  bind: byRole('menuitem', { name: `${PREFIX}.action.bind` }),
  menuItems: byRole('menuitem'),
  progress: (name: string) => byRole('progressbar', { name: `${PREFIX}.progress.label.${name}` }),
};

const getBindingUrl = (key: string) => ({ pathname: `/organizations/${key}/edit` });
const getDashboardUrl = (key: string) => ({ pathname: `/organizations/${key}/project-coverage` });

// Viewer's access by organization key.
const ACCESS: Record<string, OrganizationAccess> = {
  'data-platform': OrganizationAccess.Member,
  'legacy-tools': OrganizationAccess.None,
  payments: OrganizationAccess.Admin,
  'web-core': OrganizationAccess.Admin,
};

function renderTable(
  props: Partial<React.ComponentProps<typeof OrganizationsCoverageTable>> = {},
  getOrganizationAccess?: (organizationKey: string) => OrganizationAccess,
) {
  const callbacks = {
    onAction: jest.fn(),
    onPageChange: jest.fn(),
    onSearchChange: jest.fn(),
    onDirectionChange: jest.fn(),
    onSortChange: jest.fn(),
  };

  const result = renderWithRouter(
    <OrganizationAccessContext.Provider value={getOrganizationAccess}>
      <OrganizationsCoverageTable
        direction={OnboardingSortDirection.Ascending}
        getBindingUrl={getBindingUrl}
        getDashboardUrl={getDashboardUrl}
        isLoading={false}
        organizations={mockOnboardingOrganizations()}
        pageIndex={1}
        pageSize={25}
        searchValue=""
        sort={OnboardingOrganizationSort.Progress}
        total={4}
        {...callbacks}
        {...props}
      />
    </OrganizationAccessContext.Provider>,
  );

  return { ...result, ...callbacks };
}

it('lists every organization with its name and key', async () => {
  renderTable();

  expect(await ui.table.find()).toBeInTheDocument();
  // Header + 4 organizations.
  expect(ui.rows.getAll()).toHaveLength(5);

  expect(ui.table.byText('Web core').get()).toBeInTheDocument();
  expect(ui.table.byText('web-core').get()).toBeInTheDocument();
  expect(ui.table.byText('Data platform').get()).toBeInTheDocument();
  expect(ui.table.byText('data-platform').get()).toBeInTheDocument();
  expect(ui.results(4, 4).get()).toBeInTheDocument();
});

it('shows the organization, the projects imported and analyzed, the progress and the way to manage', () => {
  renderTable();

  expect(
    ui.table
      .byRole('columnheader')
      .getAll()
      .map((header) => header.textContent),
  ).toEqual([
    `${PREFIX}.col.organization`,
    `${PREFIX}.col.imported`,
    `${PREFIX}.col.analyzed`,
    `${PREFIX}.col.progress`,
    `${PREFIX}.col.actions`,
  ]);
  expect(ui.actions('Web core').get()).toBeInTheDocument();
});

it('shows the repositories and projects as done over total, and the progress as a bar', () => {
  renderTable();

  expect(
    ui.table.byText('onboarding_dashboard.journey.step.count.95.95').get(),
  ).toBeInTheDocument();
  expect(
    ui.table.byText('onboarding_dashboard.journey.step.count.90.95').get(),
  ).toBeInTheDocument();
  expect(ui.progress('Web core').get()).toHaveValue(92);
  expect(ui.table.byText('onboarding_dashboard.percent.92').get()).toBeInTheDocument();

  // Nothing discovered for Legacy tools: the total is a dash, not a made up zero.
  expect(ui.table.byText('onboarding_dashboard.journey.step.count.4.—').get()).toBeInTheDocument();
  expect(ui.progress('Legacy tools').get()).toHaveValue(0);
});

it('leads the name of a bound organization with the icon of its platform, in no column of its own', () => {
  renderTable();

  expect(ui.platformColumn.query()).not.toBeInTheDocument();
  expect(ui.table.byText('alm.github').query()).not.toBeInTheDocument();

  // Web core is bound to GitHub and Data platform to GitLab; the icon is in the row of its name.
  const rowOf = (name: string) =>
    ui.rows.getAll().find((row) => row.textContent?.includes(name)) as HTMLElement;

  expect(rowOf('Web core')).toContainElement(ui.platformIcon('alm.github').get());
  expect(rowOf('Data platform')).toContainElement(ui.platformIcon('alm.gitlab').get());
});

it('shows no icon for an organization that is not bound', () => {
  const legacy = mockOnboardingOrganizations().filter(({ key }) => key === 'legacy-tools');
  renderTable({ organizations: legacy, total: 1 });

  expect(ui.table.byText('Legacy tools').get()).toBeInTheDocument();
  expect(ui.table.byRole('img').query()).not.toBeInTheDocument();
});

it('drills down to the dashboard of an organization from its actions menu', async () => {
  const { user } = renderTable();

  await user.click(ui.actions('Web core').get());

  expect(await ui.viewDashboard.find()).toHaveAttribute(
    'href',
    '/organizations/web-core/project-coverage',
  );
});

it('offers the binding setup after View & manage, for an unbound organization', async () => {
  const { user } = renderTable();

  await user.click(ui.actions('Legacy tools').get());

  expect(await ui.bind.find()).toBeInTheDocument();
  expect(ui.menuItems.getAll().map((item) => item.textContent)).toEqual([
    `${PREFIX}.action.view`,
    `${PREFIX}.action.bind`,
  ]);
  expect(ui.bind.get()).toHaveAttribute('href', '/organizations/legacy-tools/edit');
});

it.each(['Web core', 'Data platform', 'Payments'])(
  'does not offer the binding setup for %s, which is bound or could not be read',
  async (name) => {
    const { user } = renderTable();

    await user.click(ui.actions(name).get());

    expect(await ui.viewDashboard.find()).toBeInTheDocument();
    expect(ui.bind.query()).not.toBeInTheDocument();
  },
);

it('reports the binding of an organization being started', async () => {
  const { onAction, user } = renderTable();

  await user.click(ui.actions('Legacy tools').get());
  await user.click(await ui.bind.find());

  expect(onAction).toHaveBeenCalledWith(OnboardingDashboardAction.BindOrganization);
});

it('reports the dashboard of an organization being opened', async () => {
  const { onAction, user } = renderTable();

  await user.click(ui.actions('Web core').get());
  await user.click(await ui.viewDashboard.find());

  expect(onAction).toHaveBeenCalledWith(OnboardingDashboardAction.ViewOrganizationDashboard);
});

describe('an organization that could not be loaded', () => {
  it('shows a "couldn\'t load" message and not a single figure', () => {
    const payments = mockOnboardingOrganizations().filter(({ key }) => key === 'payments');
    renderTable({ organizations: payments, total: 1 });

    expect(ui.table.byText('Payments').get()).toBeInTheDocument();
    expect(ui.unavailable.get()).toBeInTheDocument();

    // Only the name, the message over the figures, and the actions.
    expect(ui.table.byRole('cell').getAll()).toHaveLength(3);
    expect(ui.progress('Payments').query()).not.toBeInTheDocument();
    expect(ui.table.byRole('img').query()).not.toBeInTheDocument();
  });

  it('can still be opened, to see what is wrong from its own dashboard', async () => {
    const payments = mockOnboardingOrganizations().filter(({ key }) => key === 'payments');
    const { user } = renderTable({ organizations: payments, total: 1 });

    await user.click(ui.actions('Payments').get());

    expect(await ui.viewDashboard.find()).toHaveAttribute(
      'href',
      '/organizations/payments/project-coverage',
    );
  });

  it('does not show zeros even when the backend sent some', () => {
    const withZeros: OnboardingOrganizationRow = {
      availability: 'UNAVAILABLE',
      bound: false,
      key: 'broken',
      name: 'Broken',
      progressPct: 0,
      projects: { analyzed: 0, notImported: 0, notScanned: 0, percent: 0, total: 0 },
      repositories: { discovered: 0, imported: 0, percent: 0 },
    };
    renderTable({ organizations: [withZeros], total: 1 });

    expect(ui.unavailable.get()).toBeInTheDocument();
    expect(ui.table.byRole('cell').getAll()).toHaveLength(3);
    expect(ui.progress('Broken').query()).not.toBeInTheDocument();
  });
});

describe('sorting', () => {
  it('opens on the sort it is given, in a Sort by dropdown', () => {
    renderTable({ sort: OnboardingOrganizationSort.Name });

    expect(ui.sortBy.get()).toHaveValue(`${PREFIX}.sort.name`);
  });

  it('asks for the new sort when another is picked', async () => {
    const { onSortChange, user } = renderTable();

    expect(ui.sortBy.get()).toHaveValue(`${PREFIX}.sort.progress`);

    await user.click(ui.sortBy.get());
    await user.click(await ui.sortOption('name').find());

    expect(onSortChange).toHaveBeenCalledWith(OnboardingOrganizationSort.Name);
  });

  it('offers to reverse an ascending order', async () => {
    const { onDirectionChange, user } = renderTable();

    await user.click(ui.sortAscending.get());
    expect(onDirectionChange).toHaveBeenLastCalledWith(OnboardingSortDirection.Descending);
  });

  it('offers to restore a descending order', async () => {
    const { onDirectionChange, user } = renderTable({
      direction: OnboardingSortDirection.Descending,
    });

    expect(ui.sortAscending.query()).not.toBeInTheDocument();

    await user.click(ui.sortDescending.get());
    expect(onDirectionChange).toHaveBeenLastCalledWith(OnboardingSortDirection.Ascending);
  });
});

describe('searching', () => {
  it('shows the search it is given and reports what is typed', async () => {
    const { onSearchChange, user } = renderTable({ searchValue: 'web' });

    expect(ui.search.get()).toHaveValue('web');

    await user.type(ui.search.get(), 's');

    expect(onSearchChange).toHaveBeenLastCalledWith('webs');
  });
});

describe('paging', () => {
  it('shows no pagination when everything fits on one page', () => {
    renderTable({ pageSize: 25, total: 4 });

    expect(ui.pageTwo.query()).not.toBeInTheDocument();
  });

  it('asks for another page when one is picked', async () => {
    const { onPageChange, user } = renderTable({ pageSize: 2, total: 4 });

    await user.click(ui.pageTwo.get());

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('counts the results over the whole result set, not the page', () => {
    renderTable({
      organizations: mockOnboardingOrganizations().slice(0, 2),
      pageSize: 2,
      total: 40,
    });

    expect(ui.results(2, 40).get()).toBeInTheDocument();
  });
});

describe('while loading', () => {
  it('announces the loading state and shows no organization', () => {
    renderTable({ isLoading: true, organizations: [], total: undefined });

    expect(byText(`${PREFIX}.loading`).get()).toBeInTheDocument();
    expect(ui.table.byText('Web core').query()).not.toBeInTheDocument();
  });
});

describe('without any organization', () => {
  it('shows a dash row rather than an empty table', () => {
    renderTable({ organizations: [], total: 0 });

    expect(ui.table.byText('—').getAll().length).toBeGreaterThan(0);
  });
});

describe('what the viewer is to each organization', () => {
  const getAccess = (key: string) => ACCESS[key];

  it('says so on every row: administrator, member, or not a member', () => {
    renderTable({}, getAccess);

    expect(ui.table.byText(`${PREFIX}.access.admin`).getAll()).toHaveLength(2);
    expect(ui.access('member').get()).toBeInTheDocument();
    expect(ui.access('none').get()).toBeInTheDocument();
  });

  it('opens the organizations the viewer administers, as it always did', async () => {
    const { user } = renderTable({}, getAccess);

    await user.click(ui.actions('Web core').get());

    expect(await ui.viewDashboard.find()).toHaveAttribute(
      'href',
      '/organizations/web-core/project-coverage',
    );
  });

  it('offers a member who is not an administrator to ask for admin access, in place of View & manage', async () => {
    const { user } = renderTable({}, getAccess);

    await user.click(ui.actions('Data platform').get());

    expect(await ui.requestAccess.find()).toBeEnabled();
    expect(ui.requestAccess.get()).toHaveTextContent(`${PREFIX}.action.request_access.hint`);
    // No link to a page the viewer cannot open.
    expect(ui.viewDashboard.query()).not.toBeInTheDocument();
  });

  it('offers someone who is not a member the same, in place of Bind and View & manage', async () => {
    const { user } = renderTable({}, getAccess);

    await user.click(ui.actions('Legacy tools').get());

    // Legacy tools is the only unbound organization: Bind needs admin rights too.
    expect(await ui.requestAccess.find()).toBeEnabled();
    expect(ui.bind.query()).not.toBeInTheDocument();
    expect(ui.viewDashboard.query()).not.toBeInTheDocument();
  });

  it.each(['Web core', 'Payments'])(
    'does not offer it for %s, which the viewer administers',
    async (name) => {
      const { user } = renderTable({}, getAccess);

      await user.click(ui.actions(name).get());

      expect(await ui.viewDashboard.find()).toBeInTheDocument();
      expect(ui.requestAccess.query()).not.toBeInTheDocument();
    },
  );

  it('reports the request and opens the modal', async () => {
    const { onAction, user } = renderTable({}, getAccess);

    await user.click(ui.actions('Data platform').get());
    await user.click(await ui.requestAccess.find());

    expect(onAction).toHaveBeenCalledWith(OnboardingDashboardAction.RequestAdminAccess);
    expect(await ui.modalTitle.find()).toBeInTheDocument();
  });

  it('holds nothing back, and says nothing, while it is not known what the viewer is', async () => {
    const { user } = renderTable();

    expect(ui.access('admin').query()).not.toBeInTheDocument();
    expect(ui.access('member').query()).not.toBeInTheDocument();
    expect(ui.access('none').query()).not.toBeInTheDocument();

    await user.click(ui.actions('Legacy tools').get());

    expect(await ui.viewDashboard.find()).toBeInTheDocument();
    expect(ui.bind.get()).toBeInTheDocument();
  });
});
