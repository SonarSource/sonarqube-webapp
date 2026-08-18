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

import { MetricKey } from '~shared/types/metrics';
import {
  DashboardMetric,
  DashboardMetricType,
  IssueStatus,
  RichMetricKey,
} from '../../types/dashboard-widget';

/**
 * Determines the actual backend metric key to use based on a DashboardMetric configuration.
 * For raw metrics, returns the metricKey directly.
 * For rich metrics (Issue count), maps to the appropriate backend metric based on filters:
 * - If status filter is set, returns the status-specific metric (open_issues, accepted_issues, etc.)
 * - If software quality filter is set, returns the quality-specific metric (security_issues, reliability_issues, etc.)
 * - Otherwise, defaults to violations
 * Issue-resolution metrics are backed by a dedicated API statistic rather than a MetricKey, so this
 * returns undefined when generic widget-configuration paths call this helper with one.
 */
export function getActualMetricKey(metric: DashboardMetric): MetricKey | undefined {
  if (metric.type === DashboardMetricType.Raw) {
    return metric.metricKey;
  }

  if (metric.type === DashboardMetricType.IssueResolution) {
    return undefined;
  }

  if (metric.type === DashboardMetricType.IssueDensity) {
    return undefined;
  }

  if (metric.type === DashboardMetricType.ScaResolution) {
    return undefined;
  }

  if (metric.metricKey === RichMetricKey.Hotspots) {
    return MetricKey.security_hotspots;
  }

  const { measureFilters } = metric;

  if (measureFilters?.issueStatus) {
    const statusToMetricMap = {
      [IssueStatus.Open]: MetricKey.open_issues,
      [IssueStatus.Accepted]: MetricKey.accepted_issues,
      [IssueStatus.FalsePositive]: MetricKey.false_positive_issues,
    };
    return statusToMetricMap[measureFilters.issueStatus] || MetricKey.violations;
  }

  if (measureFilters?.impactSoftwareQuality) {
    const qualityToMetricMap = {
      SECURITY: MetricKey.security_issues,
      RELIABILITY: MetricKey.reliability_issues,
      MAINTAINABILITY: MetricKey.maintainability_issues,
    };
    return qualityToMetricMap[measureFilters.impactSoftwareQuality] || MetricKey.violations;
  }

  return MetricKey.violations;
}
