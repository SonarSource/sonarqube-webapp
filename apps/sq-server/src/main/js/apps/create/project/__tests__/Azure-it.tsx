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
import { searchAzureRepositories } from '~sq-server-commons/api/alm-integrations';
import AlmIntegrationsServiceMock from '~sq-server-commons/api/mocks/AlmIntegrationsServiceMock';
import DopTranslationServiceMock from '~sq-server-commons/api/mocks/DopTranslationServiceMock';
import NewCodeDefinitionServiceMock from '~sq-server-commons/api/mocks/NewCodeDefinitionServiceMock';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';
import { Feature } from '~sq-server-commons/types/features';
import CreateProjectPage from '../CreateProjectPage';

jest.mock('~sq-server-commons/api/alm-integrations');
jest.mock('~sq-server-commons/api/alm-settings');

let almIntegrationHandler: AlmIntegrationsServiceMock;
let dopTranslationHandler: DopTranslationServiceMock;
let newCodePeriodHandler: NewCodeDefinitionServiceMock;

const ui = {
  azureCreateProjectButton: byText('onboarding.create_project.select_method.azure'),
  cancelButton: byRole('button', { name: 'cancel' }),
  azureOnboardingTitle: byRole('heading', { name: 'onboarding.create_project.azure.title' }),
  monorepoDopSettingDropdown: byRole('combobox', {
    name: 'onboarding.create_project.monorepo.choose_dop_settingalm.azure',
  }),
  instanceSelector: byRole('combobox', { name: /alm.configuration.selector.label/ }),
  monorepoTitle: byRole('heading', { name: 'onboarding.create_project.monorepo.titlealm.azure' }),
  monorepoSetupLink: byRole('link', {
    name: 'onboarding.create_project.subtitle_monorepo_setup_link',
  }),
  patFormTitle: byText('onboarding.create_project.pat_form.title'),
  personalAccessTokenInput: byRole('textbox', {
    name: /onboarding.create_project.enter_pat/,
  }),
  repositorySelector: byRole('combobox', {
    name: `onboarding.create_project.monorepo.choose_repository`,
  }),
  resetPatLink: byRole('link', { name: 'onboarding.create_project.azure.subtitle.reset_pat' }),
  savePatButton: byRole('button', { name: 'save' }),
  searchbox: byRole('searchbox', {
    name: 'onboarding.create_project.search_projects_repositories',
  }),
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
  expect(await screen.findByText('onboarding.create_project.azure.title')).toBeInTheDocument();
  expect(screen.getByText('alm.configuration.selector.label.alm.azure.long')).toBeInTheDocument();

  await user.click(ui.instanceSelector.get());
  await user.click(byRole('option', { name: /conf-azure-1/ }).get());

  expect(await screen.findByText('onboarding.create_project.enter_pat')).toBeInTheDocument();
  expect(screen.getByText('onboarding.create_project.pat_form.title')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'save' })).toBeInTheDocument();

  await user.click(ui.personalAccessTokenInput.get());
  await user.keyboard('secret');
  await user.click(screen.getByRole('button', { name: 'save' }));

  expect(await screen.findByText('Azure project')).toBeInTheDocument();
  expect(screen.getByText('Azure project 2')).toBeInTheDocument();
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(screen.getAllByText('onboarding.create_project.repository_imported')).toHaveLength(1);
});

