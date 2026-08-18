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

import { useOrgScaResolutionCountWidgetData } from '~adapters/queries/sca-resolution-widget-data';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { CountWidget } from '../../components/visualizations/CountWidget';
import { DashboardMetric, DashboardMetricType } from '../../data/widgets/shared';
import { useMttrFormatters } from '../../hooks/useMttrFormatters';
import { EntityType } from '../../types/organization-issue-count-history';
import { ScaResolutionStatistic } from '../../types/organization-sca-resolution-history';
import { SCA_RESOLUTION_METRIC_DIRECTION } from '../../types/widget-common';
import { computeTrendData } from '../../utils/countWidgetTrend';

interface Props {
  entityId: string;
  entityType: EntityType;
  metric: Extract<DashboardMetric, { type: DashboardMetricType.ScaResolution }>;
  showTrendIndicator: boolean;
}

export function ScaResolutionCountWidgetWrapper({
  entityId,
  entityType,
  metric,
  showTrendIndicator,
}: Readonly<Props>) {
  const { formatMttr } = useMttrFormatters();
  const { data, isPending } = useOrgScaResolutionCountWidgetData({
    entityId,
    entityType,
    measureFilters: metric.measureFilters,
  });

  if (isPending) {
    return <WidgetLoadingSpinner />;
  }

  if (data?.latestValue === null || data?.latestValue === undefined) {
    return <WidgetNoData />;
  }

  const { latestValue, sparklineSeries, trend } = data;
  const direction = SCA_RESOLUTION_METRIC_DIRECTION[ScaResolutionStatistic.ScaMTTR];
  const trendData =
    trend.current !== null && trend.past !== null
      ? computeTrendData({
          absoluteChangeFormatter: formatMttr,
          // SCA MTTR has no drilldown target yet; '#' keeps the trend badge unlinked.
          activityUrl: { pathname: '#' },
          currentValue: trend.current,
          measureFilters: undefined,
          metric: {
            direction,
            type: MetricType.Integer,
          },
          metricDirectionOverride: direction,
          pastValue: trend.past,
        })
      : null;

  return (
    <CountWidget
      metricKey={MetricKey.violations}
      metricType="MTTR_CALENDAR"
      showTrendIndicator={showTrendIndicator}
      sparklineSeries={showTrendIndicator ? sparklineSeries : undefined}
      trendIndicatorData={{ isPending, trendData }}
      value={formatMttr(latestValue)}
    />
  );
}
