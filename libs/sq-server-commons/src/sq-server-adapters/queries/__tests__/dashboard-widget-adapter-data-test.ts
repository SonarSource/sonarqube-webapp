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

import { renderHook } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey, MetricType } from '~shared/types/metrics';
import {
  CodeScope,
  DashboardMetricType,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  RichMetricKey,
} from '../../../helpers/dashboard-widget-data';
import { DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE } from '../../../helpers/unsupported-dashboard-widget-adapter';
import { useIssuesSearchQuery } from '../../../queries/issues';
import { useOrganizationPieChartData } from '../pie-chart-widget-data';
import { usePortfolioProjectIssueCountsQuery } from '../portfolio-project-breakdown-data';
import {
  usePortfolioRatingBadgeComputedMeasuresQuery,
  usePortfolioRatingBadgeMeasuresQuery,
  usePortfolioRatingBadgeMetricKeysQuery,
} from '../portfolio-rating-badge-widget-data';
import { usePortfolioTopListData } from '../portfolio-top-list-widget-data';
import { usePortfolioRulesMetadataOrganization } from '../portfolio-widget-organization-data';
import {
  projectPieChartUsesSearchData,
  useProjectPieChartSegmentsSearchQuery,
} from '../project-pie-chart-widget-data';
import { useProjectTopListData } from '../project-top-list-widget-data';
import { useWidgetMetricMetadataQuery } from '../widget-metric-metadata';

const mockUseDashboardIssueCountHistoryQuery = jest.fn();
const mockUseDashboardIssueDensityHistoryQuery = jest.fn();
const mockUseDashboardIssueResolutionHistoryQuery = jest.fn();
const mockUseDashboardScaResolutionHistoryQuery = jest.fn();
const mockUseDashboardMeasuresHistoryQuery = jest.fn();
const mockUseDashboardProjectIssueCountsQuery = jest.fn();
const mockUseDashboardProjectMeasuresQuery = jest.fn<unknown[], unknown[]>();
const mockUseStandardExperienceModeQuery = jest.fn();
const mockUseComponent = jest.fn();
const mockUseCurrentBranchQuery = jest.fn();
const mockUseLanguagesQuery = jest.fn();
const mockUseDashboardRuleLabels = jest.fn();
const mockUseWidgetMetricMetadataQuery = jest.fn();
const mockUseIssuesSearchQuery = jest.mocked(useIssuesSearchQuery);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock('../../../queries/dashboard-history', () => ({
  useDashboardIssueCountHistoryQuery: (...args: unknown[]) =>
    mockUseDashboardIssueCountHistoryQuery(...args),
  useDashboardIssueDensityHistoryQuery: (...args: unknown[]) =>
    mockUseDashboardIssueDensityHistoryQuery(...args),
  useDashboardIssueResolutionHistoryQuery: (...args: unknown[]) =>
    mockUseDashboardIssueResolutionHistoryQuery(...args),
  useDashboardScaResolutionHistoryQuery: (...args: unknown[]) =>
    mockUseDashboardScaResolutionHistoryQuery(...args),
  useDashboardMeasuresHistoryQuery: (...args: unknown[]) =>
    mockUseDashboardMeasuresHistoryQuery(...args),
  useDashboardProjectIssueCountsQuery: (...args: unknown[]) =>
    mockUseDashboardProjectIssueCountsQuery(...args),
  useDashboardProjectMeasuresQuery: (...args: unknown[]) =>
    mockUseDashboardProjectMeasuresQuery(...args),
}));

jest.mock('../../../queries/mode', () => ({
  useStandardExperienceModeQuery: (...args: unknown[]) =>
    mockUseStandardExperienceModeQuery(...args),
}));

jest.mock('../../../queries/issues', () => ({
  useIssuesSearchQuery: jest.fn(),
}));

jest.mock('../../../context/componentContext/withComponentContext', () => ({
  useComponent: (...args: unknown[]) => mockUseComponent(...args),
}));

jest.mock('../branch', () => ({
  useCurrentBranchQuery: (...args: unknown[]) => mockUseCurrentBranchQuery(...args),
}));

