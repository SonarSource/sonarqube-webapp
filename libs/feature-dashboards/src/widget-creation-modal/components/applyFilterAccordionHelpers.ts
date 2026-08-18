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
import { HistoryRange } from '../../data/widgets/line-chart';
import {
  IssueStatus,
  MeasureFilters,
  PieChartFilter,
  PieChartHotspotFilter,
  PieChartIssueFilter,
  PieChartMetric,
} from '../../types/dashboard-widget';
import { CodeScope } from '../../types/widget-common';

const IMPACT_SEVERITY_CUMULATIVE_ORDER: readonly SoftwareImpactSeverity[] = [
  SoftwareImpactSeverity.Info,
  SoftwareImpactSeverity.Low,
  SoftwareImpactSeverity.Medium,
  SoftwareImpactSeverity.High,
  SoftwareImpactSeverity.Blocker,
];

export function severitiesForImpactFilterOption(
  severity: string,
): SoftwareImpactSeverity[] | undefined {
  if (severity === 'all') {
    return undefined;
  }
  const startIndex = IMPACT_SEVERITY_CUMULATIVE_ORDER.indexOf(severity as SoftwareImpactSeverity);
  if (startIndex < 0) {
    return undefined;
  }
  return IMPACT_SEVERITY_CUMULATIVE_ORDER.slice(startIndex);
}

export function impactSeverityFilterValueForSelection(
  selected: SoftwareImpactSeverity[] | undefined,
): string {
  if (selected == null || selected.length === 0) {
    return 'all';
  }
  const orderedIndices = selected
    .map((severity) => IMPACT_SEVERITY_CUMULATIVE_ORDER.indexOf(severity))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);
  if (orderedIndices.length !== selected.length) {
    return 'all';
  }
  const firstIndex = orderedIndices[0];
  if (firstIndex === undefined) {
    return 'all';
  }
  const startIndex = firstIndex;
  const expectedSuffix = IMPACT_SEVERITY_CUMULATIVE_ORDER.slice(startIndex);
  if (expectedSuffix.length !== selected.length) {
    return 'all';
  }
  const selectedSet = new Set(selected);
  if (!expectedSuffix.every((severity) => selectedSet.has(severity))) {
    return 'all';
  }
  const severityAtStart = IMPACT_SEVERITY_CUMULATIVE_ORDER[startIndex];
  if (severityAtStart === undefined) {
    return 'all';
  }
  return severityAtStart;
}

export function applyIssueStatusMeasureFilters(
  measureFilters: MeasureFilters | undefined,
  status: IssueStatus | '',
): MeasureFilters {
  return {
    ...measureFilters,
    issueStatus: status || undefined,
  };
}

export function applySoftwareQualityMeasureFilters(
  measureFilters: MeasureFilters | undefined,
  quality: SoftwareQuality | '',
): MeasureFilters {
  return {
    ...measureFilters,
    impactSoftwareQuality: quality || undefined,
    impactSeverities: quality ? measureFilters?.impactSeverities : undefined,
  };
}

export function applySeverityMeasureFilters(
  measureFilters: MeasureFilters | undefined,
  option: string,
): MeasureFilters {
  return {
    ...measureFilters,
    impactSeverities: severitiesForImpactFilterOption(option),
  };
}

/** Use when software quality and severity are independent filters.
 * Unlike applySoftwareQualityMeasureFilters, this variant keeps existing severities when quality
 * is cleared.
 */
export function applySoftwareQualityMeasureFiltersPreservingSeverity(
  measureFilters: MeasureFilters | undefined,
  quality: SoftwareQuality | '',
): MeasureFilters {
  return {
    ...measureFilters,
    impactSoftwareQuality: quality || undefined,
  };
}

