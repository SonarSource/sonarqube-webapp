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

import { Checkbox, Text, TextSize } from '@sonarsource/echoes-react';
import { Dispatch } from 'react';
import { FormattedMessage } from 'react-intl';
import { MetricKey } from '~shared/types/metrics';
import { VisualizationType, type DashboardWidgetType } from '../../types/widget-common';
import { isCountWidgetTrendIndicatorSupported } from '../../utils/countWidgetTrendIndicator';
import type {
  CountConfig,
  LineChartConfig,
  PieChartConfig,
  RatingBadgeConfig,
  WidgetConfigAction,
  WidgetConfigState,
} from '../state/widgetConfigTypes';
import type { WidgetModalAccordionComponent } from './modalAccordionTypes';

export interface CustomizeVisualizationAccordionProps {
  Accordion: WidgetModalAccordionComponent;
  customizeVisualizationAccordionOpen: boolean;
  dispatch: Dispatch<WidgetConfigAction>;
  /** When true for the current rating-badge metric, show the portfolio breakdown checkbox. */
  isRatingBadgeBreakdownEligibleForMetric: (metricKey: MetricKey) => boolean;
  setCustomizeVisualizationAccordionOpen: (open: boolean) => void;
  state: WidgetConfigState;
}

export function CustomizeVisualizationAccordion({
  Accordion,
  customizeVisualizationAccordionOpen,
  dispatch,
  isRatingBadgeBreakdownEligibleForMetric,
  setCustomizeVisualizationAccordionOpen,
  state,
}: Readonly<CustomizeVisualizationAccordionProps>) {
  // Get current config
  const currentConfig =
    state.selectedType === null
      ? undefined
      : state.configs[state.selectedType as keyof typeof state.configs];

  // Determine what options to show based on current config
  const isPieChart =
    state.selectedType === VisualizationType.PieChart ||
    state.selectedType === VisualizationType.DonutChart;
  const pieChartShowOptions =
    isPieChart &&
    (currentConfig as PieChartConfig)?.metric !== null &&
    (currentConfig as PieChartConfig)?.slice !== null;
  const metricBasedShowOptions =
    currentConfig &&
    (state.selectedType === VisualizationType.LineChart ||
      state.selectedType === VisualizationType.Count) &&
    (currentConfig as LineChartConfig | CountConfig).metric !== null;

  const isRatingBadgeWithMetric =
    currentConfig &&
    state.selectedType === VisualizationType.RatingBadge &&
    (currentConfig as RatingBadgeConfig).metricKey !== null;

  const isTopList = state.selectedType === VisualizationType.TopList;

  const isQualityGateBadge = Boolean(
    isRatingBadgeWithMetric &&
    (currentConfig as RatingBadgeConfig).metricKey === MetricKey.alert_status,
  );
  const ratingBadgeMetricKey = isRatingBadgeWithMetric
    ? (currentConfig as RatingBadgeConfig).metricKey
    : null;
  const isPortfolioBadgeWithBreakdown = Boolean(
    isRatingBadgeWithMetric &&
    ratingBadgeMetricKey !== null &&
    isRatingBadgeBreakdownEligibleForMetric(ratingBadgeMetricKey),
  );

  const showLegendOption =
    (metricBasedShowOptions && state.selectedType === VisualizationType.LineChart) ||
    pieChartShowOptions;
  const showTrendIndicator =
    metricBasedShowOptions && state.selectedType === VisualizationType.Count;

  const showOptions = pieChartShowOptions || metricBasedShowOptions;
  return (
    <Accordion
      isOpen={customizeVisualizationAccordionOpen}
      onToggle={() => {
        setCustomizeVisualizationAccordionOpen(!customizeVisualizationAccordionOpen);
      }}
      title={<FormattedMessage id="dashboard.add_widget_modal.customize_visualization" />}
    >
      <div
        className="sw-flex sw-flex-col sw-gap-4"
        onClick={(e) => {
          e.stopPropagation();
        }}
        role="none"
      >
        {showLegendOption && currentConfig && state.selectedType !== null && (
          <LegendCheckbox
            currentConfig={currentConfig as PieChartConfig | LineChartConfig}
            dispatch={dispatch}
            isPieChart={isPieChart}
            selectedType={state.selectedType}
          />
        )}
        {showTrendIndicator && currentConfig && state.selectedType === VisualizationType.Count && (
          <TrendIndicatorCheckbox
            currentConfig={currentConfig as CountConfig}
            dispatch={dispatch}
          />
        )}
        {(isQualityGateBadge || isPortfolioBadgeWithBreakdown) && currentConfig && (
          <BreakdownCheckbox
            currentConfig={currentConfig as RatingBadgeConfig}
            dispatch={dispatch}
            isPortfolioBadgeWithBreakdown={isPortfolioBadgeWithBreakdown}
            isQualityGateBadge={isQualityGateBadge}
          />
        )}
        {isRatingBadgeWithMetric && !isQualityGateBadge && !isPortfolioBadgeWithBreakdown && (
          <Text isSubtle size={TextSize.Small}>
            <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.rating_badge_info" />
          </Text>
        )}
        {isTopList && (
          <Text isSubtle size={TextSize.Small}>
            <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.top_list_info" />
          </Text>
        )}
        {!showOptions && !isRatingBadgeWithMetric && !isTopList && (
          <Text isSubtle size={TextSize.Small}>
            <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.warning" />
          </Text>
        )}
      </div>
    </Accordion>
  );
}

