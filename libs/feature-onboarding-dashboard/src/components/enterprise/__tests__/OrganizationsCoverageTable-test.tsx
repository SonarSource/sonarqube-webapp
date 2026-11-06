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
import { OnboardingOrganizationRow, OnboardingOrganizationSort } from '~shared/types/onboarding';
import { OnboardingDashboardAction } from '~shared/types/onboarding-dashboard-telemetry';
import { OrganizationsCoverageTable } from '../OrganizationsCoverageTable';

const PREFIX = 'onboarding_dashboard.enterprise.organizations';

const ui = {
  table: byRole('table', { name: `${PREFIX}.title` }),
  rows: byRole('row'),
  search: byRole('searchbox'),
  sortProgress: byRole('radio', { name: `${PREFIX}.sort.progress` }),
  sortName: byRole('radio', { name: `${PREFIX}.sort.name` }),
  pageTwo: byRole('button', { name: 'pagination.page_x.2' }),
  platformIcon: (platform: string) => byRole('img', { name: platform }),
  platformColumn: byRole('columnheader', { name: `${PREFIX}.col.platform` }),
  unavailable: byText(`${PREFIX}.unavailable`),
  results: (size: number, total: number) =>
    byText(`onboarding_dashboard.table.results_size.${size}.${total}`),
  viewDashboard: (name: string) => byRole('link', { name: `${PREFIX}.action.view.label.${name}` }),
  bind: (name: string) => byRole('link', { name: `${PREFIX}.action.bind.label.${name}` }),
  progress: (name: string) => byRole('progressbar', { name: `${PREFIX}.progress.label.${name}` }),
};

const getBindingUrl = (key: string) => ({ pathname: `/organizations/${key}/edit` });
const getDashboardUrl = (key: string) => ({ pathname: `/organizations/${key}/project-coverage` });

function renderTable(props: Partial<React.ComponentProps<typeof OrganizationsCoverageTable>> = {}) {
  const callbacks = {
    onAction: jest.fn(),
    onPageChange: jest.fn(),
    onSearchChange: jest.fn(),
    onSortChange: jest.fn(),
  };

  const result = renderWithRouter(
    <OrganizationsCoverageTable
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
    />,
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
  expect(ui.viewDashboard('Web core').get()).toHaveTextContent(`${PREFIX}.action.view`);
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

it('drills down to the dashboard of an organization', () => {
  renderTable();

  expect(ui.viewDashboard('Web core').get()).toHaveAttribute(
    'href',
    '/organizations/web-core/project-coverage',
  );
  expect(ui.viewDashboard('Data platform').get()).toHaveAttribute(
    'href',
    '/organizations/data-platform/project-coverage',
  );
});

it('offers the binding setup only for an unbound organization', () => {
  renderTable();

  expect(ui.bind('Legacy tools').get()).toHaveAttribute('href', '/organizations/legacy-tools/edit');
  expect(ui.bind('Web core').query()).not.toBeInTheDocument();
  expect(ui.bind('Data platform').query()).not.toBeInTheDocument();
  // Whether it is bound is unknown for an organization that could not be read.
  expect(ui.bind('Payments').query()).not.toBeInTheDocument();
});

it('reports the binding of an organization being started', async () => {
  const { onAction, user } = renderTable();

  await user.click(ui.bind('Legacy tools').get());

  expect(onAction).toHaveBeenCalledWith(OnboardingDashboardAction.BindOrganization);
});

it('reports the dashboard of an organization being opened', async () => {
  const { onAction, user } = renderTable();

  await user.click(ui.viewDashboard('Web core').get());

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

  it('can still be opened, to see what is wrong from its own dashboard', () => {
    const payments = mockOnboardingOrganizations().filter(({ key }) => key === 'payments');
    renderTable({ organizations: payments, total: 1 });

    expect(ui.viewDashboard('Payments').get()).toHaveAttribute(
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
  it('opens on the sort it is given', () => {
    renderTable({ sort: OnboardingOrganizationSort.Name });

    expect(ui.sortName.get()).toBeChecked();
    expect(ui.sortProgress.get()).not.toBeChecked();
  });

  it('asks for the new sort when it is toggled', async () => {
    const { onSortChange, user } = renderTable();

    expect(ui.sortProgress.get()).toBeChecked();

    await user.click(ui.sortName.get());

    expect(onSortChange).toHaveBeenCalledWith(OnboardingOrganizationSort.Name);
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
