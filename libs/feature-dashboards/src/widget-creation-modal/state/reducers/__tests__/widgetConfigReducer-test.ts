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
import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../../data/widgets/line-chart';
import {
  DashboardMetricType,
  IssueStatus,
  PieChartHotspotFilter,
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartProjectSlice,
  RichMetricKey,
  type CompleteWidgetConfig,
  type DashboardMetric,
} from '../../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../../types/organization-issue-resolution-history';
import { PieChartPastry } from '../../../../types/visualization';
import {
  CodeScope,
  ISSUE_DENSITY_METRIC_OPTION_VALUE,
  SCA_MTTR_METRIC_OPTION_VALUE,
  TopListLimit,
  TopListMetric,
  TopListRankBy,
  VisualizationType,
  type IssueDensityMetricOptionValue,
} from '../../../../types/widget-common';
import {
  extractCompleteConfig,
  initializeFromConfig,
  isConfigComplete,
} from '../../selectors/widgetConfigSelectors';
import {
  createInitialCountConfig,
  createInitialLineChartConfig,
  createInitialPieChartConfig,
  createInitialRatingBadgeConfig,
  createInitialTopListConfig,
} from '../../widgetConfigInitialState';
import type {
  LineChartConfig,
  RatingBadgeConfig,
  WidgetConfigState,
} from '../../widgetConfigTypes';
import { widgetConfigReducer } from '../widgetConfigReducer';

