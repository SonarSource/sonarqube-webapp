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

import { Card, cssVar, Text, TextSize } from '@sonarsource/echoes-react';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { isDefined } from '~shared/helpers/types';
import { useResizeObserver } from '~shared/helpers/useResizeObserver';
import { OnboardingTimelinePoint } from '~shared/types/onboarding';

const MIN_HEIGHT = 200;
const MARGIN = { top: 16, right: 16, bottom: 28, left: 40 };
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TOOLTIP_WIDTH = 200;
const X_TICK_COUNT = 5;
const Y_TICK_COUNT = 5;

const COLOR_PROJECTS_SCANNED = cssVar('color-background-success-default');
const COLOR_IMPORTED = cssVar('color-background-info-default');
const COLOR_AXIS = cssVar('color-border-weak');
const COLOR_CURSOR = cssVar('color-border-bold');
const COLOR_LABEL = cssVar('color-text-subtle');
const COLOR_SURFACE = cssVar('color-surface-default');
const FONT_SIZE_AXIS_LABEL = cssVar('font-size-10');

interface Point {
  x: Date;
  y: number;
}

interface Series {
  color: string;
  labelId: string;
  points: Point[];
}

interface Props {
  showImportedSeries: boolean;
  timeline: OnboardingTimelinePoint[];
}

export function OnboardingOverTimeCard({ showImportedSeries, timeline }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <Card className="sw-flex sw-h-full sw-flex-col">
      <Card.Header
        description={formatMessage({ id: 'onboarding_dashboard.journey.overtime.description' })}
        title={formatMessage({ id: 'onboarding_dashboard.journey.overtime.title' })}
      />
      <Card.Body className="sw-flex sw-min-h-0 sw-grow sw-flex-col">
        <OverTimeChart showImportedSeries={showImportedSeries} timeline={timeline} />
      </Card.Body>
    </Card>
  );
}

/**
 * Builds the plotted series from the monthly timeline. Every series shares the same x values, so
 * the first one doubles as the x-axis reference.
 */
function buildSeries(points: OnboardingTimelinePoint[], showImportedSeries: boolean): Series[] {
  const series: Series[] = [
    {
      color: COLOR_PROJECTS_SCANNED,
      labelId: 'onboarding_dashboard.journey.overtime.legend.projects_scanned',
      points: points.map((point) => ({ x: new Date(point.date), y: point.projectsScanned })),
    },
  ];

  if (showImportedSeries) {
    series.push({
      color: COLOR_IMPORTED,
      labelId: 'onboarding_dashboard.journey.overtime.legend.repositories_imported',
      points: points.map((point) => ({ x: new Date(point.date), y: point.repositoriesImported })),
    });
  }

  return series;
}

interface ChartProps {
  showImportedSeries: boolean;
  timeline: OnboardingTimelinePoint[];
}

function OverTimeChart({ showImportedSeries, timeline }: Readonly<ChartProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, height] = useResizeObserver(containerRef);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = [...timeline].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const series = buildSeries(points, showImportedSeries);
  const chartHeight = Math.max(height ?? 0, MIN_HEIGHT);
  const canRender = width !== undefined && width > 0 && points.length > 0;

  return (
    <div className="sw-flex sw-h-full sw-flex-col sw-gap-4">
      <div className="sw-relative sw-min-h-0 sw-w-full sw-min-w-0 sw-grow" ref={containerRef}>
        {canRender && (
          <OverTimeGraph
            height={chartHeight}
            hoverIndex={hoverIndex}
            series={series}
            setHoverIndex={setHoverIndex}
            width={width}
          />
        )}
      </div>
      <OverTimeLegend series={series} />
    </div>
  );
}

interface GraphProps {
  height: number;
  hoverIndex: number | null;
  series: Series[];
  setHoverIndex: (index: number | null) => void;
  width: number;
}

