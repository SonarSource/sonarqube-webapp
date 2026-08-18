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

import type { WidgetInstance } from '../../dashboard-layout/logic/types';
import type {
  CompleteWidgetConfig,
  ProjectDashboardWidgetPropMap,
} from '../../types/dashboard-widget';
import { PieChartPastry } from '../../types/visualization';
import { VisualizationType } from '../../types/widget-common';

/**
 * Converts a widget instance to CompleteWidgetConfig for the modal.
 * Adds widgetType to the existing props.
 */
export function widgetToConfig(
  widget: WidgetInstance<ProjectDashboardWidgetPropMap>,
): CompleteWidgetConfig {
  return { widgetType: widget.type, ...widget.props } as CompleteWidgetConfig;
}

/**
 * Extracts widget props from CompleteWidgetConfig.
 * Removes widgetType and sets donut pastry when needed.
 */
export function configToWidgetProps(
  config: CompleteWidgetConfig,
): ProjectDashboardWidgetPropMap[keyof ProjectDashboardWidgetPropMap] {
  const { widgetType, ...props } = config;

  if (widgetType === VisualizationType.DonutChart) {
    return {
      ...props,
      pastry: PieChartPastry.Donut,
    } as ProjectDashboardWidgetPropMap['donutChart'];
  }

  return props as ProjectDashboardWidgetPropMap[keyof ProjectDashboardWidgetPropMap];
}
