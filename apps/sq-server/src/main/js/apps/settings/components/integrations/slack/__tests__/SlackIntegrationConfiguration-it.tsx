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

import { registerServiceMocks } from '~shared/api/mocks/server';
import { byRole, byText } from '~shared/helpers/testSelector';
import {
  integrationsServiceDefaultDataset,
  IntegrationsServiceMock,
} from '~sq-server-commons/api/mocks/IntegrationsServiceMock';
import { mockIntegrationConfiguration } from '~sq-server-commons/helpers/mocks/integrations';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { SlackIntegrationConfiguration } from '../SlackIntegrationConfiguration';

const ui = {
  configuredBadge: byText('settings.slack.badge.configured'),
  header: byRole('heading', { name: 'settings.slack.header' }),
  notConfiguredBadge: byText('settings.slack.badge.not_configured'),
  startSetupButton: byRole('button', { name: 'settings.slack.start_setup.label' }),
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

    expect(ui.header.get()).toBeInTheDocument();
    expect(await ui.startSetupButton.find()).toBeInTheDocument();
    expect(ui.notConfiguredBadge.get()).toBeInTheDocument();
  });

  it('should render the Slack integration configuration in the configured state', async () => {
    integrationConfigurationServiceMock.data.integrationConfigurations.push(
      mockIntegrationConfiguration(),
    );

    renderSlackIntegrationConfiguration();

    expect(ui.header.get()).toBeInTheDocument();
    expect(await ui.configuredBadge.find()).toBeInTheDocument();
  });
});

function renderSlackIntegrationConfiguration() {
  return renderComponent(<SlackIntegrationConfiguration />);
}
