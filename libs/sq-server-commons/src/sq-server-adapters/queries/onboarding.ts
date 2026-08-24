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

import { keepPreviousData, useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import { StaleTime } from '~shared/queries/common';
import {
  OnboardingAlm,
  OnboardingDevopsPlatform,
  OnboardingDopSettingsQueryData,
  OnboardingRepositoriesQuery,
  OnboardingRepositoriesResponse,
} from '~shared/types/onboarding';
import {
  getBitbucketServerRepositories,
  getGithubRepositories,
  getGitlabProjects,
  searchAzureRepositories,
  searchForBitbucketCloudRepositories,
} from '../../api/alm-integrations';
import { getDopSettings } from '../../api/dop-translation';
import { grantPermissionToUser } from '../../api/permissions';
import { AlmKeys } from '../../types/alm-settings';
import { DopSetting } from '../../types/dop-translation';

const ALM_KEYS_TO_ONBOARDING_ALM: Record<AlmKeys, OnboardingAlm> = {
  [AlmKeys.Azure]: OnboardingDevopsPlatform.AzureDevops,
  [AlmKeys.BitbucketCloud]: OnboardingDevopsPlatform.BitbucketCloud,
  [AlmKeys.BitbucketServer]: OnboardingDevopsPlatform.Bitbucket,
  [AlmKeys.GitHub]: OnboardingDevopsPlatform.Github,
  [AlmKeys.GitLab]: OnboardingDevopsPlatform.Gitlab,
};

/**
 * The onboarding dashboard is not organization-scoped on SQ-Server, so no
 * `organizationKey` is sent. The SQ-Cloud adapter returns the current
 * organization key instead. Feature code passes the result into the shared
 * `~shared/queries/onboarding` hooks.
 */
export function useOnboardingOrganizationKey(): string | undefined {
  return undefined;
}

/**
 * Grants a project permission to a user. SQ-Cloud additionally scopes the call to the current
 * organization, which is the only reason this goes through the adapter.
 */
export function useGrantProjectPermissionMutation() {
  return useMutation({
    mutationFn: async (data: { login: string; permission: string; projectKey: string }) => {
      await grantPermissionToUser(data);
    },
  });
}

/**
 * Triggers a new automatic analysis of a project, or `undefined` on products without automatic
 * analysis — which makes the row menu drop the action instead of offering a dead entry. Automatic
 * analysis is a SQ-Cloud feature, so SQ-Server has nothing to re-run.
 */
export function useTriggerAutomaticAnalysisMutation():
  UseMutationResult<boolean, Error, string> | undefined {
  return undefined;
}

/**
 * Returns the list of DevOps platform configurations available on SQ-Server so the
 * "Import repositories" modal can offer a platform selector. `data` is widened to include `null`
 * so the SQ-Cloud stub's `useQuery`-shaped return can align on the same type without either
 * adapter having to wrap the query in a custom `{ data, isLoading }` interface.
 */
export function useOnboardingDopSettingsQuery() {
  return useQuery({
    queryKey: ['dop-settings'],
    queryFn: getDopSettings,
    staleTime: StaleTime.LONG,
    select: (data): OnboardingDopSettingsQueryData =>
      data.dopSettings.map((s) => ({
        id: s.id,
        key: s.key,
        type: ALM_KEYS_TO_ONBOARDING_ALM[s.type],
      })),
  });
}

/**
 * Fetches repositories discovered on the bound DevOps platform(s) for SQ-Server.
 *
 * The `dopSettingId` param selects which admin-configured integration to query. The DOP settings
 * list is fetched once (cached) to resolve the ALM type, which then drives the per-ALM API call.
 * Per-ALM responses are normalised into {@link OnboardingRepositoriesResponse}.
 *
 * For GitHub, `params.githubOrganization` must be provided by the caller — the org selector in
 * the UI is responsible for fetching orgs via `useGithubOrganizationsQuery` and passing the
 * selected org key here.
 *
 * Limitations:
 * - `visibility` filtering is not supported (per-ALM APIs do not expose privacy on SQ-Server).
 * - Azure repos are fetched in one shot and sliced client-side (no server-side pagination).
 * - BitbucketServer/Cloud total counts are approximated when not on the last page.
 */
export function useOnboardingRepositoriesQuery(
  params: OnboardingRepositoriesQuery,
  options?: { enabled?: boolean },
) {
  const dopSettingsQuery = useQuery({
    queryKey: ['dop-settings'],
    queryFn: getDopSettings,
    staleTime: StaleTime.LONG,
  });

  const setting = dopSettingsQuery.data?.dopSettings.find((s) => s.id === params.dopSettingId);
  const isEnabled = (options?.enabled ?? true) && setting !== undefined;

  return useQuery({
    enabled: isEnabled,
    queryKey: [
      'onboarding',
      'repositories',
      'server',
      params.dopSettingId,
      params.pageIndex,
      params.pageSize,
      params.q,
      params.githubOrganization,
    ],
    queryFn: async () => {
      if (!setting) {
        throw new Error('DOP setting not found');
      }
      return fetchRepositoriesForDopSetting(setting, params);
    },
    placeholderData: keepPreviousData,
    staleTime: StaleTime.LONG,
  });
}

async function fetchRepositoriesForDopSetting(
  setting: DopSetting,
  params: OnboardingRepositoriesQuery,
): Promise<OnboardingRepositoriesResponse> {
  const { q, githubOrganization } = params;
  const pageIndex = params.pageIndex ?? 1;
  const pageSize = params.pageSize ?? 10;
  const alm = ALM_KEYS_TO_ONBOARDING_ALM[setting.type];

  switch (setting.type) {
    case AlmKeys.GitLab: {
      const { projects, projectsPaging } = await getGitlabProjects({
        almSetting: setting.key,
        page: pageIndex,
        pageSize,
        query: q,
      });
      return {
        page: projectsPaging,
        repositories: projects.map((p) => ({
          alm,
          id: p.id,
          isImported: Boolean(p.sqProjectKey),
          isPrivate: false,
          name: p.name,
          slug: p.slug,
        })),
      };
    }

    case AlmKeys.BitbucketServer: {
      const start = (pageIndex - 1) * pageSize;
      const { repositories, isLastPage, nextPageStart } = await getBitbucketServerRepositories(
        setting.key,
        undefined,
        q,
        start,
        pageSize,
      );
      const total = isLastPage ? start + repositories.length : nextPageStart + 1;
      return {
        page: { pageIndex, pageSize, total },
        repositories: repositories.map((r) => ({
          alm,
          id: String(r.id),
          isImported: Boolean(r.sqProjectKey),
          isPrivate: false,
          name: r.name,
          slug: r.slug,
        })),
      };
    }

    case AlmKeys.BitbucketCloud: {
      const { repositories, isLastPage } = await searchForBitbucketCloudRepositories(
        setting.key,
        q ?? '',
        pageSize,
        pageIndex,
      );
      const total = isLastPage
        ? (pageIndex - 1) * pageSize + repositories.length
        : pageIndex * pageSize + 1;
      return {
        page: { pageIndex, pageSize, total },
        repositories: repositories.map((r) => ({
          alm,
          id: String(r.uuid),
          isImported: Boolean(r.sqProjectKey),
          isPrivate: false,
          name: r.name,
          slug: r.slug,
        })),
      };
    }

    case AlmKeys.Azure: {
      // Azure has no server side pagination, fetch all and slice client side.
      const { repositories } = await searchAzureRepositories(setting.key, q ?? '');
      const start = (pageIndex - 1) * pageSize;
      const sliced = repositories.slice(start, start + pageSize);
      return {
        page: { pageIndex, pageSize, total: repositories.length },
        repositories: sliced.map((r) => ({
          alm,
          id: `${r.projectName}/${r.name}`,
          isImported: Boolean(r.sqProjectKey),
          isPrivate: false,
          name: r.name,
          slug: r.projectName,
        })),
      };
    }

    case AlmKeys.GitHub: {
      if (!githubOrganization) {
        return { page: { pageIndex, pageSize, total: 0 }, repositories: [] };
      }
      const { paging, repositories } = await getGithubRepositories({
        almSetting: setting.key,
        organization: githubOrganization,
        page: pageIndex,
        pageSize,
        query: q,
      });
      return {
        page: paging,
        repositories: repositories.map((r) => ({
          alm,
          id: r.id,
          isImported: Boolean(r.sqProjectKey),
          isPrivate: false,
          name: r.name,
          slug: r.key,
        })),
      };
    }

    default:
      return { page: { pageIndex, pageSize, total: 0 }, repositories: [] };
  }
}
