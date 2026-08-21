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

import { MessageInline, MessageVariety, Text, TextSize } from '@sonarsource/echoes-react';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDashboardProjectContext } from '~adapters/context/dashboardContext';
import { useFlags } from '~adapters/helpers/feature-flags';
import { shouldShowProjectDashboardLimitedHistoryWarning } from '~adapters/helpers/project-dashboard';
import { useOrgIssueDensityLineChartWidgetData } from '~adapters/queries/issue-density-widget-data';
import { useOrgIssueResolutionLineChartWidgetData } from '~adapters/queries/issue-resolution-widget-data';
import { useOrgScaResolutionLineChartWidgetData } from '~adapters/queries/sca-resolution-widget-data';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { LineChart } from '../../components/visualizations/line-chart/LineChart';
import {
  formatDotValue,
  formatYAxisTick,
} from '../../components/visualizations/line-chart/lineChartPresentation';
import { MultiLineChart } from '../../components/visualizations/multi-line-chart/MultiLineChart';
import { HistoryRange } from '../../data/widgets/line-chart';
import { DashboardMetricType } from '../../data/widgets/shared';
import { useMttrFormatters } from '../../hooks/useMttrFormatters';
import { ProjectDashboardWidgetPropMap } from '../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import { getMttrCalendarMessage } from '../../utils/datetime';
import {
  type ProjectDashboardLineChartProps,
  useProjectLineChartModelOrganizations,
} from './projectLineChartOrganizationsModel';

type IssueResolutionMetric = Extract<
  ProjectDashboardWidgetPropMap['lineChart']['metric'],
  { type: DashboardMetricType.IssueResolution }
>;

type IssueDensityMetric = Extract<
  ProjectDashboardWidgetPropMap['lineChart']['metric'],
  { type: DashboardMetricType.IssueDensity }
>;

type ScaResolutionMetric = Extract<
  ProjectDashboardWidgetPropMap['lineChart']['metric'],
  { type: DashboardMetricType.ScaResolution }
>;

interface IssueResolutionProjectLineChartViewProps {
  branchEntityId: string;
  historyRange: HistoryRange;
  metric: IssueResolutionMetric;
  showLegend?: boolean;
}

interface IssueDensityProjectLineChartViewProps {
  branchEntityId: string;
  historyRange: HistoryRange;
  metric: IssueDensityMetric;
  showLegend?: boolean;
}

interface ScaResolutionProjectLineChartViewProps {
  branchEntityId: string;
  historyRange: HistoryRange;
  metric: ScaResolutionMetric;
  showLegend?: boolean;
}

function ProjectLineChartShell(
  props: Readonly<ProjectDashboardLineChartProps & { historyRange: HistoryRange }>,
) {
  const { organizationReportingEnableNewDashboardWidgets } = useFlags();
  const { formatMessage } = useIntl();
  const { historyRange, metricName, series, ...rest } = props;
  const footerNode =
    shouldShowProjectDashboardLimitedHistoryWarning() && isLongHistoryRange(historyRange) ? (
      <MessageInline variety={MessageVariety.Info}>
        <Text isSubtle size={TextSize.Small}>
          {formatMessage({ id: 'dashboard.line_chart.limited_history_warning' })}
        </Text>
      </MessageInline>
    ) : undefined;

  return (
    <div className="sw-h-full sw-min-h-0 sw-flex sw-flex-col">
      <div className="sw-flex-1 sw-min-h-0">
        {organizationReportingEnableNewDashboardWidgets ? (
          <MultiLineChart series={series} {...rest} />
        ) : (
          <LineChart {...rest} data={series[0]?.data ?? []} metricName={metricName} showDots />
        )}
      </div>
      {footerNode}
    </div>
  );
}

type OrgBranchViewProps = Readonly<{
  branchEntityId: string;
  organization: string;
  widget: Readonly<ProjectDashboardWidgetPropMap['lineChart']>;
}>;

function isLongHistoryRange(historyRange: HistoryRange): boolean {
  return (
    historyRange === HistoryRange.Last6Months ||
    historyRange === HistoryRange.Last12Months ||
    historyRange === HistoryRange.All
  );
}

function IssueResolutionProjectLineChartView(
  props: Readonly<IssueResolutionProjectLineChartViewProps>,
) {
  const { branchEntityId, historyRange, metric, showLegend = false } = props;
  const { formatMessage } = useIntl();
  const { measureFilters, statistic } = metric;
  const metricName = formatMessage({
    id: `dashboard.add_widget_modal.define_widget.metric.${statistic.toLowerCase()}`,
  });

  const {
    data: series = [],
    isPending,
    isError,
  } = useOrgIssueResolutionLineChartWidgetData({
    entityId: branchEntityId,
    entityType: 'PROJECT_BRANCH',
    historyRange,
    measureFilters,
    metricName,
    statistic,
  });

  const isMttr = statistic !== IssueResolutionStatistic.ResolvedIssues;
  const formatMttr = useCallback(
    (value: number, compact = false) => {
      const { id, values } = getMttrCalendarMessage(value, { compact });
      return formatMessage({ id }, values);
    },
    [formatMessage],
  );

  const formatDotValueFn = useCallback(
    (value: number) =>
      isMttr ? <Text isHighlighted>{formatMttr(value)}</Text> : formatDotValue(value, false),
    [formatMttr, isMttr],
  );

  const formatTickFn = useCallback(
    (tick: number) => (isMttr ? formatMttr(tick, true) : formatYAxisTick(tick, false)),
    [formatMttr, isMttr],
  );

  const lineChartProps: ProjectDashboardLineChartProps = {
    ariaLabel: formatMessage(
      { id: 'project_dashboard.widget.line_chart.aria_label' },
      { metric: metricName },
    ),
    formatDotValue: formatDotValueFn,
    formatTick: formatTickFn,
    hasFetchError: isError,
    isMetricRating: false,
    isPending,
    metricName,
    padding: [20, 20, 40, 60],
    series,
    showLegend,
    showTooltip: true,
    strokeWidth: 2,
  };

  return <ProjectLineChartShell {...lineChartProps} historyRange={historyRange} />;
}

