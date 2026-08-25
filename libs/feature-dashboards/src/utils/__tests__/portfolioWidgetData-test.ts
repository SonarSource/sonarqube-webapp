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
import { Metric } from '~shared/types/measures';
import { MetricKey, MetricType } from '~shared/types/metrics';
import {
  IssueStatus,
  type MeasureFilters,
  PieChartHotspotFilter,
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  RichMetricKey,
} from '../../types/dashboard-widget';
import { ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE } from '../../types/organization-issue-count-history';
import { CodeScope } from '../../types/widget-common';
import { getThirtyDayTrendWindow } from '../datetime';
import {
  mapPieChartToIssueHistoryParams,
  supportsOrganizationPieChartIssueHistory,
} from '../organizationIssueCountHistory';
import { PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS } from '../organizationIssueCountHistoryUtils';
import { issueHistoryQueryExtras } from '../organizationIssueHistoryQuery';
import {
  organizationMeasuresToLineCountPieData,
  tryQualityGateDistributionMessageId,
} from '../organizationMeasures';
import {
  aggregatePortfolioComputedMeasures,
  getPortfolioRuleCountFromDistributionHistory,
  issueCountHistoryRuleToTrend,
  portfolioIssueCountHistoryLatestTotal,
  portfolioIssueCountHistoryToThirtyDayTrendValues,
  portfolioIssueHistoryToSparklineSeries,
  portfolioIssueHistoryToTrend,
  portfolioMeasuresHistoryLatestValue,
  portfolioMeasuresHistoryToSparklineSeries,
  portfolioMeasuresHistoryToTrend,
  resolveRichCountTrendMetricMetadata,
} from '../portfolioWidgetData';

let projectCounter = 0;

function makeProject(metricKey: string, value: string) {
  projectCounter += 1;
  return { branchId: `b-${projectCounter}`, measures: [{ name: metricKey, value }] };
}

function makeMetric(key: string, type: MetricType): Metric {
  return { key, name: key, type };
}

describe('portfolioIssueCountHistoryLatestTotal', () => {
  it('returns null when history is missing or empty', () => {
    expect(portfolioIssueCountHistoryLatestTotal(undefined)).toBeNull();
    expect(portfolioIssueCountHistoryLatestTotal([])).toBeNull();
  });

  it('returns sum of distribution for the latest day', () => {
    const days = [
      { date: '2025-01-01T00:00:00.000Z', distribution: [{ key: 'HIGH', value: 1 }] },
      {
        date: '2025-02-01T00:00:00.000Z',
        distribution: [
          { key: 'HIGH', value: 2 },
          { key: 'MEDIUM', value: 3 },
        ],
      },
    ];
    expect(portfolioIssueCountHistoryLatestTotal(days)).toBe(5);
  });
});

describe('portfolioIssueHistoryToTrend', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns nulls for empty input', () => {
    expect(portfolioIssueHistoryToTrend(undefined)).toEqual({ current: null, past: null });
    expect(portfolioIssueHistoryToTrend([])).toEqual({ current: null, past: null });
  });

  it('uses latest for current and latest older-than-30-days for past', () => {
    const days = [
      { date: '2026-01-10T00:00:00.000Z', distribution: [{ key: 'a', value: 1 }] }, // 1
      { date: '2026-02-20T00:00:00.000Z', distribution: [{ key: 'a', value: 4 }] }, // 4
      { date: '2026-03-20T00:00:00.000Z', distribution: [{ key: 'a', value: 7 }] }, // 7
    ];
    expect(portfolioIssueHistoryToTrend(days)).toEqual({ current: '7', past: '4' });
  });

  it('falls back to oldest when no point is older than 30 days', () => {
    const days = [
      { date: '2026-03-15T00:00:00.000Z', distribution: [{ key: 'a', value: 2 }] },
      { date: '2026-03-20T00:00:00.000Z', distribution: [{ key: 'a', value: 5 }] },
    ];
    expect(portfolioIssueHistoryToTrend(days)).toEqual({ current: '5', past: '2' });
  });
});

