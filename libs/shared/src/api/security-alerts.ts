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
import { axiosClient } from '../helpers/axios-clients';
import {
  SecurityAlert,
  SecurityAlertSearchParams,
  SecurityAlertSearchResponse,
  SecurityAlertSortField,
  SecurityAlertStatus,
  SortDirection,
} from '../types/security-alert';

const SECURITY_ALERTS_ENDPOINT = `${API_V2_BASE_URL}/security-alerts/alerts`;

export function getSecurityAlert(id: string) {
  return axiosClient.get<SecurityAlert>(`${SECURITY_ALERTS_ENDPOINT}/${id}`);
}

export function getSecurityAlerts(params: SecurityAlertSearchParams) {
  const serializedParams = {
    ...params,
    alertTypes: params.alertTypes?.join(','),
    statuses: params.statuses?.join(','),
  };
  return axiosClient.get<SecurityAlertSearchResponse>(SECURITY_ALERTS_ENDPOINT, {
    params: serializedParams,
  });
}

export function getNewestSecurityAlert() {
  return getSecurityAlerts({
    sort: SecurityAlertSortField.FIRST_DETECTED_AT,
    direction: SortDirection.DESC,
    pageSize: 1,
    pageIndex: 1,
    statuses: [SecurityAlertStatus.OPEN],
  });
}
