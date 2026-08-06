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

import type { MetricKey, MetricType } from '~shared/types/metrics';
import { unsupportedDashboardWidgetAdapter } from '../helpers/unsupported-dashboard-widget-adapter';
import type {
  DashboardEntityType,
  DashboardWidgetQueryResult,
} from './dashboard-widget-adapter-types';

interface Trend {
  current: string | null;
  past: string | null;
}

interface IssueCountData {
  historicalValues: Trend;
  latestTotal: number | null;
  sparklineSeries: number[];
}

interface MeasuresCountData {
  latestValue: string | undefined;
  sparklineSeries: number[];
  trend: Trend;
}

export function useOrgIssueCountWidgetData(_params: {
  entityId: string;
  entityType: DashboardEntityType;
  measureFilters: unknown;
  resolvedIssueMetricKey: MetricKey;
  richMetricKey: string;
}): DashboardWidgetQueryResult<IssueCountData> {
  return unsupportedDashboardWidgetAdapter();
}

export function useOrgMeasuresCountWidgetData(_params: {
  entityId: string;
  entityType: DashboardEntityType;
  metricKeyForRequest: string;
  metricType: MetricType | string | undefined;
}): DashboardWidgetQueryResult<MeasuresCountData> {
  return unsupportedDashboardWidgetAdapter();
}