jest.mock('~shared/queries/languages', () => ({
  useLanguagesQuery: (...args: unknown[]) => mockUseLanguagesQuery(...args),
}));

jest.mock('../widget-rule-metadata', () => ({
  useDashboardRuleLabels: (...args: unknown[]) => mockUseDashboardRuleLabels(...args),
}));

jest.mock('../widget-metric-metadata', () => ({
  ...jest.requireActual('../widget-metric-metadata'),
  useWidgetMetricMetadataQuery: (...args: unknown[]) => mockUseWidgetMetricMetadataQuery(...args),
}));

function queryResult(data: unknown, extra: Record<string, unknown> = {}) {
  return {
    data,
    error: null,
    isError: false,
    isPending: false,
    ...extra,
  };
}

function setupMocks() {
  mockUseDashboardIssueCountHistoryQuery.mockReturnValue(queryResult(undefined));
  mockUseDashboardIssueDensityHistoryQuery.mockReturnValue(queryResult(undefined));
  mockUseDashboardIssueResolutionHistoryQuery.mockReturnValue(queryResult(undefined));
  mockUseDashboardScaResolutionHistoryQuery.mockReturnValue(queryResult(undefined));
  mockUseDashboardMeasuresHistoryQuery.mockReturnValue(queryResult(undefined));
  mockUseDashboardProjectIssueCountsQuery.mockReturnValue(queryResult(undefined));
  mockUseDashboardProjectMeasuresQuery.mockReturnValue([]);
  mockUseStandardExperienceModeQuery.mockReturnValue(queryResult(true));
  mockUseComponent.mockReturnValue({ component: { key: 'component-key' } });
  mockUseCurrentBranchQuery.mockReturnValue(queryResult(undefined));
  mockUseLanguagesQuery.mockReturnValue(queryResult({ java: { name: 'Java' } }));
  mockUseIssuesSearchQuery.mockReturnValue(queryResult(undefined));
  mockUseDashboardRuleLabels.mockReturnValue({
    isError: false,
    isPending: false,
    organization: undefined,
    rulesByKey: {},
  });
  mockUseWidgetMetricMetadataQuery.mockReturnValue(
    queryResult({
      [MetricKey.coverage]: { key: MetricKey.coverage, type: MetricType.Percent },
    }),
  );
}

function selectFrom(call: unknown[]): (value: unknown) => unknown {
  return (call[1] as { select: (value: unknown) => unknown }).select;
}

