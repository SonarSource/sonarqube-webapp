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

import {
  getDevopsPlatformWebUrl,
  getImportRepositoriesUrl,
} from '~adapters/helpers/onboarding-actions';
import {
  useOnboardingBoundProjectCountsQuery,
  useOnboardingDopSettingsQuery,
} from '~adapters/queries/onboarding';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import {
  OnboardingBoundProjectCounts,
  OnboardingDevopsPlatform,
  OnboardingDopSetting,
} from '~shared/types/onboarding';
import { JourneyStep } from '../../../../types/types';
import { NO_DATA } from '../../../dashboardConstants';
import { DevopsConfigurationsModal } from '../DevopsConfigurationsModal';

const TRIGGER_LABEL = 'Open';
const MODAL_TITLE = 'onboarding_dashboard.journey.binding.modal.title';

// The list and the counts are product-specific, so they are re-mocked per test. That also lets this
// one file cover the SQ-Cloud path, where the settings query answers `null`.
jest.mock('~adapters/queries/onboarding', () => ({
  useOnboardingBoundProjectCountsQuery: jest.fn(),
  useOnboardingDopSettingsQuery: jest.fn(),
}));

jest.mock('~adapters/helpers/onboarding-actions', () => ({
  getDevopsPlatformWebUrl: jest.fn(),
  getImportRepositoriesUrl: jest.fn(),
}));

const GITHUB_MAIN: OnboardingDopSetting = {
  id: 'gh-1',
  key: 'GitHub Main',
  type: OnboardingDevopsPlatform.Github,
  url: 'https://api.github.com',
};

const GITLAB_MAIN: OnboardingDopSetting = {
  id: 'gl-1',
  key: 'GitLab Main',
  type: OnboardingDevopsPlatform.Gitlab,
  url: 'https://gitlab.com/api/v4',
};

/** Bitbucket Cloud identifies itself by a workspace, so it reports no URL to open. */
const BITBUCKET_CLOUD: OnboardingDopSetting = {
  id: 'bbc-1',
  key: 'Bitbucket Workspace',
  type: OnboardingDevopsPlatform.BitbucketCloud,
};

const SETTINGS = [GITHUB_MAIN, GITLAB_MAIN, BITBUCKET_CLOUD];

const COUNTS: OnboardingBoundProjectCounts = { 'bbc-1': 0, 'gh-1': 12 };

const IMPORT_URL = { pathname: '/projects/create', search: '?dopSetting=gh-1&mode=github' };

function mockConfigurations(
  settings: OnboardingDopSetting[] | null,
  counts: OnboardingBoundProjectCounts = COUNTS,
) {
  jest.mocked(useOnboardingDopSettingsQuery).mockReturnValue({
    data: settings,
    isPending: false,
  } as unknown as ReturnType<typeof useOnboardingDopSettingsQuery>);

  jest
    .mocked(useOnboardingBoundProjectCountsQuery)
    .mockReturnValue({ data: counts, isPending: false } as unknown as ReturnType<
      typeof useOnboardingBoundProjectCountsQuery
    >);
}

/** Builds `count` configurations, so paging can be exercised without listing them all by hand. */
function manyConfigurations(count: number): OnboardingDopSetting[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `gh-${index}`,
    key: `GitHub ${index}`,
    type: OnboardingDevopsPlatform.Github,
  }));
}

