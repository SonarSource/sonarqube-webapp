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

import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../../data/widgets/line-chart';
import {
  DashboardMetricType,
  IssueStatus,
  PieChartHotspotFilter,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartMetric,
  RichMetricKey,
  type MeasureFilters,
} from '../../../../types/dashboard-widget';
import {
  CodeScope,
  TopListLimit,
  VisualizationType,
  type DashboardWidgetType,
} from '../../../../types/widget-common';
import { createInitialPieChartConfig } from '../../widgetConfigInitialState';
import type {
  CountConfig,
  LineChartConfig,
  PieChartConfig,
  RatingBadgeConfig,
  TopListConfig,
  WidgetConfigState,
} from '../../widgetConfigTypes';
import {
  buildDashboardMetricForLineOrCount,
  clampConfigScopeForReducerOptions,
  clampPortfolioPieScopeInWidgetState,
  clearDisabledPieHotspotFiltersInWidgetState,
  createInitialConfigForType,
  getCurrentConfig,
  updateCurrentConfig,
} from '../utils';

describe('widget-creation-modal state reducers utils', () => {
  describe('clampConfigScopeForReducerOptions', () => {
    const lineConfigNewScope: LineChartConfig = {
      complete: true,
      groupBy: LineChartGroupBy.None,
      historyRange: HistoryRange.All,
      metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
      scope: CodeScope.New,
    };

    it('returns config unchanged when options omit supportsNewCodeScopeForMetric', () => {
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.LineChart, lineConfigNewScope, {}),
      ).toBe(lineConfigNewScope);
    });

    it('returns config unchanged when selectedType is null', () => {
      const supports = jest.fn(() => false);
      expect(
        clampConfigScopeForReducerOptions(null, lineConfigNewScope, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toBe(lineConfigNewScope);
      expect(supports).not.toHaveBeenCalled();
    });

    it('returns config unchanged for visualization types that do not support scope clamping', () => {
      const supports = jest.fn(() => false);
      const pieConfig: PieChartConfig = {
        complete: false,
        filter: '',
        metric: null,
        scope: CodeScope.New,
        showLegend: true,
        slice: null,
      };
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.PieChart, pieConfig, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toBe(pieConfig);
      expect(supports).not.toHaveBeenCalled();
    });

    it('returns config unchanged when scope is not New', () => {
      const overall: LineChartConfig = { ...lineConfigNewScope, scope: CodeScope.Overall };
      const supports = jest.fn(() => false);
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.LineChart, overall, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toBe(overall);
      expect(supports).not.toHaveBeenCalled();
    });

    it('returns rating badge config unchanged when metricKey is missing', () => {
      const incomplete: RatingBadgeConfig = {
        complete: false,
        metricKey: null,
        scope: CodeScope.New,
      };
      const supports = jest.fn(() => false);
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.RatingBadge, incomplete, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toBe(incomplete);
      expect(supports).not.toHaveBeenCalled();
    });

    it('returns line chart config unchanged when metric is missing', () => {
      const incomplete: LineChartConfig = {
        complete: false,
        groupBy: LineChartGroupBy.None,
        historyRange: HistoryRange.All,
        metric: null,
        scope: CodeScope.New,
      };
      const supports = jest.fn(() => false);
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.LineChart, incomplete, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toBe(incomplete);
      expect(supports).not.toHaveBeenCalled();
    });

    it('returns count config unchanged when metric is missing', () => {
      const incomplete: CountConfig = {
        complete: false,
        metric: null,
        scope: CodeScope.New,
      };
      const supports = jest.fn(() => false);
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.Count, incomplete, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toBe(incomplete);
      expect(supports).not.toHaveBeenCalled();
    });

    it('keeps New scope when supportsNewCodeScopeForMetric returns true', () => {
      const supports = jest.fn(() => true);
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.LineChart, lineConfigNewScope, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toEqual(lineConfigNewScope);
      expect(supports).toHaveBeenCalledWith(MetricKey.ncloc, VisualizationType.LineChart);
    });

    it('falls back to Overall when supportsNewCodeScopeForMetric returns false (line chart)', () => {
      const supports = jest.fn(() => false);
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.LineChart, lineConfigNewScope, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toEqual({ ...lineConfigNewScope, scope: CodeScope.Overall });
    });

    it('falls back to Overall when supportsNewCodeScopeForMetric returns false (rating badge)', () => {
      const rating: RatingBadgeConfig = {
        complete: true,
        metricKey: MetricKey.reliability_rating,
        scope: CodeScope.New,
      };
      const supports = jest.fn(() => false);
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.RatingBadge, rating, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toEqual({ ...rating, scope: CodeScope.Overall });
      expect(supports).toHaveBeenCalledWith(
        MetricKey.reliability_rating,
        VisualizationType.RatingBadge,
      );
    });

    it('returns top list config unchanged when scope is not New', () => {
      const topList: TopListConfig = {
        complete: true,
        limit: TopListLimit.Five,
        metric: null,
        rankBy: null,
        scope: CodeScope.Overall,
      };
      const supports = jest.fn(() => false);
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.TopList, topList, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toBe(topList);
      expect(supports).not.toHaveBeenCalled();
    });

    it('keeps New scope for top list when supportsNewCodeScopeForMetric returns true', () => {
      const topList: TopListConfig = {
        complete: true,
        limit: TopListLimit.Five,
        metric: null,
        rankBy: null,
        scope: CodeScope.New,
      };
      const supports = jest.fn(() => true);
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.TopList, topList, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toEqual(topList);
      expect(supports).toHaveBeenCalledWith(MetricKey.violations, VisualizationType.TopList);
    });

    it('falls back to Overall for top list when supportsNewCodeScopeForMetric returns false', () => {
      const topList: TopListConfig = {
        complete: true,
        limit: TopListLimit.Five,
        metric: null,
        rankBy: null,
        scope: CodeScope.New,
      };
      const supports = jest.fn(() => false);
      expect(
        clampConfigScopeForReducerOptions(VisualizationType.TopList, topList, {
          supportsNewCodeScopeForMetric: supports,
        }),
      ).toEqual({ ...topList, scope: CodeScope.Overall });
      expect(supports).toHaveBeenCalledWith(MetricKey.violations, VisualizationType.TopList);
    });
  });

  describe('buildDashboardMetricForLineOrCount', () => {
    const filters: MeasureFilters = { issueStatus: IssueStatus.Open };

    it('returns rich Issues metric when capability is drillable', () => {
      expect(
        buildDashboardMetricForLineOrCount(
          MetricKey.violations,
          {
            isDrillable: true,
            supportsSeverityFilter: true,
            supportsSoftwareQualityFilter: true,
            supportsStatusFilter: true,
          },
          filters,
          false,
        ),
      ).toEqual({
        measureFilters: filters,
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      });
    });

    it('returns rich Hotspots metric for portfolio security_hotspots when enabled', () => {
      expect(
        buildDashboardMetricForLineOrCount(
          MetricKey.security_hotspots,
          {
            isDrillable: false,
            supportsSeverityFilter: false,
            supportsSoftwareQualityFilter: false,
            supportsStatusFilter: false,
          },
          filters,
          true,
        ),
      ).toEqual({
        measureFilters: filters,
        metricKey: RichMetricKey.Hotspots,
        type: DashboardMetricType.Rich,
      });
    });

    it('returns raw metric when not drillable and not portfolio security_hotspots case', () => {
      expect(
        buildDashboardMetricForLineOrCount(
          MetricKey.ncloc,
          {
            isDrillable: false,
            supportsSeverityFilter: false,
            supportsSoftwareQualityFilter: false,
            supportsStatusFilter: false,
          },
          filters,
          true,
        ),
      ).toEqual({
        metricKey: MetricKey.ncloc,
        type: DashboardMetricType.Raw,
      });
    });

    it('returns raw security_hotspots when portfolio hotspots flag is off', () => {
      expect(
        buildDashboardMetricForLineOrCount(
          MetricKey.security_hotspots,
          {
            isDrillable: false,
            supportsSeverityFilter: false,
            supportsSoftwareQualityFilter: false,
            supportsStatusFilter: false,
          },
          undefined,
          false,
        ),
      ).toEqual({
        metricKey: MetricKey.security_hotspots,
        type: DashboardMetricType.Raw,
      });
    });
  });

  describe('getCurrentConfig', () => {
    it('returns undefined when no widget type is selected', () => {
      const state: WidgetConfigState = { configs: {}, selectedType: null };
      expect(getCurrentConfig(state)).toBeUndefined();
    });

    it('returns the active config for the selected type', () => {
      const count: CountConfig = {
        complete: false,
        metric: null,
        scope: CodeScope.Overall,
      };
      const state: WidgetConfigState = {
        configs: { [VisualizationType.Count]: count },
        selectedType: VisualizationType.Count,
      };
      expect(getCurrentConfig(state)).toBe(count);
    });
  });

  describe('updateCurrentConfig', () => {
    it('returns the same state when no widget type is selected', () => {
      const state: WidgetConfigState = { configs: {}, selectedType: null };
      expect(updateCurrentConfig(state, (c) => c)).toBe(state);
    });

    it('returns the same state when the active config is missing', () => {
      const state: WidgetConfigState = {
        configs: {},
        selectedType: VisualizationType.Count,
      };
      expect(updateCurrentConfig(state, (c) => c)).toBe(state);
    });

    it('updates only the selected slot for count widgets', () => {
      const state: WidgetConfigState = {
        configs: {
          [VisualizationType.Count]: {
            complete: false,
            metric: null,
            scope: CodeScope.Overall,
          },
        },
        selectedType: VisualizationType.Count,
      };
      const next = updateCurrentConfig(state, () => ({
        complete: true,
        metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
        scope: CodeScope.New,
      }));
      expect(next.configs[VisualizationType.Count]?.scope).toBe(CodeScope.New);
    });

    it('updates pie and donut configs together when editing pie', () => {
      const pie: PieChartConfig = {
        ...createInitialPieChartConfig(),
        metric: PieChartMetric.IssueCount,
        slice: PieChartIssueSlice.ImpactSeverities,
        scope: CodeScope.New,
      };
      const state: WidgetConfigState = {
        configs: {
          [VisualizationType.PieChart]: pie,
          [VisualizationType.DonutChart]: pie,
        },
        selectedType: VisualizationType.PieChart,
      };
      const next = updateCurrentConfig(state, (c) => ({
        ...(c as PieChartConfig),
        scope: CodeScope.Overall,
      }));
      expect(next.configs[VisualizationType.PieChart]?.scope).toBe(CodeScope.Overall);
      expect(next.configs[VisualizationType.DonutChart]?.scope).toBe(CodeScope.Overall);
    });
  });

  describe('createInitialConfigForType', () => {
    it('creates line chart defaults', () => {
      const config = createInitialConfigForType(VisualizationType.LineChart);
      expect(config).toMatchObject({
        complete: false,
        metric: null,
        historyRange: HistoryRange.Last12Months,
      });
    });

    it('creates count, rating, pie, and donut configs', () => {
      expect(createInitialConfigForType(VisualizationType.Count)).toMatchObject({
        complete: false,
        metric: null,
      });
      expect(createInitialConfigForType(VisualizationType.RatingBadge)).toMatchObject({
        complete: false,
        metricKey: null,
      });
      expect(createInitialConfigForType(VisualizationType.PieChart)).toMatchObject({
        complete: false,
        metric: null,
        slice: null,
      });
      expect(createInitialConfigForType(VisualizationType.DonutChart)).toMatchObject({
        complete: false,
        metric: null,
      });
    });

    it('falls back to count config for unknown visualization keys', () => {
      const config = createInitialConfigForType('unknown' as DashboardWidgetType);
      expect(config).toEqual(
        expect.objectContaining({
          complete: false,
          metric: null,
          scope: CodeScope.Overall,
        }),
      );
    });
  });

  describe('clampPortfolioPieScopeInWidgetState', () => {
    const pieNewScope: PieChartConfig = {
      ...createInitialPieChartConfig(),
      scope: CodeScope.New,
    };

    it('does nothing when not in portfolio widget configurator mode', () => {
      const state: WidgetConfigState = {
        configs: { [VisualizationType.PieChart]: pieNewScope },
        selectedType: VisualizationType.PieChart,
      };
      expect(clampPortfolioPieScopeInWidgetState(state, {})).toBe(state);
    });

    it('does nothing when the selected visualization is not pie or donut', () => {
      const state: WidgetConfigState = {
        configs: {
          [VisualizationType.Count]: {
            complete: false,
            metric: null,
            scope: CodeScope.New,
          },
        },
        selectedType: VisualizationType.Count,
      };
      expect(
        clampPortfolioPieScopeInWidgetState(state, { isPortfolioWidgetConfigurator: true }),
      ).toBe(state);
    });

    it('does nothing when pie and donut configs are absent', () => {
      const state: WidgetConfigState = {
        configs: {},
        selectedType: VisualizationType.PieChart,
      };
      expect(
        clampPortfolioPieScopeInWidgetState(state, { isPortfolioWidgetConfigurator: true }),
      ).toBe(state);
    });

    it('does nothing when pie scope is already overall', () => {
      const pie: PieChartConfig = { ...createInitialPieChartConfig(), scope: CodeScope.Overall };
      const state: WidgetConfigState = {
        configs: { [VisualizationType.PieChart]: pie },
        selectedType: VisualizationType.PieChart,
      };
      expect(
        clampPortfolioPieScopeInWidgetState(state, { isPortfolioWidgetConfigurator: true }),
      ).toBe(state);
    });

    it('clamps new-code scope to overall for portfolio pie widgets', () => {
      const state: WidgetConfigState = {
        configs: {
          [VisualizationType.PieChart]: pieNewScope,
          [VisualizationType.DonutChart]: pieNewScope,
        },
        selectedType: VisualizationType.PieChart,
      };
      const next = clampPortfolioPieScopeInWidgetState(state, {
        isPortfolioWidgetConfigurator: true,
      });
      expect(next.configs[VisualizationType.PieChart]?.scope).toBe(CodeScope.Overall);
      expect(next.configs[VisualizationType.DonutChart]?.scope).toBe(CodeScope.Overall);
    });
  });

  describe('clearDisabledPieHotspotFiltersInWidgetState', () => {
    it('returns the same state when no hotspot filter is set', () => {
      const pie: PieChartConfig = {
        ...createInitialPieChartConfig(),
        complete: true,
        metric: PieChartMetric.HotspotCount,
        slice: PieChartHotspotSlice.ReviewPriority,
        filter: '',
      };
      const state: WidgetConfigState = {
        configs: { [VisualizationType.PieChart]: pie },
        selectedType: VisualizationType.PieChart,
      };
      expect(clearDisabledPieHotspotFiltersInWidgetState(state)).toBe(state);
    });

    it('keeps hotspot filter on priority slice', () => {
      const pie: PieChartConfig = {
        ...createInitialPieChartConfig(),
        complete: true,
        metric: PieChartMetric.HotspotCount,
        slice: PieChartHotspotSlice.ReviewPriority,
        filter: PieChartHotspotFilter.ToReview,
      };
      const state: WidgetConfigState = {
        configs: { [VisualizationType.PieChart]: pie },
        selectedType: VisualizationType.PieChart,
      };
      expect(clearDisabledPieHotspotFiltersInWidgetState(state)).toBe(state);
    });

    it('clears filter on pie and donut configs for hotspot review status slice', () => {
      const pie: PieChartConfig = {
        ...createInitialPieChartConfig(),
        complete: true,
        metric: PieChartMetric.HotspotCount,
        slice: PieChartHotspotSlice.ReviewStatus,
        filter: PieChartHotspotFilter.ToReview,
      };
      const state: WidgetConfigState = {
        configs: {
          [VisualizationType.PieChart]: pie,
          [VisualizationType.DonutChart]: { ...pie },
        },
        selectedType: VisualizationType.PieChart,
      };
      const next = clearDisabledPieHotspotFiltersInWidgetState(state);
      expect(next.configs[VisualizationType.PieChart]?.filter).toBe('');
      expect(next.configs[VisualizationType.DonutChart]?.filter).toBe('');
    });
  });
});
