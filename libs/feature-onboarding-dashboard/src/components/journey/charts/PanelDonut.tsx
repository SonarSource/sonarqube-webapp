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

import styled from '@emotion/styled';
import { cssVar, Text, TextSize } from '@sonarsource/echoes-react';
import { FocusEvent, MouseEvent, ReactNode, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { DonutChart } from '~shared/components/charts/DonutChart';

const DONUT_SIZE = 150;
const DONUT_THICKNESS = 22;

export interface PanelDonutSegment {
  /** Ring/legend swatch color (an Echoes `cssVar` token or severity color). */
  color: string;
  /** Already-translated legend label. */
  label: string;
  value: number;
}

interface TooltipPos {
  x: number;
  y: number;
}

interface Props {
  /** Large value shown at the center of the ring, e.g. "64%" or a configuration count. */
  centerLabel: ReactNode;
  /** Already-translated line under the center label naming what it measures, e.g. "Imported". */
  centerSubLabel: string;
  /** Segments driving both the ring and the legend. */
  segments: PanelDonutSegment[];
  /** When set, renders below the legend — typically a modal with its own trigger. */
  viewAll?: ReactNode;
}

export function PanelDonut({ centerLabel, centerSubLabel, segments, viewAll }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);

  const total = segments.reduce((acc, s) => acc + s.value, 0);

  const chartData = useMemo(
    () => segments.map((segment) => ({ fill: segment.color, value: segment.value })),
    [segments],
  );

  function handleArcMouseEnter(index: number, event: MouseEvent<SVGPathElement>) {
    setHoveredIndex(index);
    setTooltipPos({ x: event.clientX, y: event.clientY });
  }

  function handleMouseLeave() {
    setHoveredIndex(null);
    setTooltipPos(null);
  }

  function handleSvgMouseMove(event: MouseEvent<SVGSVGElement>) {
    if (hoveredIndex !== null) {
      setTooltipPos({ x: event.clientX, y: event.clientY });
    }
  }

  function handleLegendMouseEnter(index: number, event: MouseEvent<HTMLSpanElement>) {
    setHoveredIndex(index);
    setTooltipPos({ x: event.clientX, y: event.clientY });
  }

  function handleLegendMouseMove(event: MouseEvent<HTMLSpanElement>) {
    setTooltipPos({ x: event.clientX, y: event.clientY });
  }

  function handleLegendFocus(index: number, event: FocusEvent<HTMLSpanElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredIndex(index);
    setTooltipPos({ x: rect.right, y: rect.top + rect.height / 2 });
  }

  function handleLegendBlur() {
    setHoveredIndex(null);
    setTooltipPos(null);
  }

  const hoveredSegment = hoveredIndex !== null ? (segments[hoveredIndex] ?? null) : null;
  const hoveredPct =
    hoveredSegment && total > 0 ? Math.round((hoveredSegment.value / total) * 100) : null;

  return (
    <StyledCard>
      <StyledCardBody className="sw-flex sw-items-center sw-justify-center sw-gap-8">
        <div className="sw-flex sw-flex-col sw-items-center sw-gap-4">
          <div
            aria-hidden
            className="sw-relative sw-shrink-0"
            style={{ height: DONUT_SIZE, width: DONUT_SIZE }}
          >
            <DonutChart
              data={chartData}
              height={DONUT_SIZE}
              hoveredIndex={hoveredIndex}
              onArcMouseEnter={handleArcMouseEnter}
              onArcMouseLeave={handleMouseLeave}
              onSvgMouseMove={handleSvgMouseMove}
              padAngle={0.05}
              thickness={DONUT_THICKNESS}
              width={DONUT_SIZE}
            />
            <div className="sw-pointer-events-none sw-absolute sw-inset-0 sw-flex sw-flex-col sw-items-center sw-justify-center">
              <Text isHighlighted size={TextSize.Large}>
                {centerLabel}
              </Text>
              <Text isSubtle size={TextSize.Small}>
                {centerSubLabel}
              </Text>
            </div>
          </div>

          <div className="sw-flex sw-flex-wrap sw-justify-center sw-gap-4 sw-mt-2">
            {segments.map((segment, index) => (
              <LegendItem
                key={segment.label}
                onBlur={handleLegendBlur}
                onFocus={(event) => handleLegendFocus(index, event)}
                onMouseEnter={(event) => handleLegendMouseEnter(index, event)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleLegendMouseMove}
                tabIndex={0}
              >
                <span
                  aria-hidden
                  className="sw-inline-block sw-shrink-0 sw-rounded-pill"
                  style={{
                    backgroundColor: segment.color,
                    height: '0.625rem',
                    width: '0.625rem',
                  }}
                />
                <LegendLabel
                  data-label={segment.label}
                  isHovered={hoveredIndex === index}
                  isSubtle
                  size={TextSize.Small}
                >
                  {segment.label}
                </LegendLabel>
              </LegendItem>
            ))}
          </div>
          {viewAll}
        </div>
      </StyledCardBody>

      {hoveredSegment !== null && tooltipPos !== null && (
        <div
          className="sw-fixed sw-z-popup sw-rounded-1 sw-whitespace-nowrap sw-flex sw-flex-col sw-p-3"
          style={{
            background: cssVar('color-surface-canvas-default'),
            border: `1px solid ${cssVar('color-border-weak')}`,
            boxShadow: cssVar('box-shadow-large'),
            left: Math.min(tooltipPos.x + 12, window.innerWidth - 200),
            pointerEvents: 'none',
            top: tooltipPos.y - 8,
          }}
        >
          <TooltipSegmentLabel>{hoveredSegment.label}</TooltipSegmentLabel>
          <TooltipRow>
            <TooltipRowLabel>
              {formatMessage({ id: 'onboarding_dashboard.donut.tooltip.count' })}
            </TooltipRowLabel>
            <TooltipRowValue>{hoveredSegment.value}</TooltipRowValue>
          </TooltipRow>
          {hoveredPct !== null && (
            <TooltipRow>
              <TooltipRowLabel>
                {formatMessage({ id: 'onboarding_dashboard.donut.tooltip.percentage' })}
              </TooltipRowLabel>
              <TooltipRowValue>{hoveredPct}%</TooltipRowValue>
            </TooltipRow>
          )}
        </div>
      )}
    </StyledCard>
  );
}

const StyledCard = styled.div`
  align-self: stretch;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 270px;
`;

const StyledCardBody = styled.div`
  flex: 1;
  padding: var(--echoes-dimension-space-200, 1rem);
`;

const LegendItem = styled.span`
  align-items: center;
  cursor: default;
  display: flex;
  gap: 0.5rem;
`;

const LegendLabel = styled(Text, {
  shouldForwardProp: (prop) => prop !== 'isHovered',
})<{ isHovered: boolean; 'data-label'?: string }>`
  font-weight: ${({ isHovered }) => (isHovered ? 600 : 400)};
  line-height: 1.4;

  /* Reserve bold width to prevent layout shift on hover */
  &::after {
    content: attr(data-label);
    display: block;
    font-weight: 600;
    height: 0;
    overflow: hidden;
    visibility: hidden;
  }
`;

const TooltipSegmentLabel = styled.span`
  color: ${cssVar('color-text-default')};
  font-size: ${cssVar('font-size-20')};
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const TooltipRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: 0.25rem;
`;

const TooltipRowLabel = styled.span`
  color: ${cssVar('color-text-subtle')};
  font-size: ${cssVar('font-size-10')};
`;

const TooltipRowValue = styled.span`
  color: ${cssVar('color-text-subtle')};
  font-size: ${cssVar('font-size-10')};
  font-weight: 700;
`;
