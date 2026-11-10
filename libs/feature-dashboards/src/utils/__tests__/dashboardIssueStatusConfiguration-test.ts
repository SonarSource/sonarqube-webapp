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

import type { IntlShape } from 'react-intl';
import { parse, safeParse } from 'valibot';
import {
  buildProjectRichCountWidgetLink,
  getProjectDashboardPieChartSegmentUrl,
  getProjectDashboardTopListRowUrl,
  serializeDashboardWidgetUrl,
} from '~adapters/helpers/dashboard-widget-urls';
import {
  getConfiguredIssueStatuses,
  getSingleIssueStatus,
} from '~shared/helpers/dashboard-issue-statuses';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { FILTERABLE_CODE_ISSUE_STATUSES } from '~shared/types/issues';
import { MetricKey } from '~shared/types/metrics';
import { getPieChartFilterLineSegments } from '../../components/pie-chart/pieChartFilterLineSegments';
import { getPortfolioCountWidgetDrilldownDescriptor } from '../../components/portfolio-drilldown/portfolioCountDrilldown';
import { getPortfolioPieChartDrilldownDescriptor } from '../../components/portfolio-drilldown/portfolioPieChartDrilldown';
import { dashboardMetricToMeasure } from '../../data/dashboard-measure';
import { HistoryRange, LineChartGroupBy } from '../../data/widgets/line-chart';
import { spec as pieChartSpec } from '../../data/widgets/pie-chart';
import {
  DashboardMetricType,
  IssueStatus,
  RichMetricKey,
  dashboardMetricSchema,
} from '../../data/widgets/shared';
import {
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartMetric,
  type DashboardMetric,
  type MeasureFilters,
  type PieChartWidgetProps,
} from '../../types/dashboard-widget';
import { PieChartPastry } from '../../types/visualization';
import { CodeScope, VisualizationType } from '../../types/widget-common';
import {
  applyIssueStatusMeasureFilters,
  buildRichMetricIssueStatusSelectOptions,
} from '../../widget-creation-modal/components/applyFilterAccordionHelpers';
import {
  extractCompleteConfig,
  initializeFromConfig,
} from '../../widget-creation-modal/state/selectors/widgetConfigSelectors';
import { widgetConfigReducer } from '../../widget-creation-modal/state/reducers/widgetConfigReducer';
import { getActualMetricKey } from '../../widget-creation-modal/utils/getActualMetricKey';
import { buildMeasureFilterParams } from '../measureFilters';
import { mapPieChartToIssueHistoryParams } from '../organizationIssueCountHistory';
import { issueHistoryQueryExtras } from '../organizationIssueHistoryQuery';

const formatMessage = (({ id }: { id: string }) => id) as IntlShape['formatMessage'];
const openStatuses = [IssueStatus.Open, IssueStatus.Confirmed];
const filters: MeasureFilters = {
  impactSoftwareQuality: SoftwareQuality.Security,
  issueStatuses: openStatuses,
};
const metric: DashboardMetric = {
  type: DashboardMetricType.Rich,
  metricKey: RichMetricKey.Issues,
  measureFilters: filters,
};
const pie: PieChartWidgetProps = {
  filter: PieChartIssueFilter.Security,
  issueStatuses: openStatuses,
  metric: PieChartMetric.IssueCount,
  scope: CodeScope.Overall,
  showLegend: true,
  slice: PieChartIssueSlice.ImpactSeverities,
};

function queryFor(url: string): URLSearchParams {
  return new URL(url, 'https://sonar.example').searchParams;
}

