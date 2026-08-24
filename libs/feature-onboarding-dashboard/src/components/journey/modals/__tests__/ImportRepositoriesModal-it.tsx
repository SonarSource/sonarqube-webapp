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
import {
  useOnboardingDopSettingsQuery,
  useOnboardingRepositoriesQuery,
} from '~adapters/queries/onboarding';
import { OnboardingRepositoriesMock } from '~shared/api/mocks/OnboardingRepositoriesMock';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import {
  OnboardingDevopsPlatform,
  OnboardingDopSetting,
  OnboardingRepositoriesQuery,
} from '~shared/types/onboarding';
import { NO_DATA } from '../../../dashboardConstants';
import { ImportRepositoriesModal } from '../ImportRepositoriesModal';

const TRIGGER_LABEL = 'Open';

const mockRepositories = new OnboardingRepositoriesMock();

/**
 * Adapter hooks are re-mocked per test so we can flip between the SQ-Cloud (`data: null`) path and
 * the SQ-Server (`data: OnboardingDopSetting[]`) multi-platform path without duplicating the file.
 */
jest.mock('~adapters/queries/onboarding', () => ({
  useOnboardingDopSettingsQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
  useOnboardingOrganizationKey: jest.fn().mockReturnValue('my-org'),
  useOnboardingRepositoriesQuery: jest.fn(),
}));

const mockedDopSettingsQuery = jest.mocked(useOnboardingDopSettingsQuery);
const mockedRepositoriesQuery = jest.mocked(useOnboardingRepositoriesQuery);

function useMockRepositoriesQuery(
  params: OnboardingRepositoriesQuery,
  options?: { enabled?: boolean },
) {
  if (options?.enabled === false) {
    return { data: undefined, isFetching: false } as unknown as ReturnType<
      typeof useOnboardingRepositoriesQuery
    >;
  }
  return { data: mockRepositories.applyQuery(params), isFetching: false } as unknown as ReturnType<
    typeof useOnboardingRepositoriesQuery
  >;
}

beforeAll(() => {
  HTMLElement.prototype.scrollTo = jest.fn();
});

beforeEach(() => {
  mockedDopSettingsQuery.mockReturnValue({ data: null, isLoading: false } as unknown as ReturnType<
    typeof useOnboardingDopSettingsQuery
  >);
  mockedRepositoriesQuery.mockImplementation(useMockRepositoriesQuery);
});

afterEach(() => {
  mockRepositories.reset();
  jest.clearAllMocks();
});

const GITLAB_SETTING: OnboardingDopSetting = {
  id: 'gl-1',
  key: 'GitLab Main',
  type: OnboardingDevopsPlatform.Gitlab,
};

const AZURE_SETTING: OnboardingDopSetting = {
  id: 'az-1',
  key: 'Azure Main',
  type: OnboardingDevopsPlatform.AzureDevops,
};

const GITHUB_SETTING: OnboardingDopSetting = {
  id: 'gh-1',
  key: 'GitHub Main',
  type: OnboardingDevopsPlatform.Github,
};

function mockServerSetup(dopSettings: OnboardingDopSetting[]) {
  mockedDopSettingsQuery.mockReturnValue({
    data: dopSettings,
    isLoading: false,
  } as unknown as ReturnType<typeof useOnboardingDopSettingsQuery>);
}

const ui = {
  openButton: byRole('button', { name: TRIGGER_LABEL }),
  modal: byRole('dialog', { name: 'onboarding_dashboard.journey.import.modal.title' }),
  table: byRole('table', { name: 'onboarding_dashboard.journey.import.modal.title' }),
  closeButton: byRole('dialog', {
    name: 'onboarding_dashboard.journey.import.modal.title',
  }).byRole('button', { name: 'close' }),
  paginationPage2: byRole('button', { name: 'pagination.page_x.2' }),
  githubIcon: byRole('img', { name: 'alm.github' }),
  gitlabIcon: byRole('img', { name: 'alm.gitlab' }),
  bitbucketIcon: byRole('img', { name: 'alm.bitbucket' }),
  azureIcon: byRole('img', { name: 'alm.azure' }),
  platformSelect: byRole('combobox', {
    name: 'onboarding_dashboard.journey.import.modal.platform_select.label',
  }),
  /**
   * Options in the platform Select carry a leading `<img alt="alm.*">` that gets folded into the
   * accessible name, so we match the label as a substring instead of asserting an exact name.
   */
  platformOption: (name: string) => byRole('option', { name: new RegExp(name) }),
  resultsCount: (size: number, total: number) =>
    byText(`onboarding_dashboard.table.results_size.${size}.${total}`),
  searchInput: byRole('searchbox', {
    name: 'onboarding_dashboard.repositories.search',
  }),
  visibilityFilter: byRole('combobox', {
    name: 'onboarding_dashboard.repositories.filter.visibility.label',
  }),
};

