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

import { Badge } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { isDefined } from '~shared/helpers/types';
import { ContentCell, TableRowInteractive, UserGroupIcon } from '../../design-system';
import { translate, translateWithParameters } from '../../helpers/l10n';
import { isPermissionDefinitionGroup } from '../../helpers/permissions';
import { Permissions } from '../../types/permissions';
import { PermissionDefinitions, PermissionGroup } from '../../types/types';
import PermissionCell from './PermissionCell';
import usePermissionChange from './usePermissionChange';

interface Props {
  group: PermissionGroup;
  isComponentPrivate?: boolean;
  isGitHubUser: boolean | undefined;
  isGitLabUser: boolean | undefined;
  onToggle: (group: PermissionGroup, permission: string) => Promise<void>;
  permissions: PermissionDefinitions;
  removeOnly?: boolean;
  selectedPermission?: string;
}

export const ANYONE = 'Anyone';

export default function GroupHolder(props: Props) {
  const {
    group,
    isComponentPrivate,
    permissions,
    selectedPermission,
    removeOnly,
    isGitHubUser,
    isGitLabUser,
  } = props;
  const { loading, handleCheck, modal } = usePermissionChange({
    holder: group,
    onToggle: props.onToggle,
    permissions,
    removeOnly,
  });

  const description =
    group.name === ANYONE ? translate('user_groups.anyone.description') : group.description;

  return (
    <TableRowInteractive>
      <ContentCell>
        <div className="sw-flex sw-items-center">
          <UserGroupIcon className="sw-mr-4" />
          <div className="sw-max-w-abs-800">
            <div className="sw-flex sw-w-fit sw-max-w-full">
              <div className="sw-flex-1 sw-text-ellipsis sw-whitespace-nowrap sw-overflow-hidden  sw-min-w-0">
                <strong>{group.name}</strong>
              </div>
              {isGitHubUser && (
                <Image
                  alt="github"
                  aria-label={translateWithParameters(
                    'project_permission.managed',
                    translate('alm.github'),
                  )}
                  className="sw-ml-2"
                  height={16}
                  src="/images/alm/github.svg"
                />
              )}
              {isGitLabUser && (
                <Image
                  alt="gitlab"
                  aria-label={translateWithParameters(
                    'project_permission.managed',
                    translate('alm.gitlab'),
                  )}
                  className="sw-ml-2"
                  height={16}
                  src="/images/alm/gitlab.svg"
                />
              )}
              {group.name === ANYONE && (
                <Badge className="sw-ml-2" variety="danger">
                  <FormattedMessage id="deprecated" />
                </Badge>
              )}
            </div>
            {isDefined(description) && (
              <div className="sw-mt-2 sw-whitespace-normal">{description}</div>
            )}
          </div>
        </div>
      </ContentCell>
      {permissions.map((permission) => {
        const isPermissionGroup = isPermissionDefinitionGroup(permission);
        const permissionKey = isPermissionGroup ? permission.category : permission.key;
        const isAdminPermission = !isPermissionGroup && permissionKey === Permissions.Admin;

        return (
          <PermissionCell
            disabled={
              isGitHubUser ||
              isGitLabUser ||
              (group.name === ANYONE && (isComponentPrivate || isAdminPermission))
            }
            key={permissionKey}
            loading={loading}
            onCheck={handleCheck}
            permission={permission}
            permissionItem={group}
            prefixID={group.name}
            removeOnly={removeOnly}
            selectedPermission={selectedPermission}
          />
        );
      })}
      {modal}
    </TableRowInteractive>
  );
}
