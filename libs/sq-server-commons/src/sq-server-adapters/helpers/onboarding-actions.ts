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

import { Path } from 'react-router-dom';
import { isWebUri } from 'valid-url';
import { queryToSearchString } from '~shared/helpers/query';
import { OnboardingAlm, OnboardingDevopsPlatform } from '~shared/types/onboarding';
import { getProjectTutorialLocation } from '../../helpers/urls';
import { CreateProjectModes } from '../../types/create-project';

// `CreateProjectModes` values differ from `OnboardingAlm` ones (`azure` vs `azure_devops`).
// Exhaustive, so adding a platform is a compile error rather than a silently dead menu entry.
const ONBOARDING_ALM_TO_CREATE_PROJECT_MODE: Record<OnboardingAlm, CreateProjectModes> = {
  [OnboardingDevopsPlatform.AzureDevops]: CreateProjectModes.AzureDevOps,
  [OnboardingDevopsPlatform.Bitbucket]: CreateProjectModes.BitbucketServer,
  [OnboardingDevopsPlatform.BitbucketCloud]: CreateProjectModes.BitbucketCloud,
  [OnboardingDevopsPlatform.Github]: CreateProjectModes.GitHub,
  [OnboardingDevopsPlatform.Gitlab]: CreateProjectModes.GitLab,
};

/** Trailing REST API path of the API base URLs the DevOps platforms report, e.g. `/api/v3`. */
const API_VERSION_PATH_RE = /\/api\/v\d+\/?$/;

// Automatic analysis is SQ-Cloud only. Kept in sync with `useTriggerAutomaticAnalysisMutation`
// returning `undefined`.
export const IS_AUTOMATIC_ANALYSIS_SUPPORTED = false;

/** Location of the page where the CI-based analysis of a project is set up. */
export function getProjectCiConfigurationUrl(projectKey: string): Partial<Path> {
  return getProjectTutorialLocation(projectKey);
}

/**
 * Project-creation flow scoped to one DevOps platform configuration.
 *
 * `useProjectCreate` only honours the `dopSetting` param for GitHub today; other platforms land on
 * the right mode and auto-select when there is exactly one configuration. Sent regardless.
 */
export function getImportRepositoriesUrl(
  alm: OnboardingAlm,
  dopSettingId: string,
): Partial<Path> | undefined {
  return {
    pathname: '/projects/create',
    search: queryToSearchString({
      dopSetting: dopSettingId,
      mode: ONBOARDING_ALM_TO_CREATE_PROJECT_MODE[alm],
    }),
  };
}

/**
 * The platform's web address, derived from the API base URL a configuration reports, the same way
 * the GitHub redirect does in `apps/create/project/Github/utils.ts`.
 *
 * `undefined` when there is nothing openable — no URL at all, or one that is not a valid web URI.
 */
export function getDevopsPlatformWebUrl(alm: OnboardingAlm, url?: string): string | undefined {
  if (url === undefined || url === '') {
    return undefined;
  }

  let webUrl = url.replace(API_VERSION_PATH_RE, '');

  // Only GitHub fronts its API on an `api.` host; stripping the prefix elsewhere could rewrite a
  // self-hosted instance that legitimately lives there.
  if (alm === OnboardingDevopsPlatform.Github) {
    webUrl = webUrl.replace('//api.', '//');
  }

  webUrl = webUrl.replace(/\/$/, '');

  return isWebUri(webUrl) === undefined ? undefined : webUrl;
}