describe('dashboard widget adapter queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  describe('pie-chart queries', () => {
    it.each(['PROJECT_BRANCH', 'PORTFOLIO'] as const)(
      'uses the latest available %s snapshot without requiring data today',
      (entityType) => {
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        yesterday.setUTCHours(0, 0, 0, 0);
        const older = new Date(yesterday);
        older.setUTCDate(older.getUTCDate() - 1);
        const issueHistory = [
          { date: yesterday.toISOString(), distribution: [{ key: 'CRITICAL', value: 3 }] },
          { date: older.toISOString(), distribution: [{ key: 'CRITICAL', value: 99 }] },
        ];
        const measuresHistory = [
          {
            date: yesterday.toISOString(),
            measures: [
              {
                metric: MetricKey.ncloc_language_distribution,
                type: MetricType.Distribution,
                value: 'java=12',
              },
            ],
          },
          {
            date: older.toISOString(),
            measures: [
              {
                metric: MetricKey.ncloc_language_distribution,
                type: MetricType.Distribution,
                value: 'java=99',
              },
            ],
          },
        ];
        mockUseDashboardIssueCountHistoryQuery.mockImplementation((params, options) =>
          queryResult(
            options.select({
              issueCountHistory: issueHistory.filter((day) => day.date >= params.startDate),
            }),
          ),
        );
        mockUseDashboardMeasuresHistoryQuery.mockImplementation((params, options) =>
          queryResult(
            options.select({
              measuresHistory: measuresHistory.filter((day) => day.date >= params.startDate),
            }),
          ),
        );
        const { result } = renderHook(
          () =>
            useOrganizationPieChartData({
              entity: { entityId: 'entity-1', entityType },
              widget: {
                filter: '',
                metric: PieChartMetric.IssueCount,
                scope: CodeScope.Overall,
                slice: PieChartIssueSlice.ImpactSeverities,
              },
            }),
          { wrapper: getContextWrapper() },
        );
        expect(result.current.segments.map(({ count }) => count)).toEqual([3]);
        const { result: lines } = renderHook(
          () =>
            useOrganizationPieChartData({
              entity: { entityId: 'entity-1', entityType },
              widget: {
                filter: '',
                metric: PieChartMetric.LineCount,
                scope: CodeScope.Overall,
                slice: PieChartLineSlice.Language,
              },
            }),
          { wrapper: getContextWrapper() },
        );
        expect(lines.current.segments).toEqual([
          expect.objectContaining({ label: 'Java', count: 12 }),
        ]);
      },
    );

    it.each(['{"1":4,"4":1}', '1=4;4=1', 'A=4;D=1'])(
      'keeps the last available portfolio quality-gate distribution (%s)',
      (distribution) => {
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        yesterday.setUTCHours(0, 0, 0, 0);
        mockUseWidgetMetricMetadataQuery.mockReturnValue(
          queryResult({
            [MetricKey.releasability_rating_distribution]: {
              key: MetricKey.releasability_rating_distribution,
              type: MetricType.Distribution,
            },
          }),
        );
        mockUseDashboardMeasuresHistoryQuery.mockImplementation((params, options) =>
          queryResult(
            options.select({
              measuresHistory: [
                {
                  date: yesterday.toISOString(),
                  measures: [
                    {
                      metric: MetricKey.releasability_rating_distribution,
                      type: MetricType.Distribution,
                      value: distribution,
                    },
                  ],
                },
              ].filter((day) => day.date >= params.startDate),
            }),
          ),
        );
        const { result } = renderHook(
          () =>
            useOrganizationPieChartData({
              entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
              widget: {
                filter: '',
                metric: PieChartMetric.ProjectCount,
                scope: CodeScope.Overall,
                slice: 'status',
              },
            }),
          { wrapper: getContextWrapper() },
        );
        expect(result.current.segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ value: 'OK', count: 4 }),
            expect.objectContaining({ value: 'ERROR', count: 1 }),
          ]),
        );
      },
    );

    it.each([false, true])(
      'does not revive old counts when the latest issue snapshot is empty (no history: %s)',
      (noHistory) => {
        mockUseDashboardIssueCountHistoryQuery.mockImplementation((_params, options) =>
          queryResult(
            options.select({
              issueCountHistory: noHistory
                ? []
                : [
                    { date: '2026-09-09', distribution: [] },
                    { date: '2026-09-08', distribution: [{ key: 'CRITICAL', value: 99 }] },
                  ],
            }),
          ),
        );
        const { result } = renderHook(
          () =>
            useOrganizationPieChartData({
              entity: { entityId: 'entity-1', entityType: 'PORTFOLIO' },
              widget: {
                filter: '',
                metric: PieChartMetric.IssueCount,
                scope: CodeScope.Overall,
                slice: PieChartIssueSlice.ImpactSeverities,
              },
            }),
          { wrapper: getContextWrapper() },
        );
        expect(result.current.segments).toEqual([]);
        expect(result.current.isPending).toBe(false);
        expect(result.current.error).toBeNull();
      },
    );
    it('uses issue search to group portfolio security issues by language', () => {
      mockUseIssuesSearchQuery.mockReturnValue(
        queryResult({
          counts: { java: 4, ts: 2 },
        }),
      );

      const { result } = renderHook(
        () =>
          useOrganizationPieChartData({
            entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
            widget: {
              filter: 'security',
              metric: PieChartMetric.IssueCount,
              scope: CodeScope.Overall,
              slice: PieChartIssueSlice.Languages,
            },
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseIssuesSearchQuery).toHaveBeenCalledWith(
        {
          componentKeys: 'component-key',
          facets: PieChartIssueSlice.Languages,
          impactSoftwareQualities: 'SECURITY',
          issueStatuses: 'OPEN,CONFIRMED',
          ps: 1,
          sinceLeakPeriod: false,
        },
        expect.objectContaining({ enabled: true }),
      );
      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false }),
      );
      const searchOptions = mockUseIssuesSearchQuery.mock.calls[0]?.[1] as {
        select: (response: unknown) => unknown;
      };
      expect(
        searchOptions.select({
          facets: [
            {
              property: PieChartIssueSlice.Languages,
              values: [
                { count: 4, val: 'java' },
                { count: 0, val: 'xml' },
                { count: 2, val: 'ts' },
              ],
            },
          ],
        }),
      ).toEqual({ counts: { java: 4, ts: 2 } });
      expect(result.current.isPending).toBe(false);
      expect(result.current.segments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ count: 4, label: 'Java', value: 'java' }),
          expect.objectContaining({ count: 2, value: 'ts' }),
        ]),
      );
    });

    it('surfaces language metadata failures for language-sliced line-count charts', () => {
      const metadataError = new Error('language metadata failed');
      mockUseLanguagesQuery.mockReturnValue(
        queryResult(undefined, { error: metadataError, isError: true }),
      );

      const { result } = renderHook(
        () =>
          useOrganizationPieChartData({
            entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
            widget: {
              filter: '',
              metric: PieChartMetric.LineCount,
              scope: CodeScope.Overall,
              slice: PieChartLineSlice.Language,
            },
          }),
        { wrapper: getContextWrapper() },
      );

      expect(result.current.error).toBe(metadataError);
    });

    it('does not request issue history without an entity ID', () => {
      renderHook(
        () =>
          useOrganizationPieChartData({
            entity: { entityId: '', entityType: 'PORTFOLIO' },
            widget: {
              filter: '',
              metric: PieChartMetric.IssueCount,
              scope: CodeScope.Overall,
              slice: PieChartIssueSlice.ImpactSeverities,
            },
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false }),
      );
    });

    it.each([
      [CodeScope.Overall, PieChartHotspotSlice.SecurityCategory],
      [CodeScope.Overall, PieChartHotspotSlice.ReviewStatus],
      [CodeScope.New, PieChartHotspotSlice.ReviewStatus],
    ])('keeps hotspot %s/%s pie charts unsupported', (scope, slice) => {
      expect(() =>
        renderHook(
          () =>
            useOrganizationPieChartData({
              entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
              widget: {
                filter: '',
                metric: PieChartMetric.HotspotCount,
                scope,
                slice,
              },
            }),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false }),
      );
    });

    it('rejects unsupported metrics without requesting issue history', () => {
      expect(() =>
        renderHook(
          () =>
            useOrganizationPieChartData({
              entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
              widget: {
                filter: '',
                metric: 'unsupported',
                scope: CodeScope.Overall,
                slice: 'unsupported',
              },
            }),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false }),
      );
    });

    it('requests the Server releasability distribution for the quality-gate donut', () => {
      mockUseWidgetMetricMetadataQuery.mockReturnValue(
        queryResult({
          [MetricKey.releasability_rating_distribution]: {
            key: MetricKey.releasability_rating_distribution,
            type: MetricType.Distribution,
          },
        }),
      );

      renderHook(
        () =>
          useOrganizationPieChartData({
            entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
            widget: {
              filter: '',
              metric: PieChartMetric.ProjectCount,
              scope: CodeScope.Overall,
              slice: 'status',
            },
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({
          entityId: 'portfolio-1',
          entityType: 'PORTFOLIO',
          metricKeys: [MetricKey.releasability_rating_distribution],
        }),
        expect.objectContaining({ enabled: true }),
      );
    });

    it.each([
      [true, { issueTypes: ['VULNERABILITY'] }],
      [false, { impacts: expect.arrayContaining(['SECURITY:HIGH']) }],
    ])('resolves semantic pie-chart filters for the current mode', (isStandardMode, expected) => {
      mockUseStandardExperienceModeQuery.mockReturnValue(queryResult(isStandardMode));

      renderHook(
        () =>
          useOrganizationPieChartData({
            entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
            widget: {
              filter: 'security',
              metric: PieChartMetric.IssueCount,
              scope: CodeScope.Overall,
              slice: PieChartIssueSlice.ImpactSeverities,
            },
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining(expected),
        expect.objectContaining({ enabled: true }),
      );
    });

    it.each([
      [
        PieChartIssueSlice.ImpactSoftwareQualities,
        'TYPE',
        'VULNERABILITY',
        SoftwareQuality.Security,
      ],
      [PieChartIssueSlice.ImpactSeverities, 'SEVERITY', 'CRITICAL', SoftwareImpactSeverity.High],
    ])(
      'reads canonical %s pie segments from the Standard %s dimension',
      (slice, expectedSliceBy, responseKey, canonicalKey) => {
        renderHook(
          () =>
            useOrganizationPieChartData({
              entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
              widget: {
                filter: '',
                metric: PieChartMetric.IssueCount,
                scope: CodeScope.Overall,
                slice,
              },
            }),
          { wrapper: getContextWrapper() },
        );

        const queryCall = mockUseDashboardIssueCountHistoryQuery.mock.calls[0];
        expect(queryCall[0]).toEqual(expect.objectContaining({ sliceBy: expectedSliceBy }));
        expect(
          selectFrom(queryCall)({
            issueCountHistory: [
              { date: '2026-03-20', distribution: [{ key: responseKey, value: 2 }] },
            ],
          }),
        ).toEqual({ counts: { [canonicalKey]: 2 } });
      },
    );

    it('surfaces experience-mode errors without reporting pending', () => {
      const modeError = new Error('mode request failed');
      mockUseStandardExperienceModeQuery.mockReturnValue(
        queryResult(undefined, { error: modeError }),
      );
      // A disabled TanStack query that never fetched reports isPending: true forever.
      mockUseDashboardIssueCountHistoryQuery.mockReturnValue(
        queryResult(undefined, { isPending: true }),
      );

      const { result } = renderHook(
        () =>
          useOrganizationPieChartData({
            entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
            widget: {
              filter: '',
              metric: PieChartMetric.IssueCount,
              scope: CodeScope.Overall,
              slice: PieChartIssueSlice.ImpactSeverities,
            },
          }),
        { wrapper: getContextWrapper() },
      );

      expect(result.current.error).toBe(modeError);
      expect(result.current.isPending).toBe(false);
    });

    it('fails New-code issue pie data through the shared adapter error', () => {
      expect(() =>
        renderHook(
          () =>
            useOrganizationPieChartData({
              entity: { entityId: 'project-1', entityType: 'PROJECT_BRANCH' },
              widget: {
                filter: '',
                metric: PieChartMetric.IssueCount,
                scope: CodeScope.New,
                slice: PieChartIssueSlice.ImpactSeverities,
              },
            }),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
    });

    it('keeps New-code issue language pie data unsupported', () => {
      expect(() =>
        renderHook(
          () =>
            useOrganizationPieChartData({
              entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
              widget: {
                filter: '',
                metric: PieChartMetric.IssueCount,
                scope: CodeScope.New,
                slice: PieChartIssueSlice.Languages,
              },
            }),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
    });

    it('uses issue-search project data for slices unsupported by issue history', () => {
      expect(
        projectPieChartUsesSearchData({
          filter: '',
          metric: PieChartMetric.LineCount,
          scope: CodeScope.Overall,
          slice: PieChartLineSlice.Language,
        }),
      ).toBe(false);
      expect(
        projectPieChartUsesSearchData({
          filter: '',
          metric: PieChartMetric.ProjectCount,
          scope: CodeScope.Overall,
          slice: 'status',
        }),
      ).toBe(true);
    });

    it('fails through the shared adapter error for unsupported slices', () => {
      expect(() =>
        renderHook(
          () =>
            useProjectPieChartSegmentsSearchQuery(
              {
                filter: '',
                metric: PieChartMetric.IssueCount,
                scope: CodeScope.Overall,
                slice: PieChartIssueSlice.CleanCodeAttributeCategories,
              },
              'project-key',
            ),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
      expect(mockUseCurrentBranchQuery).toHaveBeenCalledWith(undefined);
    });

    it('does not request a quality-gate distribution missing from Server metadata', () => {
      mockUseWidgetMetricMetadataQuery.mockReturnValue(queryResult({}));

      const { result } = renderHook(
        () =>
          useOrganizationPieChartData({
            entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
            widget: {
              filter: '',
              metric: PieChartMetric.ProjectCount,
              scope: CodeScope.Overall,
              slice: 'status',
            },
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          metricKeys: [MetricKey.releasability_rating_distribution],
        }),
        expect.objectContaining({ enabled: false }),
      );
      expect(result.current.isPending).toBe(false);
    });

    it('surfaces metric metadata failures for quality-gate pie charts', () => {
      const metadataError = new Error('metadata failed');
      mockUseWidgetMetricMetadataQuery.mockReturnValue(
        queryResult(undefined, { error: metadataError, isError: true }),
      );

      const { result } = renderHook(
        () =>
          useOrganizationPieChartData({
            entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
            widget: {
              filter: '',
              metric: PieChartMetric.ProjectCount,
              scope: CodeScope.Overall,
              slice: 'status',
            },
          }),
        { wrapper: getContextWrapper() },
      );

      expect(result.current.error).toBe(metadataError);
    });
  });

  describe('portfolio and project wrappers', () => {
    it('translates canonical project issue filters at the Standard Experience boundary', () => {
      renderHook(() =>
        usePortfolioProjectIssueCountsQuery({
          entityType: 'PORTFOLIO',
          impacts: ['SECURITY:HIGH'],
          pageIndex: 1,
          pageSize: 20,
          portfolioId: 'portfolio-1',
          requireIssues: true,
          severities: [SoftwareImpactSeverity.High],
          statuses: ['OPEN'],
        }),
      );

      expect(mockUseDashboardProjectIssueCountsQuery).toHaveBeenCalledWith(
        {
          entityId: 'portfolio-1',
          entityType: 'PORTFOLIO',
          issueTypes: ['VULNERABILITY'],
          pageIndex: 1,
          pageSize: 20,
          requireIssues: true,
          severities: ['CRITICAL'],
          sort: undefined,
          statuses: ['OPEN'],
        },
        { enabled: true },
      );
    });

    it('preserves canonical project issue filters in MQR mode', () => {
      mockUseStandardExperienceModeQuery.mockReturnValue(queryResult(false));

      renderHook(() =>
        usePortfolioProjectIssueCountsQuery({
          entityType: 'PORTFOLIO',
          impacts: ['RELIABILITY:MEDIUM'],
          pageIndex: 1,
          pageSize: 20,
          portfolioId: 'portfolio-1',
          requireIssues: true,
          severities: [SoftwareImpactSeverity.Medium],
        }),
      );

      expect(mockUseDashboardProjectIssueCountsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          impacts: ['RELIABILITY:MEDIUM'],
          severities: [SoftwareImpactSeverity.Medium],
        }),
        { enabled: true },
      );
    });

    it('does not send a redundant severity filter for all canonical impacts', () => {
      renderHook(() =>
        usePortfolioProjectIssueCountsQuery({
          entityType: 'PORTFOLIO',
          impacts: Object.values(SoftwareQuality).flatMap((quality) =>
            Object.values(SoftwareImpactSeverity).map((severity) => `${quality}:${severity}`),
          ),
          pageIndex: 1,
          pageSize: 20,
          portfolioId: 'portfolio-1',
          requireIssues: true,
        }),
      );

      expect(mockUseDashboardProjectIssueCountsQuery).toHaveBeenCalledWith(
        expect.not.objectContaining({ severities: expect.anything() }),
        { enabled: true },
      );
    });

    it('surfaces mode resolution errors without leaving the project query pending', () => {
      const modeError = new Error('mode failed');
      mockUseStandardExperienceModeQuery.mockReturnValue(
        queryResult(undefined, { error: modeError, isError: true }),
      );
      mockUseDashboardProjectIssueCountsQuery.mockReturnValue(
        queryResult(undefined, { isPending: true }),
      );

      const { result } = renderHook(() =>
        usePortfolioProjectIssueCountsQuery({
          entityType: 'PORTFOLIO',
          pageIndex: 1,
          pageSize: 20,
          portfolioId: 'portfolio-1',
          requireIssues: true,
        }),
      );

      expect(result.current).toEqual(
        expect.objectContaining({ error: modeError, isError: true, isPending: false }),
      );
      expect(mockUseDashboardProjectIssueCountsQuery).toHaveBeenCalledWith(expect.anything(), {
        enabled: false,
      });
    });

    it('uses the latest portfolio measure history record and computed project measures', () => {
      mockUseDashboardMeasuresHistoryQuery.mockReturnValue(
        queryResult({ [MetricKey.reliability_rating]: 'A' }),
      );

      const { result } = renderHook(
        () =>
          usePortfolioRatingBadgeMeasuresQuery('portfolio-1', {
            metricKeys: [MetricKey.reliability_rating, MetricKey.reliability_rating_distribution],
          }),
        {
          wrapper: getContextWrapper(),
        },
      );
      expect(result.current.data).toEqual({ [MetricKey.reliability_rating]: 'A' });
      expect(result.current.isPending).toBe(false);
      expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          metricKeys: [MetricKey.reliability_rating, MetricKey.reliability_rating_distribution],
        }),
        expect.anything(),
      );

      mockUseDashboardProjectMeasuresQuery.mockReturnValue([
        queryResult({
          projectMeasures: [
            {
              branchId: 'branch-1',
              measure: { currentValue: '80', metric: MetricKey.coverage },
            },
          ],
        }),
      ]);
      const computed = renderHook(
        () =>
          usePortfolioRatingBadgeComputedMeasuresQuery({
            metrics: [MetricKey.coverage],
            portfolioId: 'portfolio-1',
          }),
        { wrapper: getContextWrapper() },
      );
      expect(computed.result.current.data).toEqual({
        projects: [{ measures: [{ name: MetricKey.coverage, value: '80' }] }],
      });
      expect(mockUseDashboardProjectMeasuresQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: 'portfolio-1',
          entityType: 'PORTFOLIO',
        }),
        expect.anything(),
      );
    });

    it('requests only the supplied metrics and adapts Server history to shared badge values', () => {
      renderHook(
        () =>
          usePortfolioRatingBadgeMeasuresQuery('portfolio-1', {
            metricKeys: [
              MetricKey.releasability_rating,
              MetricKey.releasability_rating_distribution,
            ],
          }),
        {
          wrapper: getContextWrapper(),
        },
      );

      expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          metricKeys: [MetricKey.releasability_rating, MetricKey.releasability_rating_distribution],
        }),
        expect.anything(),
      );

      expect(
        selectFrom(mockUseDashboardMeasuresHistoryQuery.mock.calls[0])({
          measuresHistory: [
            {
              date: '2026-03-20',
              measures: [
                {
                  metric: MetricKey.releasability_rating,
                  type: MetricType.Rating,
                  value: '1.0',
                },
                {
                  metric: MetricKey.releasability_rating_distribution,
                  type: MetricType.Distribution,
                  value: '{"1":"4","5":"2"}',
                },
              ],
            },
          ],
        }),
      ).toEqual(
        expect.objectContaining({
          [MetricKey.releasability_rating]: 'A',
          [MetricKey.releasability_rating_distribution]: { A: 4, E: 2 },
          [MetricKey.releasability_status_distribution]: { ERROR: 2, OK: 4 },
        }),
      );
    });

    it.each([
      [true, MetricKey.sqale_rating, MetricKey.maintainability_rating_distribution],
      [
        false,
        MetricKey.software_quality_maintainability_rating,
        MetricKey.software_quality_maintainability_rating_distribution,
      ],
    ])(
      'resolves maintainability metrics for the current mode',
      (isStandardMode, expectedRatingMetric, expectedDistributionMetric) => {
        mockUseStandardExperienceModeQuery.mockReturnValue(queryResult(isStandardMode));
        const { result } = renderHook(
          () =>
            usePortfolioRatingBadgeMetricKeysQuery([
              MetricKey.maintainability_rating,
              MetricKey.maintainability_rating_distribution,
            ]),
          { wrapper: getContextWrapper() },
        );

        expect(result.current).toEqual({
          error: null,
          isPending: false,
          metricKeys: [expectedRatingMetric, expectedDistributionMetric],
        });
      },
    );

    it('resolves the shared releasability distribution key to the Server history metric', () => {
      const { result } = renderHook(
        () =>
          usePortfolioRatingBadgeMetricKeysQuery([
            MetricKey.releasability_rating,
            MetricKey.releasability_status_distribution,
          ]),
        { wrapper: getContextWrapper() },
      );

      expect(result.current.metricKeys).toEqual([
        MetricKey.releasability_rating,
        MetricKey.releasability_rating_distribution,
      ]);
    });

    it('exposes mode resolution errors to rating widgets', () => {
      const modeError = new Error('mode request failed');
      mockUseStandardExperienceModeQuery.mockReturnValue(
        queryResult(undefined, { error: modeError }),
      );

      const { result } = renderHook(
        () => usePortfolioRatingBadgeMetricKeysQuery([MetricKey.maintainability_rating]),
        { wrapper: getContextWrapper() },
      );

      expect(result.current.error).toBe(modeError);
    });

    it('combines top-list counts, trends and rule metadata for both entity types', () => {
      mockUseDashboardIssueCountHistoryQuery.mockReturnValue(queryResult({ 'java:S1': 4 }));
      mockUseDashboardRuleLabels.mockReturnValue({
        isError: false,
        isPending: false,
        organization: 'org-1',
        rulesByKey: { 'java:S1': { name: 'Rule 1' } },
      });

      const widget = {
        limit: 5,
        metric: {
          measureFilters: {
            impactSeverities: [SoftwareImpactSeverity.High],
            impactSoftwareQuality: SoftwareQuality.Security,
          },
          type: DashboardMetricType.Rich,
          metricKey: RichMetricKey.Issues,
        },
      };
      const portfolio = renderHook(
        () => usePortfolioTopListData(widget, 'portfolio-1', { fetchTrendHistory: false }),
        { wrapper: getContextWrapper() },
      );
      expect(portfolio.result.current.counts).toEqual({ 'java:S1': 4 });
      expect(portfolio.result.current.rulesByKey).toEqual({ 'java:S1': { name: 'Rule 1' } });

      const project = renderHook(
        () => useProjectTopListData(widget, 'branch-1', 'org-1', { fetchTrendHistory: false }),
        { wrapper: getContextWrapper() },
      );
      expect(project.result.current.rulesByKey).toEqual({ 'java:S1': { name: 'Rule 1' } });
      expect(mockUseDashboardRuleLabels).toHaveBeenCalled();
      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          issueTypes: ['VULNERABILITY'],
          severities: ['CRITICAL'],
          sliceBy: 'RULE_KEY',
        }),
        expect.objectContaining({ enabled: true }),
      );
    });
  });

  describe('metadata queries', () => {
    it('passes the expected enablement and transforms metric metadata', () => {
      const { result } = renderHook(() => useWidgetMetricMetadataQuery(), {
        wrapper: getContextWrapper(),
      });
      expect(result.current.data).toEqual({
        [MetricKey.coverage]: { key: MetricKey.coverage, type: MetricType.Percent },
      });
      expect(mockUseWidgetMetricMetadataQuery).toHaveBeenCalledWith();

      expect(usePortfolioRulesMetadataOrganization('portfolio-1')).toEqual({
        isLoading: false,
        organization: undefined,
      });
    });
  });
});
