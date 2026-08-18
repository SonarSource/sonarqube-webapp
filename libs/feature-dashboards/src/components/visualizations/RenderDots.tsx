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
import { cssVar, Popover, Text } from '@sonarsource/echoes-react';
import { ScaleLinear, ScaleTime } from 'd3-scale';
import { LineChartDataPoint } from '../../types/visualization';

import { formatDateDayTime } from '../../utils/datetime';

interface RenderDotsProps {
  color: string;
  data: LineChartDataPoint[];
  formatValue: (value: number) => string | React.ReactNode;
  hoveredDotIndex?: number;
  metricName?: string;
  showDot: boolean;
  xScale: ScaleLinear<number, number> | ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
}

export function RenderDots({
  showDot,
  data,
  xScale,
  yScale,
  color,
  hoveredDotIndex,
  metricName = '',
  formatValue,
}: Readonly<RenderDotsProps>) {
  if (!showDot || hoveredDotIndex === undefined || hoveredDotIndex < 0) {
    return null;
  }
  const hoveredDot = data[hoveredDotIndex];
  if (!hoveredDot) {
    return null;
  }

  const cx = xScale(hoveredDot.x);
  const cy = yScale(hoveredDot.y);

  return (
    <Popover
      description={
        <div className="sw-flex sw-items-center sw-gap-1">
          <SquareFillIcon fill={color} size={16} />
          <div className="sw-flex sw-justify-between sw-w-full sw-gap-2">
            <div>
              <Text isSubtle>{metricName}</Text>
            </div>
            <div>{formatValue(hoveredDot.y)}</div>
          </div>
        </div>
      }
      isOpen
      title={<Text isHighlighted>{formatDateDayTime(hoveredDot.x as Date)}</Text>}
    >
      <g>
        <circle
          cx={cx}
          cy={cy}
          fill={cssVar('color-surface-default')}
          r={4}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    </Popover>
  );
}