function IssueDensityProjectLineChartView(props: Readonly<IssueDensityProjectLineChartViewProps>) {
  const { branchEntityId, historyRange, metric, showLegend = false } = props;
  const { formatMessage } = useIntl();
  const { measureFilters } = metric;
  const metricName = formatMessage({
    id: 'dashboard.add_widget_modal.define_widget.metric.issue_density',
  });

  const {
    data: series = [],
    isPending,
    isError,
  } = useOrgIssueDensityLineChartWidgetData({
    entityId: branchEntityId,
    entityType: 'PROJECT_BRANCH',
    historyRange,
    measureFilters,
    metricName,
  });

  const lineChartProps: ProjectDashboardLineChartProps = {
    ariaLabel: formatMessage(
      { id: 'project_dashboard.widget.line_chart.aria_label' },
      { metric: metricName },
    ),
    formatDotValue: (value: number) => formatDotValue(value, false),
    formatTick: (tick: number) => formatYAxisTick(tick, false),
    hasFetchError: isError,
    isMetricRating: false,
    isPending,
    metricName,
    padding: [20, 20, 40, 60],
    series,
    showLegend,
    showTooltip: true,
    strokeWidth: 2,
  };

  return <ProjectLineChartShell {...lineChartProps} historyRange={historyRange} />;
}

function ScaResolutionProjectLineChartView(
  props: Readonly<ScaResolutionProjectLineChartViewProps>,
) {
  const { branchEntityId, historyRange, metric, showLegend = false } = props;
  const { formatMessage } = useIntl();
  const { formatMttrDotValue, formatMttrTick } = useMttrFormatters();
  const metricName = formatMessage({
    id: 'dashboard.add_widget_modal.define_widget.metric.sca_mttr',
  });
  const {
    data: series = [],
    isPending,
    isError,
  } = useOrgScaResolutionLineChartWidgetData({
    entityId: branchEntityId,
    entityType: 'PROJECT_BRANCH',
    historyRange,
    measureFilters: metric.measureFilters,
    metricName,
  });

  const lineChartProps: ProjectDashboardLineChartProps = {
    ariaLabel: formatMessage(
      { id: 'project_dashboard.widget.line_chart.aria_label' },
      { metric: metricName },
    ),
    formatDotValue: formatMttrDotValue,
    formatTick: formatMttrTick,
    hasFetchError: isError,
    isMetricRating: false,
    isPending,
    metricName,
    padding: [20, 20, 40, 60],
    series,
    showLegend,
    showTooltip: true,
    strokeWidth: 2,
  };

  return <ProjectLineChartShell {...lineChartProps} historyRange={historyRange} />;
}

function ProjectLineChartWidgetOrganizationsView(props: OrgBranchViewProps) {
  const { branchEntityId, organization, widget } = props;
  const lineChartProps = useProjectLineChartModelOrganizations(
    branchEntityId,
    organization,
    widget,
  );

  return <ProjectLineChartShell {...lineChartProps} historyRange={widget.historyRange} />;
}

export function ProjectLineChartWidgetWrapper(
  props: Readonly<ProjectDashboardWidgetPropMap['lineChart']>,
) {
  const { isLoading, organization, projectEntityId } = useDashboardProjectContext();

  if (isLoading) {
    return <WidgetLoadingSpinner />;
  }
  if (!projectEntityId) {
    return <WidgetNoData />;
  }

  if (props.metric.type === DashboardMetricType.IssueResolution) {
    return (
      <IssueResolutionProjectLineChartView
        branchEntityId={projectEntityId}
        historyRange={props.historyRange}
        metric={props.metric}
        showLegend={props.showLegend}
      />
    );
  }

  if (props.metric.type === DashboardMetricType.IssueDensity) {
    return (
      <IssueDensityProjectLineChartView
        branchEntityId={projectEntityId}
        historyRange={props.historyRange}
        metric={props.metric}
        showLegend={props.showLegend}
      />
    );
  }

  if (props.metric.type === DashboardMetricType.ScaResolution) {
    return (
      <ScaResolutionProjectLineChartView
        branchEntityId={projectEntityId}
        historyRange={props.historyRange}
        metric={props.metric}
        showLegend={props.showLegend}
      />
    );
  }

  return (
    <ProjectLineChartWidgetOrganizationsView
      branchEntityId={projectEntityId}
      organization={organization}
      widget={props}
    />
  );
}
