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

import { MetricKey, MetricType } from '~shared/types/metrics';
import { IssueResolutionStatistic } from '../types/organization-issue-resolution-history';
import { parseLineChartRatingValue } from '../utils/lineChartHistoryUtils';
import { lineChartMeasureTransformFlags } from '../utils/lineChartMeasureTransformFlags';
import { parseMeasureValue } from '../utils/measureValues';
import { dashboardMeasureHistoryMetricKey, type DashboardMeasure } from './dashboard-measure';
import type { MeasureFilters } from './widgets/shared';

interface DashboardIssueHistoryDay {
  date: string;
  distribution: { key: string; value: number }[];
}

interface DashboardMeasuresHistoryDay {
  date: string;
  measures: { metric: string; type: string; value: string }[];
}

export type DashboardMeasureHistory =
  | { api: 'issue-count-history'; history: DashboardIssueHistoryDay[] }
  | { api: 'issue-density-history'; history: DashboardIssueHistoryDay[] }
  | { api: 'issue-resolution-history'; history: DashboardIssueHistoryDay[] }
  | { api: 'measures-history'; history: DashboardMeasuresHistoryDay[] }
  | { api: 'sca-resolution-history'; history: DashboardIssueHistoryDay[] };

type DashboardMeasureEntityType = 'PORTFOLIO' | 'PROJECT_BRANCH';

export interface DashboardMeasureQueryInput {
  entityId: string;
  entityType: DashboardMeasureEntityType;
  measure: DashboardMeasure;
  months?: number;
}

export interface DashboardMeasureQueryDefinition {
  queryFn: () => Promise<DashboardMeasureHistory>;
  queryKey: readonly [
    'dashboard-measure',
    DashboardMeasureEntityType,
    string,
    DashboardMeasure,
    number,
  ];
}

export function dashboardMeasureMetricKey(measure: DashboardMeasure): MetricKey {
  return 'metricKey' in measure ? measure.metricKey : MetricKey.violations;
}

export function dashboardMeasureHistoryValues(
  data: DashboardMeasureHistory | undefined,
  measure: DashboardMeasure,
  metadataType?: string,
  measureFilters?: MeasureFilters,
): number[] {
  if (data === undefined) {
    return [];
  }
  if (data.api === 'measures-history') {
    if (measure.api !== 'measures-history') {
      return [];
    }
    const requestedMetricKey = dashboardMeasureHistoryMetricKey(measure);
    return sortDashboardHistory(data.history).flatMap((day) => {
      const rawValue = day.measures.find((item) => item.metric === requestedMetricKey)?.value;
      const value = parseDashboardMeasureValue(
        rawValue,
        measure.metricKey,
        metadataType,
        measureFilters,
      );
      return value === undefined ? [] : [value];
    });
  }
  return sortDashboardHistory(data.history).map((day) =>
    day.distribution.reduce((total, entry) => total + entry.value, 0),
  );
}

export function parseDashboardMeasureValue(
  rawValue: string | undefined,
  metricKey: MetricKey,
  metadataType?: string,
  measureFilters?: MeasureFilters,
): number | undefined {
  const { isMetricData, isMetricRating } = lineChartMeasureTransformFlags(metricKey, metadataType);
  if (rawValue === undefined) {
    return undefined;
  }
  if (isMetricRating) {
    return parseLineChartRatingValue(rawValue);
  }
  const parsedValue = isMetricData ? parseMeasureValue(rawValue, measureFilters) : rawValue;
  const value = Number(parsedValue);
  return Number.isFinite(value) ? value : undefined;
}

export function sortDashboardHistory<T extends { date: string }>(history: readonly T[]): T[] {
  return [...history].sort((left, right) => Date.parse(left.date) - Date.parse(right.date));
}

export function dashboardCountMetricType(
  measure: DashboardMeasure,
  metadataType: string | undefined,
): string {
  if (measure.api === 'issue-density-history') {
    return MetricType.Float;
  }
  if (
    (measure.api === 'issue-resolution-history' &&
      measure.statistic !== IssueResolutionStatistic.ResolvedIssues) ||
    measure.api === 'sca-resolution-history'
  ) {
    return 'MTTR_CALENDAR';
  }
  const normalizedType = metadataType?.toUpperCase();
  return normalizedType === MetricType.Data
    ? MetricType.Integer
    : (normalizedType ?? MetricType.Integer);
}
