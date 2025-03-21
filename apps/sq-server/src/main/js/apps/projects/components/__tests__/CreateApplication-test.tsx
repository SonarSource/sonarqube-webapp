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

import userEvent from '@testing-library/user-event';
import { createApplication } from '~sq-server-shared/api/application';
import { getComponentNavigation } from '~sq-server-shared/api/navigation';
import { mockAppState, mockLoggedInUser, mockRouter } from '~sq-server-shared/helpers/testMocks';
import { renderComponent } from '~sq-server-shared/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-shared/sonar-aligned/helpers/testSelector';
import { queryToSearchString } from '~sq-server-shared/sonar-aligned/helpers/urls';
import { ComponentQualifier, Visibility } from '~sq-server-shared/sonar-aligned/types/component';
import { FCProps } from '~sq-server-shared/types/misc';
import { LoggedInUser } from '~sq-server-shared/types/users';
import { ApplicationCreation } from '../ApplicationCreation';

jest.mock('~sq-server-shared/api/application', () => ({
  createApplication: jest.fn().mockResolvedValue({}),
}));
jest.mock('~sq-server-shared/api/navigation', () => ({
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
    breadcrumbs: [{ key: 'b-key', qualifier: 'qual', name: 'b-name' }],
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
