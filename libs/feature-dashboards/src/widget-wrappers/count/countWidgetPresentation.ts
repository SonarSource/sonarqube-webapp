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
import type { IntlShape } from 'react-intl';
import type { CountWidgetProps } from '../../components/visualizations/CountWidget';
import type { TrendIndicatorType } from '../../components/visualizations/TrendIndicator';
import type { DashboardMeasure } from '../../data/dashboard-measure';
import {
  dashboardCountMetricType,
  dashboardMeasureHistoryPoints,
  dashboardMeasureMetricKey,
  dashboardMeasureTrendPoints,
  dashboardMeasureTrendValues,
  dashboardMeasureTrendWindowValues,
  hasCompleteDashboardHistory,
  resolvedIssuesCountValues,
  type DashboardHistoryPoint,
  type DashboardMeasureHistory,
  type ResolvedIssuesCountValues,
} from '../../data/dashboard-measure-history';
import {
  DashboardMetricType,
  type DashboardMetric,
  type MeasureFilters,
} from '../../data/widgets/shared';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import { computeDashboardMeasureTrendData } from '../../utils/countWidgetTrend';
import { startOfUTCDay } from '../../utils/datetime';

const STANDARD_TREND_HISTORY_DAYS = 30;
const PERIOD_COMPARISON_TREND_HISTORY_DAYS = 59;
const RESOLVED_ISSUES_CURRENT_PERIOD_DAYS = 29;

type CountWidgetPresentation = Pick<
  CountWidgetProps,
  | 'metricKey'
  | 'metricType'
  | 'showTrendIndicator'
  | 'sparklineSeries'
  | 'trendIndicatorData'
  | 'unitLabel'
  | 'value'
>;

interface CountWidgetPresentationOptions {
  activityUrl: Partial<Path>;
  data: DashboardMeasureHistory | undefined;
  formatMessage: IntlShape['formatMessage'];
  formatMttr: (value: number) => string;
  measure: DashboardMeasure;
  metric: DashboardMetric;
  metricDirection: number;
  metricDirectionOverride?: number;
  metadataType?: string;
  trendVisible: boolean;
}

function isResolvedIssuesMetric(metric: DashboardMetric): boolean {
  return (
    metric.type === DashboardMetricType.IssueResolution &&
    metric.statistic === IssueResolutionStatistic.ResolvedIssues
  );
}

function getTrendIndicatorType(isResolvedIssues: boolean, isMttr: boolean): TrendIndicatorType {
  if (isResolvedIssues) {
    return 'resolved-issues';
  }
  return isMttr ? 'rolling-average' : 'snapshot';
}

export function dashboardCountHistoryMonths(
  metric: DashboardMetric,
  trendVisible: boolean,
): number | undefined {
  return isResolvedIssuesMetric(metric) || trendVisible ? 2 : undefined;
}

function getLatestValue(
  historyPoints: readonly DashboardHistoryPoint[],
  measure: DashboardMeasure,
  resolvedIssuesValues: ResolvedIssuesCountValues | undefined,
): number | undefined {
  if (resolvedIssuesValues !== undefined) {
    return resolvedIssuesValues.currentTotal;
  }
  const latest = historyPoints.at(-1)?.value;
  if (latest !== undefined) {
    return latest;
  }
  return measure.api === 'issue-count-history' ? 0 : undefined;
}

function getTrendValues(
  trendHistoryPoints: readonly DashboardHistoryPoint[],
  resolvedIssuesValues: ResolvedIssuesCountValues | undefined,
  hasMatureHistory: boolean,
  asOf: number,
  minimumHistoryDays: number,
): number[] {
  if (resolvedIssuesValues !== undefined) {
    return hasMatureHistory ? resolvedIssuesValues.trendValues : [];
  }
  return dashboardMeasureTrendValues(trendHistoryPoints, minimumHistoryDays, asOf);
}

