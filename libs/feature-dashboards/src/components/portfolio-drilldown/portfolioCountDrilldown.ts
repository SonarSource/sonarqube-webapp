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

import type { IntlShape } from 'react-intl';
import type { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey, MetricType } from '~shared/types/metrics';
import {
  type CountWidgetProps,
  type DashboardMetric,
  DashboardMetricType,
  RichMetricKey,
} from '../../types/dashboard-widget';
import {
  type IssueCountStatus,
  type IssueSeverity,
  type OrganizationIssueImpactQueryValue,
  PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES,
} from '../../types/organization-issue-count-history';
import { CodeScope } from '../../types/widget-common';
import { organizationIssueImpactQueryValuesForSoftwareQualities } from '../../utils/organizationIssueCountHistoryUtils';
import { getPortfolioDashboardMeasureRequestKey } from '../../utils/portfolioMeasures';
import { getDashboardMetricTitle } from '../widget-header/widgetHeaderText';
import type {
  PortfolioDashboardDrilldownDescriptor,
  ProjectIssueCountsDrilldownRequest,
} from './portfolioPieChartDrilldown';

type LocalizeMetricName = (metric: { key: string; name?: string }, short?: boolean) => string;

interface CountDrilldownLocalization {
  formatMessage: IntlShape['formatMessage'];
  getLocalizedMetricName: LocalizeMetricName;
}

type PortfolioCountDrilldownMetric = Extract<
  DashboardMetric,
  { type: DashboardMetricType.Raw | DashboardMetricType.Rich }
>;

const PORTFOLIO_COUNT_DRILLDOWN_PERCENT_METRIC_KEYS = new Set<MetricKey>([
  MetricKey.branch_coverage,
  MetricKey.comment_lines_density,
  MetricKey.coverage,
  MetricKey.duplicated_lines_density,
  MetricKey.security_hotspots_reviewed,
  MetricKey.sqale_debt_ratio,
]);

export function isPortfolioCountWidgetDrilldownSupported(
  metric: DashboardMetric,
): metric is PortfolioCountDrilldownMetric {
  return (
    metric.type === DashboardMetricType.Rich ||
    (metric.type === DashboardMetricType.Raw && metric.metricKey !== MetricKey.project_branch_count)
  );
}

function getNumericFormatMetricType(metricKey: MetricKey): MetricType {
  return PORTFOLIO_COUNT_DRILLDOWN_PERCENT_METRIC_KEYS.has(metricKey)
    ? MetricType.Percent
    : MetricType.Integer;
}

function toOrganizationIssueImpactQueryValue(
  quality: SoftwareQuality,
  severity: SoftwareImpactSeverity,
): OrganizationIssueImpactQueryValue {
  return `${quality}:${severity}`;
}

function getIssueRequest(
  metric: Extract<DashboardMetric, { type: DashboardMetricType.Rich }>,
): ProjectIssueCountsDrilldownRequest {
  if (metric.metricKey === RichMetricKey.Hotspots) {
    return { issueTypes: [...PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES] };
  }

  const request: ProjectIssueCountsDrilldownRequest = {};
  const { measureFilters } = metric;

  if (measureFilters?.impactSoftwareQuality) {
    const quality = measureFilters.impactSoftwareQuality;
    const severities = measureFilters.impactSeverities;
    request.impacts =
      severities !== undefined && severities.length > 0
        ? severities.map((severity) => toOrganizationIssueImpactQueryValue(quality, severity))
        : organizationIssueImpactQueryValuesForSoftwareQualities([quality]);
  }

  request.statuses = measureFilters?.issueStatus
    ? [measureFilters.issueStatus as IssueCountStatus]
    : ['OPEN'];

  if (!measureFilters?.impactSoftwareQuality) {
    const [severity] = measureFilters?.impactSeverities ?? [];
    if (severity) {
      request.severities = [severity as IssueSeverity];
    }
  }

  return request;
}

export function getPortfolioCountWidgetTitle(
  args: CountDrilldownLocalization & { widget: CountWidgetProps },
): string {
  return getDashboardMetricTitle({
    formatMessage: args.formatMessage,
    getLocalizedMetricName: args.getLocalizedMetricName,
    hasHistoryRange: false,
    metric: args.widget.metric,
  });
}

export function getPortfolioCountWidgetDrilldownDescriptor(
  args: CountDrilldownLocalization & { widget: CountWidgetProps },
): PortfolioDashboardDrilldownDescriptor | null {
  const { widget } = args;
  if (!isPortfolioCountWidgetDrilldownSupported(widget.metric)) {
    return null;
  }

  const widgetTitle = getPortfolioCountWidgetTitle(args);
  if (widget.metric.type === DashboardMetricType.Rich) {
    return {
      kind: 'issue-counts',
      metricLabel: widgetTitle,
      request: getIssueRequest(widget.metric),
      segmentLabel: '',
      valueType: 'number',
      widgetTitle,
    };
  }

  return {
    kind: 'computed-measures',
    metricLabel: widgetTitle,
    numericFormatMetricType: getNumericFormatMetricType(widget.metric.metricKey),
    request: {
      metricKey: getPortfolioDashboardMeasureRequestKey(
        widget.metric.metricKey,
        widget.scope === CodeScope.New,
      ),
    },
    segmentLabel: '',
    valueType: 'number',
    widgetTitle,
  };
}
