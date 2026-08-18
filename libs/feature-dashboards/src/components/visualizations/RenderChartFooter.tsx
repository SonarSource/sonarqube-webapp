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

import { MessageInline, MessageInlineSize, MessageVariety } from '@sonarsource/echoes-react';
import { useMemo, type RefObject } from 'react';
import { useIntl } from 'react-intl';
import { ChartHorizontalLegend, type LegendItem } from './ChartHorizontalLegend';

interface RenderChartFooterProps {
  availableWidth: number;
  focusedSeriesIndex?: number;
  isSingleDatapoint: boolean;
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

export const SINGLE_DATAPOINT_MESSAGE_HEIGHT_PX = 24;
export const LEGEND_ROW_HEIGHT_PX = 32;
export const FOOTER_GAP_PX = 8;

export function RenderChartFooter({
  availableWidth,
  focusedSeriesIndex,
  isSingleDatapoint,
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
  const intl = useIntl();
  const visibleItems = useMemo(
    () => legendItems.filter((item) => item.visible !== false),
    [legendItems],
  );

  if (!isSingleDatapoint && !showLegend) {
    return null;
  }

  const footerHeight =
    (isSingleDatapoint ? SINGLE_DATAPOINT_MESSAGE_HEIGHT_PX : 0) +
    (isSingleDatapoint && showLegend && visibleItems.length > 0 ? FOOTER_GAP_PX : 0) +
    (showLegend && visibleItems.length > 0 ? LEGEND_ROW_HEIGHT_PX : 0);
  const footerWidth = availableWidth - x;

  return (
    <g className="chart-footer" transform={`translate(${x}, ${y})`}>
      <foreignObject height={footerHeight} width={footerWidth} x="0" y="0">
        <div className="sw-flex sw-w-full sw-min-w-0 sw-flex-col" style={{ gap: FOOTER_GAP_PX }}>
          {isSingleDatapoint && (
            <MessageInline
              className="sw-flex-shrink-0 sw-whitespace-nowrap"
              size={MessageInlineSize.Small}
              variety={MessageVariety.Info}
            >
              {intl.formatMessage({ id: 'dashboard.line_chart.single_data' })}
            </MessageInline>
          )}
          {showLegend && visibleItems.length > 0 && (
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
          )}
        </div>
      </foreignObject>
    </g>
  );
}
