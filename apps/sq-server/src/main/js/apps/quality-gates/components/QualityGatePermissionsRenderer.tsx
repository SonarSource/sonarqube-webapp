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

import { Heading, Spinner } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { Table, TableRowInteractive } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Group } from '~sq-server-commons/types/quality-gates';
import { QualityGate } from '~sq-server-commons/types/types';
import { UserBase } from '~sq-server-commons/types/users';
import PermissionItem from './PermissionItem';
import QualityGatePermissionsAddModal from './QualityGatePermissionsAddModal';

export interface QualityGatePermissionsRendererProps {
  groups: Group[];
  loading: boolean;
  onConfirmDeletePermission: (item: UserBase | Group) => void;
  onSubmitAddPermission: (item: UserBase | Group) => void;
  qualityGate: QualityGate;
  submitting: boolean;
  users: UserBase[];
}

export default function QualityGatePermissionsRenderer(props: QualityGatePermissionsRendererProps) {
  const { groups, loading, qualityGate, submitting, users } = props;

  return (
    <div data-testid="quality-gate-permissions">
      <Heading as="h3" hasMarginBottom>
        {translate('quality_gates.permissions')}
      </Heading>
      <p className="sw-typo-default">{translate('quality_gates.permissions.help')}</p>
      <div className={classNames({ 'sw-my-2': users.length + groups.length > 0 })}>
        <Spinner isLoading={loading}>
          <Table columnCount={3} columnWidths={['40px', 'auto', '1%']} width="100%">
            {users.map((user) => (
              <TableRowInteractive key={user.login}>
                <PermissionItem item={user} onConfirmDelete={props.onConfirmDeletePermission} />
              </TableRowInteractive>
            ))}
            {groups.map((group) => (
              <TableRowInteractive key={group.name}>
                <PermissionItem item={group} onConfirmDelete={props.onConfirmDeletePermission} />
              </TableRowInteractive>
            ))}
          </Table>
        </Spinner>
      </div>

      <QualityGatePermissionsAddModal
        onSubmit={props.onSubmitAddPermission}
        qualityGate={qualityGate}
        submitting={submitting}
      />
    </div>
  );
}
