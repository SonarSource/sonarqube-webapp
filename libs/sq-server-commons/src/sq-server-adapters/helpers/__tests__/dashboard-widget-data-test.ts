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

import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey, MetricType } from '~shared/types/metrics';
import {
  CodeScope,
  DashboardMetricType,
  HistoryRange,
  LineChartGroupBy,
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartProjectSlice,
  RichMetricKey,
  aggregateSmallSegments,
  computeTrendData,
  formatPercentage,
  formatPieChartSegmentLabel,
  getActualMetricKey,
  getDisplayedPieChartSegmentValues,
  getPortfolioDashboardMeasureRequestKey,
  getSegmentColor,
  getThirtyDayTrendWindow,
  historySinceIsoDate,
  isQualityGateStatusWidget,
  issueCountHistoryRuleToTrend,
  issueCountHistoryToPieCounts,
  issueHistoryQueryExtras,
  issueHistoryTrendStartDate,
  lineChartDataToSingleSeries,
  lineChartSinceDate,
  lineCountMeasureKeys,
  mapPieChartToIssueHistoryParams,
  organizationMeasuresToLineCountPieData,
  organizationsHistoryStartDateWithRetentionBuffer,
  portfolioIssueCountHistoryLatestTotal,
  portfolioIssueHistoryToLineData,
  portfolioIssueHistoryToMultiLineSeries,
  portfolioIssueHistoryToSparklineSeries,
  portfolioIssueHistoryToTrend,
  portfolioMeasuresHistoryLatestValue,
  portfolioMeasuresHistoryToSparklineSeries,
  portfolioMeasuresHistoryToTrend,
  portfolioMeasuresLatestRecord,
  portfolioMeasuresToLineData,
  qualityGateCounts,
  resolveRichCountTrendMetricMetadata,
  sortSegments,
  supportsOrganizationPieChartIssueHistory,
  tryQualityGateDistributionMessageId,
} from '../dashboard-widget-data';

const formatMessage = ({ id }: { id: string }) => id;

function issueDay(date: string, distribution: Array<{ key: string; value: number }>) {
  return { date, distribution };
}

function measureDay(
  date: string,
  measures: Array<{ metric: string; type: string; value: string }>,
) {
  return { date, measures };
}

