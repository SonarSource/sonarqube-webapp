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
  RichMetricKey,
} from '../../../../types/dashboard-widget';
import { CodeScope, VisualizationType } from '../../../../types/widget-common';
import {
  createInitialCountConfig,
  createInitialLineChartConfig,
} from '../../widgetConfigInitialState';
import type { LineChartConfig, WidgetConfigState } from '../../widgetConfigTypes';
import {
  handleSetHistoryRange,
  handleSetLineChartGroupBy,
  handleSetLineChartMeasureFilters,
  handleSetShowLegendLinechart,
} from '../widgetConfigReducerLineChart';

describe('widgetConfigReducerLineChart', () => {
  describe('handleSetHistoryRange', () => {
    it('updates history range when line chart is selected', () => {
      const state: WidgetConfigState = {
        configs: { [VisualizationType.LineChart]: createInitialLineChartConfig() },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetHistoryRange(state, {
        historyRange: HistoryRange.LastMonth,
        type: 'SET_HISTORY_RANGE',
      });
      expect(next.configs[VisualizationType.LineChart]?.historyRange).toBe(HistoryRange.LastMonth);
    });

    it('returns the same state when line chart is not selected', () => {
      const state: WidgetConfigState = {
        configs: { [VisualizationType.Count]: createInitialCountConfig() },
        selectedType: VisualizationType.Count,
      };
      const next = handleSetHistoryRange(state, {
        historyRange: HistoryRange.LastMonth,
        type: 'SET_HISTORY_RANGE',
      });
      expect(next).toBe(state);
    });
  });

  describe('handleSetShowLegendLinechart', () => {
    it('updates show legend when line chart is selected', () => {
      const state: WidgetConfigState = {
        configs: { [VisualizationType.LineChart]: createInitialLineChartConfig() },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetShowLegendLinechart(state, {
        showLegend: true,
        type: 'SET_SHOW_LEGEND_LINECHART',
      });
      expect(next.configs[VisualizationType.LineChart]?.showLegend).toBe(true);
    });

    it('returns the same state when line chart is not selected', () => {
      const state: WidgetConfigState = {
        configs: { [VisualizationType.Count]: createInitialCountConfig() },
        selectedType: VisualizationType.Count,
      };
      const next = handleSetShowLegendLinechart(state, {
        showLegend: true,
        type: 'SET_SHOW_LEGEND_LINECHART',
      });
      expect(next).toBe(state);
    });
  });

  describe('handleSetLineChartMeasureFilters', () => {
    it('stores measure filters on incomplete line chart configs', () => {
      const state: WidgetConfigState = {
        configs: { [VisualizationType.LineChart]: createInitialLineChartConfig() },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetLineChartMeasureFilters(state, {
        measureFilters: { issueStatus: IssueStatus.Accepted },
        type: 'SET_LINE_CHART_MEASURE_FILTERS',
      });
      expect(
        (
          next.configs[VisualizationType.LineChart] as {
            measureFilters?: { issueStatus: IssueStatus };
          }
        ).measureFilters,
      ).toEqual({ issueStatus: IssueStatus.Accepted });
    });

    it('merges measure filters into a complete rich line chart metric', () => {
      const state: WidgetConfigState = {
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
      const next = handleSetLineChartMeasureFilters(state, {
        measureFilters: { issueStatus: IssueStatus.Accepted },
        type: 'SET_LINE_CHART_MEASURE_FILTERS',
      });
      const line = next.configs[VisualizationType.LineChart] as LineChartConfig & {
        complete: true;
      };
      expect(line.metric).toMatchObject({
        measureFilters: { issueStatus: IssueStatus.Accepted },
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      });
    });

    it('preserves status, software quality, and severities', () => {
      const state: WidgetConfigState = {
        configs: {
          [VisualizationType.LineChart]: {
            complete: true,
            groupBy: LineChartGroupBy.None,
            historyRange: HistoryRange.All,
            metric: {
              measureFilters: {},
              metricKey: RichMetricKey.Issues,
              type: DashboardMetricType.Rich,
            },
            scope: CodeScope.Overall,
            showLegend: false,
          },
        },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetLineChartMeasureFilters(state, {
        measureFilters: {
          impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Blocker],
          impactSoftwareQuality: SoftwareQuality.Security,
          issueStatus: IssueStatus.Open,
        },
        type: 'SET_LINE_CHART_MEASURE_FILTERS',
      });
      const mf = (
        next.configs[VisualizationType.LineChart] as { metric: { measureFilters: object } }
      ).metric.measureFilters;
      expect(mf).toEqual({
        impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Blocker],
        impactSoftwareQuality: SoftwareQuality.Security,
        issueStatus: IssueStatus.Open,
      });
    });

    it('returns the same state when line chart is not selected', () => {
      const state: WidgetConfigState = {
        configs: { [VisualizationType.Count]: createInitialCountConfig() },
        selectedType: VisualizationType.Count,
      };
      const next = handleSetLineChartMeasureFilters(state, {
        measureFilters: { issueStatus: IssueStatus.Open },
        type: 'SET_LINE_CHART_MEASURE_FILTERS',
      });
      expect(next).toBe(state);
    });

    it('does not attach measure filters to a complete raw line chart metric', () => {
      const lineConfig: LineChartConfig = {
        complete: true,
        groupBy: LineChartGroupBy.None,
        historyRange: HistoryRange.All,
        metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
        scope: CodeScope.Overall,
        showLegend: false,
      };
      const state: WidgetConfigState = {
        configs: { [VisualizationType.LineChart]: lineConfig },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetLineChartMeasureFilters(state, {
        measureFilters: { issueStatus: IssueStatus.Open },
        type: 'SET_LINE_CHART_MEASURE_FILTERS',
      });
      expect(next.configs[VisualizationType.LineChart]).toEqual(lineConfig);
    });

    it('clamps scope to Overall when reducer options disallow New code for the resolved metric', () => {
      const state: WidgetConfigState = {
        configs: {
          [VisualizationType.LineChart]: {
            complete: true,
            groupBy: LineChartGroupBy.None,
            historyRange: HistoryRange.All,
            metric: {
              measureFilters: {},
              metricKey: RichMetricKey.Issues,
              type: DashboardMetricType.Rich,
            },
            scope: CodeScope.New,
            showLegend: false,
          },
        },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetLineChartMeasureFilters(
        state,
        {
          measureFilters: { issueStatus: IssueStatus.Open },
          type: 'SET_LINE_CHART_MEASURE_FILTERS',
        },
        {
          supportsNewCodeScopeForMetric: () => false,
        },
      );
      expect(next.configs[VisualizationType.LineChart]).toMatchObject({
        scope: CodeScope.Overall,
      });
    });
  });

  describe('handleSetLineChartGroupBy', () => {
    it('returns the same state when line chart is not selected', () => {
      const state: WidgetConfigState = {
        configs: { [VisualizationType.Count]: createInitialCountConfig() },
        selectedType: VisualizationType.Count,
      };
      const next = handleSetLineChartGroupBy(state, {
        groupBy: LineChartGroupBy.Severity,
        type: 'SET_LINE_CHART_GROUP_BY',
      });
      expect(next).toBe(state);
    });

    it('sets groupBy on an incomplete line chart config and clears the conflicting measure filter', () => {
      const incompleteConfig: LineChartConfig = {
        complete: false,
        groupBy: LineChartGroupBy.None,
        historyRange: HistoryRange.All,
        measureFilters: {
          impactSeverities: [SoftwareImpactSeverity.High],
          issueStatus: IssueStatus.Open,
        },
        metric: null,
        scope: CodeScope.Overall,
        showLegend: false,
      };
      const state: WidgetConfigState = {
        configs: { [VisualizationType.LineChart]: incompleteConfig },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetLineChartGroupBy(state, {
        groupBy: LineChartGroupBy.Severity,
        type: 'SET_LINE_CHART_GROUP_BY',
      });
      const lineConfig = next.configs[VisualizationType.LineChart] as LineChartConfig & {
        complete: false;
      };
      expect(lineConfig.groupBy).toBe(LineChartGroupBy.Severity);
      expect(lineConfig.measureFilters).toMatchObject({
        impactSeverities: undefined,
        issueStatus: IssueStatus.Open,
      });
    });

    it('clears issueStatus when switching to the Status group', () => {
      const incompleteConfig: LineChartConfig = {
        complete: false,
        groupBy: LineChartGroupBy.None,
        historyRange: HistoryRange.All,
        measureFilters: { issueStatus: IssueStatus.Open },
        metric: null,
        scope: CodeScope.Overall,
        showLegend: false,
      };
      const state: WidgetConfigState = {
        configs: { [VisualizationType.LineChart]: incompleteConfig },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetLineChartGroupBy(state, {
        groupBy: LineChartGroupBy.Status,
        type: 'SET_LINE_CHART_GROUP_BY',
      });
      const lineConfig = next.configs[VisualizationType.LineChart] as LineChartConfig & {
        complete: false;
      };
      expect(lineConfig.measureFilters?.issueStatus).toBeUndefined();
    });

    it('clears impactSoftwareQuality when switching to the SoftwareQuality group', () => {
      const incompleteConfig: LineChartConfig = {
        complete: false,
        groupBy: LineChartGroupBy.None,
        historyRange: HistoryRange.All,
        measureFilters: { impactSoftwareQuality: SoftwareQuality.Reliability },
        metric: null,
        scope: CodeScope.Overall,
        showLegend: false,
      };
      const state: WidgetConfigState = {
        configs: { [VisualizationType.LineChart]: incompleteConfig },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetLineChartGroupBy(state, {
        groupBy: LineChartGroupBy.SoftwareQuality,
        type: 'SET_LINE_CHART_GROUP_BY',
      });
      const lineConfig = next.configs[VisualizationType.LineChart] as LineChartConfig & {
        complete: false;
      };
      expect(lineConfig.measureFilters?.impactSoftwareQuality).toBeUndefined();
    });

    it('merges groupBy into a complete Rich-Issues config and clears the conflicting filter on metric.measureFilters', () => {
      const state: WidgetConfigState = {
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
      const next = handleSetLineChartGroupBy(state, {
        groupBy: LineChartGroupBy.Status,
        type: 'SET_LINE_CHART_GROUP_BY',
      });
      const lineConfig = next.configs[VisualizationType.LineChart] as LineChartConfig & {
        complete: true;
      };
      expect(lineConfig.groupBy).toBe(LineChartGroupBy.Status);
      expect(lineConfig.metric).toMatchObject({
        measureFilters: { issueStatus: undefined },
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      });
    });

    it('sets groupBy on a complete Raw metric config and enables the legend by default', () => {
      const lineConfig: LineChartConfig = {
        complete: true,
        groupBy: LineChartGroupBy.None,
        historyRange: HistoryRange.All,
        metric: { metricKey: MetricKey.violations, type: DashboardMetricType.Raw },
        scope: CodeScope.Overall,
        showLegend: false,
      };
      const state: WidgetConfigState = {
        configs: { [VisualizationType.LineChart]: lineConfig },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetLineChartGroupBy(state, {
        groupBy: LineChartGroupBy.Severity,
        type: 'SET_LINE_CHART_GROUP_BY',
      });
      expect(next.configs[VisualizationType.LineChart]).toEqual({
        ...lineConfig,
        groupBy: LineChartGroupBy.Severity,
        showLegend: true,
      });
    });

    it('preserves an explicit showLegend=false when switching between active groupBy values', () => {
      const lineConfig: LineChartConfig = {
        complete: true,
        groupBy: LineChartGroupBy.Severity,
        historyRange: HistoryRange.All,
        metric: { metricKey: MetricKey.violations, type: DashboardMetricType.Raw },
        scope: CodeScope.Overall,
        showLegend: false,
      };
      const state: WidgetConfigState = {
        configs: { [VisualizationType.LineChart]: lineConfig },
        selectedType: VisualizationType.LineChart,
      };
      const next = handleSetLineChartGroupBy(state, {
        groupBy: LineChartGroupBy.Status,
        type: 'SET_LINE_CHART_GROUP_BY',
      });
      expect(next.configs[VisualizationType.LineChart]).toMatchObject({
        groupBy: LineChartGroupBy.Status,
        showLegend: false,
      });
    });
  });
});
