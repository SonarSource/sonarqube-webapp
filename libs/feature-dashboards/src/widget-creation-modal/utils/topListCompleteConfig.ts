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

import {
  DashboardMetric,
  DashboardMetricType,
  MeasureFilters,
  RichMetricKey,
} from '../../types/dashboard-widget';
import {
  DEFAULT_TOP_LIST_LIMIT,
  TopListLimit,
  TopListMetric,
  TopListRankBy,
  type TopListLimitValue,
} from '../../types/widget-common';
import type { TopListConfig } from '../state/widgetConfigTypes';

function isTopListConfigComplete(config: Pick<TopListConfig, 'metric' | 'rankBy'>): boolean {
  return config.metric !== null && config.rankBy !== null;
}

export function withTopListComplete(config: TopListConfig): TopListConfig {
  return {
    ...config,
    complete: isTopListConfigComplete(config),
  };
}

export function buildDashboardMetricForTopList(
  measureFilters: MeasureFilters | undefined,
): DashboardMetric {
  return {
    measureFilters,
    metricKey: RichMetricKey.Issues,
    type: DashboardMetricType.Rich,
  };
}

export function isTopListLimitValue(limit: number): limit is TopListLimitValue {
  return (Object.values(TopListLimit) as number[]).includes(limit);
}

export function topListConfigFromDashboardMetric(
  metric: DashboardMetric,
  rankBy: TopListConfig['rankBy'],
  scope: TopListConfig['scope'],
  limit: number,
): TopListConfig {
  const measureFilters =
    metric.type === DashboardMetricType.Rich ? metric.measureFilters : undefined;

  const config: TopListConfig = {
    complete: false,
    limit: isTopListLimitValue(limit) ? limit : DEFAULT_TOP_LIST_LIMIT,
    measureFilters,
    metric: TopListMetric.IssueCount,
    rankBy,
    scope,
  };

  return {
    ...config,
    complete: isTopListConfigComplete(config),
  };
}

export function isTopListRankByValue(
  rankBy: string,
): rankBy is (typeof TopListRankBy)[keyof typeof TopListRankBy] {
  return (Object.values(TopListRankBy) as string[]).includes(rankBy);
}
