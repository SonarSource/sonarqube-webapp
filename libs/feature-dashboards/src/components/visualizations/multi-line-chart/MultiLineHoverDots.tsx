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
import { ScaleLinear, ScaleTime } from 'd3-scale';
import { isUndefined } from 'lodash';
import type { LineChartDataPoint, LineChartSeries } from '../../../types/visualization';

const HOVER_DOT_RADIUS_PX = 4;

interface MultiLineHoverDotsProps {
  getNearestIndex: (data: LineChartDataPoint[], xScaleValue: number) => number;
  hoveredDateMs: number;
  hoveredSeriesIndex?: number;
  series: LineChartSeries[];
  xScale: ScaleLinear<number, number> | ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
}

export function MultiLineHoverDots({
  getNearestIndex,
  hoveredDateMs,
  hoveredSeriesIndex,
  series,
  xScale,
  yScale,
}: Readonly<MultiLineHoverDotsProps>) {
  if (hoveredSeriesIndex === undefined) {
    return null;
  }

  const entry = series[hoveredSeriesIndex];
  if (!entry) {
    return null;
  }

  const point = entry.data[getNearestIndex(entry.data, hoveredDateMs)];
  if (!point || isUndefined(point.y)) {
    return null;
  }

  return (
    <circle
      cx={xScale(new Date(point.x))}
      cy={yScale(point.y)}
      fill={cssVar('color-surface-default')}
      pointerEvents="none"
      r={HOVER_DOT_RADIUS_PX}
      stroke={entry.color}
      strokeWidth={1}
    />
  );
}
