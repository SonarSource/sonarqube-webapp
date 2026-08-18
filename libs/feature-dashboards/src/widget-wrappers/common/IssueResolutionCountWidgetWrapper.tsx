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
import { useOrgIssueResolutionCountWidgetData } from '~adapters/queries/issue-resolution-widget-data';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { CountWidget } from '../../components/visualizations/CountWidget';
import { DashboardMetric, DashboardMetricType } from '../../data/widgets/shared';
import { EntityType } from '../../types/organization-issue-count-history';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import { ISSUE_RESOLUTION_METRIC_DIRECTION } from '../../types/widget-common';
import { computeTrendData } from '../../utils/countWidgetTrend';
import { getMttrCalendarMessage } from '../../utils/datetime';

interface Props {
  entityId: string;
  entityType: EntityType;
  linkTo?: string;
  metric: Extract<DashboardMetric, { type: DashboardMetricType.IssueResolution }>;
  showTrendIndicator: boolean;
}

export function IssueResolutionCountWidgetWrapper({
  entityId,
  entityType,
  linkTo,
  metric,
  showTrendIndicator,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { statistic } = metric;

  const { data, isPending } = useOrgIssueResolutionCountWidgetData({
    entityId,
    entityType,
    measureFilters: metric.measureFilters,
    statistic,
  });

  if (isPending) {
    return <WidgetLoadingSpinner />;
  }

  if (data?.latestValue === null || data?.latestValue === undefined) {
    return <WidgetNoData />;
  }

  const { latestValue, sparklineSeries, trend } = data;
  const isMttrStatistic = statistic !== IssueResolutionStatistic.ResolvedIssues;
  const formatMttr = (value: number) => {
    const { id, values } = getMttrCalendarMessage(value);
    return formatMessage({ id }, values);
  };
  const formattedValue = isMttrStatistic
    ? formatMttr(latestValue)
    : String(Math.round(latestValue));

  const direction = ISSUE_RESOLUTION_METRIC_DIRECTION[statistic];
  const trendData =
    trend.current !== null && trend.past !== null
      ? computeTrendData({
          absoluteChangeFormatter: isMttrStatistic ? formatMttr : undefined,
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
      linkTo={linkTo}
      metricKey={MetricKey.violations}
      metricType={isMttrStatistic ? 'MTTR_CALENDAR' : MetricType.Integer}
      showTrendIndicator={showTrendIndicator}
      sparklineSeries={showTrendIndicator ? sparklineSeries : undefined}
      trendIndicatorData={{ isPending, trendData }}
      value={formattedValue}
    />
  );
}
