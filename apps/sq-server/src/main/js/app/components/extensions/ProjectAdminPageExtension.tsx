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

import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ComponentContext } from '~sq-server-commons/context/componentContext/ComponentContext';
import { useRefreshBranches } from '~sq-server-commons/queries/branch';
import NotFound from '../NotFound';
import Extension from './Extension';

export default function ProjectAdminPageExtension() {
  const { extensionKey, pluginKey } = useParams();
  const { component, onComponentChange } = React.useContext(ComponentContext);

  // We keep that for compatibility but ideally should advocate to use tanstack query
  const onBranchesChange = useRefreshBranches(component?.key);

  const extension = component?.configuration?.extensions?.find(
    (p) => p.key === `${pluginKey}/${extensionKey}`,
  );

  if (component === undefined) {
    return null;
  }

  return extension ? (
    <Extension extension={extension} options={{ component, onComponentChange, onBranchesChange }} />
  ) : (
    <NotFound />
  );
}
