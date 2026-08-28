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

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StaleTime } from '~shared/queries/common';
import {
  createGitHubConfiguration,
  deleteGitHubConfiguration,
  fetchGitHubConfiguration,
  getDopPermissionChecks,
  getProjectBindings,
  searchGitHubConfigurations,
  updateGitHubConfiguration,
} from '../api/dop-translation';
import { addGlobalSuccessMessage } from '../design-system';
import { translate } from '../helpers/l10n';
import { ProvisioningType } from '../types/provisioning';
import { useSyncWithGitHubNow } from './identity-provider/github';

/*
 * Project bindings
 */
export interface ProjectBindingsQuery {
  dopSettingId?: string;
  pageIndex?: number;
  pageSize?: number;
  repository?: string;
}

/**
 * Query options for the project bindings of one DevOps platform configuration, extracted so callers
 * that fan out over several configurations (`useQueries`) share the exact cache entries
 * {@link useProjectBindingsQuery} populates instead of keying their own.
 */
export function projectBindingsQueryOptions(data: ProjectBindingsQuery) {
  return queryOptions({
    queryKey: ['dop-translation', 'project-bindings', data],
    queryFn: () => getProjectBindings(data),
  });
}

export function useProjectBindingsQuery(data: ProjectBindingsQuery, enabled = true) {
  return useQuery({ ...projectBindingsQueryOptions(data), enabled });
}

/*
 * GitHub configurations
 */
export function useSearchGitHubConfigurationsQuery() {
  return useQuery({
    queryKey: ['dop-translation', 'github-configs', 'search'],
    queryFn: searchGitHubConfigurations,
  });
}

export function useFetchGitHubConfigurationQuery(id: string) {
  return useQuery({
    queryKey: ['dop-translation', 'github-configs', 'fetch'],
    queryFn: () => fetchGitHubConfiguration(id),
  });
}

export function useCreateGitHubConfigurationMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (gitHubConfiguration: Parameters<typeof createGitHubConfiguration>[0]) =>
      createGitHubConfiguration(gitHubConfiguration),
    onSuccess(gitHubConfiguration) {
      client.setQueryData(['dop-translation', 'github-configs', 'search'], {
        githubConfigurations: [gitHubConfiguration],
        page: {
          pageIndex: 1,
          pageSize: 1,
          total: 1,
        },
      });
      client.setQueryData(['dop-translation', 'github-configs', 'fetch'], gitHubConfiguration);
    },
  });
}

export function useUpdateGitHubConfigurationMutation() {
  const client = useQueryClient();
  const { canSyncNow, synchronizeNow } = useSyncWithGitHubNow();
  return useMutation({
    mutationFn: ({
      gitHubConfiguration,
      id,
    }: {
      gitHubConfiguration: Parameters<typeof updateGitHubConfiguration>[1];
      id: Parameters<typeof updateGitHubConfiguration>[0];
    }) => updateGitHubConfiguration(id, gitHubConfiguration),
    onSuccess(gitHubConfiguration) {
      client.setQueryData(['dop-translation', 'github-configs', 'search'], {
        githubConfigurations: [gitHubConfiguration],
        page: {
          pageIndex: 1,
          pageSize: 1,
          total: 1,
        },
      });
      client.setQueryData(['dop-translation', 'github-configs', 'fetch'], gitHubConfiguration);
      client.invalidateQueries({ queryKey: ['identity_provider'] });
      if (canSyncNow && gitHubConfiguration.provisioningType === ProvisioningType.auto) {
        synchronizeNow();
      }
      addGlobalSuccessMessage(translate('settings.authentication.form.settings.save_success'));
    },
  });
}

export function useDeleteGitHubConfigurationMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: Parameters<typeof deleteGitHubConfiguration>[0]) =>
      deleteGitHubConfiguration(id),
    onSuccess() {
      client.setQueryData(['dop-translation', 'github-configs', 'search'], {
        githubConfigurations: [],
        page: {
          pageIndex: 1,
          pageSize: 1,
          total: 1,
        },
      });
      client.setQueryData(['dop-translation', 'github-configs', 'fetch'], undefined);
    },
  });
}

/*
 * Permission checks
 */
export function useDopPermissionChecksQuery(
  { projectKey }: { projectKey?: string } = {},
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ['dop-translation', 'permission-checks', projectKey ?? '__all__'],
    queryFn: () => getDopPermissionChecks({ projectKey }),
    enabled,
    staleTime: StaleTime.LONG,
  });
}
