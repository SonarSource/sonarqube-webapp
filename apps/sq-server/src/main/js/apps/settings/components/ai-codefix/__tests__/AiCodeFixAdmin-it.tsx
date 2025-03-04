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
import { uniq } from 'lodash';
import FixSuggestionsServiceMock from '~sq-server-shared/api/mocks/FixSuggestionsServiceMock';
import ProjectManagementServiceMock from '~sq-server-shared/api/mocks/ProjectsManagementServiceMock';
import SettingsServiceMock, {
  DEFAULT_DEFINITIONS_MOCK,
} from '~sq-server-shared/api/mocks/SettingsServiceMock';
import { AvailableFeaturesContext } from '~sq-server-shared/context/available-features/AvailableFeaturesContext';
import { renderComponent } from '~sq-server-shared/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-shared/sonar-aligned/helpers/testSelector';
import { Feature } from '~sq-server-shared/types/features';
import { AdditionalCategoryComponentProps } from '../../AdditionalCategories';
import AiCodeFixAdmin from '../AiCodeFixAdminCategory';

let fixSuggestionsServiceMock: FixSuggestionsServiceMock;
let projectManagementServiceMock: ProjectManagementServiceMock;
let settingServiceMock = new SettingsServiceMock();

beforeAll(() => {
  settingServiceMock = new SettingsServiceMock();
  fixSuggestionsServiceMock = new FixSuggestionsServiceMock();
  projectManagementServiceMock = new ProjectManagementServiceMock(settingServiceMock);
});

afterEach(() => {
  fixSuggestionsServiceMock.reset();
  projectManagementServiceMock.reset();
  settingServiceMock.reset();
});

const ui = {
  codeFixTitle: byRole('heading', { name: 'property.aicodefix.admin.title' }),
  enableAiCodeFixCheckbox: byRole('checkbox', {
    name: 'property.aicodefix.admin.checkbox.label',
  }),
  saveButton: byRole('button', { name: 'save' }),
  cancelButton: byRole('button', { name: 'cancel' }),
  retryButton: byRole('button', {
    name: 'property.aicodefix.admin.serviceInfo.result.error.retry.action',
  }),
  allProjectsEnabledRadio: byRole('radio', {
    name: 'property.aicodefix.admin.enable.all.projects.label',
  }),
  someProjectsEnabledRadio: byRole('radio', {
    name: 'property.aicodefix.admin.enable.some.projects.label',
  }),
  selectedTab: byRole('radio', { name: 'selected' }),
  unselectedTab: byRole('radio', { name: 'unselected' }),
  allTab: byRole('radio', { name: 'all' }),
  llmProvider: byRole('combobox', { name: 'aicodefix.admin.provider.title' }),
  project: byText('project1'),
  confirmCancelButton: byRole('button', { name: 'confirm' }),
  continueEditingButton: byRole('button', { name: 'aicodefix.cancel.modal.continue_editing' }),
  azureApiKeyInput: byRole('textbox', { name: 'aicodefix.azure_open_ai.apiKey.label' }),
  azureEndpointInput: byRole('textbox', { name: 'aicodefix.azure_open_ai.endpoint.label' }),
};

it('should display the enablement form when having a paid subscription', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'SUCCESS', subscriptionType: 'PAID' });
  renderCodeFixAdmin();

  expect(await screen.findByText('property.aicodefix.admin.description')).toBeInTheDocument();
});

it('should display the enablement form and disclaimer when in early access', async () => {
  fixSuggestionsServiceMock.setServiceInfo({
    isEnabled: true,
    status: 'SUCCESS',
    subscriptionType: 'EARLY_ACCESS',
  });
  renderCodeFixAdmin();

  expect(
    await screen.findByText('property.aicodefix.admin.early_access.content1'),
  ).toBeInTheDocument();
});

it('should display a disabled message when in early access and disabled by the customer', async () => {
  fixSuggestionsServiceMock.setServiceInfo({
    isEnabled: false,
    status: 'UNAUTHORIZED',
    subscriptionType: 'EARLY_ACCESS',
  });
  renderCodeFixAdmin();

  expect(await screen.findByText('property.aicodefix.admin.disabled')).toBeInTheDocument();
});

