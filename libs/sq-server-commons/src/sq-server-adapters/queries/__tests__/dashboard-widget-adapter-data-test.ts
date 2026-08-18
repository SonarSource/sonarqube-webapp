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
import { MetricKey, MetricType } from '~shared/types/metrics';
import {
  CodeScope,
  DashboardMetricType,
  LineChartGroupBy,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  RichMetricKey,
  type DashboardMetric,
} from '../../helpers/dashboard-widget-data';
import { DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE } from '../../helpers/unsupported-dashboard-widget-adapter';
import { useOrgIssueCountWidgetData, useOrgMeasuresCountWidgetData } from '../count-widget-data';
import {
  organizationLineChartRequestKey,
  useOrganizationLineChartSeriesData,
} from '../line-chart-widget-data';
import { useOrganizationPieChartData } from '../pie-chart-widget-data';
import {
  usePortfolioRatingBadgeComputedMeasuresQuery,
  usePortfolioRatingBadgeMeasuresQuery,
} from '../portfolio-rating-badge-widget-data';
import { usePortfolioTopListData } from '../portfolio-top-list-widget-data';
import { usePortfolioRulesMetadataOrganization } from '../portfolio-widget-organization-data';
import {
  projectPieChartUsesLegacyIssueData,
  useProjectPieChartSegmentsLegacyQuery,
} from '../project-pie-chart-widget-data';
import { useProjectTopListData } from '../project-top-list-widget-data';
import { useTopListIssueCountData } from '../top-list-issue-count-data';
import { useWidgetMetricMetadataQuery } from '../widget-metric-metadata';

const mockUseDashboardIssueCountHistoryQuery = jest.fn();
const mockUseDashboardMeasuresHistoryQuery = jest.fn();
const mockUseDashboardProjectMeasuresQueries = jest.fn();
const mockUseComponent = jest.fn();
const mockUseCurrentBranchQuery = jest.fn();
const mockUseLanguagesQuery = jest.fn();
const mockUseDashboardRuleLabels = jest.fn();
const mockUseSonarSourceSecurityCategoriesQuery = jest.fn();
const mockUseWidgetMetricMetadataQuery = jest.fn();

