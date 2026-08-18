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
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
} from '../../../../types/dashboard-widget';
import {
  aggregateSmallSegments,
  DEFAULT_PIE_CHART_COLORS,
  formatPercentage,
  formatPieChartSegmentLabel,
  formatSegmentLabel,
  getDisplayedPieChartSegmentValues,
  getSegmentColor,
  PLACEHOLDER_COLOR,
  SENTIMENT_COLORS,
  SEVERITY_COLORS,
  sortSegments,
} from '../pieChartSegmentUtils';

describe('pieChartSegmentUtils', () => {
  describe('aggregateSmallSegments', () => {
    it('does not aggregate when there are 5 or fewer segments', () => {
      const entries: Array<[string, number]> = [
        ['a', 40],
        ['b', 30],
        ['c', 15],
        ['d', 10],
        ['e', 5],
      ];

      expect(aggregateSmallSegments(entries, 100)).toEqual(entries);
    });

    it('aggregates segments below the default percentage threshold', () => {
      expect(
        aggregateSmallSegments(
          [
            ['a', 40],
            ['b', 30],
            ['c', 15],
            ['d', 10],
            ['e', 3],
            ['f', 2],
          ],
          100,
        ),
      ).toEqual([
        ['a', 40],
        ['b', 30],
        ['c', 15],
        ['d', 10],
        ['OTHER_2', 5],
      ]);
    });

    it('does not aggregate when only one segment would end up in other', () => {
      expect(
        aggregateSmallSegments(
          [
            ['a', 40],
            ['b', 25],
            ['c', 15],
            ['d', 10],
            ['e', 6],
            ['f', 4],
          ],
          100,
        ),
      ).toHaveLength(6);
    });

    it('respects maxSegments and custom percentage options together', () => {
      expect(
        aggregateSmallSegments(
          [
            ['a', 30],
            ['b', 20],
            ['c', 15],
            ['d', 12],
            ['e', 9],
            ['f', 8],
            ['g', 6],
          ],
          100,
          { maxSegments: 5, minPercentage: 10 },
        ),
      ).toEqual([
        ['a', 30],
        ['b', 20],
        ['c', 15],
        ['d', 12],
        ['OTHER_3', 23],
      ]);
    });
  });

  describe('getDisplayedPieChartSegmentValues', () => {
    it('returns only individually rendered segment values, excluding OTHER buckets', () => {
      const counts = {
        'java:S1': 40,
        'java:S2': 30,
        'java:S3': 15,
        'java:S4': 10,
        'java:S5': 3,
        'java:S6': 2,
      };

      expect(
        getDisplayedPieChartSegmentValues(
          counts,
          PieChartMetric.IssueCount,
          PieChartIssueSlice.Rules,
        ),
      ).toEqual(['java:S1', 'java:S2', 'java:S3', 'java:S4']);
    });

    it('returns every key when aggregation does not apply', () => {
      const counts = { 'java:S1': 2, 'java:S2': 1 };

      expect(
        getDisplayedPieChartSegmentValues(
          counts,
          PieChartMetric.IssueCount,
          PieChartIssueSlice.Rules,
        ),
      ).toEqual(['java:S1', 'java:S2']);
    });
  });

  describe('formatPercentage', () => {
    it('rounds whole-percent values and preserves a small significant figure', () => {
      expect(formatPercentage(50.5)).toBe('51');
      expect(formatPercentage(0)).toBe('0');
      expect(formatPercentage(0.0567)).toBe('0.06');
      expect(formatPercentage(0.00345)).toBe('0.003');
      expect(formatPercentage(0.9)).toBe('0.9');
      expect(formatPercentage(1)).toBe('1');
    });
  });

  describe('formatSegmentLabel', () => {
    it('formats fallback values into title case', () => {
      expect(
        formatSegmentLabel(
          'impact_software_qualities',
          PieChartMetric.IssueCount,
          PieChartIssueSlice.ImpactSeverities,
        ),
      ).toBe('Impact Software Qualities');
      expect(
        formatSegmentLabel(
          'MAINTAINABILITY',
          PieChartMetric.IssueCount,
          PieChartIssueSlice.ImpactSoftwareQualities,
        ),
      ).toBe('Maintainability');
    });

    it('formats aggregated and line-count labels specially', () => {
      expect(
        formatSegmentLabel('OTHER_4', PieChartMetric.IssueCount, PieChartIssueSlice.Languages),
      ).toBe('Other (4)');
      expect(
        formatSegmentLabel('covered', PieChartMetric.LineCount, PieChartLineSlice.Coverage),
      ).toBe('Covered');
      expect(
        formatSegmentLabel(
          'non-duplicated',
          PieChartMetric.LineCount,
          PieChartLineSlice.Duplications,
        ),
      ).toBe('Non-duplicated');
    });

    it('uses rule metadata when available for rule-like slices (without the language prefix)', () => {
      expect(
        formatSegmentLabel('java:S100', PieChartMetric.IssueCount, PieChartIssueSlice.Rules, {
          rules: {
            'java:S100': { langName: 'Java', name: 'Dangerous Rule' },
          },
        }),
      ).toBe('Dangerous Rule');

      expect(
        formatSegmentLabel(
          'java:S2076',
          PieChartMetric.HotspotCount,
          PieChartHotspotSlice.SecurityCategory,
          {
            rules: {
              'java:S2076': { name: 'SQL Injection' },
            },
          },
        ),
      ).toBe('SQL Injection');
    });

    it('formats clean-code attribute categories via i18n', () => {
      expect(
        formatPieChartSegmentLabel(
          'INTENTIONAL',
          (descriptor) => descriptor.id,
          PieChartMetric.IssueCount,
          PieChartIssueSlice.CleanCodeAttributeCategories,
        ),
      ).toBe('cct.clean_code_attribute_category.INTENTIONAL');
    });

    it('uses language metadata for issue language slices without needsLanguageMetadata', () => {
      expect(
        formatPieChartSegmentLabel(
          'js',
          (descriptor) => descriptor.id,
          PieChartMetric.IssueCount,
          PieChartIssueSlice.Languages,
          { languages: { js: { name: 'JavaScript' } } },
        ),
      ).toBe('JavaScript');
    });

    it('prefers SonarSource security category titles over rule names for category keys', () => {
      expect(
        formatSegmentLabel(
          'dos',
          PieChartMetric.HotspotCount,
          PieChartHotspotSlice.SecurityCategory,
          {
            securityCategories: { dos: { title: 'DOS' } },
            rules: { dos: { name: 'Should not use' } },
          },
        ),
      ).toBe('DOS');
    });

    it('falls back cleanly when rule metadata is absent', () => {
      expect(
        formatSegmentLabel('java:S100', PieChartMetric.IssueCount, PieChartIssueSlice.Rules),
      ).toBe('Java:s100');
    });

    it('uses language metadata for issue and line language slices', () => {
      const metadata = {
        languages: {
          java: { name: 'Java' },
        },
      };

      expect(
        formatSegmentLabel(
          'java',
          PieChartMetric.IssueCount,
          PieChartIssueSlice.Languages,
          metadata,
        ),
      ).toBe('Java');
      expect(
        formatSegmentLabel('java', PieChartMetric.LineCount, PieChartLineSlice.Language, metadata),
      ).toBe('Java');
    });
  });

  describe('sortSegments', () => {
    it('uses inherent ordering for issue severities and hotspot review status', () => {
      expect(
        sortSegments(
          [
            ['LOW', 30],
            ['HIGH', 10],
            ['MEDIUM', 20],
            ['BLOCKER', 5],
            ['INFO', 50],
          ],
          PieChartIssueSlice.ImpactSeverities,
          PieChartMetric.IssueCount,
        ).map(([value]) => value),
      ).toEqual(['BLOCKER', 'HIGH', 'MEDIUM', 'LOW', 'INFO']);

      expect(
        sortSegments(
          [
            ['SAFE', 50],
            ['TO_REVIEW', 10],
            ['FIXED', 30],
          ],
          PieChartHotspotSlice.ReviewStatus,
          PieChartMetric.HotspotCount,
        ).map(([value]) => value),
      ).toEqual(['TO_REVIEW', 'FIXED', 'SAFE']);
    });

    it('falls back to count ordering when no inherent order is available', () => {
      expect(
        sortSegments(
          [
            ['java', 5],
            ['python', 30],
            ['typescript', 20],
            ['go', 10],
          ],
          PieChartIssueSlice.Languages,
          PieChartMetric.IssueCount,
        ).map(([value]) => value),
      ).toEqual(['python', 'typescript', 'go', 'java']);
    });

    it('places unknown values after ordered ones and preserves lowercase line-count behavior', () => {
      expect(
        sortSegments(
          [
            ['UNKNOWN_STATUS', 100],
            ['LOW', 10],
            ['HIGH', 20],
          ],
          PieChartIssueSlice.ImpactSeverities,
          PieChartMetric.IssueCount,
        ).map(([value]) => value),
      ).toEqual(['HIGH', 'LOW', 'UNKNOWN_STATUS']);

      expect(
        sortSegments(
          [
            ['covered', 80],
            ['uncovered', 20],
          ],
          PieChartLineSlice.Coverage,
          PieChartMetric.LineCount,
        ).map(([value]) => value),
      ).toEqual(['covered', 'uncovered']);

      expect(
        sortSegments(
          [
            ['non-duplicated', 90],
            ['duplicated', 10],
          ],
          PieChartLineSlice.Duplications,
          PieChartMetric.LineCount,
        ).map(([value]) => value),
      ).toEqual(['non-duplicated', 'duplicated']);
    });
  });

  describe('getSegmentColor', () => {
    it('uses severity colors when the slice semantics are severity-based', () => {
      expect(getSegmentColor('BLOCKER', 0, PieChartIssueSlice.ImpactSeverities)).toBe(
        SEVERITY_COLORS.BLOCKER,
      );
      expect(getSegmentColor('high', 0, PieChartHotspotSlice.ReviewPriority)).toBe(
        SEVERITY_COLORS.HIGH,
      );
    });

    it('uses the placeholder color for aggregated segments', () => {
      expect(getSegmentColor('OTHER_2', 0, PieChartIssueSlice.ImpactSeverities)).toBe(
        PLACEHOLDER_COLOR,
      );
    });

    it('uses sentiment colors for issue statuses including extended portfolio values', () => {
      expect(getSegmentColor('OPEN', 0, PieChartIssueSlice.IssueStatuses)).toBe(
        SENTIMENT_COLORS.NEGATIVE,
      );
      expect(getSegmentColor('FIXED', 1, PieChartIssueSlice.IssueStatuses)).toBe(
        SENTIMENT_COLORS.POSITIVE,
      );
      expect(getSegmentColor('ACCEPTED', 2, PieChartIssueSlice.IssueStatuses)).toBe(
        SENTIMENT_COLORS.ACKNOWLEDGED,
      );
      expect(getSegmentColor('FALSE_POSITIVE', 3, PieChartIssueSlice.IssueStatuses)).toBe(
        SENTIMENT_COLORS.NEUTRAL,
      );
      expect(getSegmentColor('ERROR', 4, PieChartIssueSlice.IssueStatuses)).toBe(
        SENTIMENT_COLORS.NEGATIVE,
      );
      expect(getSegmentColor('OK', 5, PieChartIssueSlice.IssueStatuses)).toBe(
        SENTIMENT_COLORS.POSITIVE,
      );
      expect(getSegmentColor('NOT_COMPUTED', 6, PieChartIssueSlice.IssueStatuses)).toBe(
        SENTIMENT_COLORS.ACKNOWLEDGED,
      );
      expect(getSegmentColor('NONE', 7, PieChartIssueSlice.IssueStatuses)).toBe(
        SENTIMENT_COLORS.NEUTRAL,
      );
    });

    it('uses sentiment colors for hotspot and line-count result slices', () => {
      expect(getSegmentColor('TO_REVIEW', 0, PieChartHotspotSlice.ReviewStatus)).toBe(
        SENTIMENT_COLORS.NEGATIVE,
      );
      expect(getSegmentColor('FIXED', 1, PieChartHotspotSlice.ReviewStatus)).toBe(
        SENTIMENT_COLORS.POSITIVE,
      );
      expect(getSegmentColor('SAFE', 2, PieChartHotspotSlice.ReviewStatus)).toBe(
        SENTIMENT_COLORS.ACKNOWLEDGED,
      );
      expect(getSegmentColor('uncovered', 0, PieChartLineSlice.Coverage)).toBe(
        SENTIMENT_COLORS.NEGATIVE,
      );
      expect(getSegmentColor('non-duplicated', 1, PieChartLineSlice.Duplications)).toBe(
        SENTIMENT_COLORS.POSITIVE,
      );
    });

    it('falls back to the categorical palette for unknown values', () => {
      expect(getSegmentColor('UNKNOWN', 2, PieChartIssueSlice.IssueStatuses)).toBe(
        DEFAULT_PIE_CHART_COLORS[2],
      );
      expect(getSegmentColor('item', 9, PieChartIssueSlice.Languages)).toBe(
        DEFAULT_PIE_CHART_COLORS[1],
      );
    });
  });
});
