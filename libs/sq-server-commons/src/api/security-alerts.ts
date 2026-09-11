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

import { API_V2_BASE_URL } from '~adapters/helpers/urls';
import { axiosClient } from '~shared/helpers/axios-clients';
import {
  SecurityAlertSearchResponse,
  SecurityAlertSortField,
  SecurityAlertStatus,
  SortDirection,
} from '~shared/types/security-alert';

const SECURITY_ALERTS_ENDPOINT = `${API_V2_BASE_URL}/security-alerts/alerts`;

// This duplicates the security-alerts API call from private/libs/feature-security-alerts
// because that library is not accessible from sq-server-commons. The banner needs only
// the single most-recent open alert, so a minimal function is defined here rather than
// depending on the private feature library.
export function getMostRecentSecurityAlert() {
  return axiosClient.get<SecurityAlertSearchResponse>(SECURITY_ALERTS_ENDPOINT, {
    params: {
      sort: SecurityAlertSortField.LAST_DETECTED_AT,
      direction: SortDirection.DESC,
      pageSize: 1,
      pageIndex: 1,
      statuses: SecurityAlertStatus.OPEN,
    },
  });
}
