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

import { Path, To } from 'react-router-dom';
import { getBaseUrl } from '~adapters/helpers/system';
import { getRulesUrl, PROJECT_BASE_URL } from '~adapters/helpers/urls';
import { RawQuery } from '../types/router';
import { queryToSearchString } from './query';

export function getHostUrl(): string {
  return window.location.origin + getBaseUrl();
}

export function getPathUrlAsString(path: To, internal = true): string {
  const base = internal ? getBaseUrl() : getHostUrl();
  if (typeof path === 'string') {
    path = path.startsWith('/') ? path : `/${path}`;
    return `${base}${path}`;
  }
  return `${base}${path.pathname ?? ''}${path.search ?? ''}${path.hash ?? ''}`;
}

/**
 * Generate URL for a component's issues page
 */
export function getComponentIssuesUrl(componentKey: string, query?: RawQuery): Partial<Path> {
  return {
    pathname: '/project/issues',
    search: queryToSearchString({ ...query, id: componentKey }),
    hash: '',
  };
}

/**
 * Generate URL for the rule details page
 */
export function getRuleUrl(rule: string, organization?: string): Partial<Path> {
  return getRulesUrl({ open: rule, rule_key: rule }, organization);
}

/**
 * Generate URL for the rules page filtering only active deprecated rules
 */
export function getDeprecatedActiveRulesUrl(
  query: RawQuery = {},
  organization?: string,
): Partial<Path> {
  const baseQuery = { activation: 'true', statuses: 'DEPRECATED' };
  return getRulesUrl({ ...query, ...baseQuery }, organization);
}

export function getProjectOverviewUrl(projectKey: string): Partial<Path> {
  return { pathname: PROJECT_BASE_URL, search: queryToSearchString({ id: projectKey }) };
}
