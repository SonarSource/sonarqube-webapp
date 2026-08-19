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

import styled from '@emotion/styled';
import {
  LinkStandalone,
  RatingBadge,
  RatingBadgeRating,
  RatingBadgeSize,
} from '@sonarsource/echoes-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { getPortfolioDashboardWidgetDrilldownUrl } from '~adapters/helpers/dashboard-widget-urls';
import {
  usePortfolioRatingBadgeMeasuresQuery,
  usePortfolioRatingBadgeMetricKeysQuery,
} from '~adapters/queries/portfolio-rating-badge-widget-data';
import { isTransientDashboardWidgetFetchError } from '~shared/helpers/dashboard-error-reporting';
import { useResizeObserver } from '~shared/helpers/useResizeObserver';
import { MetricKey } from '~shared/types/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import {
  ChartHorizontalLegend,
  segmentsToLegendItems,
} from '../../components/visualizations/ChartHorizontalLegend';
import { PieChart } from '../../components/visualizations/pie-chart/PieChart';
import { useOptionalWidgetInstanceContext } from '../../dashboard-layout/shared/WidgetInstanceContext';
import { PieChartPastry, PieChartSegment } from '../../types/visualization';
import { CodeScope, WidgetMode } from '../../types/widget-common';
import { isPortfolioDashboardRatingBadgeBreakdownMetricKey } from '../../utils/portfolioRatingBadgeBreakdown';
import { PORTFOLIO_RATING_COLOR_STYLES } from './portfolioRatingBadgeColors';
import {
  buildPortfolioRatingBadgePieChartSegments,
  getPortfolioRatingBadgeHistoryMetricKeys,
  isPortfolioRatingBadgeDistributionValue,
  isPortfolioRatingBadgeRatingValue,
  PORTFOLIO_RATING_BADGE_DONUT_INNER_RADIUS_EXTRA_PX,
  PORTFOLIO_RATING_BADGE_DONUT_SIZE_PX,
  type PortfolioRatingBadgeDistribution,
} from './portfolioRatingBadgeDistributionSegments';
import { PortfolioStandardRatingBadgeWidgetWrapper } from './PortfolioStandardRatingBadgeWidgetWrapper';

interface Props {
  metricKey: MetricKey;
  mode?: WidgetMode;
  scope: CodeScope;
  showBreakdown?: boolean;
}

function getPortfolioRatingBadgeDrilldownTo(
  drilldownEnabled: boolean,
  widgetKey: string | undefined,
): string | undefined {
  if (!drilldownEnabled || widgetKey === undefined) {
    return undefined;
  }

  return `breakdown/${widgetKey}`;
}

function getPortfolioRatingBadgeSegmentDrilldownUrl(
  drilldownEnabled: boolean,
  widgetKey: string | undefined,
  segment: PieChartSegment,
): string | undefined {
  if (!drilldownEnabled || widgetKey === undefined || segment.value.startsWith('OTHER_')) {
    return undefined;
  }

  return getPortfolioDashboardWidgetDrilldownUrl(widgetKey, segment.value);
}

export function PortfolioRatingBadgeWidgetWrapper(props: Readonly<Props>) {
  if (!isPortfolioDashboardRatingBadgeBreakdownMetricKey(props.metricKey)) {
    return <PortfolioStandardRatingBadgeWidgetWrapper {...props} />;
  }

  return <PortfolioRatingBadgeBreakdownWidget {...props} />;
}

function PortfolioRatingBadgeBreakdownWidget(props: Readonly<Props>) {
  const { metricKey, mode, scope, showBreakdown = false } = props;
  const widgetInstance = useOptionalWidgetInstanceContext();
  const { portfolioId } = useDashboardPortfolioContext();
  const isScopeNew = scope === CodeScope.New;
  const drilldownEnabled = mode !== WidgetMode.Edit;
  const requestedMetricKeys = getPortfolioRatingBadgeHistoryMetricKeys(metricKey, isScopeNew);
  const {
    error: metricResolutionError,
    isPending: isMetricResolutionPending,
    metricKeys,
  } = usePortfolioRatingBadgeMetricKeysQuery(requestedMetricKeys);
  const {
    data: measures,
    error: measuresError,
    isPending: isMeasuresPending,
  } = usePortfolioRatingBadgeMeasuresQuery(portfolioId, {
    enabled: !isMetricResolutionPending && metricResolutionError == null,
    metricKeys,
  });

  const error = metricResolutionError ?? measuresError;
  if (error != null) {
    if (isTransientDashboardWidgetFetchError(error)) {
      return <WidgetNoData />;
    }
    throw error;
  }

  if (isMetricResolutionPending || isMeasuresPending) {
    return <WidgetLoadingSpinner />;
  }

  const [ratingMetricKey, resolvedDistributionMetricKey] = metricKeys;
  const distributionMetricKey =
    metricKey === MetricKey.releasability_rating
      ? requestedMetricKeys[1]
      : resolvedDistributionMetricKey;
  const rating = measures?.[ratingMetricKey];
  const distribution = measures?.[distributionMetricKey];

  if (!isPortfolioRatingBadgeRatingValue(rating)) {
    return <WidgetNoData />;
  }

  const ratingDrilldownTo = getPortfolioRatingBadgeDrilldownTo(
    drilldownEnabled,
    widgetInstance?.widgetKey,
  );

  if (!isPortfolioRatingBadgeDistributionValue(distribution)) {
    return (
      <div className="sw-text-[3rem] sw-leading-none sw-h-full sw-flex sw-flex-col sw-items-center sw-justify-center">
        <PortfolioDashboardRatingBadgeLink rating={rating} ratingDrilldownTo={ratingDrilldownTo} />
      </div>
    );
  }

  return (
    <div className="sw-h-full sw-flex sw-items-center sw-justify-center">
      <PortfolioDashboardRatingDonut
        distribution={distribution}
        drilldownEnabled={drilldownEnabled}
        rating={rating}
        ratingDrilldownTo={ratingDrilldownTo}
        showBreakdown={showBreakdown}
        widgetKey={widgetInstance?.widgetKey}
      />
    </div>
  );
}

