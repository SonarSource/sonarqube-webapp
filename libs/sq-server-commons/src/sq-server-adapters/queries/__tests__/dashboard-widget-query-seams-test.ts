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
  DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE,
  unsupportedDashboardWidgetAdapter,
} from '../../helpers/unsupported-dashboard-widget-adapter';
import * as issueDensityWidgetData from '../issue-density-widget-data';
import * as issueResolutionWidgetData from '../issue-resolution-widget-data';
import * as scaResolutionWidgetData from '../sca-resolution-widget-data';

type UnsupportedAdapter = (...args: never[]) => unknown;

const unsupportedAdapters: ReadonlyArray<
  readonly [name: string, adapter: UnsupportedAdapter, args: never[]]
> = [
  [
    'useOrgIssueDensityCountWidgetData',
    issueDensityWidgetData.useOrgIssueDensityCountWidgetData,
    [{} as never],
  ],
  [
    'useOrgIssueDensityLineChartWidgetData',
    issueDensityWidgetData.useOrgIssueDensityLineChartWidgetData,
    [{} as never],
  ],
  [
    'useOrgIssueResolutionCountWidgetData',
    issueResolutionWidgetData.useOrgIssueResolutionCountWidgetData,
    [{} as never],
  ],
  [
    'useOrgIssueResolutionLineChartWidgetData',
    issueResolutionWidgetData.useOrgIssueResolutionLineChartWidgetData,
    [{} as never],
  ],
  [
    'useOrgScaResolutionCountWidgetData',
    scaResolutionWidgetData.useOrgScaResolutionCountWidgetData,
    [{} as never],
  ],
  [
    'useOrgScaResolutionLineChartWidgetData',
    scaResolutionWidgetData.useOrgScaResolutionLineChartWidgetData,
    [{} as never],
  ],
];

describe('Server dashboard widget query seams', () => {
  it('uses one explicit unsupported-adapter failure', () => {
    expect(() => unsupportedDashboardWidgetAdapter()).toThrow(
      DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE,
    );
  });

  it.each(unsupportedAdapters)(
    '%s fails loudly until its Server API is available',
    (_, fn, args) => {
      expect(() => fn(...args)).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
    },
  );
});
