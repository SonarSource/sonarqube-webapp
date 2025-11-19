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

import { axiosClient, axiosToCatch } from '~shared/helpers/axios-clients';
import { Paging } from '~shared/types/paging';
import {
  IntegrationConfiguration,
  IntegrationConfigurationPatchPayload,
  IntegrationConfigurationPayload,
  IntegrationType,
  SlackUserBindingPayload,
  SlackUserBindingResponse,
} from '../types/integrations';

const INTEGRATIONS_PATH = '/api/v2/integrations';
export const USER_BINDINGS_ENDPOINT_PATH = `${INTEGRATIONS_PATH}/user-bindings`;
export const INTEGRATION_CONFIGURATIONS_PATH = `${INTEGRATIONS_PATH}/integration-configurations`;

/*
 * User bindings
 */

export function postUserBinding(data: SlackUserBindingPayload): Promise<SlackUserBindingResponse> {
  return axiosToCatch.post(USER_BINDINGS_ENDPOINT_PATH, data);
}

/*
 *  Integration configurations
 */
export function getIntegrationConfiguration(integrationType: IntegrationType) {
  return axiosClient
    .get<{
      integrationConfigurations: IntegrationConfiguration[];
      page: Paging;
    }>(INTEGRATION_CONFIGURATIONS_PATH, {
      params: {
        integrationType,
      },
    })
    .then((response) => response.integrationConfigurations[0] ?? null);
}

export function postIntegrationConfiguration(data: IntegrationConfigurationPayload) {
  return axiosClient.post<IntegrationConfiguration>(INTEGRATION_CONFIGURATIONS_PATH, data);
}

export function patchIntegrationConfiguration(
  id: string,
  data: IntegrationConfigurationPatchPayload,
) {
  return axiosClient.patch<IntegrationConfiguration>(
    `${INTEGRATION_CONFIGURATIONS_PATH}/${id}`,
    data,
  );
}

export function deleteIntegrationConfiguration(id: string) {
  return axiosClient.delete(`${INTEGRATION_CONFIGURATIONS_PATH}/${id}`);
}
