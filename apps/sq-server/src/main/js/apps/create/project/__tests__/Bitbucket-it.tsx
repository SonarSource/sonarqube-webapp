/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { screen, waitFor } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { getBitbucketServerRepositories } from '~sq-server-shared/api/alm-integrations';
import AlmIntegrationsServiceMock from '~sq-server-shared/api/mocks/AlmIntegrationsServiceMock';
import DopTranslationServiceMock from '~sq-server-shared/api/mocks/DopTranslationServiceMock';
import NewCodeDefinitionServiceMock from '~sq-server-shared/api/mocks/NewCodeDefinitionServiceMock';
import { mockBitbucketRepository } from '~sq-server-shared/helpers/mocks/alm-integrations';
import { renderApp } from '~sq-server-shared/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-shared/sonar-aligned/helpers/testSelector';
import { CreateProjectModes } from '~sq-server-shared/types/create-project';
import { Feature } from '~sq-server-shared/types/features';
import CreateProjectPage from '../CreateProjectPage';

jest.mock('~sq-server-shared/api/alm-integrations');
jest.mock('~sq-server-shared/api/alm-settings');

let almIntegrationHandler: AlmIntegrationsServiceMock;
let dopTranslationHandler: DopTranslationServiceMock;
let newCodePeriodHandler: NewCodeDefinitionServiceMock;

const ui = {
  bitbucketServerOnboardingTitle: byRole('heading', {
    name: 'onboarding.create_project.bitbucket.title',
  }),
  bitbucketServerCreateProjectButton: byText('onboarding.create_project.select_method.bitbucket'),
  cancelButton: byRole('button', { name: 'cancel' }),
  monorepoSetupLink: byRole('link', {
    name: 'onboarding.create_project.subtitle_monorepo_setup_link',
  }),
  monorepoTitle: byRole('heading', {
    name: 'onboarding.create_project.monorepo.titlealm.bitbucket',
  }),
  personalAccessTokenInput: byRole('textbox', {
    name: /onboarding.create_project.enter_pat/,
  }),
  instanceSelector: byRole('combobox', { name: /alm.configuration.selector.label/ }),
  searchMoreSelector: byRole('combobox', { name: 'onboarding.create_project.search_mode' }),
  showMoreButton: byRole('button', { name: 'show_more' }),
};

beforeAll(() => {
  almIntegrationHandler = new AlmIntegrationsServiceMock();
  dopTranslationHandler = new DopTranslationServiceMock();
  newCodePeriodHandler = new NewCodeDefinitionServiceMock();
});

beforeEach(() => {
  jest.clearAllMocks();
  almIntegrationHandler.reset();
  dopTranslationHandler.reset();
  newCodePeriodHandler.reset();
});

it('should ask for PAT when it is not set yet and show the import project feature afterwards', async () => {
  const user = userEvent.setup();
  renderCreateProject();

  expect(screen.getByText('onboarding.create_project.bitbucket.title')).toBeInTheDocument();
  expect(await ui.instanceSelector.find()).toBeInTheDocument();

  await user.click(ui.instanceSelector.get());
  await user.click(byRole('option', { name: /conf-bitbucketserver-1/ }).get());

  expect(await screen.findByText('onboarding.create_project.pat_form.title')).toBeInTheDocument();

  expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();

  await user.click(
    screen.getByRole('textbox', {
      name: /onboarding.create_project.enter_pat/,
    }),
  );

  await user.keyboard('password');

  expect(screen.getByRole('button', { name: 'save' })).toBeEnabled();
  await user.click(screen.getByRole('button', { name: 'save' }));

  expect(await screen.findByText('Bitbucket Repo 1')).toBeInTheDocument();
  expect(screen.getByText('Bitbucket Repo 2')).toBeInTheDocument();
});

it('should show import project feature when PAT is already set', async () => {
  const user = userEvent.setup();
  renderCreateProject();

  expect(screen.getByText('onboarding.create_project.bitbucket.title')).toBeInTheDocument();
  expect(await ui.instanceSelector.find()).toBeInTheDocument();

  await user.click(ui.instanceSelector.get());
  await user.click(byRole('option', { name: /conf-bitbucketserver-2/ }).get());

  expect(
    await screen.findByText('onboarding.create_project.repository_imported'),
  ).toBeInTheDocument();

  expect(screen.getByRole('link', { name: /Bitbucket Repo 1/ })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Bitbucket Repo 1/ })).toHaveAttribute(
    'href',
    '/dashboard?id=key',
  );

  expect(
    screen.getByRole('listitem', {
      name: 'Bitbucket Repo 1',
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole('listitem', {
      name: 'Bitbucket Repo 2',
    }),
  ).toBeInTheDocument();

  const importButton = screen.getByText('onboarding.create_project.import');
  await user.click(importButton);

  expect(
    screen.getByRole('heading', { name: 'onboarding.create_x_project.new_code_definition.title1' }),
  ).toBeInTheDocument();

  await user.click(screen.getByRole('radio', { name: 'new_code_definition.global_setting' }));
  await user.click(
    screen.getByRole('button', {
      name: 'onboarding.create_project.new_code_definition.create_x_projects1',
    }),
  );

  expect(await screen.findByText('/dashboard?id=key')).toBeInTheDocument();
});

