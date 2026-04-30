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

import {
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconDelete,
  MessageCallout,
  Modal,
  ModalSize,
  Spinner,
  Table,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { PermissionHeader } from '~sq-server-commons/components/permissions/PermissionHeader';
import {
  PERMISSIONS_ORDER_FOR_PROJECT_TEMPLATE,
  convertToPermissionDefinitions,
  isPermissionDefinitionGroup,
} from '~sq-server-commons/helpers/permissions';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { DevopsRolesMapping } from '~sq-server-commons/types/provisioning';

interface Props {
  isLoading: boolean;
  isSaving: boolean;
  mappingFor: AlmKeys.GitHub | AlmKeys.GitLab;
  onClose: () => void;
  onSave: (mapping: DevopsRolesMapping[]) => Promise<void>;
  roles?: DevopsRolesMapping[] | null;
}

interface PermissionCellProps {
  list?: DevopsRolesMapping[];
  mapping: DevopsRolesMapping;
  setMapping: React.Dispatch<React.SetStateAction<DevopsRolesMapping[] | null>>;
}

const DEFAULT_CUSTOM_ROLE_PERMISSIONS: DevopsRolesMapping['permissions'] = {
  user: true,
  codeViewer: false,
  issueAdmin: false,
  securityHotspotAdmin: false,
  admin: false,
  scan: false,
};

function PermissionRow(props: Readonly<PermissionCellProps>) {
  const { list, mapping, setMapping } = props;
  const { role, baseRole } = mapping;
  const intl = useIntl();

  const deleteRole = () => {
    setMapping(list?.filter((r) => r.role !== role) ?? []);
  };

  return (
    <Table.Row>
      <Table.Cell
        className="sw-whitespace-nowrap"
        style={{
          textAlign: 'left',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
        }}
      >
        <div className="sw-flex sw-max-w-[330px] sw-items-center sw-justify-start sw-w-full">
          <b className={baseRole ? 'sw-capitalize' : 'sw-truncate'} title={role}>
            {role}
          </b>

          {!baseRole && (
            <ButtonIcon
              Icon={IconDelete}
              ariaLabel={intl.formatMessage(
                {
                  id: 'settings.authentication.configuration.roles_mapping.dialog.delete_custom_role',
                },
                { 0: role },
              )}
              className="sw-ml-1"
              onClick={deleteRole}
              size={ButtonSize.Medium}
              variety={ButtonVariety.DangerGhost}
            />
          )}
        </div>
      </Table.Cell>
      {Object.entries(mapping.permissions).map(([key, value]) => (
        <Table.CellCheckbox
          ariaLabel={`Toggle ${key} permission for ${role}`}
          checked={value}
          id={`${mapping.id}-${key}`}
          key={key}
          onCheck={(newValue) => {
            setMapping(
              list?.map((item) =>
                item.id === mapping.id
                  ? { ...item, permissions: { ...item.permissions, [key]: newValue } }
                  : item,
              ) ?? [],
            );
          }}
        />
      ))}
    </Table.Row>
  );
}

export function DevopsRolesMappingModal(props: Readonly<Props>) {
  const { isLoading, isSaving, mappingFor, onClose, onSave, roles } = props;
  const intl = useIntl();

  const permissions = convertToPermissionDefinitions(
    PERMISSIONS_ORDER_FOR_PROJECT_TEMPLATE,
    'projects_role',
  );
  const [editedMapping, setEditedMapping] = React.useState<DevopsRolesMapping[] | null>(null);
  const [customRoleInput, setCustomRoleInput] = React.useState('');
  const [customRoleError, setCustomRoleError] = React.useState(false);

  const header = intl.formatMessage(
    { id: 'settings.authentication.configuration.roles_mapping.dialog.title' },
    { 0: intl.formatMessage({ id: `alm.${mappingFor}` }) },
  );

  const list = editedMapping ?? roles ?? [];

  const validateAndAddCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    const value = customRoleInput.trim();
    if (
      list.some((el) =>
        el.baseRole ? el.role.toLowerCase() === value.toLowerCase() : el.role === value,
      )
    ) {
      setCustomRoleError(true);
    } else {
      setEditedMapping([
        {
          id: customRoleInput,
          role: customRoleInput,
          permissions: { ...DEFAULT_CUSTOM_ROLE_PERMISSIONS },
        },
        ...list,
      ]);
      setCustomRoleInput('');
    }
  };

  const haveEmptyCustomRoles = list.some(
    (el) => !el.baseRole && !Object.values(el.permissions).some(Boolean),
  );

  const formBody = (
    <div className="sw-p-0">
      <Table
        ariaLabel={header}
        gridTemplate={`auto ${Array(permissions.length).fill('1fr').join(' ')}`}
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell
              label={intl.formatMessage({
                id: 'settings.authentication.configuration.roles_mapping.dialog.roles_column',
              })}
            />
            {permissions.map((permission) => (
              <PermissionHeader
                key={isPermissionDefinitionGroup(permission) ? permission.category : permission.key}
                permission={permission}
              />
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {list
            .filter((r) => r.baseRole)
            .map((mapping) => (
              <PermissionRow
                key={mapping.id}
                list={list}
                mapping={mapping}
                setMapping={setEditedMapping}
              />
            ))}
          <Table.Row>
            <Table.Cell style={{ gridColumn: `1 / -1`, justifyContent: 'flex-start' }}>
              <div className="sw-flex sw-items-end">
                <form className="sw-flex sw-items-end" onSubmit={validateAndAddCustomRole}>
                  <TextInput
                    className="sw-w-[300px]"
                    id="custom-role-input"
                    label={intl.formatMessage({
                      id: 'settings.authentication.configuration.roles_mapping.dialog.add_custom_role',
                    })}
                    maxLength={4000}
                    onChange={(event) => {
                      setCustomRoleError(false);
                      setCustomRoleInput(event.currentTarget.value);
                    }}
                    type="text"
                    value={customRoleInput}
                  />
                  <Button
                    className="sw-ml-2 sw-mr-4 sw-w-full"
                    isDisabled={customRoleInput.trim() === '' || customRoleError}
                    type="submit"
                  >
                    {intl.formatMessage({ id: 'add_verb' })}
                  </Button>
                </form>
                {customRoleError && (
                  <MessageCallout variety="danger">
                    {intl.formatMessage({
                      id: 'settings.authentication.configuration.roles_mapping.role_exists',
                    })}
                  </MessageCallout>
                )}
              </div>
            </Table.Cell>
          </Table.Row>

          {list
            .filter((r) => !r.baseRole)
            .map((mapping) => (
              <PermissionRow
                key={mapping.id}
                list={list}
                mapping={mapping}
                setMapping={setEditedMapping}
              />
            ))}
        </Table.Body>
      </Table>
      <MessageCallout variety="info">
        {intl.formatMessage({
          id: `settings.authentication.${mappingFor}.configuration.roles_mapping.dialog.custom_roles_description`,
        })}
      </MessageCallout>

      <Spinner isLoading={isLoading} />
    </div>
  );

  return (
    <Modal
      content={formBody}
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
      primaryButton={
        <div className="sw-flex sw-items-center sw-justify-end sw-gap-2">
          {haveEmptyCustomRoles && (
            <MessageCallout variety="danger">
              <FormattedMessage id="settings.authentication.configuration.roles_mapping.empty_custom_role" />
            </MessageCallout>
          )}
          <Button
            isDisabled={haveEmptyCustomRoles || isSaving}
            isLoading={isSaving}
            onClick={() => {
              void onSave(list);
            }}
            variety={ButtonVariety.Primary}
          >
            <FormattedMessage id="save" />
          </Button>
        </div>
      }
      secondaryButton={
        <Button isDisabled={isSaving} onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
      }
      size={ModalSize.Wide}
      title={header}
    />
  );
}
