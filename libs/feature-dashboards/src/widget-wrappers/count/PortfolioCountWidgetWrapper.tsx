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
import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { getPortfolioDashboardWidgetDrilldownUrl } from '~adapters/helpers/dashboard-widget-urls';
import { useDashboardMeasureQuery } from '~adapters/queries/dashboard-measure';
import { usePortfolioWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { parsePortfolioMetricDirection } from '~shared/helpers/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { isPortfolioCountWidgetDrilldownSupported } from '../../components/portfolio-drilldown/portfolioCountDrilldown';
import { CountWidget } from '../../components/visualizations/CountWidget';
import { useOptionalWidgetInstanceContext } from '../../dashboard-layout/shared/WidgetInstanceContext';
import { dashboardMetricToMeasure } from '../../data/dashboard-measure';
import {
  dashboardCountMetricType,
  dashboardMeasureHistoryValues,
  dashboardMeasureMetricKey,
} from '../../data/dashboard-measure-history';
import type { Props as CountWidgetConfig } from '../../data/widgets/count';
import { DashboardMetricType } from '../../data/widgets/shared';
import { useMttrFormatters } from '../../hooks/useMttrFormatters';
import {
  computeDashboardMeasureTrendData,
  getDashboardMetricDirectionOverride,
} from '../../utils/countWidgetTrend';
import { isCountWidgetTrendVisible } from '../../utils/countWidgetTrendIndicator';
import { PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE } from '../../utils/portfolioMeasures';

type Props = CountWidgetConfig & { suppressPortfolioDrilldownLink?: boolean };

export function PortfolioCountWidgetWrapper(props: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { formatMttr } = useMttrFormatters();
  const { getPortfolioMetric, portfolioId } = useDashboardPortfolioContext();
  const widgetInstance = useOptionalWidgetInstanceContext();
  const { metric, scope, showTrendIndicator = false } = props;
  const measure = dashboardMetricToMeasure(metric, scope, {
    supportedNewCodeMetrics: PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE,
  });
  const trendVisible = isCountWidgetTrendVisible(showTrendIndicator, metric, scope);
  const months = trendVisible ? 1 : undefined;
  const query = useDashboardMeasureQuery(
    {
      entityId: portfolioId,
      entityType: 'PORTFOLIO',
      measure,
      months,
    },
    Boolean(portfolioId),
  );
  const {
    data: metrics,
    isError: isMetadataError,
    isPending: isMetadataPending,
  } = usePortfolioWidgetMetricMetadataQuery();

  if (!portfolioId) {
    return <WidgetNoData />;
  }
  if (query.isPending || isMetadataPending) {
    return <WidgetLoadingSpinner />;
  }
  if (query.isError || (measure.api === 'measures-history' && isMetadataError)) {
    return <WidgetNoData messageKey="dashboard.widget.error" />;
  }

  const metricKey = dashboardMeasureMetricKey(measure);
  const metricMetadata = metrics?.metrics.find((candidate) => candidate.key === metricKey);
  const measureFilters =
    metric.type === DashboardMetricType.Rich ? metric.measureFilters : undefined;
  const values = dashboardMeasureHistoryValues(
    query.data,
    measure,
    metricMetadata?.type,
    measureFilters,
  );
  const latest = values.at(-1);
  if (latest === undefined) {
    return <WidgetNoData />;
  }

  const metricType = dashboardCountMetricType(measure, metricMetadata?.type);
  const isMttr = metricType === 'MTTR_CALENDAR';
  const trendData = computeDashboardMeasureTrendData({
    activityUrl: { pathname: '#' },
    formatMttr,
    isMttr,
    measureFilters,
    metric: {
      direction: parsePortfolioMetricDirection(metricMetadata?.direction) ?? -1,
      type: metricType,
    },
    metricDirectionOverride:
      getDashboardMetricDirectionOverride(metric) ?? getPortfolioMetric(metricKey)?.direction,
    values,
  });
  const linkTo =
    !props.suppressPortfolioDrilldownLink &&
    isPortfolioCountWidgetDrilldownSupported(metric) &&
    widgetInstance?.widgetKey
      ? getPortfolioDashboardWidgetDrilldownUrl(widgetInstance.widgetKey)
      : undefined;

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
