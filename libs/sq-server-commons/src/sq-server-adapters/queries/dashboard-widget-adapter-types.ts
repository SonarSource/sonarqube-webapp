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

import type { Path } from 'history';

export type DashboardEntityType = 'PORTFOLIO' | 'PROJECT_BRANCH';

export interface DashboardCountTrendData {
  latestValue: number | null;
  sparklineSeries: number[];
  trend: { current: string | null; past: string | null };
}

export interface DashboardWidgetQueryResult<T> {
  data: T | undefined;
  isPending: boolean;
}

export interface DashboardLineChartSeries {
  color: string;
  data: Array<{ x: number | Date; y: number }>;
  id: string;
  label: string;
}

export interface DashboardPieChartSegment {
  color: string;
  count: number;
  label: string;
  percentage: string;
  value: string;
  visualCount?: number;
}

export type DashboardRuleMetadataByKey = Record<string, { langName?: string; name: string }>;

export interface DashboardTrendData {
  activityUrl: Partial<Path>;
  change: number;
  formattedChange: string;
  metricDirection: number;
  past: number;
  roundedChange: number;
}
