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

import { arc as d3Arc, pie as d3Pie, PieArcDatum } from 'd3-shape';
import type { MouseEvent } from 'react';

export interface DataPoint {
  fill: string;
  value: number;
}

const HOVER_EXPANSION_PX = 5;

export interface DonutChartProps {
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-label'?: string;
  cornerRadius?: number;
  data: DataPoint[];
  height: number;
  hoveredIndex?: number | null;
  minPercent?: number;
  onArcMouseEnter?: (index: number, event: MouseEvent<SVGPathElement>) => void;
  onArcMouseLeave?: (event: MouseEvent<SVGPathElement>) => void;
  onSvgMouseMove?: (event: MouseEvent<SVGSVGElement>) => void;
  padAngle?: number;
  padding?: [number, number, number, number];
  thickness: number;
  width: number;
}

export function DonutChart(props: Readonly<DonutChartProps>) {
  const {
    height,
    cornerRadius,
    hoveredIndex,
    minPercent = 0,
    onArcMouseEnter,
    onArcMouseLeave,
    onSvgMouseMove,
    padding = [0, 0, 0, 0],
    width,
    padAngle,
    data,
    thickness,
    ...rest
  } = props;

  const availableWidth = width - padding[1] - padding[3];
  const availableHeight = height - padding[0] - padding[2];

  const size = Math.min(availableWidth, availableHeight);
  const radius = Math.floor(size / 2);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  const pie = d3Pie<unknown, DataPoint>()
    .sort(null)
    .value((d) => Math.max(d.value, (total / 100) * minPercent));

  if (padAngle !== undefined) {
    pie.padAngle(padAngle);
  }

  const sectors = pie(data).map((d, i) => {
    return (
      <Sector
        cornerRadius={cornerRadius}
        data={d}
        fill={data[i].fill}
        index={i}
        isHovered={hoveredIndex === i}
        key={i}
        onMouseEnter={onArcMouseEnter}
        onMouseLeave={onArcMouseLeave}
        radius={radius}
        thickness={thickness}
      />
    );
  });

  return (
    <svg
      className="donut-chart"
      height={height}
      onMouseMove={onSvgMouseMove}
      style={{ overflow: onArcMouseEnter ? 'visible' : undefined }}
      width={width}
      {...rest}
    >
      <g
        data-testid="donut-chart-outer-group"
        transform={`translate(${padding[3]}, ${padding[0]})`}
      >
        <g transform={`translate(${radius}, ${radius})`}>{sectors}</g>
      </g>
    </svg>
  );
}

interface SectorProps {
  cornerRadius?: number;
  data: PieArcDatum<DataPoint>;
  fill: string;
  index: number;
  isHovered: boolean;
  onMouseEnter?: (index: number, event: MouseEvent<SVGPathElement>) => void;
  onMouseLeave?: (event: MouseEvent<SVGPathElement>) => void;
  radius: number;
  thickness: number;
}

function Sector(props: Readonly<SectorProps>) {
  const outerRadius = props.isHovered ? props.radius + HOVER_EXPANSION_PX : props.radius;
  const arc = d3Arc<unknown, PieArcDatum<DataPoint>>()
    .outerRadius(outerRadius)
    .innerRadius(props.radius - props.thickness);

  if (props.cornerRadius) {
    arc.cornerRadius(props.cornerRadius);
  }
  const d = arc(props.data) as string;
  return (
    <path
      d={d}
      onMouseEnter={
        props.onMouseEnter ? (event) => props.onMouseEnter?.(props.index, event) : undefined
      }
      onMouseLeave={props.onMouseLeave}
      style={{
        cursor: props.onMouseEnter ? 'pointer' : undefined,
        fill: props.fill,
        transition: props.onMouseEnter ? 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
      }}
    />
  );
}
