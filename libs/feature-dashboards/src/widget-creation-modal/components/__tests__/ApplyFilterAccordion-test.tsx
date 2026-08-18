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

import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import {
  DashboardMetricType,
  IssueStatus,
  PieChartHotspotFilter,
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  RichMetricKey,
  type DashboardMetric,
} from '../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import {
  CodeScope,
  TopListLimit,
  TopListMetric,
  TopListRankBy,
  VisualizationType,
  type WidgetMetricPickerOptions,
} from '../../../types/widget-common';
import type { LineChartConfig, WidgetConfigState } from '../../state/widgetConfigTypes';
import { ApplyFilterAccordion } from '../ApplyFilterAccordion';
import { createTestAccordion } from './accordionTestUtils';

describe('ApplyFilterAccordion', () => {
  const Accordion = createTestAccordion();
  const metricPickerOptions: WidgetMetricPickerOptions = {
    countMetrics: [{ group: 'g', items: [{ label: 'N', value: MetricKey.ncloc }] }],
    lineChartMetrics: [{ group: 'g', items: [{ label: 'L', value: MetricKey.violations }] }],
    ratingBadgeMetrics: [
      { group: 'g', items: [{ label: 'R', value: MetricKey.reliability_rating }] },
    ],
  };

  const richIssuesDashboardMetric: DashboardMetric = {
    measureFilters: {},
    metricKey: RichMetricKey.Issues,
    type: DashboardMetricType.Rich,
  };

  /** Spreading {@link LineChartConfig} widens `metric.type`; rebuild a complete line config instead. */
  function richIssuesLineChart(
    overrides: Partial<Pick<LineChartConfig, 'historyRange' | 'scope' | 'showLegend'>> = {},
  ): LineChartConfig {
    return {
      complete: true,
      groupBy: LineChartGroupBy.None,
      historyRange: HistoryRange.All,
      metric: richIssuesDashboardMetric,
      scope: CodeScope.Overall,
      showLegend: false,
      ...overrides,
    };
  }

  it('shows the warning when no visualization is selected', () => {
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={jest.fn()}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={{ configs: {}, selectedType: null }}
      />,
    );

    expect(
      screen.getByText('dashboard.add_widget_modal.apply_filters.warning'),
    ).toBeInTheDocument();
  });

  it('dispatches SET_PIE_FILTER when changing pie issue filter', async () => {
    const dispatch = jest.fn();
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
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.pie_filter.label',
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.apply_filters.pie_filter.security_issues',
      }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      filter: PieChartIssueFilter.Security,
      type: 'SET_PIE_FILTER',
    });
  });

  it('disables pie issue filter when slicing by software quality', () => {
    const dispatch = jest.fn();
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
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByText('dashboard.add_widget_modal.apply_filters.pie_software_quality_slice_help'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.pie_filter.label',
      }),
    ).toBeDisabled();
  });

  it('enables hotspot pie filter select when slice is not review status', () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: true,
          filter: PieChartHotspotFilter.ToReview,
          metric: PieChartMetric.HotspotCount,
          scope: CodeScope.Overall,
          showLegend: true,
          slice: PieChartHotspotSlice.ReviewPriority,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.pie_filter.label',
      }),
    ).toBeEnabled();
  });

  it('disables hotspot pie filter select when slice is review status', () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: true,
          filter: '',
          metric: PieChartMetric.HotspotCount,
          scope: CodeScope.Overall,
          showLegend: true,
          slice: PieChartHotspotSlice.ReviewStatus,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByText(
        'dashboard.add_widget_modal.apply_filters.pie_hotspot_review_status_slice_filter_help',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.pie_filter.label',
      }),
    ).toBeDisabled();
  });

  it('shows portfolio help text for pie line count instead of scope select', () => {
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: true,
          filter: '',
          metric: PieChartMetric.LineCount,
          scope: CodeScope.Overall,
          showLegend: true,
          slice: PieChartLineSlice.Language,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={jest.fn()}
        isPortfolioWidgetConfigurator
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByText(
        'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.line_count',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('locks portfolio pie scope to overall for issue count metrics', () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        pieChart: {
          complete: true,
          filter: '',
          metric: PieChartMetric.IssueCount,
          scope: CodeScope.New,
          showLegend: true,
          slice: PieChartIssueSlice.ImpactSeverities,
        },
      },
      selectedType: VisualizationType.PieChart,
    };
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    // Portfolio issue/hotspot pies cannot serve New code, so a static help text replaces the select.
    expect(
      screen.getByText(
        'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.issue_count_history',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /scope/ })).not.toBeInTheDocument();
  });

  it('clamps portfolio line chart history range via effect', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        lineChart: richIssuesLineChart({ historyRange: HistoryRange.All }),
      },
      selectedType: VisualizationType.LineChart,
    };
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        clampPortfolioLineChartHistoryRange={() => HistoryRange.Last6Months}
        dispatch={dispatch}
        isPortfolioWidgetConfigurator
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        historyRange: HistoryRange.Last6Months,
        type: 'SET_HISTORY_RANGE',
      });
    });
  });

  it('dispatches SET_SCOPE and SET_HISTORY_RANGE for raw line chart metrics', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        lineChart: {
          complete: true,
          groupBy: LineChartGroupBy.None,
          historyRange: HistoryRange.LastMonth,
          metric: { metricKey: MetricKey.coverage, type: DashboardMetricType.Raw },
          scope: CodeScope.Overall,
          showLegend: false,
        },
      },
      selectedType: VisualizationType.LineChart,
    };
    const { user } = renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={{
          ...metricPickerOptions,
          supportsNewCodeScopeForMetric: () => true,
        }}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    const scopeSelect = screen.getByRole('combobox', {
      name: 'dashboard.add_widget_modal.apply_filters_section.select.scope.label',
    });
    expect(scopeSelect).toBeEnabled();

    await user.click(scopeSelect);
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.scope.option.new_code',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({ scope: CodeScope.New, type: 'SET_SCOPE' });

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.time_range.label',
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.time_range.option.last_12_months',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      historyRange: HistoryRange.Last12Months,
      type: 'SET_HISTORY_RANGE',
    });
  });

  it('shows independent issue-resolution filters in the requested order', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        lineChart: {
          complete: true,
          groupBy: LineChartGroupBy.None,
          historyRange: HistoryRange.LastMonth,
          metric: {
            measureFilters: {},
            statistic: IssueResolutionStatistic.MTTR,
            type: DashboardMetricType.IssueResolution,
          },
          scope: CodeScope.Overall,
          showLegend: false,
        },
      },
      selectedType: VisualizationType.LineChart,
    };
    const { user } = renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    const scopeSelect = screen.getByRole('combobox', {
      name: 'dashboard.add_widget_modal.apply_filters_section.select.scope.label',
    });
    const severitySelect = screen.getByRole('combobox', {
      name: 'dashboard.add_widget_modal.apply_filters_section.select.severity.label',
    });
    const softwareQualitySelect = screen.getByRole('combobox', {
      name: 'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label',
    });
    const timeRangeSelect = screen.getByRole('combobox', {
      name: 'dashboard.add_widget_modal.apply_filters_section.select.time_range.label',
    });

    expect(screen.getAllByRole('combobox')).toEqual([
      scopeSelect,
      softwareQualitySelect,
      severitySelect,
      timeRangeSelect,
    ]);

    await user.click(severitySelect);
    expect(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.apply_filters_section.software_quality.all',
        selected: true,
      }),
    ).toBeInTheDocument();
    await user.click(await screen.findByRole('option', { name: 'severity.HIGH +' }));

    expect(dispatch).toHaveBeenCalledWith({
      measureFilters: {
        impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Blocker],
      },
      type: 'SET_LINE_CHART_MEASURE_FILTERS',
    });

    await user.click(softwareQualitySelect);
    expect(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.apply_filters_section.software_quality.all',
        selected: true,
      }),
    ).toBeInTheDocument();
  });

  it('disables scope select when supportsNewCodeScopeForMetric returns false', () => {
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
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={{
          ...metricPickerOptions,
          supportsNewCodeScopeForMetric: () => false,
        }}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.scope.label',
      }),
    ).toBeDisabled();
  });

  it('allows new code scope for count issue metrics when supported', async () => {
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
    const { user } = renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={{
          ...metricPickerOptions,
          supportsNewCodeScopeForMetric: () => true,
        }}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    const scopeSelect = screen.getByRole('combobox', {
      name: 'dashboard.add_widget_modal.apply_filters_section.select.scope.label',
    });
    expect(scopeSelect).toBeEnabled();

    await user.click(scopeSelect);
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.scope.option.new_code',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({ scope: CodeScope.New, type: 'SET_SCOPE' });
  });

  it('shows measure filters for rich issue count and updates software quality', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        count: {
          complete: true,
          metric: {
            measureFilters: { issueStatus: undefined },
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          scope: CodeScope.Overall,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    const { user } = renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label',
      }),
    );
    await user.click(await screen.findByRole('option', { name: 'software_quality.SECURITY' }));
    expect(dispatch).toHaveBeenCalledWith({
      measureFilters: {
        impactSoftwareQuality: SoftwareQuality.Security,
        issueStatus: undefined,
      },
      type: 'SET_COUNT_MEASURE_FILTERS',
    });
  });

  it('shows quality gate scope help instead of scope select for alert_status badge', () => {
    const state: WidgetConfigState = {
      configs: {
        ratingBadge: {
          complete: true,
          metricKey: MetricKey.alert_status,
          scope: CodeScope.Overall,
          showBreakdown: false,
        },
      },
      selectedType: VisualizationType.RatingBadge,
    };
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={jest.fn()}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByText(
        'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.quality_gate_status',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows scope and measure filters for Top list issue count', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        topList: {
          complete: true,
          limit: TopListLimit.Five,
          measureFilters: {},
          metric: TopListMetric.IssueCount,
          rankBy: TopListRankBy.Rule,
          scope: CodeScope.Overall,
        },
      },
      selectedType: VisualizationType.TopList,
    };
    const { user } = renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.scope.label',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.status.label',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.severity.label',
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label',
      }),
    );
    await user.click(await screen.findByRole('option', { name: 'software_quality.RELIABILITY' }));
    expect(dispatch).toHaveBeenCalledWith({
      measureFilters: {
        impactSoftwareQuality: SoftwareQuality.Reliability,
      },
      type: 'SET_TOP_LIST_MEASURE_FILTERS',
    });
  });

  it('allows combining status and software quality filters for Count issue count', () => {
    const state: WidgetConfigState = {
      configs: {
        count: {
          complete: true,
          metric: {
            measureFilters: {
              impactSoftwareQuality: SoftwareQuality.Maintainability,
              issueStatus: IssueStatus.Open,
            },
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          scope: CodeScope.Overall,
          showTrendIndicator: false,
        },
      },
      selectedType: VisualizationType.Count,
    };
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={jest.fn()}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.status.label',
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label',
      }),
    ).toBeEnabled();
    expect(
      screen.queryByText('dashboard.add_widget_modal.apply_filters_section.status_disabled_help'),
    ).not.toBeInTheDocument();
  });

  it('allows combining status, software quality, and severity filters for Top list', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        topList: {
          complete: true,
          limit: TopListLimit.Five,
          measureFilters: {
            impactSoftwareQuality: SoftwareQuality.Reliability,
            issueStatus: IssueStatus.Open,
          },
          metric: TopListMetric.IssueCount,
          rankBy: TopListRankBy.Rule,
          scope: CodeScope.Overall,
        },
      },
      selectedType: VisualizationType.TopList,
    };
    const { user } = renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.status.label',
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label',
      }),
    ).toBeEnabled();

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.severity.label',
      }),
    );
    await user.click(await screen.findByRole('option', { name: 'severity.BLOCKER' }));

    expect(dispatch).toHaveBeenCalledWith({
      measureFilters: {
        impactSoftwareQuality: SoftwareQuality.Reliability,
        impactSeverities: [SoftwareImpactSeverity.Blocker],
        issueStatus: IssueStatus.Open,
      },
      type: 'SET_TOP_LIST_MEASURE_FILTERS',
    });
  });

  it('shows apply filters warning when top list config is incomplete', () => {
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
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={jest.fn()}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByText('dashboard.add_widget_modal.apply_filters.warning'),
    ).toBeInTheDocument();
  });

  it('shows severity filter and dispatches severity when software quality is set for Top list', async () => {
    const dispatch = jest.fn();
    const state: WidgetConfigState = {
      configs: {
        topList: {
          complete: true,
          limit: TopListLimit.Five,
          measureFilters: { impactSoftwareQuality: SoftwareQuality.Reliability },
          metric: TopListMetric.IssueCount,
          rankBy: TopListRankBy.Rule,
          scope: CodeScope.Overall,
        },
      },
      selectedType: VisualizationType.TopList,
    };
    const { user } = renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.severity.label',
      }),
    );
    await user.click(await screen.findByRole('option', { name: 'severity.HIGH +' }));

    expect(dispatch).toHaveBeenCalledWith({
      measureFilters: {
        impactSoftwareQuality: SoftwareQuality.Reliability,
        impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Blocker],
      },
      type: 'SET_TOP_LIST_MEASURE_FILTERS',
    });
  });

  it('disables line chart scope select for issue count metrics', () => {
    const state: WidgetConfigState = {
      configs: { lineChart: richIssuesLineChart() },
      selectedType: VisualizationType.LineChart,
    };
    renderWithRouter(
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen
        dispatch={jest.fn()}
        isPortfolioWidgetConfigurator={false}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={jest.fn()}
        state={state}
      />,
    );

    expect(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.apply_filters_section.select.scope.label',
      }),
    ).toBeDisabled();
    expect(
      screen.getByText(
        'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.issue_count_history',
      ),
    ).toBeInTheDocument();
  });
});
