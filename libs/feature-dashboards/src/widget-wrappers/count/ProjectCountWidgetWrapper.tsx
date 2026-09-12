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

import { useIntl } from 'react-intl';
import { useDashboardProjectContext } from '~adapters/context/dashboardContext';
import {
  buildProjectRawCountWidgetLink,
  buildProjectRichCountWidgetLink,
  getProjectDashboardMeasureHistoryUrl,
} from '~adapters/helpers/dashboard-widget-urls';
import { useDashboardMeasureQuery } from '~adapters/queries/dashboard-measure';
import { useProjectIssueCountSearchQuery } from '~adapters/queries/project-count-widget-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { CountWidget } from '../../components/visualizations/CountWidget';
import { dashboardMetricToMeasure, type DashboardMeasure } from '../../data/dashboard-measure';
import { dashboardMeasureMetricKey } from '../../data/dashboard-measure-history';
import type { Props } from '../../data/widgets/count';
import { DashboardMetricType, type DashboardMetric } from '../../data/widgets/shared';
import { useMttrFormatters } from '../../hooks/useMttrFormatters';
import { CodeScope } from '../../types/widget-common';
import { getDashboardMetricDirectionOverride } from '../../utils/countWidgetTrend';
import { isCountWidgetTrendVisible } from '../../utils/countWidgetTrendIndicator';
import { getActualMetricKey } from '../../widget-creation-modal/utils/getActualMetricKey';
import {
  buildCountWidgetPresentation,
  dashboardCountHistoryMonths,
} from './countWidgetPresentation';

interface HistoryCountProps extends Props {
  componentKey: string;
  measure: DashboardMeasure;
}

function getCountWidgetLink(componentKey: string, metric: DashboardMetric, scope: CodeScope) {
  if (metric.type === DashboardMetricType.Raw) {
    return buildProjectRawCountWidgetLink(componentKey, metric.metricKey, scope);
  }
  if (metric.type === DashboardMetricType.Rich) {
    return buildProjectRichCountWidgetLink(componentKey, metric.measureFilters, scope);
  }
  return undefined;
}

function ProjectHistoryCountWidget(props: Readonly<HistoryCountProps>) {
  const { formatMttr } = useMttrFormatters();
  const { formatDate, formatMessage } = useIntl();
  const { projectEntityId } = useDashboardProjectContext();
  const { componentKey, measure, metric, scope, showTrendIndicator = false } = props;
  const trendVisible = isCountWidgetTrendVisible(showTrendIndicator, metric, scope);
  const months = dashboardCountHistoryMonths(metric, trendVisible);
  const query = useDashboardMeasureQuery(
    {
      entityId: projectEntityId ?? '',
      entityType: 'PROJECT_BRANCH',
      measure,
      months,
    },
    Boolean(projectEntityId),
  );
  const metadataQuery = useWidgetMetricMetadataQuery();

  if (query.isPending || (measure.api === 'measures-history' && metadataQuery.isPending)) {
    return <WidgetLoadingSpinner />;
  }
  if (!projectEntityId || !componentKey) {
    return <WidgetNoData />;
  }
  if (query.isError || (measure.api === 'measures-history' && metadataQuery.isError)) {
    return <WidgetNoData messageKey="dashboard.widget.error" />;
  }

  const metricKey = dashboardMeasureMetricKey(measure);
  const metadata = metadataQuery.data?.[metricKey];
  const presentation = buildCountWidgetPresentation({
    activityUrl: getProjectDashboardMeasureHistoryUrl(componentKey, metricKey),
    data: query.data,
    formatDate,
    formatMessage,
    formatMttr,
    measure,
    metadataType: metadata?.type,
    metric,
    metricDirection: metadata?.direction ?? -1,
    metricDirectionOverride: getDashboardMetricDirectionOverride(metric),
    trendVisible,
  });
  if (presentation === null) {
    return <WidgetNoData />;
  }

  return <CountWidget {...presentation} linkTo={getCountWidgetLink(componentKey, metric, scope)} />;
}

function ProjectNewCodeRichCountWidget({
  componentKey,
  metric,
}: Readonly<{
  componentKey: string;
  metric: Extract<DashboardMetric, { type: DashboardMetricType.Rich }>;
}>) {
  // issue-count-history cannot filter by the leak period. Keep this snapshot-only path until the
  // persisted dashboard schema migration normalizes unsupported new-code configurations.
  const { data: issueCount, isLoading } = useProjectIssueCountSearchQuery({
    componentKey,
    measureFilters: metric.measureFilters,
    scope: CodeScope.New,
  });
  const metricKey = getActualMetricKey(metric) as MetricKey;

  if (isLoading) {
    return <WidgetLoadingSpinner />;
  }
  if (issueCount === undefined) {
    return <WidgetNoData />;
  }

  return (
    <CountWidget
      linkTo={buildProjectRichCountWidgetLink(componentKey, metric.measureFilters, CodeScope.New)}
      metricKey={metricKey}
      metricType={MetricType.Integer}
      showTrendIndicator={false}
      value={String(issueCount)}
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
  if (props.metric.type === DashboardMetricType.Rich && props.scope === CodeScope.New) {
    return <ProjectNewCodeRichCountWidget componentKey={componentKey} metric={props.metric} />;
  }

  return (
    <ProjectHistoryCountWidget
      {...props}
      componentKey={componentKey}
      measure={dashboardMetricToMeasure(props.metric, props.scope)}
    />
  );
}
