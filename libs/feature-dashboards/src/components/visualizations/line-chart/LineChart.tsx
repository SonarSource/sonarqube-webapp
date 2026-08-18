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

// Active fallback renderer when `organizationReportingEnableNewDashboardWidgets` is off.
// When that flag is retired, delete this file along with LineChart-test.tsx and RenderArea.tsx.

import { cssVar } from '@sonarsource/echoes-react';
import { line as d3Line } from 'd3-shape';
import { isUndefined } from 'lodash';
import { useMemo, useRef, useState } from 'react';
import type { LineChartDataPoint } from '../../../types/visualization';
import { WidgetLoadingSpinner } from '../../common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../common/WidgetNoData';
import {
  createLinearYScale,
  createTimeXScale,
  getNearestIndex,
  useChartDimensions,
} from '../chartGeometry';
import { RenderArea } from '../RenderArea';
import {
  FOOTER_GAP_PX,
  LEGEND_ROW_HEIGHT_PX,
  RenderChartFooter,
  SINGLE_DATAPOINT_MESSAGE_HEIGHT_PX,
} from '../RenderChartFooter';
import { RenderDots } from '../RenderDots';
import { RenderXAxis } from '../RenderXAxis';
import { RenderYAxis } from '../RenderYAxis';

interface LineChartProps {
  areaColor?: string;
  areaOpacity?: number;
  ariaLabel: string;
  color?: string;
  data: LineChartDataPoint[];
  formatDotValue: (value: number) => React.ReactNode;
  formatTick: (tick: number) => string | React.ReactNode;
  hasFetchError: boolean;
  isMetricRating: boolean;
  isPending: boolean;
  metricName?: string;
  milestoneColor?: string;
  milestoneValue?: number;
  padding?: [number, number, number, number];
  showArea?: boolean;
  showDots?: boolean;
  showLegend?: boolean;
  showMilestone?: boolean;
  showTooltip?: boolean;
  strokeWidth?: number;
}

