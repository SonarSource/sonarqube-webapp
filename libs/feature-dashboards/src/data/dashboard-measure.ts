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

import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { IssueSeverity as StandardIssueSeverity } from '~shared/types/issues';
import { MetricKey } from '~shared/types/metrics';
import {
  OrganizationIssueImpactQueryValue,
  type IssueCountSliceBy,
  type IssueCountStatus,
  type IssueType,
} from '../types/organization-issue-count-history';
import { IssueResolutionStatistic } from '../types/organization-issue-resolution-history';
import { ScaResolutionStatistic } from '../types/organization-sca-resolution-history';
import { CodeScope } from '../types/widget-common';
import {
  getMetricKeyForScope,
  projectMetricSupportsNewCodeScope,
} from '../utils/projectWidgetData';
import type { LineChartGroupByValue } from './widgets/line-chart';
import {
  DashboardMetricType,
  IssueStatus,
  RichMetricKey,
  type DashboardMetric,
  type MeasureFilters,
} from './widgets/shared';

export interface DashboardIssueFilters {
  impacts?: OrganizationIssueImpactQueryValue[];
  issueTypes?: IssueType[];
  ruleKeys?: string[];
  severities?: StandardIssueSeverity[];
  statuses?: IssueCountStatus[];
}

export type DashboardMeasure =
  | {
      api: 'measures-history';
      metricKey: MetricKey;
      scope: CodeScope;
    }
  | (DashboardIssueFilters & {
      api: 'issue-count-history';
      metricKey: MetricKey;
      sliceBy?: IssueCountSliceBy;
    })
  | (DashboardIssueFilters & {
      api: 'issue-resolution-history';
      statistic: IssueResolutionStatistic;
    })
  | (DashboardIssueFilters & {
      api: 'issue-density-history';
    })
  | {
      api: 'sca-resolution-history';
      severities?: SoftwareImpactSeverity[];
      statistic: ScaResolutionStatistic;
    };

export function dashboardMeasureHistoryMetricKey(
  measure: Extract<DashboardMeasure, { api: 'measures-history' }>,
): string {
  return getMetricKeyForScope(measure.metricKey, measure.scope === CodeScope.New);
}

const ALL_IMPACT_SEVERITIES = Object.values(SoftwareImpactSeverity);
const ALL_SOFTWARE_QUALITIES = Object.values(SoftwareQuality);

const GROUP_BY_SLICE: Partial<Record<LineChartGroupByValue, IssueCountSliceBy>> = {
  rule: 'RULE_KEY',
  severity: 'SEVERITY',
  softwareQuality: 'SOFTWARE_QUALITY',
  status: 'STATUS',
};

function impactsForQualities(
  qualities: readonly SoftwareQuality[],
  severities: readonly SoftwareImpactSeverity[] = ALL_IMPACT_SEVERITIES,
): OrganizationIssueImpactQueryValue[] {
  return qualities.flatMap((quality) =>
    severities.map((severity) => `${quality}:${severity}` as OrganizationIssueImpactQueryValue),
  );
}

function actualMetricKey(metric: DashboardMetric): MetricKey | undefined {
  if (metric.type === DashboardMetricType.Raw) {
    return metric.metricKey;
  }
  if (metric.type !== DashboardMetricType.Rich) {
    return undefined;
  }
  if (metric.metricKey === RichMetricKey.Hotspots) {
    return MetricKey.security_hotspots;
  }
  if (metric.measureFilters?.issueStatus) {
    return {
      [IssueStatus.Open]: MetricKey.open_issues,
      [IssueStatus.Accepted]: MetricKey.accepted_issues,
      [IssueStatus.FalsePositive]: MetricKey.false_positive_issues,
    }[metric.measureFilters.issueStatus];
  }
  return metric.measureFilters?.impactSoftwareQuality
    ? {
        [SoftwareQuality.Security]: MetricKey.software_quality_security_issues,
        [SoftwareQuality.Reliability]: MetricKey.software_quality_reliability_issues,
        [SoftwareQuality.Maintainability]: MetricKey.software_quality_maintainability_issues,
      }[metric.measureFilters.impactSoftwareQuality]
    : MetricKey.violations;
}

