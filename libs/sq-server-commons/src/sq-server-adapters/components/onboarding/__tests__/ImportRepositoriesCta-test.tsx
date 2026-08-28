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
import { byRole } from '~shared/helpers/testSelector';
import AlmSettingsServiceMock from '../../../../api/mocks/AlmSettingsServiceMock';
import { mockAlmSettingsInstance } from '../../../../helpers/mocks/alm-settings';
import { mockLoggedInUser } from '../../../../helpers/testMocks';
import { renderComponent } from '../../../../helpers/testReactTestingUtils';
import { AlmKeys } from '../../../../types/alm-settings';
import { Permissions } from '../../../../types/permissions';
import { LoggedInUser } from '../../../../types/users';
import { ImportRepositoriesCta } from '../ImportRepositoriesCta';

jest.mock('../../../../api/alm-settings');

let almSettings: AlmSettingsServiceMock;

beforeAll(() => {
  almSettings = new AlmSettingsServiceMock();
});

afterEach(() => {
  almSettings.reset();
});

const ui = {
  toggle: byRole('button'),
  githubItem: byRole('menuitem', { name: /add_project\.github/ }),
  fallbackItem: byRole('menuitem', { name: /add_project\.more/ }),
  separator: byRole('separator'),
};

it('shows an import option for each bound and validated ALM configuration, carrying the onboarding redirect param', async () => {
  almSettings.setAlmSettings([mockAlmSettingsInstance({ key: 'gh', alm: AlmKeys.GitHub })]);
  const user = userEvent.setup();
  renderImportRepositoriesCta({ permissions: { global: [Permissions.ProjectCreation] } });

  await user.click(ui.toggle.get());

  const href = (await ui.githubItem.find()).getAttribute('href');

  expect(href).toContain('/projects/create?');
  expect(href).toContain('mode=github');
  expect(href).toContain('redirect=%2Fadmin%2Fonboarding-dashboard');
});

it('does not render a leading separator when no ALM is bound', async () => {
  almSettings.setAlmSettings([]);
  const user = userEvent.setup();
  renderImportRepositoriesCta({ permissions: { global: [Permissions.ProjectCreation] } });

  await user.click(ui.toggle.get());

  expect(await ui.fallbackItem.find()).toHaveAttribute(
    'href',
    expect.stringContaining('redirect=%2Fadmin%2Fonboarding-dashboard'),
  );
  expect(ui.separator.query()).not.toBeInTheDocument();
});

it('renders nothing when the user cannot create projects', () => {
  almSettings.setAlmSettings([mockAlmSettingsInstance({ key: 'gh', alm: AlmKeys.GitHub })]);
  renderImportRepositoriesCta({ permissions: { global: [] } });

  expect(ui.toggle.query()).not.toBeInTheDocument();
});

function renderImportRepositoriesCta(userOverrides: Partial<LoggedInUser> = {}) {
  return renderComponent(<ImportRepositoriesCta>Import</ImportRepositoriesCta>, '/', {
    currentUser: mockLoggedInUser(userOverrides),
  });
}