it('should promote the feature when not paid', async () => {
  fixSuggestionsServiceMock.setServiceInfo({
    status: 'UNAUTHORIZED',
    subscriptionType: 'NOT_PAID',
  });
  renderCodeFixAdmin();

  expect(await screen.findByText('property.aicodefix.admin.promotion.content')).toBeInTheDocument();
});

it('should display an error message when the subscription is unknown', async () => {
  fixSuggestionsServiceMock.setServiceInfo({
    status: 'SUCCESS',
    subscriptionType: 'WTF',
  });
  renderCodeFixAdmin();

  expect(
    await screen.findByText('property.aicodefix.admin.serviceInfo.unexpected.response.label'),
  ).toBeInTheDocument();
});

it('should display an error message when the service is not responsive', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'TIMEOUT' });
  renderCodeFixAdmin();

  expect(
    await screen.findByText('property.aicodefix.admin.serviceInfo.result.unresponsive.message'),
  ).toBeInTheDocument();
});

it('should display an error message when there is a connection error with the service', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'CONNECTION_ERROR' });
  renderCodeFixAdmin();

  expect(
    await screen.findByText('property.aicodefix.admin.serviceInfo.result.unresponsive.message'),
  ).toBeInTheDocument();
});

it('should propose to retry when an error occurs', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'CONNECTION_ERROR' });
  const user = userEvent.setup();
  renderCodeFixAdmin();

  expect(
    await screen.findByText('property.aicodefix.admin.serviceInfo.result.unresponsive.message'),
  ).toBeInTheDocument();
  expect(ui.retryButton.get()).toBeEnabled();

  fixSuggestionsServiceMock.setServiceInfo({
    isEnabled: true,
    status: 'SUCCESS',
    subscriptionType: 'EARLY_ACCESS',
  });
  await user.click(ui.retryButton.get());

  expect(
    await screen.findByText('property.aicodefix.admin.early_access.content1'),
  ).toBeInTheDocument();
});

it('should display an error message when the current instance is unauthorized', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'UNAUTHORIZED' });
  renderCodeFixAdmin();

  expect(
    await screen.findByText('property.aicodefix.admin.serviceInfo.result.unauthorized'),
  ).toBeInTheDocument();
});

it('should display an error message when an error happens at service level', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'SERVICE_ERROR' });
  renderCodeFixAdmin();

  expect(
    await screen.findByText('property.aicodefix.admin.serviceInfo.result.serviceError'),
  ).toBeInTheDocument();
});

it('should display an error message when the service answers with an unknown status', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'WTF' });
  renderCodeFixAdmin();

  expect(
    await screen.findByText('property.aicodefix.admin.serviceInfo.result.unknown WTF'),
  ).toBeInTheDocument();
});

it('should display an error message when the backend answers with an error', async () => {
  fixSuggestionsServiceMock.setServiceInfo(undefined);
  renderCodeFixAdmin();

  expect(
    await screen.findByText('property.aicodefix.admin.serviceInfo.result.requestError No status'),
  ).toBeInTheDocument();
});

it('should by default propose enabling for all projects when enabling the feature', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'SUCCESS', subscriptionType: 'PAID' });
  fixSuggestionsServiceMock.disableForAllProject();
  const user = userEvent.setup();
  renderCodeFixAdmin();

  expect(await ui.codeFixTitle.find()).toBeInTheDocument();
  expect(ui.enableAiCodeFixCheckbox.get()).not.toBeChecked();

  await user.click(ui.enableAiCodeFixCheckbox.get());
  expect(ui.allProjectsEnabledRadio.get()).toBeEnabled();
});

it('should be able to enable the code fix feature for all projects', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'SUCCESS', subscriptionType: 'PAID' });
  fixSuggestionsServiceMock.disableForAllProject();

  const user = userEvent.setup();
  renderCodeFixAdmin();

  expect(await ui.codeFixTitle.find()).toBeInTheDocument();
  expect(ui.enableAiCodeFixCheckbox.get()).not.toBeChecked();

  await user.click(ui.enableAiCodeFixCheckbox.get());
  expect(ui.llmProvider.get()).toHaveValue('OpenAI');
  expect(ui.allProjectsEnabledRadio.get()).toBeEnabled();
  expect(await ui.saveButton.find()).toBeEnabled();

  await user.click(ui.saveButton.get());
  await waitFor(() => expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked());

  expect(ui.saveButton.get()).toBeDisabled();
});

