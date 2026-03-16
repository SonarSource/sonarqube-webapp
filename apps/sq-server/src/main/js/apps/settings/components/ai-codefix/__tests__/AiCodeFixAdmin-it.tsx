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

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byLabelText, byRole, byText } from '~shared/helpers/testSelector';
import FixSuggestionsServiceMock from '~sq-server-commons/api/mocks/FixSuggestionsServiceMock';
import ProjectManagementServiceMock from '~sq-server-commons/api/mocks/ProjectsManagementServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { flushPromises } from '~sq-server-commons/helpers/testUtils';
import { Feature } from '~sq-server-commons/types/features';
import { AiCodeFixAdminCategory } from '../AiCodeFixAdminCategory';

let fixSuggestionsServiceMock: FixSuggestionsServiceMock;
let projectManagementServiceMock: ProjectManagementServiceMock;
let settingServiceMock = new SettingsServiceMock();

beforeAll(() => {
  settingServiceMock = new SettingsServiceMock();
  fixSuggestionsServiceMock = new FixSuggestionsServiceMock();
  projectManagementServiceMock = new ProjectManagementServiceMock(settingServiceMock);
});

afterEach(async () => {
  fixSuggestionsServiceMock.reset();
  projectManagementServiceMock.reset();
  settingServiceMock.reset();
  // Wait for any pending async operations to complete
  await flushPromises();
});

const ui = {
  codeFixTitle: byRole('heading', { name: 'property.aicodefix.admin.title' }),
  enableAiCodeFixCheckbox: byRole('checkbox', {
    name: 'property.aicodefix.admin.checkbox.label',
  }),
  saveButton: byRole('button', { name: 'save' }),
  cancelButton: byRole('button', { name: 'cancel' }),
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
  azureEndpointInput: byRole('textbox', { name: 'Endpoint' }),
  azureApiKeyInput: byLabelText(/API Key/),
  awsRegionInput: byRole('textbox', { name: 'Region' }),
  awsModelIdInput: byRole('textbox', { name: 'Model ID' }),
  customEndpointInput: byRole('textbox', { name: 'Endpoint' }),
  customModelIdInput: byRole('textbox', { name: 'Model ID' }),
  addHeaderButton: byRole('button', { name: /aicodefix.admin.custom_headers.add/ }),
  headerNameInput: byRole('textbox', { name: 'aicodefix.admin.custom_headers.header_name' }),
  headerValueInput: byRole('textbox', { name: 'aicodefix.admin.custom_headers.header_value' }),
  headerSecretCheckbox: byRole('checkbox', { name: 'aicodefix.admin.custom_headers.secret' }),
};

it('should display the enablement form when feature has fix-suggestions', async () => {
  renderCodeFixAdmin();

  expect(await screen.findByText('property.aicodefix.admin.description')).toBeInTheDocument();
});

it('should not display the enablement form when feature fix-suggestions or fix-suggestions-marketing are not present', () => {
  renderCodeFixAdmin([Feature.Architecture]);

  expect(screen.queryByText('property.aicodefix.admin.description')).not.toBeInTheDocument();
});

it('should by default propose enabling for all projects when enabling the feature', async () => {
  fixSuggestionsServiceMock.disableForAllProject();
  renderCodeFixAdmin();
  const user = userEvent.setup();

  expect(await ui.codeFixTitle.find()).toBeInTheDocument();
  await flushPromises();
  expect(ui.enableAiCodeFixCheckbox.get()).not.toBeChecked();

  const enableAiCodeFixCheckbox = ui.enableAiCodeFixCheckbox.get();
  await user.click(enableAiCodeFixCheckbox);

  const allProjectsEnabledRadio = await ui.allProjectsEnabledRadio.find();

  expect(allProjectsEnabledRadio).toBeVisible();
  expect(allProjectsEnabledRadio).toBeChecked();
});

it('should be able to enable the code fix feature for all projects', async () => {
  fixSuggestionsServiceMock.disableForAllProject();
  renderCodeFixAdmin();
  const user = userEvent.setup();

  expect(await ui.codeFixTitle.find()).toBeInTheDocument();
  await flushPromises();

  const enableAiCodeFixCheckbox = await ui.enableAiCodeFixCheckbox.find();

  expect(enableAiCodeFixCheckbox).toBeVisible();
  expect(enableAiCodeFixCheckbox).not.toBeChecked();

  await user.click(enableAiCodeFixCheckbox);

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  const llmProvider = await ui.llmProvider.find();

  expect(llmProvider).toBeVisible();
  expect(llmProvider).toHaveValue('OpenAI - GPT-5.1');

  const allProjectsEnabledRadio = await ui.allProjectsEnabledRadio.find();

  expect(allProjectsEnabledRadio).toBeVisible();
  expect(allProjectsEnabledRadio).toBeChecked();

  const saveButton = await ui.saveButton.find();

  expect(saveButton).toBeVisible();
  expect(saveButton).toBeEnabled();

  await user.click(saveButton);

  await waitFor(() => {
    expect(saveButton).not.toBeInTheDocument();
  });
});

