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

import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { DashboardMetric, DashboardMetricType } from '../types/dashboard-widget';
import { lineChartMeasureTransformFlags } from '../utils/lineChartMeasureTransformFlags';
import { getActualMetricKey } from '../widget-creation-modal/utils/getActualMetricKey';

export function useLineChartMetricCharacteristics(metric: Readonly<DashboardMetric>) {
  const actualMetricKey = getActualMetricKey(metric);
  const measureFilters =
    metric.type === DashboardMetricType.Rich ? metric.measureFilters : undefined;
  const { data: metrics } = useWidgetMetricMetadataQuery();
  const metricMetadata = actualMetricKey ? metrics?.[actualMetricKey] : undefined;
  const metricType = metricMetadata?.type;
  const { isMetricData, isMetricNumeric, isMetricRating } = actualMetricKey
    ? lineChartMeasureTransformFlags(actualMetricKey, metricType)
    : { isMetricData: false, isMetricNumeric: false, isMetricRating: false };

  return {
    actualMetricKey,
    isMetricData,
    isMetricNumeric,
    isMetricRating,
    measureFilters,
    metricMetadata,
  };
}
