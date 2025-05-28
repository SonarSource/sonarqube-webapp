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

import { Checkbox, Table } from '@sonarsource/echoes-react';
import { translateWithParameters } from '../../helpers/l10n';
import { isPermissionDefinitionGroup } from '../../helpers/permissions';
import {
  PermissionDefinition,
  PermissionDefinitionGroup,
  PermissionGroup,
  PermissionUser,
} from '../../types/types';

export interface PermissionCellProps {
  disabled?: boolean;
  loading: string[];
  onCheck: (checked: boolean, permission?: string) => void;
  permission: PermissionDefinition | PermissionDefinitionGroup;
  permissionItem: PermissionGroup | PermissionUser;
  prefixID: string;
  removeOnly?: boolean;
}

export default function PermissionCell(props: Readonly<PermissionCellProps>) {
  const { disabled, loading, onCheck, permission, permissionItem, removeOnly, prefixID } = props;

  if (isPermissionDefinitionGroup(permission)) {
    return (
      <Table.Cell>
        <div className="sw-flex sw-flex-col sw-text-left">
          {permission.permissions.map((permissionDefinition) => {
            const isChecked = permissionItem.permissions.includes(permissionDefinition.key);
            const isDisabled = disabled || loading.includes(permissionDefinition.key);

            return (
              <div key={permissionDefinition.key}>
                <Checkbox
                  ariaLabel={translateWithParameters(
                    'permission.assign_x_to_y',
                    permissionDefinition.name,
                    permissionItem.name,
                  )}
                  checked={isChecked}
                  id={`${permissionDefinition.key}`}
                  isDisabled={isDisabled || (!isChecked && removeOnly)}
                  label={permissionDefinition.name}
                  onCheck={() => {
                    onCheck(isChecked, permissionDefinition.key);
                  }}
                />
              </div>
            );
          })}
        </div>
      </Table.Cell>
    );
  }

  const isChecked = permissionItem.permissions.includes(permission.key);
  const isDisabled = disabled || loading.includes(permission.key);

  return (
    <Table.CellCheckbox
      aria-disabled={isDisabled || (!isChecked && removeOnly)}
      ariaLabel={translateWithParameters(
        'permission.assign_x_to_y',
        permission.name,
        permissionItem.name,
      )}
      checked={isChecked}
      id={`${prefixID}-${permission.key}`}
      isDisabled={isDisabled || (!isChecked && removeOnly)}
      onCheck={() => {
        onCheck(isChecked, permission.key);
      }}
    />
  );
}
