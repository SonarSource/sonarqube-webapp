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
import type { MetricKey } from '~shared/types/metrics';
import { getPortfolioUrl } from '../../helpers/urls';
import { unsupportedDashboardWidgetAdapter } from './unsupported-dashboard-widget-adapter';

export function getDashboardDocumentationUrl(_docLink: string): string {
  return unsupportedDashboardWidgetAdapter();
}

export function getProjectDashboardMeasureHistoryUrl(
  _component: string,
  _metric: string,
): Partial<Path> {
  return unsupportedDashboardWidgetAdapter();
}

export function getProjectDashboardMeasuresUrl(_props: {
  component: string;
  metric: string;
  sinceLeakPeriod?: boolean;
}): To {
  return unsupportedDashboardWidgetAdapter();
}

export function getProjectDashboardSummaryUrl(_component: string, _overall = false): To {
  return unsupportedDashboardWidgetAdapter();
}

export function getProjectDashboardRuleUrl(_rule: string, _organization?: string): string {
  return unsupportedDashboardWidgetAdapter();
}

export function buildProjectRichCountWidgetLink(
  _component: string,
  _measureFilters: unknown,
  _scope: string,
): To {
  return unsupportedDashboardWidgetAdapter();
}

export function buildProjectRawCountWidgetLink(
  _component: string,
  _metricKey: MetricKey,
  _scope: string,
): To {
  return unsupportedDashboardWidgetAdapter();
}

export function serializeDashboardWidgetUrl(_url: To): string {
  return unsupportedDashboardWidgetAdapter();
}

export function getProjectDashboardPieChartSegmentUrl(
  _projectKey: string,
  _value: string,
  _props: unknown,
): string {
  return unsupportedDashboardWidgetAdapter();
}

export function getProjectDashboardTopListRowUrl(
  _projectKey: string,
  _facetValue: string,
  _props: unknown,
): string {
  return unsupportedDashboardWidgetAdapter();
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

  const search = query ? new URLSearchParams({ q: query }).toString() : '';
  return search ? `breakdown/${widgetKey}?${search}` : `breakdown/${widgetKey}`;
}