describe('portfolioIssueCountHistoryToThirtyDayTrendValues', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses the latest history point before the 30-day cutoff as past', () => {
    expect(
      portfolioIssueCountHistoryToThirtyDayTrendValues([
        {
          date: '2026-02-01T00:00:00.000Z',
          distribution: [{ key: 'java:S1', value: 8 }],
        },
        {
          date: '2026-03-29T00:00:00.000Z',
          distribution: [{ key: 'java:S1', value: 3 }],
        },
      ]),
    ).toEqual({ current: '3', past: '8' });
  });
});

describe('issueCountHistoryRuleToTrend', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns nulls for empty input', () => {
    expect(issueCountHistoryRuleToTrend(undefined, 'java:S1')).toEqual({
      current: null,
      past: null,
    });
    expect(issueCountHistoryRuleToTrend([], 'java:S1')).toEqual({
      current: null,
      past: null,
    });
  });

  it('tracks one rule key independently of other distribution keys', () => {
    const days = [
      {
        date: '2026-01-10T00:00:00.000Z',
        distribution: [
          { key: 'java:S1', value: 1 },
          { key: 'java:S2', value: 10 },
        ],
      },
      {
        date: '2026-02-20T00:00:00.000Z',
        distribution: [
          { key: 'java:S1', value: 4 },
          { key: 'java:S2', value: 20 },
        ],
      },
      {
        date: '2026-03-20T00:00:00.000Z',
        distribution: [
          { key: 'java:S1', value: 7 },
          { key: 'java:S2', value: 30 },
        ],
      },
    ];

    expect(issueCountHistoryRuleToTrend(days, 'java:S1')).toEqual({
      current: '7',
      past: '4',
    });
    expect(issueCountHistoryRuleToTrend(days, 'java:S2')).toEqual({
      current: '30',
      past: '20',
    });
  });

  it('treats missing rule keys as zero for a given day', () => {
    const days = [
      { date: '2026-03-15T00:00:00.000Z', distribution: [{ key: 'java:S1', value: 2 }] },
      { date: '2026-03-20T00:00:00.000Z', distribution: [] },
      { date: '2026-03-25T00:00:00.000Z', distribution: [{ key: 'java:S1', value: 5 }] },
    ];

    expect(issueCountHistoryRuleToTrend(days, 'java:S1')).toEqual({
      current: '5',
      past: '2',
    });
  });
});

describe('getThirtyDayTrendWindow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns an empty list when all timestamps are invalid', () => {
    const points = [
      { t: Number.NaN, value: 1 },
      { t: Number.NaN, value: 2 },
    ];

    expect(getThirtyDayTrendWindow(points, (p) => p.t)).toEqual([]);
  });

  it('keeps a single in-window point', () => {
    const points = [{ t: new Date('2026-03-29T00:00:00.000Z').getTime(), value: 42 }];

    expect(getThirtyDayTrendWindow(points, (p) => p.t)).toEqual(points);
  });
});

describe('portfolioIssueHistoryToSparklineSeries', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses the same selected 30-day comparison window as portfolioIssueHistoryToTrend', () => {
    const days = [
      { date: '2025-02-27T16:54:36+0000', distribution: [{ key: 'a', value: 15 }] },
      { date: '2026-03-30T16:48:07+0000', distribution: [{ key: 'a', value: 15 }] },
      { date: '2026-04-28T17:58:45+0000', distribution: [{ key: 'a', value: 15 }] },
    ];

    expect(portfolioIssueHistoryToTrend(days)).toEqual({ current: '15', past: '15' });
    expect(portfolioIssueHistoryToSparklineSeries(days)).toEqual([15, 15]);
  });
});

describe('portfolioMeasuresHistoryLatestValue', () => {
  it('returns undefined when there is no history or no matching metric', () => {
    expect(portfolioMeasuresHistoryLatestValue(undefined, MetricKey.coverage)).toBeUndefined();
    expect(portfolioMeasuresHistoryLatestValue([], MetricKey.coverage)).toBeUndefined();
    expect(
      portfolioMeasuresHistoryLatestValue(
        [
          {
            date: '2026-02-10',
            measures: [{ metric: MetricKey.bugs, type: MetricType.Integer, value: '3' }],
          },
        ],
        MetricKey.coverage,
      ),
    ).toBeUndefined();
  });

  it('returns the value from the latest day that includes the metric', () => {
    const history = [
      {
        date: '2026-01-10',
        measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '61' }],
      },
      {
        date: '2026-03-20',
        measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '83' }],
      },
    ];
    expect(portfolioMeasuresHistoryLatestValue(history, MetricKey.coverage)).toBe('83');
  });
});

