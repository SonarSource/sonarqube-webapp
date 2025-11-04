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
  Spinner,
  Table,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { FlagMessage, FormField, InputField, Modal } from '~design-system';
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
  mapping: DevopsRolesMapping[] | null;
  mappingFor: AlmKeys.GitHub | AlmKeys.GitLab;
  onClose: () => void;
  roles?: DevopsRolesMapping[] | null;
  setMapping: React.Dispatch<React.SetStateAction<DevopsRolesMapping[] | null>>;
}

interface PermissionCellProps extends Pick<Props, 'setMapping'> {
  list?: DevopsRolesMapping[];
  mapping: DevopsRolesMapping;
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
  const { list, mapping } = props;
  const { role, baseRole } = mapping;
  const intl = useIntl();

  const setMapping = () => {
    props.setMapping(list?.filter((r) => r.role !== role) ?? null);
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
              onClick={setMapping}
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
            props.setMapping(
              list?.map((item) =>
                item.id === mapping.id
                  ? { ...item, permissions: { ...item.permissions, [key]: newValue } }
                  : item,
              ) ?? null,
            );
          }}
        />
      ))}
    </Table.Row>
  );
}

export function DevopsRolesMappingModal(props: Readonly<Props>) {
  const { isLoading, mapping, mappingFor, onClose, roles, setMapping } = props;
  const intl = useIntl();

  const permissions = convertToPermissionDefinitions(
    PERMISSIONS_ORDER_FOR_PROJECT_TEMPLATE,
    'projects_role',
  );
  const [customRoleInput, setCustomRoleInput] = React.useState('');
  const [customRoleError, setCustomRoleError] = React.useState(false);

  const header = intl.formatMessage(
    { id: 'settings.authentication.configuration.roles_mapping.dialog.title' },
    { 0: intl.formatMessage({ id: `alm.${mappingFor}` }) },
  );

  const list = mapping ?? roles;

  const validateAndAddCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    const value = customRoleInput.trim();
    if (
      !list?.some((el) =>
        el.baseRole ? el.role.toLowerCase() === value.toLowerCase() : el.role === value,
      )
    ) {
      setMapping([
        {
          id: customRoleInput,
          role: customRoleInput,
          permissions: { ...DEFAULT_CUSTOM_ROLE_PERMISSIONS },
        },
        ...(list ?? []),
      ]);
      setCustomRoleInput('');
    } else {
      setCustomRoleError(true);
    }
  };

  const haveEmptyCustomRoles = !!mapping?.some(
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
            ?.filter((r) => r.baseRole)
            .map((mapping) => (
              <PermissionRow
                key={mapping.id}
                list={list}
                mapping={mapping}
                setMapping={setMapping}
              />
            ))}
          <Table.Row>
            <Table.Cell style={{ gridColumn: `1 / -1`, justifyContent: 'flex-start' }}>
              <div className="sw-flex sw-items-end">
                <form className="sw-flex sw-items-end" onSubmit={validateAndAddCustomRole}>
                  <FormField
                    htmlFor="custom-role-input"
                    label={intl.formatMessage({
                      id: 'settings.authentication.configuration.roles_mapping.dialog.add_custom_role',
                    })}
                  >
                    <InputField
                      className="sw-w-[300px]"
                      id="custom-role-input"
                      maxLength={4000}
                      onChange={(event) => {
                        setCustomRoleError(false);
                        setCustomRoleInput(event.currentTarget.value);
                      }}
                      type="text"
                      value={customRoleInput}
                    />
                  </FormField>
                  <Button
                    className="sw-ml-2 sw-mr-4 sw-w-full"
                    isDisabled={customRoleInput.trim() === '' || customRoleError}
                    type="submit"
                  >
                    {intl.formatMessage({ id: 'add_verb' })}
                  </Button>
                </form>
                {customRoleError && (
                  <FlagMessage variant="error">
                    {intl.formatMessage({
                      id: 'settings.authentication.configuration.roles_mapping.role_exists',
                    })}
                  </FlagMessage>
                )}
              </div>
            </Table.Cell>
          </Table.Row>

          {list
            ?.filter((r) => !r.baseRole)
            .map((mapping) => (
              <PermissionRow
                key={mapping.id}
                list={list}
                mapping={mapping}
                setMapping={setMapping}
              />
            ))}
        </Table.Body>
      </Table>
      <FlagMessage variant="info">
        {intl.formatMessage({
          id: `settings.authentication.${mappingFor}.configuration.roles_mapping.dialog.custom_roles_description`,
        })}
      </FlagMessage>

      <Spinner isLoading={isLoading} />
    </div>
  );

  return (
    <Modal closeOnOverlayClick={!haveEmptyCustomRoles} isLarge onClose={onClose}>
      <Modal.Header title={header} />
      <Modal.Body>{formBody}</Modal.Body>
      <Modal.Footer
        secondaryButton={
          <div className="sw-flex sw-items-center sw-justify-end sw-mt-2">
            {haveEmptyCustomRoles && (
              <FlagMessage className="sw-inline-block sw-mb-0 sw-mr-2" variant="error">
                {intl.formatMessage({
                  id: 'settings.authentication.configuration.roles_mapping.empty_custom_role',
                })}
              </FlagMessage>
            )}
            <Button isDisabled={haveEmptyCustomRoles} onClick={onClose}>
              {intl.formatMessage({ id: 'close' })}
            </Button>
          </div>
        }
      />
    </Modal>
  );
}
