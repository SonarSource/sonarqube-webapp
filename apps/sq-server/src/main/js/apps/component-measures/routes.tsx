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

import { Navigate, Route, useParams, useSearchParams } from 'react-router-dom';
import { lazyLoadComponent } from '~shared/helpers/lazyLoadComponent';
import { searchParamsToQuery } from '~shared/helpers/router';
import { MetricKey } from '~shared/types/metrics';
import { SOFTWARE_QUALITIES_ISSUES_KEYS_MAP } from '~sq-server-commons/helpers/constants';
import { omitNil } from '~sq-server-commons/helpers/request';
import NavigateWithParams from '../../app/utils/NavigateWithParams';

const ComponentMeasuresApp = lazyLoadComponent(() => import('./components/ComponentMeasuresApp'));

const routes = () => (
  <Route path="component_measures">
    <Route element={<ComponentMeasuresApp />} index />
    <Route
      element={
        <NavigateWithParams
          pathname="/component_measures"
          transformParams={(params) =>
            omitNil({
              metric:
                SOFTWARE_QUALITIES_ISSUES_KEYS_MAP[params.domainName as MetricKey] ??
                params.domainName,
            })
          }
        />
      }
      path="domain/:domainName"
    />

    <Route element={<MetricRedirect />} path="metric/:metricKey" />
    <Route element={<MetricRedirect />} path="metric/:metricKey/:view" />
  </Route>
);

function MetricRedirect() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  if (params.view === 'history') {
    const to = {
      pathname: '/project/activity',
      search: new URLSearchParams(
        omitNil({
          id: searchParams.get('id') ?? undefined,
          graph: 'custom',
          custom_metrics: params.metricKey,
        }),
      ).toString(),
    };
    return <Navigate replace to={to} />;
  }
  const to = {
    pathname: '/component_measures',
    search: new URLSearchParams(
      omitNil({
        ...searchParamsToQuery(searchParams),
        metric:
          SOFTWARE_QUALITIES_ISSUES_KEYS_MAP[params.metricKey as MetricKey] ?? params.metricKey,
        view: params.view,
      }),
    ).toString(),
  };
  return <Navigate replace to={to} />;
}

export default routes;