export function buildPieChartFilterSelectOptions(
  pieChartMetric: PieChartMetric,
  formatMessage: (descriptor: { id: string }) => string,
): { label: string; value: PieChartFilter | '' }[] {
  switch (pieChartMetric) {
    case PieChartMetric.IssueCount:
      return [
        {
          value: '',
          label: formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters.pie_filter.all_issues',
          }),
        },
        {
          value: PieChartIssueFilter.Security,
          label: formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters.pie_filter.security_issues',
          }),
        },
        {
          value: PieChartIssueFilter.Reliability,
          label: formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters.pie_filter.reliability_issues',
          }),
        },
        {
          value: PieChartIssueFilter.Maintainability,
          label: formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters.pie_filter.maintainability_issues',
          }),
        },
      ];
    case PieChartMetric.HotspotCount:
      return [
        {
          value: '',
          label: formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters.pie_filter.all_hotspots',
          }),
        },
        {
          value: PieChartHotspotFilter.ToReview,
          label: formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters.pie_filter.hotspots_to_review',
          }),
        },
        {
          value: PieChartHotspotFilter.Fixed,
          label: formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters.pie_filter.hotspots_fixed',
          }),
        },
        {
          value: PieChartHotspotFilter.Safe,
          label: formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters.pie_filter.hotspots_safe',
          }),
        },
      ];
    default:
      return [
        {
          value: '',
          label: formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters.pie_filter.no_filter',
          }),
        },
      ];
  }
}

export function buildPieChartScopeSelectData(
  formatMessage: (descriptor: { id: string }) => string,
) {
  return [
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.select.scope.option.overall_code',
      }),
      value: CodeScope.Overall,
    },
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.select.scope.option.new_code',
      }),
      value: CodeScope.New,
    },
  ];
}

export function buildLineChartTimeRangeSelectData(
  formatMessage: (descriptor: { id: string }) => string,
): Array<{ label: string; value: HistoryRange }> {
  return [
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.select.time_range.option.last_12_months',
      }),
      value: HistoryRange.Last12Months,
    },
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.select.time_range.option.last_6_months',
      }),
      value: HistoryRange.Last6Months,
    },
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.select.time_range.option.last_3_months',
      }),
      value: HistoryRange.Last3Months,
    },
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.select.time_range.option.last_month',
      }),
      value: HistoryRange.LastMonth,
    },
  ];
}

export function buildRichMetricIssueStatusSelectOptions(
  formatMessage: (descriptor: { id: string }) => string,
): Array<{ label: string; value: IssueStatus | '' }> {
  return [
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.software_quality.all',
      }),
      value: '',
    },
    {
      label: formatMessage({ id: 'issue.status.OPEN' }),
      value: IssueStatus.Open,
    },
    {
      label: formatMessage({ id: 'issue.status.ACCEPTED' }),
      value: IssueStatus.Accepted,
    },
    {
      label: formatMessage({ id: 'issue.status.FALSE_POSITIVE' }),
      value: IssueStatus.FalsePositive,
    },
  ];
}

export function buildSoftwareQualitySelectOptions(
  formatMessage: (descriptor: { id: string }) => string,
): Array<{ label: string; value: SoftwareQuality | '' }> {
  return [
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.software_quality.all',
      }),
      value: '',
    },
    {
      label: formatMessage({ id: 'software_quality.SECURITY' }),
      value: SoftwareQuality.Security,
    },
    {
      label: formatMessage({ id: 'software_quality.RELIABILITY' }),
      value: SoftwareQuality.Reliability,
    },
    {
      label: formatMessage({ id: 'software_quality.MAINTAINABILITY' }),
      value: SoftwareQuality.Maintainability,
    },
  ];
}

export function buildImpactSeveritySelectOptions(
  formatMessage: (descriptor: { id: string }) => string,
) {
  return [
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.software_quality.all',
      }),
      value: 'all' as const,
    },
    {
      label: formatMessage({ id: 'severity.BLOCKER' }),
      value: SoftwareImpactSeverity.Blocker,
    },
    {
      label: `${formatMessage({ id: 'severity.HIGH' })} +`,
      value: SoftwareImpactSeverity.High,
    },
    {
      label: `${formatMessage({ id: 'severity.MEDIUM' })} +`,
      value: SoftwareImpactSeverity.Medium,
    },
    {
      label: `${formatMessage({ id: 'severity.LOW' })} +`,
      value: SoftwareImpactSeverity.Low,
    },
    {
      label: `${formatMessage({ id: 'severity.INFO' })} +`,
      value: SoftwareImpactSeverity.Info,
    },
  ];
}
