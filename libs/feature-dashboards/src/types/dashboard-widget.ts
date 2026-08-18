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

import type { DashboardWidgetPropMap } from '../data/widgets';

export { DashboardMetricType, IssueStatus, RichMetricKey } from '../data/widgets/shared';
export type { DashboardMetric, MeasureFilters } from '../data/widgets/shared';

export {
  projectDashboardWidgetPropsSchemaByType,
  widgetEditBehaviorMap,
  type CompleteWidgetConfig,
} from '../data/widgets';
export type { Props as RatingBadgeWidgetProps } from '../data/widgets/badge';
export type { Props as CountWidgetProps } from '../data/widgets/count';
export type { Props as DonutChartWidgetProps } from '../data/widgets/donut-chart';
export {
  HotspotFilter as PieChartHotspotFilter,
  HotspotSlice as PieChartHotspotSlice,
  IssueFilter as PieChartIssueFilter,
  IssueSlice as PieChartIssueSlice,
  LineSlice as PieChartLineSlice,
  Metric as PieChartMetric,
  ProjectSlice as PieChartProjectSlice,
} from '../data/widgets/pie-chart';
export type {
  Filter as PieChartFilter,
  Slice as PieChartSlice,
  Props as PieChartWidgetProps,
} from '../data/widgets/pie-chart';
export type { Props as TopListWidgetProps } from '../data/widgets/top-list';

// NOSONAR - Intentional product-specific aliases; may diverge from DashboardWidgetPropMap later.
export type ProjectDashboardWidgetPropMap = DashboardWidgetPropMap;
export type PortfolioDashboardWidgetPropMap = DashboardWidgetPropMap;
