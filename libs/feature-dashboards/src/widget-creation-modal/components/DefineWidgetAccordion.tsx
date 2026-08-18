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

import { Link, Select, Text, TextSize } from '@sonarsource/echoes-react';
import { Dispatch, type ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { MetricKey } from '~shared/types/metrics';
import { LineChartGroupBy, type LineChartGroupByValue } from '../../data/widgets/line-chart';
import { BadgeIcon } from '../../icons/BadgeIcon';
import { DonutSmallIcon } from '../../icons/DonutSmallIcon';
import { PieChartIcon } from '../../icons/PieChartIcon';
import { ShowChartIcon } from '../../icons/ShowChartIcon';
import { TagIcon } from '../../icons/TagIcon';
import { TopListIcon } from '../../icons/TopListIcon';
import {
  DashboardMetricType,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartProjectSlice,
  PieChartSlice,
  RichMetricKey,
} from '../../types/dashboard-widget';
import {
  DEFAULT_TOP_LIST_LIMIT,
  ISSUE_DENSITY_METRIC_OPTION_VALUE,
  SCA_MTTR_METRIC_OPTION_VALUE,
  TopListMetric,
  TopListRankBy,
  VisualizationType,
  type DashboardWidgetType,
  type MetricOptionValue,
  type WidgetMetricPickerOptions,
} from '../../types/widget-common';
import type {
  CountConfig,
  LineChartConfig,
  PieChartConfig,
  RatingBadgeConfig,
  TopListConfig,
  WidgetConfigAction,
  WidgetConfigState,
} from '../state/widgetConfigTypes';
import {
  withDeprecatedMetricGroupSuffixes,
  withDeprecatedPieChartMetricSelectOptionSuffixes,
} from '../utils/deprecatedMetricSelectOptions';
import {
  buildLineChartGroupBySelectOptions,
  isLineChartGroupByEligibleForMetric,
} from '../utils/lineChartGroupByHelpers';
import { buildPieChartMetricSelectOptions } from '../utils/pieChartMetricSelectOptions';
import {
  buildTopListLimitSelectOptions,
  buildTopListMetricSelectOptions,
  buildTopListRankBySelectOptions,
  topListLimitFromSelectValue,
} from '../utils/topListDefineWidgetHelpers';
import type { WidgetModalAccordionComponent } from './modalAccordionTypes';

const VISUALIZATION_TYPES_WITH_LINE_OR_COUNT_METRIC_SELECT = new Set<DashboardWidgetType>([
  VisualizationType.LineChart,
  VisualizationType.Count,
  VisualizationType.RatingBadge,
]);

export interface DefineWidgetAccordionProps {
  Accordion: WidgetModalAccordionComponent;
  /** Fallback doc URL when {@link WidgetMetricPickerOptions.defineWidgetDocumentationUrl} is unset. */
  defaultDefineWidgetDocumentationUrl: string;
  defineWidgetAccordionOpen: boolean;
  dispatch: Dispatch<WidgetConfigAction>;
  /** When true, the visualization type cannot be changed (editing existing widget) */
  isEditMode?: boolean;
  isPortfolioPieChartConfigurator: boolean;
  metricPickerOptions: WidgetMetricPickerOptions;
  setDefineWidgetAccordionOpen: (open: boolean) => void;
  state: WidgetConfigState;
}

function getSelectedMetricOptionValue(state: WidgetConfigState): MetricOptionValue | '' {
  if (
    state.selectedType === null ||
    state.selectedType === VisualizationType.PieChart ||
    state.selectedType === VisualizationType.DonutChart
  ) {
    return '';
  }

  const currentConfig = state.configs[state.selectedType];
  if (!currentConfig) {
    return '';
  }
  if (state.selectedType === VisualizationType.RatingBadge) {
    return (currentConfig as RatingBadgeConfig).metricKey ?? '';
  }

  const { metric } = currentConfig as LineChartConfig | CountConfig;
  if (!metric) {
    return '';
  }
  if (metric.type === DashboardMetricType.Raw) {
    return metric.metricKey;
  }
  if (metric.type === DashboardMetricType.IssueResolution) {
    return metric.statistic;
  }
  if (metric.type === DashboardMetricType.IssueDensity) {
    return ISSUE_DENSITY_METRIC_OPTION_VALUE;
  }
  if (metric.type === DashboardMetricType.ScaResolution) {
    return SCA_MTTR_METRIC_OPTION_VALUE;
  }
  return metric.metricKey === RichMetricKey.Hotspots
    ? MetricKey.security_hotspots
    : MetricKey.violations;
}

function getVisualizationValueIcon(visualization: string): ReactNode | undefined {
  switch (visualization) {
    case VisualizationType.Count:
      return (
        <span data-testid="visualization-selected-icon-count">
          <TagIcon />
        </span>
      );
    case VisualizationType.RatingBadge:
      return (
        <span data-testid="visualization-selected-icon-rating-badge">
          <BadgeIcon />
        </span>
      );
    case VisualizationType.LineChart:
      return (
        <span data-testid="visualization-selected-icon-line-chart">
          <ShowChartIcon />
        </span>
      );
    case VisualizationType.DonutChart:
      return (
        <span data-testid="visualization-selected-icon-donut-chart">
          <DonutSmallIcon />
        </span>
      );
    case VisualizationType.PieChart:
      return (
        <span data-testid="visualization-selected-icon-pie-chart">
          <PieChartIcon />
        </span>
      );
    case VisualizationType.TopList:
      return (
        <span data-testid="visualization-selected-icon-top-list">
          <TopListIcon />
        </span>
      );
    default:
      return undefined;
  }
}

export function DefineWidgetAccordion({
  Accordion,
  defaultDefineWidgetDocumentationUrl,
  defineWidgetAccordionOpen,
  isEditMode,
  isPortfolioPieChartConfigurator,
  metricPickerOptions,
  setDefineWidgetAccordionOpen,
  state,
  dispatch,
}: Readonly<DefineWidgetAccordionProps>) {
  const intl = useIntl();
  const {
    countMetrics,
    lineChartMetrics,
    ratingBadgeMetrics,
    pieChartMetricOptions: pieChartMetricOptionsFromPicker,
    defineWidgetDescriptionMessageId,
    defineWidgetDocumentationUrl,
    enableNewDashboardWidgets = false,
  } = metricPickerOptions;

  const metricGroupsForLineOrCount =
    state.selectedType === VisualizationType.LineChart && lineChartMetrics
      ? lineChartMetrics
      : countMetrics;

  // Extract current values from state
  const visualization = state.selectedType ?? '';
  const currentConfig = state.selectedType === null ? undefined : state.configs[state.selectedType];
  const metric = getSelectedMetricOptionValue(state);

  const lineChartConfig =
    state.selectedType === VisualizationType.LineChart
      ? (currentConfig as LineChartConfig | undefined)
      : undefined;
  const lineChartDashboardMetric = lineChartConfig?.metric ?? null;
  const showLineChartGroupBy =
    enableNewDashboardWidgets &&
    visualization === VisualizationType.LineChart &&
    lineChartDashboardMetric !== null &&
    isLineChartGroupByEligibleForMetric(lineChartDashboardMetric);
  const lineChartGroupBy = lineChartConfig?.groupBy ?? LineChartGroupBy.None;
  const lineChartGroupBySelectOptions = buildLineChartGroupBySelectOptions(intl.formatMessage);

  const pieChartMetric =
    currentConfig &&
    (state.selectedType === VisualizationType.PieChart ||
      state.selectedType === VisualizationType.DonutChart)
      ? ((currentConfig as PieChartConfig).metric ?? '')
      : '';

  const pieChartSlice =
    currentConfig &&
    (state.selectedType === VisualizationType.PieChart ||
      state.selectedType === VisualizationType.DonutChart)
      ? ((currentConfig as PieChartConfig).slice ?? '')
      : '';

  const pieChartMetricSelectOptions = withDeprecatedPieChartMetricSelectOptionSuffixes(
    pieChartMetricOptionsFromPicker ?? buildPieChartMetricSelectOptions(intl.formatMessage),
  );

  const topListMetric =
    currentConfig && state.selectedType === VisualizationType.TopList
      ? ((currentConfig as TopListConfig).metric ?? '')
      : '';

  const topListRankBy =
    currentConfig && state.selectedType === VisualizationType.TopList
      ? ((currentConfig as TopListConfig).rankBy ?? '')
      : '';

  const topListLimit =
    currentConfig && state.selectedType === VisualizationType.TopList
      ? ((currentConfig as TopListConfig).limit ?? DEFAULT_TOP_LIST_LIMIT)
      : DEFAULT_TOP_LIST_LIMIT;

  const topListMetricSelectOptions = buildTopListMetricSelectOptions(intl.formatMessage);
  const topListRankBySelectOptions = buildTopListRankBySelectOptions(intl.formatMessage);
  const topListLimitSelectOptions = buildTopListLimitSelectOptions(intl.formatMessage);

  const topListVisualizationOption = {
    label: intl.formatMessage({
      id: 'dashboard.add_widget_modal.define_widget.visualization.top_list',
    }),
    prefix: (
      <span data-testid="visualization-icon-top-list">
        <TopListIcon />
      </span>
    ),
    value: VisualizationType.TopList,
  };

  const visualizationValueIcon = getVisualizationValueIcon(visualization);

  const defineWidgetDescriptionId =
    defineWidgetDescriptionMessageId ?? 'dashboard.add_widget_modal.define_widget.description';
  const defineWidgetDocUrl = defineWidgetDocumentationUrl ?? defaultDefineWidgetDocumentationUrl;

  // PieChart slice options (depends on selected metric)
  const getPieChartSliceOptions = () => {
    const isPortfolioPie = isPortfolioPieChartConfigurator;

    if (pieChartMetric === PieChartMetric.IssueCount) {
      const issueSlices = [
        {
          value: PieChartIssueSlice.ImpactSoftwareQualities,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_software_quality',
          }),
        },
        {
          value: PieChartIssueSlice.ImpactSeverities,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_severity',
          }),
        },
        {
          value: PieChartIssueSlice.CleanCodeAttributeCategories,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_code_attribute',
          }),
        },
        {
          value: PieChartIssueSlice.IssueStatuses,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_status',
          }),
        },
        {
          value: PieChartIssueSlice.Languages,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_language',
          }),
        },
        {
          value: PieChartIssueSlice.Rules,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_rule',
          }),
        },
      ];
      if (isPortfolioPie) {
        return issueSlices.filter(
          (entry) =>
            entry.value !== PieChartIssueSlice.CleanCodeAttributeCategories &&
            entry.value !== PieChartIssueSlice.Languages,
        );
      }
      return issueSlices;
    }
    if (pieChartMetric === PieChartMetric.ProjectCount) {
      return [
        {
          value: PieChartProjectSlice.Status,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_quality_gate_status',
          }),
        },
      ];
    }
    if (pieChartMetric === PieChartMetric.HotspotCount) {
      return [
        {
          value: PieChartHotspotSlice.ReviewPriority,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_review_priority',
          }),
        },
        {
          value: PieChartHotspotSlice.ReviewStatus,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_review_status',
          }),
        },
        {
          value: PieChartHotspotSlice.SecurityCategory,
          label: intl.formatMessage({
            id: isPortfolioPie
              ? 'dashboard.add_widget_modal.define_widget.slice.by_rule'
              : 'dashboard.add_widget_modal.define_widget.slice.by_security_category',
          }),
        },
      ];
    }
    if (pieChartMetric === PieChartMetric.LineCount) {
      return [
        {
          value: PieChartLineSlice.Language,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_language',
          }),
        },
        {
          value: PieChartLineSlice.Coverage,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_coverage',
          }),
        },
        {
          value: PieChartLineSlice.Duplications,
          label: intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.slice.by_duplications',
          }),
        },
      ];
    }
    return [];
  };
  return (
    <Accordion
      isOpen={defineWidgetAccordionOpen}
      onToggle={() => {
        setDefineWidgetAccordionOpen(!defineWidgetAccordionOpen);
      }}
      title={<FormattedMessage id="dashboard.add_widget_modal.define_widget" />}
    >
      <Text as="div" className="sw-mb-6" isSubtle size={TextSize.Small}>
        <FormattedMessage
          id={defineWidgetDescriptionId}
          values={{
            link: (text) => (
              <Link enableOpenInNewTab to={defineWidgetDocUrl}>
                {text}
              </Link>
            ),
          }}
        />
      </Text>

      <div
        className="sw-flex sw-flex-col sw-gap-3"
        onClick={(e) => {
          e.stopPropagation();
        }}
        role="none"
      >
        <Select
          data={[
            {
              group: intl.formatMessage({
                id: 'dashboard.add_widget_modal.define_widget.visualization.group.single_value',
              }),
              items: [
                {
                  label: intl.formatMessage({
                    id: 'dashboard.add_widget_modal.define_widget.visualization.count',
                  }),
                  prefix: (
                    <span data-testid="visualization-icon-count">
                      <TagIcon />
                    </span>
                  ),
                  value: VisualizationType.Count,
                },
                {
                  label: intl.formatMessage({
                    id: 'dashboard.add_widget_modal.define_widget.visualization.rating_badge',
                  }),
                  prefix: (
                    <span data-testid="visualization-icon-rating-badge">
                      <BadgeIcon />
                    </span>
                  ),
                  value: VisualizationType.RatingBadge,
                },
              ],
            },
            {
              group: intl.formatMessage({
                id: 'dashboard.add_widget_modal.define_widget.visualization.group.charts',
              }),
              items: [
                {
                  label: intl.formatMessage({
                    id: 'dashboard.add_widget_modal.define_widget.visualization.line_chart',
                  }),
                  prefix: (
                    <span data-testid="visualization-icon-line-chart">
                      <ShowChartIcon />
                    </span>
                  ),
                  value: VisualizationType.LineChart,
                },
                {
                  label: intl.formatMessage({
                    id: 'dashboard.add_widget_modal.define_widget.visualization.donut_chart',
                  }),
                  prefix: (
                    <span data-testid="visualization-icon-donut-chart">
                      <DonutSmallIcon />
                    </span>
                  ),
                  value: VisualizationType.DonutChart,
                },
                {
                  label: intl.formatMessage({
                    id: 'dashboard.add_widget_modal.define_widget.visualization.pie_chart',
                  }),
                  prefix: (
                    <span data-testid="visualization-icon-pie-chart">
                      <PieChartIcon />
                    </span>
                  ),
                  value: VisualizationType.PieChart,
                },
                ...(enableNewDashboardWidgets ? [topListVisualizationOption] : []),
              ],
            },
          ]}
          isDisabled={isEditMode}
          isNotClearable
          label={<FormattedMessage id="dashboard.add_widget_modal.define_widget.visualization" />}
          onChange={(value) => {
            const widgetType = value as DashboardWidgetType;
            dispatch({ type: 'SET_WIDGET_TYPE', widgetType });
            if (widgetType === VisualizationType.TopList) {
              dispatch({
                metric: TopListMetric.IssueCount,
                type: 'SET_TOP_LIST_METRIC',
              });
              dispatch({
                rankBy: TopListRankBy.Rule,
                type: 'SET_TOP_LIST_RANK_BY',
              });
              dispatch({
                limit: DEFAULT_TOP_LIST_LIMIT,
                type: 'SET_TOP_LIST_LIMIT',
              });
            }
          }}
          placeholder={intl.formatMessage({
            id: 'dashboard.add_widget_modal.define_widget.visualization.select',
          })}
          value={visualization}
          valueIcon={visualizationValueIcon}
        />
        {visualization === VisualizationType.TopList && (
          <>
            <Select
              data={topListMetricSelectOptions}
              isNotClearable
              label={<FormattedMessage id="dashboard.add_widget_modal.define_widget.metric" />}
              onChange={(value) => {
                dispatch({
                  metric: value as (typeof TopListMetric)[keyof typeof TopListMetric],
                  type: 'SET_TOP_LIST_METRIC',
                });
              }}
              value={topListMetric}
            />
            <Select
              data={topListRankBySelectOptions}
              isNotClearable
              label={
                <FormattedMessage id="dashboard.add_widget_modal.define_widget.top_list.rank_by" />
              }
              onChange={(value) => {
                dispatch({
                  rankBy: value as (typeof TopListRankBy)[keyof typeof TopListRankBy],
                  type: 'SET_TOP_LIST_RANK_BY',
                });
              }}
              value={topListRankBy}
            />
            <Select
              data={topListLimitSelectOptions}
              isNotClearable
              label={
                <FormattedMessage id="dashboard.add_widget_modal.define_widget.top_list.limit" />
              }
              onChange={(value) => {
                if (value === null) {
                  return;
                }
                const limit = topListLimitFromSelectValue(value);
                if (limit !== null) {
                  dispatch({
                    limit,
                    type: 'SET_TOP_LIST_LIMIT',
                  });
                }
              }}
              value={String(topListLimit)}
            />
          </>
        )}
        {(visualization === VisualizationType.PieChart ||
          visualization === VisualizationType.DonutChart) && (
          <>
            <Select
              data={pieChartMetricSelectOptions}
              label={<FormattedMessage id="dashboard.add_widget_modal.define_widget.metric" />}
              onChange={(value) => {
                dispatch({ type: 'SET_PIE_METRIC', metric: value as PieChartMetric });
              }}
              placeholder={intl.formatMessage({
                id: 'dashboard.add_widget_modal.define_widget.metric.select',
              })}
              value={pieChartMetric}
            />
            {pieChartMetric && (
              <Select
                data={getPieChartSliceOptions()}
                helpText={
                  pieChartMetric === PieChartMetric.ProjectCount
                    ? intl.formatMessage({
                        id: 'dashboard.add_widget_modal.define_widget.slice_by.pie_requires_category',
                      })
                    : undefined
                }
                isDisabled={pieChartMetric === PieChartMetric.ProjectCount}
                key={pieChartMetric}
                label={<FormattedMessage id="dashboard.add_widget_modal.define_widget.slice_by" />}
                onChange={(value) => {
                  dispatch({ type: 'SET_PIE_SLICE', slice: value as PieChartSlice });
                }}
                placeholder={intl.formatMessage({
                  id: 'dashboard.add_widget_modal.define_widget.slice_by.select',
                })}
                value={
                  pieChartMetric === PieChartMetric.ProjectCount
                    ? PieChartProjectSlice.Status
                    : pieChartSlice
                }
              />
            )}
          </>
        )}
        {visualization &&
          VISUALIZATION_TYPES_WITH_LINE_OR_COUNT_METRIC_SELECT.has(visualization) && (
            <Select
              data={withDeprecatedMetricGroupSuffixes(
                visualization === VisualizationType.RatingBadge
                  ? ratingBadgeMetrics
                  : metricGroupsForLineOrCount,
              )}
              key={visualization}
              label={<FormattedMessage id="dashboard.add_widget_modal.define_widget.metric" />}
              onChange={(value) => {
                dispatch({ type: 'SET_METRIC_KEY', metricKey: value as MetricOptionValue });
              }}
              placeholder={intl.formatMessage({
                id: 'dashboard.add_widget_modal.define_widget.metric.select',
              })}
              value={metric}
            />
          )}
        {showLineChartGroupBy && (
          <Select
            data={lineChartGroupBySelectOptions}
            isNotClearable
            label={<FormattedMessage id="dashboard.add_widget_modal.define_widget.group_by" />}
            onChange={(value) => {
              dispatch({
                groupBy: value as LineChartGroupByValue,
                type: 'SET_LINE_CHART_GROUP_BY',
              });
            }}
            value={lineChartGroupBy}
          />
        )}
      </div>
    </Accordion>
  );
}
