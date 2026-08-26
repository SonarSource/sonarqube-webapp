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
import { SoftwareImpactSeverity } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import type { LineChartGroupByValue } from '../../data/widgets/line-chart';
import {
  DashboardMetric,
  DashboardMetricType,
  MeasureFilters,
  RichMetricKey,
} from '../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import { CodeScope } from '../../types/widget-common';
import { buildLabeledSegment } from '../../utils/filterLineSegments';
import {
  getLineChartGroupByLabelMessageId,
  isLineChartGroupByActive,
} from '../../widget-creation-modal/utils/lineChartGroupByHelpers';

type LocalizeMetricName = (metric: { key: string; name?: string }, short?: boolean) => string;

type FormatMessage = IntlShape['formatMessage'];

export interface WidgetHeaderText {
  filterSegments: string[];
  title: string;
}

interface WidgetHeaderTextDeps {
  formatMessage: FormatMessage;
  getLocalizedMetricName: LocalizeMetricName;
}

interface MetricWidgetHeaderTextInput extends WidgetHeaderTextDeps {
  filterLineScopeOnly?: boolean;
  groupBy?: LineChartGroupByValue;
  hasHistoryRange: boolean;
  metric: DashboardMetric;
  scope: CodeScope;
}

export function getMetricWidgetHeaderText({
  filterLineScopeOnly = false,
  formatMessage,
  getLocalizedMetricName,
  groupBy,
  hasHistoryRange,
  metric,
  scope,
}: Readonly<MetricWidgetHeaderTextInput>): WidgetHeaderText {
  const filterSegments: string[] = [];

  const isScaResolutionMetric = metric.type === DashboardMetricType.ScaResolution;
  if (
    isScaResolutionMetric ||
    (metric.type === DashboardMetricType.IssueResolution &&
      !(hasHistoryRange && metric.statistic === IssueResolutionStatistic.ResolvedIssues))
  ) {
    filterSegments.push(
      formatMessage({
        id: hasHistoryRange
          ? 'dashboard_widget.time_range.rolling_30_day_average'
          : 'dashboard_widget.time_range.last_30_days',
      }),
    );
  }

  filterSegments.push(formatMessage({ id: `dashboard_widget.codescope.${scope}` }));

  if (groupBy !== undefined && isLineChartGroupByActive(groupBy)) {
    filterSegments.push(
      buildLabeledSegment(formatMessage, 'dashboard.line_chart.group_by.label', [
        getLineChartGroupByLabelMessageId(groupBy),
      ]),
    );
  }

  if (!filterLineScopeOnly && metric.type !== DashboardMetricType.Raw) {
    appendLocalizedMeasureFilterSegments(formatMessage, filterSegments, metric.measureFilters);
  }

  return {
    filterSegments,
    title: getDashboardMetricTitle({
      formatMessage,
      getLocalizedMetricName,
      hasHistoryRange,
      metric,
    }),
  };
}

interface RatingWidgetHeaderTextInput extends WidgetHeaderTextDeps {
  metricKey: MetricKey;
  scope: CodeScope;
}

export function getRatingWidgetHeaderText({
  formatMessage,
  getLocalizedMetricName,
  metricKey,
  scope,
}: Readonly<RatingWidgetHeaderTextInput>): WidgetHeaderText {
  return {
    filterSegments:
      metricKey === MetricKey.alert_status
        ? []
        : [formatMessage({ id: `dashboard_widget.codescope.${scope}` })],
    title: getLocalizedMetricName({ key: metricKey }, true),
  };
}

interface DashboardMetricTitleInput extends WidgetHeaderTextDeps {
  hasHistoryRange: boolean;
  metric: DashboardMetric;
}

export function getDashboardMetricTitle({
  formatMessage,
  getLocalizedMetricName,
  hasHistoryRange,
  metric,
}: Readonly<DashboardMetricTitleInput>): string {
  const descriptor = buildDashboardMetricTitleDescriptor(metric, hasHistoryRange);

  const title = descriptor.parts
    .map((part) => localizeTitlePart(part, formatMessage, getLocalizedMetricName))
    .join(' ');

  return descriptor.overTime
    ? formatMessage({ id: 'dashboard.widget.title.over_time' }, { title })
    : title;
}

// ─── Private helpers ─────────────────────────────────────────────────────────

type TitlePart =
  | {
      messageId: string;
      suffix?: string;
      values?: Record<string, { messageId: string }>;
    }
  | { metricKey: MetricKey; useShortName: boolean };

interface TitleDescriptor {
  overTime: boolean;
  parts: TitlePart[];
}

function localizeTitlePart(
  part: TitlePart,
  formatMessage: FormatMessage,
  getLocalizedMetricName: LocalizeMetricName,
): string {
  if ('metricKey' in part) {
    return getLocalizedMetricName({ key: part.metricKey }, part.useShortName);
  }

  const values = part.values
    ? Object.fromEntries(
        Object.entries(part.values).map(([key, value]) => [
          key,
          formatMessage({ id: value.messageId }),
        ]),
      )
    : undefined;
  const message = formatMessage({ id: part.messageId }, values);
  return part.suffix ? `${message}${part.suffix}` : message;
}

