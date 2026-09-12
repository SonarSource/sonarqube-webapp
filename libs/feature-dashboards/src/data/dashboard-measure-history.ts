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
import type { EntityType } from '../types/types';
import { MS_PER_DAY } from '../utils/datetime';
import { parseLineChartRatingValue } from '../utils/lineChartHistoryUtils';
import { lineChartMeasureTransformFlags } from '../utils/lineChartMeasureTransformFlags';
import { parseMeasureValue } from '../utils/measureValues';
import { dashboardMeasureHistoryMetricKey, type DashboardMeasure } from './dashboard-measure';
import type { MeasureFilters } from './widgets/shared';

interface DashboardIssueHistoryDay {
  date: string;
  distribution: { key: string; value?: number }[];
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

export interface DashboardMeasureQueryInput {
  entityId: string;
  entityType: EntityType;
  measure: DashboardMeasure;
  months?: number;
}

export interface DashboardMeasureQueryDefinition {
  queryFn: () => Promise<DashboardMeasureHistory>;
  queryKey: readonly ['dashboard-measure', EntityType, string, DashboardMeasure, number];
}

const RESOLVED_ISSUES_PERIOD_DAYS = 30;

export interface ResolvedIssuesCountValues {
  currentTotal: number;
  sparklineSeries: number[];
  trendValues: number[];
}

export interface DashboardHistoryPoint {
  date: Date;
  value: number;
}

/**
 * Converts daily resolved-issue counts into the rolling 30-day values represented by the count
 * widget. A trend is only available when two complete, adjacent 30-day periods are present.
 */
export function resolvedIssuesCountValues(
  points: readonly DashboardHistoryPoint[],
): ResolvedIssuesCountValues {
  if (points.length === 0) {
    return { currentTotal: 0, sparklineSeries: [], trendValues: [] };
  }

  const sortedPoints = [...points].sort(
    (left, right) => left.date.getTime() - right.date.getTime(),
  );
  const firstPoint = sortedPoints[0];
  const currentPoint = sortedPoints.at(-1);
  if (firstPoint === undefined || currentPoint === undefined) {
    return { currentTotal: 0, sparklineSeries: [], trendValues: [] };
  }
  const firstTimestamp = firstPoint.date.getTime();
  const currentTimestamp = currentPoint.date.getTime();
  const periodSpan = (RESOLVED_ISSUES_PERIOD_DAYS - 1) * MS_PER_DAY;
  const sumPeriodEndingAt = (endTimestamp: number) =>
    sortedPoints.reduce(
      (total, point) =>
        point.date.getTime() >= endTimestamp - periodSpan && point.date.getTime() <= endTimestamp
          ? total + point.value
          : total,
      0,
    );
  const sparklineSeries = sortedPoints.flatMap(({ date }) =>
    date.getTime() - firstTimestamp >= periodSpan ? [sumPeriodEndingAt(date.getTime())] : [],
  );
  const currentTotal = sumPeriodEndingAt(currentTimestamp);
  const hasTwoCompletePeriods =
    currentTimestamp - firstTimestamp >= (RESOLVED_ISSUES_PERIOD_DAYS * 2 - 1) * MS_PER_DAY;
  const trendValues = hasTwoCompletePeriods
    ? [sumPeriodEndingAt(currentTimestamp - RESOLVED_ISSUES_PERIOD_DAYS * MS_PER_DAY), currentTotal]
    : [currentTotal];

  return { currentTotal, sparklineSeries, trendValues };
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
  return dashboardMeasureHistoryPoints(data, measure, metadataType, measureFilters).map(
    ({ value }) => value,
  );
}

export function dashboardMeasureHistoryPoints(
  data: DashboardMeasureHistory | undefined,
  measure: DashboardMeasure,
  metadataType?: string,
  measureFilters?: MeasureFilters,
): DashboardHistoryPoint[] {
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
      const date = new Date(day.date);
      return value === undefined || Number.isNaN(date.getTime()) ? [] : [{ date, value }];
    });
  }
  return sortDashboardHistory(data.history)
    .map((day) => ({
      date: new Date(day.date),
      value:
        day.distribution.length === 0 &&
        data.api !== 'issue-count-history' &&
        !(
          data.api === 'issue-resolution-history' &&
          measure.api === 'issue-resolution-history' &&
          measure.statistic === IssueResolutionStatistic.ResolvedIssues
        )
          ? Number.NaN
          : day.distribution.reduce((total, entry) => total + (entry.value ?? Number.NaN), 0),
    }))
    .filter(({ date, value }) => !Number.isNaN(date.getTime()) && Number.isFinite(value));
}

export function dashboardMeasureTrendWindowValues(
  points: readonly DashboardHistoryPoint[],
  days = 30,
): number[] {
  const current = points.at(-1);
  if (current === undefined) {
    return [];
  }

  const threshold = current.date.getTime() - days * MS_PER_DAY;
  let startIndex = 0;
  points.forEach(({ date }, index) => {
    if (date.getTime() <= threshold) {
      startIndex = index;
    }
  });
  return points.slice(startIndex).map(({ value }) => value);
}

export function dashboardMeasureTrendPoints(
  points: readonly DashboardHistoryPoint[],
  measure: DashboardMeasure,
): readonly DashboardHistoryPoint[] {
  if (measure.api !== 'sca-resolution-history') {
    return points;
  }

  // SCA history zero-fills the requested range before its first persisted observation. Until the
  // API exposes that validity boundary, use the first observed MTTR to avoid treating synthetic
  // leading zeroes as mature history.
  const firstObservedValueIndex = points.findIndex(({ value }) => value !== 0);
  return firstObservedValueIndex === -1 ? [] : points.slice(firstObservedValueIndex);
}

export function hasCompleteDashboardHistory(
  points: readonly DashboardHistoryPoint[],
  days: number,
  asOf: number = points.at(-1)?.date.getTime() ?? Date.now(),
): boolean {
  const firstPoint = points.at(0);
  return firstPoint !== undefined && firstPoint.date.getTime() <= asOf - days * MS_PER_DAY;
}

export function dashboardMeasureTrendValues(
  points: readonly DashboardHistoryPoint[],
  minimumHistoryDays: number,
  allowPartialHistory = false,
  asOf: number = points.at(-1)?.date.getTime() ?? Date.now(),
): number[] {
  if (!hasCompleteDashboardHistory(points, minimumHistoryDays, asOf)) {
    const first = points.at(0);
    const last = points.at(-1);
    return allowPartialHistory && first !== undefined && last !== undefined && first !== last
      ? [first.value, last.value]
      : [];
  }

  const comparisonThreshold = asOf - RESOLVED_ISSUES_PERIOD_DAYS * MS_PER_DAY;
  const past = [...points].reverse().find(({ date }) => date.getTime() <= comparisonThreshold);
  const current = points.at(-1);
  return past === undefined || current === undefined || past === current
    ? []
    : [past.value, current.value];
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
