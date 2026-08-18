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
import { type WidgetMetricPickerOptions } from '../../types/widget-common';
import { useTopListApplyFiltersViewModel } from '../hooks/useTopListApplyFiltersViewModel';
import type { TopListConfig, WidgetConfigAction } from '../state/widgetConfigTypes';
import {
  ApplyFiltersAccordionContent,
  ApplyFiltersAccordionShell,
  type ApplyFiltersAccordionShellProps,
  ApplyFiltersWarning,
} from './ApplyFiltersAccordionShell';
import { MetricWidgetRichMeasureFilters } from './MetricWidgetRichMeasureFilters';
import { MetricWidgetScopeFilter } from './MetricWidgetScopeFilter';

export interface TopListApplyFiltersProps extends Omit<
  ApplyFiltersAccordionShellProps,
  'children'
> {
  dispatch: Dispatch<WidgetConfigAction>;
  metricPickerOptions: WidgetMetricPickerOptions;
  topListConfig: TopListConfig;
}

export function TopListApplyFilters({
  dispatch,
  metricPickerOptions,
  topListConfig,
  ...shellProps
}: Readonly<TopListApplyFiltersProps>) {
  const viewModel = useTopListApplyFiltersViewModel({
    dispatch,
    metricPickerOptions,
    topListConfig,
  });

  return (
    <ApplyFiltersAccordionShell {...shellProps}>
      {viewModel.hasMetric ? (
        <ApplyFiltersAccordionContent>
          <MetricWidgetScopeFilter slice={viewModel.scope} />
          <MetricWidgetRichMeasureFilters slice={viewModel.richMeasureFilters} />
        </ApplyFiltersAccordionContent>
      ) : (
        <ApplyFiltersWarning />
      )}
    </ApplyFiltersAccordionShell>
  );
}
