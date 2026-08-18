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

import { Dispatch } from 'react';
import { HistoryRange } from '../../data/widgets/line-chart';
import { VisualizationType, type WidgetMetricPickerOptions } from '../../types/widget-common';
import type {
  CountConfig,
  LineChartConfig,
  PieChartConfig,
  RatingBadgeConfig,
  TopListConfig,
  WidgetConfigAction,
  WidgetConfigState,
} from '../state/widgetConfigTypes';
import { ApplyFiltersAccordionShell, ApplyFiltersWarning } from './ApplyFiltersAccordionShell';
import { MetricWidgetApplyFilters } from './MetricWidgetApplyFilters';
import type { WidgetModalAccordionComponent } from './modalAccordionTypes';
import { PieChartApplyFilters } from './PieChartApplyFilters';
import { TopListApplyFilters } from './TopListApplyFilters';
import { usePortfolioApplyFilterNormalization } from './usePortfolioApplyFilterNormalization';

export interface ApplyFilterAccordionProps {
  Accordion: WidgetModalAccordionComponent;
  applyFiltersAccordionOpen: boolean;
  /**
   * When portfolio clamps line-chart history to allowed ranges, pass the clamp function (sq-cloud only).
   * Ignored when {@link isPortfolioWidgetConfigurator} is false.
   */
  clampPortfolioLineChartHistoryRange?: (range: HistoryRange) => HistoryRange;
  dispatch: Dispatch<WidgetConfigAction>;
  isPortfolioWidgetConfigurator: boolean;
  metricPickerOptions: WidgetMetricPickerOptions;
  setApplyFiltersAccordionOpen: (open: boolean) => void;
  state: WidgetConfigState;
}

export function ApplyFilterAccordion({
  Accordion,
  applyFiltersAccordionOpen,
  clampPortfolioLineChartHistoryRange,
  dispatch,
  isPortfolioWidgetConfigurator,
  metricPickerOptions,
  setApplyFiltersAccordionOpen,
  state,
}: Readonly<ApplyFilterAccordionProps>) {
  usePortfolioApplyFilterNormalization({
    clampPortfolioLineChartHistoryRange,
    dispatch,
    isPortfolioWidgetConfigurator,
    state,
  });

  const onAccordionToggle = () => {
    setApplyFiltersAccordionOpen(!applyFiltersAccordionOpen);
  };

  const shellProps = {
    Accordion,
    applyFiltersAccordionOpen,
    onAccordionToggle,
  };

  const { selectedType } = state;
  const currentConfig = selectedType === null ? undefined : state.configs[selectedType];

  if (selectedType === null || currentConfig === undefined) {
    return (
      <ApplyFiltersAccordionShell {...shellProps}>
        <ApplyFiltersWarning />
      </ApplyFiltersAccordionShell>
    );
  }

  if (
    selectedType === VisualizationType.PieChart ||
    selectedType === VisualizationType.DonutChart
  ) {
    return (
      <PieChartApplyFilters
        {...shellProps}
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={isPortfolioWidgetConfigurator}
        pieConfig={currentConfig as PieChartConfig}
      />
    );
  }

  if (selectedType === VisualizationType.TopList) {
    return (
      <TopListApplyFilters
        {...shellProps}
        dispatch={dispatch}
        metricPickerOptions={metricPickerOptions}
        topListConfig={currentConfig as TopListConfig}
      />
    );
  }

  if (
    selectedType === VisualizationType.LineChart ||
    selectedType === VisualizationType.Count ||
    selectedType === VisualizationType.RatingBadge
  ) {
    return (
      <MetricWidgetApplyFilters
        {...shellProps}
        clampPortfolioLineChartHistoryRange={clampPortfolioLineChartHistoryRange}
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={isPortfolioWidgetConfigurator}
        metricConfig={currentConfig as LineChartConfig | CountConfig | RatingBadgeConfig}
        metricPickerOptions={metricPickerOptions}
        visualization={selectedType}
      />
    );
  }

  return (
    <ApplyFiltersAccordionShell {...shellProps}>
      <ApplyFiltersWarning />
    </ApplyFiltersAccordionShell>
  );
}
