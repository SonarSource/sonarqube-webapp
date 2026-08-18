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

import { RatingBadgeSize, Text } from '@sonarsource/echoes-react';
import { useParams } from 'react-router-dom';
import Measure from '~adapters/components/measure/Measure';
import { QualityGateIndicator } from '~adapters/components/ui/QualityGateIndicator';
import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { formatDashboardMeasure } from '~adapters/helpers/dashboard-measures';
import { getPortfolioDashboardMeasuresUrl } from '~adapters/helpers/dashboard-widget-urls';
import {
  usePortfolioRatingBadgeComputedMeasuresQuery,
  usePortfolioRatingBadgeMeasuresQuery,
} from '~adapters/queries/portfolio-rating-badge-widget-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { Metric } from '~shared/types/measures';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { RatingBadgeDisplay } from '../../components/visualizations/RatingBadgeDisplay';
import { CodeScope, WidgetMode } from '../../types/widget-common';
import { isRatingMetric } from '../../utils/lineChartMeasureTransformFlags';
import { getPortfolioDashboardMeasureRequestKey } from '../../utils/portfolioMeasures';
import { aggregatePortfolioComputedMeasures } from '../../utils/portfolioWidgetData';
import {
  isQualityGateStatus,
  NON_LINKABLE_RATING_METRICS,
  normalizeRatingValue,
} from '../../utils/ratingBadge';

interface PortfolioComputedProject {
  measures: ReadonlyArray<{ name: string; value: string }>;
}

export interface PortfolioStandardRatingBadgeWidgetProps {
  metricKey: MetricKey;
  mode?: WidgetMode;
  scope: CodeScope;
  showBreakdown?: boolean;
}

function getPortfolioRatingValue(args: {
  metricKey: MetricKey;
  metricKeyForRequest: string;
  portfolioAggregateMeasures: Record<string, string | number | Record<string, number>> | undefined;
}): string | undefined {
  const { metricKey, metricKeyForRequest, portfolioAggregateMeasures } = args;
  const rawValue =
    portfolioAggregateMeasures?.[metricKeyForRequest] ??
    portfolioAggregateMeasures?.[metricKey] ??
    (NON_LINKABLE_RATING_METRICS.has(metricKey)
      ? portfolioAggregateMeasures?.[MetricKey.releasability_rating]
      : undefined);

  return normalizeRatingValue(rawValue);
}

function getWidgetRatingValue(args: {
  isPortfolioRatingMetric: boolean;
  isScopeNew: boolean;
  metricKey: MetricKey;
  metricKeyForRequest: string;
  metricMetadata: Metric | undefined;
  portfolioAggregateMeasures: Record<string, string | number | Record<string, number>> | undefined;
  portfolioMeasuresData: { projects: PortfolioComputedProject[] } | undefined;
}): string | undefined {
  const {
    isPortfolioRatingMetric,
    metricKey,
    metricKeyForRequest,
    metricMetadata,
    portfolioAggregateMeasures,
    portfolioMeasuresData,
  } = args;

  const computedValue = aggregatePortfolioComputedMeasures(
    portfolioMeasuresData?.projects ?? [],
    metricKeyForRequest,
    metricMetadata,
  );

  if (!isPortfolioRatingMetric) {
    return computedValue;
  }

  return (
    getPortfolioRatingValue({
      metricKey,
      metricKeyForRequest,
      portfolioAggregateMeasures,
    }) ?? computedValue
  );
}

/** Standard (non-donut) portfolio rating badge body for metrics outside the breakdown allowlist. */
export function PortfolioStandardRatingBadgeWidgetWrapper(
  props: Readonly<PortfolioStandardRatingBadgeWidgetProps>,
) {
  const { metricKey, mode, scope } = props;
  const { enterpriseKey = '' } = useParams<{ enterpriseKey?: string }>();
  const { portfolioId } = useDashboardPortfolioContext();
  const isScopeNew = scope === CodeScope.New;
  const metricKeyForRequest = getPortfolioDashboardMeasureRequestKey(metricKey, isScopeNew);
  const isPortfolioPotentialRatingMetric = isRatingMetric(metricKey, undefined);

  const { data: portfolioMeasuresData, isPending: isPortfolioMeasuresPending } =
    usePortfolioRatingBadgeComputedMeasuresQuery(
      {
        metrics: [metricKeyForRequest],
        pageIndex: 1,
        pageSize: 500,
        portfolioId,
      },
      { enabled: Boolean(portfolioId) },
    );
  const {
    data: portfolioAggregateMeasures,
    isError: isPortfolioAggregateMeasuresError,
    isPending: isPortfolioAggregateMeasuresPending,
  } = usePortfolioRatingBadgeMeasuresQuery(portfolioId, {
    enabled: isPortfolioPotentialRatingMetric,
  });

  const { data: metrics, isLoading: isMetricsListLoading } = useWidgetMetricMetadataQuery();
  const metricMetadata = metrics?.[metricKey];
  const metricType = metricMetadata?.type;
  const isRatingForMeasure = isRatingMetric(metricKey, metricType);
  const isPortfolioRatingMetric = isRatingForMeasure;
  const metricTypeForMeasure = isRatingForMeasure
    ? MetricType.Rating
    : (metricType ?? MetricType.Integer);

  const value = getWidgetRatingValue({
    isPortfolioRatingMetric,
    isScopeNew,
    metricKey,
    metricKeyForRequest,
    metricMetadata,
    portfolioAggregateMeasures,
    portfolioMeasuresData,
  });

  const isPortfolioDataLoading =
    isPortfolioMeasuresPending ||
    (isPortfolioPotentialRatingMetric && isPortfolioAggregateMeasuresPending);

  if (isMetricsListLoading || isPortfolioDataLoading) {
    return <WidgetLoadingSpinner />;
  }

  if (isPortfolioAggregateMeasuresError) {
    return <WidgetNoData />;
  }

  if (metricKey === MetricKey.alert_status) {
    if (!isQualityGateStatus(value)) {
      return <WidgetNoData />;
    }

    return (
      <div className="sw-h-full sw-flex sw-flex-col sw-items-center sw-justify-center">
        <div className="sw-flex sw-items-center sw-justify-center sw-gap-4">
          <QualityGateIndicator size="xl" status={value ?? 'NOT_COMPUTED'} />
          <Text className="sw-typo-lg-semibold sw-text-2xl">
            {formatDashboardMeasure(value ?? 'NOT_COMPUTED', MetricType.Level)}
          </Text>
        </div>
      </div>
    );
  }

  if (value === undefined) {
    return <WidgetNoData />;
  }

  const isLinkable = !NON_LINKABLE_RATING_METRICS.has(metricKey);
  const isEditMode = mode === WidgetMode.Edit;
  const linkTo =
    isLinkable && !isEditMode && enterpriseKey
      ? getPortfolioDashboardMeasuresUrl(portfolioId, enterpriseKey, metricKey)
      : undefined;

  return (
    <div className="sw-text-[3rem] sw-leading-none sw-h-full sw-flex sw-flex-col sw-items-center sw-justify-center">
      {metricTypeForMeasure === MetricType.Rating ? (
        <RatingBadgeDisplay
          badgeSize={RatingBadgeSize.ExtraLarge}
          linkTo={linkTo}
          metricKey={metricKey}
          value={value}
        />
      ) : (
        <Measure
          badgeSize="xl"
          metricKey={metricKey}
          metricType={metricTypeForMeasure}
          value={value}
        />
      )}
    </div>
  );
}
