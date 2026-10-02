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

import { IconPeople, Table } from '@sonarsource/echoes-react';
import { isPermissionDefinitionGroup } from '../../helpers/permissions';
import { PermissionDefinitions, PermissionGroup } from '../../types/types';
import { IntegrationIcon } from './IntegrationIcon';
import PermissionCell from './PermissionCell';
import usePermissionChange from './usePermissionChange';

interface Props {
  group: PermissionGroup;
  isGitHubUser: boolean | undefined;
  isGitLabUser: boolean | undefined;
  onToggle: (group: PermissionGroup, permission: string) => Promise<void>;
  permissions: PermissionDefinitions;
  removeOnly?: boolean;
}

export default function GroupHolder(props: Props) {
  const { group, permissions, removeOnly, isGitHubUser, isGitLabUser } = props;
  const { loading, handleCheck, modal } = usePermissionChange({
    holder: group,
    onToggle: props.onToggle,
    permissions,
    removeOnly,
  });

  return (
    <Table.Row>
      <Table.Cell className="sw-typo-lg">
        <IconPeople />
      </Table.Cell>

      <Table.CellText
        content={group.name}
        description={group.description}
        icon={<IntegrationIcon isGitHubUser={isGitHubUser} isGitLabUser={isGitLabUser} />}
      />

      {permissions.map((permission) => {
        const isPermissionGroup = isPermissionDefinitionGroup(permission);
        const permissionKey = isPermissionGroup ? permission.category : permission.key;

        return (
          <PermissionCell
            disabled={isGitHubUser || isGitLabUser}
            key={permissionKey}
            loading={loading}
            onCheck={handleCheck}
            permission={permission}
            permissionItem={group}
            prefixID={group.name}
            removeOnly={removeOnly}
          />
        );
      })}
      {modal}
    </Table.Row>
  );
}
