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

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { StaleTime } from '~shared/queries/common';
import {
  createGitHubConfiguration,
  deleteGitHubConfiguration,
  getDopPermissionChecks,
  getProjectBindings,
  searchGitHubConfigurations,
  updateGitHubConfiguration,
} from '../api/dop-translation';
import { addGlobalSuccessMessage } from '../design-system';
import { translate } from '../helpers/l10n';
import { AlmKeys } from '../types/alm-settings';
import {
  InstallationCheckStatus,
  PermissionCheckResource,
  PermissionCheckStatus,
  PermissionChecksResponse,
} from '../types/dop-translation';
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
const PERMISSION_CHECKS_ALL_KEY = '__all__';

/**
 * Shared query options for the all-connections/one-project permission-checks read. Extracted so
 * {@link useDopPermissionChecksQuery} and the per-connection/refresh helpers below key and cache
 * against the exact same query — several DevOps Platform connection widgets calling
 * {@link useDopPermissionCheckForConfiguration} on the same page therefore share one request
 * (SONAR-32166).
 */
export function dopPermissionChecksQueryOptions({ projectKey }: { projectKey?: string } = {}) {
  return queryOptions({
    queryKey: ['dop-translation', 'permission-checks', projectKey ?? PERMISSION_CHECKS_ALL_KEY],
    queryFn: () => getDopPermissionChecks({ projectKey }),
    staleTime: StaleTime.LONG,
  });
}

export function useDopPermissionChecksQuery<TData = PermissionChecksResponse>(
  data: { projectKey?: string } = {},
  options: Pick<UseQueryOptions<PermissionChecksResponse, Error, TData>, 'enabled' | 'select'> = {},
) {
  // Spread the base `queryOptions()` result directly into `options` (rather than the reverse)
  // would union the two objects' `select` types instead of letting `options.select` narrow to
  // `TData` — destructuring the base fields first avoids that.
  const { queryKey, queryFn, staleTime } = dopPermissionChecksQueryOptions(data);
  return useQuery<PermissionChecksResponse, Error, TData>({
    queryKey,
    queryFn,
    staleTime,
    ...options,
  });
}

/**
 * One connection's cached admin result, selected out of the shared all-connections query so
 * several `AlmBindingDefinitionBox` widgets rendered on the same settings page (SONAR-32166)
 * dedupe to a single request instead of each fetching independently.
 */
export function useDopPermissionCheckForConfiguration(
  configurationKey: string,
  options: { enabled?: boolean } = {},
) {
  return useDopPermissionChecksQuery(
    {},
    {
      ...options,
      select: (data) => data.permissionChecks.find((check) => check.key === configurationKey),
    },
  );
}

/** Synthetic result upserted by {@link useRefreshDopPermissionCheckMutation} in place of a stale
 * (possibly SUFFICIENT) cached status when a live refresh fails or omits the requested
 * connection. */
function buildSyntheticCheckFailed(
  almKey: AlmKeys,
  configurationKey: string,
): PermissionCheckResource {
  return {
    checkedAt: Date.now(),
    key: configurationKey,
    status: PermissionCheckStatus.CheckFailed,
    type: almKey,
  };
}

/**
 * "Check configuration" (SONAR-32166): also runs a live, uncached remediation check for one
 * connection — there is no separate refresh control; the existing DevOps Platform Integrations
 * "Check configuration" action (re)runs this check too. Upserts that connection's entry in the
 * shared all-connections cache directly with the result — deliberately *not* re-invalidated the
 * ordinary way, since an immediate refetch of that same query would race the still-short-lived
 * backend cache entry it just bypassed and could overwrite this fresher result with a stale one.
 * On failure — or on a successful response that unexpectedly omits the requested connection —
 * upserts a synthetic `CHECK_FAILED` entry instead of leaving a stale (possibly SUFFICIENT)
 * status silently on screen. Existing *project*-scoped permission-check queries
 * (instance/project DOP warnings, `use-can-assign-to-agent`) have no such direct replacement
 * available (this response is connection-, not project-, scoped) and are invalidated the ordinary
 * TanStack way instead — they refetch on next read rather than being tracked connection-to-project.
 */
