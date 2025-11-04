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

import { Select, ToggleButtonGroup } from '@sonarsource/echoes-react';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { InputSearch } from '../../design-system';
import { isPermissionDefinitionGroup } from '../../helpers/permissions';
import {
  PermissionDefinition,
  PermissionDefinitionGroup,
  PermissionDefinitions,
} from '../../types/types';

export type FilterOption = 'all' | 'users' | 'groups';
interface Props {
  filter: FilterOption;
  onFilter: (value: FilterOption) => void;
  onSearch: (value: string) => void;
  onSelectPermission?: (permissions?: string) => void;
  permissions: PermissionDefinitions;
  query: string;
  selectedPermission?: string;
}

export default function SearchForm(props: Props) {
  const { filter, onFilter, onSearch, onSelectPermission, permissions, query, selectedPermission } =
    props;

  const intl = useIntl();

  const getPermissionOption = useCallback(
    (permission: PermissionDefinition | PermissionDefinitionGroup) => {
      if (isPermissionDefinitionGroup(permission)) {
        return {
          label: intl.formatMessage({ id: `global_permissions.${permission.category}` }),
          value: permission.category,
        };
      }

      return {
        label: permission.name,
        value: permission.key,
      };
    },
    [intl],
  );

  const filterOptions = [
    { value: 'all', label: intl.formatMessage({ id: 'all' }) },
    { value: 'users', label: intl.formatMessage({ id: 'users.page' }) },
    { value: 'groups', label: intl.formatMessage({ id: 'user_groups.page' }) },
  ];

  return (
    <div className="sw-flex sw-flex-row sw-items-center">
      <ToggleButtonGroup onChange={onFilter} options={filterOptions} selected={filter} />

      <div className="sw-flex-1 sw-ml-2">
        <InputSearch
          minLength={3}
          onChange={onSearch}
          placeholder={intl.formatMessage({ id: 'search.search_for_users_or_groups' })}
          size="medium"
          value={query}
        />
      </div>

      {onSelectPermission && (
        <Select
          ariaLabel={intl.formatMessage({ id: 'permissions.filter.label' })}
          className="sw-ml-2"
          data={permissions.map(getPermissionOption)}
          onChange={(v) => {
            onSelectPermission(v ?? undefined);
          }}
          placeholder={intl.formatMessage({ id: 'permissions.filter.label' })}
          value={selectedPermission ?? null} // convert `undefined` to `null` to clear it properly
        />
      )}
    </div>
  );
}
