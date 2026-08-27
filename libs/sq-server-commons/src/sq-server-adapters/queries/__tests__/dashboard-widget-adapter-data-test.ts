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
  LineChartGroupBy,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  RichMetricKey,
  lineChartSinceDate,
  organizationsHistoryStartDateWithRetentionBuffer,
  type DashboardMetric,
} from '../../../helpers/dashboard-widget-data';
import { DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE } from '../../../helpers/unsupported-dashboard-widget-adapter';
import { useOrgIssueCountWidgetData, useOrgMeasuresCountWidgetData } from '../count-widget-data';
import {
  useOrgIssueDensityCountWidgetData,
  useOrgIssueDensityLineChartWidgetData,
} from '../issue-density-widget-data';
import {
  useOrgIssueResolutionCountWidgetData,
  useOrgIssueResolutionLineChartWidgetData,
} from '../issue-resolution-widget-data';
import {
  organizationLineChartRequestKey,
  useOrganizationLineChartSeriesData,
} from '../line-chart-widget-data';
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
  projectPieChartUsesLegacyIssueData,
  useProjectPieChartSegmentsLegacyQuery,
} from '../project-pie-chart-widget-data';
import { useProjectTopListData } from '../project-top-list-widget-data';
import {
  useOrgScaResolutionCountWidgetData,
  useOrgScaResolutionLineChartWidgetData,
} from '../sca-resolution-widget-data';
import { useTopListIssueCountData } from '../top-list-issue-count-data';
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
  mockUseComponent.mockReturnValue({ component: 'component-key' });
  mockUseCurrentBranchQuery.mockReturnValue(queryResult(undefined));
  mockUseLanguagesQuery.mockReturnValue(queryResult({ java: { name: 'Java' } }));
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

    it('translates canonical Cloud count inputs only at the Standard data boundary', () => {
      renderHook(
        () =>
          useOrgIssueCountWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            measureFilters: {
              impactSeverities: [SoftwareImpactSeverity.High],
              impactSoftwareQuality: SoftwareQuality.Security,
            },
            resolvedIssueMetricKey: MetricKey.violations,
            richMetricKey: RichMetricKey.Issues,
          }),
        { wrapper: getContextWrapper() },
      );

      const [queryParams, queryOptions] = mockUseDashboardIssueCountHistoryQuery.mock.calls[0];
      expect(queryParams).toEqual(
        expect.objectContaining({
          issueTypes: ['VULNERABILITY'],
          severities: ['CRITICAL'],
        }),
      );
      expect(queryParams).not.toHaveProperty('impacts');
      expect(queryOptions).toEqual(expect.objectContaining({ enabled: true }));
    });

    it('resolves Cloud measure keys to their MQR data source', () => {
      mockUseStandardExperienceModeQuery.mockReturnValue(queryResult(false));

      renderHook(
        () =>
          useOrgMeasuresCountWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            metricKeyForRequest: MetricKey.security_rating,
            metricType: MetricType.Rating,
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          metricKeys: [MetricKey.software_quality_security_rating],
        }),
        expect.objectContaining({ enabled: true }),
      );
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

    it.each([
      [true, { issueTypes: ['VULNERABILITY'] }],
      [false, { impacts: expect.arrayContaining(['SECURITY:HIGH']) }],
    ])('resolves semantic line-chart filters for the current mode', (isStandardMode, expected) => {
      mockUseStandardExperienceModeQuery.mockReturnValue(queryResult(isStandardMode));

      renderHook(
        () =>
          useOrganizationLineChartSeriesData({
            actualMetricKey: MetricKey.security_issues,
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            groupBy: LineChartGroupBy.None,
            historyRange: '3',
            measureFilters: { impactSoftwareQuality: SoftwareQuality.Security },
            measuresHistoryKey: MetricKey.security_issues,
            metric: {
              measureFilters: { impactSoftwareQuality: SoftwareQuality.Security },
              metricKey: RichMetricKey.Issues,
              type: DashboardMetricType.Rich,
            },
            metricName: 'Security issues',
            metricType: MetricType.Integer,
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining(expected),
        expect.objectContaining({ enabled: true }),
      );
    });

    it('reads a canonical software-quality grouping from the Standard type dimension', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));

      renderHook(
        () =>
          useOrganizationLineChartSeriesData({
            actualMetricKey: MetricKey.violations,
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            groupBy: LineChartGroupBy.SoftwareQuality,
            historyRange: '3',
            measureFilters: undefined,
            measuresHistoryKey: MetricKey.violations,
            metric: { metricKey: RichMetricKey.Issues, type: DashboardMetricType.Rich },
            metricName: 'Issues',
            metricType: MetricType.Integer,
          }),
        { wrapper: getContextWrapper() },
      );

      const queryCall = mockUseDashboardIssueCountHistoryQuery.mock.calls[0];
      expect(queryCall[0]).toEqual(expect.objectContaining({ sliceBy: 'TYPE' }));
      expect(
        selectFrom(queryCall)({
          issueCountHistory: [{ date: '2026-03-20', distribution: [{ key: 'BUG', value: 2 }] }],
        }),
      ).toEqual([expect.objectContaining({ id: SoftwareQuality.Reliability })]);
      jest.useRealTimers();
    });

    it('resolves Cloud line-chart measure keys to their MQR data source', () => {
      mockUseStandardExperienceModeQuery.mockReturnValue(queryResult(false));
      mockUseWidgetMetricMetadataQuery.mockReturnValue(
        queryResult({
          [MetricKey.software_quality_security_rating]: {
            key: MetricKey.software_quality_security_rating,
            type: MetricType.Rating,
          },
        }),
      );

      renderHook(
        () =>
          useOrganizationLineChartSeriesData({
            actualMetricKey: MetricKey.security_rating,
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            groupBy: LineChartGroupBy.None,
            historyRange: '3',
            measureFilters: undefined,
            measuresHistoryKey: MetricKey.security_rating,
            metric: { metricKey: MetricKey.security_rating, type: DashboardMetricType.Raw },
            metricName: 'Security rating',
            metricType: MetricType.Rating,
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          metricKeys: [MetricKey.software_quality_security_rating],
        }),
        expect.objectContaining({ enabled: true }),
      );
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

    it.each([
      [MetricKey.security_hotspots, CodeScope.Overall, 'Security hotspots'],
      [MetricKey.new_security_hotspots, CodeScope.New, 'New security hotspots'],
    ])('keeps the deprecated raw %s line chart unsupported', (metricKey, scope, metricName) => {
      const metric = {
        metricKey,
        type: DashboardMetricType.Raw,
      };
      expect(() => organizationLineChartRequestKey(metric, scope, metricKey)).toThrow(
        DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE,
      );

      expect(() =>
        renderHook(
          () =>
            useOrganizationLineChartSeriesData({
              actualMetricKey: metricKey,
              entityId: 'portfolio-1',
              entityType: 'PORTFOLIO',
              groupBy: LineChartGroupBy.None,
              historyRange: '3',
              measureFilters: undefined,
              measuresHistoryKey: metricKey,
              metric,
              metricName,
              metricType: MetricType.Integer,
            }),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false }),
      );
    });

    it('keeps rich hotspot line charts unsupported', () => {
      const metric = {
        metricKey: RichMetricKey.Hotspots,
        type: DashboardMetricType.Rich,
      };
      expect(() =>
        organizationLineChartRequestKey(metric, CodeScope.Overall, MetricKey.security_hotspots),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);

      expect(() =>
        renderHook(
          () =>
            useOrganizationLineChartSeriesData({
              actualMetricKey: MetricKey.security_hotspots,
              entityId: 'portfolio-1',
              entityType: 'PORTFOLIO',
              groupBy: LineChartGroupBy.None,
              historyRange: '3',
              measureFilters: undefined,
              measuresHistoryKey: MetricKey.security_hotspots,
              metric,
              metricName: 'Security hotspots',
              metricType: MetricType.Integer,
            }),
          { wrapper: getContextWrapper() },
        ),
      ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
      expect(mockUseDashboardIssueCountHistoryQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false }),
      );
    });

    it('surfaces experience-mode errors on count widgets without reporting pending', () => {
      const modeError = new Error('mode request failed');
      mockUseStandardExperienceModeQuery.mockReturnValue(
        queryResult(undefined, { error: modeError }),
      );
      // A disabled TanStack query that never fetched reports isPending: true forever.
      mockUseDashboardIssueCountHistoryQuery.mockReturnValue(
        queryResult(undefined, { isPending: true }),
      );
      mockUseDashboardMeasuresHistoryQuery.mockReturnValue(
        queryResult(undefined, { isPending: true }),
      );

      const issueCount = renderHook(
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
      expect(issueCount.result.current.isError).toBe(true);
      expect(issueCount.result.current.isPending).toBe(false);

      const measuresCount = renderHook(
        () =>
          useOrgMeasuresCountWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            metricKeyForRequest: MetricKey.coverage,
            metricType: MetricType.Percent,
          }),
        { wrapper: getContextWrapper() },
      );
      expect(measuresCount.result.current.isError).toBe(true);
      expect(measuresCount.result.current.isPending).toBe(false);
    });

    it('stops reporting isPending on the top list once the experience-mode query has errored', () => {
      const modeError = new Error('mode request failed');
      mockUseStandardExperienceModeQuery.mockReturnValue(
        queryResult(undefined, { error: modeError }),
      );
      mockUseDashboardIssueCountHistoryQuery.mockReturnValue(
        queryResult(undefined, { isPending: true }),
      );

      const { result } = renderHook(
        () =>
          useTopListIssueCountData(
            {
              limit: 5,
              metric: { type: DashboardMetricType.Rich, metricKey: RichMetricKey.Issues },
            },
            'portfolio-1',
            'PORTFOLIO',
            { fetchTrendHistory: false },
          ),
        { wrapper: getContextWrapper() },
      );

      expect(result.current.isError).toBe(true);
      expect(result.current.isPending).toBe(false);
    });

    it('stops reporting isPending on line charts once the experience-mode query has errored', () => {
      const modeError = new Error('mode request failed');
      mockUseStandardExperienceModeQuery.mockReturnValue(
        queryResult(undefined, { error: modeError }),
      );
      mockUseDashboardIssueCountHistoryQuery.mockReturnValue(
        queryResult(undefined, { isPending: true }),
      );
      const richMetric: DashboardMetric = {
        type: DashboardMetricType.Rich,
        metricKey: RichMetricKey.Issues,
      };

      const { result } = renderHook(
        () =>
          useOrganizationLineChartSeriesData({
            actualMetricKey: undefined,
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            groupBy: LineChartGroupBy.None,
            historyRange: '3',
            measureFilters: undefined,
            measuresHistoryKey: MetricKey.violations,
            metric: richMetric,
            metricName: 'Issues',
            metricType: undefined,
          }),
        { wrapper: getContextWrapper() },
      );

      expect(result.current.lineChartHasFetchError).toBe(true);
      expect(result.current.isMeasuresHistoryPending).toBe(false);
    });
  });

  describe('pie-chart queries', () => {
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

    it('keeps legacy project data for unsupported slices', () => {
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
          metric: PieChartMetric.ProjectCount,
          scope: CodeScope.Overall,
          slice: 'status',
        }),
      ).toBe(true);
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

  describe('issue-density adapters', () => {
    it('configures the count query with the retention buffer and transforms density history', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));

      renderHook(
        () =>
          useOrgIssueDensityCountWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            measureFilters: { impactSeverities: ['HIGH'] },
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardIssueDensityHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: 'portfolio-1',
          entityType: 'PORTFOLIO',
          severities: ['CRITICAL'],
          startDate: organizationsHistoryStartDateWithRetentionBuffer(),
        }),
        expect.objectContaining({ enabled: true }),
      );
      expect(
        selectFrom(mockUseDashboardIssueDensityHistoryQuery.mock.calls[0])({
          issueDensityHistory: [{ date: '2026-03-20', distribution: [{ key: 'all', value: 7 }] }],
        }),
      ).toEqual({
        latestValue: 7,
        sparklineSeries: [7],
        trend: { current: '7', past: '7' },
      });
      jest.useRealTimers();
    });

    it('configures the line-chart query with the range start date and single series', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));

      renderHook(
        () =>
          useOrgIssueDensityLineChartWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            historyRange: '3',
            measureFilters: undefined,
            metricName: 'Density',
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardIssueDensityHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: lineChartSinceDate('3') }),
        expect.objectContaining({ enabled: true }),
      );
      expect(
        selectFrom(mockUseDashboardIssueDensityHistoryQuery.mock.calls[0])({
          issueDensityHistory: [{ date: '2026-03-20', distribution: [{ key: 'all', value: 7 }] }],
        }),
      ).toEqual([expect.objectContaining({ id: 'total', label: 'Density' })]);
      jest.useRealTimers();
    });

    it('stops reporting isPending once the experience-mode query has errored', () => {
      const modeError = new Error('mode request failed');
      mockUseStandardExperienceModeQuery.mockReturnValue(
        queryResult(undefined, { error: modeError }),
      );
      mockUseDashboardIssueDensityHistoryQuery.mockReturnValue(
        queryResult(undefined, { isPending: true }),
      );

      const count = renderHook(
        () =>
          useOrgIssueDensityCountWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            measureFilters: undefined,
          }),
        { wrapper: getContextWrapper() },
      );
      expect(count.result.current.isError).toBe(true);
      expect(count.result.current.isPending).toBe(false);

      const lineChart = renderHook(
        () =>
          useOrgIssueDensityLineChartWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            historyRange: '3',
            measureFilters: undefined,
            metricName: 'Density',
          }),
        { wrapper: getContextWrapper() },
      );
      expect(lineChart.result.current.isError).toBe(true);
      expect(lineChart.result.current.isPending).toBe(false);
    });
  });

  describe('issue-resolution adapters', () => {
    it('maps software quality and severity filters to standard severities for the count query', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));

      renderHook(
        () =>
          useOrgIssueResolutionCountWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            measureFilters: {
              impactSeverities: [SoftwareImpactSeverity.High],
              impactSoftwareQuality: SoftwareQuality.Security,
            },
            statistic: 'MTTR',
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardIssueResolutionHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          issueTypes: ['VULNERABILITY'],
          severities: ['CRITICAL'],
          startDate: organizationsHistoryStartDateWithRetentionBuffer(),
          statistic: 'MTTR',
        }),
        expect.objectContaining({ enabled: true }),
      );
      expect(
        selectFrom(mockUseDashboardIssueResolutionHistoryQuery.mock.calls[0])({
          issueResolutionHistory: [
            { date: '2026-03-20', distribution: [{ key: 'all', value: 42 }] },
          ],
        }),
      ).toEqual({
        latestValue: 42,
        sparklineSeries: [42],
        trend: { current: '42', past: '42' },
      });
      jest.useRealTimers();
    });

    it('passes the statistic through the line-chart query', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));

      renderHook(
        () =>
          useOrgIssueResolutionLineChartWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            historyRange: '3',
            measureFilters: undefined,
            metricName: 'MTTR',
            statistic: 'MTTR',
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardIssueResolutionHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: lineChartSinceDate('3'), statistic: 'MTTR' }),
        expect.objectContaining({ enabled: true }),
      );
      expect(
        selectFrom(mockUseDashboardIssueResolutionHistoryQuery.mock.calls[0])({
          issueResolutionHistory: [
            { date: '2026-03-20', distribution: [{ key: 'all', value: 42 }] },
          ],
        }),
      ).toEqual([expect.objectContaining({ id: 'total', label: 'MTTR' })]);
      jest.useRealTimers();
    });

    it('surfaces experience-mode errors without reporting pending', () => {
      const modeError = new Error('mode request failed');
      mockUseStandardExperienceModeQuery.mockReturnValue(
        queryResult(undefined, { error: modeError }),
      );
      mockUseDashboardIssueResolutionHistoryQuery.mockReturnValue(
        queryResult(undefined, { isPending: true }),
      );

      const count = renderHook(
        () =>
          useOrgIssueResolutionCountWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            measureFilters: undefined,
            statistic: 'MTTR',
          }),
        { wrapper: getContextWrapper() },
      );
      expect(count.result.current.isError).toBe(true);
      expect(count.result.current.isPending).toBe(false);

      const lineChart = renderHook(
        () =>
          useOrgIssueResolutionLineChartWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            historyRange: '3',
            measureFilters: undefined,
            metricName: 'MTTR',
            statistic: 'MTTR',
          }),
        { wrapper: getContextWrapper() },
      );
      expect(lineChart.result.current.isError).toBe(true);
      expect(lineChart.result.current.isPending).toBe(false);
    });
  });

  describe('sca-resolution adapters', () => {
    it('hardcodes the SCA_MTTR statistic and transforms count history', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));

      renderHook(
        () =>
          useOrgScaResolutionCountWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            measureFilters: { impactSeverities: ['HIGH'] },
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardScaResolutionHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          severities: ['HIGH'],
          startDate: organizationsHistoryStartDateWithRetentionBuffer(),
          statistic: 'SCA_MTTR',
        }),
        expect.objectContaining({ enabled: true }),
      );
      expect(
        selectFrom(mockUseDashboardScaResolutionHistoryQuery.mock.calls[0])({
          scaResolutionHistory: [{ date: '2026-03-20', distribution: [{ key: 'all', value: 9 }] }],
        }),
      ).toEqual({
        latestValue: 9,
        sparklineSeries: [9],
        trend: { current: '9', past: '9' },
      });
      jest.useRealTimers();
    });

    it('hardcodes the SCA_MTTR statistic on the line-chart query', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));

      renderHook(
        () =>
          useOrgScaResolutionLineChartWidgetData({
            entityId: 'portfolio-1',
            entityType: 'PORTFOLIO',
            historyRange: '3',
            measureFilters: undefined,
            metricName: 'SCA MTTR',
          }),
        { wrapper: getContextWrapper() },
      );

      expect(mockUseDashboardScaResolutionHistoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: lineChartSinceDate('3'), statistic: 'SCA_MTTR' }),
        expect.objectContaining({ enabled: true }),
      );
      expect(
        selectFrom(mockUseDashboardScaResolutionHistoryQuery.mock.calls[0])({
          scaResolutionHistory: [{ date: '2026-03-20', distribution: [{ key: 'all', value: 9 }] }],
        }),
      ).toEqual([expect.objectContaining({ id: 'total', label: 'SCA MTTR' })]);
      jest.useRealTimers();
    });
  });
});