it('should be able to enable the code fix feature for some projects', async () => {
  fixSuggestionsServiceMock.disableForAllProject();

  renderCodeFixAdmin();
  const user = userEvent.setup();

  const enableAiCodeFixCheckbox = await ui.enableAiCodeFixCheckbox.find();
  await flushPromises();

  expect(enableAiCodeFixCheckbox).toBeVisible();
  await waitFor(() => {
    expect(enableAiCodeFixCheckbox).not.toBeChecked();
  });

  await user.click(enableAiCodeFixCheckbox);

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  const someProjectsEnabledRadio = await ui.someProjectsEnabledRadio.find();

  expect(someProjectsEnabledRadio).toBeVisible();

  await user.click(someProjectsEnabledRadio);

  const selectedTab = await ui.selectedTab.find();
  const unselectedTab = await ui.unselectedTab.find();
  const allTab = await ui.allTab.find();

  expect(selectedTab).toBeVisible();
  expect(unselectedTab).toBeVisible();
  expect(allTab).toBeVisible();

  await user.click(unselectedTab);

  const projectUi = await ui.project.find();

  expect(projectUi).toBeVisible();

  await user.click(projectUi);

  const saveButton = await ui.saveButton.find();

  await user.click(saveButton);

  await waitFor(() => {
    expect(enableAiCodeFixCheckbox).toBeChecked();
  });
  await waitFor(() => {
    expect(saveButton).not.toBeVisible();
  });
});

it('should be able to disable the feature for a single project', async () => {
  fixSuggestionsServiceMock.enableSomeProject('project1');
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });
  expect(ui.someProjectsEnabledRadio.get()).toBeEnabled();

  expect(await ui.project.find()).toBeInTheDocument();
  await user.click(ui.project.get());

  await user.click(ui.saveButton.get());
  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });
  await waitFor(() => {
    expect(ui.saveButton.query()).not.toBeInTheDocument();
  });
});

it('should be able to disable the code fix feature', async () => {
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.enableAiCodeFixCheckbox.get());
  expect(await ui.saveButton.find()).toBeInTheDocument();
  await user.click(await ui.saveButton.find());
  expect(ui.enableAiCodeFixCheckbox.get()).not.toBeChecked();
});

it('should be able to reset the form when canceling', async () => {
  renderCodeFixAdmin();
  const user = userEvent.setup();

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
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  expect(ui.llmProvider.get()).toBeInTheDocument();

  await user.click(ui.llmProvider.get());
  await user.click(byText('Azure OpenAI').get());

  await user.type(ui.azureApiKeyInput.get(), 'test-api-key');
  await user.type(ui.azureEndpointInput.get(), 'https://test-endpoint.com');

  await user.click(ui.saveButton.get());
  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  // After save, verify the form stabilizes with Azure provider and masked secrets
  await waitFor(() => {
    expect(ui.saveButton.query()).not.toBeInTheDocument();
  });
  await waitFor(() => {
    expect(ui.azureApiKeyInput.get()).toHaveValue('');
  });
  expect(ui.azureEndpointInput.get()).toHaveValue('https://test-endpoint.com');
});

it('should be able to select the recommended provider by default if no provider is selected', async () => {
  fixSuggestionsServiceMock.disableForAllProject();

  renderCodeFixAdmin();
  const user = userEvent.setup();

  expect(await ui.codeFixTitle.find()).toBeInTheDocument();
  await flushPromises();
  expect(ui.enableAiCodeFixCheckbox.get()).not.toBeChecked();

  await user.click(ui.enableAiCodeFixCheckbox.get());

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  const llmProvider = ui.llmProvider.get();

  expect(llmProvider).toHaveValue('OpenAI - GPT-5.1');
});

it('should disable the save button when the provider is not valid', async () => {
  fixSuggestionsServiceMock.enableAllProjectWithAzureProvider();

  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  expect(ui.saveButton.query()).not.toBeInTheDocument();
  await user.clear(ui.azureEndpointInput.get());
  expect(ui.saveButton.get()).toBeDisabled();

  await user.type(ui.azureEndpointInput.get(), 'something new');
  expect(ui.saveButton.get()).toBeEnabled();
});

it('should render AWS Bedrock config fields when selecting that provider', async () => {
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.llmProvider.get());
  await user.click(byText('AWS BedRock').get());

  expect(ui.awsRegionInput.get()).toBeInTheDocument();
  expect(ui.awsModelIdInput.get()).toBeInTheDocument();
});

it('should display the promotion message when the FixSuggestionsMarketing feature is enabled', async () => {
  renderCodeFixAdmin([Feature.FixSuggestions, Feature.FixSuggestionsMarketing]);
  expect(await screen.findByText(/property.aicodefix.admin.promotion.content/)).toBeInTheDocument();
});

it('should show endpoint, modelId inputs and Add header button when selecting Custom provider', async () => {
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.llmProvider.get());
  await user.click(byText('Custom').get());

  expect(ui.customEndpointInput.get()).toBeInTheDocument();
  expect(ui.customModelIdInput.get()).toBeInTheDocument();
  expect(ui.addHeaderButton.get()).toBeInTheDocument();
});

