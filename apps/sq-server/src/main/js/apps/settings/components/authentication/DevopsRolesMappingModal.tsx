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
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconDelete,
  Spinner,
  cssVar,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import {
  Checkbox,
  ContentCell,
  FlagMessage,
  FormField,
  InputField,
  Modal,
  Table,
  TableRow,
  TableRowInteractive,
} from '~design-system';
import { PermissionHeader } from '~sq-server-commons/components/permissions/PermissionHeader';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
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

  const setMapping = () => {
    props.setMapping(list?.filter((r) => r.role !== role) ?? null);
  };

  return (
    <TableRowInteractive>
      <ContentCell className="sw-whitespace-nowrap" scope="row">
        <div className="sw-flex sw-max-w-[330px] sw-items-center">
          <b className={baseRole ? 'sw-capitalize' : 'sw-truncate'} title={role}>
            {role}
          </b>

          {!baseRole && (
            <ButtonIcon
              Icon={IconDelete}
              ariaLabel={translateWithParameters(
                'settings.authentication.configuration.roles_mapping.dialog.delete_custom_role',
                role,
              )}
              className="sw-ml-1"
              onClick={setMapping}
              size={ButtonSize.Medium}
              variety={ButtonVariety.DangerGhost}
            />
          )}
        </div>
      </ContentCell>
      {Object.entries(mapping.permissions).map(([key, value]) => (
        <ContentCell className="sw-justify-center" key={key}>
          <Checkbox
            checked={value}
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
        </ContentCell>
      ))}
    </TableRowInteractive>
  );
}

export function DevopsRolesMappingModal(props: Readonly<Props>) {
  const { isLoading, mapping, mappingFor, onClose, roles, setMapping } = props;
  const permissions = convertToPermissionDefinitions(
    PERMISSIONS_ORDER_FOR_PROJECT_TEMPLATE,
    'projects_role',
  );
  const [customRoleInput, setCustomRoleInput] = React.useState('');
  const [customRoleError, setCustomRoleError] = React.useState(false);

  const header = translateWithParameters(
    'settings.authentication.configuration.roles_mapping.dialog.title',
    translate('alm', mappingFor),
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
        columnCount={permissions.length + 1}
        columnWidths={['auto', ...Array(permissions.length).fill('1%')]}
        header={
          <TableRow
            className="sw-sticky sw-top-0"
            style={{ backgroundColor: cssVar('color-surface-default') }}
          >
            <ContentCell className="sw-whitespace-nowrap">
              {translate('settings.authentication.configuration.roles_mapping.dialog.roles_column')}
            </ContentCell>
            {permissions.map((permission) => (
              <PermissionHeader
                key={isPermissionDefinitionGroup(permission) ? permission.category : permission.key}
                permission={permission}
              />
            ))}
          </TableRow>
        }
        noHeaderTopBorder
      >
        {list
          ?.filter((r) => r.baseRole)
          .map((mapping) => (
            <PermissionRow key={mapping.id} list={list} mapping={mapping} setMapping={setMapping} />
          ))}
        <TableRow>
          <ContentCell colSpan={7}>
            <div className="sw-flex sw-items-end">
              <form className="sw-flex sw-items-end" onSubmit={validateAndAddCustomRole}>
                <FormField
                  htmlFor="custom-role-input"
                  label={translate(
                    'settings.authentication.configuration.roles_mapping.dialog.add_custom_role',
                  )}
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
                  className="sw-ml-2 sw-mr-4"
                  isDisabled={customRoleInput.trim() === '' || customRoleError}
                  type="submit"
                >
                  {translate('add_verb')}
                </Button>
              </form>
              {customRoleError && (
                <FlagMessage variant="error">
                  {translate('settings.authentication.configuration.roles_mapping.role_exists')}
                </FlagMessage>
              )}
            </div>
          </ContentCell>
        </TableRow>

        {list
          ?.filter((r) => !r.baseRole)
          .map((mapping) => (
            <PermissionRow key={mapping.id} list={list} mapping={mapping} setMapping={setMapping} />
          ))}
      </Table>
      <FlagMessage variant="info">
        {translate(
          'settings.authentication',
          mappingFor,
          'configuration.roles_mapping.dialog.custom_roles_description',
        )}
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
                {translate('settings.authentication.configuration.roles_mapping.empty_custom_role')}
              </FlagMessage>
            )}
            <Button isDisabled={haveEmptyCustomRoles} onClick={onClose}>
              {translate('close')}
            </Button>
          </div>
        }
      />
    </Modal>
  );
}