function buildDashboardMetricTitleDescriptor(
  metric: DashboardMetric,
  hasHistoryRange: boolean,
): TitleDescriptor {
  if (metric.type === DashboardMetricType.Raw) {
    return buildRawMetricTitleDescriptor(metric.metricKey, hasHistoryRange);
  }

  if (metric.type === DashboardMetricType.IssueResolution) {
    const softwareQuality = metric.measureFilters?.impactSoftwareQuality;
    if (metric.statistic === IssueResolutionStatistic.RecentMTTR && softwareQuality !== undefined) {
      return {
        overTime: hasHistoryRange,
        parts: [
          ...getMeasureFilterTitleParts(metric.measureFilters, false),
          {
            messageId: 'dashboard.widget.title.recent_mttr_with_software_quality',
            values: {
              softwareQuality: { messageId: `software_quality.${softwareQuality}` },
            },
          },
        ],
      };
    }

    return {
      overTime: hasHistoryRange,
      parts: [
        ...getMeasureFilterTitleParts(metric.measureFilters),
        {
          messageId: `dashboard.add_widget_modal.define_widget.metric.${metric.statistic.toLowerCase()}`,
        },
      ],
    };
  }

  if (metric.type === DashboardMetricType.ScaResolution) {
    return {
      overTime: hasHistoryRange,
      parts: [
        ...getMeasureFilterTitleParts(metric.measureFilters),
        { messageId: 'dashboard.add_widget_modal.define_widget.metric.sca_mttr' },
      ],
    };
  }

  if (metric.type === DashboardMetricType.IssueDensity) {
    return {
      overTime: hasHistoryRange,
      parts: [
        ...getMeasureFilterTitleParts(metric.measureFilters),
        { messageId: 'dashboard.add_widget_modal.define_widget.metric.issue_density' },
      ],
    };
  }

  if (metric.metricKey === RichMetricKey.Hotspots) {
    return buildRawMetricTitleDescriptor(MetricKey.security_hotspots, hasHistoryRange);
  }

  return {
    overTime: hasHistoryRange,
    parts: [
      ...getMeasureFilterTitleParts(metric.measureFilters),
      { metricKey: MetricKey.issues, useShortName: false },
    ],
  };
}

function buildRawMetricTitleDescriptor(
  metricKey: MetricKey,
  hasHistoryRange: boolean,
): TitleDescriptor {
  if (hasHistoryRange && metricKey === MetricKey.releasability_rating) {
    return {
      overTime: false,
      parts: [{ messageId: 'portfolio_dashboard.widget.releasability_rating_over_time' }],
    };
  }

  return {
    overTime: hasHistoryRange,
    parts: [{ metricKey, useShortName: true }],
  };
}

function getMeasureFilterTitleParts(
  measureFilters: MeasureFilters | undefined,
  includeSoftwareQuality = true,
): TitlePart[] {
  const parts: TitlePart[] = [];
  const severities = measureFilters?.impactSeverities;

  if (severities && severities.length > 0 && severities.length < 5) {
    const severityOrder = [
      SoftwareImpactSeverity.Info,
      SoftwareImpactSeverity.Low,
      SoftwareImpactSeverity.Medium,
      SoftwareImpactSeverity.High,
      SoftwareImpactSeverity.Blocker,
    ];
    const lowestSeverity = severityOrder.find((severity) => severities.includes(severity));
    if (lowestSeverity) {
      parts.push({
        messageId: `severity.${lowestSeverity}`,
        suffix: lowestSeverity === SoftwareImpactSeverity.Blocker ? undefined : '+',
      });
    }
  }

  if (measureFilters?.issueStatus) {
    parts.push({ messageId: `issue.status.${measureFilters.issueStatus}` });
  }
  if (includeSoftwareQuality && measureFilters?.impactSoftwareQuality) {
    parts.push({ messageId: `software_quality.${measureFilters.impactSoftwareQuality}` });
  }

  return parts;
}

function appendLocalizedMeasureFilterSegments(
  formatMessage: FormatMessage,
  segments: string[],
  measureFilters: MeasureFilters | undefined,
): void {
  if (measureFilters?.issueStatus) {
    segments.push(
      buildLabeledSegment(
        formatMessage,
        'dashboard.add_widget_modal.apply_filters_section.select.status.label',
        [`issue.status.${measureFilters.issueStatus}`],
      ),
    );
  }

  if (measureFilters?.impactSoftwareQuality) {
    segments.push(
      buildLabeledSegment(
        formatMessage,
        'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label',
        [`software_quality.${measureFilters.impactSoftwareQuality}`],
      ),
    );
  }

  if (measureFilters?.impactSeverities?.length) {
    segments.push(
      buildLabeledSegment(
        formatMessage,
        'dashboard.add_widget_modal.apply_filters_section.select.severity.label',
        measureFilters.impactSeverities.map((severity) => `severity.${severity}`),
      ),
    );
  }
}
