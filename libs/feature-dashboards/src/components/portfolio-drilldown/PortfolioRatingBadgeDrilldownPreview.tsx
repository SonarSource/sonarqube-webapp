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

import { Card, RatingBadge, RatingBadgeRating, RatingBadgeSize } from '@sonarsource/echoes-react';
import { useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useResizeObserver } from '~shared/helpers/useResizeObserver';
import { WidgetFilterLine } from '../../dashboard-layout/shared/WidgetFilterLine';
import type { RatingBadgeWidgetProps } from '../../types/dashboard-widget';
import { PieChartPastry, type PieChartSegment } from '../../types/visualization';
import {
  PORTFOLIO_RATING_BADGE_DONUT_INNER_RADIUS_EXTRA_PX,
  PORTFOLIO_RATING_BADGE_DONUT_SIZE_PX,
} from '../../widget-wrappers/rating-badge/portfolioRatingBadgeDistributionSegments';
import { PortfolioDashboardRatingBadge } from '../../widget-wrappers/rating-badge/PortfolioRatingBadgeWidgetWrapper';
import {
  ChartHorizontalLegend,
  segmentsToLegendItems,
} from '../visualizations/ChartHorizontalLegend';
import { PieChart } from '../visualizations/pie-chart/PieChart';
import { useActiveSegmentIndex } from '../visualizations/pie-chart/useActiveSegmentIndex';
import { PortfolioDrilldownEmptyState } from './portfolioDrilldownEmptyState';

const previewCardBodyClassName = 'sw-pb-16';

interface Props {
  centerRating: RatingBadgeRating | undefined;
  emptyState?: PortfolioDrilldownEmptyState;
  onSegmentSelect?: (segment: PieChartSegment) => void;
  segments: PieChartSegment[];
  selectedSegmentValue?: string;
  title: string;
  widget: { props: RatingBadgeWidgetProps };
}

function RatingBadgeChart(
  props: Readonly<{
    centerRating: RatingBadgeRating;
    onSegmentSelect?: (segment: PieChartSegment) => void;
    segments: PieChartSegment[];
    selectedSegmentValue?: string;
  }>,
) {
  const { centerRating, onSegmentSelect, segments, selectedSegmentValue } = props;
  const { formatMessage } = useIntl();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { activeIndex } = useActiveSegmentIndex(segments, selectedSegmentValue, hoveredIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const [observedWidth] = useResizeObserver(containerRef);
  const containerWidth = observedWidth ?? 0;
  const legendItems = useMemo(() => segmentsToLegendItems(segments), [segments]);

  return (
    <div
      className="sw-flex sw-h-full sw-w-full sw-flex-col sw-items-center sw-justify-center sw-gap-4"
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
          hoveredIndex={activeIndex}
          onHoverChange={setHoveredIndex}
          onSegmentClick={(segment) => {
            onSegmentSelect?.(segment);
          }}
          pastry={PieChartPastry.Donut}
          segments={segments}
          width={PORTFOLIO_RATING_BADGE_DONUT_SIZE_PX}
        />
        <div className="sw-pointer-events-none sw-absolute sw-inset-0 sw-flex sw-items-center sw-justify-center">
          <PortfolioDashboardRatingBadge
            ariaLabel={formatMessage({ id: 'metric.has_rating_X' }, { 0: centerRating })}
            rating={centerRating}
            size={RatingBadgeSize.ExtraLarge}
          />
        </div>
      </div>
      <ChartHorizontalLegend
        containerWidth={containerWidth}
        focusedSeriesIndex={activeIndex ?? undefined}
        items={legendItems}
        onLegendMouseLeave={() => {
          setHoveredIndex(null);
        }}
        onSeriesHover={(seriesIndex) => {
          setHoveredIndex(seriesIndex ?? null);
        }}
        onSeriesSelect={(seriesIndex) => {
          onSegmentSelect?.(segments[seriesIndex]);
        }}
      />
    </div>
  );
}

export function PortfolioRatingBadgeDrilldownPreview(props: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const {
    centerRating,
    emptyState,
    onSegmentSelect,
    segments,
    selectedSegmentValue,
    title,
    widget,
  } = props;

  if (emptyState === PortfolioDrilldownEmptyState.NoComputedRating) {
    return (
      <Card>
        <Card.Header
          description={
            <WidgetFilterLine
              segments={[formatMessage({ id: `dashboard_widget.codescope.${widget.props.scope}` })]}
            />
          }
          title={title}
        />
        <Card.Body className={previewCardBodyClassName}>
          <div className="sw-flex sw-h-full sw-items-center sw-justify-center">
            <RatingBadge
              ariaLabel={formatMessage({
                id: 'portfolio_dashboard.breakdown.empty_state.no_computed_rating.label',
              })}
              rating={RatingBadgeRating.Null}
              size={RatingBadgeSize.ExtraLarge}
            />
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (segments.length === 0 || centerRating === undefined) {
    return null;
  }

  return (
    <Card>
      <Card.Header
        description={
          <WidgetFilterLine
            segments={[formatMessage({ id: `dashboard_widget.codescope.${widget.props.scope}` })]}
          />
        }
        title={title}
      />
      <Card.Body className={previewCardBodyClassName}>
        <RatingBadgeChart
          centerRating={centerRating}
          onSegmentSelect={onSegmentSelect}
          segments={segments}
          selectedSegmentValue={selectedSegmentValue}
        />
      </Card.Body>
    </Card>
  );
}
