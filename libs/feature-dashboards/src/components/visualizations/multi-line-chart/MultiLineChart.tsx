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

import { SquareFillIcon } from '@primer/octicons-react';
import { cssVar, Text } from '@sonarsource/echoes-react';
import { line as d3Line } from 'd3-shape';
import { isUndefined } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FormattedMessage } from 'react-intl';
import type { LineChartDataPoint, LineChartSeries } from '../../../types/visualization';
import { formatDateFull } from '../../../utils/datetime';
import { WidgetLoadingSpinner } from '../../common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../common/WidgetNoData';
import {
  createLinearYScale,
  createTimeXScale,
  getNearestIndex,
  useChartDimensions,
} from '../chartGeometry';
import {
  FOOTER_GAP_PX,
  LEGEND_ROW_HEIGHT_PX,
  RenderChartFooter,
  SINGLE_DATAPOINT_MESSAGE_HEIGHT_PX,
} from '../RenderChartFooter';
import { RenderXAxis } from '../RenderXAxis';
import { RenderYAxis } from '../RenderYAxis';
import { MultiLineHoverDots } from './MultiLineHoverDots';

const TOOLTIP_OFFSET_PX = 18;
const HOVER_INDICATOR_BAR_HEIGHT_PX = 14;

interface TooltipPosition {
  x: number;
  y: number;
}

interface MultiLineChartProps {
  ariaLabel: string;
  formatDotValue: (value: number) => React.ReactNode;
  formatTick: (tick: number) => string | React.ReactNode;
  hasFetchError: boolean;
  isMetricRating: boolean;
  isPending: boolean;
  padding?: [number, number, number, number];
  series: LineChartSeries[];
  showLegend?: boolean;
  showTooltip?: boolean;
  strokeWidth?: number;
}

function getPrimarySeries(series: LineChartSeries[]): LineChartSeries | undefined {
  return series[0];
}

function allSeriesHaveSinglePoint(series: LineChartSeries[]): boolean {
  return series.length > 0 && series.every((entry) => entry.data.length === 1);
}

function seriesHasValidData(series: LineChartSeries[]): boolean {
  if (series.length === 0) {
    return false;
  }
  return series.some((entry) =>
    entry.data.some((point) => !isUndefined(point.y) && !Number.isNaN(point.y)),
  );
}