describe('dashboard widget data helpers', () => {
  describe('date windows', () => {
    it('uses the retention buffer and normalizes dates to UTC midnight', () => {
      const from = new Date('2026-03-30T15:45:00.000Z');

      expect(organizationsHistoryStartDateWithRetentionBuffer(from)).toBe(
        '2025-03-31T00:00:00.000Z',
      );
      expect(historySinceIsoDate(6, from)).toBe('2025-09-30T00:00:00.000Z');
      expect(lineChartSinceDate(HistoryRange.All, from)).toBe('2025-03-31T00:00:00.000Z');
      expect(lineChartSinceDate(HistoryRange.LastMonth, from)).toBe('2026-02-28T00:00:00.000Z');
    });

    it('uses the current time for the trend history window', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));

      expect(issueHistoryTrendStartDate()).toBe('2026-02-28T00:00:00.000Z');

      jest.useRealTimers();
    });

    it('sorts points, removes invalid dates and keeps the comparison window', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
      const points = [
        { timestamp: Number.NaN, value: 'invalid' },
        { timestamp: new Date('2026-03-01T00:00:00.000Z').getTime(), value: 'old' },
        { timestamp: new Date('2026-03-29T00:00:00.000Z').getTime(), value: 'new' },
      ];

      expect(getThirtyDayTrendWindow(points, (point) => point.timestamp)).toEqual([
        points[1],
        points[2],
      ]);

      jest.useRealTimers();
    });
  });

  describe('issue history', () => {
    const history = [
      issueDay('2026-01-10T00:00:00.000Z', [{ key: 'java:S1', value: 1 }]),
      issueDay('2026-02-20T00:00:00.000Z', [
        { key: 'java:S1', value: 4 },
        { key: 'java:S2', value: 20 },
      ]),
      issueDay('2026-03-20T00:00:00.000Z', [{ key: 'java:S1', value: 7 }]),
    ];

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('uses the latest day for totals and pie counts', () => {
      expect(portfolioIssueCountHistoryLatestTotal(history)).toBe(7);
      expect(issueCountHistoryToPieCounts(history)).toEqual({ 'java:S1': 7 });
      expect(portfolioIssueCountHistoryLatestTotal(undefined)).toBeNull();
      expect(issueCountHistoryToPieCounts([])).toEqual({});
    });

    it('computes total and rule trends using the 30-day comparison window', () => {
      expect(portfolioIssueHistoryToTrend(history)).toEqual({ current: '7', past: '24' });
      expect(issueCountHistoryRuleToTrend(history, 'java:S1')).toEqual({
        current: '7',
        past: '4',
      });
      expect(issueCountHistoryRuleToTrend(history, 'missing')).toEqual({
        current: '0',
        past: '0',
      });
      expect(portfolioIssueHistoryToSparklineSeries(history)).toEqual([24, 7]);
    });

    it('creates line and grouped series, including rules absent from the latest day', () => {
      const line = portfolioIssueHistoryToLineData(history, HistoryRange.Last3Months);
      expect(line.map((point) => point.y)).toEqual([1, 24, 7]);
      expect(portfolioIssueHistoryToLineData(undefined, HistoryRange.Last3Months)).toEqual([]);

      const series = portfolioIssueHistoryToMultiLineSeries(
        history,
        HistoryRange.Last3Months,
        LineChartGroupBy.Rule,
      );
      expect(series.map((entry) => entry.id)).toEqual(['java:S2', 'java:S1']);
      expect(series[0]?.data.map((point) => point.y)).toEqual([0, 20, 0]);
      expect(
        portfolioIssueHistoryToMultiLineSeries(history, HistoryRange.Last3Months, 'none'),
      ).toEqual([]);
    });
  });

  describe('issue history parameters and metric keys', () => {
    it('maps filters to history dimensions and status/impact constraints', () => {
      expect(
        mapPieChartToIssueHistoryParams({
          entityId: 'portfolio-1',
          entityType: 'PORTFOLIO',
          filter: PieChartIssueFilter.Security,
          metric: PieChartMetric.IssueCount,
          slice: PieChartIssueSlice.IssueStatuses,
        }),
      ).toEqual({
        entityId: 'portfolio-1',
        entityType: 'PORTFOLIO',
        impacts: [
          'SECURITY:BLOCKER',
          'SECURITY:HIGH',
          'SECURITY:MEDIUM',
          'SECURITY:LOW',
          'SECURITY:INFO',
        ],
        sliceBy: 'STATUS',
        statuses: ['OPEN', 'CONFIRMED', 'ACCEPTED', 'FALSE_POSITIVE', 'FIXED'],
      });

      expect(
        mapPieChartToIssueHistoryParams({
          entityId: 'project-1',
          entityType: 'PROJECT_BRANCH',
          filter: 'toReview',
          metric: PieChartMetric.HotspotCount,
          slice: PieChartHotspotSlice.ReviewPriority,
        }),
      ).toMatchObject({
        entityId: 'project-1',
        issueTypes: ['SECURITY_HOTSPOT'],
        sliceBy: 'SEVERITY',
        statuses: ['TO_REVIEW'],
      });

      expect(
        mapPieChartToIssueHistoryParams({
          entityId: 'project-1',
          entityType: 'PROJECT_BRANCH',
          filter: '',
          metric: PieChartMetric.LineCount,
          slice: PieChartLineSlice.Coverage,
        }),
      ).toBeNull();
    });

    it('builds issue-history extras for filters, rich metrics and inferred qualities', () => {
      expect(
        issueHistoryQueryExtras(
          { impactSeverities: ['HIGH'], impactSoftwareQuality: SoftwareQuality.Security },
          RichMetricKey.Issues,
          undefined,
        ),
      ).toEqual({ impacts: ['SECURITY:HIGH'], statuses: ['OPEN'] });
      expect(
        issueHistoryQueryExtras({ impactSeverities: ['LOW'] }, RichMetricKey.Issues, undefined),
      ).toEqual({
        impacts: ['SECURITY:LOW', 'RELIABILITY:LOW', 'MAINTAINABILITY:LOW'],
        statuses: ['OPEN'],
      });
      expect(issueHistoryQueryExtras(undefined, RichMetricKey.Hotspots, undefined)).toEqual({
        issueTypes: ['SECURITY_HOTSPOT'],
      });
      expect(
        issueHistoryQueryExtras(undefined, RichMetricKey.Issues, MetricKey.reliability_issues),
      ).toEqual({
        impacts: [
          'RELIABILITY:BLOCKER',
          'RELIABILITY:HIGH',
          'RELIABILITY:MEDIUM',
          'RELIABILITY:LOW',
          'RELIABILITY:INFO',
        ],
        statuses: ['OPEN'],
      });
      expect(
        issueHistoryQueryExtras({ issueStatus: 'FIXED' }, RichMetricKey.Issues, undefined),
      ).toEqual({ impacts: expect.any(Array), statuses: ['FIXED'] });
    });

    it('resolves rich/raw metric keys and new-code request keys', () => {
      expect(
        getActualMetricKey({ type: DashboardMetricType.Raw, metricKey: MetricKey.coverage }),
      ).toBe(MetricKey.coverage);
      expect(
        getActualMetricKey({ type: DashboardMetricType.Rich, metricKey: RichMetricKey.Hotspots }),
      ).toBe(MetricKey.security_hotspots);
      expect(
        getActualMetricKey({ type: DashboardMetricType.Rich, metricKey: RichMetricKey.Issues }),
      ).toBe(MetricKey.violations);
      expect(getActualMetricKey({ type: 'unknown' })).toBeUndefined();
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.coverage, true)).toBe(
        MetricKey.new_coverage,
      );
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.ncloc, true)).toBe(MetricKey.ncloc);
    });
  });

  describe('measure history', () => {
    const history = [
      measureDay('2026-01-10', [
        { metric: MetricKey.coverage, type: MetricType.Percent, value: '61' },
      ]),
      measureDay('2026-03-20', [
        { metric: MetricKey.coverage, type: MetricType.Percent, value: '83' },
        { metric: MetricKey.security_issues, type: MetricType.Data, value: '{"HIGH": 3}' },
      ]),
    ];

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns latest values and trends for a metric', () => {
      expect(portfolioMeasuresHistoryLatestValue(history, MetricKey.coverage)).toBe('83');
      expect(portfolioMeasuresHistoryLatestValue(undefined, MetricKey.coverage)).toBeUndefined();
      expect(portfolioMeasuresHistoryToTrend(history, MetricKey.coverage)).toEqual({
        current: '83',
        past: '61',
      });
    });

    it('parses data metrics for sparklines and line data', () => {
      expect(
        portfolioMeasuresHistoryToSparklineSeries(
          history,
          MetricKey.security_issues,
          MetricType.Data,
          { impactSeverities: ['HIGH'] },
        ),
      ).toEqual([3]);
      expect(
        portfolioMeasuresToLineData(
          [
            measureDay('2026-03-20', [
              { metric: MetricKey.coverage, type: MetricType.Percent, value: '83' },
            ]),
          ],
          MetricKey.coverage,
          HistoryRange.Last3Months,
          MetricKey.coverage,
          MetricType.Percent,
          undefined,
        ),
      ).toEqual([{ x: new Date('2026-03-20'), y: 83 }]);
      expect(
        portfolioMeasuresToLineData(
          [
            measureDay('2026-03-20', [
              { metric: MetricKey.security_rating, type: MetricType.Rating, value: 'C' },
            ]),
          ],
          MetricKey.security_rating,
          HistoryRange.Last3Months,
          MetricKey.security_rating,
          MetricType.Rating,
          undefined,
        )[0]?.y,
      ).toBe(3);
    });

    it('handles aggregate values, numeric ratings and invalid history points', () => {
      const dataHistory = [
        measureDay('2026-03-20', [
          { metric: MetricKey.security_issues, type: MetricType.Data, value: '{"total":"4"}' },
          { metric: MetricKey.security_rating, type: MetricType.Rating, value: '6' },
          { metric: MetricKey.reliability_rating, type: MetricType.Rating, value: 'invalid' },
        ]),
        measureDay('2025-01-01', [
          { metric: MetricKey.security_rating, type: MetricType.Rating, value: 'A' },
        ]),
      ];

      expect(
        portfolioMeasuresHistoryToSparklineSeries(
          dataHistory,
          MetricKey.security_issues,
          MetricType.Data,
          undefined,
        ),
      ).toEqual([4]);
      expect(
        portfolioMeasuresToLineData(
          dataHistory,
          MetricKey.security_rating,
          HistoryRange.Last3Months,
          MetricKey.security_rating,
          MetricType.Rating,
          undefined,
        ),
      ).toEqual([{ x: new Date('2026-03-20'), y: 6 }]);
      expect(
        portfolioMeasuresToLineData(
          dataHistory,
          MetricKey.reliability_rating,
          HistoryRange.Last3Months,
          MetricKey.reliability_rating,
          MetricType.Rating,
          undefined,
        ),
      ).toEqual([]);
    });

    it('normalizes line series and latest distribution measures', () => {
      expect(lineChartDataToSingleSeries([], 'Coverage')).toEqual([]);
      expect(
        lineChartDataToSingleSeries([{ x: new Date('2026-03-20'), y: 83 }], 'Coverage'),
      ).toEqual([
        {
          color: expect.any(String),
          data: [{ x: new Date('2026-03-20'), y: 83 }],
          id: 'total',
          label: 'Coverage',
        },
      ]);
      expect(
        portfolioMeasuresLatestRecord(
          [
            measureDay('2026-01-01', [
              { metric: MetricKey.coverage, type: MetricType.Percent, value: '60' },
            ]),
            measureDay('2026-03-01', [
              {
                metric: MetricKey.security_issues,
                type: MetricType.Distribution,
                value: '{"HIGH":"3","LOW":"x"}',
              },
            ]),
          ],
          undefined,
        ),
      ).toEqual({ security_issues: { HIGH: 3 } });
    });

    it('normalizes Server rating values and distribution buckets', () => {
      expect(
        portfolioMeasuresLatestRecord(
          [
            measureDay('2026-03-01', [
              { metric: MetricKey.security_rating, type: MetricType.Rating, value: '2.0' },
              {
                metric: MetricKey.security_rating_distribution,
                type: MetricType.Distribution,
                value: '{"1":"3","5":"2"}',
              },
            ]),
          ],
          {
            [MetricKey.security_rating]: { type: MetricType.Rating },
            [MetricKey.security_rating_distribution]: { type: MetricType.Distribution },
          },
        ),
      ).toEqual({
        [MetricKey.security_rating]: 'B',
        [MetricKey.security_rating_distribution]: { A: 3, E: 2 },
      });
    });
  });

  describe('pie chart data', () => {
    it('aggregates, orders and formats segments', () => {
      const entries: Array<[string, number]> = [
        ['LOW', 1],
        ['BLOCKER', 5],
        ['HIGH', 3],
        ['MEDIUM', 2],
        ['INFO', 1],
      ];
      expect(
        sortSegments(entries, PieChartIssueSlice.ImpactSeverities, PieChartMetric.IssueCount).map(
          ([key]) => key,
        ),
      ).toEqual(['BLOCKER', 'HIGH', 'MEDIUM', 'LOW', 'INFO']);
      expect(
        aggregateSmallSegments(
          [
            ['a', 20],
            ['b', 1],
            ['c', 1],
            ['d', 1],
            ['e', 1],
            ['f', 1],
            ['g', 1],
            ['h', 1],
            ['i', 1],
          ],
          28,
        ),
      ).toEqual([
        ['a', 20],
        ['b', 1],
        ['c', 1],
        ['d', 1],
        ['OTHER_5', 5],
      ]);
      expect(
        getDisplayedPieChartSegmentValues(
          { a: 20, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1, h: 1, i: 1 },
          'slice',
          'metric',
        ),
      ).toEqual(['a', 'b', 'c', 'd']);
      expect(formatPercentage(12.4)).toBe('12');
      expect(formatPercentage(0.4)).toBe('0.4');
      expect(formatPercentage(0)).toBe('0');
    });

    it('prefers security-category metadata over rule metadata', () => {
      expect(
        formatPieChartSegmentLabel(
          'sql-injection',
          formatMessage,
          PieChartMetric.HotspotCount,
          PieChartHotspotSlice.SecurityCategory,
          {
            rules: { 'sql-injection': { name: 'A rule label' } },
            securityCategories: { 'sql-injection': { title: 'SQL Injection' } },
          },
        ),
      ).toBe('SQL Injection');
      expect(
        formatPieChartSegmentLabel(
          'java:S100',
          formatMessage,
          PieChartMetric.IssueCount,
          PieChartIssueSlice.Rules,
          { rules: { 'java:S100': { name: 'Rule name' } } },
        ),
      ).toBe('Rule name');
      expect(formatPieChartSegmentLabel('OTHER_2', formatMessage, 'metric', 'slice')).toBe(
        'Other (2)',
      );
      expect(
        formatPieChartSegmentLabel(
          'ADAPTABLE',
          formatMessage,
          PieChartMetric.IssueCount,
          PieChartIssueSlice.CleanCodeAttributeCategories,
        ),
      ).toBe('cct.clean_code_attribute_category.ADAPTABLE');
    });

    it('formats line-chart labels and applies the known segment colors', () => {
      expect(
        formatPieChartSegmentLabel(
          'covered',
          formatMessage,
          PieChartMetric.LineCount,
          PieChartLineSlice.Coverage,
        ),
      ).toBe('Covered');
      expect(
        formatPieChartSegmentLabel(
          'non-duplicated',
          formatMessage,
          PieChartMetric.LineCount,
          PieChartLineSlice.Duplications,
        ),
      ).toBe('Non-duplicated');
      expect(
        formatPieChartSegmentLabel(
          'java',
          formatMessage,
          PieChartMetric.LineCount,
          PieChartLineSlice.Language,
          { languages: { java: { name: 'Java' } } },
        ),
      ).toBe('Java');

      [
        [PieChartIssueSlice.IssueStatuses, 'OPEN'],
        [PieChartIssueSlice.IssueStatuses, 'FIXED'],
        [PieChartIssueSlice.IssueStatuses, 'ACCEPTED'],
        [PieChartIssueSlice.IssueStatuses, 'FALSE_POSITIVE'],
        [PieChartHotspotSlice.ReviewStatus, 'TO_REVIEW'],
        [PieChartHotspotSlice.ReviewStatus, 'FIXED'],
        [PieChartHotspotSlice.ReviewStatus, 'SAFE'],
        [PieChartLineSlice.Coverage, 'covered'],
        [PieChartLineSlice.Duplications, 'duplicated'],
      ].forEach(([slice, value]) => {
        expect(getSegmentColor(value, 0, slice)).toEqual(expect.any(String));
      });

      expect(
        sortSegments(
          [
            ['UNKNOWN', 1],
            ['OPEN', 2],
          ],
          PieChartIssueSlice.IssueStatuses,
          PieChartMetric.IssueCount,
        ),
      ).toEqual([
        ['OPEN', 2],
        ['UNKNOWN', 1],
      ]);
      expect(sortSegments([['SAFE', 1]], PieChartHotspotSlice.ReviewStatus, '')).toEqual([
        ['SAFE', 1],
      ]);
    });

    it('builds colors and identifies supported organization widgets', () => {
      expect(getSegmentColor('uncovered', 0, PieChartLineSlice.Coverage)).toEqual(
        expect.any(String),
      );
      expect(getSegmentColor('OTHER_2', 0, PieChartLineSlice.Coverage)).toEqual(expect.any(String));
      expect(
        supportsOrganizationPieChartIssueHistory(
          PieChartMetric.HotspotCount,
          PieChartHotspotSlice.SecurityCategory,
        ),
      ).toBe(true);
      expect(
        supportsOrganizationPieChartIssueHistory(
          PieChartMetric.LineCount,
          PieChartLineSlice.Language,
        ),
      ).toBe(false);
      expect(
        supportsOrganizationPieChartIssueHistory(
          PieChartMetric.IssueCount,
          PieChartIssueSlice.ImpactSeverities,
        ),
      ).toBe(true);
      expect(
        supportsOrganizationPieChartIssueHistory(
          PieChartMetric.IssueCount,
          PieChartIssueSlice.Languages,
        ),
      ).toBe(false);
      expect(
        supportsOrganizationPieChartIssueHistory(
          PieChartMetric.IssueCount,
          PieChartIssueSlice.CleanCodeAttributeCategories,
        ),
      ).toBe(false);
      expect(
        isQualityGateStatusWidget({
          filter: '',
          metric: PieChartMetric.ProjectCount,
          scope: CodeScope.Overall,
          slice: PieChartProjectSlice.Status,
        }),
      ).toBe(true);
    });
  });

  describe('organization measures and trend data', () => {
    it('builds language, coverage and duplication pie counts with fallbacks', () => {
      expect(
        organizationMeasuresToLineCountPieData(
          { [MetricKey.ncloc_language_distribution]: { java: 9, js: 1 } },
          PieChartLineSlice.Language,
          CodeScope.Overall,
        ),
      ).toEqual({ counts: { java: 9, js: 1 } });
      expect(
        organizationMeasuresToLineCountPieData(
          { [MetricKey.lines_to_cover]: '80', [MetricKey.coverage]: '62.5' },
          PieChartLineSlice.Coverage,
          CodeScope.Overall,
        ),
      ).toEqual({ counts: { uncovered: 30, covered: 50 } });
      expect(
        organizationMeasuresToLineCountPieData(
          { [MetricKey.new_lines]: '40', [MetricKey.new_duplicated_lines_density]: '25' },
          PieChartLineSlice.Duplications,
          CodeScope.New,
        ),
      ).toEqual({ counts: { duplicated: 10, 'non-duplicated': 30 } });
      expect(
        organizationMeasuresToLineCountPieData(
          undefined,
          PieChartLineSlice.Coverage,
          CodeScope.Overall,
        ),
      ).toEqual({
        counts: {},
      });
    });

    it('handles malformed distributions and unavailable line-count measures', () => {
      expect(
        organizationMeasuresToLineCountPieData(
          { [MetricKey.ncloc_language_distribution]: '{"java": "2", "js": "x"}' },
          PieChartLineSlice.Language,
          CodeScope.Overall,
        ),
      ).toEqual({ counts: { java: 2 } });
      expect(
        organizationMeasuresToLineCountPieData(
          { [MetricKey.ncloc_language_distribution]: '{invalid' },
          PieChartLineSlice.Language,
          CodeScope.Overall,
        ),
      ).toEqual({ counts: {} });
      expect(
        organizationMeasuresToLineCountPieData(
          { [MetricKey.lines_to_cover]: '80' },
          PieChartLineSlice.Coverage,
          CodeScope.Overall,
        ),
      ).toEqual({ counts: {} });
      expect(
        organizationMeasuresToLineCountPieData(
          { [MetricKey.ncloc]: '100' },
          PieChartLineSlice.Duplications,
          CodeScope.Overall,
        ),
      ).toEqual({ counts: {} });
      expect(
        organizationMeasuresToLineCountPieData(
          { [MetricKey.ncloc]: '100', [MetricKey.duplicated_lines]: '20' },
          PieChartLineSlice.Duplications,
          CodeScope.Overall,
        ),
      ).toEqual({ counts: { duplicated: 20, 'non-duplicated': 80 } });
      expect(organizationMeasuresToLineCountPieData({}, 'unsupported', CodeScope.Overall)).toEqual({
        counts: {},
      });
      expect(
        qualityGateCounts({
          [MetricKey.releasability_status_distribution]: '{"OK": "2", "ERROR": "x"}',
        }),
      ).toEqual({ OK: 2 });
      expect(
        qualityGateCounts({
          [MetricKey.releasability_rating_distribution]: { A: 4, E: 2 },
        }),
      ).toEqual({ ERROR: 2, OK: 4 });
    });

    it('maps all supported history filters', () => {
      expect(
        mapPieChartToIssueHistoryParams({
          entityId: 'project-1',
          entityType: 'PROJECT_BRANCH',
          filter: 'fixed',
          metric: PieChartMetric.HotspotCount,
          slice: PieChartHotspotSlice.ReviewStatus,
        }),
      ).toMatchObject({ statuses: ['FIXED'] });
      expect(
        mapPieChartToIssueHistoryParams({
          entityId: 'project-1',
          entityType: 'PROJECT_BRANCH',
          filter: 'safe',
          metric: PieChartMetric.HotspotCount,
          slice: PieChartHotspotSlice.ReviewStatus,
        }),
      ).toMatchObject({ statuses: ['SAFE'] });
      expect(
        mapPieChartToIssueHistoryParams({
          entityId: 'project-1',
          entityType: 'PROJECT_BRANCH',
          filter: PieChartIssueFilter.Reliability,
          metric: PieChartMetric.IssueCount,
          slice: PieChartIssueSlice.ImpactSoftwareQualities,
        }),
      ).toMatchObject({ impacts: expect.arrayContaining(['RELIABILITY:HIGH']) });
      expect(
        mapPieChartToIssueHistoryParams({
          entityId: 'project-1',
          entityType: 'PROJECT_BRANCH',
          filter: PieChartIssueFilter.Maintainability,
          metric: PieChartMetric.IssueCount,
          slice: PieChartIssueSlice.ImpactSoftwareQualities,
        }),
      ).toMatchObject({ impacts: expect.arrayContaining(['MAINTAINABILITY:HIGH']) });
      expect(
        mapPieChartToIssueHistoryParams({
          entityId: 'project-1',
          entityType: 'PROJECT_BRANCH',
          filter: '',
          metric: PieChartMetric.IssueCount,
          slice: 'unsupported',
        }),
      ).toBeNull();
    });

    it('maps quality gate measures and trend changes', () => {
      expect(
        qualityGateCounts({ [MetricKey.releasability_status_distribution]: { OK: 4, ERROR: 0 } }),
      ).toEqual({
        OK: 4,
      });
      expect(tryQualityGateDistributionMessageId('OK')).toBe('metric.level.OK');
      expect(tryQualityGateDistributionMessageId('UNKNOWN')).toBeUndefined();
      expect(resolveRichCountTrendMetricMetadata(MetricKey.violations)).toEqual({
        direction: -1,
        type: MetricType.Integer,
      });
      expect(
        computeTrendData({
          activityUrl: { pathname: '#' },
          currentValue: '12',
          metric: { direction: -1, type: MetricType.Integer },
          pastValue: '10',
        }),
      ).toMatchObject({ change: 2, past: 10, roundedChange: 20 });
      expect(
        computeTrendData({
          activityUrl: { pathname: '#' },
          currentValue: 'invalid',
          metric: { direction: -1, type: MetricType.Integer },
          pastValue: '10',
        }),
      ).toBeNull();
    });

    it('handles missing and malformed latest measure records', () => {
      expect(portfolioMeasuresLatestRecord(undefined, undefined)).toBeUndefined();
      expect(
        portfolioMeasuresLatestRecord(
          [
            measureDay('2026-03-20', [
              { metric: MetricKey.coverage, type: MetricType.Percent, value: '80' },
              {
                metric: MetricKey.security_issues,
                type: MetricType.Distribution,
                value: '{invalid',
              },
            ]),
          ],
          undefined,
        ),
      ).toEqual({ coverage: '80', security_issues: '{invalid' });
    });

    it('requests the measure keys needed for both overall and new-code line charts', () => {
      expect(lineCountMeasureKeys(CodeScope.Overall)).toEqual(
        expect.arrayContaining([
          MetricKey.ncloc_language_distribution,
          MetricKey.lines_to_cover,
          MetricKey.uncovered_lines,
          MetricKey.coverage,
        ]),
      );
      expect(lineCountMeasureKeys(CodeScope.New)).toEqual(
        expect.arrayContaining([
          MetricKey.new_lines_to_cover,
          MetricKey.new_uncovered_lines,
          MetricKey.new_coverage,
        ]),
      );
    });

    it('creates grouped series for each issue-history dimension', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
      const groupedHistory = [
        issueDay('2026-03-20T00:00:00.000Z', [
          { key: 'BLOCKER', value: 5 },
          { key: 'SECURITY:HIGH', value: 4 },
          { key: 'OPEN', value: 3 },
          { key: 'java:S1', value: 2 },
          { key: 'java:S2', value: 2 },
          { key: 'java:S3', value: 2 },
          { key: 'java:S4', value: 2 },
          { key: 'java:S5', value: 2 },
          { key: 'java:S6', value: 2 },
        ]),
      ];

      expect(
        portfolioIssueHistoryToMultiLineSeries(
          groupedHistory,
          HistoryRange.Last3Months,
          LineChartGroupBy.Severity,
        ),
      ).toHaveLength(9);
      expect(
        portfolioIssueHistoryToMultiLineSeries(
          groupedHistory,
          HistoryRange.Last3Months,
          LineChartGroupBy.SoftwareQuality,
        ),
      ).toHaveLength(9);
      expect(
        portfolioIssueHistoryToMultiLineSeries(
          groupedHistory,
          HistoryRange.Last3Months,
          LineChartGroupBy.Status,
        ),
      ).toHaveLength(9);
      expect(
        portfolioIssueHistoryToMultiLineSeries(
          groupedHistory,
          HistoryRange.Last3Months,
          LineChartGroupBy.Rule,
        ).some((series) => series.id.startsWith('OTHER_')),
      ).toBe(true);
      jest.useRealTimers();
    });
  });
});
