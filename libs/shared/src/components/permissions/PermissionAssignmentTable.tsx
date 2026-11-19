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

import { cssVar, Table, TableVariety } from '@sonarsource/echoes-react';

export interface PermissionPrincipal {
  id: string;
  name: string;
  description?: string;
  type: 'group' | 'user';
}

export interface PermissionAssignment {
  principalId: string;
  principalType: PermissionPrincipal['type'];
  permissions: string[];
}

interface Props {
  ariaLabel: string;
  principalColumnLabel: string;
  principals: PermissionPrincipal[];
  permissions: { key: string; name: string; selectAllLabel: string }[];
  selection: {
    permission: string;
    allLabel: string;
    principalLabel: (principal: PermissionPrincipal) => string;
  };
  value: PermissionAssignment[];
  onChange: (value: PermissionAssignment[]) => void;
}

/** A controlled permission matrix; the caller owns fetching, paging, and draft state. */
export function PermissionAssignmentTable({
  ariaLabel,
  principalColumnLabel,
  principals,
  permissions,
  selection,
  value,
  onChange,
}: Readonly<Props>) {
  function getAssignment(principal: PermissionPrincipal) {
    return value.find(
      (item) => item.principalId === principal.id && item.principalType === principal.type,
    );
  }

  function selectPrincipals(selectedPrincipals: PermissionPrincipal[]) {
    const unassigned = selectedPrincipals.filter(
      (principal) => !getAssignment(principal)?.permissions.length,
    );
    changePermission(unassigned, selection.permission, true);
  }

  function clearPrincipals(selectedPrincipals: PermissionPrincipal[]) {
    onChange(
      value.filter(
        (assignment) =>
          !selectedPrincipals.some(
            (principal) =>
              assignment.principalId === principal.id &&
              assignment.principalType === principal.type,
          ),
      ),
    );
  }

  function changePermission(
    selectedPrincipals: PermissionPrincipal[],
    permission: string,
    checked: boolean,
  ) {
    const next = value.filter(
      (assignment) =>
        !selectedPrincipals.some(
          (principal) =>
            assignment.principalId === principal.id && assignment.principalType === principal.type,
        ),
    );
    for (const principal of selectedPrincipals) {
      const selected = getAssignment(principal)?.permissions ?? [];
      const permissions = selected.filter((key) => key !== permission);
      if (checked) {
        permissions.push(permission);
      }
      if (permissions.length > 0) {
        next.push({ principalId: principal.id, principalType: principal.type, permissions });
      }
    }
    onChange(next);
  }

  const selectedPrincipalCount = principals.filter(
    (principal) => getAssignment(principal)?.permissions.length,
  ).length;

  return (
    <Table
      ariaLabel={ariaLabel}
      gridTemplate={`48px minmax(200px, 2fr) repeat(${permissions.length}, minmax(100px, 1fr))`}
      style={{ borderColor: cssVar('color-border-weak') }}
      variety={TableVariety.Surface}
    >
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCellCheckbox
            ariaLabel={selection.allLabel}
            checked={getSelectionState(selectedPrincipalCount, principals.length)}
            isDisabled={principals.length === 0}
            onCheck={(checked) => {
              const updateSelection = checked === true ? selectPrincipals : clearPrincipals;
              updateSelection(principals);
            }}
          />
          <Table.ColumnHeaderCell label={principalColumnLabel} />
          {permissions.map((permission) => {
            const selectedCount = principals.filter((principal) =>
              value.some(
                (item) =>
                  item.principalId === principal.id &&
                  item.principalType === principal.type &&
                  item.permissions.includes(permission.key),
              ),
            ).length;
            return (
              <Table.ColumnHeaderCellCheckbox
                ariaLabel={permission.selectAllLabel}
                cellClassName="sw:justify-center sw:items-center sw:text-center"
                checked={getSelectionState(selectedCount, principals.length)}
                innerClassName="sw:flex-col-reverse sw:items-center sw:gap-2"
                isDisabled={principals.length === 0}
                key={permission.key}
                label={permission.name}
                onCheck={(checked) => {
                  changePermission(principals, permission.key, checked === true);
                }}
              />
            );
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {principals.map((principal) => {
          const assignment = getAssignment(principal);
          return (
            <Table.Row
              key={`${principal.type}-${principal.id}`}
              selected={Boolean(assignment?.permissions.length)}
            >
              <Table.CellCheckbox
                ariaLabel={selection.principalLabel(principal)}
                checked={Boolean(assignment?.permissions.length)}
                onCheck={(checked) => {
                  const updateSelection = checked === true ? selectPrincipals : clearPrincipals;
                  updateSelection([principal]);
                }}
              />
              <Table.RowHeaderCell content={principal.name} description={principal.description} />
              {permissions.map((permission) => (
                <Table.CellCheckbox
                  ariaLabel={`${principal.name}: ${permission.name}`}
                  checked={assignment?.permissions.includes(permission.key) ?? false}
                  key={permission.key}
                  onCheck={(checked) => {
                    changePermission([principal], permission.key, checked === true);
                  }}
                />
              ))}
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

function getSelectionState(selectedCount: number, total: number) {
  if (selectedCount === 0) {
    return false;
  }
  return selectedCount === total ? true : 'indeterminate';
}
