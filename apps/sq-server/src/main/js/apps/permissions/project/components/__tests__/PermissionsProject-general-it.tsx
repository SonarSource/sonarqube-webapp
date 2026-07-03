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
import { ComponentQualifier, Visibility } from '~shared/types/component';

import {
  mockPermissionGroup,
  mockPermissionUser,
} from '~sq-server-commons/helpers/mocks/permissions';

import {
  PERMISSIONS_ORDER_FOR_PROJECT_TEMPLATE,
  PERMISSIONS_ORDER_FOR_VIEW,
} from '~sq-server-commons/helpers/permissions';

import { Permissions } from '~sq-server-commons/types/permissions';
import { PermissionGroup, PermissionUser } from '~sq-server-commons/types/types';
import { getPageObject } from '../../../test-utils';

import {
  renderPermissionsProjectApp,
  serviceMock,
  setupPermissionsProjectTests,
} from './test-utils';

jest.mock('~sq-server-commons/api/mode', () => ({
  getMode: jest.fn().mockResolvedValue({ mode: 'MQR', modified: false }),
}));

setupPermissionsProjectTests();

async function expectProjectPermissionState(
  ui: ReturnType<typeof getPageObject>,
  target: string,
  permission: Permissions,
  checked: boolean,
) {
  const getCheckbox = () => ui.projectPermissionCheckbox(target, permission).get();

  await waitFor(() => {
    if (checked) {
      expect(getCheckbox()).toBeChecked();
    } else {
      expect(getCheckbox()).not.toBeChecked();
    }
  });

  await waitFor(() => {
    expect(getCheckbox()).not.toHaveAttribute('aria-disabled', 'true');
  });

  await ui.appLoaded();
}

describe('rendering', () => {
  it.each([
    [ComponentQualifier.Project, 'roles.page.description2', PERMISSIONS_ORDER_FOR_PROJECT_TEMPLATE],
    [ComponentQualifier.Portfolio, 'roles.page.description_portfolio', PERMISSIONS_ORDER_FOR_VIEW],
    [
      ComponentQualifier.Application,
      'roles.page.description_application',
      PERMISSIONS_ORDER_FOR_VIEW,
    ],
  ])('should render correctly for %s', async (qualifier, description, permissions) => {
    const user = userEvent.setup();
    const ui = getPageObject(user);
    renderPermissionsProjectApp({ qualifier, visibility: Visibility.Private });
    await ui.appLoaded();

    expect(await screen.findByText(description)).toBeInTheDocument();

    permissions.forEach((permission) => {
      expect(ui.projectPermissionCheckbox('johndoe', permission).get()).toBeInTheDocument();
    });
  });

  it('should not show architectureadmin permission when architecture feature is unavailable', async () => {
    const user = userEvent.setup();
    const ui = getPageObject(user);
    renderPermissionsProjectApp(
      { qualifier: ComponentQualifier.Project, visibility: Visibility.Private },
      { featureList: [] },
    );

    expect(await screen.findByText('roles.page.description2')).toBeInTheDocument();
    expect(
      ui.projectPermissionCheckbox('johndoe', Permissions.ArchitectureAdmin).query(),
    ).not.toBeInTheDocument();
  });
});

describe('filtering', () => {
  it('should allow to filter permission holders and by specific permission', async () => {
    const user = userEvent.setup();
    const ui = getPageObject(user);
    renderPermissionsProjectApp();
    await ui.appLoaded();

    // Filter by users/groups/all
    expect(screen.getByText('sonar-users')).toBeInTheDocument();
    expect(screen.getByText('johndoe')).toBeInTheDocument();

    await ui.showOnlyUsers();
    expect(screen.queryByText('sonar-users')).not.toBeInTheDocument();
    expect(screen.getByText('johndoe')).toBeInTheDocument();

    await ui.showOnlyGroups();
    expect(screen.getByText('sonar-users')).toBeInTheDocument();
    expect(screen.queryByText('johndoe')).not.toBeInTheDocument();

    await ui.showAll();
    expect(screen.getByText('sonar-users')).toBeInTheDocument();
    expect(screen.getByText('johndoe')).toBeInTheDocument();

    await ui.searchFor('sonar-adm');
    expect(screen.getByText('sonar-admins')).toBeInTheDocument();
    expect(screen.queryByText('sonar-users')).not.toBeInTheDocument();
    expect(screen.queryByText('johndoe')).not.toBeInTheDocument();

    await ui.clearSearch();
    expect(screen.getByText('sonar-users')).toBeInTheDocument();
    expect(screen.getByText('johndoe')).toBeInTheDocument();

    // Filter by specific permission
    expect(await screen.findAllByRole('row')).toHaveLength(9);
    await ui.toggleFilterByPermission(Permissions.Admin);
    expect(screen.getAllByRole('row')).toHaveLength(3);
    await ui.toggleFilterByPermission(Permissions.Admin);
    expect(screen.getAllByRole('row')).toHaveLength(9);
  });
});