const ui = {
  openButton: byRole('button', { name: TRIGGER_LABEL }),
  modal: byRole('dialog', { name: MODAL_TITLE }),
  table: byRole('table', { name: MODAL_TITLE }),
  closeButton: byRole('dialog', { name: MODAL_TITLE }).byRole('button', { name: 'close' }),

  searchInput: byRole('searchbox', {
    name: 'onboarding_dashboard.journey.binding.modal.search',
  }),
  platformFilter: byRole('combobox', {
    name: 'onboarding_dashboard.journey.binding.modal.platform_filter.label',
  }),
  platformOption: (name: string) => byRole('option', { name }),
  resultsCount: (size: number, total: number) =>
    byText(`onboarding_dashboard.table.results_size.${size}.${total}`),

  nameHeader: byRole('columnheader', {
    name: 'onboarding_dashboard.journey.binding.modal.col.name',
  }),
  importedHeader: byRole('columnheader', {
    name: 'onboarding_dashboard.journey.binding.modal.col.imported',
  }),
  foundRepositoriesHeader: byRole('columnheader', { name: /found_repositories/ }),
  analysedHeader: byRole('columnheader', { name: /analysed/ }),

  paginationPage2: byRole('button', { name: 'pagination.page_x.2' }),

  rowActions: (name: string) =>
    byRole('button', { name: `onboarding_dashboard.projects.actions.label.${name}` }),
  importAction: byRole('menuitem', {
    name: 'onboarding_dashboard.journey.binding.modal.action.import_repositories',
  }),
  analyzeAction: byRole('menuitem', {
    name: 'onboarding_dashboard.journey.binding.modal.action.analyze_projects',
  }),
  viewOnPlatformAction: byRole('menuitem', {
    name: /onboarding_dashboard\.journey\.binding\.modal\.action\.view_on_platform/,
  }),
};

function renderModal(onSelectStep = jest.fn()) {
  return {
    onSelectStep,
    ...renderWithRouter(
      <DevopsConfigurationsModal onSelectStep={onSelectStep}>
        <button type="button">{TRIGGER_LABEL}</button>
      </DevopsConfigurationsModal>,
    ),
  };
}

// Pasted in one shot rather than per character: the search is debounced, so this exercises the same
// behaviour far more cheaply.
async function search(user: ReturnType<typeof renderModal>['user'], term: string) {
  const input = ui.searchInput.get();

  await user.click(input);
  await user.clear(input);
  await user.paste(term);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockConfigurations(SETTINGS);
  jest.mocked(getImportRepositoriesUrl).mockReturnValue(IMPORT_URL);
  jest.mocked(getDevopsPlatformWebUrl).mockReturnValue('https://github.com');
});

it('lists every configuration with its platform and imported count', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.table.find()).toBeInTheDocument();

  // The configuration alias is the row's name, with the platform named underneath it.
  expect(ui.table.byText('GitHub Main').get()).toBeInTheDocument();
  expect(ui.table.byText('GitLab Main').get()).toBeInTheDocument();
  expect(ui.table.byText('Bitbucket Workspace').get()).toBeInTheDocument();
  expect(ui.table.byText('alm.github').get()).toBeInTheDocument();

  expect(ui.table.byText('12').get()).toBeInTheDocument();
  expect(ui.table.byText('0').get()).toBeInTheDocument();

  // GitLab's count is missing from the map — an unresolved lookup must not read as "no projects".
  expect(ui.table.byText(NO_DATA).get()).toBeInTheDocument();
});

it('lists the configurations while their counts are still being fetched', async () => {
  // One request per row, so the counts land after the list rather than gating the table.
  jest
    .mocked(useOnboardingBoundProjectCountsQuery)
    .mockReturnValue({ data: {}, isPending: true } as unknown as ReturnType<
      typeof useOnboardingBoundProjectCountsQuery
    >);

  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.table.byText('GitHub Main').find()).toBeInTheDocument();
  expect(ui.table.byText(NO_DATA).getAll()).toHaveLength(3);
});

it('leaves out the columns the backend cannot answer per configuration', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.nameHeader.find()).toBeInTheDocument();
  expect(ui.importedHeader.get()).toBeInTheDocument();

  // Neither is reported per configuration, so those two columns are absent rather than empty.
  expect(ui.foundRepositoriesHeader.query()).not.toBeInTheDocument();
  expect(ui.analysedHeader.query()).not.toBeInTheDocument();
});