describe('portfolioMeasuresHistoryToTrend', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns nulls for empty input and for missing metric points', () => {
    expect(portfolioMeasuresHistoryToTrend(undefined, MetricKey.coverage)).toEqual({
      current: null,
      past: null,
    });
    expect(
      portfolioMeasuresHistoryToTrend(
        [
          {
            date: '2026-02-10T00:00:00.000Z',
            measures: [{ metric: MetricKey.bugs, type: MetricType.Integer, value: '3' }],
          },
        ],
        MetricKey.coverage,
      ),
    ).toEqual({
      current: null,
      past: null,
    });
  });

  it('computes current and past using 30-day cut-off with fallback to oldest', () => {
    const history = [
      {
        date: '2026-01-10T00:00:00.000Z',
        measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '61' }],
      },
      {
        date: '2026-02-20T00:00:00.000Z',
        measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '72' }],
      },
      {
        date: '2026-03-20T00:00:00.000Z',
        measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '83' }],
      },
    ];
    expect(portfolioMeasuresHistoryToTrend(history, MetricKey.coverage)).toEqual({
      current: '83',
      past: '72',
    });

    const recentOnly = [
      {
        date: '2026-03-10T00:00:00.000Z',
        measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '44' }],
      },
      {
        date: '2026-03-20T00:00:00.000Z',
        measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '55' }],
      },
    ];
    expect(portfolioMeasuresHistoryToTrend(recentOnly, MetricKey.coverage)).toEqual({
      current: '55',
      past: '44',
    });
  });
});

describe('portfolioMeasuresHistoryToSparklineSeries', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses the same selected 30-day comparison window as portfolioMeasuresHistoryToTrend', () => {
    const history = [
      {
        date: '2025-02-27T16:54:36+0000',
        measures: [
          {
            metric: MetricKey.reliability_issues,
            type: MetricType.Data,
            value: '{"total":17,"HIGH":3,"MEDIUM":7,"LOW":1,"BLOCKER":6}',
          },
        ],
      },
      {
        date: '2026-03-30T16:48:07+0000',
        measures: [
          {
            metric: MetricKey.reliability_issues,
            type: MetricType.Data,
            value: '{"total":15,"HIGH":0,"MEDIUM":6,"LOW":1,"BLOCKER":8}',
          },
        ],
      },
      {
        date: '2026-04-28T17:58:45+0000',
        measures: [
          {
            metric: MetricKey.reliability_issues,
            type: MetricType.Data,
            value: '{"total":15,"HIGH":0,"MEDIUM":6,"LOW":1,"BLOCKER":8}',
          },
        ],
      },
    ];

    expect(portfolioMeasuresHistoryToTrend(history, MetricKey.reliability_issues)).toEqual({
      current: '{"total":15,"HIGH":0,"MEDIUM":6,"LOW":1,"BLOCKER":8}',
      past: '{"total":15,"HIGH":0,"MEDIUM":6,"LOW":1,"BLOCKER":8}',
    });
    expect(
      portfolioMeasuresHistoryToSparklineSeries(
        history,
        MetricKey.reliability_issues,
        MetricType.Data,
        undefined,
      ),
    ).toEqual([15, 15]);
  });
});

