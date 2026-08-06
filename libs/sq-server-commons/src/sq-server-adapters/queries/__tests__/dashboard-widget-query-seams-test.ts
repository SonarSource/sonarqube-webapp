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
import * as countWidgetData from '../count-widget-data';
import * as issueDensityWidgetData from '../issue-density-widget-data';
import * as issueResolutionWidgetData from '../issue-resolution-widget-data';
import * as lineChartWidgetData from '../line-chart-widget-data';
import * as pieChartWidgetData from '../pie-chart-widget-data';
import * as portfolioRatingBadgeWidgetData from '../portfolio-rating-badge-widget-data';
import * as portfolioTopListWidgetData from '../portfolio-top-list-widget-data';
import * as portfolioWidgetOrganizationData from '../portfolio-widget-organization-data';
import * as projectCountWidgetData from '../project-count-widget-data';
import * as projectPieChartWidgetData from '../project-pie-chart-widget-data';
import * as projectRatingBadgeWidgetData from '../project-rating-badge-widget-data';
import * as projectTopListWidgetData from '../project-top-list-widget-data';
import * as scaResolutionWidgetData from '../sca-resolution-widget-data';
import * as widgetMetricMetadata from '../widget-metric-metadata';
import * as widgetRuleMetadata from '../widget-rule-metadata';

type UnsupportedAdapter = (...args: never[]) => unknown;

const unsupportedAdapters: ReadonlyArray<
  readonly [name: string, adapter: UnsupportedAdapter, args: never[]]
> = [
  ['useOrgIssueCountWidgetData', countWidgetData.useOrgIssueCountWidgetData, [{} as never]],
  ['useOrgMeasuresCountWidgetData', countWidgetData.useOrgMeasuresCountWidgetData, [{} as never]],
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
    'organizationLineChartRequestKey',
    lineChartWidgetData.organizationLineChartRequestKey,
    [{} as never, '' as never, '' as never],
  ],
  [
    'useOrganizationLineChartSeriesData',
    lineChartWidgetData.useOrganizationLineChartSeriesData,
    [{} as never],
  ],
  ['useOrganizationPieChartData', pieChartWidgetData.useOrganizationPieChartData, [{} as never]],
  [
    'usePortfolioRatingBadgeMeasuresQuery',
    portfolioRatingBadgeWidgetData.usePortfolioRatingBadgeMeasuresQuery,
    ['' as never],
  ],
  [
    'usePortfolioRatingBadgeComputedMeasuresQuery',
    portfolioRatingBadgeWidgetData.usePortfolioRatingBadgeComputedMeasuresQuery,
    [{} as never],
  ],
  [
    'usePortfolioTopListData',
    portfolioTopListWidgetData.usePortfolioTopListData,
    [{} as never, '' as never],
  ],
  [
    'usePortfolioRulesMetadataOrganization',
    portfolioWidgetOrganizationData.usePortfolioRulesMetadataOrganization,
    ['' as never],
  ],
  [
    'useProjectLegacyIssueCountWidgetQuery',
    projectCountWidgetData.useProjectLegacyIssueCountWidgetQuery,
    [{} as never],
  ],
  [
    'projectPieChartUsesLegacyIssueData',
    projectPieChartWidgetData.projectPieChartUsesLegacyIssueData,
    [{} as never],
  ],
  [
    'useProjectPieChartSegmentsLegacyQuery',
    projectPieChartWidgetData.useProjectPieChartSegmentsLegacyQuery,
    [{} as never, '' as never],
  ],
  [
    'useProjectRatingBadgeMeasuresQuery',
    projectRatingBadgeWidgetData.useProjectRatingBadgeMeasuresQuery,
    [{} as never],
  ],
  [
    'useProjectQualityGateStatusWidgetQuery',
    projectRatingBadgeWidgetData.useProjectQualityGateStatusWidgetQuery,
    ['' as never],
  ],
  [
    'useProjectTopListData',
    projectTopListWidgetData.useProjectTopListData,
    [{} as never, '' as never, '' as never],
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
  ['useDashboardRuleLabels', widgetRuleMetadata.useDashboardRuleLabels, [{} as never]],
  [
    'usePortfolioWidgetMetricMetadataQuery',
    widgetMetricMetadata.usePortfolioWidgetMetricMetadataQuery,
    [],
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
