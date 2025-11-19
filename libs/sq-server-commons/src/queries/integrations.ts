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

import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import {
  deleteIntegrationConfiguration,
  getIntegrationConfiguration,
  postUserBinding,
} from '../api/integrations';
import { IntegrationType } from '../types/integrations';

/*
 * Query key helpers
 */
function getIntegrationConfigurationsQueryKey(integrationType?: IntegrationType) {
  return integrationType === undefined
    ? ['integrations', 'integration-configurations']
    : ['integrations', 'integration-configurations', integrationType];
}

/*
 * User bindings
 */
export function usePostUserBindingMutation() {
  return useMutation({
    mutationFn: postUserBinding,
  });
}

/*
 * Integration configurations
 */
export const useGetIntegrationConfigurationQuery = createQueryHook(
  (integrationType: IntegrationType) => {
    return queryOptions({
      queryKey: getIntegrationConfigurationsQueryKey(integrationType),
      queryFn: () => getIntegrationConfiguration(integrationType),
      staleTime: StaleTime.NEVER,
    });
  },
);

// export function usePostIntegrationConfigurationMutation() {
//   const client = useQueryClient();

//   return useMutation({
//     mutationFn: postIntegrationConfiguration,
//     onSuccess(integrationConfiguration) {
//       client.setQueryData(
//         getIntegrationConfigurationsQueryKey(integrationConfiguration.integrationType),
//         integrationConfiguration,
//       );
//     },
//   });
// }

// export function usePatchIntegrationConfigurationMutation() {
//   const client = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, data }: { data: IntegrationConfigurationPatchPayload; id: string }) =>
//       patchIntegrationConfiguration(id, data),
//     onSuccess(integrationConfiguration) {
//       client.setQueryData(
//         getIntegrationConfigurationsQueryKey(integrationConfiguration.integrationType),
//         integrationConfiguration,
//       );
//     },
//   });
// }

export function useDeleteIntegrationConfigurationMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: deleteIntegrationConfiguration,
    onSuccess() {
      client.invalidateQueries({ queryKey: getIntegrationConfigurationsQueryKey() });
    },
  });
}