it('should show search filter when PAT is already set', async () => {
  const user = userEvent.setup();
  renderCreateProject();

  expect(screen.getByText('onboarding.create_project.bitbucket.title')).toBeInTheDocument();
  expect(await ui.instanceSelector.find()).toBeInTheDocument();

  await user.click(ui.instanceSelector.get());
  await user.click(byRole('option', { name: /conf-bitbucketserver-2/ }).get());

  const inputSearch = await screen.findByRole('searchbox', {
    name: 'onboarding.create_project.search_repositories_by_name',
  });
  await user.click(inputSearch);
  await user.keyboard('search');

  await waitFor(() => {
    expect(getBitbucketServerRepositories).toHaveBeenLastCalledWith(
      'conf-bitbucketserver-2',
      undefined,
      'search',
      0,
    );
  });
});

it('should show no result message when there are no projects', async () => {
  const user = userEvent.setup();
  almIntegrationHandler.setBitbucketServerProjects([]);
  renderCreateProject();
  expect(screen.getByText('onboarding.create_project.bitbucket.title')).toBeInTheDocument();
  expect(await ui.instanceSelector.find()).toBeInTheDocument();

  await user.click(ui.instanceSelector.get());
  await user.click(byRole('option', { name: /conf-bitbucketserver-2/ }).get());

  expect(await screen.findByText('onboarding.create_project.no_bbs_projects')).toBeInTheDocument();
});

it('should allow to retrieve more repositories when more are available', async () => {
  const user = userEvent.setup();
  almIntegrationHandler.bitbucketReposIsLastPage = false;
  renderCreateProject();

  expect(screen.getByText('onboarding.create_project.bitbucket.title')).toBeInTheDocument();
  expect(await ui.instanceSelector.find()).toBeInTheDocument();

  await user.click(ui.instanceSelector.get());
  await user.click(byRole('option', { name: /conf-bitbucketserver-2/ }).get());

  expect(await screen.findAllByRole('listitem', { name: /Bitbucket Repo/ })).toHaveLength(
    almIntegrationHandler.bitbucketRepositories.length,
  );

  almIntegrationHandler.bitbucketReposIsLastPage = true;
  almIntegrationHandler.bitbucketRepositories.push(
    mockBitbucketRepository({
      id: 3,
      name: 'Bitbucket Repo 3',
      slug: 'bitbucket_repo_3',
      projectKey: 'bitbucket_project_1',
      projectName: 'Bitbucket Project 1',
    }),
  );
  await user.click(ui.showMoreButton.get());

  expect(screen.getAllByRole('listitem', { name: /Bitbucket Repo/ })).toHaveLength(
    almIntegrationHandler.bitbucketRepositories.length,
  );
  expect(screen.queryByRole('button', { name: 'show_more' })).not.toBeInTheDocument();
});

it('should allow to search for projects', async () => {
  const user = userEvent.setup();
  renderCreateProject();

  expect(screen.getByText('onboarding.create_project.bitbucket.title')).toBeInTheDocument();
  expect(await ui.instanceSelector.find()).toBeInTheDocument();

  await user.click(ui.instanceSelector.get());
  await user.click(byRole('option', { name: /conf-bitbucketserver-2/ }).get());

  const inputSearch = await screen.findByRole('searchbox', {
    name: 'onboarding.create_project.search_repositories_by_name',
  });
  await user.click(inputSearch);
  await user.keyboard('Bitbucket Repo 1');
  expect(screen.getAllByRole('listitem', { name: /Bitbucket Repo/ })).toHaveLength(1);

  await user.click(ui.searchMoreSelector.get());
  await user.click(
    byRole('option', { name: 'onboarding.create_project.search_mode.project' }).get(),
  );
  expect(screen.queryAllByRole('listitem', { name: /Bitbucket Repo/ })).toHaveLength(0);

  await user.click(inputSearch);
  await user.clear(inputSearch);
  await user.keyboard('Bitbucket Project 1');
  expect(screen.getAllByRole('listitem', { name: /Bitbucket Repo/ })).toHaveLength(2);
});

describe('Bitbucket Server monorepo project navigation', () => {
  it('should be able to access monorepo setup page from Bitbucket Server project import page', async () => {
    const user = userEvent.setup();
    renderCreateProject();

    await user.click(await ui.monorepoSetupLink.find());

    expect(ui.monorepoTitle.get()).toBeInTheDocument();
  });

  it('should be able to go back to Bitbucket Server onboarding page from monorepo setup page', async () => {
    const user = userEvent.setup();
    renderCreateProject({ isMonorepo: true });

    await user.click(await ui.cancelButton.find());

    expect(ui.bitbucketServerOnboardingTitle.get()).toBeInTheDocument();
  });
});

function renderCreateProject({
  isMonorepo = false,
}: {
  isMonorepo?: boolean;
} = {}) {
  let queryString = `mode=${CreateProjectModes.BitbucketServer}`;
  if (isMonorepo) {
    queryString += '&mono=true';
  }

  renderApp('projects/create', <CreateProjectPage />, {
    navigateTo: `projects/create?${queryString}`,
    featureList: [Feature.MonoRepositoryPullRequestDecoration],
  });
}
