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

import React from 'react';
import { AppStateContext } from '../context/app-state/AppStateContext';
import { AGENT_CENTRIC_DOC_BASE_URL, AgentCentricDocLink, DocLinkUnion } from './doc-links';

function buildDocUrl(baseUrl: string, href: string) {
  const path = href.replace(/^\//, '');
  return `${baseUrl}/${path}`;
}

// This is only meant to be used directly for DocumentationRedirect. For all other uses,
// please use useDocUrl instead (it forces the use of a catalogued documentation link)
export function useUncataloguedDocUrl(to?: string) {
  const { documentationUrl: docUrl } = React.useContext(AppStateContext);

  const formatDocUrl = React.useCallback((href: string) => buildDocUrl(docUrl, href), [docUrl]);

  return to ? formatDocUrl(to) : formatDocUrl;
}

const AGENT_CENTRIC_DOC_LINKS: ReadonlySet<string> = new Set(Object.values(AgentCentricDocLink));

export function useDocUrl(to: DocLinkUnion): string;
export function useDocUrl(): (to: DocLinkUnion) => string;
export function useDocUrl(to?: DocLinkUnion) {
  const { documentationUrl: serverDocUrl } = React.useContext(AppStateContext);

  const getDocUrl = React.useCallback(
    (documentationLink: DocLinkUnion) => {
      const baseUrl = AGENT_CENTRIC_DOC_LINKS.has(documentationLink)
        ? AGENT_CENTRIC_DOC_BASE_URL
        : serverDocUrl;
      return buildDocUrl(baseUrl, documentationLink);
    },
    [serverDocUrl],
  );

  return to === undefined ? getDocUrl : getDocUrl(to);
}