function renderModal() {
  return renderWithRouter(
    <ImportRepositoriesModal>
      <button type="button">{TRIGGER_LABEL}</button>
    </ImportRepositoriesModal>,
  );
}

/**
 * Pastes a query in one shot instead of dispatching per-character events. The search is debounced,
 * so firing a single paste exercises the same behaviour for a fraction of the cost.
 */
async function search(
  user: ReturnType<typeof renderModal>['user'],
  input: HTMLElement,
  term: string,
) {
  await user.click(input);
  await user.clear(input);
  await user.paste(term);
}

it('renders the table with all repository rows when open', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.modal.find()).toBeInTheDocument();
  expect(await ui.table.find()).toBeInTheDocument();
  expect(ui.table.byText('platform-jobs').get()).toBeInTheDocument();
  expect(ui.table.byText('payments-gateway').get()).toBeInTheDocument();
  expect(ui.table.byText('web-core').get()).toBeInTheDocument();
  expect(ui.table.byText('identity-lib').get()).toBeInTheDocument();
  expect(ui.table.byText('mobile-worker').get()).toBeInTheDocument();
});

it('displays correct visibility and import status for each row', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  await ui.table.byText('platform-jobs').find();

  // payments-gateway and identity-lib are private, the other three are public.
  expect(ui.table.byText('visibility.private').getAll()).toHaveLength(2);
  expect(ui.table.byText('visibility.public').getAll()).toHaveLength(3);

  // Only platform-jobs is not imported, the remaining four are imported.
  expect(
    ui.table.byText('onboarding_dashboard.journey.import.legend.not_imported').getAll(),
  ).toHaveLength(1);
  expect(
    ui.table.byText('onboarding_dashboard.journey.import.legend.imported').getAll(),
  ).toHaveLength(4);
});

it('closes the modal when the close button is clicked', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.modal.find()).toBeInTheDocument();
  await user.click(await ui.closeButton.find());

  expect(ui.modal.query()).not.toBeInTheDocument();
});

it('shows a no-data row when the organization has no repositories', async () => {
  mockRepositories.repositories = [];
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  // One NO_DATA placeholder per column (repository, visibility, status = 3 columns total).
  expect(await ui.table.byText(NO_DATA).findAll()).toHaveLength(3);
});

it('renders all ALM icons from the mocked repositories', async () => {
  // Fixture: Github (platform-jobs, payments-gateway), Gitlab (web-core),
  // Bitbucket (identity-lib), AzureDevops (mobile-worker) — each ALM appears once per row.
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  const githubIcons = await ui.githubIcon.findAll();
  expect(githubIcons).toHaveLength(2); // platform-jobs, payments-gateway

  expect(ui.gitlabIcon.get()).toBeInTheDocument(); // web-core
  expect(ui.gitlabIcon.get()).toHaveAttribute('src', expect.stringContaining('gitlab.svg'));

  expect(ui.bitbucketIcon.get()).toBeInTheDocument(); // identity-lib
  expect(ui.bitbucketIcon.get()).toHaveAttribute('src', expect.stringContaining('bitbucket.svg'));

  expect(ui.azureIcon.get()).toBeInTheDocument(); // mobile-worker
  expect(ui.azureIcon.get()).toHaveAttribute('src', expect.stringContaining('azure.svg'));
});

it('shows the correct results count for a full page', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.resultsCount(5, 5).find()).toBeInTheDocument();
});

it('shows the correct results count when results span multiple pages', async () => {
  // 5 repositories, page size 3, page 1 shows 3 out of 5 total.
  mockRepositories.overridePageSize = 3;
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.resultsCount(3, 5).find()).toBeInTheDocument();
});

