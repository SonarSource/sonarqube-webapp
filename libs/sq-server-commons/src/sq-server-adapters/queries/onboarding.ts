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

import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import { StaleTime } from '~shared/queries/common';
import {
  OnboardingAlm,
  OnboardingDevopsPlatform,
  OnboardingDopSettingsQueryData,
  OnboardingRepositoriesQuery,
  OnboardingRepositoriesResponse,
} from '~shared/types/onboarding';
import { getDopSettings } from '../../api/dop-translation';
import { grantPermissionToUser } from '../../api/permissions';
import { AlmKeys } from '../../types/alm-settings';

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
 * Fetches repositories discovered on the bound DevOps platform(s).
 */
export function useOnboardingRepositoriesQuery(
  _params: OnboardingRepositoriesQuery,
  _options?: { enabled?: boolean },
): { data: OnboardingRepositoriesResponse | undefined; isPending: boolean } {
  return { data: undefined, isPending: false };
}