describe('dashboard status configuration', () => {
  it.each([
    [undefined, undefined, FILTERABLE_CODE_ISSUE_STATUSES.join(',')],
    [{ issueStatus: IssueStatus.Accepted }, [IssueStatus.Accepted], 'ACCEPTED'],
    [filters, openStatuses, 'OPEN,CONFIRMED'],
    [{ ...filters, issueStatus: IssueStatus.Accepted }, openStatuses, 'OPEN,CONFIRMED'],
  ])('preserves default, legacy and explicit list behavior for %j', (configured, expected, csv) => {
    expect(getConfiguredIssueStatuses(configured)).toEqual(expected);
    expect(buildMeasureFilterParams(configured).issueStatuses).toBe(csv);
  });

  it('does not treat multiple statuses as a single-status metric', () => {
    expect(getSingleIssueStatus(filters)).toBeUndefined();
    expect(getSingleIssueStatus({ issueStatuses: [IssueStatus.Open] })).toBe(IssueStatus.Open);
  });

  it('validates and preserves status lists in metric and pie layouts', () => {
    expect(parse(dashboardMetricSchema, metric)).toEqual(metric);
    expect(parse(pieChartSpec.fromVersion[0], pie)).toEqual(pie);
    expect(
      safeParse(dashboardMetricSchema, { ...metric, measureFilters: { issueStatuses: [] } })
        .success,
    ).toBe(false);
    expect(
      safeParse(pieChartSpec.fromVersion[0], { ...pie, issueStatuses: ['INVALID'] }).success,
    ).toBe(false);
  });

  it('uses the configured list for counts, history, and count drilldowns', () => {
    expect(dashboardMetricToMeasure(metric, CodeScope.Overall)).toEqual(
      expect.objectContaining({ api: 'issue-count-history', statuses: openStatuses }),
    );
    expect(issueHistoryQueryExtras(filters, RichMetricKey.Issues)).toEqual(
      expect.objectContaining({ statuses: openStatuses }),
    );
    expect(
      getPortfolioCountWidgetDrilldownDescriptor({
        formatMessage,
        getLocalizedMetricName: ({ key }) => key,
        widget: { metric, scope: CodeScope.Overall },
      }),
    ).toMatchObject({ request: { statuses: openStatuses } });
    expect(
      queryFor(
        serializeDashboardWidgetUrl(
          buildProjectRichCountWidgetLink('project', filters, CodeScope.Overall),
        ),
      ).get('issueStatuses'),
    ).toBe('OPEN,CONFIRMED');
    expect(
      queryFor(
        getProjectDashboardTopListRowUrl('project', 'java:S100', {
          metric,
          rankBy: 'rule',
          scope: CodeScope.Overall,
        }),
      ).get('issueStatuses'),
    ).toBe('OPEN,CONFIRMED');
  });

  it('respects an explicit status list when history is grouped by status', () => {
    expect(
      dashboardMetricToMeasure(metric, CodeScope.Overall, { groupBy: 'status' }),
    ).toMatchObject({ api: 'issue-count-history', sliceBy: 'STATUS', statuses: openStatuses });
  });

  it.each([
    [IssueStatus.Open, MetricKey.open_issues],
    [IssueStatus.Confirmed, MetricKey.confirmed_issues],
    [IssueStatus.Accepted, MetricKey.accepted_issues],
  ] as const)('maps a single %s encoded as a list to its status metric', (status, metricKey) => {
    const singleStatusMetric: DashboardMetric = {
      type: DashboardMetricType.Rich,
      metricKey: RichMetricKey.Issues,
      measureFilters: { issueStatuses: [status] },
    };
    expect(getActualMetricKey(singleStatusMetric)).toBe(metricKey);
    expect(dashboardMetricToMeasure(singleStatusMetric, CodeScope.Overall)).toMatchObject({
      metricKey,
      statuses: [status],
    });
  });

  it('keeps hotspot history unrestricted when no code-issue status is configured', () => {
    expect(issueHistoryQueryExtras(undefined, RichMetricKey.Hotspots)).not.toHaveProperty(
      'statuses',
    );
  });

  it.each(['PORTFOLIO', 'PROJECT_BRANCH'] as const)(
    'uses configured statuses in %s pie data',
    (entityType) => {
      expect(mapPieChartToIssueHistoryParams({ ...pie, entityId: 'entity', entityType })).toEqual(
        expect.objectContaining({ statuses: openStatuses }),
      );
      expect(
        mapPieChartToIssueHistoryParams({
          ...pie,
          entityId: 'entity',
          entityType,
          metric: PieChartMetric.HotspotCount,
        }),
      ).not.toEqual(expect.objectContaining({ statuses: openStatuses }));
    },
  );

  it.each([
    [PieChartIssueSlice.ImpactSeverities, 'HIGH'],
    [PieChartIssueSlice.Rules, 'java:S100'],
    [PieChartIssueSlice.ImpactSoftwareQualities, 'SECURITY'],
  ] as const)('keeps %s pie totals and segment drilldowns restricted', (slice, segmentLabel) => {
    const widget = { ...pie, slice };
    expect(getPortfolioPieChartDrilldownDescriptor({ formatMessage, widget })).toMatchObject({
      request: { statuses: openStatuses },
    });
    expect(
      getPortfolioPieChartDrilldownDescriptor({ formatMessage, segmentLabel, widget }),
    ).toMatchObject({ request: { statuses: openStatuses } });
    expect(
      queryFor(getProjectDashboardPieChartSegmentUrl('project', segmentLabel, widget)).get(
        'issueStatuses',
      ),
    ).toBe('OPEN,CONFIRMED');
  });

  it('preserves unfiltered status charts and narrows a selected status segment', () => {
    const statusPie = { ...pie, issueStatuses: undefined, slice: PieChartIssueSlice.IssueStatuses };
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        widget: { ...statusPie, issueStatuses: openStatuses },
      }),
    ).toMatchObject({ request: { statuses: openStatuses } });
    expect(
      mapPieChartToIssueHistoryParams({ ...statusPie, entityId: 'entity', entityType: 'PORTFOLIO' })
        ?.statuses,
    ).toBeUndefined();
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        segmentLabel: 'ACCEPTED',
        widget: statusPie,
      }),
    ).toMatchObject({ request: { statuses: ['ACCEPTED'] } });
    expect(
      queryFor(getProjectDashboardPieChartSegmentUrl('project', 'ACCEPTED', statusPie)).get(
        'issueStatuses',
      ),
    ).toBe('ACCEPTED');
    expect(
      mapPieChartToIssueHistoryParams({
        ...statusPie,
        issueStatuses: openStatuses,
        entityId: 'entity',
        entityType: 'PORTFOLIO',
      })?.statuses,
    ).toEqual(openStatuses);
  });

  it.each([
    { ...pie, widgetType: VisualizationType.PieChart },
    { ...pie, widgetType: VisualizationType.DonutChart, pastry: PieChartPastry.Donut },
  ] as const)('preserves restrictions when editing a $widgetType', (config) => {
    expect(extractCompleteConfig(initializeFromConfig(config))).toMatchObject({
      issueStatuses: openStatuses,
    });
  });

  it('shows the stored multi-status selection and permits replacing it with a single status or All', () => {
    expect(buildRichMetricIssueStatusSelectOptions(formatMessage, filters)).toContainEqual({
      label: 'issue.status.OPEN, issue.status.CONFIRMED',
      value: 'OPEN,CONFIRMED',
    });
    expect(
      buildMeasureFilterParams(applyIssueStatusMeasureFilters(filters, 'ACCEPTED')).issueStatuses,
    ).toBe('ACCEPTED');
    expect(
      buildMeasureFilterParams(applyIssueStatusMeasureFilters(filters, '')).issueStatuses,
    ).toBe(FILTERABLE_CODE_ISSUE_STATUSES.join(','));
  });

  it('retains every status when applying a stored combined selection', () => {
    const selection = applyIssueStatusMeasureFilters(undefined, 'OPEN,CONFIRMED');
    expect(getConfiguredIssueStatuses(selection)).toEqual(openStatuses);
    expect(buildMeasureFilterParams(selection).issueStatuses).toBe('OPEN,CONFIRMED');
  });

  it('shows the status restriction in the pie filter summary', () => {
    expect(
      getPieChartFilterLineSegments(formatMessage, { ...pie, isPortfolioDashboard: true }),
    ).toContain(
      'dashboard.add_widget_modal.apply_filters_section.select.status.label: issue.status.OPEN, issue.status.CONFIRMED',
    );
  });
  it('clears both status fields when grouping a line chart by status', () => {
    const state = initializeFromConfig({
      widgetType: VisualizationType.LineChart,
      groupBy: LineChartGroupBy.None,
      historyRange: HistoryRange.All,
      metric: {
        ...metric,
        measureFilters: { ...filters, issueStatus: IssueStatus.Accepted },
      },
      scope: CodeScope.Overall,
      showLegend: false,
    });
    const grouped = widgetConfigReducer(state, {
      type: 'SET_LINE_CHART_GROUP_BY',
      groupBy: LineChartGroupBy.Status,
    });
    expect(grouped.configs.lineChart).toMatchObject({
      groupBy: LineChartGroupBy.Status,
      metric: {
        measureFilters: {
          impactSoftwareQuality: SoftwareQuality.Security,
          issueStatus: undefined,
          issueStatuses: undefined,
        },
      },
    });
  });
});
