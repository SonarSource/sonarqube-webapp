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

import { cssVar } from '@sonarsource/echoes-react';
import { max, min } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import { type SVGProps, useId, useMemo } from 'react';
import { useIntl } from 'react-intl';

const CHART_COLOR = cssVar('color-charts-categorical-1');
const STROKE_COLOR = CHART_COLOR;
const STROKE_WIDTH = 1.5;
const VIEW_PADDING = 2;
const NO_DATA_DASH_PATTERN = '4 4';

const AREA_GRADIENT_TOP_OPACITY = 0.22;
const AREA_GRADIENT_BOTTOM_OPACITY = 0.04;

export const SPARKLINE_WIDTH = 80;
export const SPARKLINE_HEIGHT = 30;

export interface SparklineProps {
  className?: string;
  data: number[];
  fullWidth?: boolean;
  height?: number;
  preserveAspectRatio?: SVGProps<SVGSVGElement>['preserveAspectRatio'];
  width?: number;
}

function buildSparklineAriaLabel(
  data: number[],
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
): string {
  if (data.length === 0) {
    return formatMessage({ id: 'dashboard.sparkline.aria.no_historical_data' });
  }

  const first = data[0];
  const last = data.at(-1)!;

  if (first === last) {
    return formatMessage({ id: 'dashboard.sparkline.aria.flat' });
  }

  if (first === 0 && last !== 0) {
    return formatMessage({ id: 'dashboard.sparkline.aria.increase_from_zero' }, { value: last });
  }

  const percentChange = ((last - first) / first) * 100;
  if (Math.abs(percentChange) < 0.05) {
    return formatMessage({ id: 'dashboard.sparkline.aria.flat' });
  }

  const rounded = Math.round(percentChange * 10) / 10;
  const absFormatted = `${Math.abs(rounded)}%`;

  if (last > first) {
    return formatMessage(
      { id: 'dashboard.sparkline.aria.trend_up' },
      {
        percent: `${rounded > 0 ? '+' : ''}${rounded}%`,
      },
    );
  }

  return formatMessage({ id: 'dashboard.sparkline.aria.trend_down' }, { percent: absFormatted });
}

type SparklineGeometry =
  | {
      mode: 'empty';
    }
  | {
      areaPath: string;
      linePath: string;
      mode: 'series';
    };

function computeSparklineGeometry(
  data: number[],
  width: number,
  height: number,
): SparklineGeometry {
  const innerWidth = Math.max(0, width - 2 * VIEW_PADDING);
  const innerHeight = Math.max(0, height - 2 * VIEW_PADDING);

  if (data.length === 0 || innerWidth <= 0 || innerHeight <= 0) {
    return { mode: 'empty' };
  }

  const xScale = scaleLinear()
    .domain(data.length === 1 ? [0, 1] : [0, data.length - 1])
    .range([0, innerWidth]);

  const baselineY = innerHeight + VIEW_PADDING;

  const yMin = min(data) ?? 0;
  const yMax = max(data) ?? 0;
  const [domainMin, domainMax] = yMin === yMax ? [yMin - 1, yMax + 1] : [yMin, yMax];
  const yScale = scaleLinear().domain([domainMin, domainMax]).range([innerHeight, 0]);

  if (data.length === 1) {
    const y = yScale(data[0]);
    const x1 = 0;
    const x2 = innerWidth;
    const linePath = `M${x1},${y} L${x2},${y}`;
    const areaPath = `${linePath} L${x2},${baselineY} L${x1},${baselineY} Z`;
    return { areaPath, linePath, mode: 'series' };
  }

  const lineGenerator = d3Line<number>()
    .x((_, i) => xScale(i))
    .y((d) => yScale(d));

  const linePath = lineGenerator(data);
  if (linePath === null) {
    return { mode: 'empty' };
  }

  const firstX = xScale(0);
  const lastX = xScale(data.length - 1);
  const areaPath = `${linePath} L${lastX},${baselineY} L${firstX},${baselineY} Z`;

  return { areaPath, linePath, mode: 'series' };
}

export function Sparkline({
  className,
  data,
  fullWidth = false,
  height = SPARKLINE_HEIGHT,
  preserveAspectRatio,
  width = SPARKLINE_WIDTH,
}: Readonly<SparklineProps>) {
  const { formatMessage } = useIntl();
  const reactId = useId();
  const gradientId = `sparkline-gradient-${reactId.replaceAll(':', '')}`;

  const ariaLabel = useMemo(
    () => buildSparklineAriaLabel(data, formatMessage),
    [data, formatMessage],
  );

  const geometry = useMemo(
    () => computeSparklineGeometry(data, width, height),
    [data, height, width],
  );

  const svgWidth = fullWidth ? '100%' : width;
  const resolvedPreserveAspectRatio = fullWidth ? 'none' : preserveAspectRatio;

  return (
    <svg
      aria-label={ariaLabel}
      className={className}
      height={height}
      preserveAspectRatio={resolvedPreserveAspectRatio}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      width={svgWidth}
    >
      {geometry.mode === 'series' ? (
        <defs>
          <linearGradient
            gradientUnits="objectBoundingBox"
            id={gradientId}
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={AREA_GRADIENT_TOP_OPACITY} />
            <stop offset="60%" stopColor={CHART_COLOR} stopOpacity={0.17} />
            <stop offset="88%" stopColor={CHART_COLOR} stopOpacity={0.09} />
            <stop
              offset="100%"
              stopColor={CHART_COLOR}
              stopOpacity={AREA_GRADIENT_BOTTOM_OPACITY}
            />
          </linearGradient>
        </defs>
      ) : null}
      <g transform={`translate(${VIEW_PADDING}, ${VIEW_PADDING})`}>
        {geometry.mode === 'empty' ? (
          <line
            stroke={cssVar('color-border-weak')}
            strokeDasharray={NO_DATA_DASH_PATTERN}
            strokeLinecap="round"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            x1={0}
            x2={Math.max(0, width - 2 * VIEW_PADDING)}
            y1={Math.max(0, height - 2 * VIEW_PADDING) / 2}
            y2={Math.max(0, height - 2 * VIEW_PADDING) / 2}
          />
        ) : (
          <>
            <path d={geometry.areaPath} fill={`url(#${gradientId})`} />
            <path
              d={geometry.linePath}
              fill="none"
              stroke={STROKE_COLOR}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={STROKE_WIDTH}
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </g>
    </svg>
  );
}
