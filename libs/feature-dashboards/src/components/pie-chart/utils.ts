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

import {
  PieChartFilter,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartProjectSlice,
  PieChartSlice,
} from '../../types/dashboard-widget';

/** Message id for the short slice dimension label (e.g. Severity, Review status). */
const PIE_CHART_SLICE_LABEL_MESSAGE_ID: Record<PieChartSlice, string> = {
  [PieChartIssueSlice.ImpactSoftwareQualities]:
    'dashboard.pie_chart.header.slice.impact_software_qualities',
  [PieChartIssueSlice.ImpactSeverities]: 'dashboard.pie_chart.header.slice.impact_severities',
  [PieChartIssueSlice.CleanCodeAttributeCategories]:
    'dashboard.pie_chart.header.slice.clean_code_attribute_categories',
  [PieChartIssueSlice.IssueStatuses]: 'dashboard.pie_chart.header.slice.issue_statuses',
  [PieChartIssueSlice.Languages]: 'dashboard.pie_chart.header.slice.languages',
  [PieChartIssueSlice.Rules]: 'dashboard.pie_chart.header.slice.rules',
  [PieChartHotspotSlice.ReviewPriority]: 'dashboard.pie_chart.header.slice.review_priority',
  [PieChartHotspotSlice.ReviewStatus]: 'dashboard.pie_chart.header.slice.review_status',
  [PieChartHotspotSlice.SecurityCategory]: 'dashboard.pie_chart.header.slice.security_category',
  [PieChartLineSlice.Language]: 'dashboard.pie_chart.header.slice.language',
  [PieChartLineSlice.Coverage]: 'dashboard.pie_chart.header.slice.coverage',
  [PieChartLineSlice.Duplications]: 'dashboard.pie_chart.header.slice.duplications',
  [PieChartProjectSlice.Status]: 'dashboard.pie_chart.header.slice.project_status',
};

/**
 * Resolves the message id for the pie chart “slice by” label, matching {@link PieChartHeader}
 * (e.g. portfolio hotspot security category uses the rule slice label).
 */
export function getPieChartSliceLabelMessageId(options: {
  isPortfolioDashboard: boolean;
  metric: PieChartMetric;
  slice: PieChartSlice;
}): string {
  const { isPortfolioDashboard, metric, slice } = options;

  const sliceForLabel: PieChartSlice =
    isPortfolioDashboard &&
    metric === PieChartMetric.HotspotCount &&
    slice === PieChartHotspotSlice.SecurityCategory
      ? PieChartIssueSlice.Rules
      : slice;

  return PIE_CHART_SLICE_LABEL_MESSAGE_ID[sliceForLabel];
}

export function isQualityGateStatusWidget(widget: {
  filter: PieChartFilter;
  metric: PieChartMetric;
  slice: PieChartSlice;
}): boolean {
  return (
    widget.filter === '' &&
    widget.metric === PieChartMetric.ProjectCount &&
    widget.slice === PieChartProjectSlice.Status
  );
}
