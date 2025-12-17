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

import { ActionCell, ContentCell, HelperHintIcon, TableRow } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import HelpTooltip from '~sq-server-commons/sonar-aligned/components/controls/HelpTooltip';
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
      <ContentCell>{translate('users.user_name')}</ContentCell>
      <ContentCell>{translate('my_profile.scm_accounts')}</ContentCell>
      <ContentCell>{translate('users.last_connection')}</ContentCell>
      <ContentCell>
        {translate('users.last_sonarlint_connection')}
        <HelpTooltip overlay={translate('users.last_sonarlint_connection.help_text')}>
          <HelperHintIcon />
        </HelpTooltip>
      </ContentCell>
      <ContentCell>{translate('my_profile.groups')}</ContentCell>
      <ContentCell>{translate('users.tokens')}</ContentCell>
      {(manageProvider === undefined || users.some((u) => !u.managed)) && (
        <ActionCell>{translate('actions')}</ActionCell>
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
