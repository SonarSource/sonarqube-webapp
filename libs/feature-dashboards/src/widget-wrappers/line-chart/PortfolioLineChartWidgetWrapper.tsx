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

import { Text } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { useOrgIssueDensityLineChartWidgetData } from '~adapters/queries/issue-density-widget-data';
import { useOrgIssueResolutionLineChartWidgetData } from '~adapters/queries/issue-resolution-widget-data';
import {
  organizationLineChartRequestKey,
  useOrganizationLineChartSeriesData,
} from '~adapters/queries/line-chart-widget-data';
import { usePortfolioRulesMetadataOrganization } from '~adapters/queries/portfolio-widget-organization-data';
import { useOrgScaResolutionLineChartWidgetData } from '~adapters/queries/sca-resolution-widget-data';
import { useDashboardRuleLabels } from '~adapters/queries/widget-rule-metadata';
import { MetricKey } from '~shared/types/metrics';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import {
  formatDotValue,
  formatYAxisTick,
} from '../../components/visualizations/line-chart/lineChartPresentation';
import { HistoryRange, LineChartGroupBy } from '../../data/widgets/line-chart';
import { DashboardMetricType } from '../../data/widgets/shared';
import { useLineChartMetricCharacteristics } from '../../hooks/useLineChartMetricCharacteristics';
import { useMttrFormatters } from '../../hooks/useMttrFormatters';
import { PortfolioDashboardWidgetPropMap } from '../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import { getMttrCalendarMessage } from '../../utils/datetime';
import {
  relabelMultiLineSeriesWithRules,
  rulesFromGroupedLineChartSeries,
} from '../../utils/lineChartSeriesTransforms';
import { LineChartWidgetShell, type LineChartWidgetShellProps } from './LineChartWidgetShell';

export type PortfolioDashboardLineChartProps = Readonly<
  Omit<LineChartWidgetShellProps, 'historyRange'>
>;

type IssueResolutionMetric = Extract<
  PortfolioDashboardWidgetPropMap['lineChart']['metric'],
  { type: DashboardMetricType.IssueResolution }
>;

type IssueDensityMetric = Extract<
  PortfolioDashboardWidgetPropMap['lineChart']['metric'],
  { type: DashboardMetricType.IssueDensity }
>;

type ScaResolutionMetric = Extract<
  PortfolioDashboardWidgetPropMap['lineChart']['metric'],
  { type: DashboardMetricType.ScaResolution }
>;

interface IssueResolutionPortfolioLineChartViewProps {
  historyRange: HistoryRange;
  metric: IssueResolutionMetric;
  portfolioId: string;
  showLegend?: boolean;
}

interface IssueDensityPortfolioLineChartViewProps {
  historyRange: HistoryRange;
  metric: IssueDensityMetric;
  portfolioId: string;
  showLegend?: boolean;
}

interface ScaResolutionPortfolioLineChartViewProps {
  historyRange: HistoryRange;
  metric: ScaResolutionMetric;
  portfolioId: string;
  showLegend?: boolean;
}

/** Fetches series data and builds props for {@link MultiLineChart}. Exported for unit tests only. */
export function usePortfolioLineChartModel(
  props: Readonly<PortfolioDashboardWidgetPropMap['lineChart']>,
  portfolioId: string,
): PortfolioDashboardLineChartProps {
  const { formatMessage } = useIntl();
  const { groupBy, historyRange, metric, scope, showLegend = false } = props;
  const { actualMetricKey, isMetricRating, measureFilters, metricMetadata } =
    useLineChartMetricCharacteristics(metric);

  // actualMetricKey is always defined here — IssueResolution metrics are routed to
  // IssueResolutionPortfolioLineChartView before reaching this function.
  const measuresHistoryKey = organizationLineChartRequestKey(
    metric,
    scope,
    actualMetricKey as MetricKey,
  );
  const metricName =
    metricMetadata?.name ?? formatMessage({ id: `metric.${String(actualMetricKey)}.name` });

  const { isMeasuresHistoryPending, lineChartHasFetchError, series } =
    useOrganizationLineChartSeriesData({
      actualMetricKey,
      entityId: portfolioId,
      entityType: 'PORTFOLIO',
      groupBy,
      historyRange,
      measureFilters,
      metric,
      metricName,
      metricType: metricMetadata?.type,
      measuresHistoryKey,
      queriesEnabled: Boolean(portfolioId),
    });

  const isGroupedByRule = groupBy === LineChartGroupBy.Rule;
  const ruleKeys = useMemo(
    () => (isGroupedByRule ? rulesFromGroupedLineChartSeries(series) : []),
    [isGroupedByRule, series],
  );
  const { isLoading: isResolvingOrganization, organization } =
    usePortfolioRulesMetadataOrganization(portfolioId, {
      enabled: isGroupedByRule && Boolean(portfolioId),
    });

  const {
    isError: isRuleLabelsError,
    isPending: isRuleLabelsPending,
    rulesByKey,
  } = useDashboardRuleLabels({
    enabled: isGroupedByRule && Boolean(portfolioId),
    entity: { isResolvingOrganization, organization, type: 'PORTFOLIO' },
    ruleKeys,
  });

  const labelledSeries = useMemo(
    () => (isGroupedByRule ? relabelMultiLineSeriesWithRules(series, groupBy, rulesByKey) : series),
    [groupBy, isGroupedByRule, rulesByKey, series],
  );

  const showLegendInFooter = showLegend && !isMetricRating;
  const lineChartAriaLabel = formatMessage(
    { id: 'portfolio_dashboard.widget.line_chart.aria_label' },
    { metric: metricName },
  );

  return {
    ariaLabel: lineChartAriaLabel,
    formatDotValue: (value: number) => formatDotValue(value, isMetricRating),
    formatTick: (tick: number) => formatYAxisTick(tick, isMetricRating),
    hasFetchError: lineChartHasFetchError || isRuleLabelsError,
    isMetricRating,
    isPending: isMeasuresHistoryPending || isRuleLabelsPending,
    metricName,
    series: labelledSeries,
    showLegend: showLegendInFooter,
    showTooltip: true,
  };
}

