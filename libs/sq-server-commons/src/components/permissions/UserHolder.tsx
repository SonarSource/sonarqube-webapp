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

import { IconPeople, Table } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { Avatar } from '../../design-system';
import { isPermissionDefinitionGroup } from '../../helpers/permissions';
import { PermissionDefinitions, PermissionUser } from '../../types/types';
import { IntegrationIcon } from './IntegrationIcon';
import PermissionCell from './PermissionCell';
import usePermissionChange from './usePermissionChange';

interface Props {
  isGitHubUser: boolean | undefined;
  isGitLabUser: boolean | undefined;
  onToggle: (user: PermissionUser, permission: string) => Promise<void>;
  permissions: PermissionDefinitions;
  removeOnly?: boolean;
  user: PermissionUser;
}

export default function UserHolder(props: Props) {
  const { user, removeOnly, permissions, isGitHubUser, isGitLabUser } = props;
  const { loading, handleCheck, modal } = usePermissionChange({
    holder: user,
    onToggle: props.onToggle,
    permissions,
    removeOnly,
  });

  const permissionCells = permissions.map((permission) => (
    <PermissionCell
      disabled={isGitHubUser || isGitLabUser}
      key={isPermissionDefinitionGroup(permission) ? permission.category : permission.key}
      loading={loading}
      onCheck={handleCheck}
      permission={permission}
      permissionItem={user}
      prefixID={user.login}
      removeOnly={removeOnly}
    />
  ));

  if (user.login === '<creator>') {
    return (
      <Table.Row>
        <Table.Cell className="sw-typo-lg">
          <IconPeople />
        </Table.Cell>
        <Table.CellText
          content={user.name}
          description={<FormattedMessage id="permission_templates.project_creators.explanation" />}
        />

        {permissionCells}
      </Table.Row>
    );
  }

  return (
    <Table.Row>
      <Table.Cell>
        <Avatar hash={user.avatar} name={user.name} size="sm" />
      </Table.Cell>

      <Table.CellText
        content={user.name}
        description={user.login}
        icon={<IntegrationIcon isGitHubUser={isGitHubUser} isGitLabUser={isGitLabUser} />}
      />

      {permissionCells}
      {modal}
    </Table.Row>
  );
}
