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
import { formatDashboardMeasure } from '~adapters/helpers/dashboard-measures';
import { isDefined } from '~shared/helpers/types';
import type { Metric } from '~shared/types/measures';
import { MetricType } from '~shared/types/metrics';
import type { TrendData } from '../components/visualizations/TrendIndicator';
import { DashboardMetricType, type DashboardMetric } from '../data/widgets/shared';
import { MeasureFilters } from '../types/dashboard-widget';
import { ScaResolutionStatistic } from '../types/organization-sca-resolution-history';
import {
  ISSUE_RESOLUTION_METRIC_DIRECTION,
  SCA_RESOLUTION_METRIC_DIRECTION,
} from '../types/widget-common';
import { getThirtyDayTrendValues, HistoricalTrendValues } from './datetime';
import { parseMeasureValue } from './measureValues';

export function computeTrendData(args: {
  absoluteChangeFormatter?: (change: number) => string;
  activityUrl: Partial<Path>;
  currentValue: string;
  measureFilters: MeasureFilters | undefined;
  metric: Pick<Metric, 'direction' | 'type'>;
  metricDirectionOverride?: number;
  pastValue: string;
}): TrendData | null {
  const {
    absoluteChangeFormatter,
    activityUrl,
    currentValue,
    measureFilters,
    metric,
    metricDirectionOverride,
    pastValue,
  } = args;

  const parsedCurrent = parseMeasureValue(currentValue, measureFilters);
  const parsedPast = parseMeasureValue(pastValue, measureFilters);

  if (parsedCurrent === undefined || parsedPast === undefined) {
    return null;
  }

  const current = Number(parsedCurrent);
  const past = Number(parsedPast);
  if (Number.isNaN(current) || Number.isNaN(past)) {
    return null;
  }

  const change = current - past;
  const metricDirection =
    metricDirectionOverride ?? (metric.type === MetricType.Data ? -1 : (metric.direction ?? -1));

  const percentageChange = past === 0 ? 0 : (change / Math.abs(past)) * 100;
  const formattedChange =
    past === 0
      ? (absoluteChangeFormatter?.(Math.abs(change)) ??
        formatDashboardMeasure(Math.abs(change), metric.type ?? MetricType.Integer))
      : formatDashboardMeasure(percentageChange, MetricType.Percent, {
          decimals: 1,
          omitExtraDecimalZeros: true,
        });
  const roundedChange = past === 0 ? change : Number.parseFloat(formattedChange);

  return {
    activityUrl,
    change,
    formattedChange,
    metricDirection,
    past,
    roundedChange,
  };
}

export function computeDashboardMeasureTrendData(args: {
  activityUrl: Partial<Path>;
  formatMttr: (value: number) => string;
  isMttr: boolean;
  measureFilters: MeasureFilters | undefined;
  metric: Pick<Metric, 'direction' | 'type'>;
  metricDirectionOverride?: number;
  values: number[];
}): TrendData | null {
  const {
    activityUrl,
    formatMttr,
    isMttr,
    measureFilters,
    metric,
    metricDirectionOverride,
    values,
  } = args;
  const currentValue = values.at(-1);
  const pastValue = values.at(0);

  if (currentValue === undefined || pastValue === undefined || values.length <= 1) {
    return null;
  }

  return computeTrendData({
    absoluteChangeFormatter: isMttr ? formatMttr : undefined,
    activityUrl,
    currentValue: String(currentValue),
    measureFilters,
    metric,
    metricDirectionOverride,
    pastValue: String(pastValue),
  });
}

export function getDashboardMetricDirectionOverride(metric: DashboardMetric): number | undefined {
  switch (metric.type) {
    case DashboardMetricType.IssueResolution:
      return ISSUE_RESOLUTION_METRIC_DIRECTION[metric.statistic];
    case DashboardMetricType.ScaResolution:
      return SCA_RESOLUTION_METRIC_DIRECTION[ScaResolutionStatistic.ScaMTTR];
    case DashboardMetricType.IssueDensity:
    case DashboardMetricType.Raw:
    case DashboardMetricType.Rich:
      return undefined;
  }
}

/**
 * Extracts latest value and a comparison point roughly 30 days in the past.
 */
export function getHistoricalValuesForTrend(data: {
  measures: Array<{ history: Array<{ date: Date | string; value?: string }> }>;
}): HistoricalTrendValues {
  const historyItems = data.measures[0]?.history ?? [];
  const validMeasures = historyItems
    .map((item) => ({
      epochTime: new Date(item.date).getTime(),
      value: item.value,
    }))
    .filter((m) => !Number.isNaN(m.epochTime) && isDefined(m.value));

  return getThirtyDayTrendValues(
    validMeasures,
    (m) => m.epochTime,
    (m) => m.value ?? null,
  );
}
