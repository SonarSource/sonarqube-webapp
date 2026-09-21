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
import type { IntlShape } from 'react-intl';
import { isDefined } from '~shared/helpers/types';
import { MetricKey } from '~shared/types/metrics';
import { formatSegmentLabel } from '../components/visualizations/pie-chart/pieChartSegmentUtils';
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
  formatMessage?: IntlShape['formatMessage'],
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
    label: formatSegmentLabel(
      entry.id,
      PieChartMetric.IssueCount,
      pieChartSlice,
      { rules: rulesByKey },
      formatMessage,
    ),
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