export function useRefreshDopPermissionCheckMutation() {
  const client = useQueryClient();

  function upsertConnection(configurationKey: string, resource: PermissionCheckResource) {
    client.setQueryData<PermissionChecksResponse>(
      dopPermissionChecksQueryOptions().queryKey,
      (current) => {
        const permissionChecks = current?.permissionChecks ?? [];
        // Upsert: the all-connections query may not have loaded yet (`current` undefined), or may
        // have loaded without this connection (e.g. its very first check ever, or a prior check
        // that errored and was never cached) — either way the result must still surface, not be
        // silently dropped because there was nothing to replace.
        const exists = permissionChecks.some((check) => check.key === configurationKey);
        return {
          permissionChecks: exists
            ? permissionChecks.map((check) => (check.key === configurationKey ? resource : check))
            : [...permissionChecks, resource],
        };
      },
    );

    void client.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === 'dop-translation' &&
        query.queryKey[1] === 'permission-checks' &&
        query.queryKey[2] !== PERMISSION_CHECKS_ALL_KEY,
    });
  }

  return useMutation({
    mutationFn: ({ configurationKey }: { almKey: AlmKeys; configurationKey: string }) =>
      getDopPermissionChecks({ configurationKey, refresh: true }),
    onSuccess: (response, { almKey, configurationKey }) => {
      const refreshed = response.permissionChecks.find((check) => check.key === configurationKey);

      // The backend selects by `configurationKey`, so a successful response missing that
      // connection should not normally happen — but if it does, a stale cached status (possibly
      // SUFFICIENT) must not be left looking current.
      upsertConnection(
        configurationKey,
        refreshed ?? buildSyntheticCheckFailed(almKey, configurationKey),
      );
    },
    onError: (_error, { almKey, configurationKey }) => {
      upsertConnection(configurationKey, buildSyntheticCheckFailed(almKey, configurationKey));
    },
  });
}

/**
 * True when at least one check in a *project-scoped* response reflects a real binding — i.e. was
 * actually evaluated, rather than skipped because the project has no bound repository. See
 * {@link InstallationCheckStatus.NotRun}: such an entry can still carry `status: SUFFICIENT`, but
 * that is not a genuine signal. Shared by {@link useRemediationAgentBindingSupport} and
 * `useCanAssignToAgent` (feature-ai-capabilities), which both gate Remediation Agent availability
 * on a real binding existing for the project.
 */
export function hasRealDopBinding(checks: PermissionCheckResource[]): boolean {
  return checks.some((check) => check.installationCheckStatus !== InstallationCheckStatus.NotRun);
}

/**
 * The Remediation Agent only supports a subset of DevOps platforms (see
 * DopPermissionValidationService server-side). An empty `permissionChecks` response — or one
 * where every entry is {@link InstallationCheckStatus.NotRun} (checked but never actually run,
 * because the project has no bound repository) — means the project has no real binding, or a
 * binding on an unsupported platform (e.g. Bitbucket) — either way Remediation Agent surfaces
 * (menu entries, tabs, pages) must stay hidden rather than point at a config screen that can
 * never work.
 *
 * Pass `enabled: false` (e.g. while the Remediation Agent license itself hasn't been confirmed
 * yet) to skip the check — callers combine `isSupported` with their own license signal since what
 * "confirmed" means (an entry exists vs. entry exists and `isAvailable`) varies by call site.
 *
 * `isSupported` fails open while the request is loading or if it errors — same "supported or
 * unknown" philosophy as `isPurchasableFeatureSupportedOrUnknown` for the license check — so
 * neither a pending request nor a transient network/API error silently hides Remediation Agent
 * everywhere. Callers that need to distinguish "confirmed supported" from "not yet known" (e.g.
 * to defer a request until the binding is actually confirmed) can check `isLoading` themselves.
 */
export function useRemediationAgentBindingSupport({
  projectKey,
  enabled,
}: {
  projectKey: string;
  enabled: boolean;
}): { isLoading: boolean; isSupported: boolean } {
  const { data, isError, isLoading } = useDopPermissionChecksQuery(
    { projectKey },
    { enabled: enabled && projectKey !== '' },
  );

  return {
    isLoading,
    isSupported: isLoading || isError || hasRealDopBinding(data?.permissionChecks ?? []),
  };
}
