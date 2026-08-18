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

import { cssVar } from '@sonarsource/echoes-react';
import { isDefined } from '~shared/helpers/types';
import { MetricKey } from '~shared/types/metrics';
import {
  aggregateSmallSegments,
  formatSegmentLabel,
  getSegmentColor,
  sortSegments,
} from '../components/visualizations/pie-chart/pieChartSegmentUtils';
import {
  HistoryRange,
  LineChartGroupBy,
  type LineChartGroupByValue,
} from '../data/widgets/line-chart';
import { MeasureFilters, PieChartIssueSlice, PieChartMetric } from '../types/dashboard-widget';
import type { IssueHistoryDay } from '../types/organization-issue-history';
import type {
  OrganizationsIssueCountHistoryDay,
  OrganizationsMeasuresHistoryDay,
} from '../types/organization-line-chart-history';
import type { LineChartDataPoint, LineChartSeries } from '../types/visualization';
import type { RuleMetadataByKey } from '../types/widget-common';
import { mapLineChartGroupByToPieChartSlice } from '../widget-creation-modal/utils/lineChartGroupByHelpers';
import { isDateInLineChartRange } from './datetime';
import { parseLineChartRatingValue } from './lineChartHistoryUtils';
import { lineChartMeasureTransformFlags } from './lineChartMeasureTransformFlags';
import { parseMeasureValue } from './measureValues';
import { sumIssueCountDistribution } from './organizationIssueHistory';

function lineChartPointsFromDatedValues(
  rows: ReadonlyArray<{ date: string | Date; value: string }>,
  historyRange: HistoryRange,
  metricKey: MetricKey,
  metricType: string | undefined,
  measureFilters: MeasureFilters | undefined,
): LineChartDataPoint[] {
  const { isMetricData, isMetricNumeric, isMetricRating } = lineChartMeasureTransformFlags(
    metricKey,
    metricType,
  );

  const points: LineChartDataPoint[] = [];
  for (const row of rows) {
    const pointDate = new Date(row.date);
    if (!isDateInLineChartRange(pointDate, historyRange)) {
      continue;
    }
    const parsedValue =
      isMetricData && isMetricNumeric ? parseMeasureValue(row.value, measureFilters) : row.value;
    const yValue = resolveLineChartYValue(parsedValue, isMetricRating);
    if (!isDefined(yValue) || Number.isNaN(yValue)) {
      continue;
    }
    points.push({ x: pointDate, y: yValue });
  }
  return points;
}

function resolveLineChartYValue(
  parsedValue: string | number | undefined,
  isMetricRating: boolean,
): number | undefined {
  if (isMetricRating) {
    return parseLineChartRatingValue(parsedValue ?? '');
  }
  if (typeof parsedValue === 'string') {
    return Number(parsedValue);
  }
  return parsedValue ?? 0;
}

export function portfolioMeasuresToLineData(
  days: OrganizationsMeasuresHistoryDay[] | undefined,
  measuresRowMetricKey: string,
  historyRange: HistoryRange,
  metricKey: MetricKey,
  metricType: string | undefined,
  measureFilters: MeasureFilters | undefined,
): LineChartDataPoint[] {
  if (!days?.length) {
    return [];
  }

  const rows: Array<{ date: string | Date; value: string }> = [];
  for (const day of days) {
    const entry = day.measures.find((m) => m.metric === measuresRowMetricKey);
    if (!isDefined(entry?.value)) {
      continue;
    }
    rows.push({ date: day.date, value: entry.value });
  }
  return lineChartPointsFromDatedValues(rows, historyRange, metricKey, metricType, measureFilters);
}

export function portfolioIssueHistoryToLineData(
  days: OrganizationsIssueCountHistoryDay[] | undefined,
  historyRange: HistoryRange,
): LineChartDataPoint[] {
  if (!days?.length) {
    return [];
  }

  const points: LineChartDataPoint[] = [];
  for (const day of days) {
    const pointDate = new Date(day.date);
    if (!isDateInLineChartRange(pointDate, historyRange)) {
      continue;
    }
    points.push({ x: pointDate, y: sumIssueCountDistribution(day) });
  }
  return points;
}

function issueCountForDistributionKey(
  day: OrganizationsIssueCountHistoryDay,
  distributionKey: string,
): number {
  const entry = day.distribution.find((e) => e.key === distributionKey);
  return entry?.value ?? 0;
}

function issueCountForOtherKeys(
  day: OrganizationsIssueCountHistoryDay,
  keptKeys: readonly string[],
): number {
  const kept = new Set(keptKeys);
  return day.distribution
    .filter((entry) => !kept.has(entry.key))
    .reduce((sum, entry) => sum + entry.value, 0);
}

