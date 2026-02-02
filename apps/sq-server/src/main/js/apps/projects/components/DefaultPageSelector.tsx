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

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '~adapters/helpers/users';
import { useLocation } from '~shared/components/hoc/withRouter';
import { get } from '~shared/helpers/storage';
import { searchProjects } from '~sq-server-commons/api/components';
import { hasGlobalPermission } from '~sq-server-commons/helpers/users';
import { isLoggedIn } from '~sq-server-commons/types/users';
import { PROJECTS_ALL, PROJECTS_DEFAULT_FILTER, PROJECTS_FAVORITE } from '../utils';
import AllProjects from './AllProjects';

export interface DefaultPageSelectorProps {
  showFavoriteProjects: boolean;
}

export default function DefaultPageSelector({
  showFavoriteProjects,
}: Readonly<DefaultPageSelectorProps>) {
  const { currentUser } = useCurrentUser();

  // Only perform the check when not showing favorite projects
  const [checking, setChecking] = React.useState(!showFavoriteProjects);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(
    () => {
      async function checkRedirect() {
        const setting = get(PROJECTS_DEFAULT_FILTER);

        // 1. Don't have to redirect if:
        //   1.1 User is anonymous
        //   1.2 There's a query, which means the user is interacting with the current page
        //   1.3 The last interaction with the filter was to set it to "all"
        if (
          !isLoggedIn(currentUser) ||
          Object.keys(location.query).length > 0 ||
          setting === PROJECTS_ALL
        ) {
          setChecking(false);
          return;
        }

        // 2. Redirect to the favorites page if:
        //   2.1 The last interaction with the filter was to set it to "favorites"
        //   2.2 The user has starred some projects
        if (
          setting === PROJECTS_FAVORITE ||
          (await searchProjects({ filter: 'isFavorite', ps: 1 })).paging.total > 0
        ) {
          setChecking(false);
          navigate('/projects/favorite', { replace: true });
          return;
        }

        // 3. Redirect to the create project page if:
        //   3.1 The user has permission to provision projects, AND there are 0 projects on the instance
        if (
          hasGlobalPermission(currentUser, 'provisioning') &&
          (await searchProjects({ ps: 1 })).paging.total === 0
        ) {
          navigate('/projects/create', { replace: true });
          return;
        }

        // None of the above apply. Do not redirect, and stay on this page.
        setChecking(false);
      }

      if (!showFavoriteProjects) {
        checkRedirect();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showFavoriteProjects],
  );

  if (checking) {
    // We don't return a loader here, on purpose. We don't want to show anything
    // just yet.
    return null;
  }

  return <AllProjects isFavorite={showFavoriteProjects} />;
}
