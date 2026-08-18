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
import { mapPieChartHotspotFilterToIssueCountStatuses } from '../../../components/pie-chart/pieChartFilterLineSegments';
import { HistoryRange } from '../../../data/widgets/line-chart';
import {
  IssueStatus,
  PieChartHotspotFilter,
  PieChartIssueFilter,
  PieChartMetric,
} from '../../../types/dashboard-widget';
import { CodeScope } from '../../../types/widget-common';
import {
  applyIssueStatusMeasureFilters,
  applySeverityMeasureFilters,
  applySoftwareQualityMeasureFilters,
  applySoftwareQualityMeasureFiltersPreservingSeverity,
  buildImpactSeveritySelectOptions,
  buildLineChartTimeRangeSelectData,
  buildPieChartFilterSelectOptions,
  buildPieChartScopeSelectData,
  buildRichMetricIssueStatusSelectOptions,
  buildSoftwareQualitySelectOptions,
  impactSeverityFilterValueForSelection,
  severitiesForImpactFilterOption,
} from '../applyFilterAccordionHelpers';

describe('applyFilterAccordionHelpers', () => {
  const formatId = (descriptor: { id: string }) => descriptor.id;

  describe('severitiesForImpactFilterOption', () => {
    it('returns undefined for all', () => {
      expect(severitiesForImpactFilterOption('all')).toBeUndefined();
    });

    it('returns undefined for unknown severity token', () => {
      expect(severitiesForImpactFilterOption('nope')).toBeUndefined();
    });

    it('returns cumulative severities from the selected level upward', () => {
      expect(severitiesForImpactFilterOption(SoftwareImpactSeverity.Medium)).toEqual([
        SoftwareImpactSeverity.Medium,
        SoftwareImpactSeverity.High,
        SoftwareImpactSeverity.Blocker,
      ]);
    });
  });

  describe('applyIssueStatusMeasureFilters', () => {
    it('sets issue status without clearing other filters', () => {
      expect(
        applyIssueStatusMeasureFilters(
          { impactSoftwareQuality: SoftwareQuality.Security },
          IssueStatus.Open,
        ),
      ).toEqual({
        impactSoftwareQuality: SoftwareQuality.Security,
        issueStatus: IssueStatus.Open,
      });
    });

    it('clears issue status when empty string is selected', () => {
      expect(applyIssueStatusMeasureFilters({ issueStatus: IssueStatus.Open }, '')).toEqual({
        issueStatus: undefined,
      });
    });
  });

  describe('applySoftwareQualityMeasureFilters', () => {
    it('sets software quality without clearing issue status and preserves severities', () => {
      expect(
        applySoftwareQualityMeasureFilters(
          { issueStatus: IssueStatus.Open, impactSeverities: [SoftwareImpactSeverity.High] },
          SoftwareQuality.Security,
        ),
      ).toEqual({
        impactSoftwareQuality: SoftwareQuality.Security,
        impactSeverities: [SoftwareImpactSeverity.High],
        issueStatus: IssueStatus.Open,
      });
    });

    it('clears severities when software quality is cleared', () => {
      expect(
        applySoftwareQualityMeasureFilters(
          {
            impactSoftwareQuality: SoftwareQuality.Security,
            impactSeverities: [SoftwareImpactSeverity.High],
          },
          '',
        ),
      ).toEqual({
        impactSoftwareQuality: undefined,
        impactSeverities: undefined,
      });
    });
  });

  describe('applySeverityMeasureFilters', () => {
    it('updates severities without clearing issue status', () => {
      expect(
        applySeverityMeasureFilters(
          { issueStatus: IssueStatus.Open, impactSoftwareQuality: SoftwareQuality.Security },
          SoftwareImpactSeverity.Medium,
        ),
      ).toEqual({
        impactSoftwareQuality: SoftwareQuality.Security,
        impactSeverities: [
          SoftwareImpactSeverity.Medium,
          SoftwareImpactSeverity.High,
          SoftwareImpactSeverity.Blocker,
        ],
        issueStatus: IssueStatus.Open,
      });
    });

    it('creates filters from an empty base when measure filters are undefined', () => {
      expect(applySeverityMeasureFilters(undefined, 'all')).toEqual({
        impactSeverities: undefined,
      });
    });
  });

  describe('applySoftwareQualityMeasureFiltersPreservingSeverity', () => {
    it('updates software quality while preserving all other filters', () => {
      expect(
        applySoftwareQualityMeasureFiltersPreservingSeverity(
          { issueStatus: IssueStatus.Open, impactSeverities: [SoftwareImpactSeverity.Blocker] },
          SoftwareQuality.Reliability,
        ),
      ).toEqual({
        impactSeverities: [SoftwareImpactSeverity.Blocker],
        impactSoftwareQuality: SoftwareQuality.Reliability,
        issueStatus: IssueStatus.Open,
      });
    });

    it('keeps existing severities when quality is cleared, unlike applySoftwareQualityMeasureFilters', () => {
      // applySoftwareQualityMeasureFilters clears impactSeverities when quality is cleared;
      // this variant preserves them since software quality and severity are independent.
      expect(
        applySoftwareQualityMeasureFiltersPreservingSeverity(
          {
            impactSoftwareQuality: SoftwareQuality.Security,
            impactSeverities: [SoftwareImpactSeverity.Blocker],
          },
          '',
        ),
      ).toEqual({
        impactSoftwareQuality: undefined,
        impactSeverities: [SoftwareImpactSeverity.Blocker],
      });
    });
  });

  describe('buildRichMetricIssueStatusSelectOptions', () => {
    it('includes all statuses (open, accepted, false positive) for every dashboard type', () => {
      const options = buildRichMetricIssueStatusSelectOptions(formatId);
      expect(options.map((option) => option.value)).toEqual([
        '',
        IssueStatus.Open,
        IssueStatus.Accepted,
        IssueStatus.FalsePositive,
      ]);
    });
  });

  describe('impactSeverityFilterValueForSelection', () => {
    it('returns all when selection is empty or undefined', () => {
      expect(impactSeverityFilterValueForSelection(undefined)).toBe('all');
      expect(impactSeverityFilterValueForSelection([])).toBe('all');
    });

    it('returns all when selection is not a strict cumulative suffix', () => {
      expect(
        impactSeverityFilterValueForSelection([
          SoftwareImpactSeverity.Blocker,
          SoftwareImpactSeverity.Low,
        ]),
      ).toBe('all');
    });

    it('returns the minimum severity when selection matches cumulative order', () => {
      expect(
        impactSeverityFilterValueForSelection([
          SoftwareImpactSeverity.Medium,
          SoftwareImpactSeverity.High,
          SoftwareImpactSeverity.Blocker,
        ]),
      ).toBe(SoftwareImpactSeverity.Medium);
    });

    it('returns all when an entry is not in the known order', () => {
      expect(impactSeverityFilterValueForSelection(['x' as SoftwareImpactSeverity])).toBe('all');
    });
  });

  describe('buildPieChartFilterSelectOptions', () => {
    it('builds issue-count filter options', () => {
      const options = buildPieChartFilterSelectOptions(PieChartMetric.IssueCount, formatId);
      expect(options.map((o) => o.value)).toEqual([
        '',
        PieChartIssueFilter.Security,
        PieChartIssueFilter.Reliability,
        PieChartIssueFilter.Maintainability,
      ]);
    });

    it('builds hotspot-count filter options', () => {
      const options = buildPieChartFilterSelectOptions(PieChartMetric.HotspotCount, formatId);
      expect(options.map((o) => o.value)).toEqual([
        '',
        PieChartHotspotFilter.ToReview,
        PieChartHotspotFilter.Fixed,
        PieChartHotspotFilter.Safe,
      ]);
    });

    it('maps hotspot pie filters to issue-count statuses', () => {
      expect(mapPieChartHotspotFilterToIssueCountStatuses(PieChartHotspotFilter.ToReview)).toEqual([
        'TO_REVIEW',
      ]);
      expect(mapPieChartHotspotFilterToIssueCountStatuses(PieChartHotspotFilter.Fixed)).toEqual([
        'FIXED',
      ]);
      expect(mapPieChartHotspotFilterToIssueCountStatuses(PieChartHotspotFilter.Safe)).toEqual([
        'SAFE',
      ]);
      expect(mapPieChartHotspotFilterToIssueCountStatuses('')).toBeUndefined();
    });

    it('builds default options for line-count metric', () => {
      const options = buildPieChartFilterSelectOptions(PieChartMetric.LineCount, formatId);
      expect(options).toEqual([
        {
          value: '',
          label: formatId({ id: 'dashboard.add_widget_modal.apply_filters.pie_filter.no_filter' }),
        },
      ]);
    });
  });

  describe('buildPieChartScopeSelectData', () => {
    it('returns overall and new code labels', () => {
      const data = buildPieChartScopeSelectData(formatId);
      expect(data.map((d) => d.value)).toEqual([CodeScope.Overall, CodeScope.New]);
    });
  });

  describe('line chart time range select data', () => {
    it('returns the supported ranges', () => {
      const data = buildLineChartTimeRangeSelectData(formatId);
      expect(data.map((d) => d.value)).toEqual([
        HistoryRange.Last12Months,
        HistoryRange.Last6Months,
        HistoryRange.Last3Months,
        HistoryRange.LastMonth,
      ]);
    });
  });

  describe('buildSoftwareQualitySelectOptions', () => {
    it('includes empty value and each software quality', () => {
      const options = buildSoftwareQualitySelectOptions(formatId);
      expect(options.map((o) => o.value)).toEqual([
        '',
        SoftwareQuality.Security,
        SoftwareQuality.Reliability,
        SoftwareQuality.Maintainability,
      ]);
    });
  });

  describe('buildImpactSeveritySelectOptions', () => {
    it('includes all sentinel and ordered severities', () => {
      const options = buildImpactSeveritySelectOptions(formatId);
      expect(options[0]?.value).toBe('all');
      expect(options.map((o) => o.value)).toEqual([
        'all',
        SoftwareImpactSeverity.Blocker,
        SoftwareImpactSeverity.High,
        SoftwareImpactSeverity.Medium,
        SoftwareImpactSeverity.Low,
        SoftwareImpactSeverity.Info,
      ]);
    });
  });
});
