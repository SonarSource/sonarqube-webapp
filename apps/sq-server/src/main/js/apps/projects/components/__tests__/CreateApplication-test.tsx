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
import { byRole, byText } from '~shared/helpers/testSelector';
import { ComponentQualifier, Visibility } from '~shared/types/component';
import { createApplication } from '~sq-server-commons/api/application';
import { getComponentNavigation } from '~sq-server-commons/api/navigation';
import { mockAppState, mockLoggedInUser, mockRouter } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { FCProps } from '~sq-server-commons/types/misc';
import { LoggedInUser } from '~sq-server-commons/types/users';
import { ApplicationCreation } from '../ApplicationCreation';

jest.mock('~sq-server-commons/api/application', () => ({
  createApplication: jest.fn().mockResolvedValue({}),
}));
jest.mock('~sq-server-commons/api/navigation', () => ({
  getComponentNavigation: jest.fn().mockResolvedValue({}),
}));

const ui = {
  buttonAddApplication: byRole('button', { name: 'projects.create_application' }),
  createApplicationHeader: byText('qualifiers.create.APP'),
  mandatoryFieldWarning: byText('fields_marked_with_x_required'),
  formNameField: byRole('textbox', { name: 'name' }),
  formKeyField: byRole('textbox', { name: 'key' }),
  formDescriptionField: byRole('textbox', { name: 'description' }),
  formVisibilityField: byText('visibility'),
  formRadioButtonPrivate: byRole('radio', { name: 'visibility.private' }),
  formCreateButton: byRole('button', { name: 'create' }),
  formCancelButton: byRole('button', { name: 'cancel' }),
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('should be able to create application when user is logged in and has permission', async () => {
  const user = userEvent.setup();
  const routerPush = jest.fn();
  const router = mockRouter({ push: routerPush });

  jest.mocked(getComponentNavigation).mockResolvedValueOnce({
    configuration: { showSettings: true },
    name: 'name',
    breadcrumbs: [{ key: 'b-key', qualifier: ComponentQualifier.Project, name: 'b-name' }],
    key: 'key',
  });

  jest.mocked(createApplication).mockResolvedValueOnce({
    application: {
      key: 'app',
      name: 'app',
      description: 'app',
      visibility: Visibility.Public,
    },
  });

  renderApplicationCreation(
    { router },
    mockLoggedInUser({ permissions: { global: ['admin', 'applicationcreator'] } }),
  );

  await user.click(ui.buttonAddApplication.get());
  expect(ui.createApplicationHeader.get()).toBeInTheDocument();
  expect(ui.mandatoryFieldWarning.get()).toBeInTheDocument();
  expect(ui.formNameField.get()).toBeInTheDocument();
  expect(ui.formDescriptionField.get()).toBeInTheDocument();
  expect(ui.formKeyField.get()).toBeInTheDocument();
  expect(ui.formVisibilityField.get()).toBeInTheDocument();
  expect(ui.formCreateButton.get()).toBeInTheDocument();
  expect(ui.formCancelButton.get()).toBeInTheDocument();
  await user.click(ui.formCancelButton.get());
  expect(ui.createApplicationHeader.query()).not.toBeInTheDocument();

  await user.click(ui.buttonAddApplication.get());
  await user.click(ui.formNameField.get());
  await user.keyboard('app');
  await user.click(ui.formDescriptionField.get());
  await user.keyboard('app description');
  await user.click(ui.formKeyField.get());
  await user.keyboard('app-key');
  await user.click(ui.formRadioButtonPrivate.get());
  await user.click(ui.formCreateButton.get());
  expect(createApplication).toHaveBeenCalledWith(
    'app',
    'app description',
    'app-key',
    Visibility.Private,
  );
  expect(routerPush).toHaveBeenCalledWith({
    pathname: '/project/admin/extension/developer-server/application-console',
    search: queryToSearchString({
      id: 'app',
    }),
  });
});

function renderApplicationCreation(
  props: Partial<FCProps<typeof ApplicationCreation>> = {},
  currentUser: LoggedInUser = mockLoggedInUser(),
) {
  return renderComponent(
    <ApplicationCreation
      appState={mockAppState({ qualifiers: [ComponentQualifier.Application] })}
      currentUser={currentUser}
      router={mockRouter()}
      {...props}
    />,
  );
}
