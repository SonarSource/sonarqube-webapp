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
import type { IntlShape } from 'react-intl';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import {
  DashboardMetricType,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartProjectSlice,
  RichMetricKey,
} from '../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import {
  CodeScope,
  SCA_MTTR_METRIC_OPTION_VALUE,
  TopListLimit,
  TopListMetric,
  TopListRankBy,
  VisualizationType,
  type WidgetMetricPickerOptions,
} from '../../../types/widget-common';
import type { WidgetConfigState } from '../../state/widgetConfigTypes';
import { buildPortfolioPieChartMetricSelectOptions } from '../../utils/pieChartMetricSelectOptions';
import * as topListDefineWidgetHelpers from '../../utils/topListDefineWidgetHelpers';
import { DefineWidgetAccordion } from '../DefineWidgetAccordion';
import { createTestAccordion } from './accordionTestUtils';

describe('DefineWidgetAccordion', () => {
  const Accordion = createTestAccordion();
  const metricPickerOptions: WidgetMetricPickerOptions = {
    countMetrics: [
      {
        group: 'g',
        items: [
          { label: 'N', value: MetricKey.ncloc },
          { label: 'H', value: MetricKey.security_hotspots },
        ],
      },
    ],
    lineChartMetrics: [{ group: 'g', items: [{ label: 'L', value: MetricKey.violations }] }],
    ratingBadgeMetrics: [
      { group: 'g', items: [{ label: 'R', value: MetricKey.reliability_rating }] },
    ],
  };

  const metricPickerOptionsWithNewWidgets: WidgetMetricPickerOptions = {
    ...metricPickerOptions,
    enableNewDashboardWidgets: true,
  };

  it('renders define-widget description and documentation link', () => {
    renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={{ configs: {}, selectedType: null }}
      />,
    );

    expect(
      screen.getByText('dashboard.add_widget_modal.define_widget.description'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'dashboard.add_widget_modal.define_widget.description_link open_in_new_tab',
      }),
    ).toHaveAttribute('href', 'https://docs.example.com/widgets');
  });

  it('dispatches SET_WIDGET_TYPE when selecting Top list visualization', async () => {
    const dispatch = jest.fn();
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={dispatch}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptionsWithNewWidgets}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={{ configs: {}, selectedType: null }}
      />,
    );

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.define_widget.visualization',
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.visualization.top_list',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.TopList,
    });
  });

  it('hides Top list when enableNewDashboardWidgets is false', async () => {
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={{ configs: {}, selectedType: null }}
      />,
    );

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.define_widget.visualization',
      }),
    );

    expect(
      screen.queryByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.visualization.top_list',
      }),
    ).not.toBeInTheDocument();
  });

  it('auto-selects issue count metric and rule rank-by for Top list', async () => {
    const dispatch = jest.fn();
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={dispatch}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptionsWithNewWidgets}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={{ configs: {}, selectedType: null }}
      />,
    );

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.define_widget.visualization',
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.visualization.top_list',
      }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      metric: TopListMetric.IssueCount,
      type: 'SET_TOP_LIST_METRIC',
    });
    expect(dispatch).toHaveBeenCalledWith({
      rankBy: TopListRankBy.Rule,
      type: 'SET_TOP_LIST_RANK_BY',
    });
    expect(dispatch).toHaveBeenCalledWith({
      limit: TopListLimit.Five,
      type: 'SET_TOP_LIST_LIMIT',
    });
  });

  it('shows limit select with Top 5 when that is the only UI option', () => {
    const state: WidgetConfigState = {
      configs: {
        topList: {
          complete: true,
          limit: TopListLimit.Five,
          measureFilters: undefined,
          metric: TopListMetric.IssueCount,
          rankBy: TopListRankBy.Rule,
          scope: CodeScope.Overall,
        },
      },
      selectedType: VisualizationType.TopList,
    };

    renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptionsWithNewWidgets}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.define_widget.top_list.limit',
      }),
    ).toBeInTheDocument();
  });

  it('shows top list selected icon when Top list is the active visualization', () => {
    const state: WidgetConfigState = {
      configs: {
        topList: {
          complete: true,
          limit: TopListLimit.Five,
          measureFilters: undefined,
          metric: TopListMetric.IssueCount,
          rankBy: TopListRankBy.Rule,
          scope: CodeScope.Overall,
        },
      },
      selectedType: VisualizationType.TopList,
    };

    renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptionsWithNewWidgets}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(screen.getByTestId('visualization-selected-icon-top-list')).toBeInTheDocument();
  });

  it('dispatches top list metric and rank-by updates from define-widget selects', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        topList: {
          complete: false,
          limit: TopListLimit.Five,
          measureFilters: undefined,
          metric: null,
          rankBy: null,
          scope: CodeScope.Overall,
        },
      },
      selectedType: VisualizationType.TopList,
    };
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={dispatch}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptionsWithNewWidgets}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.metric' }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.metric.issue_count',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      metric: TopListMetric.IssueCount,
      type: 'SET_TOP_LIST_METRIC',
    });

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.define_widget.top_list.rank_by',
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.top_list.column.rank_by.rule',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      rankBy: TopListRankBy.Rule,
      type: 'SET_TOP_LIST_RANK_BY',
    });
  });

  it('dispatches SET_TOP_LIST_LIMIT when multiple limit options are available', async () => {
    jest.spyOn(topListDefineWidgetHelpers, 'buildTopListLimitSelectOptions').mockReturnValue([
      { label: '5 items', value: '5' },
      { label: '10 items', value: '10' },
    ]);

    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        topList: {
          complete: true,
          limit: TopListLimit.Five,
          measureFilters: undefined,
          metric: TopListMetric.IssueCount,
          rankBy: TopListRankBy.Rule,
          scope: CodeScope.Overall,
        },
      },
      selectedType: VisualizationType.TopList,
    };
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={dispatch}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptionsWithNewWidgets}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.define_widget.top_list.limit',
      }),
    );
    await user.click(await screen.findByRole('option', { name: '10 items' }));

    expect(dispatch).toHaveBeenCalledWith({
      limit: TopListLimit.Ten,
      type: 'SET_TOP_LIST_LIMIT',
    });

    jest.restoreAllMocks();
  });

  it('shows Top list in visualization picker for portfolio dashboards', async () => {
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator
        metricPickerOptions={metricPickerOptionsWithNewWidgets}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={{ configs: {}, selectedType: null }}
      />,
    );

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.define_widget.visualization',
      }),
    );

    expect(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.visualization.top_list',
      }),
    ).toBeInTheDocument();
  });

  it('dispatches SET_WIDGET_TYPE when changing visualization', async () => {
    const dispatch = jest.fn();
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={dispatch}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={{ configs: {}, selectedType: null }}
      />,
    );

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.define_widget.visualization',
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.visualization.line_chart',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_WIDGET_TYPE',
      widgetType: VisualizationType.LineChart,
    });
  });

  it('dispatches SET_PIE_METRIC when selecting pie metric', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: false,
          filter: '',
          metric: null,
          scope: CodeScope.Overall,
          showLegend: true,
          slice: null,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={dispatch}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.metric' }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.metric.issue_count',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      metric: PieChartMetric.IssueCount,
      type: 'SET_PIE_METRIC',
    });
  });

  it('dispatches SET_PIE_SLICE when slice select is shown', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: false,
          filter: '',
          metric: PieChartMetric.IssueCount,
          scope: CodeScope.Overall,
          showLegend: true,
          slice: null,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={dispatch}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.slice_by' }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.slice.by_severity',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      slice: PieChartIssueSlice.ImpactSeverities,
      type: 'SET_PIE_SLICE',
    });
  });

  it('omits attribute and language slices for portfolio issue pie', async () => {
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: true,
          filter: '',
          metric: PieChartMetric.IssueCount,
          scope: CodeScope.Overall,
          showLegend: true,
          slice: PieChartIssueSlice.ImpactSeverities,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.slice_by' }),
    );
    await screen.findByRole('listbox');
    expect(
      screen.queryByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.slice.by_code_attribute',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.slice.by_language',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.slice.by_status',
      }),
    ).toBeInTheDocument();
  });

  it('auto-selects status slice with help text for portfolio project count pie', () => {
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: false,
          filter: '',
          metric: PieChartMetric.ProjectCount,
          scope: CodeScope.Overall,
          showLegend: true,
          slice: PieChartProjectSlice.Status,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator
        metricPickerOptions={{
          ...metricPickerOptions,
          pieChartMetricOptions: buildPortfolioPieChartMetricSelectOptions(
            (({ id }: { id: string }) => id) as IntlShape['formatMessage'],
          ),
        }}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.slice_by' }),
    ).toBeDisabled();
    expect(
      screen.getByText('dashboard.add_widget_modal.define_widget.slice_by.pie_requires_category'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('dashboard.add_widget_modal.define_widget.slice.by_quality_gate_status'),
    ).toBeInTheDocument();
  });

  it('uses portfolio hotspot security slice label', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: true,
          filter: '',
          metric: PieChartMetric.HotspotCount,
          scope: CodeScope.Overall,
          showLegend: true,
          slice: PieChartHotspotSlice.ReviewPriority,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={dispatch}
        isPortfolioPieChartConfigurator
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.slice_by' }),
    );
    expect(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.slice.by_rule',
      }),
    ).toBeInTheDocument();
  });

  it('dispatches SET_METRIC_KEY from line chart metric list', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        lineChart: {
          complete: false,
          groupBy: LineChartGroupBy.None,
          historyRange: HistoryRange.All,
          metric: null,
          scope: CodeScope.Overall,
        },
      },
      selectedType: VisualizationType.LineChart,
    };
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={dispatch}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.metric' }),
    );
    await user.click(await screen.findByRole('option', { name: 'L' }));
    expect(dispatch).toHaveBeenCalledWith({
      metricKey: MetricKey.violations,
      type: 'SET_METRIC_KEY',
    });
  });

  it('shows visualization icons for selected donut chart', () => {
    const state: WidgetConfigState = {
      configs: {
        donutChart: {
          complete: true,
          filter: '',
          metric: PieChartMetric.LineCount,
          scope: CodeScope.Overall,
          showLegend: true,
          slice: PieChartLineSlice.Coverage,
        },
      },
      selectedType: VisualizationType.DonutChart,
    };
    renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(screen.getByTestId('visualization-selected-icon-donut-chart')).toBeInTheDocument();
  });

  it('disables visualization select in edit mode', () => {
    renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isEditMode
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={{ configs: {}, selectedType: null }}
      />,
    );

    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.define_widget.visualization',
      }),
    ).toBeDisabled();
  });

  it('shows count metric select for rich hotspots mapped to the security hotspots option', () => {
    const state: WidgetConfigState = {
      configs: {
        count: {
          complete: true,
          metric: { metricKey: RichMetricKey.Hotspots, type: DashboardMetricType.Rich },
          scope: CodeScope.Overall,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.metric' }),
    ).toHaveValue('H');
  });

  it('shows the selected issue-resolution statistic in the count metric select', () => {
    const state: WidgetConfigState = {
      configs: {
        count: {
          complete: true,
          metric: {
            statistic: IssueResolutionStatistic.MTTR,
            type: DashboardMetricType.IssueResolution,
          },
          scope: CodeScope.Overall,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={{
          ...metricPickerOptions,
          countMetrics: [
            {
              group: 'g',
              items: [{ label: 'MTTR', value: IssueResolutionStatistic.MTTR }],
            },
          ],
        }}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.metric' }),
    ).toHaveValue('MTTR');
  });

  it('shows SCA MTTR as the selected count metric', () => {
    const state: WidgetConfigState = {
      configs: {
        count: {
          complete: true,
          metric: {
            type: DashboardMetricType.ScaResolution,
          },
          scope: CodeScope.Overall,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={{
          ...metricPickerOptions,
          countMetrics: [
            {
              group: 'Dependency risks',
              items: [{ label: 'SCA MTTR', value: SCA_MTTR_METRIC_OPTION_VALUE }],
            },
          ],
        }}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.metric' }),
    ).toHaveValue('SCA MTTR');
  });

  it('shows deprecated badge on security hotspot metric options', async () => {
    const state: WidgetConfigState = {
      configs: {
        count: {
          complete: true,
          metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
          scope: CodeScope.Overall,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.metric' }),
    );

    expect(screen.getByRole('option', { name: 'H deprecated' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'N' })).toBeInTheDocument();
  });

  it('shows deprecated badge on pie chart hotspot count metric option', async () => {
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: true,
          filter: '',
          metric: PieChartMetric.IssueCount,
          scope: CodeScope.Overall,
          showLegend: true,
          slice: PieChartIssueSlice.ImpactSoftwareQualities,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    const { user } = renderWithRouter(
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl="https://docs.example.com/widgets"
        defineWidgetAccordionOpen
        dispatch={jest.fn()}
        isPortfolioPieChartConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.metric' }),
    );

    expect(
      screen.getByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.metric.security_hotspot_count deprecated',
      }),
    ).toBeInTheDocument();
  });
});
