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
import {
  PieChartIssueSlice,
  PieChartMetric,
  PieChartWidgetProps,
} from '../../types/dashboard-widget';
import {
  HOTSPOT_FILTER_MESSAGE_ID,
  isPieChartHotspotFilter,
  isPieChartIssueFilter,
  PIE_ISSUE_FILTER_TO_SOFTWARE_QUALITY,
} from './pieChartFilterLineSegments';
import { getPieChartSliceLabelMessageId, isQualityGateStatusWidget } from './utils';

type FormatMessage = IntlShape['formatMessage'];

type PieChartTitleInput = Pick<PieChartWidgetProps, 'filter' | 'metric' | 'slice'> & {
  isPortfolioDashboard: boolean;
};

const PIE_HEADER_METRIC_MESSAGE_ID: Record<PieChartMetric, string> = {
  [PieChartMetric.IssueCount]: 'dashboard.pie_chart.header.metric.issue_count',
  [PieChartMetric.HotspotCount]: 'dashboard.pie_chart.header.metric.hotspot_count',
  [PieChartMetric.LineCount]: 'dashboard.pie_chart.header.metric.line_count',
  [PieChartMetric.ProjectCount]: 'dashboard.pie_chart.header.metric.project_count',
};

/** Returns a fully-localised pie-chart title string. */
export function getPieChartTitle(
  formatMessage: FormatMessage,
  { filter, isPortfolioDashboard, metric, slice }: Readonly<PieChartTitleInput>,
): string {
  if (
    isPortfolioDashboard &&
    isQualityGateStatusWidget({ filter, metric, slice }) &&
    !resolveFilterMessageId(filter)
  ) {
    return formatMessage({
      id: 'dashboard.pie_chart.header.title.portfolio_projects_by_quality_gate',
    });
  }

  const parts: string[] = [];

  if (metric === PieChartMetric.IssueCount && slice !== PieChartIssueSlice.IssueStatuses) {
    parts.push(formatMessage({ id: 'dashboard.pie_chart.header.open_prefix' }));
  }

  const filterMessageId = resolveFilterMessageId(filter);
  if (filterMessageId) {
    parts.push(formatMessage({ id: filterMessageId }));
  }

  parts.push(
    formatMessage({ id: PIE_HEADER_METRIC_MESSAGE_ID[metric] }),
    formatMessage({ id: 'dashboard.pie_chart.header.join_by' }),
    formatMessage({
      id: getPieChartSliceLabelMessageId({ isPortfolioDashboard, metric, slice }),
    }),
  );

  return parts.join(' ');
}

/** Returns a fully-localised metric-label string (used in drilldown column headers and card labels). */
export function getPieChartMetricLabel(
  formatMessage: FormatMessage,
  { filter, isPortfolioDashboard, metric, slice }: Readonly<PieChartTitleInput>,
): string {
  if (isPortfolioDashboard && isQualityGateStatusWidget({ filter, metric, slice })) {
    return formatMessage({ id: 'dashboard.pie_chart.header.metric.quality_gate' });
  }

  const filterMessageId = resolveFilterMessageId(filter);
  const parts: string[] = filterMessageId
    ? [
        formatMessage({ id: filterMessageId }),
        formatMessage({ id: PIE_HEADER_METRIC_MESSAGE_ID[metric] }),
      ]
    : [formatMessage({ id: PIE_HEADER_METRIC_MESSAGE_ID[metric] })];

  return parts.join(' ');
}

function resolveFilterMessageId(filter: PieChartWidgetProps['filter']): string | undefined {
  if (filter && isPieChartIssueFilter(filter)) {
    return `software_quality.${PIE_ISSUE_FILTER_TO_SOFTWARE_QUALITY[filter]}`;
  }
  if (filter && isPieChartHotspotFilter(filter)) {
    return HOTSPOT_FILTER_MESSAGE_ID[filter];
  }
  return undefined;
}