it('should show import project feature when PAT is already set', async () => {
  const user = userEvent.setup();

  renderCreateProject();
  expect(await screen.findByText('onboarding.create_project.azure.title')).toBeInTheDocument();

  await user.click(ui.instanceSelector.get());
  await user.click(byRole('option', { name: /conf-azure-2/ }).get());

  expect(await screen.findByText('Azure project')).toBeInTheDocument();
  expect(screen.getByText('Azure project 2')).toBeInTheDocument();

  expect(
    screen.getByRole('listitem', {
      name: 'Azure repo 1',
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole('listitem', {
      name: 'Azure repo 2',
    }),
  ).toBeInTheDocument();

  await user.click(screen.getByText('Azure project 2'));
  expect(
    screen.getByRole('listitem', {
      name: 'Azure repo 3',
    }),
  ).toBeInTheDocument();

  await user.type(ui.searchbox.get(), 'repo 2');
  await waitFor(() => {
    expect(
      screen.queryByRole('listitem', {
        name: 'Azure repo 1',
      }),
    ).not.toBeInTheDocument();
  });
  expect(
    screen.queryByRole('listitem', {
      name: 'Azure repo 3',
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('listitem', {
      name: 'Azure repo 2',
    }),
  ).toBeInTheDocument();

  await user.clear(ui.searchbox.get());
  expect(
    screen.queryByRole('listitem', {
      name: 'Azure repo 3',
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('listitem', {
      name: 'Azure repo 1',
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('listitem', {
      name: 'Azure repo 2',
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
  expect(await screen.findByText('onboarding.create_project.azure.title')).toBeInTheDocument();

  await user.click(ui.instanceSelector.get());
  await user.click(byRole('option', { name: /conf-azure-2/ }).get());

  // Should search with positive results
  const inputSearch = await screen.findByPlaceholderText(
    'onboarding.create_project.search_projects_repositories',
  );
  await user.click(inputSearch);
  await user.keyboard('s');

  await waitFor(() => {
    expect(searchAzureRepositories).toHaveBeenCalledWith('conf-azure-2', 's');
  });

  // Should search with empty results
  almIntegrationHandler.setSearchAzureRepositories([]);
  await user.keyboard('f');
  expect(screen.getByText('onboarding.create_project.azure.no_results')).toBeInTheDocument();
});

it('should allow to reset PAT', async () => {
  const user = userEvent.setup();
  renderCreateProject();

  expect(await screen.findByText('onboarding.create_project.azure.title')).toBeInTheDocument();
  expect(await ui.instanceSelector.find()).toBeInTheDocument();

  await user.click(ui.instanceSelector.get());
  await user.click(byRole('option', { name: /conf-azure-2/ }).get());

  await user.click(await ui.resetPatLink.find());

  expect(await ui.patFormTitle.find()).toBeInTheDocument();

  expect(await ui.savePatButton.find()).toBeDisabled();

  await user.click(ui.cancelButton.get());

  expect(await screen.findByText('Azure repo 1')).toBeInTheDocument();
});

describe('Azure monorepo setup navigation', () => {
  it('should not display monorepo setup link if feature is disabled', async () => {
    renderCreateProject({ isMonorepoFeatureEnabled: false });

    await waitFor(() => {
      // This test raises an Act warning if the following expect is not wrapped inside a `waitFor`
      // Feel free to investigate and fix it if you have time
      expect(ui.monorepoSetupLink.query()).not.toBeInTheDocument();
    });
  });

  it('should be able to access monorepo setup page from Azure project import page', async () => {
    const user = userEvent.setup();
    renderCreateProject();

    await user.click(await ui.monorepoSetupLink.find());

    expect(ui.monorepoTitle.get()).toBeInTheDocument();
  });

  it('should be able to go back to Azure onboarding page from monorepo setup page', async () => {
    const user = userEvent.setup();
    renderCreateProject({ isMonorepo: true });

    await user.click(await ui.cancelButton.find());

    expect(ui.azureOnboardingTitle.get()).toBeInTheDocument();
  });

  it('should load every repositories from every projects in monorepo setup mode', async () => {
    const user = userEvent.setup();
    renderCreateProject({ isMonorepo: true });

    await user.click(await ui.monorepoDopSettingDropdown.find());
    await user.click(byRole('option', { name: /conf-azure-2/ }).get());

    await user.click(ui.repositorySelector.get());

    expect(screen.getByText('Azure repo 1')).toBeInTheDocument();
    expect(screen.getByText('Azure repo 2')).toBeInTheDocument();
    expect(screen.getByText('Azure repo 3')).toBeInTheDocument();
  });
});

function renderCreateProject({
  isMonorepo = false,
  isMonorepoFeatureEnabled = true,
}: {
  isMonorepo?: boolean;
  isMonorepoFeatureEnabled?: boolean;
} = {}) {
  let queryString = `mode=${CreateProjectModes.AzureDevOps}`;
  if (isMonorepo) {
    queryString += '&mono=true';
  }

  renderApp('projects/create', <CreateProjectPage />, {
    navigateTo: `projects/create?${queryString}`,
    featureList: isMonorepoFeatureEnabled
      ? [Feature.MonoRepositoryPullRequestDecoration]
      : undefined,
  });
}
