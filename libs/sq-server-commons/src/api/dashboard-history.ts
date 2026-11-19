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

import { axiosClient } from '~shared/helpers/axios-clients';
import { serializeStringArray } from '../helpers/query';
import type {
  DashboardScaResolutionHistoryParams,
  DashboardScaResolutionHistoryResponse,
} from '../types/dashboard-history';

const SCA_RESOLUTION_HISTORY_ENDPOINT = '/api/v2/history/sca-resolution-history';

export function getDashboardScaResolutionHistory(
  params: DashboardScaResolutionHistoryParams,
): Promise<DashboardScaResolutionHistoryResponse> {
  return axiosClient.get<DashboardScaResolutionHistoryResponse>(SCA_RESOLUTION_HISTORY_ENDPOINT, {
    params: {
      ...params,
      severities: serializeStringArray(params.severities ?? []),
    },
  });
}
