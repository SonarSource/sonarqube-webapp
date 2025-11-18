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

import { Navigate, Route } from 'react-router-dom';
import { lazyLoadComponent } from '~shared/helpers/lazyLoadComponent';
import { save } from '~shared/helpers/storage';
import { PROJECTS_ALL, PROJECTS_DEFAULT_FILTER } from './utils';

const DefaultPageSelector = lazyLoadComponent(() => import('./components/DefaultPageSelector'));
const CreateProjectPage = lazyLoadComponent(() => import('../create/project/CreateProjectPage'));

function PersistNavigate() {
  save(PROJECTS_DEFAULT_FILTER, PROJECTS_ALL);

  return <Navigate replace to="/projects" />;
}

const routes = () => (
  <Route path="projects">
    <Route element={<DefaultPageSelector showFavoriteProjects={false} />} index />
    <Route element={<DefaultPageSelector showFavoriteProjects />} path="favorite" />
    <Route element={<PersistNavigate />} path="all" />
    <Route element={<CreateProjectPage />} path="create" />
  </Route>
);

export default routes;