function getSparklineSeries(
  trendVisible: boolean,
  trendHistoryPoints: readonly DashboardHistoryPoint[],
  resolvedIssuesValues: ResolvedIssuesCountValues | undefined,
): number[] | undefined {
  if (!trendVisible) {
    return undefined;
  }
  if (resolvedIssuesValues !== undefined) {
    return resolvedIssuesValues.sparklineSeries;
  }
  return dashboardMeasureTrendWindowValues(trendHistoryPoints);
}

function getUnitLabel(
  measure: DashboardMeasure,
  formatMessage: IntlShape['formatMessage'],
): string | undefined {
  return measure.api === 'issue-density-history'
    ? formatMessage({ id: 'dashboard.widget.count.issue_density.unit' })
    : undefined;
}

export function buildCountWidgetPresentation(
  options: Readonly<CountWidgetPresentationOptions>,
): CountWidgetPresentation | null {
  const {
    activityUrl,
    data,
    formatMessage,
    formatMttr,
    measure,
    metric,
    metricDirection,
    metricDirectionOverride,
    metadataType,
    trendVisible,
  } = options;
  const measureFilters: MeasureFilters | undefined =
    metric.type === DashboardMetricType.Rich ? metric.measureFilters : undefined;
  const historyPoints = dashboardMeasureHistoryPoints(data, measure, metadataType, measureFilters);
  const trendHistoryPoints = dashboardMeasureTrendPoints(historyPoints, measure);
  const isResolvedIssues = isResolvedIssuesMetric(metric);
  const asOf = startOfUTCDay(Date.now()).getTime();
  const resolvedIssuesValues = isResolvedIssues
    ? resolvedIssuesCountValues(historyPoints, asOf)
    : undefined;
  const latest = getLatestValue(historyPoints, measure, resolvedIssuesValues);
  if (latest === undefined) {
    return null;
  }

  const metricKey = dashboardMeasureMetricKey(measure);
  const metricType = dashboardCountMetricType(measure, metadataType);
  const isMttr = metricType === 'MTTR_CALENDAR';
  const isPeriodComparison = isResolvedIssues || isMttr;
  const requiredHistoryDays = isPeriodComparison
    ? PERIOD_COMPARISON_TREND_HISTORY_DAYS
    : STANDARD_TREND_HISTORY_DAYS;
  const hasMatureHistory = hasCompleteDashboardHistory(
    trendHistoryPoints,
    requiredHistoryDays,
    asOf,
  );
  const trendValues = getTrendValues(
    trendHistoryPoints,
    resolvedIssuesValues,
    hasMatureHistory,
    asOf,
    requiredHistoryDays,
  );
  const computedTrendData = computeDashboardMeasureTrendData({
    activityUrl,
    formatMttr,
    isMttr,
    measureFilters,
    metric: { direction: metricDirection, type: metricType },
    metricDirectionOverride,
    values: trendValues,
  });
  let sparklineSeries: number[] | undefined;
  if (trendVisible) {
    sparklineSeries = hasMatureHistory
      ? getSparklineSeries(true, trendHistoryPoints, resolvedIssuesValues)
      : [];
  }
  return {
    metricKey,
    metricType,
    showTrendIndicator: trendVisible,
    sparklineSeries,
    trendIndicatorData: {
      historyStartDate: trendHistoryPoints.at(0)?.date,
      isCurrentPeriodIncomplete:
        isResolvedIssues &&
        !hasCompleteDashboardHistory(trendHistoryPoints, RESOLVED_ISSUES_CURRENT_PERIOD_DAYS, asOf),
      isPending: false,
      requiredHistoryDays: isPeriodComparison ? 60 : 30,
      trendType: getTrendIndicatorType(isResolvedIssues, isMttr),
      trendData: computedTrendData,
    },
    unitLabel: getUnitLabel(measure, formatMessage),
    value: isMttr ? formatMttr(latest) : String(latest),
  };
}
