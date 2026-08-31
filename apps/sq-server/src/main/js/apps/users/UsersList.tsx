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

import { ToggleTip } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { ActionCell, ContentCell, TableRow } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { IdentityProvider, Provider } from '~sq-server-commons/types/types';
import { RestUserDetailed } from '~sq-server-commons/types/users';
import { StickyTable } from '../../app/components/admin/StickyTable';
import UserListItem from './components/UserListItem';

interface Props {
  identityProviders: IdentityProvider[];
  manageProvider: Provider | undefined;
  users: RestUserDetailed[];
}

export default function UsersList({ identityProviders, users, manageProvider }: Props) {
  const header = (
    <TableRow>
      <ContentCell>
        <FormattedMessage id="users.user_name" />
      </ContentCell>
      <ContentCell>
        <FormattedMessage id="my_profile.scm_accounts" />
      </ContentCell>
      <ContentCell>
        <FormattedMessage id="users.last_connection" />
      </ContentCell>
      <ContentCell>
        <FormattedMessage id="users.last_sonarlint_connection" />

        <ToggleTip
          description={<FormattedMessage id="users.last_sonarlint_connection.help_text" />}
        />
      </ContentCell>
      <ContentCell>
        <FormattedMessage id="my_profile.groups" />
      </ContentCell>
      <ContentCell>
        <FormattedMessage id="users.tokens" />
      </ContentCell>

      {(!isDefined(manageProvider) || users.some((u) => !u.managed)) && (
        <ActionCell>
          <FormattedMessage id="actions" />
        </ActionCell>
      )}
    </TableRow>
  );

  return (
    <StickyTable columnCount={7} header={header} id="users-list" overrideTop={-1}>
      {users.map((user) => (
        <UserListItem
          identityProvider={identityProviders.find(
            (provider) => user.externalProvider === provider.key,
          )}
          key={user.login}
          manageProvider={manageProvider}
          user={user}
        />
      ))}
    </StickyTable>
  );
}
