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

import { useLocation } from 'react-router-dom';
import { BranchLikeBase } from '../types/branch-like';
import { MetricKey } from '../types/metrics';
import { RiskStatus } from '../types/sca';
import { getBranchLikeQuery } from './branch-like';
import { queryToSearchString } from './query';
import { SCA_METRIC_TYPE_MAP, scaFilterConditionsBySeverity } from './sca';

export const RELEASES_ROUTE_NAME = 'dependencies';
export const RISKS_ROUTE_NAME = 'dependency-risks';

export const LICENSE_EXTERNAL_COPYLEFT_DETAILS_LINK = 'https://blueoakcouncil.org/copyleft';
export const LICENSE_EXTERNAL_GENERAL_DETAILS_LINK = 'https://blueoakcouncil.org/list';

const OPTIONAL_PARAMS = ['id', 'branch', 'pullRequest'] as const;

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
  optionalParams = OPTIONAL_PARAMS,
}: {
  currentSearch?: string;
  newParams?: NewParams<string>;
  optionalParams?: Readonly<string[]>;
  pathname: string;
}) {
  const currentParams = Object.fromEntries(new URLSearchParams(currentSearch));
  const searchObject = {
    ...currentParams,
    ...newParams,
  };

  // Remove params if they are not in the required or optional list
  const allParams = optionalParams.concat(Object.keys(newParams));
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

// Backward-compatible internal wrapper retaining original signature while adding optional baseUrl
export function getReleaseDetailsUrl(
  params: { key: string },
  currentSearch: string,
  baseUrl: string,
) {
  return buildUrlWithCurrentParams({
    pathname: withBase(baseUrl, `${RELEASES_ROUTE_NAME}/${params.key}`),
    currentSearch,
  });
}

const RELEASES_OPTIONAL_PARAMS = [...OPTIONAL_PARAMS, 'newlyIntroduced', 'id'] as const;
export function getReleasesUrl(params: {
  baseUrl?: string;
  currentSearch?: string;
  newParams?: NewParams<(typeof RELEASES_OPTIONAL_PARAMS)[number]>;
}) {
  const { currentSearch, newParams, baseUrl = '/' } = params;
  return buildUrlWithCurrentParams({
    pathname: withBase(baseUrl, `${RELEASES_ROUTE_NAME}`),
    currentSearch,
    optionalParams: RELEASES_OPTIONAL_PARAMS,
    newParams,
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

type RisksUrlNewParams = NewParams<(typeof RISKS_OPTIONAL_PARAMS)[number]>;

export function getRisksUrl(params: {
  baseUrl?: string;
  currentSearch?: string;
  newParams?: RisksUrlNewParams;
}) {
  /**
   * Unless the caller specifies otherwise, include the default risk status filters
   */
  const currentParams = Object.fromEntries(new URLSearchParams(params.currentSearch));
  let newStatuses = currentParams.riskStatuses ?? params.newParams?.riskStatuses;
  if (!newStatuses) {
    newStatuses = Object.keys(DefaultRiskStatusFilters).join(',');
  }
  const baseUrl = params.baseUrl ?? '/';
  return buildUrlWithCurrentParams({
    pathname: withBase(baseUrl, `${RISKS_ROUTE_NAME}`),
    currentSearch: params.currentSearch,
    optionalParams: RISKS_OPTIONAL_PARAMS,
    newParams: {
      ...params.newParams,
      riskStatuses: newStatuses,
    },
  });
}

export function getRiskDetailsUrl(
  params: { riskId: string },
  currentSearch: string,
  baseUrl: string,
) {
  return buildUrlWithCurrentParams({
    pathname: withBase(baseUrl, `${RISKS_ROUTE_NAME}/${params.riskId}`),
    currentSearch,
  });
}

export enum RiskDetailsTab {
  WHAT = 'what',
  WHERE = 'where',
  REACHABILITY = 'reachability',
  HOW = 'how',
  ACTIVITY = 'activity',
}

// Only ever pass one of metricKey or riskTypes to determine what risks to show. metricKey takes priority.
export function getRisksUrlForComponent({
  metricKey,
  componentKey,
  branchLike,
  newlyIntroduced,
  riskTypes,
  threshold,
}: {
  branchLike?: BranchLikeBase;
  componentKey: string;
  metricKey?: MetricKey;
  newlyIntroduced?: string;
  riskTypes?: Array<string>;
  threshold?: string;
}) {
  const newParams: RisksUrlNewParams = {
    types: metricKey === undefined ? riskTypes?.join(',') : SCA_METRIC_TYPE_MAP[metricKey],
    id: componentKey,
  };

  if (branchLike) {
    Object.assign(newParams, getBranchLikeQuery(branchLike));
  }

  if (newlyIntroduced) {
    newParams.newlyIntroduced = newlyIntroduced;
  }

  if (threshold) {
    newParams.severities = scaFilterConditionsBySeverity(threshold).join(',');
  }

  return getRisksUrl({ newParams });
}

export function getRiskDetailsTabUrl(
  params: {
    riskId: string;
    showRiskSelector?: boolean;
    tab: RiskDetailsTab;
  },
  currentSearch: string,
  baseUrl: string,
) {
  const { riskId, showRiskSelector, tab } = params;
  return buildUrlWithCurrentParams({
    pathname: withBase(baseUrl, `${RISKS_ROUTE_NAME}/${riskId}/${tab}`),
    currentSearch,
    newParams: {
      showRiskSelector,
    },
  });
}

function withBase(baseUrl: string, path: string): string {
  const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${trimmedBase}/${path}`;
}

/**
 * The SCA app might be mounted at one of several places in the app.
 * This will return the base route for the currently mounted app.
 */
export function useScaBaseUrl() {
  const { pathname } = useLocation();
  /**
   * The SCA base URL is the part of the pathName before the known routes
   * Example: /dependencies/dependency_id_1 -> /
   *          /dependency-risks -> /
   *          /some/other/path/dependencies -> /some/other/path/
   */
  for (const route of [RELEASES_ROUTE_NAME, RISKS_ROUTE_NAME]) {
    const parts = pathname.split(route);
    if (parts.length > 1) {
      return parts[0];
    }
  }
  return '/';
}