export function LineChart(props: Readonly<LineChartProps>) {
  const {
    areaColor = cssVar('color-charts-categorical-1'),
    areaOpacity = 0.2,
    ariaLabel,
    color = cssVar('color-charts-categorical-1'),
    data,
    formatDotValue,
    formatTick,
    hasFetchError,
    isMetricRating,
    isPending,
    metricName,
    milestoneColor = cssVar('color-charts-categorical-5'),
    milestoneValue,
    padding = [20, 20, 40, 60],
    showArea = false,
    showDots = false,
    showLegend = false,
    showMilestone = false,
    showTooltip = false,
    strokeWidth = 2,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useChartDimensions(containerRef, isPending);
  const [hoveredDotIndex, setHoveredDotIndex] = useState<number | undefined>(undefined);
  const [hoveredLineX, setHoveredLineX] = useState<number>(0);
  const [isHoverActive, setIsHoverActive] = useState(false);
  const [hoveredSeriesIndex, setHoveredSeriesIndex] = useState<number | null>(null);

  const [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding;
  const availableWidth = dimensions.width - paddingLeft - paddingRight;
  const isSingleDatapoint = data.length === 1;
  const availableHeight =
    dimensions.height -
    paddingTop -
    paddingBottom -
    (isSingleDatapoint ? SINGLE_DATAPOINT_MESSAGE_HEIGHT_PX : 0) -
    (isSingleDatapoint && showLegend ? FOOTER_GAP_PX : 0) -
    (showLegend ? LEGEND_ROW_HEIGHT_PX : 0);

  const xScale = useMemo(
    () =>
      createTimeXScale(
        data.map((point) => new Date(point.x)),
        availableWidth,
      ),
    [availableWidth, data],
  );

  const yScale = useMemo(
    () =>
      createLinearYScale(
        data.map((point) => point.y),
        availableHeight,
        isMetricRating,
      ),
    [availableHeight, data, isMetricRating],
  );

  const yTicks = isMetricRating ? [1, 2, 3, 4, 5] : yScale.ticks(5);

  const linePath = useMemo(() => {
    const generator = d3Line<LineChartDataPoint>()
      .defined((point) => point.y !== null && point.y !== undefined)
      .x((point) => xScale(new Date(point.x)))
      .y((point) => yScale(point.y));

    return generator(data);
  }, [data, xScale, yScale]);

  const areaPath = useMemo(() => {
    if (!showArea || data.length === 0) {
      return null;
    }

    const path = data
      .map((point, index) => {
        const prefix = index === 0 ? 'M' : 'L';
        return `${prefix}${xScale(new Date(point.x))},${yScale(point.y)}`;
      })
      .join(' ');

    const first = data.at(0);
    const last = data.at(-1);
    if (!first || !last) {
      return null;
    }
    return `${path} L${xScale(new Date(last.x))},${yScale(0)} L${xScale(
      new Date(first.x),
    )},${yScale(0)} Z`;
  }, [data, showArea, xScale, yScale]);

  if (hasFetchError) {
    return <WidgetNoData className="sw-my-0 sw-h-full" />;
  }

  if (isPending) {
    return <WidgetLoadingSpinner />;
  }

  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div
        ref={containerRef}
        style={{ height: '100%', minHeight: 0, minWidth: 0, width: '100%' }}
      />
    );
  }

  if (data.length === 0 || (data.length === 1 && isUndefined(data[0].y))) {
    return <WidgetNoData className="sw-my-0 sw-h-full" />;
  }

  return (
    <div
      className="sw-relative"
      ref={containerRef}
      style={{ height: '100%', minHeight: 0, minWidth: 0, width: '100%' }}
    >
      <svg
        aria-label={ariaLabel}
        height={dimensions.height}
        onMouseLeave={() => {
          setIsHoverActive(false);
          setHoveredDotIndex(undefined);
        }}
        onMouseMove={(event) => {
          if (!showTooltip || data.length === 0) {
            return;
          }

          const rect = event.currentTarget.getBoundingClientRect();
          const mouseX = event.clientX - rect.left - paddingLeft;
          const clampedX = Math.max(0, Math.min(mouseX, availableWidth));
          const hoveredDate = xScale.invert(clampedX).getTime();
          const index = getNearestIndex(data, hoveredDate);
          setHoveredLineX(clampedX);
          setHoveredDotIndex(index);
          setIsHoverActive(true);
        }}
        width={dimensions.width}
      >
        <g transform={`translate(${paddingLeft}, ${paddingTop})`}>
          <RenderXAxis
            availableHeight={availableHeight}
            availableWidth={availableWidth}
            xScale={xScale}
          />
          <RenderYAxis
            availableHeight={availableHeight}
            formatTick={formatTick}
            ticks={yTicks}
            yScale={yScale}
          />
          <g>
            {yTicks.map((tick) => (
              <line
                key={`grid-${tick}`}
                opacity={0.075}
                stroke="currentColor"
                strokeDasharray="4,1"
                strokeWidth={1}
                x1={0}
                x2={availableWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
              />
            ))}
          </g>
          {isHoverActive && (
            <line
              opacity={0.3}
              stroke="currentColor"
              strokeWidth={1.5}
              x1={hoveredLineX}
              x2={hoveredLineX}
              y1={0}
              y2={availableHeight}
            />
          )}
          <RenderArea
            areaColor={areaColor}
            areaOpacity={areaOpacity}
            areaPath={areaPath}
            color={color}
            showArea={showArea}
          />
          {showMilestone && milestoneValue !== undefined && (
            <line
              opacity={0.8}
              stroke={milestoneColor}
              strokeDasharray="5,5"
              strokeWidth={2}
              x1={0}
              x2={availableWidth}
              y1={yScale(milestoneValue)}
              y2={yScale(milestoneValue)}
            />
          )}
          <path
            d={linePath || undefined}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isSingleDatapoint ? 6 : strokeWidth}
          />
          <RenderDots
            color={color}
            data={data}
            formatValue={formatDotValue}
            hoveredDotIndex={hoveredDotIndex}
            metricName={metricName}
            showDot={Boolean(showDots && showTooltip && isHoverActive)}
            xScale={xScale}
            yScale={yScale}
          />
          <RenderChartFooter
            availableWidth={availableWidth}
            focusedSeriesIndex={hoveredSeriesIndex ?? undefined}
            isSingleDatapoint={isSingleDatapoint}
            legendItems={[{ color, label: metricName ?? '', seriesIndex: 0 }]}
            onLegendMouseLeave={() => {
              setHoveredSeriesIndex(null);
            }}
            onSeriesHover={(seriesIndex) => {
              setHoveredSeriesIndex(seriesIndex ?? null);
            }}
            showLegend={showLegend}
            x={-40}
            y={availableHeight + 30}
          />
        </g>
      </svg>
    </div>
  );
}
