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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import {
  DashboardMetricType,
  PieChartIssueSlice,
  PieChartMetric,
  RichMetricKey,
} from '../../../types/dashboard-widget';
import { CodeScope, VisualizationType } from '../../../types/widget-common';
import type { WidgetConfigState } from '../../state/widgetConfigTypes';
import { CustomizeVisualizationAccordion } from '../CustomizeVisualizationAccordion';
import { createTestAccordion } from './accordionTestUtils';

describe('CustomizeVisualizationAccordion', () => {
  const Accordion = createTestAccordion();

  it('shows the warning when no visualization is configured', () => {
    renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={jest.fn()}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={{ configs: {}, selectedType: null }}
      />,
    );

    expect(
      screen.getByText('dashboard.add_widget_modal.customize_visualization.warning'),
    ).toBeInTheDocument();
  });

  it('shows breakdown checkbox for quality gate badge metric', async () => {
    renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={jest.fn()}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={{
          configs: {
            ratingBadge: {
              complete: true,
              metricKey: MetricKey.alert_status,
              scope: CodeScope.Overall,
              showBreakdown: false,
            },
          },
          selectedType: VisualizationType.RatingBadge,
        }}
      />,
    );

    expect(
      await screen.findByText(
        'dashboard.add_widget_modal.customize_visualization.checkbox.show_breakdown.header',
      ),
    ).toBeInTheDocument();
  });

  it('toggles pie legend via SET_PIE_SHOW_LEGEND', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: true,
          filter: '',
          metric: PieChartMetric.IssueCount,
          scope: CodeScope.Overall,
          showLegend: false,
          slice: PieChartIssueSlice.ImpactSeverities,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    const { user } = renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={dispatch}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('checkbox', {
        name: 'dashboard.add_widget_modal.customize_visualization.checkbox.show_legend',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      showLegend: true,
      type: 'SET_PIE_SHOW_LEGEND',
    });
  });

  it('toggles line chart legend via SET_SHOW_LEGEND_LINECHART', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        lineChart: {
          complete: true,
          groupBy: LineChartGroupBy.None,
          historyRange: HistoryRange.All,
          metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
          scope: CodeScope.Overall,
          showLegend: false,
        },
      },
      selectedType: VisualizationType.LineChart,
    };
    const { user } = renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={dispatch}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('checkbox', {
        name: 'dashboard.add_widget_modal.customize_visualization.checkbox.show_legend',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      showLegend: true,
      type: 'SET_SHOW_LEGEND_LINECHART',
    });
  });

  it('shows the legend checkbox for a grouped line chart so the user can toggle it off', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        lineChart: {
          complete: true,
          groupBy: LineChartGroupBy.Severity,
          historyRange: HistoryRange.All,
          metric: {
            measureFilters: {},
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          scope: CodeScope.Overall,
          showLegend: true,
        },
      },
      selectedType: VisualizationType.LineChart,
    };
    const { user } = renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={dispatch}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {
      name: 'dashboard.add_widget_modal.customize_visualization.checkbox.show_legend',
    });
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(dispatch).toHaveBeenCalledWith({
      showLegend: false,
      type: 'SET_SHOW_LEGEND_LINECHART',
    });
  });

  it('toggles count trend via SET_SHOW_TREND_INDICATOR for raw metrics', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        count: {
          complete: true,
          metric: {
            metricKey: MetricKey.coverage,
            type: DashboardMetricType.Raw,
          },
          scope: CodeScope.Overall,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    const { user } = renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={dispatch}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('checkbox', {
        name: 'dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      showTrendIndicator: true,
      type: 'SET_SHOW_TREND_INDICATOR',
    });
  });

  it('disables trend checkbox for new-code issue count metrics', () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        count: {
          complete: true,
          metric: {
            measureFilters: {},
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          scope: CodeScope.New,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={dispatch}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('checkbox', {
        name: 'dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator',
      }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('enables trend checkbox for overall issue count metrics', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        count: {
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
    const { user: routerUser } = renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={dispatch}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await routerUser.click(
      screen.getByRole('checkbox', {
        name: 'dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      showTrendIndicator: true,
      type: 'SET_SHOW_TREND_INDICATOR',
    });
  });

  it('keeps trend checkbox enabled on New code scope for raw count metrics', async () => {
    const user = userEvent.setup();
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        count: {
          complete: true,
          metric: {
            metricKey: MetricKey.coverage,
            type: DashboardMetricType.Raw,
          },
          scope: CodeScope.New,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={dispatch}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('checkbox', {
        name: 'dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      showTrendIndicator: true,
      type: 'SET_SHOW_TREND_INDICATOR',
    });
  });

  it('shows portfolio breakdown checkbox when eligible', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        ratingBadge: {
          complete: true,
          metricKey: MetricKey.reliability_rating,
          scope: CodeScope.Overall,
          showBreakdown: false,
        },
      },
      selectedType: VisualizationType.RatingBadge,
    };
    const { user } = renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={dispatch}
        isRatingBadgeBreakdownEligibleForMetric={(key) => key === MetricKey.reliability_rating}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('checkbox', {
        name: 'dashboard.add_widget_modal.customize_visualization.checkbox.show_legend',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      showBreakdown: true,
      type: 'SET_SHOW_BREAKDOWN',
    });
  });

  it('shows top list info message instead of the generic warning when top list is selected', () => {
    renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={jest.fn()}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={{
          configs: {
            topList: {
              complete: false,
              limit: 5,
              metric: null,
              rankBy: null,
              scope: CodeScope.Overall,
            },
          },
          selectedType: VisualizationType.TopList,
        }}
      />,
    );

    expect(
      screen.getByText('dashboard.add_widget_modal.customize_visualization.top_list_info'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('dashboard.add_widget_modal.customize_visualization.warning'),
    ).not.toBeInTheDocument();
  });

  it('shows rating badge info when breakdown is not available', () => {
    renderWithRouter(
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen
        dispatch={jest.fn()}
        isRatingBadgeBreakdownEligibleForMetric={() => false}
        setCustomizeVisualizationAccordionOpen={jest.fn()}
        state={{
          configs: {
            ratingBadge: {
              complete: true,
              metricKey: MetricKey.reliability_rating,
              scope: CodeScope.Overall,
              showBreakdown: false,
            },
          },
          selectedType: VisualizationType.RatingBadge,
        }}
      />,
    );

    expect(
      screen.getByText('dashboard.add_widget_modal.customize_visualization.rating_badge_info'),
    ).toBeInTheDocument();
  });
});