function mqrIssueFilters(filters: MeasureFilters | undefined): DashboardIssueFilters {
  const quality = filters?.impactSoftwareQuality;
  const impactSeverities = filters?.impactSeverities;
  const hasQuality = quality !== undefined;
  const hasSeverities = Boolean(impactSeverities?.length);
  const qualities = quality === undefined ? ALL_SOFTWARE_QUALITIES : [quality];
  const severities = hasSeverities ? impactSeverities : ALL_IMPACT_SEVERITIES;
  let severityFilters: Pick<DashboardIssueFilters, 'impacts'> = {};
  if (hasQuality || hasSeverities) {
    severityFilters = { impacts: impactsForQualities(qualities, severities) };
  }

  return {
    ...severityFilters,
    statuses: [filters?.issueStatus ?? 'OPEN'],
  };
}

export function dashboardMetricToMeasure(
  metric: DashboardMetric,
  scope: CodeScope,
  options: {
    groupBy?: LineChartGroupByValue;
    supportedNewCodeMetrics?: ReadonlySet<MetricKey>;
  } = {},
): DashboardMeasure {
  const groupBy = options.groupBy ?? 'none';
  const supportsNewCodeHistory =
    metric.type === DashboardMetricType.Raw &&
    (options.supportedNewCodeMetrics === undefined
      ? projectMetricSupportsNewCodeScope(metric.metricKey)
      : options.supportedNewCodeMetrics.has(metric.metricKey));
  const historyScope =
    scope === CodeScope.New && !supportsNewCodeHistory ? CodeScope.Overall : scope;

  if (
    metric.type === DashboardMetricType.Raw &&
    metric.metricKey === MetricKey.violations &&
    groupBy !== 'none'
  ) {
    return {
      api: 'issue-count-history',
      ...mqrIssueFilters(undefined),
      metricKey: metric.metricKey,
      sliceBy: GROUP_BY_SLICE[groupBy],
    };
  }

  switch (metric.type) {
    case DashboardMetricType.Raw:
      return { api: 'measures-history', metricKey: metric.metricKey, scope: historyScope };
    case DashboardMetricType.Rich:
      if (metric.metricKey === RichMetricKey.Lines) {
        return { api: 'measures-history', metricKey: MetricKey.ncloc, scope: historyScope };
      }
      if (metric.metricKey === RichMetricKey.Projects) {
        return { api: 'measures-history', metricKey: MetricKey.projects, scope: historyScope };
      }
      if (metric.metricKey === RichMetricKey.Hotspots) {
        return {
          api: 'measures-history',
          metricKey: MetricKey.security_hotspots,
          scope: historyScope,
        };
      }
      return {
        api: 'issue-count-history',
        ...mqrIssueFilters(metric.measureFilters),
        metricKey: actualMetricKey(metric) ?? MetricKey.violations,
        sliceBy: GROUP_BY_SLICE[groupBy],
      };
    case DashboardMetricType.IssueResolution:
      return {
        api: 'issue-resolution-history',
        ...mqrIssueFilters(metric.measureFilters),
        statistic: metric.statistic,
      };
    case DashboardMetricType.IssueDensity:
      return {
        api: 'issue-density-history',
        ...mqrIssueFilters(metric.measureFilters),
      };
    case DashboardMetricType.ScaResolution:
      return {
        api: 'sca-resolution-history',
        severities: metric.measureFilters?.impactSeverities,
        statistic: ScaResolutionStatistic.ScaMTTR,
      };
    default:
      metric satisfies never;
      throw new Error('Unsupported dashboard metric type');
  }
}
