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

import { cssVar, Text } from '@sonarsource/echoes-react';
import { arc as d3Arc, pie as d3Pie, PieArcDatum } from 'd3-shape';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { numberFormatter } from '~shared/helpers/measures';
import {
  PieChartPastry,
  type PieChartProps,
  type PieChartSegment,
} from '../../../types/visualization';
import { PieChartLabels } from './PieChartLabels';

const LABEL_PADDING = 100;
const DONUT_INNER_RADIUS_RATIO = 0.5;
const MIN_DONUT_RING_THICKNESS_PX = 2;
const HOVER_EXPANSION_PX = 5;
const HOVER_DELAY_MS = 100;
const TOOLTIP_OFFSET_PX = 10;
const HOVER_DROP_SHADOW = 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))';

interface TooltipState {
  segment: PieChartSegment | null;
  x: number;
  y: number;
}

export function PieChart(props: Readonly<PieChartProps>) {
  const {
    ariaLabel,
    donutInnerRadiusExtraPx = 0,
    height,
    hoveredIndex: controlledHoveredIndex,
    onHoverChange,
    onSegmentClick,
    pastry = PieChartPastry.Pie,
    segments,
    showLabels = false,
    tooltipCountMessageKey = 'project_dashboard.widget.tooltip.count',
    tooltipPercentageMessageKey = 'project_dashboard.widget.tooltip.percentage',
    width,
  } = props;
  const { formatMessage } = useIntl();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<number | null>(null);

  const isControlled = controlledHoveredIndex !== undefined;
  const hoveredIndex = isControlled ? controlledHoveredIndex : internalHoveredIndex;

  const setHoveredIndexRef = useRef<(index: number | null) => void>(setInternalHoveredIndex);
  setHoveredIndexRef.current = isControlled
    ? (index: number | null) => onHoverChange?.(index)
    : setInternalHoveredIndex;

  const setHoveredIndex = useCallback((index: number | null) => {
    setHoveredIndexRef.current(index);
  }, []);

  const svgRef = useRef<SVGSVGElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);

  const size = Math.min(width, height);
  const radius = Math.floor(size / 2);
  const baseDonutInnerRadius = Math.floor(radius * DONUT_INNER_RADIUS_RATIO);
  const innerRadius =
    pastry === PieChartPastry.Donut
      ? Math.min(
          baseDonutInnerRadius + donutInnerRadiusExtraPx,
          radius - MIN_DONUT_RING_THICKNESS_PX,
        )
      : 0;

  const labelPadding = showLabels ? LABEL_PADDING : 0;
  const svgWidth = width + labelPadding * 2;
  const svgHeight = height;

  const pie = d3Pie<PieChartSegment>()
    .sort(null)
    .startAngle(-Math.PI / 2)
    .endAngle((3 * Math.PI) / 2)
    .value((segment) => segment.visualCount ?? segment.count);

  const arcs = pie(segments);

  useEffect(() => {
    const handleScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setHoveredIndex(null);
      setTooltip(null);
    };

    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [setHoveredIndex]);

  const handleMouseEnter = useCallback(
    (segment: PieChartSegment, index: number, event: React.MouseEvent) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      setHoveredIndex(index);
      setTooltip({
        segment,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [setHoveredIndex],
  );

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    lastMousePositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setTooltip((previous) =>
        previous
          ? {
              ...previous,
              x: event.clientX,
              y: event.clientY,
            }
          : null,
      );
    });
  }, []);

  const handleMouseLeave = useCallback(
    (event: React.MouseEvent) => {
      const currentPosition = { x: event.clientX, y: event.clientY };
      const lastPosition = lastMousePositionRef.current;

      if (lastPosition?.x === currentPosition.x && lastPosition?.y === currentPosition.y) {
        return;
      }

      hoverTimeoutRef.current = setTimeout(() => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setHoveredIndex(null);
        setTooltip(null);
      }, HOVER_DELAY_MS);
    },
    [setHoveredIndex],
  );

  const handleClick = useCallback(
    (segment: PieChartSegment) => {
      onSegmentClick?.(segment);
    },
    [onSegmentClick],
  );

  const handleLabelHover = useCallback(
    (index: number | null) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      if (index === null) {
        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredIndex(null);
          setTooltip(null);
        }, HOVER_DELAY_MS);
      } else {
        setHoveredIndex(index);
      }
    },
    [setHoveredIndex],
  );

  const defaultAriaLabel = ariaLabel ?? formatMessage({ id: 'project_dashboard.widget.pie_chart' });

  return (
    <div
      className="sw-relative sw-flex sw-items-center sw-justify-center"
      style={{ height: svgHeight, width: showLabels ? svgWidth : width }}
    >
      <svg
        aria-label={defaultAriaLabel}
        className="pie-chart"
        height={svgHeight}
        onMouseMove={handleMouseMove}
        ref={svgRef}
        role="img"
        style={{ display: 'block', margin: 'auto', overflow: 'visible' }}
        width={showLabels ? svgWidth : width}
      >
        <g transform={`translate(${showLabels ? svgWidth / 2 : radius}, ${radius})`}>
          {showLabels && (
            <PieChartLabels
              arcs={arcs}
              hoveredIndex={hoveredIndex}
              onLabelClick={handleClick}
              onLabelHover={handleLabelHover}
              radius={radius}
              segments={segments}
            />
          )}

          {arcs.map((arc, index) => (
            <Sector
              arc={arc}
              color={segments[index].color}
              index={index}
              innerRadius={innerRadius}
              isHovered={hoveredIndex === index}
              key={segments[index].value}
              onClick={() => {
                handleClick(segments[index]);
              }}
              onMouseEnter={(event) => {
                handleMouseEnter(segments[index], index, event);
              }}
              onMouseLeave={handleMouseLeave}
              radius={radius}
              segment={segments[index]}
            />
          ))}
        </g>
      </svg>

      {tooltip?.segment &&
        createPortal(
          <div
            className="sw-fixed sw-z-popup sw-rounded-1 sw-p-3 sw-whitespace-nowrap"
            data-testid="pie-chart-tooltip"
            style={{
              backgroundColor: cssVar('color-surface-default'),
              border: `1px solid ${cssVar('color-border-weak')}`,
              boxShadow: cssVar('box-shadow-large'),
              left: `${tooltip.x + TOOLTIP_OFFSET_PX}px`,
              pointerEvents: 'none',
              top: `${tooltip.y + TOOLTIP_OFFSET_PX}px`,
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform',
            }}
          >
            <div className="sw-flex sw-flex-col sw-gap-1">
              <Text>
                <strong>{tooltip.segment.label}</strong>
              </Text>
              <Text isSubtle size="small">
                <FormattedMessage
                  id={tooltipCountMessageKey}
                  values={{
                    count: <strong>{numberFormatter(tooltip.segment.count)}</strong>,
                  }}
                />
              </Text>
              <Text isSubtle size="small">
                <FormattedMessage
                  id={tooltipPercentageMessageKey}
                  values={{ percentage: <strong>{tooltip.segment.percentage}%</strong> }}
                />
              </Text>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

interface SectorProps {
  arc: PieArcDatum<PieChartSegment>;
  color: string;
  index: number;
  innerRadius: number;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: (event: React.MouseEvent<SVGPathElement>) => void;
  onMouseLeave: (event: React.MouseEvent<SVGPathElement>) => void;
  radius: number;
  segment: PieChartSegment;
}

function Sector(props: Readonly<SectorProps>) {
  const {
    arc: arcData,
    color,
    index,
    innerRadius,
    isHovered,
    onClick,
    onMouseEnter,
    onMouseLeave,
    radius,
    segment,
  } = props;

  const outerRadius = isHovered ? radius + HOVER_EXPANSION_PX : radius;
  const path =
    d3Arc<PieArcDatum<PieChartSegment>>().outerRadius(outerRadius).innerRadius(innerRadius)(
      arcData,
    ) ?? '';

  return (
    <path
      aria-label={segment.label}
      className="sw-cursor-pointer"
      d={path}
      data-testid={`pie-chart-segment-${index}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      style={{
        fill: color,
        filter: isHovered ? HOVER_DROP_SHADOW : undefined,
        stroke: cssVar('color-surface-default'),
        strokeWidth: 2,
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    />
  );
}
