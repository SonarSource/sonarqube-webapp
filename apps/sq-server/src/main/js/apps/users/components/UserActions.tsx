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

import {
  ButtonIcon,
  ButtonVariety,
  DropdownMenu,
  IconMoreVertical,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import { Provider } from '~sq-server-shared/types/types';
import { RestUserDetailed, isUserActive } from '~sq-server-shared/types/users';
import DeactivateForm from './DeactivateForm';
import PasswordForm from './PasswordForm';
import UserForm from './UserForm';

interface Props {
  manageProvider: Provider | undefined;
  user: RestUserDetailed;
}

export default function UserActions(props: Readonly<Props>) {
  const { user, manageProvider } = props;

  const [openForm, setOpenForm] = React.useState<string | undefined>(undefined);

  const isInstanceManaged = manageProvider !== undefined;

  const isUserLocal = isInstanceManaged && !user.managed;

  return (
    <>
      <DropdownMenu
        items={
          <>
            <UserForm isInstanceManaged={isInstanceManaged} user={user}>
              <DropdownMenu.ItemButton
                className="it__user-update"
                key="update"
                onClick={() => {
                  setOpenForm('update');
                }}
              >
                {isInstanceManaged ? translate('update_scm') : translate('update_details')}
              </DropdownMenu.ItemButton>
            </UserForm>

            {user.local && (
              <PasswordForm user={user}>
                <DropdownMenu.ItemButton className="it__user-change-password" key="change_password">
                  {translate('my_profile.password.title')}
                </DropdownMenu.ItemButton>
              </PasswordForm>
            )}
            {isUserActive(user) && !isInstanceManaged && <DropdownMenu.Separator key="separator" />}

            {isUserActive(user) && (!isInstanceManaged || isUserLocal) && (
              <DropdownMenu.ItemButtonDestructive
                className="it__user-deactivate"
                key="deactivate"
                onClick={() => {
                  setOpenForm('deactivate');
                }}
              >
                {translate('users.deactivate')}
              </DropdownMenu.ItemButtonDestructive>
            )}
          </>
        }
      >
        <ButtonIcon
          Icon={IconMoreVertical}
          ariaLabel={translateWithParameters('users.manage_user', user.login)}
          className="it__user-actions-toggle"
          id={`user-settings-action-dropdown-${user.login}`}
          variety={ButtonVariety.DefaultGhost}
        />
      </DropdownMenu>

      {openForm === 'deactivate' && isUserActive(user) && (
        <DeactivateForm
          onClose={() => {
            setOpenForm(undefined);
          }}
          user={user}
        />
      )}
    </>
  );
}