function PortfolioStandardLineChartView(
  props: Readonly<{
    portfolioId: string;
    widget: Readonly<PortfolioDashboardWidgetPropMap['lineChart']>;
  }>,
) {
  const { portfolioId, widget } = props;
  const lineChartProps = usePortfolioLineChartModel(widget, portfolioId);

  return <LineChartWidgetShell {...lineChartProps} historyRange={widget.historyRange} />;
}

function IssueResolutionPortfolioLineChartView(
  props: Readonly<IssueResolutionPortfolioLineChartViewProps>,
) {
  const { historyRange, metric, portfolioId, showLegend = false } = props;
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
    entityId: portfolioId,
    entityType: 'PORTFOLIO',
    historyRange,
    measureFilters,
    metricName,
    statistic,
  });

  const isMttr = statistic !== IssueResolutionStatistic.ResolvedIssues;
  const ariaLabel = formatMessage(
    { id: 'portfolio_dashboard.widget.line_chart.aria_label' },
    { metric: metricName },
  );
  const formatMttr = (value: number, compact = false) => {
    const { id, values } = getMttrCalendarMessage(value, { compact });
    return formatMessage({ id }, values);
  };
  const formatTickFn = (tick: number) =>
    isMttr ? formatMttr(tick, true) : formatYAxisTick(tick, false);
  const formatDotValueFn = (value: number) =>
    isMttr ? <Text isHighlighted>{formatMttr(value)}</Text> : formatDotValue(value, false);

  return (
    <LineChartWidgetShell
      ariaLabel={ariaLabel}
      formatDotValue={formatDotValueFn}
      formatTick={formatTickFn}
      hasFetchError={isError}
      historyRange={historyRange}
      isMetricRating={false}
      isPending={isPending}
      metricName={metricName}
      series={series}
      showLegend={showLegend}
      showTooltip
    />
  );
}

function IssueDensityPortfolioLineChartView(
  props: Readonly<IssueDensityPortfolioLineChartViewProps>,
) {
  const { historyRange, metric, portfolioId, showLegend = false } = props;
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
    entityId: portfolioId,
    entityType: 'PORTFOLIO',
    historyRange,
    measureFilters,
    metricName,
  });

  const ariaLabel = formatMessage(
    { id: 'portfolio_dashboard.widget.line_chart.aria_label' },
    { metric: metricName },
  );

  return (
    <LineChartWidgetShell
      ariaLabel={ariaLabel}
      formatDotValue={(value: number) => formatDotValue(value, false)}
      formatTick={(tick: number) => formatYAxisTick(tick, false)}
      hasFetchError={isError}
      historyRange={historyRange}
      isMetricRating={false}
      isPending={isPending}
      metricName={metricName}
      series={series}
      showLegend={showLegend}
      showTooltip
    />
  );
}

function ScaResolutionPortfolioLineChartView(
  props: Readonly<ScaResolutionPortfolioLineChartViewProps>,
) {
  const { historyRange, metric, portfolioId, showLegend = false } = props;
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
    entityId: portfolioId,
    entityType: 'PORTFOLIO',
    historyRange,
    measureFilters: metric.measureFilters,
    metricName,
  });
  const ariaLabel = formatMessage(
    { id: 'portfolio_dashboard.widget.line_chart.aria_label' },
    { metric: metricName },
  );

  return (
    <LineChartWidgetShell
      ariaLabel={ariaLabel}
      formatDotValue={formatMttrDotValue}
      formatTick={formatMttrTick}
      hasFetchError={isError}
      historyRange={historyRange}
      isMetricRating={false}
      isPending={isPending}
      metricName={metricName}
      series={series}
      showLegend={showLegend}
      showTooltip
    />
  );
}

export function PortfolioLineChartWidgetWrapper(
  props: Readonly<PortfolioDashboardWidgetPropMap['lineChart']>,
) {
  const { portfolioId } = useDashboardPortfolioContext();

  if (!portfolioId) {
    return <WidgetNoData />;
  }

  if (props.metric.type === DashboardMetricType.IssueResolution) {
    return (
      <IssueResolutionPortfolioLineChartView
        historyRange={props.historyRange}
        metric={props.metric}
        portfolioId={portfolioId}
        showLegend={props.showLegend}
      />
    );
  }

  if (props.metric.type === DashboardMetricType.IssueDensity) {
    return (
      <IssueDensityPortfolioLineChartView
        historyRange={props.historyRange}
        metric={props.metric}
        portfolioId={portfolioId}
        showLegend={props.showLegend}
      />
    );
  }

  if (props.metric.type === DashboardMetricType.ScaResolution) {
    return (
      <ScaResolutionPortfolioLineChartView
        historyRange={props.historyRange}
        metric={props.metric}
        portfolioId={portfolioId}
        showLegend={props.showLegend}
      />
    );
  }

  return <PortfolioStandardLineChartView portfolioId={portfolioId} widget={props} />;
}
