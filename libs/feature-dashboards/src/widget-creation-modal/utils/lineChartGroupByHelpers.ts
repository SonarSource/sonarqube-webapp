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

import { IntlShape } from 'react-intl';
import { MetricKey } from '~shared/types/metrics';
import { LineChartGroupBy, type LineChartGroupByValue } from '../../data/widgets/line-chart';
import {
  DashboardMetric,
  DashboardMetricType,
  PieChartIssueSlice,
  PieChartSlice,
  RichMetricKey,
} from '../../types/dashboard-widget';

const GROUP_BY_LABEL_MESSAGE_ID: Record<LineChartGroupByValue, string> = {
  [LineChartGroupBy.None]: 'dashboard.line_chart.group_by.none',
  [LineChartGroupBy.Severity]: 'dashboard.line_chart.group_by.severity',
  [LineChartGroupBy.SoftwareQuality]: 'dashboard.line_chart.group_by.software_quality',
  [LineChartGroupBy.Status]: 'dashboard.line_chart.group_by.status',
  [LineChartGroupBy.Rule]: 'dashboard.line_chart.group_by.rule',
};

const GROUP_BY_PIE_SLICE: Record<
  Exclude<LineChartGroupByValue, typeof LineChartGroupBy.None>,
  PieChartIssueSlice
> = {
  [LineChartGroupBy.Severity]: PieChartIssueSlice.ImpactSeverities,
  [LineChartGroupBy.SoftwareQuality]: PieChartIssueSlice.ImpactSoftwareQualities,
  [LineChartGroupBy.Status]: PieChartIssueSlice.IssueStatuses,
  [LineChartGroupBy.Rule]: PieChartIssueSlice.Rules,
};

export function isLineChartGroupByActive(groupBy: LineChartGroupByValue): boolean {
  return groupBy !== LineChartGroupBy.None;
}

export function isLineChartGroupByEligibleForMetric(metric: DashboardMetric | null): boolean {
  if (!metric) {
    return false;
  }
  if (metric.type === DashboardMetricType.Rich && metric.metricKey === RichMetricKey.Issues) {
    return true;
  }
  return metric.type === DashboardMetricType.Raw && metric.metricKey === MetricKey.violations;
}

export function buildLineChartGroupBySelectOptions(
  formatMessage: IntlShape['formatMessage'],
): Array<{ label: string; value: LineChartGroupByValue }> {
  return [
    LineChartGroupBy.None,
    LineChartGroupBy.Severity,
    LineChartGroupBy.SoftwareQuality,
    LineChartGroupBy.Status,
    LineChartGroupBy.Rule,
  ].map((value) => ({
    label: formatMessage({ id: GROUP_BY_LABEL_MESSAGE_ID[value] }),
    value,
  }));
}

export function getLineChartGroupByLabelMessageId(groupBy: LineChartGroupByValue): string {
  return GROUP_BY_LABEL_MESSAGE_ID[groupBy];
}

export function mapLineChartGroupByToPieChartSlice(
  groupBy: LineChartGroupByValue,
): PieChartSlice | null {
  if (groupBy === LineChartGroupBy.None) {
    return null;
  }
  return GROUP_BY_PIE_SLICE[groupBy];
}

export function lineChartGroupByConflictsWithMeasureFilter(
  groupBy: LineChartGroupByValue,
): 'issueStatus' | 'impactSoftwareQuality' | 'impactSeverities' | null {
  switch (groupBy) {
    case LineChartGroupBy.Status:
      return 'issueStatus';
    case LineChartGroupBy.SoftwareQuality:
      return 'impactSoftwareQuality';
    case LineChartGroupBy.Severity:
      return 'impactSeverities';
    default:
      return null;
  }
}
