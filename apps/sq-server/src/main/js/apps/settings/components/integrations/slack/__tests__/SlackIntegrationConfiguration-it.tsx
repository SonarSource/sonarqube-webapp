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

import userEvent from '@testing-library/user-event';
import { registerServiceMocks } from '~shared/api/mocks/server';
import { byLabelText, byRole, byText } from '~shared/helpers/testSelector';
import {
  integrationsServiceDefaultDataset,
  IntegrationsServiceMock,
} from '~sq-server-commons/api/mocks/IntegrationsServiceMock';
import { mockIntegrationConfiguration } from '~sq-server-commons/helpers/mocks/integrations';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { SlackIntegrationConfiguration } from '../SlackIntegrationConfiguration';

const ui = {
  common: {
    cancelButton: byRole('button', { name: 'cancel' }),
  },

  configurationCard: {
    deleteButton: byRole('button', { name: 'settings.slack.remove_configuration' }),
    editButton: byRole('button', { name: 'edit' }),
    header: byText('settings.slack.configuration.header'),
  },

  configurationCreationForm: {
    createAppButton: byRole('link', { name: /^settings.slack.app_creation.button_label/ }),
    installAppButton: byRole('link', { name: 'settings.slack.install_app.label' }),
    submitButton: byRole('button', { name: 'settings.slack.app_details.submit_button_label' }),
  },

  configurationDeleteModal: {
    confirmButton: byRole('button', { name: 'delete' }),
    content: byText('settings.slack.remove_configuration_modal.description'),
  },

  configurationEditModal: {
    submitButton: byRole('button', {
      name: 'settings.slack.update_configuration_modal.update_button',
    }),
    header: byText('settings.slack.update_configuration_modal.title'),
  },

  configurationForm: {
    clientId: byLabelText(/settings.slack.configuration.client_id/),
    clientSecret: byLabelText(/settings.slack.configuration.client_secret/),
    signingSecret: byLabelText(/settings.slack.configuration.signing_secret/),
  },

  global: {
    configuredBadge: byText('settings.slack.badge.configured'),
    header: byRole('heading', { name: 'settings.slack.header' }),
    installAppButton: byRole('link', { name: /^settings.slack.install_app.label/ }),
    notConfiguredBadge: byText('settings.slack.badge.not_configured'),
    startSetupButton: byRole('button', { name: 'settings.slack.start_setup.label' }),
  },
};

let integrationConfigurationServiceMock: IntegrationsServiceMock;

beforeEach(() => {
  integrationConfigurationServiceMock = new IntegrationsServiceMock(
    integrationsServiceDefaultDataset,
  );
  registerServiceMocks(integrationConfigurationServiceMock);
});

