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

import { byRole } from '~shared/helpers/testSelector';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-commons/types/features';
import { InstanceIntegrationsApp } from '../InstanceIntegrationsApp';

const ui = {
  integrationsHeading: byRole('heading', { name: 'settings.instance_integrations.title' }),
  jiraBindingHeading: byRole('heading', { name: 'organization.jira.binding.header' }),
  slackIntegrationHeader: byRole('heading', { name: 'settings.slack.header' }),
};

describe('Instance integrations administration', () => {
  it('should render correctly with Jira feature', () => {
    renderInstanceIntegrationsApp([Feature.JiraIntegration]);

    expect(ui.integrationsHeading.get()).toBeInTheDocument();
    expect(ui.jiraBindingHeading.get()).toBeInTheDocument();
    expect(ui.slackIntegrationHeader.get()).toBeInTheDocument();
  });

  it('should render correctly without Jira feature', () => {
    renderInstanceIntegrationsApp();

    expect(ui.integrationsHeading.get()).toBeInTheDocument();
    expect(ui.jiraBindingHeading.query()).not.toBeInTheDocument();
    expect(ui.slackIntegrationHeader.get()).toBeInTheDocument();
  });
});

function renderInstanceIntegrationsApp(featureList: Feature[] = []) {
  return renderComponent(<InstanceIntegrationsApp />, undefined, { featureList });
}