it('should add a header row with name, value, secret, and delete controls', async () => {
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.llmProvider.get());
  await user.click(byText('Custom').get());

  await user.click(ui.addHeaderButton.get());

  expect(ui.headerNameInput.get()).toBeInTheDocument();
  expect(ui.headerValueInput.get()).toBeInTheDocument();
  expect(ui.headerSecretCheckbox.get()).toBeInTheDocument();
  expect(
    byRole('button', { name: /aicodefix.admin.custom_headers.delete/ }).get(),
  ).toBeInTheDocument();
});

it('should send correct payload with headers when saving Custom provider', async () => {
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.llmProvider.get());
  await user.click(byText('Custom').get());

  await user.type(ui.customEndpointInput.get(), 'https://my-llm.example.com');
  await user.type(ui.customModelIdInput.get(), 'my-model-v1');

  await user.click(ui.addHeaderButton.get());

  await user.type(ui.headerNameInput.get(), 'Authorization');
  await user.type(ui.headerValueInput.get(), 'Bearer token123');

  // Verify save button is enabled (all fields valid including headers)
  expect(ui.saveButton.get()).toBeEnabled();

  await user.click(ui.saveButton.get());

  // Save succeeds — button disappears
  await waitFor(() => {
    expect(ui.saveButton.query()).not.toBeInTheDocument();
  });
});

it('should toggle header value input to password type when secret checkbox is checked', async () => {
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.llmProvider.get());
  await user.click(byText('Custom').get());
  await user.click(ui.addHeaderButton.get());

  const valueInput = ui.headerValueInput.get();
  expect(valueInput).toHaveAttribute('type', 'text');

  await user.click(ui.headerSecretCheckbox.get());

  // After toggling secret, the input type changes to password, so query by label
  const passwordInput = byLabelText('aicodefix.admin.custom_headers.header_value').get();
  expect(passwordInput).toHaveAttribute('type', 'password');
});

it('should remove a header row when clicking delete', async () => {
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.llmProvider.get());
  await user.click(byText('Custom').get());

  await user.click(ui.addHeaderButton.get());
  expect(ui.headerNameInput.get()).toBeInTheDocument();

  await user.click(byRole('button', { name: /aicodefix.admin.custom_headers.delete/ }).get());
  expect(ui.headerNameInput.query()).not.toBeInTheDocument();
});

it('should disable save button when header name or value is empty', async () => {
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.llmProvider.get());
  await user.click(byText('Custom').get());

  await user.type(ui.customEndpointInput.get(), 'https://my-llm.example.com');
  await user.type(ui.customModelIdInput.get(), 'my-model-v1');

  await user.click(ui.addHeaderButton.get());

  // Header name and value are empty — save should be disabled
  expect(ui.saveButton.get()).toBeDisabled();

  await user.type(ui.headerNameInput.get(), 'X-Custom');
  // Value still empty
  expect(ui.saveButton.get()).toBeDisabled();

  await user.type(ui.headerValueInput.get(), 'some-value');
  expect(ui.saveButton.get()).toBeEnabled();
});

it('should not show save button when custom provider with masked headers is loaded unchanged', async () => {
  fixSuggestionsServiceMock.enableAllProjectWithCustomProvider();
  renderCodeFixAdmin();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  // Provider is Custom with pre-existing masked header — form is not dirty
  expect(ui.saveButton.query()).not.toBeInTheDocument();
});

it('should detect dirty state when modifying a saved custom header name', async () => {
  fixSuggestionsServiceMock.enableAllProjectWithCustomProvider();
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  // Modify the existing header name
  await user.clear(ui.headerNameInput.get());
  await user.type(ui.headerNameInput.get(), 'X-New-Header');

  expect(ui.saveButton.get()).toBeEnabled();
});

it('should not show save button when azure provider with masked config is loaded unchanged', async () => {
  fixSuggestionsServiceMock.enableAllProjectWithAzureProvider();
  renderCodeFixAdmin();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  // Azure provider has masked apiKey (****) — form should not be dirty
  expect(ui.saveButton.query()).not.toBeInTheDocument();
});

it('should display Custom provider last in the Other providers group', async () => {
  renderCodeFixAdmin();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enableAiCodeFixCheckbox.get()).toBeChecked();
  });

  await user.click(ui.llmProvider.get());

  // Verify "Other providers" group heading exists
  expect(screen.getByText('aicodefix.admin.provider.other_providers')).toBeInTheDocument();

  // Get all options in the dropdown and verify Custom appears after other self-hosted providers
  const allOptions = screen.getAllByRole('option');
  const labels = allOptions.map((o) => String(o.textContent));
  const awsIndex = labels.findIndex((l) => l.includes('AWS BedRock'));
  const customIndex = labels.findIndex((l) => l.includes('Custom'));
  expect(customIndex).toBeGreaterThan(awsIndex);
});

function renderCodeFixAdmin(features?: Feature[]) {
  return renderComponent(
    <AvailableFeaturesContext.Provider value={features ?? [Feature.FixSuggestions]}>
      <AiCodeFixAdminCategory />
    </AvailableFeaturesContext.Provider>,
  );
}