describe('organizationMeasuresToLineCountPieData', () => {
  it('parses language distribution from a JSON string', () => {
    expect(
      organizationMeasuresToLineCountPieData(
        {
          [MetricKey.ncloc_language_distribution]: '{"java": 90, "javascript": 10}',
        },
        PieChartLineSlice.Language,
        CodeScope.Overall,
      ),
    ).toEqual({
      counts: {
        java: 90,
        javascript: 10,
      },
    });
  });

  it('builds coverage counts from raw uncovered lines when available', () => {
    expect(
      organizationMeasuresToLineCountPieData(
        {
          [MetricKey.lines_to_cover]: '120',
          [MetricKey.uncovered_lines]: '20',
        },
        PieChartLineSlice.Coverage,
        CodeScope.Overall,
      ),
    ).toEqual({
      counts: {
        covered: 100,
        uncovered: 20,
      },
    });
  });

  it('falls back to coverage percentage when uncovered lines are absent', () => {
    expect(
      organizationMeasuresToLineCountPieData(
        {
          [MetricKey.lines_to_cover]: '80',
          [MetricKey.coverage]: '62.5',
        },
        PieChartLineSlice.Coverage,
        CodeScope.Overall,
      ),
    ).toEqual({
      counts: {
        covered: 50,
        uncovered: 30,
      },
    });
  });

  it('uses new-code coverage metrics when the widget scope is new', () => {
    expect(
      organizationMeasuresToLineCountPieData(
        {
          [MetricKey.new_lines_to_cover]: '80',
          [MetricKey.new_uncovered_lines]: '20',
        },
        PieChartLineSlice.Coverage,
        CodeScope.New,
      ),
    ).toEqual({
      counts: {
        covered: 60,
        uncovered: 20,
      },
    });
  });

  it('uses new-code duplication metrics when the widget scope is new', () => {
    expect(
      organizationMeasuresToLineCountPieData(
        {
          [MetricKey.new_lines]: '40',
          [MetricKey.new_duplicated_lines_density]: '25',
        },
        PieChartLineSlice.Duplications,
        CodeScope.New,
      ),
    ).toEqual({
      counts: {
        duplicated: 10,
        'non-duplicated': 30,
      },
    });
  });

  it('falls back to new ncloc when physical new lines are unavailable', () => {
    expect(
      organizationMeasuresToLineCountPieData(
        {
          [MetricKey.new_ncloc]: '40',
          [MetricKey.new_duplicated_lines_density]: '25',
        },
        PieChartLineSlice.Duplications,
        CodeScope.New,
      ),
    ).toEqual({
      counts: {
        duplicated: 10,
        'non-duplicated': 30,
      },
    });
  });
});

describe('supportsOrganizationPieChartIssueHistory', () => {
  it('returns false for slices not backed by issue-count-history', () => {
    expect(
      supportsOrganizationPieChartIssueHistory(
        PieChartMetric.IssueCount,
        PieChartIssueSlice.CleanCodeAttributeCategories,
      ),
    ).toBe(false);
    expect(
      supportsOrganizationPieChartIssueHistory(
        PieChartMetric.IssueCount,
        PieChartIssueSlice.Languages,
      ),
    ).toBe(false);
  });

  it('returns true for supported issue and hotspot slices', () => {
    expect(
      supportsOrganizationPieChartIssueHistory(
        PieChartMetric.IssueCount,
        PieChartIssueSlice.ImpactSeverities,
      ),
    ).toBe(true);
    expect(
      supportsOrganizationPieChartIssueHistory(
        PieChartMetric.HotspotCount,
        PieChartHotspotSlice.ReviewPriority,
      ),
    ).toBe(true);
  });

  it('maps hotspot security category to rule keys for portfolio org history', () => {
    expect(
      supportsOrganizationPieChartIssueHistory(
        PieChartMetric.HotspotCount,
        PieChartHotspotSlice.SecurityCategory,
      ),
    ).toBe(true);
  });
});

