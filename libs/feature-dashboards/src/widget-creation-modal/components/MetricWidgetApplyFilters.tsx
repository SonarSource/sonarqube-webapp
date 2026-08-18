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
import { type WidgetMetricPickerOptions } from '../../types/widget-common';
import {
  useMetricWidgetApplyFiltersViewModel,
  type MetricWidgetVisualization,
} from '../hooks/useMetricWidgetApplyFiltersViewModel';
import type {
  CountConfig,
  LineChartConfig,
  RatingBadgeConfig,
  WidgetConfigAction,
} from '../state/widgetConfigTypes';
import {
  ApplyFiltersAccordionContent,
  ApplyFiltersAccordionShell,
  ApplyFiltersWarning,
  type ApplyFiltersAccordionShellProps,
} from './ApplyFiltersAccordionShell';
import { MetricWidgetLineChartHistorySelect } from './MetricWidgetLineChartHistorySelect';
import { MetricWidgetRichMeasureFilters } from './MetricWidgetRichMeasureFilters';
import { MetricWidgetScopeFilter } from './MetricWidgetScopeFilter';

export interface MetricWidgetApplyFiltersProps extends Omit<
  ApplyFiltersAccordionShellProps,
  'children'
> {
  clampPortfolioLineChartHistoryRange?: (range: HistoryRange) => HistoryRange;
  dispatch: Dispatch<WidgetConfigAction>;
  isPortfolioWidgetConfigurator: boolean;
  metricConfig: LineChartConfig | CountConfig | RatingBadgeConfig;
  metricPickerOptions: WidgetMetricPickerOptions;
  visualization: MetricWidgetVisualization;
}

export function MetricWidgetApplyFilters({
  clampPortfolioLineChartHistoryRange,
  dispatch,
  isPortfolioWidgetConfigurator,
  metricConfig,
  metricPickerOptions,
  visualization,
  ...shellProps
}: Readonly<MetricWidgetApplyFiltersProps>) {
  const viewModel = useMetricWidgetApplyFiltersViewModel({
    clampPortfolioLineChartHistoryRange,
    dispatch,
    isPortfolioWidgetConfigurator,
    metricConfig,
    metricPickerOptions,
    visualization,
  });

  return (
    <ApplyFiltersAccordionShell {...shellProps}>
      {viewModel.hasMetric ? (
        <ApplyFiltersAccordionContent>
          {viewModel.showScopeFilter && <MetricWidgetScopeFilter slice={viewModel.scope} />}
          {viewModel.richMeasureFilters && (
            <MetricWidgetRichMeasureFilters slice={viewModel.richMeasureFilters} />
          )}
          {viewModel.lineChart && (
            <MetricWidgetLineChartHistorySelect slice={viewModel.lineChart} />
          )}
        </ApplyFiltersAccordionContent>
      ) : (
        <ApplyFiltersWarning />
      )}
    </ApplyFiltersAccordionShell>
  );
}