function OverTimeGraph({ height, hoverIndex, series, setHoverIndex, width }: Readonly<GraphProps>) {
  const { formatDate, formatMessage } = useIntl();

  // Every series shares the same weekly x values.
  const xValues = series[0].points.map((point) => point.x);
  const timestamps = xValues.map((date) => date.getTime());
  const minX = Math.min(...timestamps);
  const lastX = Math.max(...timestamps);
  const maxX = lastX === minX ? minX + WEEK_MS : lastX;
  const yMax = Math.max(...series.flatMap((s) => s.points.map((point) => point.y)), 1);

  const xScale = scaleTime()
    .domain([new Date(minX), new Date(maxX)])
    .range([MARGIN.left, width - MARGIN.right]);
  const yScale = scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([height - MARGIN.bottom, MARGIN.top]);

  const lineGen = d3Line<Point>()
    .x((point) => xScale(point.x))
    .y((point) => yScale(point.y));

  const xTicks = xScale.ticks(X_TICK_COUNT);
  const yTicks = yScale.ticks(Y_TICK_COUNT);
  const pointX = xValues.map((date) => xScale(date));

  // Hover is captured on the whole plot rather than on an overlay rectangle, so that the chart
  // stays reachable as a single labelled graphic.
  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().left;
    let nearest = 0;
    let best = Infinity;
    pointX.forEach((px, index) => {
      const distance = Math.abs(px - x);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    setHoverIndex(nearest);
  };

  const hoveredDate = isDefined(hoverIndex) ? xValues[hoverIndex] : undefined;

  return (
    <>
      <svg
        aria-label={formatMessage({ id: 'onboarding_dashboard.journey.overtime.title' })}
        height={height}
        onMouseLeave={() => {
          setHoverIndex(null);
        }}
        onMouseMove={handleMove}
        role="img"
        width={width}
      >
        {/* Horizontal gridlines + y-axis labels */}
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line
              stroke={COLOR_AXIS}
              x1={MARGIN.left}
              x2={width - MARGIN.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
            />
            <text
              dominantBaseline="middle"
              fill={COLOR_LABEL}
              fontSize={FONT_SIZE_AXIS_LABEL}
              textAnchor="end"
              x={MARGIN.left - 6}
              y={yScale(tick)}
            >
              {tick}
            </text>
          </g>
        ))}

        {/* X-axis tick labels */}
        {xTicks.map((tick) => (
          <text
            fill={COLOR_LABEL}
            fontSize={FONT_SIZE_AXIS_LABEL}
            key={`x-${tick.getTime()}`}
            textAnchor="middle"
            x={xScale(tick)}
            y={height - MARGIN.bottom + 16}
          >
            {formatDate(tick, { day: 'numeric', month: 'short' })}
          </text>
        ))}

        {series.map((s) => (
          <g key={s.labelId}>
            <path d={lineGen(s.points) ?? undefined} fill="none" stroke={s.color} strokeWidth={2} />
            {s.points.map((point) => (
              <circle
                cx={xScale(point.x)}
                cy={yScale(point.y)}
                fill={s.color}
                key={point.x.getTime()}
                r={2.5}
              />
            ))}
          </g>
        ))}

        {/* Hover cursor line + emphasized points */}
        {hoveredDate !== undefined && isDefined(hoverIndex) && (
          <g>
            <line
              stroke={COLOR_CURSOR}
              x1={xScale(hoveredDate)}
              x2={xScale(hoveredDate)}
              y1={MARGIN.top}
              y2={height - MARGIN.bottom}
            />
            {series.map((s) => (
              <circle
                cx={xScale(hoveredDate)}
                cy={yScale(s.points[hoverIndex].y)}
                fill={s.color}
                key={s.labelId}
                r={4}
              />
            ))}
          </g>
        )}
      </svg>

      {hoveredDate !== undefined && isDefined(hoverIndex) && (
        <OverTimeTooltip
          cursorX={xScale(hoveredDate)}
          date={hoveredDate}
          hoverIndex={hoverIndex}
          series={series}
          width={width}
        />
      )}
    </>
  );
}

interface TooltipProps {
  cursorX: number;
  date: Date;
  hoverIndex: number;
  series: Series[];
  width: number;
}

function OverTimeTooltip({ cursorX, date, hoverIndex, series, width }: Readonly<TooltipProps>) {
  const { formatDate, formatMessage } = useIntl();
  const placeRight = cursorX < width - TOOLTIP_WIDTH;

  return (
    <div
      className="sw-pointer-events-none sw-absolute sw-flex sw-flex-col sw-gap-1 sw-whitespace-nowrap sw-rounded-2 sw-border sw-px-3 sw-py-2 sw-shadow-sm"
      role="tooltip"
      style={{
        background: COLOR_SURFACE,
        borderColor: COLOR_AXIS,
        left: placeRight ? cursorX + 8 : cursorX - 8,
        top: MARGIN.top,
        transform: placeRight ? undefined : 'translateX(-100%)',
        width: TOOLTIP_WIDTH,
      }}
    >
      <Text isHighlighted size={TextSize.Small}>
        {formatDate(date, { month: 'short', year: 'numeric' })}
      </Text>

      {series.map((s) => (
        <div className="sw-flex sw-items-center sw-justify-between sw-gap-4" key={s.labelId}>
          <span className="sw-flex sw-items-center sw-gap-1">
            <span
              aria-hidden
              className="sw-inline-block sw-shrink-0 sw-rounded-pill"
              style={{ backgroundColor: s.color, height: '0.625rem', width: '0.625rem' }}
            />
            <Text isSubtle size={TextSize.Small}>
              {formatMessage({ id: s.labelId })}
            </Text>
          </span>
          <Text isHighlighted size={TextSize.Small}>
            {s.points[hoverIndex].y}
          </Text>
        </div>
      ))}
    </div>
  );
}

interface LegendProps {
  series: Series[];
}

function OverTimeLegend({ series }: Readonly<LegendProps>) {
  const { formatMessage } = useIntl();

  return (
    <div className="sw-flex sw-flex-wrap sw-justify-start sw-gap-2">
      {series.map((s) => (
        <div
          className="sw-flex sw-items-center sw-gap-1 sw-rounded-pill sw-border sw-px-2 sw-py-1"
          key={s.labelId}
          style={{ borderColor: COLOR_AXIS }}
        >
          <span
            aria-hidden
            className="sw-inline-block sw-shrink-0 sw-rounded-pill"
            style={{ backgroundColor: s.color, height: '0.5rem', width: '0.5rem' }}
          />
          <Text isSubtle size={TextSize.Small}>
            {formatMessage({ id: s.labelId })}
          </Text>
        </div>
      ))}
    </div>
  );
}
