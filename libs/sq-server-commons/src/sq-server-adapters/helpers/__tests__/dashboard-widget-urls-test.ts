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

import * as dashboardWidgetUrls from '../dashboard-widget-urls';
import { DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE } from '../unsupported-dashboard-widget-adapter';

type UnsupportedAdapter = (...args: never[]) => unknown;

const unsupportedAdapters: ReadonlyArray<
  readonly [name: string, adapter: UnsupportedAdapter, args: never[]]
> = [
  ['getDashboardDocumentationUrl', dashboardWidgetUrls.getDashboardDocumentationUrl, ['' as never]],
  [
    'getProjectDashboardMeasureHistoryUrl',
    dashboardWidgetUrls.getProjectDashboardMeasureHistoryUrl,
    ['' as never, '' as never],
  ],
  [
    'getProjectDashboardMeasuresUrl',
    dashboardWidgetUrls.getProjectDashboardMeasuresUrl,
    [{} as never],
  ],
  [
    'getProjectDashboardSummaryUrl',
    dashboardWidgetUrls.getProjectDashboardSummaryUrl,
    ['' as never],
  ],
  ['getProjectDashboardRuleUrl', dashboardWidgetUrls.getProjectDashboardRuleUrl, ['' as never]],
  [
    'buildProjectRichCountWidgetLink',
    dashboardWidgetUrls.buildProjectRichCountWidgetLink,
    ['' as never, undefined as never, '' as never],
  ],
  [
    'buildProjectRawCountWidgetLink',
    dashboardWidgetUrls.buildProjectRawCountWidgetLink,
    ['' as never, '' as never, '' as never],
  ],
  ['serializeDashboardWidgetUrl', dashboardWidgetUrls.serializeDashboardWidgetUrl, ['' as never]],
  [
    'getProjectDashboardPieChartSegmentUrl',
    dashboardWidgetUrls.getProjectDashboardPieChartSegmentUrl,
    ['' as never, '' as never, {} as never],
  ],
  [
    'getProjectDashboardTopListRowUrl',
    dashboardWidgetUrls.getProjectDashboardTopListRowUrl,
    ['' as never, '' as never, {} as never],
  ],
  [
    'getPortfolioDashboardMeasuresUrl',
    dashboardWidgetUrls.getPortfolioDashboardMeasuresUrl,
    ['' as never, '' as never, '' as never],
  ],
  [
    'getPortfolioDashboardWidgetDrilldownUrl',
    dashboardWidgetUrls.getPortfolioDashboardWidgetDrilldownUrl,
    ['' as never],
  ],
];

describe('Server dashboard widget URL seams', () => {
  it.each(unsupportedAdapters)(
    '%s fails loudly until its Server route is available',
    (_, fn, args) => {
      expect(() => fn(...args)).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
    },
  );
});
