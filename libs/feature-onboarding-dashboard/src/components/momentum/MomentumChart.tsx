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

import { cssVar, Text, TextSize } from '@sonarsource/echoes-react';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { isDefined } from '~shared/helpers/types';
import { useResizeObserver } from '~shared/helpers/useResizeObserver';
import { OnboardingMomentum } from '~shared/types/onboarding';

const MIN_HEIGHT = 200;
const MARGIN = { top: 16, right: 16, bottom: 28, left: 40 };
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TOOLTIP_WIDTH = 180;

const COLOR_ONBOARDED = cssVar('color-background-success-default');
const COLOR_IMPORTED = cssVar('color-background-info-default');
const COLOR_TOTAL = cssVar('color-background-neutral-bolder-default');
const COLOR_AXIS = cssVar('color-border-weak');
const COLOR_CURSOR = cssVar('color-border-bold');
const COLOR_LABEL = cssVar('color-text-subtle');
const COLOR_SURFACE = cssVar('color-surface-default');

const LEGEND_ITEMS = [
  { color: COLOR_TOTAL, labelId: 'onboarding_dashboard.momentum.legend.total' },
  { color: COLOR_IMPORTED, labelId: 'onboarding_dashboard.momentum.legend.imported' },
  { color: COLOR_ONBOARDED, labelId: 'onboarding_dashboard.momentum.legend.onboarded' },
];

interface Point {
  x: Date;
  y: number;
}

interface Props {
  momentum: OnboardingMomentum;
}

export function MomentumChart({ momentum }: Readonly<Props>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, height] = useResizeObserver(containerRef);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = [...momentum.weeklyHistory].sort((a, b) => a.weekStart - b.weekStart);
  const hasData = points.length > 0;
  const chartHeight = Math.max(height ?? 0, MIN_HEIGHT);
  const canRender = width !== undefined && width > 0 && hasData;

  return (
    <div className="sw-flex sw-h-full sw-flex-col sw-gap-4">
      <div className="sw-relative sw-min-h-0 sw-w-full sw-min-w-0 sw-grow" ref={containerRef}>
        {canRender && (
          <MomentumGraph
            height={chartHeight}
            hoverIndex={hoverIndex}
            momentum={momentum}
            points={points}
            setHoverIndex={setHoverIndex}
            width={width}
          />
        )}
      </div>
      <MomentumLegend />
    </div>
  );
}

interface GraphProps {
  height: number;
  hoverIndex: number | null;
  momentum: OnboardingMomentum;
  points: OnboardingMomentum['weeklyHistory'];
  setHoverIndex: (index: number | null) => void;
  width: number;
}

function MomentumGraph({
  height,
  hoverIndex,
  momentum,
  points,
  setHoverIndex,
  width,
}: Readonly<GraphProps>) {
  const { formatDate, formatMessage } = useIntl();

  const minX = points.at(0)?.weekStart ?? 0;
  const lastX = points.at(-1)?.weekStart ?? 0;
  const maxX = lastX === minX ? minX + WEEK_MS : lastX;

  const totalRepos = momentum.totalRepos ?? 0;
  const yMax = Math.max(
    totalRepos,
    ...points.map((p) => p.cumulativeImported),
    ...points.map((p) => p.cumulativeOnboarded),
    1,
  );

  const xScale = scaleTime()
    .domain([new Date(minX), new Date(maxX)])
    .range([MARGIN.left, width - MARGIN.right]);
  const yScale = scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([height - MARGIN.bottom, MARGIN.top]);

  const onboardedData: Point[] = points.map((p) => ({
    x: new Date(p.weekStart),
    y: p.cumulativeOnboarded,
  }));
  const importedData: Point[] = points.map((p) => ({
    x: new Date(p.weekStart),
    y: p.cumulativeImported,
  }));

  const lineGen = d3Line<Point>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  const totalY = yScale(totalRepos);
  const xTicks = xScale.ticks(Math.min(5, Math.max(points.length, 2)));
  const yTicks = yScale.ticks(5);
  const pointX = points.map((p) => xScale(new Date(p.weekStart)));

  const handleMove = (event: React.MouseEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (svg === null) {
      return;
    }
    const x = event.clientX - svg.getBoundingClientRect().left;
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

  const hovered = isDefined(hoverIndex) ? points[hoverIndex] : undefined;

  return (
    <>
      <svg
        aria-label={formatMessage({ id: 'onboarding_dashboard.momentum.title' })}
        height={height}
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
              fontSize={10}
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
            fontSize={10}
            key={`x-${tick.getTime()}`}
            textAnchor="middle"
            x={xScale(tick)}
            y={height - MARGIN.bottom + 16}
          >
            {formatDate(tick, { day: 'numeric', month: 'short' })}
          </text>
        ))}

        {/* Total repositories reference line (flat, dashed) */}
        {momentum.totalRepos !== null && (
          <line
            stroke={COLOR_TOTAL}
            strokeDasharray="4 4"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={totalY}
            y2={totalY}
          />
        )}

        {/* Imported series */}
        <path
          d={lineGen(importedData) ?? undefined}
          fill="none"
          stroke={COLOR_IMPORTED}
          strokeWidth={2}
        />
        {importedData.map((d) => (
          <circle
            cx={xScale(d.x)}
            cy={yScale(d.y)}
            fill={COLOR_IMPORTED}
            key={`i-${d.x.getTime()}`}
            r={2.5}
          />
        ))}

        {/* Onboarded series */}
        <path
          d={lineGen(onboardedData) ?? undefined}
          fill="none"
          stroke={COLOR_ONBOARDED}
          strokeWidth={2}
        />
        {onboardedData.map((d) => (
          <circle
            cx={xScale(d.x)}
            cy={yScale(d.y)}
            fill={COLOR_ONBOARDED}
            key={`o-${d.x.getTime()}`}
            r={2.5}
          />
        ))}

        {/* Hover cursor line + emphasized points */}
        {hovered !== undefined && (
          <g>
            <line
              stroke={COLOR_CURSOR}
              x1={xScale(new Date(hovered.weekStart))}
              x2={xScale(new Date(hovered.weekStart))}
              y1={MARGIN.top}
              y2={height - MARGIN.bottom}
            />
            <circle
              cx={xScale(new Date(hovered.weekStart))}
              cy={yScale(hovered.cumulativeImported)}
              fill={COLOR_IMPORTED}
              r={4}
            />
            <circle
              cx={xScale(new Date(hovered.weekStart))}
              cy={yScale(hovered.cumulativeOnboarded)}
              fill={COLOR_ONBOARDED}
              r={4}
            />
          </g>
        )}

        {/* Transparent overlay capturing hover */}
        <rect
          fill="transparent"
          height={Math.max(0, height - MARGIN.top - MARGIN.bottom)}
          onMouseLeave={() => {
            setHoverIndex(null);
          }}
          onMouseMove={handleMove}
          width={Math.max(0, width - MARGIN.left - MARGIN.right)}
          x={MARGIN.left}
          y={MARGIN.top}
        />
      </svg>

      {hovered !== undefined && (
        <MomentumTooltip
          cursorX={xScale(new Date(hovered.weekStart))}
          momentum={momentum}
          week={hovered}
          width={width}
        />
      )}
    </>
  );
}

