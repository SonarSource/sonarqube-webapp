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

import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import UserTokensMock from '~sq-server-commons/api/mocks/UserTokensMock';
import handleRequiredAuthentication from '~sq-server-commons/helpers/handleRequiredAuthentication';
import { mockCurrentUser, mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderAppWithComponentContext } from '~sq-server-commons/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';
import { Permissions } from '~sq-server-commons/types/permissions';
import routes from '../../routes';

jest.mock('~sq-server-commons/helpers/handleRequiredAuthentication', () => jest.fn());

jest.mock('~sq-server-commons/api/components', () => ({
  getScannableProjects: jest.fn().mockResolvedValue({ projects: [] }),
}));

jest.mock('~sq-server-commons/api/alm-settings', () => ({
  getAlmSettingsNoCatch: jest.fn().mockResolvedValue([]),
}));

let settingsMock: SettingsServiceMock;
let tokenMock: UserTokensMock;

beforeAll(() => {
  settingsMock = new SettingsServiceMock();
  tokenMock = new UserTokensMock();
});

afterEach(() => {
  tokenMock.reset();
  settingsMock.reset();
});

beforeEach(jest.clearAllMocks);

const ui = {
  loading: byText('loading'),
  localScanButton: byRole('heading', { name: 'onboarding.tutorial.choose_method' }),
};

it('renders tutorials page', async () => {
  renderTutorialsApp(mockLoggedInUser({ permissions: { global: [Permissions.Scan] } }));

  expect(await ui.localScanButton.find()).toBeInTheDocument();
});

it('should redirect if user is not logged in', () => {
  renderTutorialsApp();
  expect(handleRequiredAuthentication).toHaveBeenCalled();
  expect(ui.loading.query()).not.toBeInTheDocument();
  expect(ui.localScanButton.query()).not.toBeInTheDocument();
});

function renderTutorialsApp(currentUser = mockCurrentUser()) {
  return renderAppWithComponentContext('tutorials', routes, {
    currentUser,
  });
}
