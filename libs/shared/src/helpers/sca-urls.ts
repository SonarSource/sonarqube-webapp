/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { RiskStatus } from '../types/sca';
import { queryToSearchString } from './query';

export const RELEASES_ROUTE_NAME = 'dependencies';
export const RISKS_ROUTE_NAME = 'dependency-risks';

export const LICENSE_EXTERNAL_COPYLEFT_DETAILS_LINK = 'https://blueoakcouncil.org/copyleft';
export const LICENSE_EXTERNAL_GENERAL_DETAILS_LINK = 'https://blueoakcouncil.org/list';

const REQUIRED_PARAMS = ['id'] as const;
const OPTIONAL_PARAMS = ['branch', 'pullRequest'] as const;

/** The default risk status filters when none are selected */
export const DefaultRiskStatusFilters: Partial<Record<RiskStatus, boolean>> = {
  [RiskStatus.Open]: true,
  [RiskStatus.Confirm]: true,
};

type NewParams<T extends string> = Partial<Record<T, string | boolean | number | undefined | null>>;

// Helper function to build URLs with current search parameters
function buildUrlWithCurrentParams({
  pathname,
  currentSearch = '',
  newParams = {},
  requiredParams = REQUIRED_PARAMS,
  optionalParams = OPTIONAL_PARAMS,
}: {
  currentSearch?: string;
  newParams?: NewParams<string>;
  optionalParams?: Readonly<string[]>;
  pathname: string;
  requiredParams?: Readonly<string[]>;
}) {
  const currentParams = Object.fromEntries(new URLSearchParams(currentSearch));
  const searchObject = {
    ...currentParams,
    ...newParams,
  };

  // Ensure required params are present
  for (const param of requiredParams) {
    if (!searchObject[param]) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }

  // Remove params if they are not in the required or optional list
  const allParams = optionalParams.concat(requiredParams).concat(Object.keys(newParams));
  for (const key in searchObject) {
    if (!allParams.includes(key)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete searchObject[key];
    }
  }
  return {
    pathname,
    search: queryToSearchString(searchObject),
  };
}

export function getReleaseDetailsUrl(params: { key: string }, currentSearch: string) {
  return buildUrlWithCurrentParams({
    pathname: `/${RELEASES_ROUTE_NAME}/${params.key}`,
    currentSearch,
  });
}

const RELEASES_OPTIONAL_PARAMS = [...OPTIONAL_PARAMS, 'newlyIntroduced'] as const;
export function getReleasesUrl(params: {
  currentSearch?: string;
  newParams?: NewParams<(typeof RELEASES_OPTIONAL_PARAMS)[number]>;
}) {
  return buildUrlWithCurrentParams({
    pathname: `/${RELEASES_ROUTE_NAME}`,
    currentSearch: params.currentSearch,
    optionalParams: RELEASES_OPTIONAL_PARAMS,
    newParams: params.newParams,
  });
}

const RISKS_OPTIONAL_PARAMS = [
  ...OPTIONAL_PARAMS,
  'riskStatuses',
  'newlyIntroduced',
  'severities',
  'types',
  'id',
] as const;
export function getRisksUrl(params: {
  currentSearch?: string;
  newParams?: NewParams<(typeof RISKS_OPTIONAL_PARAMS)[number]>;
}) {
  /**
   * Unless the caller specifies otherwise, include the default risk status filters
   */
  const currentParams = Object.fromEntries(new URLSearchParams(params.currentSearch));
  let newStatuses = currentParams.riskStatuses ?? params.newParams?.riskStatuses;
  if (!newStatuses) {
    newStatuses = Object.keys(DefaultRiskStatusFilters).join(',');
  }
  return buildUrlWithCurrentParams({
    pathname: `/${RISKS_ROUTE_NAME}`,
    currentSearch: params.currentSearch,
    optionalParams: RISKS_OPTIONAL_PARAMS,
    newParams: {
      ...params.newParams,
      riskStatuses: newStatuses,
    },
  });
}

export function getRiskDetailsUrl(params: { riskId: string }, currentSearch: string) {
  return buildUrlWithCurrentParams({
    pathname: `/${RISKS_ROUTE_NAME}/${params.riskId}`,
    currentSearch,
  });
}

export enum RiskDetailsTab {
  WHAT = 'what',
  HOW = 'how',
  ACTIVITY = 'activity',
}

export function getRiskDetailsTabUrl(
  params: {
    riskId: string;
    showRiskSelector?: boolean;
    tab: RiskDetailsTab;
  },
  currentSearch: string,
) {
  const { riskId, showRiskSelector, tab } = params;
  return buildUrlWithCurrentParams({
    pathname: `/${RISKS_ROUTE_NAME}/${riskId}/${tab}`,
    currentSearch,
    newParams: {
      showRiskSelector,
    },
  });
}