jest.mock('../../../queries/dashboard-history', () => ({
  useDashboardIssueCountHistoryQuery: (...args: unknown[]) =>
    mockUseDashboardIssueCountHistoryQuery(...args),
  useDashboardMeasuresHistoryQuery: (...args: unknown[]) =>
    mockUseDashboardMeasuresHistoryQuery(...args),
  useDashboardProjectMeasuresQueries: (...args: unknown[]) =>
    mockUseDashboardProjectMeasuresQueries(...args),
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

jest.mock('../security-standards', () => ({
  useSonarSourceSecurityCategoriesQuery: (...args: unknown[]) =>
    mockUseSonarSourceSecurityCategoriesQuery(...args),
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
  mockUseDashboardMeasuresHistoryQuery.mockReturnValue(queryResult(undefined));
  mockUseDashboardProjectMeasuresQueries.mockReturnValue([]);
  mockUseComponent.mockReturnValue({ component: 'component-key' });
  mockUseCurrentBranchQuery.mockReturnValue(queryResult(undefined));
  mockUseLanguagesQuery.mockReturnValue(queryResult({ java: { name: 'Java' } }));
  mockUseDashboardRuleLabels.mockReturnValue({
    isError: false,
    isPending: false,
    organization: undefined,
    rulesByKey: {},
  });
  mockUseSonarSourceSecurityCategoriesQuery.mockReturnValue(
    queryResult({ 'sql-injection': { title: 'SQL Injection' } }),
  );
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

  describe('count and line-chart queries', () => {
    it('does not enable history queries for unsupported hotspot widgets', () => {
      expect(() =>
        renderHook(
          () =>
            useOrgIssueCountWidgetData({
              entityId: 'portfolio-1',
              entityType: 'PORTFOLIO',
              measureFilters: undefined,
              resolvedIssueMetricKey: MetricKey.security_hotspots,
              richMetricKey: RichMetricKey.Hotspots,
            }),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false }),
      );

      expect(() =>
        renderHook(
          () =>
            useOrgMeasuresCountWidgetData({
              entityId: 'portfolio-1',
              entityType: 'PORTFOLIO',
              metricKeyForRequest: MetricKey.security_hotspots,
              metricType: MetricType.Integer,
            }),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
      expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false }),
      );

      expect(() =>
        renderHook(
          () =>
            useTopListIssueCountData(
              {
                limit: 5,
                metric: { type: DashboardMetricType.Rich, metricKey: RichMetricKey.Hotspots },
              },
              'portfolio-1',
              'PORTFOLIO',
              { fetchTrendHistory: false },
            ),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false }),
      );
    });

    it('configures count queries and transforms issue and measure history', () => {
      const issueHistory = {
        issueCountHistory: [
          {
            date: '2026-03-20',
            distribution: [{ key: 'BUG', value: 4 }],
          },
        ],
      };
      const measuresHistory = {
        measuresHistory: [
          {
            date: '2026-03-20',
            measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '80' }],
          },
        ],
      };

      renderHook(
        () =>
          useOrgIssueCountWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            measureFilters: undefined,
            resolvedIssueMetricKey: MetricKey.violations,
            richMetricKey: RichMetricKey.Issues,
          }),
        { wrapper: getContextWrapper() },
      );
      renderHook(
        () =>
          useOrgMeasuresCountWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            metricKeyForRequest: MetricKey.coverage,
            metricType: MetricType.Percent,
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({ entityId: 'portfolio-1', entityType: 'PORTFOLIO' }),
        expect.objectContaining({ enabled: true }),
      );
      expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({ metricKeys: [MetricKey.coverage] }),
        expect.objectContaining({ enabled: true }),
      );
      expect(
        selectFrom(mockUseDashboardIssueCountHistoryQuery.mock.calls[0])(issueHistory),
      ).toEqual({
        historicalValues: { current: '4', past: '4' },
        latestTotal: 4,
        sparklineSeries: [4],
      });
      expect(
        selectFrom(mockUseDashboardMeasuresHistoryQuery.mock.calls[0])(measuresHistory),
      ).toEqual({
        latestValue: '80',
        sparklineSeries: [80],
        trend: { current: '80', past: '80' },
      });
    });

    it('selects the measure or issue history path for line charts', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
      const rawMetric: DashboardMetric = {
        type: DashboardMetricType.Raw,
        metricKey: MetricKey.coverage,
      };
      const richMetric: DashboardMetric = {
        type: DashboardMetricType.Rich,
        metricKey: RichMetricKey.Issues,
      };
      expect(organizationLineChartRequestKey(rawMetric, CodeScope.New, MetricKey.coverage)).toBe(
        MetricKey.new_coverage,
      );
      expect(
        organizationLineChartRequestKey(richMetric, CodeScope.Overall, MetricKey.violations),
      ).toBe(MetricKey.violations);

      mockUseDashboardMeasuresHistoryQuery.mockReturnValueOnce(
        queryResult({
          measuresHistory: [
            {
              date: '2026-03-20',
              measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '80' }],
            },
          ],
        }),
      );
      renderHook(
        () =>
          useOrganizationLineChartSeriesData({
            actualMetricKey: MetricKey.coverage,
            entityId: 'project-1',
            entityType: 'PROJECT_BRANCH',
            groupBy: LineChartGroupBy.None,
            historyRange: '3',
            measureFilters: undefined,
            measuresHistoryKey: MetricKey.coverage,
            metric: rawMetric,
            metricName: 'Coverage',
            metricType: MetricType.Percent,
          }),
        { wrapper: getContextWrapper() },
      );
      expect(
        selectFrom(mockUseDashboardMeasuresHistoryQuery.mock.calls[0])({
          measuresHistory: [
            {
              date: '2026-03-20',
              measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '80' }],
            },
          ],
        }),
      ).toEqual([expect.objectContaining({ id: 'total', label: 'Coverage' })]);

      mockUseDashboardIssueCountHistoryQuery.mockReturnValueOnce(
        queryResult({
          issueCountHistory: [{ date: '2026-03-20', distribution: [{ key: 'BUG', value: 2 }] }],
        }),
      );
      renderHook(
        () =>
          useOrganizationLineChartSeriesData({
            actualMetricKey: MetricKey.violations,
            entityId: 'project-1',
            entityType: 'PROJECT_BRANCH',
            groupBy: LineChartGroupBy.None,
            historyRange: '3',
            measureFilters: undefined,
            measuresHistoryKey: MetricKey.violations,
            metric: richMetric,
            metricName: 'Issues',
            metricType: MetricType.Integer,
          }),
        { wrapper: getContextWrapper() },
      );
      expect(
        selectFrom(mockUseDashboardIssueCountHistoryQuery.mock.calls[1])({
          issueCountHistory: [{ date: '2026-03-20', distribution: [{ key: 'BUG', value: 2 }] }],
        }),
      ).toEqual([expect.objectContaining({ id: 'total', label: 'Issues' })]);
      jest.useRealTimers();
    });

    it('does not request measure history for a synthetic metric missing from Server metadata', () => {
      mockUseWidgetMetricMetadataQuery.mockReturnValue(queryResult({}));

      const { result } = renderHook(
        () =>
          useOrganizationLineChartSeriesData({
            actualMetricKey: MetricKey.releasability_rating,
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            groupBy: LineChartGroupBy.None,
            historyRange: '3',
            measureFilters: undefined,
            measuresHistoryKey: MetricKey.releasability_rating,
            metric: {
              metricKey: MetricKey.releasability_rating,
              type: DashboardMetricType.Raw,
            },
            metricName: 'Releasability rating',
            metricType: MetricType.Rating,
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false }),
      );
      expect(result.current.isMeasuresHistoryPending).toBe(false);
    });

    it('surfaces metric metadata failures for measure line charts', () => {
      mockUseWidgetMetricMetadataQuery.mockReturnValue(
        queryResult(undefined, { error: new Error('metadata failed'), isError: true }),
      );

      const { result } = renderHook(
        () =>
          useOrganizationLineChartSeriesData({
            actualMetricKey: MetricKey.coverage,
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            groupBy: LineChartGroupBy.None,
            historyRange: '3',
            measureFilters: undefined,
            measuresHistoryKey: MetricKey.coverage,
            metric: { metricKey: MetricKey.coverage, type: DashboardMetricType.Raw },
            metricName: 'Coverage',
            metricType: MetricType.Percent,
          }),
        { wrapper: getContextWrapper() },
      );

      expect(result.current.lineChartHasFetchError).toBe(true);
    });
  });

  describe('pie-chart queries', () => {
    it('fails deprecated hotspot pie data through the shared adapter error', () => {
      expect(() =>
        renderHook(
          () =>
            useOrganizationPieChartData({
              entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
              widget: {
                filter: '',
                metric: PieChartMetric.HotspotCount,
                scope: CodeScope.Overall,
                slice: PieChartHotspotSlice.SecurityCategory,
              },
            }),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
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

    it('fails the legacy project pie adapter through the shared adapter error', () => {
      expect(() =>
        renderHook(
          () =>
            useProjectPieChartSegmentsLegacyQuery(
              {
                filter: '',
                metric: PieChartMetric.IssueCount,
                scope: CodeScope.Overall,
                slice: PieChartIssueSlice.Languages,
              },
              'project-1',
            ),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
    });

    it('keeps legacy project data for unsupported and security-category slices', () => {
      expect(
        projectPieChartUsesLegacyIssueData({
          filter: '',
          metric: PieChartMetric.LineCount,
          scope: CodeScope.Overall,
          slice: PieChartLineSlice.Language,
        }),
      ).toBe(false);
      expect(
        projectPieChartUsesLegacyIssueData({
          filter: '',
          metric: PieChartMetric.HotspotCount,
          scope: CodeScope.Overall,
          slice: PieChartHotspotSlice.SecurityCategory,
        }),
      ).toBe(false);
      expect(
        projectPieChartUsesLegacyIssueData({
          filter: '',
          metric: PieChartMetric.ProjectCount,
          scope: CodeScope.Overall,
          slice: 'status',
        }),
      ).toBe(true);
    });

    it('does not request a virtual quality-gate distribution missing from Server metadata', () => {
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
          metricKeys: [MetricKey.releasability_status_distribution],
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
    it('uses the latest portfolio measure history record and computed project measures', () => {
      mockUseWidgetMetricMetadataQuery.mockReturnValue(
        queryResult({
          [MetricKey.releasability_rating]: {
            key: MetricKey.releasability_rating,
            type: MetricType.Rating,
          },
          [MetricKey.reliability_rating]: {
            key: MetricKey.reliability_rating,
            type: MetricType.Rating,
          },
          [MetricKey.reliability_rating_distribution]: {
            key: MetricKey.reliability_rating_distribution,
            type: MetricType.Data,
          },
          [MetricKey.ncloc_language_distribution]: {
            key: MetricKey.ncloc_language_distribution,
            type: MetricType.Data,
          },
        }),
      );
      mockUseDashboardMeasuresHistoryQuery.mockReturnValue(
        queryResult({ [MetricKey.reliability_rating]: 'A' }),
      );

      const { result } = renderHook(() => usePortfolioRatingBadgeMeasuresQuery('portfolio-1'), {
        wrapper: getContextWrapper(),
      });
      expect(result.current.data).toEqual({ [MetricKey.reliability_rating]: 'A' });
      expect(result.current.isError).toBe(false);
      expect(result.current.isPending).toBe(false);
      expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          metricKeys: [MetricKey.reliability_rating, MetricKey.reliability_rating_distribution],
        }),
        expect.anything(),
      );

      mockUseDashboardProjectMeasuresQueries.mockReturnValue([
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
    });

    it('surfaces metric metadata failures for portfolio rating badges', () => {
      mockUseWidgetMetricMetadataQuery.mockReturnValue(
        queryResult(undefined, { error: new Error('metadata failed'), isError: true }),
      );

      const { result } = renderHook(() => usePortfolioRatingBadgeMeasuresQuery('portfolio-1'), {
        wrapper: getContextWrapper(),
      });

      expect(result.current.isError).toBe(true);
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
        metric: { type: DashboardMetricType.Rich, metricKey: RichMetricKey.Issues },
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
