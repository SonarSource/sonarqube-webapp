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
  ButtonSize,
  ButtonVariety,
  IconMoreVertical,
  Spinner,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { ActionCell, Avatar, ContentCell, TableRow } from '~design-system';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { useUserGroupsCountQuery } from '~sq-server-commons/queries/group-memberships';
import { useUserTokensQuery } from '~sq-server-commons/queries/users';
import { IdentityProvider, Provider } from '~sq-server-commons/types/types';
import { RestUserDetailed } from '~sq-server-commons/types/users';
import GroupsForm from './GroupsForm';
import TokensFormModal from './TokensFormModal';
import UserActions from './UserActions';
import UserListItemIdentity from './UserListItemIdentity';
import UserScmAccounts from './UserScmAccounts';
import ViewGroupsModal from './ViewGroupsModal';

export interface UserListItemProps {
  identityProvider?: IdentityProvider;
  manageProvider: Provider | undefined;
  user: RestUserDetailed;
}

export default function UserListItem(props: Readonly<UserListItemProps>) {
  const { identityProvider, user, manageProvider } = props;
  const {
    id,
    name,
    login,
    avatar,
    sonarQubeLastConnectionDate,
    sonarLintLastConnectionDate,
    scmAccounts,
  } = user;

  const [openTokenForm, setOpenTokenForm] = React.useState(false);
  const [openGroupForm, setOpenGroupForm] = React.useState(false);
  const { data: tokens, isLoading: tokensAreLoading } = useUserTokensQuery(login);
  const { data: groupsCount, isLoading: groupsAreLoading } = useUserGroupsCountQuery(id);

  return (
    <TableRow>
      <ContentCell>
        <div className="sw-flex sw-items-center">
          <Avatar className="sw-shrink-0 sw-mr-4" hash={avatar} name={name} size="md" />
          <UserListItemIdentity
            identityProvider={identityProvider}
            manageProvider={manageProvider}
            user={user}
          />
        </div>
      </ContentCell>
      <ContentCell>
        <UserScmAccounts scmAccounts={scmAccounts || []} />
      </ContentCell>
      <ContentCell>
        <DateFromNow date={sonarQubeLastConnectionDate ?? ''} hourPrecision />
      </ContentCell>
      <ContentCell>
        <DateFromNow date={sonarLintLastConnectionDate ?? ''} hourPrecision />
      </ContentCell>
      <ContentCell>
        <Spinner isLoading={groupsAreLoading}>
          {groupsCount}
          <ButtonIcon
            Icon={IconMoreVertical}
            ariaLabel={translateWithParameters(
              manageProvider === undefined
                ? 'users.update_users_groups'
                : 'users.view_users_groups',
              user.login,
            )}
            className="it__user-groups sw-ml-2"
            onClick={() => {
              setOpenGroupForm(true);
            }}
            size={ButtonSize.Medium}
            tooltipContent={
              manageProvider === undefined
                ? translate('users.update_groups')
                : translate('users.view_groups')
            }
            variety={ButtonVariety.DefaultGhost}
          />
        </Spinner>
      </ContentCell>
      <ContentCell>
        <Spinner isLoading={tokensAreLoading}>
          {tokens?.length}

          <ButtonIcon
            Icon={IconMoreVertical}
            ariaLabel={translateWithParameters('users.update_tokens_for_x', name ?? login)}
            className="it__user-tokens sw-ml-2"
            onClick={() => {
              setOpenTokenForm(true);
            }}
            size={ButtonSize.Medium}
            tooltipContent={translateWithParameters('users.update_tokens')}
            variety={ButtonVariety.DefaultGhost}
          />
        </Spinner>
      </ContentCell>

      <ActionCell>
        <UserActions manageProvider={manageProvider} user={user} />
      </ActionCell>

      {openTokenForm && (
        <TokensFormModal
          onClose={() => {
            setOpenTokenForm(false);
          }}
          user={user}
        />
      )}
      {openGroupForm && manageProvider === undefined && (
        <GroupsForm
          onClose={() => {
            setOpenGroupForm(false);
          }}
          user={user}
        />
      )}
      {openGroupForm && manageProvider !== undefined && (
        <ViewGroupsModal
          onClose={() => {
            setOpenGroupForm(false);
          }}
          user={user}
        />
      )}
    </TableRow>
  );
}
