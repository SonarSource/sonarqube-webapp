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

import { useMutation, useQuery } from '@tanstack/react-query';
import { StaleTime } from '~shared/queries/common';
import { getIntegrationConfiguration, postUserBinding } from '../api/integrations';
import { IntegrationType } from '../types/integrations';

/*
 * Query key helpers
 */
function getIntegrationConfigurationQueryKey(integrationType: IntegrationType) {
  return ['integrations', 'integration-configurations', integrationType];
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
export function useGetIntegrationConfigurationQuery(integrationType: IntegrationType) {
  return useQuery({
    queryKey: getIntegrationConfigurationQueryKey(integrationType),
    queryFn: () => getIntegrationConfiguration(integrationType),
    staleTime: StaleTime.NEVER,
  });
}

// export function usePostIntegrationConfigurationMutation() {
//   const client = useQueryClient();

//   return useMutation({
//     mutationFn: postIntegrationConfiguration,
//     onSuccess(integrationConfiguration) {
//       client.setQueryData(
//         getIntegrationConfigurationQueryKey(integrationConfiguration.integrationType),
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
//         getIntegrationConfigurationQueryKey(integrationConfiguration.integrationType),
//         integrationConfiguration,
//       );
//     },
//   });
// }
