/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
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

import React from 'react';
import { AppStateContext } from '../app/components/app-state/AppStateContext';
import { DocLink } from './doc-links';

// This is only meant to be used directly for DocumentationRedirect. For all other uses,
// please use useDocUrl instead (it forces the use of a catalogued documentation link)
export function useUncataloguedDocUrl(to?: string) {
  const { version, documentationUrl: docUrl } = React.useContext(AppStateContext);

  const formatDocUrl = React.useCallback(
    (href: string) => {
      const isSnapshot = version.indexOf('SNAPSHOT') !== -1;

      const path = href.replace(/^\//, '');

      return isSnapshot
        ? `${docUrl.replace(docUrl.slice(docUrl.lastIndexOf('/')), '/latest')}/${path}`
        : `${docUrl}/${path}`;
    },
    [docUrl, version],
  );

  return to ? formatDocUrl(to) : formatDocUrl;
}

export function useDocUrl(to: DocLink): string;
export function useDocUrl(): (to: DocLink) => string;
export function useDocUrl(to?: DocLink) {
  return useUncataloguedDocUrl(to);
}