describe('assigning/revoking permissions', () => {
  it('should apply a permission template', async () => {
    const user = userEvent.setup();
    const ui = getPageObject(user);
    renderPermissionsProjectApp();
    await ui.appLoaded();

    await ui.openTemplateModal();
    expect(await ui.confirmApplyTemplateBtn.find()).toBeDisabled();
    expect(await ui.templateSelect.find()).toBeInTheDocument();

    await ui.chooseTemplate('Permission Template 2');
    const successMessage = await ui.templateSuccessfullyApplied.find();
    expect(successMessage).toBeInTheDocument();

    await ui.closeTemplateModal();

    await waitFor(() => {
      expect(ui.templateSuccessfullyApplied.query()).not.toBeInTheDocument();
    });
  });

  it('should toggle project visibility', async () => {
    const user = userEvent.setup();
    const ui = getPageObject(user);
    renderPermissionsProjectApp();
    await ui.appLoaded();
    const browsePermission = ui.projectPermissionCheckbox('sonar-users', Permissions.Browse);

    expect(ui.visibilityRadio(Visibility.Public).get()).toBeChecked();
    expect(browsePermission.query()).not.toBeInTheDocument();

    await ui.turnProjectPrivate();

    await waitFor(() => {
      expect(ui.visibilityRadio(Visibility.Private).get()).toBeChecked();
    });

    expect(await browsePermission.find()).toBeInTheDocument();
    await ui.appLoaded();

    await ui.turnProjectPublic();
    const publicDisclaimer = await ui.makePublicDisclaimer.find();
    expect(publicDisclaimer).toBeInTheDocument();

    await ui.confirmTurnProjectPublic();

    await waitFor(() => {
      expect(ui.makePublicDisclaimer.query()).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(ui.visibilityRadio(Visibility.Public).get()).toBeChecked();
    });

    await waitFor(() => {
      expect(browsePermission.query()).not.toBeInTheDocument();
    });

    await ui.appLoaded();
  });

  it('should grant and revoke group permissions', async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    const ui = getPageObject(user);
    renderPermissionsProjectApp();
    await ui.appLoaded();

    await expectProjectPermissionState(ui, 'sonar-users', Permissions.Admin, false);
    await ui.toggleProjectPermission('sonar-users', Permissions.Admin);
    await expectProjectPermissionState(ui, 'sonar-users', Permissions.Admin, true);

    await ui.toggleProjectPermission('sonar-users', Permissions.Admin);
    await expectProjectPermissionState(ui, 'sonar-users', Permissions.Admin, false);
  });

  it('should grant and revoke user permissions', async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    const ui = getPageObject(user);
    renderPermissionsProjectApp();
    await ui.appLoaded();

    await expectProjectPermissionState(ui, 'johndoe', Permissions.Scan, false);
    await ui.toggleProjectPermission('johndoe', Permissions.Scan);
    await expectProjectPermissionState(ui, 'johndoe', Permissions.Scan, true);

    await ui.toggleProjectPermission('johndoe', Permissions.Scan);
    await expectProjectPermissionState(ui, 'johndoe', Permissions.Scan, false);
  });

  it('should handle errors correctly', async () => {
    expect.hasAssertions();
    serviceMock.setIsAllowedToChangePermissions(false);
    const user = userEvent.setup();
    const ui = getPageObject(user);
    renderPermissionsProjectApp();
    await ui.appLoaded();

    await expectProjectPermissionState(ui, 'johndoe', Permissions.Scan, false);
    await ui.toggleProjectPermission('johndoe', Permissions.Scan);
    await expectProjectPermissionState(ui, 'johndoe', Permissions.Scan, false);
  });
});

describe('pagination', () => {
  it('should correctly handle pagination', async () => {
    const groups: PermissionGroup[] = [];
    const users: PermissionUser[] = [];

    Array.from(Array(20).keys()).forEach((i) => {
      groups.push(mockPermissionGroup({ name: `Group ${i}` }));
      users.push(mockPermissionUser({ login: `user-${i}` }));
    });

    serviceMock.setGroups(groups);
    serviceMock.setUsers(users);

    const user = userEvent.setup();
    const ui = getPageObject(user);
    renderPermissionsProjectApp();
    await ui.appLoaded();

    expect(screen.getAllByRole('row')).toHaveLength(11);
    await ui.clickLoadMore();
    expect(screen.getAllByRole('row')).toHaveLength(21);
  });
});
