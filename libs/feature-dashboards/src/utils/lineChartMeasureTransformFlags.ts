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

import { isDefined } from '~shared/helpers/types';
import { MetricKey, MetricType } from '~shared/types/metrics';

export function isRatingMetric(metricKey: MetricKey, metricType: string | undefined): boolean {
  return metricType === MetricType.Rating || metricKey.endsWith('_rating');
}

/** Pure: maps API metric metadata to how line-chart history rows should be parsed. */
export function lineChartMeasureTransformFlags(
  metricKey: MetricKey,
  metricType: string | undefined,
): Readonly<{
  isMetricData: boolean;
  isMetricNumeric: boolean;
  isMetricRating: boolean;
}> {
  const isMetricRating = isRatingMetric(metricKey, metricType);
  const isMetricNumeric =
    isDefined(metricType) &&
    metricType !== MetricType.Level &&
    metricType !== MetricType.ScaRisk &&
    metricType !== MetricType.Rating &&
    metricType !== MetricType.Distribution;
  const isMetricData = metricType === MetricType.Data;
  return { isMetricData, isMetricNumeric, isMetricRating };
}
