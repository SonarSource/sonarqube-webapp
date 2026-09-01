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

import type { ComponentProps } from 'react';
import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { extractDashboardMeasureValue } from '~adapters/helpers/dashboard-measures';
import { getProjectDashboardMeasuresUrl } from '~adapters/helpers/dashboard-widget-urls';
import { getDashboardLocalizedMetricName } from '~adapters/helpers/l10n';
import { useProjectRatingBadgeMeasuresQuery } from '~adapters/queries/project-rating-badge-widget-data';
import { MetricKey } from '~shared/types/metrics';
import { WidgetFilterLine } from '../../dashboard-layout/shared/WidgetFilterLine';
import { WidgetHeaderTitle } from '../../dashboard-layout/shared/WidgetHeaderTitle';
import type { LineChartGroupByValue } from '../../data/widgets/line-chart';
import {
  DashboardMetricType,
  type DashboardMetric,
  type TopListWidgetProps,
} from '../../types/dashboard-widget';
import { WidgetMode, type CodeScope } from '../../types/widget-common';
import { normalizeRatingValue } from '../../utils/ratingBadge';
import { RatingBadgeDisplay } from '../visualizations/RatingBadgeDisplay';
import { getTopListWidgetTitle } from '../visualizations/top-list/topListWidgetTitle';
import { getProjectContextualRatingMetricKey } from './contextualRatingBadge';
import { getMetricWidgetHeaderText, getRatingWidgetHeaderText } from './widgetHeaderText';

type Props =
  | {
      filterLineScopeOnly?: boolean;
      metric: DashboardMetric;
      mode?: WidgetMode;
      scope: CodeScope;
      showContextualRatingBadge?: boolean;
      titleOverride?: string;
    }
  | {
      groupBy: LineChartGroupByValue;
      historyRange: string;
      metric: DashboardMetric;
      mode?: WidgetMode;
      scope: CodeScope;
    }
  | { metricKey: MetricKey; mode?: WidgetMode; scope: CodeScope };

type ContextualRatingBadgeProps = ComponentProps<typeof RatingBadgeDisplay>;

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
  const contextualRatingBadge = useContextualRatingBadge(props);

  return (
    <div className="sw-flex sw-w-full sw-min-w-0 sw-flex-col sw-gap-1" data-testid="widget-header">
      <div
        className="sw-flex sw-w-full sw-items-center sw-justify-between sw-gap-2"
        data-testid="widget-header-title-row"
      >
        <div className="sw-min-w-0 sw-flex-1">
          <WidgetHeaderTitle title={title} />
        </div>
        {contextualRatingBadge ? (
          <RatingBadgeDisplay {...contextualRatingBadge} className="sw-flex-shrink-0" />
        ) : null}
      </div>
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
      showContextualRatingBadge={false}
      titleOverride={getTopListWidgetTitle(formatMessage, {
        limit,
        measureFilters:
          metric.type === DashboardMetricType.Rich ? metric.measureFilters : undefined,
        rankBy,
      })}
    />
  );
}

function useContextualRatingBadge(props: Props): ContextualRatingBadgeProps | undefined {
  const [searchParams] = useSearchParams();
  const isCountWidget =
    'metric' in props && !('historyRange' in props) && props.showContextualRatingBadge !== false;
  const ratingMetricKey = isCountWidget
    ? getProjectContextualRatingMetricKey(props.metric, props.scope)
    : undefined;
  const component = searchParams.get('id') ?? '';
  const { data: measureData } = useProjectRatingBadgeMeasuresQuery(
    {
      component,
      metricKeys: ratingMetricKey ?? MetricKey.alert_status,
    },
    { enabled: Boolean(component) && ratingMetricKey !== undefined },
  );

  if (ratingMetricKey === undefined) {
    return undefined;
  }

  const normalizedValue = normalizeRatingValue(
    extractDashboardMeasureValue(measureData?.[0], false),
  );
  if (normalizedValue === undefined) {
    return undefined;
  }

  return {
    linkTo:
      props.mode === WidgetMode.Edit
        ? undefined
        : getProjectDashboardMeasuresUrl({ component, metric: ratingMetricKey }),
    metricKey: ratingMetricKey,
    value: normalizedValue,
  };
}
