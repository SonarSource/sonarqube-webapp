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
import { dashboardMeasureMetricKey } from '../../data/dashboard-measure-history';
import type { Props as CountWidgetConfig } from '../../data/widgets/count';
import { useMttrFormatters } from '../../hooks/useMttrFormatters';
import { getDashboardMetricDirectionOverride } from '../../utils/countWidgetTrend';
import { isCountWidgetTrendVisible } from '../../utils/countWidgetTrendIndicator';
import { PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE } from '../../utils/portfolioMeasures';
import {
  buildCountWidgetPresentation,
  dashboardCountHistoryMonths,
} from './countWidgetPresentation';

type Props = CountWidgetConfig & { suppressPortfolioDrilldownLink?: boolean };

function getCountWidgetLink(props: Readonly<Props>, widgetKey: string | undefined) {
  if (
    props.suppressPortfolioDrilldownLink ||
    !isPortfolioCountWidgetDrilldownSupported(props.metric) ||
    widgetKey === undefined
  ) {
    return undefined;
  }
  return getPortfolioDashboardWidgetDrilldownUrl(widgetKey);
}

export function PortfolioCountWidgetWrapper(props: Readonly<Props>) {
  const { formatDate, formatMessage } = useIntl();
  const { formatMttr } = useMttrFormatters();
  const { entityType, getPortfolioMetric, isEntityTypePending, portfolioId } =
    useDashboardPortfolioContext();
  const widgetInstance = useOptionalWidgetInstanceContext();
  const { metric, scope, showTrendIndicator = false } = props;
  const measure = dashboardMetricToMeasure(metric, scope, {
    supportedNewCodeMetrics: PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE,
  });
  const trendVisible = isCountWidgetTrendVisible(showTrendIndicator, metric, scope);
  const months = dashboardCountHistoryMonths(metric, trendVisible);
  const query = useDashboardMeasureQuery(
    {
      entityId: portfolioId,
      entityType,
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

  if (isEntityTypePending) {
    return <WidgetLoadingSpinner />;
  }

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
  const presentation = buildCountWidgetPresentation({
    activityUrl: { pathname: '#' },
    data: query.data,
    formatDate,
    formatMessage,
    formatMttr,
    measure,
    metadataType: metricMetadata?.type,
    metric,
    metricDirection: parsePortfolioMetricDirection(metricMetadata?.direction) ?? -1,
    metricDirectionOverride:
      getDashboardMetricDirectionOverride(metric) ?? getPortfolioMetric(metricKey)?.direction,
    trendVisible,
  });
  if (presentation === null) {
    return <WidgetNoData />;
  }

  return (
    <CountWidget {...presentation} linkTo={getCountWidgetLink(props, widgetInstance?.widgetKey)} />
  );
}