describe('mapPieChartToIssueHistoryParams', () => {
  it('supports project branch entities', () => {
    const params = mapPieChartToIssueHistoryParams({
      entityId: 'branch-uuid',
      entityType: 'PROJECT_BRANCH',
      filter: '',
      metric: PieChartMetric.IssueCount,
      slice: PieChartIssueSlice.ImpactSeverities,
    });
    expect(params).toMatchObject({
      entityId: 'branch-uuid',
      entityType: 'PROJECT_BRANCH',
      sliceBy: 'SEVERITY',
    });
  });

  it('requests default software-quality impacts for issue pie with no filter', () => {
    const params = mapPieChartToIssueHistoryParams({
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      filter: '',
      metric: PieChartMetric.IssueCount,
      slice: PieChartIssueSlice.ImpactSeverities,
    });
    expect(params).toMatchObject({
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      impacts: [...PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS],
      sliceBy: 'SEVERITY',
      statuses: ['OPEN'],
    });
    expect(params).not.toHaveProperty('startDate');
    expect(params).not.toHaveProperty('endDate');
  });

  it('requests hotspot type for hotspot pie', () => {
    const params = mapPieChartToIssueHistoryParams({
      filter: '',
      metric: PieChartMetric.HotspotCount,
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      slice: PieChartHotspotSlice.ReviewStatus,
    });
    expect(params).toMatchObject({
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      issueTypes: ['SECURITY_HOTSPOT'],
      sliceBy: 'STATUS',
    });
    expect(params?.impacts).toBeUndefined();
  });

  it('maps hotspot review priority to severity slice for portfolio history', () => {
    const params = mapPieChartToIssueHistoryParams({
      filter: '',
      metric: PieChartMetric.HotspotCount,
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      slice: PieChartHotspotSlice.ReviewPriority,
    });
    expect(params).toMatchObject({
      issueTypes: ['SECURITY_HOTSPOT'],
      sliceBy: 'SEVERITY',
    });
  });

  it('maps hotspot pie filter to review statuses for portfolio history', () => {
    const params = mapPieChartToIssueHistoryParams({
      filter: PieChartHotspotFilter.ToReview,
      metric: PieChartMetric.HotspotCount,
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      slice: PieChartHotspotSlice.ReviewPriority,
    });
    expect(params).toMatchObject({
      issueTypes: ['SECURITY_HOTSPOT'],
      sliceBy: 'SEVERITY',
      statuses: ['TO_REVIEW'],
    });
  });

  it('maps hotspot security category selection to rule key slice for portfolio history', () => {
    const params = mapPieChartToIssueHistoryParams({
      filter: '',
      metric: PieChartMetric.HotspotCount,
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      slice: PieChartHotspotSlice.SecurityCategory,
    });
    expect(params).toMatchObject({
      issueTypes: ['SECURITY_HOTSPOT'],
      sliceBy: 'RULE_KEY',
    });
  });

  it('requests all code issue statuses when slicing by issue status', () => {
    const params = mapPieChartToIssueHistoryParams({
      filter: '',
      metric: PieChartMetric.IssueCount,
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      slice: PieChartIssueSlice.IssueStatuses,
    });
    expect(params).toMatchObject({
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      impacts: [...PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS],
      sliceBy: 'STATUS',
      statuses: [...ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE],
    });
  });

  it('maps issue filters to software-quality impacts and rejects unsupported issue/hotspot slices', () => {
    const securityParams = mapPieChartToIssueHistoryParams({
      filter: PieChartIssueFilter.Security,
      metric: PieChartMetric.IssueCount,
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      slice: PieChartIssueSlice.IssueStatuses,
    });
    expect(securityParams).toMatchObject({
      sliceBy: 'STATUS',
      statuses: [...ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE],
      impacts: [
        'SECURITY:BLOCKER',
        'SECURITY:HIGH',
        'SECURITY:MEDIUM',
        'SECURITY:LOW',
        'SECURITY:INFO',
      ],
    });

    const reliabilityParams = mapPieChartToIssueHistoryParams({
      filter: PieChartIssueFilter.Reliability,
      metric: PieChartMetric.IssueCount,
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      slice: PieChartIssueSlice.ImpactSeverities,
    });
    expect(reliabilityParams).toMatchObject({
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      sliceBy: 'SEVERITY',
      statuses: ['OPEN'],
      impacts: [
        'RELIABILITY:BLOCKER',
        'RELIABILITY:HIGH',
        'RELIABILITY:MEDIUM',
        'RELIABILITY:LOW',
        'RELIABILITY:INFO',
      ],
    });

    const unsupportedIssueSlice = mapPieChartToIssueHistoryParams({
      filter: '',
      metric: PieChartMetric.IssueCount,
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      slice: PieChartIssueSlice.Languages,
    });
    expect(unsupportedIssueSlice).toBeNull();

    const unsupportedHotspotSlice = mapPieChartToIssueHistoryParams({
      filter: '',
      metric: PieChartMetric.HotspotCount,
      entityId: 'p1',
      entityType: 'PORTFOLIO',
      slice: PieChartIssueSlice.ImpactSeverities,
    });
    expect(unsupportedHotspotSlice).toBeNull();
  });
});

