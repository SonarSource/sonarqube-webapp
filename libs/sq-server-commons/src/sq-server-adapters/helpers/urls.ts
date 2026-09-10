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
import { getBaseUrl } from '~adapters/helpers/system';
import { queryToSearchString } from '~shared/helpers/query';
import { getComponentIssuesUrl } from '~shared/helpers/urls';
import { ComponentQualifier } from '~shared/types/component';
import { RawQuery } from '~shared/types/router';

export { PULL_REQUEST_DECORATION_BINDING_CATEGORY as PROJECT_ALM_BINDING_SETTINGS_CATEGORY } from '../../constants/settings';

/**
 * Generate URL for the rules page
 */
export function getRulesUrl(query: RawQuery, _organization?: string): Partial<Path> {
  return { pathname: '/coding_rules', search: queryToSearchString(query) };
}

export function getFormattingHelpUrl(): string {
  return `${getBaseUrl()}/formatting/help`;
}

export function getConfigureProjectUrl(key: string): Partial<Path> {
  return { pathname: '/tutorials', search: queryToSearchString({ id: key }) };
}

export const API_V2_BASE_URL = '/api/v2';
export const API_V2_MOCKS_PREFIX = '/api/v2';

export const PROJECT_BASE_URL = '/project/overview';
export const PROJECT_SUMMARY_BASE_URL = '/summary/new_code';
export const PROJECT_SUMMARY_OVERALL_BASE_URL = '/summary/overall';

/**
 * Base path for ALM provider icons. SQS serves them from `/images/alm`, whereas SQC
 * uses `/images/alms`, so shared code must build icon URLs from this adapter constant.
 */
export const ALM_ICONS_BASE_URL = 'images/alm';

export const MERGE_PATCH_CONTENT_TYPE = 'application/merge-patch+json';

// Defined here (rather than in helpers/urls) so shared compliance-reports code can reach them via
// ~adapters/helpers/urls; helpers/urls re-exports them for server-internal callers. Defining them
// in the adapter avoids a helpers/urls <-> adapter import cycle.
export function getProjectQualityProfileSettingsUrl(project: string): Partial<Path> {
  return {
    pathname: '/project/quality_profiles',
    search: queryToSearchString({ id: project }),
  };
}

export function getProjectInformationUrl(project: string): Partial<Path> {
  return {
    pathname: '/project/information',
    search: queryToSearchString({ id: project }),
  };
}

export function getComplianceIssuesLinkUrl(
  componentKey: string,
  _qualifier: ComponentQualifier,
  query?: RawQuery,
): Partial<Path> | undefined {
  return getComponentIssuesUrl(componentKey, query);
}