function PortfolioDashboardRatingBadgeLink(
  props: Readonly<{
    extraLinkClassName?: string;
    rating: RatingBadgeRating;
    ratingDrilldownTo: string | undefined;
  }>,
) {
  const { extraLinkClassName, rating, ratingDrilldownTo } = props;
  const badge = (
    <PortfolioDashboardRatingBadge
      ariaLabel={`metric.has_rating_X.${rating}`}
      rating={rating}
      size={RatingBadgeSize.ExtraLarge}
    />
  );
  if (ratingDrilldownTo === undefined) {
    return badge;
  }
  return (
    <LinkStandalone
      className={[extraLinkClassName, 'sw-inline-flex sw-no-underline hover:sw-opacity-90']
        .filter(Boolean)
        .join(' ')}
      to={ratingDrilldownTo}
    >
      {badge}
    </LinkStandalone>
  );
}

function PortfolioDashboardRatingDonut(
  props: Readonly<{
    distribution: PortfolioRatingBadgeDistribution;
    drilldownEnabled: boolean;
    rating: RatingBadgeRating;
    ratingDrilldownTo: string | undefined;
    showBreakdown: boolean;
    widgetKey: string | undefined;
  }>,
) {
  const { distribution, drilldownEnabled, rating, ratingDrilldownTo, showBreakdown, widgetKey } =
    props;
  const navigate = useNavigate();
  const { formatMessage } = useIntl();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [observedWidth] = useResizeObserver(containerRef);
  const containerWidth = observedWidth ?? 0;

  const getSegmentUrl = useCallback(
    (segment: PieChartSegment): string | undefined => {
      return getPortfolioRatingBadgeSegmentDrilldownUrl(drilldownEnabled, widgetKey, segment);
    },
    [drilldownEnabled, widgetKey],
  );

  const handleSegmentClick = useCallback(
    (segment: PieChartSegment) => {
      const url = getSegmentUrl(segment);
      if (url) {
        navigate(url);
      }
    },
    [getSegmentUrl, navigate],
  );

  const segments = useMemo<PieChartSegment[]>(
    () =>
      buildPortfolioRatingBadgePieChartSegments({
        distribution,
        formatMessage,
      }),
    [distribution, formatMessage],
  );

  const legendItems = useMemo(
    () => segmentsToLegendItems(segments, getSegmentUrl),
    [segments, getSegmentUrl],
  );

  if (segments.length === 0) {
    return <WidgetNoData className="sw-my-0 sw-h-full" />;
  }

  const hasSupportingContent = showBreakdown;

  return (
    <div
      className="sw-flex sw-h-full sw-w-full sw-flex-col sw-items-center sw-justify-center"
      ref={containerRef}
    >
      <div
        className="sw-relative sw-flex sw-items-center sw-justify-center"
        style={{
          height: PORTFOLIO_RATING_BADGE_DONUT_SIZE_PX,
          width: PORTFOLIO_RATING_BADGE_DONUT_SIZE_PX,
        }}
      >
        <PieChart
          donutInnerRadiusExtraPx={PORTFOLIO_RATING_BADGE_DONUT_INNER_RADIUS_EXTRA_PX}
          height={PORTFOLIO_RATING_BADGE_DONUT_SIZE_PX}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
          onSegmentClick={handleSegmentClick}
          pastry={PieChartPastry.Donut}
          segments={segments}
          width={PORTFOLIO_RATING_BADGE_DONUT_SIZE_PX}
        />

        <div className="sw-pointer-events-none sw-absolute sw-inset-0 sw-flex sw-items-center sw-justify-center">
          <PortfolioDashboardRatingBadgeLink
            extraLinkClassName="sw-pointer-events-auto sw-relative sw-z-[1]"
            rating={rating}
            ratingDrilldownTo={ratingDrilldownTo}
          />
        </div>
      </div>

      {hasSupportingContent && (
        <div
          aria-hidden="true"
          className="sw-w-full sw-flex-shrink-0"
          style={{ flexGrow: 1, maxHeight: '1rem', minHeight: '0.5rem' }}
        />
      )}

      {showBreakdown && (
        <ChartHorizontalLegend
          containerWidth={containerWidth}
          focusedSeriesIndex={hoveredIndex ?? undefined}
          items={legendItems}
          onLegendMouseLeave={() => {
            setHoveredIndex(null);
          }}
          onSeriesHover={(seriesIndex) => {
            setHoveredIndex(seriesIndex ?? null);
          }}
        />
      )}
    </div>
  );
}

export const PortfolioDashboardRatingBadge = styled(RatingBadge)`
  box-sizing: border-box;

  ${({ rating }) => PORTFOLIO_RATING_COLOR_STYLES[rating ?? RatingBadgeRating.Null]};
`;
