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
import { useOrgIssueDensityCountWidgetData } from '~adapters/queries/issue-density-widget-data';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { CountWidget } from '../../components/visualizations/CountWidget';
import { DashboardMetric, DashboardMetricType } from '../../data/widgets/shared';
import { EntityType } from '../../types/organization-issue-count-history';
import { computeTrendData } from '../../utils/countWidgetTrend';

interface Props {
  entityId: string;
  entityType: EntityType;
  linkTo?: string;
  metric: Extract<DashboardMetric, { type: DashboardMetricType.IssueDensity }>;
  showTrendIndicator: boolean;
}

export function IssueDensityCountWidgetWrapper({
  entityId,
  entityType,
  linkTo,
  metric,
  showTrendIndicator,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { data, isPending } = useOrgIssueDensityCountWidgetData({
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
  const formattedValue = String(latestValue);

  const trendData =
    trend.current !== null && trend.past !== null
      ? computeTrendData({
          activityUrl: { pathname: '#' },
          currentValue: trend.current,
          measureFilters: undefined,
          metric: {
            direction: -1,
            type: MetricType.Float,
          },
          metricDirectionOverride: -1,
          pastValue: trend.past,
        })
      : null;

  return (
    <CountWidget
      linkTo={linkTo}
      metricKey={MetricKey.violations}
      metricType={MetricType.Float}
      showTrendIndicator={showTrendIndicator}
      sparklineSeries={showTrendIndicator ? sparklineSeries : undefined}
      trendIndicatorData={{ isPending, trendData }}
      unitLabel={formatMessage({ id: 'dashboard.widget.count.issue_density.unit' })}
      value={formattedValue}
    />
  );
}
