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

import { queryToSearchString } from './query';

export const SECURITY_ALERTS_ROUTE_NAME = 'security_alerts';

const FILTER_PARAMS = ['alertTypes', 'statuses', 'sort', 'direction'] as const;

/**
 * Builds a URL for the security alerts list or an individual alert.
 *
 * @param alertId - Include an alert ID for the detail URL; omit it for the list URL.
 * @param currentSearch - The current search string. Unsupported parameters are removed.
 */
export function getSecurityAlertsUrl(alertId?: string, currentSearch?: string) {
  const currentParams = Object.fromEntries(new URLSearchParams(currentSearch ?? ''));
  const searchObject: Record<string, unknown> = { statuses: 'OPEN', ...currentParams };

  for (const key in searchObject) {
    if (!(FILTER_PARAMS as readonly string[]).includes(key)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete searchObject[key];
    }
  }

  return {
    pathname:
      alertId === undefined
        ? `/${SECURITY_ALERTS_ROUTE_NAME}`
        : `/${SECURITY_ALERTS_ROUTE_NAME}/${alertId}`,
    search: queryToSearchString(searchObject) ?? '',
  };
}
