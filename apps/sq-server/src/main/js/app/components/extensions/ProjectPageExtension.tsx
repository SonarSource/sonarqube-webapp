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
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { ComponentContext } from '~sq-server-commons/context/componentContext/ComponentContext';
import NotFound from '../NotFound';
import Extension from './Extension';

export interface ProjectPageExtensionProps {
  params?: {
    extensionKey: string;
    pluginKey: string;
  };
}

export default function ProjectPageExtension({ params }: ProjectPageExtensionProps) {
  const { extensionKey, pluginKey } = useParams();
  const { component } = React.useContext(ComponentContext);
  const { data: branchLike, isLoading } = useCurrentBranchQuery(component);

  if (component === undefined || isLoading) {
    return null;
  }

  const fullKey =
    params !== undefined
      ? `${params.pluginKey}/${params.extensionKey}`
      : `${pluginKey}/${extensionKey}`;

  const extension = component.extensions?.find((p) => p.key === fullKey);
  return extension ? (
    <Extension extension={extension} options={{ branchLike, component }} />
  ) : (
    <NotFound />
  );
}