describe('issueHistoryQueryExtras', () => {
  it('maps filters to query extras and forces hotspot type for hotspot rich metric', () => {
    expect(
      issueHistoryQueryExtras({
        impactSeverities: [SoftwareImpactSeverity.High],
        impactSoftwareQuality: SoftwareQuality.Security,
        issueStatus: undefined,
      }),
    ).toEqual({
      impacts: ['SECURITY:HIGH'],
      statuses: ['OPEN'],
    });

    expect(
      issueHistoryQueryExtras({
        impactSeverities: [SoftwareImpactSeverity.Blocker],
        impactSoftwareQuality: SoftwareQuality.Maintainability,
        issueStatus: undefined,
      }),
    ).toEqual({
      impacts: ['MAINTAINABILITY:BLOCKER'],
      statuses: ['OPEN'],
    });

    expect(
      issueHistoryQueryExtras({
        impactSoftwareQuality: SoftwareQuality.Reliability,
        issueStatus: undefined,
      }),
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
      issueHistoryQueryExtras({
        impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Medium],
        issueStatus: undefined,
      }),
    ).toEqual({
      impacts: [
        'SECURITY:HIGH',
        'SECURITY:MEDIUM',
        'RELIABILITY:HIGH',
        'RELIABILITY:MEDIUM',
        'MAINTAINABILITY:HIGH',
        'MAINTAINABILITY:MEDIUM',
      ],
      statuses: ['OPEN'],
    });

    const malformedFilters = {
      // Deliberately malformed value to verify CSV parsing fallback to impacts.
      impactSoftwareQuality: 'SECURITY,RELIABILITY',
    } as unknown as MeasureFilters;

    const malformedExtras = issueHistoryQueryExtras(malformedFilters);
    expect(malformedExtras.impacts).toEqual(
      expect.arrayContaining(['SECURITY:BLOCKER', 'RELIABILITY:INFO']),
    );

    expect(
      issueHistoryQueryExtras({ issueStatus: IssueStatus.Open }, RichMetricKey.Hotspots),
    ).toEqual({
      issueTypes: ['SECURITY_HOTSPOT'],
      statuses: ['OPEN'],
    });

    expect(issueHistoryQueryExtras(undefined)).toEqual({
      impacts: [...PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS],
      statuses: ['OPEN'],
    });

    expect(
      issueHistoryQueryExtras({ issueStatus: IssueStatus.Open }, RichMetricKey.Issues),
    ).toEqual({
      impacts: [...PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS],
      statuses: ['OPEN'],
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
  });
});

describe('tryQualityGateDistributionMessageId', () => {
  it('maps releasability distribution keys to metric.level message ids', () => {
    expect(tryQualityGateDistributionMessageId('ERROR')).toBe('metric.level.ERROR');
    expect(tryQualityGateDistributionMessageId('OK')).toBe('metric.level.OK');
    expect(tryQualityGateDistributionMessageId('NONE')).toBe('metric.level.NONE');
  });

  it('returns undefined for unknown slice keys', () => {
    expect(tryQualityGateDistributionMessageId('UNKNOWN')).toBeUndefined();
    expect(tryQualityGateDistributionMessageId('NOT_COMPUTED')).toBeUndefined();
  });
});

describe('aggregatePortfolioComputedMeasures', () => {
  describe('alert_status (quality gate)', () => {
    it('returns worst quality gate: ERROR wins over OK', () => {
      const projects = [
        makeProject(MetricKey.alert_status, 'OK'),
        makeProject(MetricKey.alert_status, 'ERROR'),
        makeProject(MetricKey.alert_status, 'OK'),
      ];
      expect(aggregatePortfolioComputedMeasures(projects, MetricKey.alert_status, undefined)).toBe(
        'ERROR',
      );
    });

    it('returns OK when all projects pass', () => {
      const projects = [
        makeProject(MetricKey.alert_status, 'OK'),
        makeProject(MetricKey.alert_status, 'OK'),
      ];
      expect(aggregatePortfolioComputedMeasures(projects, MetricKey.alert_status, undefined)).toBe(
        'OK',
      );
    });

    it('returns undefined when no projects have data', () => {
      expect(
        aggregatePortfolioComputedMeasures([], MetricKey.alert_status, undefined),
      ).toBeUndefined();
    });

    it('ignores unrecognised quality gate values', () => {
      const projects = [
        makeProject(MetricKey.alert_status, 'UNKNOWN_STATUS'),
        makeProject(MetricKey.alert_status, 'OK'),
      ];
      expect(aggregatePortfolioComputedMeasures(projects, MetricKey.alert_status, undefined)).toBe(
        'OK',
      );
    });

    it('prefers NONE over OK when aggregating quality gate status', () => {
      const projects = [
        makeProject(MetricKey.alert_status, 'OK'),
        makeProject(MetricKey.alert_status, 'NONE'),
      ];
      expect(aggregatePortfolioComputedMeasures(projects, MetricKey.alert_status, undefined)).toBe(
        'NONE',
      );
    });

    it('prefers NOT_COMPUTED over OK', () => {
      const projects = [
        makeProject(MetricKey.alert_status, 'OK'),
        makeProject(MetricKey.alert_status, 'NOT_COMPUTED'),
      ];
      expect(aggregatePortfolioComputedMeasures(projects, MetricKey.alert_status, undefined)).toBe(
        'NOT_COMPUTED',
      );
    });

    it('returns undefined when no recognised quality gate values exist', () => {
      const projects = [makeProject(MetricKey.alert_status, 'UNKNOWN')];
      expect(
        aggregatePortfolioComputedMeasures(projects, MetricKey.alert_status, undefined),
      ).toBeUndefined();
    });
  });

  describe('integer metrics (sum)', () => {
    it('sums ncloc across projects', () => {
      const projects = [
        makeProject(MetricKey.ncloc, '10000'),
        makeProject(MetricKey.ncloc, '5000'),
        makeProject(MetricKey.ncloc, '3000'),
      ];
      expect(
        aggregatePortfolioComputedMeasures(
          projects,
          MetricKey.ncloc,
          makeMetric(MetricKey.ncloc, MetricType.Integer),
        ),
      ).toBe('18000');
    });

    it('returns undefined when all values are empty', () => {
      const projects = [{ branchId: 'b1', measures: [] }];
      expect(
        aggregatePortfolioComputedMeasures(
          projects,
          MetricKey.ncloc,
          makeMetric(MetricKey.ncloc, MetricType.Integer),
        ),
      ).toBeUndefined();
    });

    it('returns undefined when integer values are not parseable', () => {
      const projects = [
        makeProject(MetricKey.ncloc, 'not-a-number'),
        makeProject(MetricKey.ncloc, 'also-bad'),
      ];
      expect(
        aggregatePortfolioComputedMeasures(
          projects,
          MetricKey.ncloc,
          makeMetric(MetricKey.ncloc, MetricType.Integer),
        ),
      ).toBeUndefined();
    });
  });

  describe('data metrics (sum)', () => {
    it('sums data-typed measures like integers', () => {
      const projects = [
        makeProject(MetricKey.duplicated_lines, '10'),
        makeProject(MetricKey.duplicated_lines, '5'),
      ];
      expect(
        aggregatePortfolioComputedMeasures(
          projects,
          MetricKey.duplicated_lines,
          makeMetric(MetricKey.duplicated_lines, MetricType.Data),
        ),
      ).toBe('15');
    });
  });

  describe('rating metrics (worst)', () => {
    it('returns worst rating (highest numeric value)', () => {
      const projects = [
        makeProject(MetricKey.security_rating, '1'), // A
        makeProject(MetricKey.security_rating, '3'), // C
        makeProject(MetricKey.security_rating, '2'), // B
      ];
      expect(
        aggregatePortfolioComputedMeasures(
          projects,
          MetricKey.security_rating,
          makeMetric(MetricKey.security_rating, MetricType.Rating),
        ),
      ).toBe('3');
    });
  });

  describe('percent metrics (mean)', () => {
    it('returns undefined when percent values are not numeric', () => {
      const projects = [
        makeProject(MetricKey.coverage, 'n/a'),
        makeProject(MetricKey.coverage, 'x'),
      ];
      expect(
        aggregatePortfolioComputedMeasures(
          projects,
          MetricKey.coverage,
          makeMetric(MetricKey.coverage, MetricType.Percent),
        ),
      ).toBeUndefined();
    });

    it('averages coverage across projects', () => {
      const projects = [
        makeProject(MetricKey.coverage, '80'),
        makeProject(MetricKey.coverage, '60'),
      ];
      expect(
        aggregatePortfolioComputedMeasures(
          projects,
          MetricKey.coverage,
          makeMetric(MetricKey.coverage, MetricType.Percent),
        ),
      ).toBe('70');
    });

    it('excludes projects with missing values from average', () => {
      const projects = [
        makeProject(MetricKey.coverage, '80'),
        { branchId: 'b2', measures: [] }, // no coverage
      ];
      expect(
        aggregatePortfolioComputedMeasures(
          projects,
          MetricKey.coverage,
          makeMetric(MetricKey.coverage, MetricType.Percent),
        ),
      ).toBe('80');
    });
  });

  describe('empty input', () => {
    it('returns undefined for empty project list', () => {
      expect(
        aggregatePortfolioComputedMeasures(
          [],
          MetricKey.coverage,
          makeMetric(MetricKey.coverage, MetricType.Percent),
        ),
      ).toBeUndefined();
    });
  });

  describe('fallback aggregation', () => {
    it('returns the first raw value when the metric is not handled by a specific reducer', () => {
      const projects = [
        makeProject(MetricKey.accepted_issues, '7'),
        makeProject(MetricKey.accepted_issues, '9'),
      ];
      expect(
        aggregatePortfolioComputedMeasures(projects, MetricKey.accepted_issues, undefined),
      ).toBe('7');
    });
  });

  describe('resolveRichCountTrendMetricMetadata', () => {
    it('returns integer metric with direction -1 for issue count keys', () => {
      expect(resolveRichCountTrendMetricMetadata(MetricKey.security_hotspots)).toEqual({
        direction: -1,
        key: MetricKey.security_hotspots,
        name: MetricKey.security_hotspots,
        type: MetricType.Integer,
      });
      expect(resolveRichCountTrendMetricMetadata(MetricKey.violations)).toEqual({
        direction: -1,
        key: MetricKey.violations,
        name: MetricKey.violations,
        type: MetricType.Integer,
      });
    });
  });
});

describe('getPortfolioRuleCountFromDistributionHistory', () => {
  const history = [
    {
      date: '2026-01-01T00:00:00Z',
      distribution: [
        { key: 'java:S1128', value: 3 },
        { key: 'java:S1133', value: 7 },
      ],
    },
    {
      date: '2026-03-01T00:00:00Z',
      distribution: [
        { key: 'java:S1128', value: 5 },
        { key: 'java:S1133', value: 2 },
      ],
    },
  ];

  it('returns 0 for undefined history', () => {
    expect(getPortfolioRuleCountFromDistributionHistory(undefined, 'java:S1128')).toBe(0);
  });

  it('returns 0 for an empty history array', () => {
    expect(getPortfolioRuleCountFromDistributionHistory([], 'java:S1128')).toBe(0);
  });

  it('returns the count for the given rule key from the latest day', () => {
    expect(getPortfolioRuleCountFromDistributionHistory(history, 'java:S1128')).toBe(5);
    expect(getPortfolioRuleCountFromDistributionHistory(history, 'java:S1133')).toBe(2);
  });

  it('returns 0 when the rule key is absent from the latest day', () => {
    expect(getPortfolioRuleCountFromDistributionHistory(history, 'java:S9999')).toBe(0);
  });
});
