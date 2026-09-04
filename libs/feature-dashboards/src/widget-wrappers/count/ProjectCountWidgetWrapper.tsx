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
import { useProjectLegacyIssueCountWidgetQuery } from '~adapters/queries/project-count-widget-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { CountWidget } from '../../components/visualizations/CountWidget';
import { dashboardMetricToMeasure, type DashboardMeasure } from '../../data/dashboard-measure';
import {
  dashboardCountMetricType,
  dashboardMeasureHistoryValues,
  dashboardMeasureMetricKey,
} from '../../data/dashboard-measure-history';
import type { Props } from '../../data/widgets/count';
import { DashboardMetricType, type DashboardMetric } from '../../data/widgets/shared';
import { useMttrFormatters } from '../../hooks/useMttrFormatters';
import { CodeScope } from '../../types/widget-common';
import {
  computeDashboardMeasureTrendData,
  getDashboardMetricDirectionOverride,
} from '../../utils/countWidgetTrend';
import { isCountWidgetTrendVisible } from '../../utils/countWidgetTrendIndicator';
import { getActualMetricKey } from '../../widget-creation-modal/utils/getActualMetricKey';

interface HistoryCountProps extends Props {
  componentKey: string;
  measure: DashboardMeasure;
}

function ProjectHistoryCountWidget(props: Readonly<HistoryCountProps>) {
  const { formatMttr } = useMttrFormatters();
  const { formatMessage } = useIntl();
  const { projectEntityId } = useDashboardProjectContext();
  const { componentKey, measure, metric, scope, showTrendIndicator = false } = props;
  const trendVisible = isCountWidgetTrendVisible(showTrendIndicator, metric, scope);
  const months = trendVisible ? 1 : undefined;
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

  const measureFilters =
    metric.type === DashboardMetricType.Rich ? metric.measureFilters : undefined;
  const values = dashboardMeasureHistoryValues(
    query.data,
    measure,
    metadataQuery.data?.[dashboardMeasureMetricKey(measure)]?.type,
    measureFilters,
  );
  const latest = values.at(-1);
  if (latest === undefined) {
    return <WidgetNoData />;
  }

  const metricKey = dashboardMeasureMetricKey(measure);
  const metricType = dashboardCountMetricType(measure, metadataQuery.data?.[metricKey]?.type);
  const isMttr = metricType === 'MTTR_CALENDAR';
  const trendMetric = {
    direction: metadataQuery.data?.[metricKey]?.direction ?? -1,
    type: metricType,
  };
  const trendData = computeDashboardMeasureTrendData({
    activityUrl: getProjectDashboardMeasureHistoryUrl(componentKey, metricKey),
    formatMttr,
    isMttr,
    measureFilters,
    metric: trendMetric,
    metricDirectionOverride: getDashboardMetricDirectionOverride(metric),
    values,
  });
  let linkTo;
  if (metric.type === DashboardMetricType.Raw) {
    linkTo = buildProjectRawCountWidgetLink(componentKey, metric.metricKey, scope);
  } else if (metric.type === DashboardMetricType.Rich) {
    linkTo = buildProjectRichCountWidgetLink(componentKey, metric.measureFilters, scope);
  }

  return (
    <CountWidget
      linkTo={linkTo}
      metricKey={metricKey}
      metricType={metricType}
      showTrendIndicator={trendVisible}
      sparklineSeries={trendVisible ? values : undefined}
      trendIndicatorData={{ isPending: false, trendData }}
      unitLabel={
        measure.api === 'issue-density-history'
          ? formatMessage({ id: 'dashboard.widget.count.issue_density.unit' })
          : undefined
      }
      value={isMttr ? formatMttr(latest) : String(latest)}
    />
  );
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
  const { data: issueCount, isLoading } = useProjectLegacyIssueCountWidgetQuery({
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
