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
import { MeasureFilters } from '../types/dashboard-widget';
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