it('does not show pagination when all repositories fit on a single page', async () => {
  // Default: 5 repositories, PAGE_SIZE=10, no pagination rendered.
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  await ui.table.byText('platform-jobs').find();
  expect(ui.paginationPage2.query()).not.toBeInTheDocument();
});

it('shows pagination when the total exceeds the page size', async () => {
  // 5 repositories served 3 per page, totalPages = 2.
  mockRepositories.overridePageSize = 3;
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.paginationPage2.find()).toBeInTheDocument();
});

it('navigates to the next page when a pagination button is clicked', async () => {
  // Page 1 (pageSize=3): platform-jobs, payments-gateway, web-core.
  // Page 2 (pageSize=3): identity-lib, mobile-worker.
  mockRepositories.overridePageSize = 3;
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.table.byText('platform-jobs').find()).toBeInTheDocument();
  expect(ui.table.byText('payments-gateway').query()).toBeInTheDocument();
  expect(ui.table.byText('web-core').query()).toBeInTheDocument();

  expect(ui.table.byText('identity-lib').query()).not.toBeInTheDocument();
  expect(ui.table.byText('mobile-worker').query()).not.toBeInTheDocument();

  await user.click(await ui.paginationPage2.find());

  expect(ui.table.byText('platform-jobs').query()).not.toBeInTheDocument();
  expect(ui.table.byText('payments-gateway').query()).not.toBeInTheDocument();
  expect(ui.table.byText('web-core').query()).not.toBeInTheDocument();

  expect(await ui.table.byText('identity-lib').find()).toBeInTheDocument();
  expect(ui.table.byText('mobile-worker').query()).toBeInTheDocument();
});

it('renders the search input and the visibility filter', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());
  await ui.modal.find();

  expect(ui.searchInput.get()).toBeInTheDocument();
  expect(ui.visibilityFilter.get()).toBeInTheDocument();
});

it('lists all visibility options in the filter dropdown', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());
  await ui.modal.find();

  await user.click(await ui.visibilityFilter.find());

  expect(
    await byRole('option', { name: 'onboarding_dashboard.projects.filter.all' }).find(),
  ).toBeInTheDocument();
  expect(
    byRole('option', { name: 'onboarding_dashboard.repositories.filter.private' }).get(),
  ).toBeInTheDocument();
  expect(
    byRole('option', { name: 'onboarding_dashboard.repositories.filter.public' }).get(),
  ).toBeInTheDocument();
});

it('filters the repository list by search term', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  // All five mock repositories are visible once the modal opens.
  expect(await ui.table.byText('platform-jobs').find()).toBeInTheDocument();
  expect(ui.table.byText('web-core').get()).toBeInTheDocument();

  await search(user, ui.searchInput.get(), 'platform');

  // Only the repository whose name contains "platform" stays visible.
  await waitFor(() => {
    expect(ui.table.byText('web-core').query()).not.toBeInTheDocument();
  });
  expect(ui.table.byText('platform-jobs').get()).toBeInTheDocument();

  await search(user, ui.searchInput.get(), '');

  // After clearing the input, every repositories are restored.
  expect(await ui.table.byText('web-core').find()).toBeInTheDocument();
  expect(ui.table.byText('platform-jobs').get()).toBeInTheDocument();
});

it('filters the repository list to private repositories', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  // All five mock repositories are visible once the modal opens.
  expect(await ui.table.byText('platform-jobs').find()).toBeInTheDocument();

  await user.click(ui.visibilityFilter.get());
  await user.click(
    await byRole('option', { name: 'onboarding_dashboard.repositories.filter.private' }).find(),
  );

  // payments-gateway and identity-lib are private; the three public repositories are gone.
  await waitFor(() => {
    expect(ui.table.byText('platform-jobs').query()).not.toBeInTheDocument();
  });
  expect(ui.table.byText('payments-gateway').get()).toBeInTheDocument();
  expect(ui.table.byText('identity-lib').get()).toBeInTheDocument();
  expect(ui.table.byText('web-core').query()).not.toBeInTheDocument();
  expect(ui.table.byText('mobile-worker').query()).not.toBeInTheDocument();

  await user.click(ui.visibilityFilter.get());
  await user.click(
    await byRole('option', { name: 'onboarding_dashboard.projects.filter.all' }).find(),
  );

  // After clearing the filter, every rrepositories are restored.
  expect(await ui.table.byText('platform-jobs').find()).toBeInTheDocument();
});

