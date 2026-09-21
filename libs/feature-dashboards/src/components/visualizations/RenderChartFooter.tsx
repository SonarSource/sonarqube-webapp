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

import { useMemo, type RefObject } from 'react';
import { ChartHorizontalLegend, type LegendItem } from './ChartHorizontalLegend';

interface RenderChartFooterProps {
  availableWidth: number;
  focusedSeriesIndex?: number;
  legendContainerRef?: RefObject<HTMLDivElement | null>;
  legendItems: LegendItem[];
  onLegendMouseEnter?: () => void;
  onLegendMouseLeave: (event: React.MouseEvent<HTMLDivElement>) => void;
  onSeriesHover?: (seriesIndex: number | undefined) => void;
  onSeriesSelect?: (seriesIndex: number) => void;
  selectedSeriesIndex?: number;
  showLegend: boolean;
  x: number;
  y: number;
}

export const LEGEND_ROW_HEIGHT_PX = 32;

export function RenderChartFooter({
  availableWidth,
  focusedSeriesIndex,
  selectedSeriesIndex,
  legendContainerRef,
  legendItems,
  onLegendMouseEnter,
  onLegendMouseLeave,
  onSeriesHover,
  onSeriesSelect,
  showLegend,
  x,
  y,
}: Readonly<RenderChartFooterProps>) {
  const visibleItems = useMemo(
    () => legendItems.filter((item) => item.visible !== false),
    [legendItems],
  );

  if (!showLegend || visibleItems.length === 0) {
    return null;
  }

  const footerHeight = LEGEND_ROW_HEIGHT_PX;
  const footerWidth = availableWidth - x;

  return (
    <g className="chart-footer" transform={`translate(${x}, ${y})`}>
      <foreignObject height={footerHeight} width={footerWidth} x="0" y="0">
        <ChartHorizontalLegend
          containerWidth={footerWidth}
          focusedSeriesIndex={focusedSeriesIndex}
          items={visibleItems}
          legendContainerRef={legendContainerRef}
          onLegendMouseEnter={onLegendMouseEnter}
          onLegendMouseLeave={onLegendMouseLeave}
          onSeriesHover={onSeriesHover}
          onSeriesSelect={onSeriesSelect}
          selectedSeriesIndex={selectedSeriesIndex}
        />
      </foreignObject>
    </g>
  );
}