function resolveSeriesKeys(
  filteredDays: OrganizationsIssueCountHistoryDay[],
  groupBy: LineChartGroupByValue,
  pieChartSlice: PieChartIssueSlice,
): string[] {
  if (filteredDays.length === 0) {
    return [];
  }

  const keyCounts = new Map<string, number>();
  for (const day of filteredDays) {
    for (const entry of day.distribution) {
      if (entry.value <= 0) {
        continue;
      }
      keyCounts.set(entry.key, (keyCounts.get(entry.key) ?? 0) + entry.value);
    }
  }

  if (groupBy === LineChartGroupBy.Rule) {
    const entries = [...keyCounts.entries()].sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    if (total === 0) {
      return [];
    }
    return aggregateSmallSegments(entries, total).map(([key]) => key);
  }

  const entries = [...keyCounts.entries()];
  return sortSegments(entries, pieChartSlice, PieChartMetric.IssueCount).map(([key]) => key);
}

export function portfolioIssueHistoryToMultiLineSeries(
  days: OrganizationsIssueCountHistoryDay[] | undefined,
  historyRange: HistoryRange,
  groupBy: LineChartGroupByValue,
  rulesByKey?: RuleMetadataByKey,
): LineChartSeries[] {
  if (!days?.length || groupBy === LineChartGroupBy.None) {
    return [];
  }

  const pieChartSlice = mapLineChartGroupByToPieChartSlice(groupBy) as PieChartIssueSlice;
  if (!pieChartSlice) {
    return [];
  }

  const filteredDays = days.filter((day) =>
    isDateInLineChartRange(new Date(day.date), historyRange),
  );
  if (filteredDays.length === 0) {
    return [];
  }

  const seriesKeys = resolveSeriesKeys(filteredDays, groupBy, pieChartSlice);
  if (seriesKeys.length === 0) {
    return [];
  }

  const explicitKeys = seriesKeys.filter((key) => !key.startsWith('OTHER_'));

  return seriesKeys.map((key, index) => {
    const isOther = key.startsWith('OTHER_');
    const data: LineChartDataPoint[] = filteredDays.map((day) => ({
      x: new Date(day.date),
      y: isOther
        ? issueCountForOtherKeys(day, explicitKeys)
        : issueCountForDistributionKey(day, key),
    }));

    return {
      color: getSegmentColor(key, index, pieChartSlice),
      data,
      id: key,
      label: formatSegmentLabel(key, PieChartMetric.IssueCount, pieChartSlice, {
        rules: rulesByKey,
      }),
    };
  });
}

export function rulesFromGroupedLineChartSeries(series: LineChartSeries[]): string[] {
  return series.map((entry) => entry.id).filter((key) => !key.startsWith('OTHER_'));
}

/**
 * Re-derive each series' display label from `rulesByKey` without rebuilding the rest of the series.
 * Used by widget callers that fetch rule labels in a second pass after the issue-history query
 * resolves.
 */
export function relabelMultiLineSeriesWithRules(
  series: LineChartSeries[],
  groupBy: LineChartGroupByValue,
  rulesByKey: RuleMetadataByKey,
): LineChartSeries[] {
  if (series.length === 0 || groupBy === LineChartGroupBy.None) {
    return series;
  }
  const pieChartSlice = mapLineChartGroupByToPieChartSlice(groupBy) as PieChartIssueSlice;
  if (!pieChartSlice) {
    return series;
  }
  return series.map((entry) => ({
    ...entry,
    label: formatSegmentLabel(entry.id, PieChartMetric.IssueCount, pieChartSlice, {
      rules: rulesByKey,
    }),
  }));
}

export function lineChartDataToSingleSeries(
  data: LineChartDataPoint[],
  label: string,
  color = cssVar('color-charts-categorical-1'),
): LineChartSeries[] {
  if (data.length === 0) {
    return [];
  }
  return [
    {
      color,
      data,
      id: 'total',
      label,
    },
  ];
}

export function issueHistoryToLineData(
  days: IssueHistoryDay[] | undefined,
  historyRange: HistoryRange,
): LineChartDataPoint[] {
  if (!days?.length) {
    return [];
  }
  const points: LineChartDataPoint[] = [];
  for (const day of days) {
    const pointDate = new Date(day.date);
    if (!isDateInLineChartRange(pointDate, historyRange)) {
      continue;
    }
    const value = day.distribution.find((e) => e.key === 'all')?.value;
    if (value === undefined) {
      continue;
    }
    points.push({ x: pointDate, y: value });
  }
  return points;
}

export function projectMeasuresHistoryToLineChartData(
  measuresHistory:
    { measures: Array<{ history: Array<{ date: string | Date; value?: string }> }> } | undefined,
  historyRange: HistoryRange,
  metricKey: MetricKey,
  metricType: string | undefined,
  measureFilters: MeasureFilters | undefined,
): LineChartDataPoint[] {
  const history = measuresHistory?.measures[0]?.history;
  if (!history?.length) {
    return [];
  }

  const rows: Array<{ date: string | Date; value: string }> = [];
  for (const measure of history) {
    if (!isDefined(measure.value)) {
      continue;
    }
    rows.push({ date: measure.date, value: measure.value });
  }
  return lineChartPointsFromDatedValues(rows, historyRange, metricKey, metricType, measureFilters);
}
