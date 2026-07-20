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

import { MetricKey } from '../types/metrics';

export enum MeasurementType {
  Coverage = 'COVERAGE',
  Duplication = 'DUPLICATION',
}

const MEASUREMENTS_MAP = {
  [MeasurementType.Coverage]: {
    metric: MetricKey.coverage,
    newMetric: MetricKey.new_coverage,
    linesMetric: MetricKey.new_lines_to_cover,
    overallLinesMetric: MetricKey.lines_to_cover,
  },
  [MeasurementType.Duplication]: {
    metric: MetricKey.duplicated_lines_density,
    newMetric: MetricKey.new_duplicated_lines_density,
    linesMetric: MetricKey.new_lines,
    overallLinesMetric: MetricKey.lines,
  },
};

export function getMeasurementMetricKey(type: MeasurementType, useDiffMetric: boolean): MetricKey {
  return useDiffMetric ? MEASUREMENTS_MAP[type].newMetric : MEASUREMENTS_MAP[type].metric;
}

export function getMeasurementLinesMetricKey(
  type: MeasurementType,
  useDiffMetric: boolean,
): MetricKey {
  return useDiffMetric
    ? MEASUREMENTS_MAP[type].linesMetric
    : MEASUREMENTS_MAP[type].overallLinesMetric;
}
