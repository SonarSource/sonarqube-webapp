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

import { cssVar } from '@sonarsource/echoes-react';
import { SoftwareImpactSeverity } from '~shared/types/clean-code-taxonomy';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../data/widgets/line-chart';
import {
  issueHistoryToLineData,
  lineChartDataToSingleSeries,
  portfolioIssueHistoryToLineData,
  portfolioIssueHistoryToMultiLineSeries,
  portfolioMeasuresToLineData,
  projectMeasuresHistoryToLineChartData,
  relabelMultiLineSeriesWithRules,
  rulesFromGroupedLineChartSeries,
} from '../lineChartSeriesTransforms';

describe('customDashboardLineChart lineChartSeriesTransforms', () => {
  describe('portfolioMeasuresToLineData', () => {
    it('returns an empty array when there is no history', () => {
      expect(
        portfolioMeasuresToLineData(
          undefined,
          MetricKey.coverage,
          HistoryRange.All,
          MetricKey.coverage,
          undefined,
          {},
        ),
      ).toEqual([]);
      expect(
        portfolioMeasuresToLineData(
          [],
          MetricKey.coverage,
          HistoryRange.All,
          MetricKey.coverage,
          undefined,
          {},
        ),
      ).toEqual([]);
    });

    it('maps in-range measures to points and skips missing values', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
      const points = portfolioMeasuresToLineData(
        [
          {
            date: '2026-06-10',
            measures: [
              { metric: MetricKey.coverage, type: MetricType.Percent, value: '12.5' },
              { metric: MetricKey.violations, type: MetricType.Integer, value: '7' },
            ],
          },
          {
            date: '2026-06-09',
            measures: [{ metric: MetricKey.violations, type: MetricType.Integer, value: '1' }],
          },
        ],
        MetricKey.coverage,
        HistoryRange.Last3Months,
        MetricKey.coverage,
        MetricType.Percent,
        undefined,
      );
      expect(points).toHaveLength(1);
      expect(points[0]?.y).toBe(12.5);
      jest.useRealTimers();
    });

    it('uses parseMeasureValue when metric is data + numeric (impact JSON + severity filter)', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
      const impactJson = JSON.stringify({
        total: 5,
        BLOCKER: 0,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 0,
        INFO: 0,
      });
      const points = portfolioMeasuresToLineData(
        [
          {
            date: '2026-06-10',
            measures: [
              { metric: MetricKey.security_issues, type: MetricType.Data, value: impactJson },
            ],
          },
        ],
        MetricKey.security_issues,
        HistoryRange.Last3Months,
        MetricKey.security_issues,
        MetricType.Data,
        { impactSeverities: [SoftwareImpactSeverity.High] },
      );
      expect(points).toHaveLength(1);
      expect(points[0]?.y).toBe(3);
      jest.useRealTimers();
    });
  });

  describe('portfolioIssueHistoryToLineData', () => {
    it('returns no points for empty input', () => {
      expect(portfolioIssueHistoryToLineData(undefined, HistoryRange.All)).toEqual([]);
    });

    it('sums issue distribution for in-range days', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
      const points = portfolioIssueHistoryToLineData(
        [
          {
            date: '2026-06-01T00:00:00Z',
            distribution: [
              { key: 'a', value: 2 },
              { key: 'b', value: 3 },
            ],
          },
        ],
        HistoryRange.Last3Months,
      );
      expect(points).toEqual([{ x: new Date('2026-06-01T00:00:00Z'), y: 5 }]);
      jest.useRealTimers();
    });
  });

  describe('portfolioIssueHistoryToMultiLineSeries (grouped by rule)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-17T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('still produces series when the latest day reports zero counts for every rule', () => {
      const series = portfolioIssueHistoryToMultiLineSeries(
        [
          {
            date: '2026-06-17T00:00:00Z',
            distribution: [
              { key: 'java:S1128', value: 0 },
              { key: 'java:S1133', value: 0 },
            ],
          },
          {
            date: '2026-06-15T00:00:00Z',
            distribution: [
              { key: 'java:S1128', value: 5 },
              { key: 'java:S1133', value: 2 },
            ],
          },
        ],
        HistoryRange.LastMonth,
        LineChartGroupBy.Rule,
      );

      expect(series.map((entry) => entry.id)).toEqual(['java:S1128', 'java:S1133']);
      expect(series[0].data).toHaveLength(2);
      expect(
        series[0].data.find((p) => (p.x as Date).toISOString().startsWith('2026-06-15'))?.y,
      ).toBe(5);
      expect(
        series[0].data.find((p) => (p.x as Date).toISOString().startsWith('2026-06-17'))?.y,
      ).toBe(0);
    });

    it('includes a rule key that no longer appears on the latest day', () => {
      const series = portfolioIssueHistoryToMultiLineSeries(
        [
          {
            date: '2026-06-17T00:00:00Z',
            distribution: [{ key: 'java:S1128', value: 4 }],
          },
          {
            date: '2026-06-15T00:00:00Z',
            distribution: [
              { key: 'java:S1128', value: 5 },
              { key: 'java:S1133', value: 2 },
            ],
          },
        ],
        HistoryRange.LastMonth,
        LineChartGroupBy.Rule,
      );

      expect(series.map((entry) => entry.id)).toEqual(['java:S1128', 'java:S1133']);
      const s1133 = series.find((entry) => entry.id === 'java:S1133');
      expect(s1133?.data.find((p) => (p.x as Date).toISOString().startsWith('2026-06-17'))?.y).toBe(
        0,
      );
    });

    it('returns no series when every day in the window has zero counts', () => {
      const series = portfolioIssueHistoryToMultiLineSeries(
        [
          {
            date: '2026-06-17T00:00:00Z',
            distribution: [{ key: 'java:S1128', value: 0 }],
          },
          {
            date: '2026-06-15T00:00:00Z',
            distribution: [{ key: 'java:S1128', value: 0 }],
          },
        ],
        HistoryRange.LastMonth,
        LineChartGroupBy.Rule,
      );

      expect(series).toEqual([]);
    });
  });

  describe('projectMeasuresHistoryToLineChartData', () => {
    it('returns an empty array when history is missing', () => {
      expect(
        projectMeasuresHistoryToLineChartData(
          undefined,
          HistoryRange.All,
          MetricKey.bugs,
          undefined,
          undefined,
        ),
      ).toEqual([]);
    });

    it('maps the first measure history series', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
      const points = projectMeasuresHistoryToLineChartData(
        {
          measures: [
            {
              history: [
                { date: '2026-06-10', value: '9' },
                { date: '2010-01-01', value: '1' },
              ],
            },
          ],
        },
        HistoryRange.Last3Months,
        MetricKey.bugs,
        undefined,
        undefined,
      );
      expect(points).toHaveLength(1);
      expect(points[0]?.y).toBe(9);
      jest.useRealTimers();
    });

    it('uses parseMeasureValue when metric is data + numeric (impact JSON + severity filter)', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
      const impactJson = JSON.stringify({
        total: 5,
        BLOCKER: 0,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 0,
        INFO: 0,
      });
      const points = projectMeasuresHistoryToLineChartData(
        {
          measures: [
            {
              history: [{ date: '2026-06-10', value: impactJson }],
            },
          ],
        },
        HistoryRange.Last3Months,
        MetricKey.security_issues,
        MetricType.Data,
        { impactSeverities: [SoftwareImpactSeverity.High] },
      );
      expect(points).toHaveLength(1);
      expect(points[0]?.y).toBe(3);
      jest.useRealTimers();
    });
  });

  describe('issueHistoryToLineData', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns an empty array for undefined or empty input', () => {
      expect(issueHistoryToLineData(undefined, HistoryRange.All)).toEqual([]);
      expect(issueHistoryToLineData([], HistoryRange.All)).toEqual([]);
    });

    it('maps "all"-bucket values to line chart points within the history range', () => {
      const points = issueHistoryToLineData(
        [
          {
            date: '2026-06-10T00:00:00Z',
            distribution: [{ key: 'all', value: 7 }],
          },
          {
            date: '2026-05-10T00:00:00Z',
            distribution: [{ key: 'all', value: 3 }],
          },
        ],
        HistoryRange.Last3Months,
      );
      expect(points).toHaveLength(2);
      expect(points.find((p) => (p.x as Date).toISOString().startsWith('2026-06-10'))?.y).toBe(7);
      expect(points.find((p) => (p.x as Date).toISOString().startsWith('2026-05-10'))?.y).toBe(3);
    });

    it('skips days where the "all" bucket is absent', () => {
      const points = issueHistoryToLineData(
        [
          {
            date: '2026-06-10T00:00:00Z',
            distribution: [{ key: 'other', value: 5 }],
          },
          {
            date: '2026-06-09T00:00:00Z',
            distribution: [{ key: 'all', value: 2 }],
          },
        ],
        HistoryRange.Last3Months,
      );
      expect(points).toHaveLength(1);
      expect(points[0]?.y).toBe(2);
    });

    it('filters out dates outside the history range', () => {
      const points = issueHistoryToLineData(
        [
          {
            date: '2010-01-01T00:00:00Z',
            distribution: [{ key: 'all', value: 99 }],
          },
          {
            date: '2026-06-10T00:00:00Z',
            distribution: [{ key: 'all', value: 4 }],
          },
        ],
        HistoryRange.Last3Months,
      );
      expect(points).toHaveLength(1);
      expect(points[0]?.y).toBe(4);
    });
  });

  describe('lineChartDataToSingleSeries', () => {
    it('returns an empty array for empty data', () => {
      expect(lineChartDataToSingleSeries([], 'Bugs')).toEqual([]);
    });

    it('wraps data in a single series with the given label and default color', () => {
      const data = [{ x: new Date('2026-06-10'), y: 5 }];
      const series = lineChartDataToSingleSeries(data, 'Bugs');
      expect(series).toHaveLength(1);
      expect(series[0]).toMatchObject({ id: 'total', label: 'Bugs', data });
      expect(series[0]?.color).toBe(cssVar('color-charts-categorical-1'));
    });

    it('uses the provided color override', () => {
      const data = [{ x: new Date('2026-06-10'), y: 5 }];
      const color = cssVar('color-charts-categorical-1');
      const [series] = lineChartDataToSingleSeries(data, 'Bugs', color);
      expect(series?.color).toBe(color);
    });
  });

  describe('rulesFromGroupedLineChartSeries', () => {
    it('returns an empty array for empty input', () => {
      expect(rulesFromGroupedLineChartSeries([])).toEqual([]);
    });

    it('filters out series whose id starts with OTHER_', () => {
      const series = [
        { id: 'java:S1128', label: 'S1128', data: [], color: 'red' },
        { id: 'OTHER_RULES', label: 'Other', data: [], color: 'blue' },
      ];
      expect(rulesFromGroupedLineChartSeries(series)).toEqual(['java:S1128']);
    });

    it('returns all ids when none start with OTHER_', () => {
      const series = [
        { id: 'java:S1', label: 'S1', data: [], color: 'red' },
        { id: 'java:S2', label: 'S2', data: [], color: 'blue' },
      ];
      expect(rulesFromGroupedLineChartSeries(series)).toEqual(['java:S1', 'java:S2']);
    });
  });

  describe('relabelMultiLineSeriesWithRules', () => {
    it('returns an empty array when the series is empty', () => {
      expect(relabelMultiLineSeriesWithRules([], LineChartGroupBy.Rule, {})).toEqual([]);
    });

    it('returns the same reference when groupBy is None', () => {
      const inputSeries = [{ id: 'java:S1128', label: 'orig', data: [], color: 'red' }];
      expect(relabelMultiLineSeriesWithRules(inputSeries, LineChartGroupBy.None, {})).toBe(
        inputSeries,
      );
    });

    it('returns new series objects with updated labels when groupBy is Rule', () => {
      const inputSeries = [{ id: 'java:S1128', label: 'orig', data: [], color: 'red' }];
      const result = relabelMultiLineSeriesWithRules(inputSeries, LineChartGroupBy.Rule, {});
      expect(result).not.toBe(inputSeries);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('java:S1128');
      expect(result[0]?.data).toBe(inputSeries[0]?.data);
      expect(typeof result[0]?.label).toBe('string');
    });
  });
});
