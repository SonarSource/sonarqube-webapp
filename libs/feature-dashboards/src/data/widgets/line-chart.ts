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

import * as v from 'valibot';
import { GenericSchema } from 'valibot';
import { CodeScope } from '../../types/widget-common';
import {
  createDashboardWidgetSpec,
  DashboardMetric,
  dashboardMetricSchema,
  type DashboardWidgetSpec,
  type WidgetEditBehavior,
} from './shared';

export const LineChartGroupBy = {
  None: 'none',
  Rule: 'rule',
  Severity: 'severity',
  SoftwareQuality: 'softwareQuality',
  Status: 'status',
} as const;

export type LineChartGroupByValue = (typeof LineChartGroupBy)[keyof typeof LineChartGroupBy];

const lineChartGroupBySchema = v.enum(LineChartGroupBy) satisfies GenericSchema<
  unknown,
  LineChartGroupByValue
>;

export const DEFAULT_LINE_CHART_GROUP_BY: LineChartGroupByValue = LineChartGroupBy.None;

export enum HistoryRange {
  All = '99',
  Last12Months = '12',
  Last6Months = '6',
  Last3Months = '3',
  LastMonth = '1',
}

const key = 'lineChart' as const;

export type Props = {
  groupBy: LineChartGroupByValue;
  historyRange: HistoryRange;
  metric: DashboardMetric;
  scope: CodeScope;
  showLegend?: boolean;
};

const propsSchema = v.object({
  groupBy: v.optional(lineChartGroupBySchema, DEFAULT_LINE_CHART_GROUP_BY),
  historyRange: v.enum(HistoryRange),
  metric: dashboardMetricSchema,
  scope: v.enum(CodeScope),
  showLegend: v.optional(v.boolean()),
}) satisfies GenericSchema<unknown, Props>;

const editBehavior: WidgetEditBehavior<Props> = {
  defaultProps: {
    groupBy: DEFAULT_LINE_CHART_GROUP_BY,
    showLegend: false,
    scope: CodeScope.Overall,
  },
  defaultSize: { width: 6, height: 5 },
  minSize: { width: 4, height: 5 },
  maxSize: { width: 12, height: 12 },
};

export const spec: DashboardWidgetSpec<typeof key, Props> = createDashboardWidgetSpec(
  key,
  propsSchema,
  editBehavior,
);
