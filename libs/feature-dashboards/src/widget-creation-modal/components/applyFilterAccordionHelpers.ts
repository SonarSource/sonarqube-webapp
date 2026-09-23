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
import {
  getIssueFilterSeverityValueMessageId,
  getIssueFilterTypeValueMessageId,
} from '../utils/issueFilterPresentation';

// Lowest → highest. Used to pick the value a stored severity selection maps back to in the
// (single-select) dropdown, keeping legacy widgets that stored a cumulative range readable.
const IMPACT_SEVERITY_ASCENDING_ORDER: readonly SoftwareImpactSeverity[] = [
  SoftwareImpactSeverity.Info,
  SoftwareImpactSeverity.Low,
  SoftwareImpactSeverity.Medium,
  SoftwareImpactSeverity.High,
  SoftwareImpactSeverity.Blocker,
];
const VALID_IMPACT_SEVERITIES: ReadonlySet<SoftwareImpactSeverity> = new Set(
  IMPACT_SEVERITY_ASCENDING_ORDER,
);

/** Lowest severity present in a stored selection, e.g. for describing a legacy cumulative range. */
export function lowestImpactSeverity(
  selected: SoftwareImpactSeverity[] | undefined,
): SoftwareImpactSeverity | undefined {
  if (!selected || selected.length === 0) {
    return undefined;
  }
  return IMPACT_SEVERITY_ASCENDING_ORDER.find((severity) => selected.includes(severity));
}

export function severitiesForImpactFilterOption(
  severity: string,
): SoftwareImpactSeverity[] | undefined {
  if (severity === 'all') {
    return undefined;
  }
  if (!VALID_IMPACT_SEVERITIES.has(severity as SoftwareImpactSeverity)) {
    return undefined;
  }
  return [severity as SoftwareImpactSeverity];
}

export function impactSeverityFilterValueForSelection(
  selected: SoftwareImpactSeverity[] | undefined,
): string {
  if (selected == null || selected.length === 0) {
    return 'all';
  }
  // Single-select semantics: a fresh selection stores exactly one severity. Legacy widgets may
  // still hold a cumulative range (e.g. [High, Blocker]); surface those as their lowest severity
  // so the dropdown stays meaningful. Only changing the severity dropdown narrows the stored value
  // to a single severity; other edits leave the legacy range untouched.
  return lowestImpactSeverity(selected) ?? 'all';
}

/**
 * Explains why the severity select shows a single severity for a widget that was saved before
 * severity became single-select — e.g. "The High+ setting is no longer available. Select a new
 * severity." Returns undefined once the stored selection is down to a single severity.
 */
export function getSeverityFilterLegacyRangeNotice(
  formatMessage: (descriptor: { id: string }, values?: Record<string, string>) => string,
  impactSeverities: SoftwareImpactSeverity[] | undefined,
  isStandardMode: boolean,
): string | undefined {
  if ((impactSeverities?.length ?? 0) <= 1) {
    return undefined;
  }
  const lowestSeverity = lowestImpactSeverity(impactSeverities);
  if (!lowestSeverity) {
    return undefined;
  }
  const severityLabel = formatMessage({
    id: getIssueFilterSeverityValueMessageId(lowestSeverity, isStandardMode),
  });
  const legacyThreshold =
    lowestSeverity === SoftwareImpactSeverity.Blocker ? severityLabel : `${severityLabel}+`;
  return formatMessage(
    { id: 'dashboard.add_widget_modal.apply_filters_section.select.severity.legacy_range_notice' },
    { severity: legacyThreshold },
  );
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
  isStandardMode = false,
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
            id: isStandardMode
              ? 'issue.type.VULNERABILITY.plural'
              : 'dashboard.add_widget_modal.apply_filters.pie_filter.security_issues',
          }),
        },
        {
          value: PieChartIssueFilter.Reliability,
          label: formatMessage({
            id: isStandardMode
              ? 'issue.type.BUG.plural'
              : 'dashboard.add_widget_modal.apply_filters.pie_filter.reliability_issues',
          }),
        },
        {
          value: PieChartIssueFilter.Maintainability,
          label: formatMessage({
            id: isStandardMode
              ? 'issue.type.CODE_SMELL.plural'
              : 'dashboard.add_widget_modal.apply_filters.pie_filter.maintainability_issues',
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
      label: formatMessage({ id: 'issue.status.CONFIRMED' }),
      value: IssueStatus.Confirmed,
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
  isStandardMode = false,
): Array<{ label: string; value: SoftwareQuality | '' }> {
  const softwareQualities = isStandardMode
    ? [SoftwareQuality.Reliability, SoftwareQuality.Security, SoftwareQuality.Maintainability]
    : [SoftwareQuality.Security, SoftwareQuality.Reliability, SoftwareQuality.Maintainability];

  return [
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.software_quality.all',
      }),
      value: '',
    },
    ...softwareQualities.map((softwareQuality) => ({
      label: formatMessage({
        id: getIssueFilterTypeValueMessageId(softwareQuality, isStandardMode),
      }),
      value: softwareQuality,
    })),
  ];
}

export function buildImpactSeveritySelectOptions(
  formatMessage: (descriptor: { id: string }) => string,
  isStandardMode = false,
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
      label: formatMessage({
        id: getIssueFilterSeverityValueMessageId(SoftwareImpactSeverity.High, isStandardMode),
      }),
      value: SoftwareImpactSeverity.High,
    },
    {
      label: formatMessage({
        id: getIssueFilterSeverityValueMessageId(SoftwareImpactSeverity.Medium, isStandardMode),
      }),
      value: SoftwareImpactSeverity.Medium,
    },
    {
      label: formatMessage({
        id: getIssueFilterSeverityValueMessageId(SoftwareImpactSeverity.Low, isStandardMode),
      }),
      value: SoftwareImpactSeverity.Low,
    },
    {
      label: formatMessage({
        id: getIssueFilterSeverityValueMessageId(SoftwareImpactSeverity.Info, isStandardMode),
      }),
      value: SoftwareImpactSeverity.Info,
    },
  ];
}