it('narrows the rows to the searched name', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());
  await ui.table.byText('GitHub Main').find();

  await search(user, 'gitlab');

  expect(await ui.table.byText('GitLab Main').find()).toBeInTheDocument();
  expect(ui.table.byText('GitHub Main').query()).not.toBeInTheDocument();
  expect(ui.resultsCount(1, 1).get()).toBeInTheDocument();
});

it('tells the two Bitbucket platforms apart, in the filter and in the rows', async () => {
  // Both plain keys translate to "Bitbucket", so an instance holding a Data Center and a Cloud
  // configuration would otherwise show two entries a user cannot tell apart.
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.table.byText('alm.bitbucketcloud.long').find()).toBeInTheDocument();

  await user.click(ui.platformFilter.get());

  expect(await ui.platformOption('alm.bitbucket.long').find()).toBeInTheDocument();
  expect(ui.platformOption('alm.bitbucketcloud.long').get()).toBeInTheDocument();
});

it('narrows the rows to the selected platform', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());
  await ui.table.byText('GitHub Main').find();

  await user.click(ui.platformFilter.get());
  await user.click(await ui.platformOption('alm.gitlab').find());

  expect(await ui.table.byText('GitLab Main').find()).toBeInTheDocument();
  expect(ui.table.byText('GitHub Main').query()).not.toBeInTheDocument();
});

it('reports how many configurations the filters matched', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.resultsCount(3, 3).find()).toBeInTheDocument();
});

it('pages through the configurations, one page at a time', async () => {
  mockConfigurations(manyConfigurations(12));

  const { user } = renderModal();
  await user.click(ui.openButton.get());

  // Ten of the twelve fit on the first page.
  expect(await ui.table.byText('GitHub 0').find()).toBeInTheDocument();
  expect(ui.table.byText('GitHub 10').query()).not.toBeInTheDocument();

  await user.click(await ui.paginationPage2.find());

  expect(await ui.table.byText('GitHub 10').find()).toBeInTheDocument();
  expect(ui.table.byText('GitHub 0').query()).not.toBeInTheDocument();
});

it('offers the whole action menu of a configuration', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  await user.click(await ui.rowActions('GitHub Main').find());

  expect(await ui.importAction.find()).toHaveAttribute(
    'href',
    '/projects/create?dopSetting=gh-1&mode=github',
  );
  expect(ui.analyzeAction.get()).toBeInTheDocument();
  expect(ui.viewOnPlatformAction.get()).toHaveAttribute('href', 'https://github.com');
});

it('drops the platform entry for a configuration with no web address', async () => {
  jest.mocked(getDevopsPlatformWebUrl).mockReturnValue(undefined);

  const { user } = renderModal();
  await user.click(ui.openButton.get());

  await user.click(await ui.rowActions('Bitbucket Workspace').find());

  expect(await ui.importAction.find()).toBeInTheDocument();
  expect(ui.viewOnPlatformAction.query()).not.toBeInTheDocument();
});

it('hands the user to the projects step from the action menu', async () => {
  const { onSelectStep, user } = renderModal();
  await user.click(ui.openButton.get());

  await user.click(await ui.rowActions('GitHub Main').find());
  await user.click(await ui.analyzeAction.find());

  expect(onSelectStep).toHaveBeenCalledWith(JourneyStep.Projects);
});

it('shows an empty table rather than every row when nothing matches', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());
  await ui.table.byText('GitHub Main').find();

  await search(user, 'no-such-configuration');

  expect(await ui.resultsCount(0, 0).find()).toBeInTheDocument();
  expect(ui.table.byText('GitHub Main').query()).not.toBeInTheDocument();
});

it('lists nothing on the products that hold no configuration at all', async () => {
  mockConfigurations(null, {});

  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.modal.find()).toBeInTheDocument();
  expect(ui.resultsCount(0, 0).get()).toBeInTheDocument();
});

it('closes on the close button', async () => {
  const { user } = renderModal();
  await user.click(ui.openButton.get());

  expect(await ui.modal.find()).toBeInTheDocument();
  await user.click(await ui.closeButton.find());

  expect(ui.modal.query()).not.toBeInTheDocument();
});
