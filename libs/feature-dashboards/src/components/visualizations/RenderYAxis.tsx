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
import { ScaleLinear } from 'd3-scale';

interface RenderYAxisProps {
  availableHeight: number;
  formatTick: (value: number) => string | React.ReactNode;
  ticks: number[];
  yScale: ScaleLinear<number, number>;
}

export function RenderYAxis({
  yScale,
  availableHeight,
  ticks,
  formatTick,
}: Readonly<RenderYAxisProps>) {
  return (
    <g className="line-chart-y-axis" pointerEvents="none">
      <line
        stroke={cssVar('color-border-weak')}
        strokeWidth="1"
        x1={0}
        x2={0}
        y1={0}
        y2={availableHeight}
      />
      {ticks.map((tick) => {
        const y = yScale(tick);
        return (
          <g key={tick.toString()}>
            <line
              stroke={cssVar('color-border-weak')}
              strokeWidth="1"
              x1={-5}
              x2={0}
              y1={y}
              y2={y}
            />
            <foreignObject height="24" pointerEvents="none" width="90" x={-95} y={y - 12}>
              <div
                className="sw-flex sw-items-center sw-justify-end sw-text-xs"
                style={{ color: cssVar('color-text-subtle') }}
              >
                {formatTick(tick)}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}