it('ANDs the search term and the visibility filter', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  // Start: all five repositories visible.
  expect(await ui.table.byText('payments-gateway').find()).toBeInTheDocument();

  // Filter to private — payments-gateway and identity-lib remain.
  await user.click(ui.visibilityFilter.get());
  await user.click(
    await byRole('option', { name: 'onboarding_dashboard.repositories.filter.private' }).find(),
  );
  await waitFor(() => {
    expect(ui.table.byText('platform-jobs').query()).not.toBeInTheDocument();
  });

  // Narrow further with a search term — only payments-gateway matches both 'gateway' and private.
  await search(user, ui.searchInput.get(), 'gateway');
  await waitFor(() => {
    expect(ui.table.byText('identity-lib').query()).not.toBeInTheDocument();
  });
  expect(ui.table.byText('payments-gateway').get()).toBeInTheDocument();
});

describe('SQ-Server platform selector', () => {
  it('does not render the selector on SQ-Cloud (adapter returns null)', async () => {
    // By default, dopSettings === null, so SQ-Cloud path.
    const { user } = renderModal();
    await user.click(ui.openButton.get());
    await ui.modal.find();

    expect(ui.platformSelect.query()).not.toBeInTheDocument();
  });

  it('does not render the selector when only a single platform entry exists', async () => {
    mockServerSetup([GITLAB_SETTING]);

    const { user } = renderModal();
    await user.click(ui.openButton.get());
    await ui.modal.find();

    expect(ui.platformSelect.query()).not.toBeInTheDocument();
  });

  it('renders the selector when multiple platforms are configured', async () => {
    mockServerSetup([GITLAB_SETTING, AZURE_SETTING]);

    const { user } = renderModal();
    await user.click(ui.openButton.get());

    expect(await ui.platformSelect.find()).toBeInTheDocument();
  });

  it('lists every non-github DOP setting as an option and hides github ones', async () => {
    mockServerSetup([GITHUB_SETTING, GITLAB_SETTING, AZURE_SETTING]);

    const { user } = renderModal();
    await user.click(ui.openButton.get());
    await user.click(await ui.platformSelect.find());

    expect(await ui.platformOption(GITLAB_SETTING.key).find()).toBeInTheDocument();
    expect(ui.platformOption(AZURE_SETTING.key).get()).toBeInTheDocument();
    expect(ui.platformOption(GITHUB_SETTING.key).query()).not.toBeInTheDocument();
  });

  it('shows the platform logo as a prefix on each option', async () => {
    mockServerSetup([GITLAB_SETTING, AZURE_SETTING]);

    const { user } = renderModal();
    await user.click(ui.openButton.get());
    await user.click(await ui.platformSelect.find());

    const gitlabOption = ui.platformOption(GITLAB_SETTING.key).byRole('img');
    expect(await gitlabOption.find()).toHaveAttribute('src', expect.stringContaining('gitlab'));

    const azureOption = ui.platformOption(AZURE_SETTING.key).byRole('img');
    expect(azureOption.get()).toHaveAttribute('src', expect.stringContaining('azure'));
  });

  it('passes the auto-selected dopSettingId to the repositories query', async () => {
    mockServerSetup([GITLAB_SETTING, AZURE_SETTING]);

    const { user } = renderModal();
    await user.click(ui.openButton.get());
    await ui.modal.find();

    // The first non-github entry (Gitlab) is auto-selected.
    expect(mockedRepositoriesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ dopSettingId: GITLAB_SETTING.id }),
      expect.objectContaining({ enabled: true }),
    );
  });

  it('passes the newly-selected dopSettingId when the user picks another platform', async () => {
    mockServerSetup([GITLAB_SETTING, AZURE_SETTING]);

    const { user } = renderModal();
    await user.click(ui.openButton.get());
    await user.click(await ui.platformSelect.find());
    await user.click(await ui.platformOption(AZURE_SETTING.key).find());

    await waitFor(() => {
      expect(mockedRepositoriesQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({ dopSettingId: AZURE_SETTING.id }),
        expect.objectContaining({ enabled: true }),
      );
    });
  });
});
