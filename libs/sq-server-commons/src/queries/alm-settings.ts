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
  createAzureConfiguration,
  createBitbucketCloudConfiguration,
  createBitbucketServerConfiguration,
  createGithubConfiguration,
  createGithubConfigurationFromManifest,
  createGitlabConfiguration,
  getAlmDefinitions,
  getAlmSettingsNoCatch,
  updateAzureConfiguration,
  updateBitbucketCloudConfiguration,
  updateBitbucketServerConfiguration,
  updateGithubConfiguration,
  updateGitlabConfiguration,
  validateProjectAlmBinding,
} from '../api/alm-settings';
import { ProjectAlmBindingConfigurationErrors } from '../types/alm-settings';

export const useAlmSettingsQuery = createQueryHook((project?: string) =>
  queryOptions({
    queryKey: ['alm_settings', 'list', project ?? 'all'] as const,
    queryFn: () => getAlmSettingsNoCatch(project),
  }),
);

export const useValidateProjectAlmBindingQuery = createQueryHook((projectKey: string) =>
  queryOptions({
    queryKey: ['alm_settings', projectKey, 'validation'] as const,
    queryFn: (): Promise<ProjectAlmBindingConfigurationErrors | null> =>
      validateProjectAlmBinding(projectKey).then((result) => result ?? null),
    retry: false,
    staleTime: StaleTime.NEVER,
  }),
);

export function useInvalidateValidateProjectAlmBindingQuery() {
  const queryClient = useQueryClient();

  return (projectKey: string) =>
    queryClient.invalidateQueries({
      queryKey: ['alm_settings', projectKey, 'validation'] as const,
    });
}

export function useCreateGithubConfigurationFromManifestMutation() {
  return useMutation({
    mutationFn: (data: Parameters<typeof createGithubConfigurationFromManifest>[0]) =>
      createGithubConfigurationFromManifest(data),
  });
}

/*
 * ALM binding definitions
 */
const ALM_DEFINITIONS_QUERY_KEY = ['alm_settings', 'definitions'] as const;

export const useAlmDefinitionsQuery = createQueryHook(() =>
  queryOptions({
    queryKey: ALM_DEFINITIONS_QUERY_KEY,
    queryFn: getAlmDefinitions,
  }),
);

export function useInvalidateAlmDefinitionsQuery() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: ALM_DEFINITIONS_QUERY_KEY });
}

function useAlmConfigurationMutation<T>(mutationFn: (data: T) => Promise<void>) {
  const invalidateAlmDefinitions = useInvalidateAlmDefinitionsQuery();

  return useMutation({
    mutationFn,
    onSuccess: invalidateAlmDefinitions,
  });
}

export function useCreateAzureConfigurationMutation() {
  return useAlmConfigurationMutation(createAzureConfiguration);
}

export function useUpdateAzureConfigurationMutation() {
  return useAlmConfigurationMutation(updateAzureConfiguration);
}

export function useCreateGithubConfigurationMutation() {
  return useAlmConfigurationMutation(createGithubConfiguration);
}

export function useUpdateGithubConfigurationMutation() {
  return useAlmConfigurationMutation(updateGithubConfiguration);
}

export function useCreateGitlabConfigurationMutation() {
  return useAlmConfigurationMutation(createGitlabConfiguration);
}

export function useUpdateGitlabConfigurationMutation() {
  return useAlmConfigurationMutation(updateGitlabConfiguration);
}

export function useCreateBitbucketServerConfigurationMutation() {
  return useAlmConfigurationMutation(createBitbucketServerConfiguration);
}

export function useUpdateBitbucketServerConfigurationMutation() {
  return useAlmConfigurationMutation(updateBitbucketServerConfiguration);
}

export function useCreateBitbucketCloudConfigurationMutation() {
  return useAlmConfigurationMutation(createBitbucketCloudConfiguration);
}

export function useUpdateBitbucketCloudConfigurationMutation() {
  return useAlmConfigurationMutation(updateBitbucketCloudConfiguration);
}