export function MultiLineChart(props: Readonly<MultiLineChartProps>) {
  const {
    ariaLabel,
    formatDotValue,
    formatTick,
    hasFetchError,
    isMetricRating,
    isPending,
    padding = [20, 20, 40, 60],
    series,
    showLegend = false,
    showTooltip = false,
    strokeWidth = 2,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const legendContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dimensions = useChartDimensions(containerRef, isPending);
  const [hoveredSeriesIndex, setHoveredSeriesIndex] = useState<number | undefined>(undefined);
  const [selectedSeriesIndex, setSelectedSeriesIndex] = useState<number | undefined>(undefined);
  const [hoveredLineX, setHoveredLineX] = useState<number>(0);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [isHoverActive, setIsHoverActive] = useState(false);
  const [hoveredDateMs, setHoveredDateMs] = useState<number | undefined>(undefined);

  const primarySeries = getPrimarySeries(series);
  const referenceData = useMemo(() => primarySeries?.data ?? [], [primarySeries]);

  const seriesIdsKey = series.map((entry) => entry.id).join('|');
  useEffect(() => {
    setSelectedSeriesIndex(undefined);
    setHoveredSeriesIndex(undefined);
  }, [seriesIdsKey]);

  const [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding;
  const availableWidth = dimensions.width - paddingLeft - paddingRight;
  const isSingleDatapoint = allSeriesHaveSinglePoint(series);
  const availableHeight =
    dimensions.height -
    paddingTop -
    paddingBottom -
    (isSingleDatapoint ? SINGLE_DATAPOINT_MESSAGE_HEIGHT_PX : 0) -
    (isSingleDatapoint && showLegend ? FOOTER_GAP_PX : 0) -
    (showLegend ? LEGEND_ROW_HEIGHT_PX : 0);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const xScale = useMemo(
    () =>
      createTimeXScale(
        series.flatMap((entry) => entry.data.map((point) => new Date(point.x))),
        availableWidth,
      ),
    [availableWidth, series],
  );

  const clearChartHover = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsHoverActive(false);
    setHoveredDateMs(undefined);
    setTooltipPosition(null);
  }, []);

  const isPointerInPlotArea = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      const { clientX, clientY, currentTarget } = event;
      const rect = currentTarget.getBoundingClientRect();
      const mouseChartX = clientX - rect.left - paddingLeft;
      const mouseChartY = clientY - rect.top - paddingTop;

      return (
        mouseChartX >= 0 &&
        mouseChartX <= availableWidth &&
        mouseChartY >= 0 &&
        mouseChartY <= availableHeight
      );
    },
    [availableHeight, availableWidth, paddingLeft, paddingTop],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!isPointerInPlotArea(event)) {
        clearChartHover();
        return;
      }

      if (!showTooltip || referenceData.length === 0) {
        return;
      }

      const { clientX, clientY, currentTarget } = event;
      const rect = currentTarget.getBoundingClientRect();
      const mouseChartX = clientX - rect.left - paddingLeft;
      const clampedX = Math.max(0, Math.min(mouseChartX, availableWidth));

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        setHoveredLineX(clampedX);
        setHoveredDateMs(xScale.invert(clampedX).getTime());
        setTooltipPosition({ x: clientX, y: clientY });
        setIsHoverActive(true);
      });
    },
    [
      availableWidth,
      clearChartHover,
      isPointerInPlotArea,
      paddingLeft,
      referenceData.length,
      showTooltip,
      xScale,
    ],
  );

  const handleMouseLeave = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      const { relatedTarget } = event;
      if (relatedTarget instanceof Node && legendContainerRef.current?.contains(relatedTarget)) {
        clearChartHover();
        return;
      }

      clearChartHover();
      setHoveredSeriesIndex(undefined);
    },
    [clearChartHover],
  );

  const handleLegendMouseEnter = useCallback(() => {
    clearChartHover();
  }, [clearChartHover]);

  const handleLegendMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const { relatedTarget } = event;
    if (relatedTarget instanceof Node && containerRef.current?.contains(relatedTarget)) {
      return;
    }

    setHoveredSeriesIndex(undefined);
  }, []);

  const handleSeriesHover = useCallback((seriesIndex: number | undefined) => {
    setHoveredSeriesIndex(seriesIndex);
  }, []);

  const handleSeriesSelect = useCallback((seriesIndex: number) => {
    setSelectedSeriesIndex((current) => (current === seriesIndex ? undefined : seriesIndex));
  }, []);

  const focusedSeriesIndex = hoveredSeriesIndex ?? selectedSeriesIndex;

  const yScale = useMemo(
    () =>
      createLinearYScale(
        series.flatMap((entry) => entry.data.map((point) => point.y)),
        availableHeight,
        isMetricRating,
      ),
    [availableHeight, isMetricRating, series],
  );

  const yTicks = isMetricRating ? [1, 2, 3, 4, 5] : yScale.ticks(5);

  const linePaths = useMemo(() => {
    const generator = d3Line<LineChartDataPoint>()
      .defined((point) => point.y !== null && point.y !== undefined)
      .x((point) => xScale(new Date(point.x)))
      .y((point) => yScale(point.y));

    return series.map((entry) => ({
      id: entry.id,
      color: entry.color,
      path: generator(entry.data),
    }));
  }, [series, xScale, yScale]);

  const hoveredIndex = useMemo(() => {
    if (!isHoverActive || referenceData.length === 0) {
      return undefined;
    }
    const dateMs = hoveredDateMs ?? xScale.invert(hoveredLineX).getTime();
    return getNearestIndex(referenceData, dateMs);
  }, [hoveredDateMs, hoveredLineX, isHoverActive, referenceData, xScale]);

  const tooltipSeriesValues = useMemo(() => {
    if (hoveredDateMs === undefined) {
      return [];
    }
    return series
      .map((entry, seriesIndex) => {
        const index = getNearestIndex(entry.data, hoveredDateMs);
        const point = entry.data[index];
        if (!point) {
          return null;
        }
        return {
          color: entry.color,
          id: entry.id,
          label: entry.label,
          rawY: point.y,
          seriesIndex,
          value: formatDotValue(point.y),
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }, [formatDotValue, hoveredDateMs, series]);

  const tooltipTotal = useMemo(() => {
    if (isMetricRating || tooltipSeriesValues.length <= 1) {
      return null;
    }

    const sum = tooltipSeriesValues.reduce((total, entry) => total + entry.rawY, 0);
    return formatDotValue(sum);
  }, [formatDotValue, isMetricRating, tooltipSeriesValues]);

  let tooltipTitleDate: Date | number | undefined;
  if (hoveredDateMs !== undefined) {
    tooltipTitleDate = new Date(hoveredDateMs);
  } else if (hoveredIndex !== undefined) {
    tooltipTitleDate = referenceData[hoveredIndex]?.x;
  }

  const legendItems = useMemo(
    () =>
      series.map((entry, seriesIndex) => ({
        color: entry.color,
        label: entry.label,
        seriesIndex,
      })),
    [series],
  );

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

  if (
    !seriesHasValidData(series) ||
    (referenceData.length === 1 && isUndefined(referenceData[0]?.y))
  ) {
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
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        width={dimensions.width}
      >
        <g transform={`translate(${paddingLeft}, ${paddingTop})`}>
          <g style={{ cursor: showTooltip ? 'crosshair' : undefined }}>
            <rect fill="transparent" height={availableHeight} width={availableWidth} x={0} y={0} />
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
            <g pointerEvents="none">
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
                pointerEvents="none"
                stroke="currentColor"
                strokeWidth={1.5}
                x1={hoveredLineX}
                x2={hoveredLineX}
                y1={0}
                y2={availableHeight}
              />
            )}
            {linePaths.map((entry, index) => (
              <path
                d={entry.path || undefined}
                fill="none"
                key={entry.id}
                onMouseEnter={() => {
                  setHoveredSeriesIndex(index);
                }}
                opacity={
                  focusedSeriesIndex === undefined || focusedSeriesIndex === index ? 1 : 0.35
                }
                stroke={entry.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={isSingleDatapoint ? 6 : strokeWidth}
                style={{ cursor: showTooltip ? 'crosshair' : undefined }}
              />
            ))}
            {showTooltip && isHoverActive && hoveredDateMs !== undefined && (
              <MultiLineHoverDots
                getNearestIndex={getNearestIndex}
                hoveredDateMs={hoveredDateMs}
                hoveredSeriesIndex={focusedSeriesIndex}
                series={series}
                xScale={xScale}
                yScale={yScale}
              />
            )}
          </g>
          <RenderChartFooter
            availableWidth={availableWidth}
            focusedSeriesIndex={focusedSeriesIndex}
            isSingleDatapoint={isSingleDatapoint}
            legendContainerRef={legendContainerRef}
            legendItems={legendItems}
            onLegendMouseEnter={handleLegendMouseEnter}
            onLegendMouseLeave={handleLegendMouseLeave}
            onSeriesHover={handleSeriesHover}
            onSeriesSelect={handleSeriesSelect}
            selectedSeriesIndex={selectedSeriesIndex}
            showLegend={showLegend}
            x={-40}
            y={availableHeight + 30}
          />
        </g>
      </svg>
      {showTooltip &&
        tooltipPosition &&
        isHoverActive &&
        tooltipTitleDate &&
        tooltipSeriesValues.length > 0 &&
        createPortal(
          <div
            className="sw-fixed sw-z-popup sw-rounded-1 sw-p-3"
            data-testid="line-chart-tooltip"
            style={{
              backgroundColor: cssVar('color-surface-default'),
              border: `1px solid ${cssVar('color-border-weak')}`,
              boxShadow: cssVar('box-shadow-large'),
              left: `${tooltipPosition.x + TOOLTIP_OFFSET_PX}px`,
              pointerEvents: 'none',
              top: `${tooltipPosition.y}px`,
              transform: 'translate3d(0, -50%, 0)',
              willChange: 'transform',
            }}
          >
            <div className="sw-flex sw-flex-col sw-gap-2">
              <Text isHighlighted>{formatDateFull(tooltipTitleDate as Date)}</Text>
              <div className="sw-flex sw-flex-col sw-gap-1">
                {tooltipSeriesValues.map((entry) => {
                  const isFocusedSeries =
                    focusedSeriesIndex !== undefined && entry.seriesIndex === focusedSeriesIndex;
                  const isDimmed = focusedSeriesIndex !== undefined && !isFocusedSeries;

                  return (
                    <div
                      className="sw-flex sw-items-center sw-gap-1"
                      key={entry.id}
                      style={{ opacity: isDimmed ? 0.55 : 1 }}
                    >
                      <div
                        aria-hidden
                        style={{
                          backgroundColor: isFocusedSeries ? entry.color : 'transparent',
                          borderRadius: 1,
                          flexShrink: 0,
                          height: HOVER_INDICATOR_BAR_HEIGHT_PX,
                          width: 3,
                        }}
                      />
                      <div className="sw-flex sw-flex-1 sw-items-center sw-gap-1">
                        <SquareFillIcon fill={entry.color} size={16} />
                        <div className="sw-flex sw-justify-between sw-w-full sw-gap-2">
                          <Text isHighlighted={isFocusedSeries} isSubtle={!isFocusedSeries}>
                            {entry.label}
                          </Text>
                          <Text isHighlighted={isFocusedSeries}>{entry.value}</Text>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {tooltipTotal !== null && (
                  <div
                    className="sw-flex sw-items-stretch sw-gap-1 sw-pt-1 sw-mt-1"
                    style={{ borderTop: `1px solid ${cssVar('color-border-weak')}` }}
                  >
                    <div aria-hidden style={{ flexShrink: 0, width: 3 }} />
                    <div className="sw-flex sw-flex-1 sw-justify-between sw-gap-2">
                      <Text isHighlighted>
                        <FormattedMessage id="total" />
                      </Text>
                      <Text isHighlighted>{tooltipTotal}</Text>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
