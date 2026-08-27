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

import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { getPortfolioDashboardWidgetDrilldownUrl } from '~adapters/helpers/dashboard-widget-urls';
import {
  useOrgIssueCountWidgetData,
  useOrgMeasuresCountWidgetData,
} from '~adapters/queries/count-widget-data';
import { usePortfolioWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { parsePortfolioMetricDirection } from '~shared/helpers/metrics';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { CountWidget } from '../../components/visualizations/CountWidget';
import { useOptionalWidgetInstanceContext } from '../../dashboard-layout/shared/WidgetInstanceContext';
import { DashboardMetric, DashboardMetricType } from '../../data/widgets/shared';
import { CodeScope } from '../../types/widget-common';
import { computeTrendData } from '../../utils/countWidgetTrend';
import { isCountWidgetTrendVisible } from '../../utils/countWidgetTrendIndicator';
import { getPortfolioDashboardMeasureRequestKey } from '../../utils/portfolioMeasures';
import { resolveRichCountTrendMetricMetadata } from '../../utils/portfolioWidgetData';
import { getActualMetricKey } from '../../widget-creation-modal/utils/getActualMetricKey';
import { IssueDensityCountWidgetWrapper } from '../common/IssueDensityCountWidgetWrapper';
import { IssueResolutionCountWidgetWrapper } from '../common/IssueResolutionCountWidgetWrapper';
import { ScaResolutionCountWidgetWrapper } from '../common/ScaResolutionCountWidgetWrapper';

interface Props {
  metric: DashboardMetric;
  scope: CodeScope;
  showTrendIndicator?: boolean;
  /**
   * When true, the count widget is shown in contexts that should not nest another breakdown link
   * (e.g. portfolio breakdown preview).
   */
  suppressPortfolioDrilldownLink?: boolean;
}

function getPortfolioCountWidgetLink(
  isDrilldownEnabled: boolean,
  widgetKey: string | undefined,
): string | undefined {
  if (!isDrilldownEnabled || !widgetKey) {
    return undefined;
  }

  return getPortfolioDashboardWidgetDrilldownUrl(widgetKey);
}

function getMetricMetadata(
  portfolioMetrics: Array<{ direction: string; key: string; type: string }> | undefined,
  key: string,
):
  | {
      direction: number | undefined;
      key: string;
      name: string;
      type: string;
    }
  | undefined {
  const metric = portfolioMetrics?.find((candidate) => candidate.key === key);
  if (!metric) {
    return undefined;
  }
  return {
    direction: parsePortfolioMetricDirection(metric.direction),
    key: metric.key,
    name: metric.key,
    type: metric.type.toUpperCase(),
  };
}

function PortfolioRichCountWidget(
  props: Readonly<{
    linkTo?: string;
    metric: Extract<DashboardMetric, { type: DashboardMetricType.Rich }>;
    portfolioId: string;
    scope: CodeScope;
    showTrendIndicator: boolean;
  }>,
) {
  const { linkTo, metric, portfolioId, scope, showTrendIndicator } = props;
  const { measureFilters } = metric;
  const trendVisible = isCountWidgetTrendVisible(showTrendIndicator, metric, scope);
  const resolvedIssueMetricKey = getActualMetricKey(metric) as MetricKey;

  const {
    data: issueHistoryData,
    isError,
    isPending,
  } = useOrgIssueCountWidgetData({
    entityId: portfolioId,
    entityType: 'PORTFOLIO',
    measureFilters,
    resolvedIssueMetricKey,
    richMetricKey: metric.metricKey,
  });

  if (isError) {
    return <WidgetNoData messageKey="dashboard.widget.error" />;
  }

  const latestTotal = issueHistoryData?.latestTotal ?? null;
  const historicalValues = issueHistoryData?.historicalValues ?? null;
  const metricMetadata = resolveRichCountTrendMetricMetadata(resolvedIssueMetricKey);

  if (isPending) {
    return <WidgetLoadingSpinner />;
  }

  if (latestTotal === null) {
    return <WidgetNoData />;
  }

  const trendData =
    historicalValues?.current && historicalValues?.past
      ? computeTrendData({
          activityUrl: { pathname: '#' },
          currentValue: historicalValues.current,
          measureFilters,
          metric: metricMetadata,
          pastValue: historicalValues.past,
        })
      : null;

  return (
    <CountWidget
      linkTo={linkTo}
      metricKey={resolvedIssueMetricKey}
      metricType={MetricType.Integer}
      showTrendIndicator={trendVisible}
      sparklineSeries={trendVisible ? (issueHistoryData?.sparklineSeries ?? []) : undefined}
      trendIndicatorData={{
        isPending,
        trendData,
      }}
      value={String(latestTotal)}
    />
  );
}

function PortfolioRawCountWidget(
  props: Readonly<{
    linkTo?: string;
    metric: Extract<DashboardMetric, { type: DashboardMetricType.Raw }>;
    portfolioId: string;
    scope: CodeScope;
    showTrendIndicator: boolean;
  }>,
) {
  const { linkTo, metric, portfolioId, scope, showTrendIndicator } = props;
  const isScopeNew = scope === CodeScope.New;
  const trendVisible = isCountWidgetTrendVisible(showTrendIndicator, metric, scope);
  const actualMetricKey = metric.metricKey;
  const { getPortfolioMetric } = useDashboardPortfolioContext();
  const metricKeyForRequest = getPortfolioDashboardMeasureRequestKey(actualMetricKey, isScopeNew);

  const {
    data: portfolioMetricsData,
    isError: isPortfolioMetricsError,
    isPending: isPortfolioMetricsPending,
  } = usePortfolioWidgetMetricMetadataQuery();
  const metricMetadata = getMetricMetadata(portfolioMetricsData?.metrics, actualMetricKey);
  const isMetricsListLoading = isPortfolioMetricsPending;
  const metricType = metricMetadata?.type;

  const {
    data: measuresHistoryData,
    isError,
    isPending,
  } = useOrgMeasuresCountWidgetData({
    entityId: portfolioId,
    entityType: 'PORTFOLIO',
    metricKeyForRequest,
    metricType,
  });

  const directionOverride = getPortfolioMetric(actualMetricKey)?.direction;

  const rawValue = measuresHistoryData?.latestValue;
  const historicalValues = measuresHistoryData?.trend;

  if (isError || isPortfolioMetricsError) {
    return <WidgetNoData messageKey="dashboard.widget.error" />;
  }

  if (isPending || isMetricsListLoading) {
    return <WidgetLoadingSpinner />;
  }

  if (rawValue === undefined) {
    return <WidgetNoData />;
  }

  const trendData =
    historicalValues?.current && historicalValues?.past && metricMetadata
      ? computeTrendData({
          activityUrl: { pathname: '#' },
          currentValue: historicalValues.current,
          measureFilters: undefined,
          metric: metricMetadata,
          metricDirectionOverride: directionOverride,
          pastValue: historicalValues.past,
        })
      : null;

  return (
    <CountWidget
      linkTo={linkTo}
      metricKey={actualMetricKey}
      metricType={
        metricType === MetricType.Data ? MetricType.Integer : (metricType ?? MetricType.Integer)
      }
      showTrendIndicator={trendVisible && Boolean(metricMetadata)}
      sparklineSeries={
        trendVisible && metricMetadata ? (measuresHistoryData?.sparklineSeries ?? []) : undefined
      }
      trendIndicatorData={
        metricMetadata
          ? {
              isPending,
              trendData,
            }
          : undefined
      }
      value={rawValue}
    />
  );
}

export function PortfolioCountWidgetWrapper(props: Readonly<Props>) {
  const {
    metric,
    scope,
    showTrendIndicator = false,
    suppressPortfolioDrilldownLink = false,
  } = props;
  const widgetInstance = useOptionalWidgetInstanceContext();
  const { portfolioId } = useDashboardPortfolioContext();
  const rawMetricSupportsDrilldown =
    metric.type !== DashboardMetricType.Raw || metric.metricKey !== MetricKey.project_branch_count;
  const metricSupportsDrilldown =
    metric.type !== DashboardMetricType.IssueResolution &&
    metric.type !== DashboardMetricType.IssueDensity &&
    metric.type !== DashboardMetricType.ScaResolution;

  const linkTo = getPortfolioCountWidgetLink(
    !suppressPortfolioDrilldownLink && metricSupportsDrilldown && rawMetricSupportsDrilldown,
    widgetInstance?.widgetKey,
  );

  if (metric.type === DashboardMetricType.Rich) {
    return (
      <PortfolioRichCountWidget
        linkTo={linkTo}
        metric={metric}
        portfolioId={portfolioId}
        scope={scope}
        showTrendIndicator={showTrendIndicator}
      />
    );
  }

  if (metric.type === DashboardMetricType.IssueResolution) {
    return (
      <IssueResolutionCountWidgetWrapper
        entityId={portfolioId}
        entityType="PORTFOLIO"
        linkTo={linkTo}
        metric={metric}
        showTrendIndicator={showTrendIndicator}
      />
    );
  }

  if (metric.type === DashboardMetricType.IssueDensity) {
    return (
      <IssueDensityCountWidgetWrapper
        entityId={portfolioId}
        entityType="PORTFOLIO"
        linkTo={linkTo}
        metric={metric}
        showTrendIndicator={showTrendIndicator}
      />
    );
  }

  if (metric.type === DashboardMetricType.ScaResolution) {
    return (
      <ScaResolutionCountWidgetWrapper
        entityId={portfolioId}
        entityType="PORTFOLIO"
        metric={metric}
        showTrendIndicator={showTrendIndicator}
      />
    );
  }

  return (
    <PortfolioRawCountWidget
      linkTo={linkTo}
      metric={metric}
      portfolioId={portfolioId}
      scope={scope}
      showTrendIndicator={showTrendIndicator}
    />
  );
}
