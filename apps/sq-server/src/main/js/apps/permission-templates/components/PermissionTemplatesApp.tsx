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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { withRouter } from '~shared/components/hoc/withRouter';
import { isDefined } from '~shared/helpers/types';
import { useDebouncedValue } from '~shared/helpers/useDebouncedValue';
import { Location } from '~shared/types/router';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { usePermissionTemplatesQuery } from '~sq-server-commons/queries/permissions';
import { AppState } from '~sq-server-commons/types/appstate';
import '../../permissions/styles.css';
import { mergeDefaultsToTemplates, mergePermissionsToTemplates, sortPermissions } from '../utils';
import Home from './Home';
import Template from './Template';

interface Props {
  appState: AppState;
  location: Location;
}

function PermissionTemplatesApp(props: Readonly<Props>) {
  const { appState, location } = props;
  const { id } = location.query;
  const [searchQuery, query, handleSearchChange] = useDebouncedValue();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Reset to page 1 when query changes
    setCurrentPage(1);
  }, [query]);

  const {
    data: permissionTemplatesData,
    isLoading,
    refetch: refetchPermissionTemplates,
  } = usePermissionTemplatesQuery({
    pageIndex: currentPage,
    q: query,
  });

  const {
    permissionTemplates: rawTemplates,
    defaultTemplates,
    permissions: rawPermissions,
    paging,
  } = permissionTemplatesData ?? {};

  const { permissionTemplates, permissions } = useMemo(() => {
    if (!rawTemplates || !rawPermissions) {
      return { permissionTemplates: [], permissions: [] };
    }

    const sortedPermissions = sortPermissions(rawPermissions);
    const templatesWithPermissions = mergePermissionsToTemplates(rawTemplates, sortedPermissions);
    const templatesWithDefaults = mergeDefaultsToTemplates(
      templatesWithPermissions,
      defaultTemplates,
    );

    return {
      permissionTemplates: templatesWithDefaults,
      permissions: sortedPermissions,
    };
  }, [rawTemplates, rawPermissions, defaultTemplates]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  if (!isDefined(id)) {
    return (
      <Home
        loading={isLoading}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        paging={paging}
        permissionTemplates={permissionTemplates}
        permissions={permissions}
        refresh={() => {
          void refetchPermissionTemplates();
        }}
        searchQuery={searchQuery}
        topQualifiers={appState.qualifiers}
      />
    );
  }

  const template = permissionTemplates.find((t) => t.id === id);
  if (!template) {
    return null;
  }

  return (
    <Template
      refresh={() => {
        void refetchPermissionTemplates();
      }}
      template={template}
      topQualifiers={appState.qualifiers}
    />
  );
}

export default withRouter(withAppStateContext(PermissionTemplatesApp));
