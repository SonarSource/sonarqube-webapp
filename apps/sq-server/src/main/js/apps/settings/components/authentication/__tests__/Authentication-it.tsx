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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byRole, byText } from '~shared/helpers/testSelector';
import DopTranslationServiceMock from '~sq-server-commons/api/mocks/DopTranslationServiceMock';
import GithubProvisioningServiceMock from '~sq-server-commons/api/mocks/GithubProvisioningServiceMock';
import GitlabProvisioningServiceMock from '~sq-server-commons/api/mocks/GitlabProvisioningServiceMock';
import ScimProvisioningServiceMock from '~sq-server-commons/api/mocks/ScimProvisioningServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import SystemServiceMock from '~sq-server-commons/api/mocks/SystemServiceMock';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { definitions } from '~sq-server-commons/helpers/mocks/definitions-list';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-commons/types/features';
import Authentication from '../Authentication';

let scimHandler: ScimProvisioningServiceMock;
let dopTranslationHandler: DopTranslationServiceMock;
let githubHandler: GithubProvisioningServiceMock;
let gitlabHandler: GitlabProvisioningServiceMock;
let system: SystemServiceMock;
let settingsHandler: SettingsServiceMock;

beforeEach(() => {
  scimHandler = new ScimProvisioningServiceMock();
  dopTranslationHandler = new DopTranslationServiceMock();
  githubHandler = new GithubProvisioningServiceMock();
  gitlabHandler = new GitlabProvisioningServiceMock();
  system = new SystemServiceMock();
  settingsHandler = new SettingsServiceMock();
});

afterEach(() => {
  scimHandler.reset();
  dopTranslationHandler.reset();
  githubHandler.reset();
  gitlabHandler.reset();
  settingsHandler.reset();
  system.reset();
});

const ui = {
  saveButton: byRole('button', { name: 'settings.authentication.saml.form.save' }),
  customMessageInformation: byText('settings.authentication.custom_message_information'),
  enabledToggle: byRole('switch'),
};

it('should render tabs and allow navigation', async () => {
  const user = userEvent.setup();
  renderAuthentication();

  expect(screen.getAllByRole('tab')).toHaveLength(4);

  expect(screen.getByRole('tab', { name: 'SAML' })).toHaveAttribute('aria-current', 'true');

  await user.click(screen.getByRole('tab', { name: 'github GitHub' }));

  expect(screen.getByRole('tab', { name: 'SAML' })).toHaveAttribute('aria-current', 'false');
  expect(screen.getByRole('tab', { name: 'github GitHub' })).toHaveAttribute(
    'aria-current',
    'true',
  );
});

it('should not display the login message feature info box', () => {
  renderAuthentication();

  expect(ui.customMessageInformation.query()).not.toBeInTheDocument();
});

it('should display the login message feature info box', () => {
  renderAuthentication([Feature.LoginMessage]);

  expect(ui.customMessageInformation.get()).toBeInTheDocument();
});

function renderAuthentication(features: Feature[] = []) {
  renderComponent(
    <AvailableFeaturesContext.Provider value={features}>
      <Authentication definitions={definitions} />
    </AvailableFeaturesContext.Provider>,
  );
}
