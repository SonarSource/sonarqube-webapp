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

import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import {
  DashboardMetricType,
  IssueStatus,
  RichMetricKey,
  type DashboardMetric,
} from '../../types/dashboard-widget';
import { CodeScope } from '../../types/widget-common';

const PROJECT_RATING_BY_SOFTWARE_QUALITY: Record<SoftwareQuality, MetricKey> = {
  [SoftwareQuality.Maintainability]: MetricKey.sqale_rating,
  [SoftwareQuality.Reliability]: MetricKey.reliability_rating,
  [SoftwareQuality.Security]: MetricKey.security_rating,
};

function isEligibleIssueCountMetric(
  metric: DashboardMetric,
): metric is Extract<DashboardMetric, { type: DashboardMetricType.Rich }> {
  if (metric.type !== DashboardMetricType.Rich || metric.metricKey !== RichMetricKey.Issues) {
    return false;
  }

  const { measureFilters } = metric;
  const isOpenIssuesConfiguration =
    measureFilters?.issueStatus === undefined || measureFilters.issueStatus === IssueStatus.Open;

  return (
    measureFilters?.impactSoftwareQuality !== undefined &&
    isOpenIssuesConfiguration &&
    (measureFilters.impactSeverities === undefined || measureFilters.impactSeverities.length === 0)
  );
}

function isEligibleSecurityHotspotMetric(metric: DashboardMetric): boolean {
  if (metric.type === DashboardMetricType.Raw) {
    return metric.metricKey === MetricKey.security_hotspots;
  }

  if (
    metric.type === DashboardMetricType.IssueResolution ||
    metric.type === DashboardMetricType.IssueDensity ||
    metric.type === DashboardMetricType.ScaResolution
  ) {
    return false;
  }

  return metric.metricKey === RichMetricKey.Hotspots;
}

export function shouldShowContextualRatingBadge(
  metric: DashboardMetric,
  scope: CodeScope,
): boolean {
  return getProjectContextualRatingMetricKey(metric, scope) !== undefined;
}

export function getProjectContextualRatingMetricKey(
  metric: DashboardMetric,
  scope: CodeScope,
): MetricKey | undefined {
  if (scope !== CodeScope.Overall) {
    return undefined;
  }

  if (isEligibleSecurityHotspotMetric(metric)) {
    return MetricKey.security_review_rating;
  }

  const softwareQuality = isEligibleIssueCountMetric(metric)
    ? metric.measureFilters?.impactSoftwareQuality
    : undefined;
  if (softwareQuality !== undefined) {
    return PROJECT_RATING_BY_SOFTWARE_QUALITY[softwareQuality];
  }

  return undefined;
}
