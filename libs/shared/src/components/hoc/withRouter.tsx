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
import { useMemo } from 'react';
import {
  Params,
  useLocation as useLocationRouter,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router';
import { queryToSearchString } from '../../helpers/query';
import { searchParamsToQuery } from '../../helpers/router';
import {
  Location,
  Router,
  RouterNavigationOptions,
  RouterNavigationTarget,
} from '../../types/router';
import { getWrappedDisplayName } from './utils';

function normalizeLocation(path: RouterNavigationTarget): RouterNavigationTarget {
  if (typeof path === 'string' || path.query === undefined) {
    return path;
  }

  const { query, ...location } = path;

  return {
    ...location,
    search: queryToSearchString(query),
  };
}

export interface WithRouterProps {
  location: Location;
  params: Params;
  router: Router;
}

export function withRouter<P extends Partial<WithRouterProps>>(
  WrappedComponent: React.ComponentType<React.PropsWithChildren<P>>,
): React.ComponentType<React.PropsWithChildren<Omit<P, keyof WithRouterProps>>> {
  function ComponentWithRouterProp(props: Readonly<P>) {
    const router = useRouter();
    const params = useParams();
    const location = useLocation();

    return <WrappedComponent {...props} location={location} params={params} router={router} />;
  }

  ComponentWithRouterProp.displayName = getWrappedDisplayName(WrappedComponent, 'withRouter');

  return ComponentWithRouterProp;
}

export function useRouter() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  return React.useMemo(
    () => ({
      replace: (path: RouterNavigationTarget, navigateOptions?: RouterNavigationOptions) => {
        void navigate(normalizeLocation(path), { ...navigateOptions, replace: true });
      },
      push: (path: RouterNavigationTarget, navigateOptions?: RouterNavigationOptions) => {
        const target = normalizeLocation(path);

        if (navigateOptions === undefined) {
          void navigate(target);
          return;
        }

        void navigate(target, navigateOptions);
      },
      navigate,
      searchParams,
      setSearchParams,
    }),
    [navigate, searchParams, setSearchParams],
  );
}

export function useLocation() {
  const location = useLocationRouter();

  return useMemo(
    () => ({
      ...location,
      query: searchParamsToQuery(new URLSearchParams(location.search)),
    }),
    [location],
  );
}
