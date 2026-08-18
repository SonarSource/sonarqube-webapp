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
import { DashboardMetric, DashboardMetricType, RichMetricKey } from '../../types/dashboard-widget';

/**
 * Configuration for what filters should be displayed for each measure type
 * Note: Only "drillable" measures support these filters. Raw measures only support scope filtering.
 */
export interface MeasureFilterCapability {
  isDrillable: boolean;
  supportsSeverityFilter: boolean;
  supportsSoftwareQualityFilter: boolean;
  supportsStatusFilter: boolean;
}

/**
 * Determines which filters should be available based on the selected metric
 */
export function getMeasureFilterCapability(metricKey: MetricKey): MeasureFilterCapability {
  // Only "Issue count" (violations) is a drillable measure that supports advanced filtering
  // All other metrics are "raw" measures that only support scope filtering
  if (metricKey === MetricKey.violations) {
    return {
      isDrillable: true,
      supportsSeverityFilter: true,
      supportsSoftwareQualityFilter: true,
      supportsStatusFilter: true,
    };
  }

  // All other metrics are raw measures
  return {
    isDrillable: false,
    supportsSeverityFilter: false,
    supportsSoftwareQualityFilter: false,
    supportsStatusFilter: false,
  };
}

/**
 * Issue-count rich metrics stay drillable even when filters resolve `metricKey` to a derived key
 * (e.g. `security_issues`); hotspot rich metrics are never drillable in the apply-filters UI.
 */
export function getMeasureFilterCapabilityForDashboardMetric(
  dashboardMetric: DashboardMetric | null | undefined,
  resolvedMetricKey: MetricKey | undefined,
): MeasureFilterCapability {
  if (dashboardMetric?.type === DashboardMetricType.IssueResolution) {
    return {
      isDrillable: true,
      supportsSeverityFilter: true,
      supportsSoftwareQualityFilter: true,
      supportsStatusFilter: false,
    };
  }

  if (dashboardMetric?.type === DashboardMetricType.IssueDensity) {
    return {
      isDrillable: true,
      supportsSeverityFilter: true,
      supportsSoftwareQualityFilter: true,
      supportsStatusFilter: false,
    };
  }

  if (dashboardMetric?.type === DashboardMetricType.ScaResolution) {
    return {
      isDrillable: true,
      supportsSeverityFilter: true,
      supportsSoftwareQualityFilter: false,
      supportsStatusFilter: false,
    };
  }

  if (
    dashboardMetric?.type === DashboardMetricType.Rich &&
    dashboardMetric.metricKey === RichMetricKey.Issues
  ) {
    return getMeasureFilterCapability(MetricKey.violations);
  }

  if (resolvedMetricKey === undefined) {
    return {
      isDrillable: false,
      supportsSeverityFilter: false,
      supportsSoftwareQualityFilter: false,
      supportsStatusFilter: false,
    };
  }

  return getMeasureFilterCapability(resolvedMetricKey);
}
