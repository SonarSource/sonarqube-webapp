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
import { useMemo } from 'react';

import { getDateFormatOptions } from '../../utils/datetime';

// Estimated character width in pixels at font-size 12
const CHAR_WIDTH_PX = 7;
// Minimum padding between labels to prevent overlap
const LABEL_PADDING_PX = 16;

interface RenderXAxisProps {
  availableHeight: number;
  availableWidth: number;
  xScale: ScaleLinear<number, number> | ScaleTime<number, number>;
}

/**
 * Estimates the width of a label in pixels based on character count.
 */
function estimateLabelWidth(label: string): number {
  return label.length * CHAR_WIDTH_PX;
}

/**
 * Calculates the optimal number of ticks based on available width and typical label width.
 */
function calculateOptimalTickCount(availableWidth: number): number {
  // Estimate typical label width (e.g., "Jan 2024" = 8 chars)
  const typicalLabelWidth = 8 * CHAR_WIDTH_PX;
  const minSpacePerLabel = typicalLabelWidth + LABEL_PADDING_PX;

  // Calculate how many labels can fit, with a minimum of 2 and max of 6
  const maxLabels = Math.floor(availableWidth / minSpacePerLabel);
  return Math.max(2, Math.min(6, maxLabels));
}

export function RenderXAxis({
  xScale,
  availableWidth,
  availableHeight,
}: Readonly<RenderXAxisProps>) {
  // Dynamically calculate tick count based on available width
  const tickCount = useMemo(() => calculateOptimalTickCount(availableWidth), [availableWidth]);
  const ticks = xScale.ticks(tickCount);

  const formatOptions = useMemo(() => getDateFormatOptions(ticks as Date[]), [ticks]);

  // Filter out labels that would overlap or duplicate the previous visible label
  const ticksWithLabels = useMemo(() => {
    let lastLabelEndX = -Infinity;
    let lastVisibleLabel = '';

    return (ticks as Date[]).map((tick) => {
      const label = tick.toLocaleString(undefined, formatOptions);
      const x = xScale(tick);
      const labelWidth = estimateLabelWidth(label);
      const labelStartX = x - labelWidth / 2;
      const labelEndX = x + labelWidth / 2;

      // Check if this label would overlap with the previous one
      const wouldOverlap = labelStartX < lastLabelEndX + LABEL_PADDING_PX;

      // Check if this label is a duplicate of the last visible label.
      // This happens when d3 generates sub-minute ticks that format identically
      // (e.g. 12:50:00 and 12:50:30 both become "Sep 26, 12:50 PM").
      const isDuplicateLabel = label === lastVisibleLabel;

      const shouldHide = wouldOverlap || isDuplicateLabel;

      if (!shouldHide) {
        lastLabelEndX = labelEndX;
        lastVisibleLabel = label;
      }

      return { tick, label, x, shouldHide };
    });
  }, [ticks, formatOptions, xScale]);

  return (
    <g className="line-chart-x-axis" pointerEvents="none">
      <line
        stroke={cssVar('color-border-weak')}
        strokeWidth="1"
        x1={0}
        x2={availableWidth}
        y1={availableHeight}
        y2={availableHeight}
      />
      {ticksWithLabels.map(({ tick, label, x, shouldHide }) => {
        return (
          <g key={tick.toString()}>
            <line
              stroke={cssVar('color-border-weak')}
              strokeWidth="1"
              x1={x}
              x2={x}
              y1={availableHeight}
              y2={availableHeight + 5}
            />
            {/* Only render label if it won't overlap with previous label */}
            {!shouldHide && (
              <text
                fill={cssVar('color-text-subtle')}
                fontSize="12"
                textAnchor="middle"
                x={x}
                y={availableHeight + 18}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
