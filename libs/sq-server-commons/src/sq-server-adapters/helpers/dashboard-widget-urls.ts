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
import { getComponentIssuesUrl, getPathUrlAsString, getRuleUrl } from '~shared/helpers/urls';
import { MetricKey } from '~shared/types/metrics';
import {
  CodeScope,
  DashboardMetricType,
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartMetric,
  type CodeScopeValue,
  type MeasureFilters,
  type PieChartWidget,
  type TopListWidgetLinkProps,
} from '../../helpers/dashboard-widget-data';
import {
  getComponentDrilldownUrl,
  getMeasureHistoryUrl,
  getPortfolioUrl,
} from '../../helpers/urls';

export function getDashboardDocumentationUrl(docLink: string): string {
  return docLink;
}

export function getProjectDashboardMeasureHistoryUrl(
  component: string,
  metric: string,
): Partial<Path> {
  return getMeasureHistoryUrl(component, metric);
}

export function getProjectDashboardMeasuresUrl(props: {
  component: string;
  metric: string;
  sinceLeakPeriod?: boolean;
}): To {
  return getComponentDrilldownUrl({
    componentKey: props.component,
    metric: getMetricKeyForScope(props.metric, props.sinceLeakPeriod === true),
  });
}

export function getProjectDashboardSummaryUrl(component: string, overall = false): To {
  return {
    pathname: '/dashboard',
    search: new URLSearchParams({
      codeScope: overall ? CodeScope.Overall : CodeScope.New,
      id: component,
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
): To {
  return getComponentIssuesUrl(component, {
    impactSeverities: measureFilters?.impactSeverities?.join(','),
    impactSoftwareQualities: measureFilters?.impactSoftwareQuality,
    issueStatuses: measureFilters?.issueStatus ?? 'OPEN,CONFIRMED',
    ...(scope === CodeScope.New ? { sinceLeakPeriod: 'true' } : {}),
  });
}

export function buildProjectRawCountWidgetLink(
  component: string,
  metricKey: MetricKey,
  scope: CodeScopeValue,
): To {
  return getComponentDrilldownUrl({
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
): string {
  const { filter, metric, scope, slice } = props;
  const params = new URLSearchParams({ id: projectKey });

  if (metric === PieChartMetric.IssueCount) {
    if (scope === CodeScope.New) {
      params.set('sinceLeakPeriod', 'true');
    }
    if (slice !== PieChartIssueSlice.IssueStatuses) {
      params.set('issueStatuses', 'OPEN,CONFIRMED');
    }
    params.set(slice, value);
    addIssueQualityFilter(params, filter);
    return `/project/issues?${params.toString()}`;
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

  return `/dashboard?${params.toString()}`;
}

export function getProjectDashboardTopListRowUrl(
  projectKey: string,
  facetValue: string,
  props: TopListWidgetLinkProps,
): string {
  const { metric, scope } = props;
  const params = new URLSearchParams({
    id: projectKey,
    issueStatuses: 'OPEN,CONFIRMED',
    rules: facetValue,
  });

  if (scope === CodeScope.New) {
    params.set('sinceLeakPeriod', 'true');
  }

  if (metric.type === DashboardMetricType.Rich) {
    const filters = metric.measureFilters;
    if (filters?.issueStatus) {
      params.set('issueStatuses', filters.issueStatus);
    }
    if (filters?.impactSoftwareQuality) {
      params.set('impactSoftwareQualities', filters.impactSoftwareQuality);
    }
    if (filters?.impactSeverities?.length) {
      params.set('impactSeverities', filters.impactSeverities.join(','));
    }
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
  const portfolioKey = new URLSearchParams(window.location.search).get('id');

  if (portfolioKey) {
    searchParams.set('id', portfolioKey);
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

function addIssueQualityFilter(params: URLSearchParams, filter: string): void {
  const quality = {
    [PieChartIssueFilter.Maintainability]: 'MAINTAINABILITY',
    [PieChartIssueFilter.Reliability]: 'RELIABILITY',
    [PieChartIssueFilter.Security]: 'SECURITY',
  }[filter];

  if (quality) {
    params.set('impactSoftwareQualities', quality);
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
