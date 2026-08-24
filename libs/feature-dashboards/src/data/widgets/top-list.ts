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
import {
  CodeScope,
  DEFAULT_TOP_LIST_LIMIT,
  TopListLimit,
  TopListRankBy,
  type TopListLimitValue,
  type TopListRankByValue,
} from '../../types/widget-common';
import {
  createDashboardWidgetSpec,
  DashboardMetric,
  dashboardMetricSchema,
  type DashboardWidgetSpec,
  type WidgetEditBehavior,
} from './shared';

const key = 'topList' as const;

const rankBySchema = v.enum(TopListRankBy) satisfies GenericSchema<unknown, TopListRankByValue>;

const limitSchema = v.enum(TopListLimit) satisfies GenericSchema<unknown, TopListLimitValue>;

export type Props = {
  /** Number of rows the widget shows (5, 10, or 15). */
  limit: TopListLimitValue;
  metric: DashboardMetric;
  rankBy: TopListRankByValue;
  scope: CodeScope;
};

const propsSchema = v.object({
  limit: limitSchema,
  metric: dashboardMetricSchema,
  rankBy: rankBySchema,
  scope: v.enum(CodeScope),
}) satisfies GenericSchema<unknown, Props>;

const editBehavior: WidgetEditBehavior<Props> = {
  defaultProps: { limit: DEFAULT_TOP_LIST_LIMIT, scope: CodeScope.Overall },
  defaultSize: { width: 6, height: 6 },
  minSize: { width: 4, height: 6 },
  maxSize: { width: 12, height: 12 },
};

export const spec: DashboardWidgetSpec<typeof key, Props> = createDashboardWidgetSpec(
  key,
  propsSchema,
  editBehavior,
);