describe('SlackIntegrationConfiguration', () => {
  it('should render the Slack integration configuration in the not-configured state', async () => {
    renderSlackIntegrationConfiguration();

    expect(ui.global.header.get()).toBeInTheDocument();
    expect(await ui.global.startSetupButton.find()).toBeInTheDocument();
    expect(ui.global.notConfiguredBadge.get()).toBeInTheDocument();
  });

  it('should render the Slack integration configuration in the configured state', async () => {
    integrationConfigurationServiceMock.data.integrationConfigurations.push(
      mockIntegrationConfiguration(),
    );

    renderSlackIntegrationConfiguration();

    expect(ui.global.header.get()).toBeInTheDocument();
    expect(await ui.global.configuredBadge.find()).toBeInTheDocument();
    expect(ui.configurationCard.header.get()).toBeInTheDocument();
    expect(ui.configurationCard.editButton.get()).toBeInTheDocument();
    expect(ui.configurationCard.deleteButton.get()).toBeInTheDocument();
    expect(ui.global.installAppButton.get()).toBeInTheDocument();
  });

  it('should be possible to create the Slack integration configuration', async () => {
    const user = userEvent.setup();
    renderSlackIntegrationConfiguration();

    await user.click(await ui.global.startSetupButton.find());

    // Cancel creation
    await user.click(ui.common.cancelButton.get());
    expect(await ui.global.startSetupButton.find()).toBeInTheDocument();

    // Go through with the creation
    await user.click(await ui.global.startSetupButton.find());
    expect(await ui.configurationCreationForm.createAppButton.find()).toBeInTheDocument();
    await user.click(ui.configurationForm.clientId.get());
    await user.paste('clientId');
    await user.click(ui.configurationForm.clientSecret.get());
    await user.paste('clientSecret');
    await user.click(ui.configurationForm.signingSecret.get());
    await user.paste('signingSecret');
    await user.click(ui.configurationCreationForm.submitButton.get());
    expect(await ui.configurationCard.header.find()).toBeInTheDocument();
    expect(byText('clientId').get()).toBeInTheDocument();
    expect(ui.global.installAppButton.get()).toBeInTheDocument();
    expect(ui.global.installAppButton.get()).toHaveAttribute(
      'href',
      expect.stringContaining('client_id=clientId'),
    );
  });

  it('should be possible to update the Slack integration configuration', async () => {
    const user = userEvent.setup();
    integrationConfigurationServiceMock.data.integrationConfigurations.push(
      mockIntegrationConfiguration({
        clientId: 'oldClientId',
      }),
    );

    renderSlackIntegrationConfiguration();

    expect(await byText('oldClientId').find()).toBeInTheDocument();

    // Cancel the update
    await user.click(await ui.configurationCard.editButton.find());
    expect(await ui.configurationEditModal.header.find()).toBeInTheDocument();
    await user.click(ui.common.cancelButton.get());
    expect(ui.configurationCard.header.get()).toBeInTheDocument();
    expect(await byText('oldClientId').find()).toBeInTheDocument();
    expect(ui.configurationCard.editButton.get()).toBeInTheDocument();
    expect(ui.configurationCard.deleteButton.get()).toBeInTheDocument();
    expect(ui.global.installAppButton.get()).toBeInTheDocument();

    // Confirm the update
    await user.click(await ui.configurationCard.editButton.find());
    expect(await ui.configurationEditModal.submitButton.find()).toBeDisabled();
    await user.clear(ui.configurationForm.clientId.get());
    expect(ui.configurationEditModal.submitButton.get()).toBeDisabled();
    await user.click(ui.configurationForm.clientId.get());
    await user.paste('newClientId');
    expect(ui.configurationEditModal.submitButton.get()).toBeEnabled();
    await user.click(ui.configurationForm.clientSecret.get());
    await user.paste('newClientSecret');
    await user.click(ui.configurationEditModal.submitButton.get());
    expect(await ui.configurationCard.header.find()).toBeInTheDocument();
    expect(byText('oldClientId').query()).not.toBeInTheDocument();
    expect(byText('newClientId').get()).toBeInTheDocument();
    expect(await ui.configurationCard.editButton.find()).toBeInTheDocument();
    expect(await ui.configurationCard.deleteButton.find()).toBeInTheDocument();
    expect(await ui.global.installAppButton.find()).toBeInTheDocument();
  });

  it('should be possible to delete the Slack integration configuration', async () => {
    const user = userEvent.setup();
    integrationConfigurationServiceMock.data.integrationConfigurations.push(
      mockIntegrationConfiguration(),
    );

    renderSlackIntegrationConfiguration();

    await user.click(await ui.configurationCard.deleteButton.find());

    // Cancel the deletion
    expect(await ui.configurationDeleteModal.content.find()).toBeInTheDocument();
    await user.click(ui.common.cancelButton.get());
    expect(ui.configurationCard.header.get()).toBeInTheDocument();
    expect(ui.configurationCard.editButton.get()).toBeInTheDocument();
    expect(ui.configurationCard.deleteButton.get()).toBeInTheDocument();
    expect(ui.global.installAppButton.get()).toBeInTheDocument();

    await user.click(await ui.configurationCard.deleteButton.find());

    // Confirm the deletion
    await user.click(await ui.configurationDeleteModal.confirmButton.find());
    expect(await ui.global.startSetupButton.find()).toBeInTheDocument();
  });
});

function renderSlackIntegrationConfiguration() {
  return renderComponent(<SlackIntegrationConfiguration />);
}
