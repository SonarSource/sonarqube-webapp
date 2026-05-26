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

import { Metric } from '../types/measures';
import { MetricKey, MetricType } from '../types/metrics';

export function isValidPercentageMetric(metric: Metric, value: string) {
  const floatValue = Number(value);
  return (
    metric.type === MetricType.Percent && !isNaN(floatValue) && floatValue >= 0 && floatValue <= 100
  );
}

const ISSUE_SEVERITY_METRICS = new Set([
  MetricKey.new_bugs_severity,
  MetricKey.new_vulnerabilities_severity,
  MetricKey.new_code_smells_severity,
  MetricKey.new_software_quality_maintainability_severity,
  MetricKey.new_software_quality_reliability_severity,
  MetricKey.new_software_quality_security_severity,
]);

export function isIssueSeverityMetric(metricKey: string): boolean {
  return ISSUE_SEVERITY_METRICS.has(metricKey as MetricKey);
}

// Issue severity metrics are typed as INT in the backend
// They should be converted to a new custom type 'ISSUE_SEVERITY' to be rendered differently.
export function augmentMetricsForIssueSeverity(metrics: Metric[]): Metric[] {
  return metrics.map((metric) => {
    if (isIssueSeverityMetric(metric.key)) {
      return { ...metric, type: MetricType.IssueSeverity };
    }
    return metric;
  });
}
