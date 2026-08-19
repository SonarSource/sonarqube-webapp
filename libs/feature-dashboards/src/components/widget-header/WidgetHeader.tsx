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
import { getDashboardLocalizedMetricName } from '~adapters/helpers/l10n';
import { MetricKey } from '~shared/types/metrics';
import { WidgetFilterLine } from '../../dashboard-layout/shared/WidgetFilterLine';
import { WidgetHeaderTitle } from '../../dashboard-layout/shared/WidgetHeaderTitle';
import type { LineChartGroupByValue } from '../../data/widgets/line-chart';
import type { DashboardMetric, TopListWidgetProps } from '../../types/dashboard-widget';
import type { CodeScope } from '../../types/widget-common';
import { getTopListWidgetTitle } from '../visualizations/top-list/topListWidgetTitle';
import { getMetricWidgetHeaderText, getRatingWidgetHeaderText } from './widgetHeaderText';

type Props =
  | {
      filterLineScopeOnly?: boolean;
      metric: DashboardMetric;
      scope: CodeScope;
      titleOverride?: string;
    }
  | {
      groupBy: LineChartGroupByValue;
      historyRange: string;
      metric: DashboardMetric;
      scope: CodeScope;
    }
  | { metricKey: MetricKey; scope: CodeScope };

export function WidgetHeader(props: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const headerText =
    'metric' in props
      ? getMetricWidgetHeaderText({
          filterLineScopeOnly:
            'filterLineScopeOnly' in props ? props.filterLineScopeOnly : undefined,
          formatMessage,
          getLocalizedMetricName: getDashboardLocalizedMetricName,
          groupBy: 'groupBy' in props ? props.groupBy : undefined,
          hasHistoryRange: 'historyRange' in props,
          metric: props.metric,
          scope: props.scope,
        })
      : getRatingWidgetHeaderText({
          formatMessage,
          getLocalizedMetricName: getDashboardLocalizedMetricName,
          metricKey: props.metricKey,
          scope: props.scope,
        });
  const title =
    'titleOverride' in props && props.titleOverride !== undefined
      ? props.titleOverride
      : headerText.title;

  return (
    <div className="sw-flex sw-w-full sw-min-w-0 sw-flex-col sw-gap-1">
      <WidgetHeaderTitle title={title} />
      <WidgetFilterLine segments={headerText.filterSegments} />
    </div>
  );
}

export function TopListWidgetHeader({
  limit,
  metric,
  rankBy,
  scope,
}: Readonly<TopListWidgetProps>) {
  const { formatMessage } = useIntl();

  return (
    <WidgetHeader
      metric={metric}
      scope={scope}
      titleOverride={getTopListWidgetTitle(formatMessage, { limit, rankBy })}
    />
  );
}
