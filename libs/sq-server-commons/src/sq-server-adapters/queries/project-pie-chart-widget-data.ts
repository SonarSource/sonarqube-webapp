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
  PieChartMetric,
  supportsOrganizationPieChartIssueHistory,
  type PieChartWidget,
} from '../helpers/dashboard-widget-data';
import { unsupportedDashboardWidgetAdapter } from '../helpers/unsupported-dashboard-widget-adapter';
import type { DashboardPieChartSegment } from './dashboard-widget-adapter-types';

export function projectPieChartUsesLegacyIssueData(_widget: unknown): boolean {
  const widget = _widget as PieChartWidget;
  if (widget.metric === PieChartMetric.LineCount) {
    return false;
  }
  return !supportsOrganizationPieChartIssueHistory(widget.metric, widget.slice);
}

export function useProjectPieChartSegmentsLegacyQuery(
  _props: unknown,
  _projectKey: string | undefined,
): { error: unknown; isPending: boolean; segments: DashboardPieChartSegment[] } {
  return unsupportedDashboardWidgetAdapter();
}
