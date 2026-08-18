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

import { useDashboardProjectContext } from '~adapters/context/dashboardContext';
import {
  buildProjectRawCountWidgetLink,
  buildProjectRichCountWidgetLink,
  getProjectDashboardMeasureHistoryUrl,
} from '~adapters/helpers/dashboard-widget-urls';
import {
  useOrgIssueCountWidgetData,
  useOrgMeasuresCountWidgetData,
} from '~adapters/queries/count-widget-data';
import { useProjectLegacyIssueCountWidgetQuery } from '~adapters/queries/project-count-widget-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { CountWidget } from '../../components/visualizations/CountWidget';
import { DashboardMetric, DashboardMetricType } from '../../data/widgets/shared';
import { CodeScope } from '../../types/widget-common';
import { computeTrendData } from '../../utils/countWidgetTrend';
import { isCountWidgetTrendVisible } from '../../utils/countWidgetTrendIndicator';
import { resolveRichCountTrendMetricMetadata } from '../../utils/portfolioWidgetData';
import { getMetricKeyForScope } from '../../utils/projectWidgetData';
import { getActualMetricKey } from '../../widget-creation-modal/utils/getActualMetricKey';
import { IssueDensityCountWidgetWrapper } from '../common/IssueDensityCountWidgetWrapper';
import { IssueResolutionCountWidgetWrapper } from '../common/IssueResolutionCountWidgetWrapper';
import { ScaResolutionCountWidgetWrapper } from '../common/ScaResolutionCountWidgetWrapper';

interface Props {
  metric: DashboardMetric;
  scope: CodeScope;
  showTrendIndicator?: boolean;
}

function RichCountWidgetLegacy({
  component,
  metric,
  scope,
}: Readonly<{
  component: string;
  metric: Extract<DashboardMetric, { type: DashboardMetricType.Rich }>;
  scope: CodeScope;
}>) {
  // Org issue-count-history has no new-code (leak period) filter; legacy search only.
  const { measureFilters } = metric;

  const { data: issueCount, isLoading } = useProjectLegacyIssueCountWidgetQuery({
    componentKey: component,
    measureFilters,
    scope,
  });

  const actualMetricKey = getActualMetricKey(metric) as MetricKey;

  if (isLoading) {
    return <WidgetLoadingSpinner />;
  }

  if (issueCount === undefined) {
    return <WidgetNoData />;
  }

  return (
    <CountWidget
      linkTo={buildProjectRichCountWidgetLink(component, measureFilters, scope)}
      metricKey={actualMetricKey}
      metricType={MetricType.Integer}
      showTrendIndicator={false}
      value={String(issueCount)}
    />
  );
}