describe('widgetConfigReducer', () => {
  const emptyState: WidgetConfigState = { configs: {}, selectedType: null };

  it('createInitialPieChartConfig starts incomplete', () => {
    expect(createInitialPieChartConfig()).toMatchObject({
      complete: false,
      metric: null,
      slice: null,
      scope: CodeScope.Overall,
    });
  });

  it('createInitialCountConfig defaults trend and sparkline customization on', () => {
    expect(createInitialCountConfig().showTrendIndicator).toBe(true);
  });

  it('createInitialTopListConfig starts incomplete without metric or rank-by and defaults limit to 5', () => {
    expect(createInitialTopListConfig()).toMatchObject({
      complete: false,
      limit: TopListLimit.Five,
      metric: null,
      rankBy: null,
      scope: CodeScope.Overall,
    });
  });

  it('SET_WIDGET_TYPE creates a new config when none exists', () => {
    const next = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.Count,
    });
    expect(next.selectedType).toBe(VisualizationType.Count);
    expect(next.configs[VisualizationType.Count]?.metric).toBeNull();
  });

  it('SET_WIDGET_TYPE creates incomplete top list config', () => {
    const next = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.TopList,
    });
    expect(next.selectedType).toBe(VisualizationType.TopList);
    expect(next.configs[VisualizationType.TopList]).toEqual(createInitialTopListConfig());
  });

  it('extractCompleteConfig returns null until the active config is complete', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.Count,
    });
    expect(extractCompleteConfig(state)).toBeNull();
    expect(isConfigComplete(state)).toBe(false);

    state = widgetConfigReducer(state, {
      metricKey: MetricKey.ncloc,
      type: 'SET_METRIC_KEY',
    });
    expect(extractCompleteConfig(state)).toEqual({
      metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
      scope: CodeScope.Overall,
      showTrendIndicator: true,
      widgetType: VisualizationType.Count,
    });
    expect(isConfigComplete(state)).toBe(true);
  });

  it('initializeFromConfig round-trips a complete count widget', () => {
    const initialized = initializeFromConfig({
      metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
      scope: CodeScope.New,
      showTrendIndicator: true,
      widgetType: VisualizationType.Count,
    });
    expect(initialized.selectedType).toBe(VisualizationType.Count);
    expect(isConfigComplete(initialized)).toBe(true);
    expect(extractCompleteConfig(initialized)?.scope).toBe(CodeScope.New);
  });

  it('initializeFromConfig normalizes the deprecated all-time line chart range', () => {
    const initialized = initializeFromConfig({
      groupBy: LineChartGroupBy.None,
      historyRange: HistoryRange.All,
      metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
      scope: CodeScope.Overall,
      showLegend: true,
      widgetType: VisualizationType.LineChart,
    });

    expect(initialized.configs[VisualizationType.LineChart]?.historyRange).toBe(
      HistoryRange.Last12Months,
    );
  });

  it('SET_TOP_LIST_METRIC and SET_TOP_LIST_RANK_BY complete top list config', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.TopList,
    });
    expect(isConfigComplete(state)).toBe(false);

    state = widgetConfigReducer(state, {
      metric: TopListMetric.IssueCount,
      type: 'SET_TOP_LIST_METRIC',
    });
    expect(isConfigComplete(state)).toBe(false);

    state = widgetConfigReducer(state, {
      rankBy: TopListRankBy.Rule,
      type: 'SET_TOP_LIST_RANK_BY',
    });
    expect(isConfigComplete(state)).toBe(true);
    expect(state.configs[VisualizationType.TopList]).toMatchObject({
      complete: true,
      limit: TopListLimit.Five,
      metric: TopListMetric.IssueCount,
      rankBy: TopListRankBy.Rule,
    });

    const complete = extractCompleteConfig(state);
    expect(complete).toMatchObject({
      widgetType: VisualizationType.TopList,
      limit: TopListLimit.Five,
      rankBy: TopListRankBy.Rule,
      scope: CodeScope.Overall,
    });
  });

  it('SET_TOP_LIST_LIMIT updates the persisted limit', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.TopList,
    });
    state = widgetConfigReducer(state, {
      limit: TopListLimit.Ten,
      type: 'SET_TOP_LIST_LIMIT',
    });
    expect(state.configs[VisualizationType.TopList]?.limit).toBe(TopListLimit.Ten);
  });

  it('SET_TOP_LIST_MEASURE_FILTERS and SET_SCOPE update top list config', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.TopList,
    });
    state = widgetConfigReducer(state, {
      metric: TopListMetric.IssueCount,
      type: 'SET_TOP_LIST_METRIC',
    });
    state = widgetConfigReducer(state, {
      rankBy: TopListRankBy.Rule,
      type: 'SET_TOP_LIST_RANK_BY',
    });
    state = widgetConfigReducer(state, {
      measureFilters: { issueStatus: IssueStatus.Open },
      type: 'SET_TOP_LIST_MEASURE_FILTERS',
    });
    state = widgetConfigReducer(state, {
      scope: CodeScope.New,
      type: 'SET_SCOPE',
    });

    expect(state.configs[VisualizationType.TopList]).toMatchObject({
      scope: CodeScope.New,
      measureFilters: { issueStatus: IssueStatus.Open },
    });
  });

  it('SET_PIE_METRIC and SET_PIE_SLICE complete pie chart config', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.PieChart,
    });
    state = widgetConfigReducer(state, {
      metric: PieChartMetric.IssueCount,
      type: 'SET_PIE_METRIC',
    });
    state = widgetConfigReducer(state, {
      slice: PieChartIssueSlice.ImpactSeverities,
      type: 'SET_PIE_SLICE',
    });
    expect(isConfigComplete(state)).toBe(true);
    expect(extractCompleteConfig(state)).toMatchObject({
      metric: PieChartMetric.IssueCount,
      slice: PieChartIssueSlice.ImpactSeverities,
      widgetType: VisualizationType.PieChart,
    });
  });

  it('SET_PIE_METRIC auto-selects status slice for project count', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.PieChart,
    });
    state = widgetConfigReducer(state, {
      metric: PieChartMetric.ProjectCount,
      type: 'SET_PIE_METRIC',
    });
    expect(isConfigComplete(state)).toBe(true);
    expect(extractCompleteConfig(state)).toMatchObject({
      metric: PieChartMetric.ProjectCount,
      slice: PieChartProjectSlice.Status,
      widgetType: VisualizationType.PieChart,
    });
  });

  it('RESET clears state', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.LineChart,
    });
    state = widgetConfigReducer(state, {
      type: 'RESET',
    });
    expect(state).toEqual(emptyState);
  });

  it('INITIALIZE replaces state from payload', () => {
    const payload: WidgetConfigState = {
      configs: {
        [VisualizationType.LineChart]: {
          complete: true,
          groupBy: LineChartGroupBy.None,
          historyRange: HistoryRange.All,
          metric: { metricKey: MetricKey.bugs, type: DashboardMetricType.Raw },
          scope: CodeScope.Overall,
        },
      },
      selectedType: VisualizationType.LineChart,
    };
    const state = widgetConfigReducer(emptyState, { payload, type: 'INITIALIZE' });
    expect(state).toEqual(payload);
  });

  it('INITIALIZE clears hotspot pie filter only on review status slice', () => {
    const priorityPayload: WidgetConfigState = {
      configs: {
        [VisualizationType.PieChart]: {
          ...createInitialPieChartConfig(),
          complete: true,
          filter: PieChartHotspotFilter.ToReview,
          metric: PieChartMetric.HotspotCount,
          slice: PieChartHotspotSlice.ReviewPriority,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    expect(
      (
        widgetConfigReducer(emptyState, { payload: priorityPayload, type: 'INITIALIZE' }).configs[
          VisualizationType.PieChart
        ] as { filter: string }
      ).filter,
    ).toBe(PieChartHotspotFilter.ToReview);

    const reviewStatusPayload: WidgetConfigState = {
      configs: {
        [VisualizationType.PieChart]: {
          ...createInitialPieChartConfig(),
          complete: true,
          filter: PieChartHotspotFilter.ToReview,
          metric: PieChartMetric.HotspotCount,
          slice: PieChartHotspotSlice.ReviewStatus,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    expect(
      (
        widgetConfigReducer(emptyState, { payload: reviewStatusPayload, type: 'INITIALIZE' })
          .configs[VisualizationType.PieChart] as { filter: string }
      ).filter,
    ).toBe('');
  });

  it('switches PieChart and DonutChart while sharing the same config object', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.PieChart,
    });
    state = widgetConfigReducer(state, {
      metric: PieChartMetric.IssueCount,
      type: 'SET_PIE_METRIC',
    });
    state = widgetConfigReducer(state, {
      slice: PieChartIssueSlice.ImpactSeverities,
      type: 'SET_PIE_SLICE',
    });
    const pieRef = state.configs[VisualizationType.PieChart];
    state = widgetConfigReducer(state, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.DonutChart,
    });
    expect(state.configs[VisualizationType.DonutChart]).toBe(pieRef);
    expect(state.configs[VisualizationType.PieChart]).toBe(pieRef);
  });

  it('restores existing config when switching widget types', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.Count,
    });
    state = widgetConfigReducer(state, {
      metricKey: MetricKey.ncloc,
      type: 'SET_METRIC_KEY',
    });
    state = widgetConfigReducer(state, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.LineChart,
    });
    state = widgetConfigReducer(state, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.Count,
    });
    expect(state.configs[VisualizationType.Count]?.metric).toEqual({
      metricKey: MetricKey.ncloc,
      type: DashboardMetricType.Raw,
    });
  });

  it('SET_PIE_SLICE clears filter when slicing by software quality', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.PieChart,
    });
    state = widgetConfigReducer(state, {
      metric: PieChartMetric.IssueCount,
      type: 'SET_PIE_METRIC',
    });
    state = widgetConfigReducer(state, {
      filter: PieChartIssueFilter.Reliability,
      type: 'SET_PIE_FILTER',
    });
    state = widgetConfigReducer(state, {
      slice: PieChartIssueSlice.ImpactSoftwareQualities,
      type: 'SET_PIE_SLICE',
    });
    expect((state.configs[VisualizationType.PieChart] as { filter: string }).filter).toBe('');
  });

  it('SET_PIE_SLICE clears hotspot filter only when changing to review status slice', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.PieChart]: {
          ...createInitialPieChartConfig(),
          complete: true,
          filter: PieChartHotspotFilter.Safe,
          metric: PieChartMetric.HotspotCount,
          slice: PieChartHotspotSlice.ReviewPriority,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    state = widgetConfigReducer(state, {
      slice: PieChartHotspotSlice.SecurityCategory,
      type: 'SET_PIE_SLICE',
    });
    expect((state.configs[VisualizationType.PieChart] as { filter: string }).filter).toBe(
      PieChartHotspotFilter.Safe,
    );

    state = widgetConfigReducer(state, {
      slice: PieChartHotspotSlice.ReviewStatus,
      type: 'SET_PIE_SLICE',
    });
    expect((state.configs[VisualizationType.PieChart] as { filter: string }).filter).toBe('');
  });

  it('SET_PIE_FILTER and SET_PIE_SHOW_LEGEND update pie config', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.PieChart,
    });
    state = widgetConfigReducer(state, {
      metric: PieChartMetric.HotspotCount,
      type: 'SET_PIE_METRIC',
    });
    state = widgetConfigReducer(state, {
      slice: PieChartHotspotSlice.ReviewPriority,
      type: 'SET_PIE_SLICE',
    });
    state = widgetConfigReducer(state, {
      filter: PieChartHotspotFilter.ToReview,
      type: 'SET_PIE_FILTER',
    });
    state = widgetConfigReducer(state, {
      showLegend: false,
      type: 'SET_PIE_SHOW_LEGEND',
    });
    const pie = state.configs[VisualizationType.PieChart];
    expect(pie).toMatchObject({
      filter: PieChartHotspotFilter.ToReview,
      showLegend: false,
    });
  });

  it('SET_PIE_FILTER clears hotspot filter on review status slice', () => {
    let state = widgetConfigReducer(emptyState, {
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.PieChart,
    });
    state = widgetConfigReducer(state, {
      metric: PieChartMetric.HotspotCount,
      type: 'SET_PIE_METRIC',
    });
    state = widgetConfigReducer(state, {
      slice: PieChartHotspotSlice.ReviewStatus,
      type: 'SET_PIE_SLICE',
    });
    state = widgetConfigReducer(state, {
      filter: PieChartHotspotFilter.ToReview,
      type: 'SET_PIE_FILTER',
    });
    expect((state.configs[VisualizationType.PieChart] as { filter: string }).filter).toBe('');
  });

  it('SET_PIE_SCOPE clamps scope to Overall for portfolio widget configurator', () => {
    const state = widgetConfigReducer(
      {
        configs: {
          [VisualizationType.PieChart]: {
            ...createInitialPieChartConfig(),
            complete: false,
            metric: PieChartMetric.IssueCount,
            slice: PieChartIssueSlice.ImpactSeverities,
            scope: CodeScope.Overall,
          },
        },
        selectedType: VisualizationType.PieChart,
      },
      { scope: CodeScope.New, type: 'SET_PIE_SCOPE' },
      { isPortfolioWidgetConfigurator: true },
    );
    expect((state.configs[VisualizationType.PieChart] as { scope: CodeScope }).scope).toBe(
      CodeScope.Overall,
    );
  });

  it('SET_SCOPE keeps line-chart issue status and overall scope for rich metrics', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.LineChart]: {
          complete: true,
          groupBy: LineChartGroupBy.None,
          historyRange: HistoryRange.All,
          metric: {
            measureFilters: { issueStatus: IssueStatus.Open },
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          scope: CodeScope.Overall,
          showLegend: false,
        },
      },
      selectedType: VisualizationType.LineChart,
    };
    state = widgetConfigReducer(state, { scope: CodeScope.New, type: 'SET_SCOPE' });
    const lineChart = state.configs[VisualizationType.LineChart] as Extract<
      LineChartConfig,
      { complete: true }
    >;
    const richMetric = lineChart.metric as Extract<
      DashboardMetric,
      { type: DashboardMetricType.Rich }
    >;
    expect(richMetric.measureFilters?.issueStatus).toBe(IssueStatus.Open);
    expect(state.configs[VisualizationType.LineChart]?.scope).toBe(CodeScope.Overall);
  });

  it('SET_METRIC_KEY to issue count keeps showTrendIndicator on overall code', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.Count]: {
          complete: true,
          metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
          scope: CodeScope.Overall,
          showTrendIndicator: true,
        },
      },
      selectedType: VisualizationType.Count,
    };
    state = widgetConfigReducer(state, {
      metricKey: MetricKey.violations,
      type: 'SET_METRIC_KEY',
    });
    expect(state.configs[VisualizationType.Count]?.showTrendIndicator).toBe(true);
  });

  it('SET_SCOPE keeps new code for rich count metrics', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.Count]: {
          complete: true,
          metric: {
            measureFilters: { issueStatus: IssueStatus.Open },
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          scope: CodeScope.Overall,
          showTrendIndicator: true,
        },
      },
      selectedType: VisualizationType.Count,
    };
    state = widgetConfigReducer(state, { scope: CodeScope.New, type: 'SET_SCOPE' });
    const cfg = state.configs[VisualizationType.Count] as {
      metric: { measureFilters?: { issueStatus?: IssueStatus } };
      scope: CodeScope;
      showTrendIndicator: boolean;
    };
    expect(cfg.scope).toBe(CodeScope.New);
    expect(cfg.showTrendIndicator).toBe(false);
    expect(cfg.metric.measureFilters?.issueStatus).toBe(IssueStatus.Open);
  });

  it('SET_HISTORY_RANGE updates line chart only', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.LineChart]: createInitialLineChartConfig(),
      },
      selectedType: VisualizationType.LineChart,
    };
    state = widgetConfigReducer(state, {
      historyRange: HistoryRange.LastMonth,
      type: 'SET_HISTORY_RANGE',
    });
    expect(state.configs[VisualizationType.LineChart]?.historyRange).toBe(HistoryRange.LastMonth);
  });

  it('SET_COUNT_MEASURE_FILTERS stores filters on incomplete configs', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.Count]: createInitialCountConfig(),
      },
      selectedType: VisualizationType.Count,
    };
    state = widgetConfigReducer(state, {
      measureFilters: { issueStatus: IssueStatus.Accepted },
      type: 'SET_COUNT_MEASURE_FILTERS',
    });
    expect(
      (state.configs[VisualizationType.Count] as { measureFilters?: { issueStatus: IssueStatus } })
        .measureFilters,
    ).toEqual({ issueStatus: IssueStatus.Accepted });
  });

  it('SET_COUNT_MEASURE_FILTERS preserves status, software quality, and severities', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.Count]: {
          complete: true,
          metric: {
            measureFilters: {},
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          scope: CodeScope.Overall,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    state = widgetConfigReducer(state, {
      measureFilters: {
        impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Blocker],
        impactSoftwareQuality: SoftwareQuality.Security,
        issueStatus: IssueStatus.Open,
      },
      type: 'SET_COUNT_MEASURE_FILTERS',
    });
    const mf = (state.configs[VisualizationType.Count] as { metric: { measureFilters: object } })
      .metric.measureFilters;
    expect(mf).toEqual({
      impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Blocker],
      impactSoftwareQuality: SoftwareQuality.Security,
      issueStatus: IssueStatus.Open,
    });
  });

  it('SET_SHOW_LEGEND_LINECHART, SET_SHOW_TREND_INDICATOR, and SET_SHOW_BREAKDOWN', () => {
    let lineState: WidgetConfigState = {
      configs: { [VisualizationType.LineChart]: createInitialLineChartConfig() },
      selectedType: VisualizationType.LineChart,
    };
    lineState = widgetConfigReducer(lineState, {
      showLegend: true,
      type: 'SET_SHOW_LEGEND_LINECHART',
    });
    expect(lineState.configs[VisualizationType.LineChart]?.showLegend).toBe(true);

    let countState: WidgetConfigState = {
      configs: {
        [VisualizationType.Count]: {
          complete: true,
          metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
          scope: CodeScope.Overall,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    countState = widgetConfigReducer(countState, {
      showTrendIndicator: true,
      type: 'SET_SHOW_TREND_INDICATOR',
    });
    expect(countState.configs[VisualizationType.Count]?.showTrendIndicator).toBe(true);

    let ratingState: WidgetConfigState = {
      configs: {
        [VisualizationType.RatingBadge]: {
          ...createInitialRatingBadgeConfig(),
          complete: true,
          metricKey: MetricKey.alert_status,
        },
      },
      selectedType: VisualizationType.RatingBadge,
    };
    ratingState = widgetConfigReducer(ratingState, {
      showBreakdown: true,
      type: 'SET_SHOW_BREAKDOWN',
    });
    expect(
      (ratingState.configs[VisualizationType.RatingBadge] as { showBreakdown: boolean })
        .showBreakdown,
    ).toBe(true);
  });

  it('SET_METRIC_KEY forces Overall scope for quality gate badge', () => {
    const ratingBadgeBeforeMetric: RatingBadgeConfig = {
      ...createInitialRatingBadgeConfig(),
      scope: CodeScope.New,
    };
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.RatingBadge]: ratingBadgeBeforeMetric,
      },
      selectedType: VisualizationType.RatingBadge,
    };
    state = widgetConfigReducer(state, {
      metricKey: MetricKey.alert_status,
      type: 'SET_METRIC_KEY',
    });
    expect(state.configs[VisualizationType.RatingBadge]?.scope).toBe(CodeScope.Overall);
  });

  it('extractCompleteConfig returns donut config with pastry', () => {
    const donutComplete: CompleteWidgetConfig = {
      filter: '',
      metric: PieChartMetric.IssueCount,
      pastry: PieChartPastry.Donut,
      scope: CodeScope.Overall,
      showLegend: true,
      slice: PieChartIssueSlice.ImpactSeverities,
      widgetType: VisualizationType.DonutChart,
    };
    const state = initializeFromConfig(donutComplete);
    expect(extractCompleteConfig(state)).toEqual(donutComplete);
  });

  it('initializeFromConfig duplicates pie config for donut widgets', () => {
    const donutComplete: CompleteWidgetConfig = {
      filter: '',
      metric: PieChartMetric.LineCount,
      pastry: PieChartPastry.Donut,
      scope: CodeScope.Overall,
      showLegend: false,
      slice: PieChartLineSlice.Coverage,
      widgetType: VisualizationType.DonutChart,
    };
    const state = initializeFromConfig(donutComplete);
    expect(state.configs[VisualizationType.DonutChart]).toBe(
      state.configs[VisualizationType.PieChart],
    );
  });

  it('SET_METRIC_KEY with IssueResolutionStatistic sets IssueResolution metric on count widget', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.Count]: createInitialCountConfig(),
      },
      selectedType: VisualizationType.Count,
    };
    state = widgetConfigReducer(state, {
      metricKey: IssueResolutionStatistic.ResolvedIssues,
      type: 'SET_METRIC_KEY',
    });
    const cfg = state.configs[VisualizationType.Count];
    expect(cfg?.complete).toBe(true);
    expect(cfg?.metric).toMatchObject({
      statistic: IssueResolutionStatistic.ResolvedIssues,
      type: DashboardMetricType.IssueResolution,
    });
    expect(cfg?.scope).toBe(CodeScope.Overall);
  });

  it('SET_METRIC_KEY with IssueResolutionStatistic forces Overall scope and clears groupBy on line chart', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.LineChart]: {
          ...createInitialLineChartConfig(),
          groupBy: LineChartGroupBy.Severity,
          scope: CodeScope.New,
        },
      },
      selectedType: VisualizationType.LineChart,
    };
    state = widgetConfigReducer(state, {
      metricKey: IssueResolutionStatistic.MTTR,
      type: 'SET_METRIC_KEY',
    });
    const cfg = state.configs[VisualizationType.LineChart];
    expect(cfg?.complete).toBe(true);
    expect(cfg?.metric).toMatchObject({
      statistic: IssueResolutionStatistic.MTTR,
      type: DashboardMetricType.IssueResolution,
    });
    expect(cfg?.scope).toBe(CodeScope.Overall);
    expect(cfg?.groupBy).toBe(LineChartGroupBy.None);
  });

  it('SET_METRIC_KEY with IssueResolutionStatistic is ignored for rating badge', () => {
    const initial = createInitialRatingBadgeConfig();
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.RatingBadge]: initial,
      },
      selectedType: VisualizationType.RatingBadge,
    };
    state = widgetConfigReducer(state, {
      metricKey: IssueResolutionStatistic.RecentMTTR,
      type: 'SET_METRIC_KEY',
    });
    expect(state.configs[VisualizationType.RatingBadge]).toEqual(initial);
  });

  it('SET_METRIC_KEY with ISSUE_DENSITY_METRIC_OPTION_VALUE sets IssueDensity metric on count widget', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.Count]: createInitialCountConfig(),
      },
      selectedType: VisualizationType.Count,
    };
    state = widgetConfigReducer(state, {
      metricKey: ISSUE_DENSITY_METRIC_OPTION_VALUE as unknown as IssueDensityMetricOptionValue,
      type: 'SET_METRIC_KEY',
    });
    const cfg = state.configs[VisualizationType.Count];
    expect(cfg?.complete).toBe(true);
    expect(cfg?.metric).toMatchObject({
      type: DashboardMetricType.IssueDensity,
    });
    expect(cfg?.scope).toBe(CodeScope.Overall);
  });

  it('SET_METRIC_KEY with ISSUE_DENSITY_METRIC_OPTION_VALUE forces Overall scope and clears groupBy on line chart', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.LineChart]: {
          ...createInitialLineChartConfig(),
          groupBy: LineChartGroupBy.Severity,
          scope: CodeScope.New,
        },
      },
      selectedType: VisualizationType.LineChart,
    };
    state = widgetConfigReducer(state, {
      metricKey: ISSUE_DENSITY_METRIC_OPTION_VALUE as unknown as IssueDensityMetricOptionValue,
      type: 'SET_METRIC_KEY',
    });
    const cfg = state.configs[VisualizationType.LineChart];
    expect(cfg?.complete).toBe(true);
    expect(cfg?.metric).toMatchObject({
      type: DashboardMetricType.IssueDensity,
    });
    expect(cfg?.scope).toBe(CodeScope.Overall);
    expect(cfg?.groupBy).toBe(LineChartGroupBy.None);
  });

  it('SET_METRIC_KEY with ISSUE_DENSITY_METRIC_OPTION_VALUE is ignored for rating badge', () => {
    const initial = createInitialRatingBadgeConfig();
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.RatingBadge]: initial,
      },
      selectedType: VisualizationType.RatingBadge,
    };
    state = widgetConfigReducer(state, {
      metricKey: ISSUE_DENSITY_METRIC_OPTION_VALUE as unknown as IssueDensityMetricOptionValue,
      type: 'SET_METRIC_KEY',
    });
    expect(state.configs[VisualizationType.RatingBadge]).toEqual(initial);
  });

  it('SET_METRIC_KEY with SCA MTTR preserves severities and forces line-chart defaults', () => {
    const severityFilters = {
      impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Blocker],
    };
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.LineChart]: {
          complete: true,
          groupBy: LineChartGroupBy.Severity,
          historyRange: HistoryRange.All,
          metric: {
            measureFilters: severityFilters,
            type: DashboardMetricType.ScaResolution,
          },
          scope: CodeScope.New,
          showLegend: true,
        },
      },
      selectedType: VisualizationType.LineChart,
    };

    state = widgetConfigReducer(state, {
      metricKey: SCA_MTTR_METRIC_OPTION_VALUE,
      type: 'SET_METRIC_KEY',
    });

    expect(state.configs[VisualizationType.LineChart]).toMatchObject({
      complete: true,
      groupBy: LineChartGroupBy.None,
      metric: {
        measureFilters: severityFilters,
        type: DashboardMetricType.ScaResolution,
      },
      scope: CodeScope.Overall,
    });
  });

  it('SET_COUNT_MEASURE_FILTERS persists SCA resolution severities', () => {
    let state: WidgetConfigState = {
      configs: {
        [VisualizationType.Count]: {
          complete: true,
          metric: {
            type: DashboardMetricType.ScaResolution,
          },
          scope: CodeScope.Overall,
          showTrendIndicator: true,
        },
      },
      selectedType: VisualizationType.Count,
    };

    state = widgetConfigReducer(state, {
      measureFilters: { impactSeverities: [SoftwareImpactSeverity.Medium] },
      type: 'SET_COUNT_MEASURE_FILTERS',
    });

    expect(state.configs[VisualizationType.Count]?.metric).toMatchObject({
      measureFilters: { impactSeverities: [SoftwareImpactSeverity.Medium] },
      type: DashboardMetricType.ScaResolution,
    });
  });

  it('SET_METRIC_KEY with SCA MTTR is ignored for rating badges', () => {
    const initial = createInitialRatingBadgeConfig();
    const state = widgetConfigReducer(
      {
        configs: { [VisualizationType.RatingBadge]: initial },
        selectedType: VisualizationType.RatingBadge,
      },
      {
        metricKey: SCA_MTTR_METRIC_OPTION_VALUE,
        type: 'SET_METRIC_KEY',
      },
    );

    expect(state.configs[VisualizationType.RatingBadge]).toEqual(initial);
  });
});