it('should be able to enable the code fix feature for some projects', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'SUCCESS', subscriptionType: 'PAID' });
  fixSuggestionsServiceMock.disableForAllProject();

  const user = userEvent.setup();
  renderCodeFixAdmin();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).not.toBeChecked();
  });

  await user.click(ui.enableAiCodeFixCheckbox.get());
  expect(ui.someProjectsEnabledRadio.get()).toBeEnabled();
  await user.click(ui.someProjectsEnabledRadio.get());

  expect(ui.selectedTab.get()).toBeVisible();
  expect(await ui.unselectedTab.find()).toBeVisible();
  expect(await ui.allTab.find()).toBeVisible();
  await user.click(ui.unselectedTab.get());

  await waitFor(() => {
    expect(ui.project.get()).toBeVisible();
  });
  await user.click(ui.project.get());

  await user.click(ui.saveButton.get());
  await waitFor(() => expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked());

  expect(ui.saveButton.get()).toBeDisabled();
});

it('should be able to disable the feature for a single project', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'SUCCESS', subscriptionType: 'PAID' });
  fixSuggestionsServiceMock.enableSomeProject('project1');
  const user = userEvent.setup();
  renderCodeFixAdmin();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });
  expect(ui.someProjectsEnabledRadio.get()).toBeEnabled();

  expect(await ui.project.find()).toBeInTheDocument();
  await user.click(ui.project.get());

  await user.click(ui.saveButton.get());
  await waitFor(() => expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked());
  expect(ui.saveButton.get()).toBeDisabled();
});

it('should be able to disable the code fix feature', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'SUCCESS', subscriptionType: 'PAID' });
  const user = userEvent.setup();
  renderCodeFixAdmin();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.enableAiCodeFixCheckbox.get());
  expect(await ui.saveButton.find()).toBeInTheDocument();
  await user.click(await ui.saveButton.find());
  expect(ui.enableAiCodeFixCheckbox.get()).not.toBeChecked();
});

it('should be able to reset the form when canceling', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'SUCCESS', subscriptionType: 'PAID' });
  const user = userEvent.setup();
  renderCodeFixAdmin();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.enableAiCodeFixCheckbox.get());
  expect(ui.enableAiCodeFixCheckbox.get()).not.toBeChecked();
  expect(await ui.cancelButton.find()).toBeInTheDocument();
  await user.click(await ui.cancelButton.find());
  await user.click(ui.continueEditingButton.get());
  expect(ui.enableAiCodeFixCheckbox.get()).not.toBeChecked();
  expect(ui.cancelButton.get()).toBeInTheDocument();

  await user.click(await ui.cancelButton.find());
  await user.click(ui.confirmCancelButton.get());
  expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
});

it('should be able to set the Azure Open option in the form', async () => {
  fixSuggestionsServiceMock.setServiceInfo({ status: 'SUCCESS', subscriptionType: 'PAID' });
  const user = userEvent.setup();
  renderCodeFixAdmin();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  expect(ui.llmProvider.get()).toBeInTheDocument();

  await user.click(ui.llmProvider.get());
  await user.click(byText('Azure OpenAI').get());

  await user.type(ui.azureApiKeyInput.get(), 'test-api-key');
  await user.type(ui.azureEndpointInput.get(), 'https://test-endpoint.com');

  await user.click(ui.saveButton.get());
  await waitFor(() => expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked());

  expect(ui.azureApiKeyInput.get()).toHaveValue('test-api-key');
  expect(ui.azureEndpointInput.get()).toHaveValue('https://test-endpoint.com');
  expect(ui.saveButton.get()).toBeDisabled();
});

function renderCodeFixAdmin(
  overrides: Partial<AdditionalCategoryComponentProps> = {},
  features?: Feature[],
) {
  const props = {
    definitions: DEFAULT_DEFINITIONS_MOCK,
    categories: uniq(DEFAULT_DEFINITIONS_MOCK.map((d) => d.category)),
    selectedCategory: 'general',
    ...overrides,
  };
  return renderComponent(
    <AvailableFeaturesContext.Provider value={features ?? [Feature.FixSuggestions]}>
      <AiCodeFixAdmin {...props} />
    </AvailableFeaturesContext.Provider>,
  );
}