function RichCountWidgetOrganizations({
  branchEntityId,
  componentKey,
  metric,
  scope,
  showTrendIndicator,
}: Readonly<{
  branchEntityId: string;
  componentKey: string;
  metric: Extract<DashboardMetric, { type: DashboardMetricType.Rich }>;
  scope: CodeScope;
  showTrendIndicator: boolean;
}>) {
  const trendVisible = isCountWidgetTrendVisible(showTrendIndicator, metric, scope);
  const { measureFilters } = metric;
  const resolvedIssueMetricKey = getActualMetricKey(metric) as MetricKey;

  const { data: issueHistoryData, isPending } = useOrgIssueCountWidgetData({
    entityId: branchEntityId,
    entityType: 'PROJECT_BRANCH',
    measureFilters,
    resolvedIssueMetricKey,
    richMetricKey: metric.metricKey,
  });

  const latestTotal = issueHistoryData?.latestTotal ?? null;
  const historicalValues = issueHistoryData?.historicalValues ?? null;
  const metricMetadata = resolveRichCountTrendMetricMetadata(resolvedIssueMetricKey);

  if (isPending) {
    return <WidgetLoadingSpinner />;
  }

  if (latestTotal === null) {
    return <WidgetNoData />;
  }

  const issuesUrl = buildProjectRichCountWidgetLink(componentKey, measureFilters, scope);
  const trendData =
    historicalValues?.current && historicalValues?.past
      ? computeTrendData({
          activityUrl: getProjectDashboardMeasureHistoryUrl(componentKey, resolvedIssueMetricKey),
          currentValue: historicalValues.current,
          measureFilters,
          metric: metricMetadata,
          pastValue: historicalValues.past,
        })
      : null;

  return (
    <CountWidget
      linkTo={issuesUrl}
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

function RawCountWidgetOrganizations({
  branchEntityId,
  componentKey,
  metric,
  scope,
  showTrendIndicator,
}: Readonly<{
  branchEntityId: string;
  componentKey: string;
  metric: Extract<DashboardMetric, { type: DashboardMetricType.Raw }>;
  scope: CodeScope;
  showTrendIndicator: boolean;
}>) {
  const isScopeNew = scope === CodeScope.New;
  const trendVisible = isCountWidgetTrendVisible(showTrendIndicator, metric, scope);
  const actualMetricKey = metric.metricKey;
  const metricKeyForRequest = getMetricKeyForScope(actualMetricKey, isScopeNew);

  const { data: metrics, isLoading: isMetricsListLoading } = useWidgetMetricMetadataQuery();
  const metricMetadata = metrics?.[actualMetricKey];
  const metricType = metricMetadata?.type;

  const { data: measuresHistoryData, isPending } = useOrgMeasuresCountWidgetData({
    entityId: branchEntityId,
    entityType: 'PROJECT_BRANCH',
    metricKeyForRequest,
    metricType,
  });

  const rawValue = measuresHistoryData?.latestValue;
  const historicalValues = measuresHistoryData?.trend;

  if (isPending || isMetricsListLoading) {
    return <WidgetLoadingSpinner />;
  }

  if (rawValue === undefined) {
    return <WidgetNoData />;
  }

  const measureUrl = buildProjectRawCountWidgetLink(componentKey, actualMetricKey, scope);
  const trendData =
    historicalValues?.current && historicalValues?.past && metricMetadata
      ? computeTrendData({
          activityUrl: getProjectDashboardMeasureHistoryUrl(componentKey, actualMetricKey),
          currentValue: historicalValues.current,
          measureFilters: undefined,
          metric: metricMetadata,
          pastValue: historicalValues.past,
        })
      : null;

  return (
    <CountWidget
      linkTo={measureUrl}
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

function ProjectCountWidgetOrganizationsView(
  props: Readonly<Props & { branchEntityId: string; componentKey: string }>,
) {
  const { branchEntityId, componentKey, metric, scope, showTrendIndicator = false } = props;

  if (metric.type === DashboardMetricType.Rich) {
    // Org issue-count-history has no new-code (leak period) filter; keep legacy search for New scope.
    if (scope === CodeScope.New) {
      return <RichCountWidgetLegacy component={componentKey} metric={metric} scope={scope} />;
    }

    return (
      <RichCountWidgetOrganizations
        branchEntityId={branchEntityId}
        componentKey={componentKey}
        metric={metric}
        scope={scope}
        showTrendIndicator={showTrendIndicator}
      />
    );
  }

  if (metric.type === DashboardMetricType.IssueResolution) {
    return (
      <IssueResolutionCountWidgetWrapper
        entityId={branchEntityId}
        entityType="PROJECT_BRANCH"
        metric={metric}
        showTrendIndicator={showTrendIndicator}
      />
    );
  }

  if (metric.type === DashboardMetricType.IssueDensity) {
    return (
      <IssueDensityCountWidgetWrapper
        entityId={branchEntityId}
        entityType="PROJECT_BRANCH"
        metric={metric}
        showTrendIndicator={showTrendIndicator}
      />
    );
  }

  if (metric.type === DashboardMetricType.ScaResolution) {
    return (
      <ScaResolutionCountWidgetWrapper
        entityId={branchEntityId}
        entityType="PROJECT_BRANCH"
        metric={metric}
        showTrendIndicator={showTrendIndicator}
      />
    );
  }

  return (
    <RawCountWidgetOrganizations
      branchEntityId={branchEntityId}
      componentKey={componentKey}
      metric={metric}
      scope={scope}
      showTrendIndicator={showTrendIndicator}
    />
  );
}

export function ProjectCountWidgetWrapper(props: Readonly<Props>) {
  const { componentKey, isLoading, projectEntityId } = useDashboardProjectContext();

  if (isLoading) {
    return <WidgetLoadingSpinner />;
  }

  if (!projectEntityId || !componentKey) {
    return <WidgetNoData />;
  }

  return (
    <ProjectCountWidgetOrganizationsView
      branchEntityId={projectEntityId}
      componentKey={componentKey}
      metric={props.metric}
      scope={props.scope}
      showTrendIndicator={props.showTrendIndicator}
    />
  );
}
