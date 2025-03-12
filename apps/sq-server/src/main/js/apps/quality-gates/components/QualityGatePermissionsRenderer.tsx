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

import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import {
  ButtonSecondary,
  DangerButtonPrimary,
  Modal,
  Spinner,
  SubTitle,
  Table,
  TableRowInteractive,
} from '~design-system';
import { translate } from '~sq-server-shared/helpers/l10n';
import { Group, isUser } from '~sq-server-shared/types/quality-gates';
import { QualityGate } from '~sq-server-shared/types/types';
import { UserBase } from '~sq-server-shared/types/users';
import PermissionItem from './PermissionItem';
import QualityGatePermissionsAddModal from './QualityGatePermissionsAddModal';

export interface QualityGatePermissionsRendererProps {
  groups: Group[];
  loading: boolean;
  onClickAddPermission: () => void;
  onClickDeletePermission: (item: UserBase | Group) => void;
  onCloseAddPermission: () => void;
  onCloseDeletePermission: () => void;
  onConfirmDeletePermission: (item: UserBase | Group) => void;
  onSubmitAddPermission: (item: UserBase | Group) => void;
  permissionToDelete?: UserBase | Group;
  qualityGate: QualityGate;
  showAddModal: boolean;
  submitting: boolean;
  users: UserBase[];
}

export default function QualityGatePermissionsRenderer(props: QualityGatePermissionsRendererProps) {
  const { groups, loading, permissionToDelete, qualityGate, showAddModal, submitting, users } =
    props;

  return (
    <div data-testid="quality-gate-permissions">
      <SubTitle as="h3" className="sw-typo-lg-semibold">
        {translate('quality_gates.permissions')}
      </SubTitle>
      <p className="sw-typo-default">{translate('quality_gates.permissions.help')}</p>
      <div className={classNames({ 'sw-my-2': users.length + groups.length > 0 })}>
        <Spinner loading={loading}>
          <Table columnCount={3} columnWidths={['40px', 'auto', '1%']} width="100%">
            {users.map((user) => (
              <TableRowInteractive key={user.login}>
                <PermissionItem item={user} onClickDelete={props.onClickDeletePermission} />
              </TableRowInteractive>
            ))}
            {groups.map((group) => (
              <TableRowInteractive key={group.name}>
                <PermissionItem item={group} onClickDelete={props.onClickDeletePermission} />
              </TableRowInteractive>
            ))}
          </Table>
        </Spinner>
      </div>

      <ButtonSecondary className="sw-mt-2" onClick={props.onClickAddPermission}>
        {translate('quality_gates.permissions.grant')}
      </ButtonSecondary>

      {showAddModal && (
        <QualityGatePermissionsAddModal
          onClose={props.onCloseAddPermission}
          onSubmit={props.onSubmitAddPermission}
          qualityGate={qualityGate}
          submitting={submitting}
        />
      )}

      {permissionToDelete && (
        <Modal
          body={
            <FormattedMessage
              defaultMessage={
                isUser(permissionToDelete)
                  ? translate('quality_gates.permissions.remove.user.confirmation')
                  : translate('quality_gates.permissions.remove.group.confirmation')
              }
              id="remove.confirmation"
              values={{
                user: <strong>{permissionToDelete.name}</strong>,
              }}
            />
          }
          headerTitle={
            isUser(permissionToDelete)
              ? translate('quality_gates.permissions.remove.user')
              : translate('quality_gates.permissions.remove.group')
          }
          onClose={props.onCloseDeletePermission}
          primaryButton={
            <DangerButtonPrimary
              onClick={() => props.onConfirmDeletePermission(permissionToDelete)}
            >
              {translate('remove')}
            </DangerButtonPrimary>
          }
        />
      )}
    </div>
  );
}
