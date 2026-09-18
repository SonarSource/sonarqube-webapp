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

import type { Path } from 'history';
import type { To } from 'react-router-dom';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { getComponentIssuesUrl, getPathUrlAsString, getRuleUrl } from '~shared/helpers/urls';
import { BranchLikeBase } from '~shared/types/branch-like';
import { SoftwareImpactSeverity } from '~shared/types/clean-code-taxonomy';
import { FILTERABLE_CODE_ISSUE_STATUSES } from '~shared/types/issues';
import { MetricKey } from '~shared/types/metrics';
import {
  CodeScope,
  DashboardMetricType,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartMetric,
  type CodeScopeValue,
  type MeasureFilters,
  type PieChartWidget,
  type TopListWidgetLinkProps,
} from '../../helpers/dashboard-widget-data';
import {
  resolveIssueSearchFiltersForMode,
  resolvePieChartFilterSoftwareQuality,
} from '../../helpers/dashboard-widget-mode';
import {
  getComponentDrilldownUrl,
  getMeasureHistoryUrl,
  getPortfolioUrl,
} from '../../helpers/urls';
import {
  PROJECT_BASE_URL,
  PROJECT_SUMMARY_BASE_URL,
  PROJECT_SUMMARY_OVERALL_BASE_URL,
} from './urls';

const ALL_FILTERABLE_CODE_ISSUE_STATUSES = FILTERABLE_CODE_ISSUE_STATUSES.join(',');

export function getDashboardDocumentationUrl(docLink: string): string {
  return docLink;
}

export function getProjectDashboardMeasureHistoryUrl(
  component: string,
  metric: string,
  branchLike?: BranchLikeBase,
): Partial<Path> {
  return getMeasureHistoryUrl(component, metric, branchLike);
}

export function getProjectDashboardMeasuresUrl(props: {
  branchLike?: BranchLikeBase;
  component: string;
  metric: string;
  sinceLeakPeriod?: boolean;
}): To {
  return getComponentDrilldownUrl({
    branchLike: props.branchLike,
    componentKey: props.component,
    metric: getMetricKeyForScope(props.metric, props.sinceLeakPeriod === true),
  });
}

export function getProjectDashboardSummaryUrl(
  component: string,
  overall = false,
  branchLike?: BranchLikeBase,
): To {
  return {
    pathname: overall ? PROJECT_SUMMARY_OVERALL_BASE_URL : PROJECT_SUMMARY_BASE_URL,
    search: new URLSearchParams({
      id: component,
      ...getBranchLikeQuery(branchLike),
    }).toString(),
  };
}

export function getProjectDashboardRuleUrl(rule: string, organization?: string): string {
  return getPathUrlAsString(getRuleUrl(rule, organization));
}

export function buildProjectRichCountWidgetLink(
  component: string,
  measureFilters: MeasureFilters | undefined,
  scope: CodeScopeValue,
  branchLike?: BranchLikeBase,
  isStandardMode = false,
): To {
  return getComponentIssuesUrl(component, {
    ...resolveIssueSearchFiltersForMode(
      {
        impactSeverities: measureFilters?.impactSeverities,
        impactSoftwareQuality: measureFilters?.impactSoftwareQuality,
      },
      isStandardMode,
    ),
    issueStatuses: measureFilters?.issueStatus ?? ALL_FILTERABLE_CODE_ISSUE_STATUSES,
    ...(scope === CodeScope.New ? { sinceLeakPeriod: 'true' } : {}),
    ...getBranchLikeQuery(branchLike),
  });
}

export function buildProjectRawCountWidgetLink(
  component: string,
  metricKey: MetricKey,
  scope: CodeScopeValue,
  branchLike?: BranchLikeBase,
): To {
  return getComponentDrilldownUrl({
    branchLike,
    componentKey: component,
    metric: getMetricKeyForScope(metricKey, scope === CodeScope.New),
  });
}

export function serializeDashboardWidgetUrl(url: To): string {
  if (typeof url === 'string') {
    return url;
  }

  const search = typeof url.search === 'string' ? prefixUrlFragment(url.search, '?') : '';
  const hash = typeof url.hash === 'string' ? prefixUrlFragment(url.hash, '#') : '';

  return `${url.pathname ?? ''}${search}${hash}`;
}

export function getProjectDashboardPieChartSegmentUrl(
  projectKey: string,
  value: string,
  props: PieChartWidget,
  branchLike?: BranchLikeBase,
  isStandardMode = false,
): string {
  const { metric, scope, slice } = props;
  const params = new URLSearchParams({ id: projectKey, ...getBranchLikeQuery(branchLike) });

  if (metric === PieChartMetric.IssueCount) {
    return getProjectIssuePieChartSegmentUrl(params, value, props, isStandardMode);
  }

  if (metric === PieChartMetric.HotspotCount) {
    if (scope === CodeScope.New) {
      params.set('inNewCodePeriod', 'true');
    }
    if (slice === PieChartHotspotSlice.ReviewStatus) {
      addHotspotStatusFilter(params, value);
    }
    return `/security_hotspots?${params.toString()}`;
  }

  if (metric === PieChartMetric.LineCount) {
    return `/code?${params.toString()}`;
  }

  return `${PROJECT_BASE_URL}?${params.toString()}`;
}