function LegendCheckbox({
  currentConfig,
  dispatch,
  isPieChart,
  selectedType,
}: Readonly<{
  currentConfig: PieChartConfig | LineChartConfig;
  dispatch: Dispatch<WidgetConfigAction>;
  isPieChart: boolean;
  selectedType: DashboardWidgetType;
}>) {
  return (
    <Checkbox
      checked={
        isPieChart
          ? (currentConfig as PieChartConfig).showLegend
          : selectedType === VisualizationType.LineChart &&
            Boolean((currentConfig as LineChartConfig).showLegend)
      }
      label={
        <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.checkbox.show_legend" />
      }
      onCheck={() => {
        if (isPieChart) {
          dispatch({
            type: 'SET_PIE_SHOW_LEGEND',
            showLegend: !(currentConfig as PieChartConfig).showLegend,
          });
        } else if (selectedType === VisualizationType.LineChart) {
          const lineConfig = currentConfig as LineChartConfig;
          dispatch({
            type: 'SET_SHOW_LEGEND_LINECHART',
            showLegend: !lineConfig.showLegend,
          });
        }
      }}
    />
  );
}

function TrendIndicatorCheckbox({
  currentConfig,
  dispatch,
}: Readonly<{
  currentConfig: CountConfig;
  dispatch: Dispatch<WidgetConfigAction>;
}>) {
  const trendSupported = isCountWidgetTrendIndicatorSupported(
    currentConfig.metric,
    currentConfig.scope,
  );

  return (
    <Checkbox
      checked={trendSupported && Boolean(currentConfig.showTrendIndicator)}
      helpText={
        trendSupported ? (
          <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator.help_text" />
        ) : (
          <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator.issue_count_unavailable" />
        )
      }
      isDisabled={!trendSupported}
      label={
        <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator" />
      }
      onCheck={() => {
        if (!trendSupported) {
          return;
        }
        dispatch({
          type: 'SET_SHOW_TREND_INDICATOR',
          showTrendIndicator: !currentConfig.showTrendIndicator,
        });
      }}
    />
  );
}

function BreakdownCheckbox({
  currentConfig,
  dispatch,
  isPortfolioBadgeWithBreakdown,
  isQualityGateBadge,
}: Readonly<{
  currentConfig: RatingBadgeConfig;
  dispatch: Dispatch<WidgetConfigAction>;
  isPortfolioBadgeWithBreakdown: boolean;
  isQualityGateBadge: boolean;
}>) {
  return (
    <Checkbox
      checked={Boolean(currentConfig.showBreakdown)}
      helpText={
        isQualityGateBadge ? (
          <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.checkbox.show_breakdown.description" />
        ) : undefined
      }
      label={
        isPortfolioBadgeWithBreakdown ? (
          <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.checkbox.show_legend" />
        ) : (
          <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.checkbox.show_breakdown.header" />
        )
      }
      onCheck={() => {
        dispatch({
          type: 'SET_SHOW_BREAKDOWN',
          showBreakdown: !currentConfig.showBreakdown,
        });
      }}
    />
  );
}