interface TooltipProps {
  cursorX: number;
  momentum: OnboardingMomentum;
  week: OnboardingMomentum['weeklyHistory'][number];
  width: number;
}

function MomentumTooltip({ cursorX, momentum, week, width }: Readonly<TooltipProps>) {
  const { formatDate, formatMessage } = useIntl();
  const placeRight = cursorX < width - TOOLTIP_WIDTH;

  const rows: Array<{ color: string; labelId: string; value: number }> = [];
  if (momentum.totalRepos !== null) {
    rows.push({
      color: COLOR_TOTAL,
      labelId: 'onboarding_dashboard.momentum.legend.total',
      value: momentum.totalRepos,
    });
  }
  rows.push(
    {
      color: COLOR_IMPORTED,
      labelId: 'onboarding_dashboard.momentum.legend.imported',
      value: week.cumulativeImported,
    },
    {
      color: COLOR_ONBOARDED,
      labelId: 'onboarding_dashboard.momentum.legend.onboarded',
      value: week.cumulativeOnboarded,
    },
  );

  return (
    <div
      className="sw-pointer-events-none sw-absolute sw-flex sw-flex-col sw-gap-1 sw-whitespace-nowrap sw-rounded-2 sw-border sw-px-3 sw-py-2 sw-shadow-sm"
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
        {formatDate(new Date(week.weekStart), { month: 'short', year: 'numeric' })}
      </Text>
      {rows.map((row) => (
        <div className="sw-flex sw-items-center sw-justify-between sw-gap-4" key={row.labelId}>
          <span className="sw-flex sw-items-center sw-gap-1">
            <span
              aria-hidden
              className="sw-inline-block sw-shrink-0 sw-rounded-pill"
              style={{ backgroundColor: row.color, height: '0.625rem', width: '0.625rem' }}
            />
            <Text isSubtle size={TextSize.Small}>
              {formatMessage({ id: row.labelId })}
            </Text>
          </span>
          <Text isHighlighted size={TextSize.Small}>
            {row.value}
          </Text>
        </div>
      ))}
    </div>
  );
}

function MomentumLegend() {
  const { formatMessage } = useIntl();

  return (
    <div className="sw-flex sw-flex-wrap sw-justify-start sw-gap-2">
      {LEGEND_ITEMS.map((item) => (
        <div
          className="sw-flex sw-items-center sw-gap-1 sw-rounded-pill sw-border sw-px-2 sw-py-1"
          key={item.labelId}
          style={{ borderColor: COLOR_AXIS }}
        >
          <span
            aria-hidden
            className="sw-inline-block sw-shrink-0 sw-rounded-pill"
            style={{ backgroundColor: item.color, height: '0.5rem', width: '0.5rem' }}
          />
          <Text isSubtle size={TextSize.Small}>
            {formatMessage({ id: item.labelId })}
          </Text>
        </div>
      ))}
    </div>
  );
}