function getProjectIssuePieChartSegmentUrl(
  params: URLSearchParams,
  value: string,
  props: PieChartWidget,
  isStandardMode: boolean,
): string {
  const { filter, scope, slice } = props;
  if (scope === CodeScope.New) {
    params.set('sinceLeakPeriod', 'true');
  }
  if (slice !== PieChartIssueSlice.IssueStatuses) {
    params.set('issueStatuses', ALL_FILTERABLE_CODE_ISSUE_STATUSES);
  }
  const filterSoftwareQuality = resolvePieChartFilterSoftwareQuality(filter);
  const impactSoftwareQuality =
    filterSoftwareQuality ??
    (slice === PieChartIssueSlice.ImpactSoftwareQualities ? value : undefined);
  const impactSeverities =
    slice === PieChartIssueSlice.ImpactSeverities ? [value as SoftwareImpactSeverity] : undefined;
  if (
    slice !== PieChartIssueSlice.ImpactSoftwareQualities &&
    slice !== PieChartIssueSlice.ImpactSeverities
  ) {
    params.set(slice, value);
  }
  addIssueModeFilters(params, { impactSeverities, impactSoftwareQuality }, isStandardMode);
  return `/project/issues?${params.toString()}`;
}

export function getProjectDashboardTopListRowUrl(
  projectKey: string,
  facetValue: string,
  props: TopListWidgetLinkProps,
  branchLike?: BranchLikeBase,
  isStandardMode = false,
): string {
  const { metric, scope } = props;
  const params = new URLSearchParams({
    id: projectKey,
    issueStatuses: ALL_FILTERABLE_CODE_ISSUE_STATUSES,
    rules: facetValue,
    ...getBranchLikeQuery(branchLike),
  });

  if (scope === CodeScope.New) {
    params.set('sinceLeakPeriod', 'true');
  }

  if (metric.type === DashboardMetricType.Rich) {
    const filters = metric.measureFilters;
    if (filters?.issueStatus) {
      params.set('issueStatuses', filters.issueStatus);
    }
    addIssueModeFilters(params, filters ?? {}, isStandardMode);
  }

  return `/project/issues?${params.toString()}`;
}

export function getPortfolioDashboardMeasuresUrl(
  portfolioId: string,
  _enterpriseKey: string,
  _metric: MetricKey,
): To {
  return getPortfolioUrl(portfolioId);
}

export function getPortfolioDashboardWidgetDrilldownUrl(
  widgetKey: string | undefined,
  query?: string,
): string | undefined {
  if (!widgetKey) {
    return undefined;
  }

  const searchParams = new URLSearchParams(query ? { q: query } : undefined);
  const currentSearch = new URLSearchParams(window.location.search);

  const portfolioKey = currentSearch.get('id');
  if (portfolioKey) {
    searchParams.set('id', portfolioKey);
  }

  const contextKey = currentSearch.get('context');
  if (contextKey) {
    searchParams.set('context', contextKey);
  }

  const search = searchParams.toString();
  const path = `breakdown/${encodeURIComponent(widgetKey)}`;
  return search ? `${path}?${search}` : path;
}

function getMetricKeyForScope(metricKey: string, isNewCode: boolean): string {
  if (!isNewCode || metricKey.startsWith('new_')) {
    return metricKey;
  }

  return metricKey === MetricKey.sqale_rating
    ? MetricKey.new_maintainability_rating
    : `new_${metricKey}`;
}

function addIssueModeFilters(
  params: URLSearchParams,
  filters: Pick<MeasureFilters, 'impactSeverities' | 'impactSoftwareQuality'>,
  isStandardMode: boolean,
): void {
  const modeFilters = resolveIssueSearchFiltersForMode(filters, isStandardMode);
  for (const [key, value] of Object.entries(modeFilters)) {
    params.set(key, Array.isArray(value) ? value.join(',') : value);
  }
}

function addHotspotStatusFilter(params: URLSearchParams, value: string): void {
  const status = value.toUpperCase();
  if (status === 'TO_REVIEW' || status === 'FIXED' || status === 'SAFE') {
    params.set('status', status);
  }
}

function prefixUrlFragment(fragment: string, prefix: '?' | '#'): string {
  return fragment.length > 0 && !fragment.startsWith(prefix) ? `${prefix}${fragment}` : fragment;
}
