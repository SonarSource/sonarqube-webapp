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

import { Navigate, Route, useLocation } from 'react-router-dom';
import { PROJECT_SUMMARY_BASE_URL, PROJECT_SUMMARY_OVERALL_BASE_URL } from '~adapters/helpers/urls';
import { lazyLoadComponent } from '~shared/helpers/lazyLoadComponent';
import { UnsubscribeApp } from './components/UnsubscribeApp';

const App = lazyLoadComponent(() => import('./components/App'));

function DashboardRedirect() {
  const location = useLocation();
  return <Navigate replace to={getDashboardRedirectLocation(location.search)} />;
}

export function getDashboardRedirectLocation(search: string) {
  const searchParams = new URLSearchParams(search);
  const codeScope = searchParams.get('codeScope');
  searchParams.delete('codeScope');

  return {
    pathname: codeScope === 'overall' ? PROJECT_SUMMARY_OVERALL_BASE_URL : PROJECT_SUMMARY_BASE_URL,
    search: searchParams.toString(),
  };
}

const routes = () => (
  <>
    <Route element={<DashboardRedirect />} path="dashboard" />
    <Route element={<App />} path={PROJECT_SUMMARY_BASE_URL.slice(1)} />
    <Route element={<App />} path={PROJECT_SUMMARY_OVERALL_BASE_URL.slice(1)} />
    <Route element={<UnsubscribeApp />} path="unsubscribe" />
  </>
);

export default routes;
