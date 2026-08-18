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

import { act, renderHook } from '@testing-library/react';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { DEFAULT_LINE_CHART_GROUP_BY, HistoryRange } from '../../../data/widgets/line-chart';
import { DashboardMetricType, type DashboardMetric } from '../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { CodeScope, VisualizationType } from '../../../types/widget-common';
import type { CountConfig, LineChartConfig } from '../../state/widgetConfigTypes';
import { useMetricWidgetApplyFiltersViewModel } from '../useMetricWidgetApplyFiltersViewModel';

jest.mock('react-intl', () => {
  const actual = jest.requireActual<typeof import('react-intl')>('react-intl');
  const intl = actual.createIntl(
    {
      locale: 'en',
      messages: {
        'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.line_chart_metric_overall_code_only':
          "Line charts and the ''{metric}'' metric are only available for overall code scope.",
        'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.metric_overall_code_only':
          "''{metric}'' metric is only available for the overall code scope.",
        'dashboard.add_widget_modal.define_widget.metric.issue_density': 'Issue density',
        'dashboard.add_widget_modal.define_widget.metric.mttr': 'MTTR for issues',
        'dashboard.add_widget_modal.define_widget.metric.recent_mttr':
          'MTTR for newly introduced issues',
        'dashboard.add_widget_modal.define_widget.metric.resolved_issues': 'Issues closed',
        'dashboard.add_widget_modal.define_widget.metric.sca_mttr': 'SCA MTTR',
      },
      onError: jest.fn(),
    },
    actual.createIntlCache(),
  );

  return {
    ...actual,
    useIntl: () => intl,
  };
});

describe('useMetricWidgetApplyFiltersViewModel', () => {
  const issueDensityCountConfig: CountConfig = {
    complete: true,
    metric: {
      measureFilters: {},
      type: DashboardMetricType.IssueDensity,
    },
    scope: CodeScope.Overall,
    showTrendIndicator: true,
  };

  const scopeLockedMetrics: Array<{
    label: string;
    metric: DashboardMetric;
    name: string;
  }> = [
    {
      label: 'issue density',
      metric: { measureFilters: {}, type: DashboardMetricType.IssueDensity },
      name: 'Issue density',
    },
    {
      label: 'issues closed',
      metric: {
        measureFilters: {},
        statistic: IssueResolutionStatistic.ResolvedIssues,
        type: DashboardMetricType.IssueResolution,
      },
      name: 'Issues closed',
    },
    {
      label: 'MTTR',
      metric: {
        measureFilters: {},
        statistic: IssueResolutionStatistic.MTTR,
        type: DashboardMetricType.IssueResolution,
      },
      name: 'MTTR for issues',
    },
    {
      label: 'MTTR newly introduced issues',
      metric: {
        measureFilters: {},
        statistic: IssueResolutionStatistic.RecentMTTR,
        type: DashboardMetricType.IssueResolution,
      },
      name: 'MTTR for newly introduced issues',
    },
    {
      label: 'SCA MTTR',
      metric: {
        measureFilters: {},
        type: DashboardMetricType.ScaResolution,
      },
      name: 'SCA MTTR',
    },
  ];

  const metricPickerOptions = {
    countMetrics: [],
    ratingBadgeMetrics: [],
    supportsNewCodeScopeForMetric: () => true,
  };

  function getScopeHelpText(
    metric: DashboardMetric,
    visualization: typeof VisualizationType.Count | typeof VisualizationType.LineChart,
  ) {
    const metricConfig: CountConfig | LineChartConfig =
      visualization === VisualizationType.Count
        ? {
            complete: true,
            metric,
            scope: CodeScope.Overall,
            showTrendIndicator: true,
          }
        : {
            complete: true,
            groupBy: DEFAULT_LINE_CHART_GROUP_BY,
            historyRange: HistoryRange.All,
            metric,
            scope: CodeScope.Overall,
            showLegend: true,
          };

    const { result } = renderHook(() =>
      useMetricWidgetApplyFiltersViewModel({
        dispatch: jest.fn(),
        isPortfolioWidgetConfigurator: false,
        metricConfig,
        metricPickerOptions,
        visualization,
      }),
    );

    return result.current.scope.scopeHelpText;
  }

  it.each(scopeLockedMetrics)('uses count wording for $label', ({ metric, name }) => {
    expect(getScopeHelpText(metric, VisualizationType.Count)).toBe(
      `'${name}' metric is only available for the overall code scope.`,
    );
  });

  it.each(scopeLockedMetrics)('uses line-chart wording for $label', ({ metric, name }) => {
    expect(getScopeHelpText(metric, VisualizationType.LineChart)).toBe(
      `Line charts and the '${name}' metric are only available for overall code scope.`,
    );
  });

  it('locks issue density to overall code and exposes its supported filters', () => {
    const { result } = renderHook(() =>
      useMetricWidgetApplyFiltersViewModel({
        dispatch: jest.fn(),
        isPortfolioWidgetConfigurator: false,
        metricConfig: issueDensityCountConfig,
        metricPickerOptions,
        visualization: VisualizationType.Count,
      }),
    );

    expect(result.current.hasMetric).toBe(true);
    expect(result.current.scope).toEqual(
      expect.objectContaining({
        isScopeSelectDisabled: true,
      }),
    );
    expect(result.current.richMeasureFilters).toEqual(
      expect.objectContaining({
        isIssueStatusFilterDisabled: false,
        showSeverityFilter: true,
      }),
    );
  });

  it('dispatches issue density software-quality filter changes for count widgets', () => {
    const dispatch = jest.fn();
    const { result } = renderHook(() =>
      useMetricWidgetApplyFiltersViewModel({
        dispatch,
        isPortfolioWidgetConfigurator: false,
        metricConfig: issueDensityCountConfig,
        metricPickerOptions,
        visualization: VisualizationType.Count,
      }),
    );

    act(() => {
      result.current.richMeasureFilters?.setSoftwareQualityFilter(SoftwareQuality.Maintainability);
    });

    expect(dispatch).toHaveBeenCalledWith({
      measureFilters: { impactSoftwareQuality: SoftwareQuality.Maintainability },
      type: 'SET_COUNT_MEASURE_FILTERS',
    });
  });

  it('locks SCA MTTR to overall code and exposes only its severity filter', () => {
    const dispatch = jest.fn();
    const metricConfig: CountConfig = {
      complete: true,
      metric: {
        measureFilters: {},
        type: DashboardMetricType.ScaResolution,
      },
      scope: CodeScope.Overall,
      showTrendIndicator: true,
    };
    const { result } = renderHook(() =>
      useMetricWidgetApplyFiltersViewModel({
        dispatch,
        isPortfolioWidgetConfigurator: false,
        metricConfig,
        metricPickerOptions,
        visualization: VisualizationType.Count,
      }),
    );

    expect(result.current.scope.isScopeSelectDisabled).toBe(true);
    expect(result.current.richMeasureFilters).toEqual(
      expect.objectContaining({
        filterCapability: {
          isDrillable: true,
          supportsSeverityFilter: true,
          supportsSoftwareQualityFilter: false,
          supportsStatusFilter: false,
        },
        showSeverityFilter: true,
      }),
    );

    act(() => {
      result.current.richMeasureFilters?.setSeverityFilter(SoftwareImpactSeverity.High);
    });
    expect(dispatch).toHaveBeenCalledWith({
      measureFilters: {
        impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Blocker],
      },
      type: 'SET_COUNT_MEASURE_FILTERS',
    });
  });
});
