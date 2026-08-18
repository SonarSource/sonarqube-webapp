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
import { PieArcDatum } from 'd3-shape';
import type { PieChartSegment } from '../../../types/visualization';

const MIN_VERTICAL_SPACING = 30;
const LABEL_OFFSET = 45;
const LEADER_ELBOW_OFFSET = 10;
const LABEL_Y_SCALE_FACTOR = 0.7;
const LABEL_LINE_OFFSET = 7;

const LABEL_FONT_SIZE = '12px';
const LABEL_FONT_SIZE_PX = 12;
const LABEL_FONT_WEIGHT_NORMAL = 400;
const LABEL_FONT_WEIGHT_HOVERED = 600;
const LEADER_LINE_OPACITY_NORMAL = 0.7;
const LEADER_LINE_OPACITY_HOVERED = 1;

const LABEL_MAX_WIDTH = 90;

interface LabelData {
  index: number;
  leaderPoints: Array<[number, number]>;
  segment: PieChartSegment;
  textAnchor: 'start' | 'end';
  x: number;
  y: number;
}

interface PieChartLabelsProps {
  arcs: Array<PieArcDatum<PieChartSegment>>;
  hoveredIndex: number | null;
  onLabelClick: (segment: PieChartSegment) => void;
  onLabelHover: (index: number | null) => void;
  radius: number;
  segments: PieChartSegment[];
}

function calculateLabelPositions(
  arcs: Array<PieArcDatum<PieChartSegment>>,
  segments: PieChartSegment[],
  radius: number,
): LabelData[] {
  const labels: LabelData[] = [];

  for (let i = 0; i < arcs.length; i++) {
    const arc = arcs[i];
    const segment = segments[i];
    const midAngle = (arc.startAngle + arc.endAngle) / 2;
    const cosAngle = Math.cos(midAngle - Math.PI / 2);
    const isRightSide = cosAngle >= 0;

    const arcEdgeX = Math.cos(midAngle - Math.PI / 2) * radius;
    const arcEdgeY = Math.sin(midAngle - Math.PI / 2) * radius;

    const labelRadius = radius + LABEL_OFFSET;
    const labelX = isRightSide ? labelRadius : -labelRadius;
    const labelY = Math.sin(midAngle - Math.PI / 2) * radius * LABEL_Y_SCALE_FACTOR;

    const elbowX = isRightSide ? labelX - LEADER_ELBOW_OFFSET : labelX + LEADER_ELBOW_OFFSET;

    labels.push({
      index: i,
      leaderPoints: [
        [arcEdgeX, arcEdgeY],
        [elbowX, labelY],
        [labelX, labelY],
      ],
      segment,
      textAnchor: isRightSide ? 'start' : 'end',
      x: labelX,
      y: labelY,
    });
  }

  return resolveOverlaps(labels);
}

function resolveOverlaps(labels: LabelData[]): LabelData[] {
  const rightLabels = labels.filter((label) => label.textAnchor === 'start');
  const leftLabels = labels.filter((label) => label.textAnchor === 'end');

  const adjustSide = (sideLabels: LabelData[]) => {
    if (sideLabels.length <= 1) {
      return;
    }

    sideLabels.sort((left, right) => left.y - right.y);

    for (let i = 1; i < sideLabels.length; i++) {
      const previous = sideLabels[i - 1];
      const current = sideLabels[i];

      if (current.y - previous.y < MIN_VERTICAL_SPACING) {
        current.y = previous.y + MIN_VERTICAL_SPACING;

        const isRight = current.textAnchor === 'start';
        const elbowX = isRight ? current.x - LEADER_ELBOW_OFFSET : current.x + LEADER_ELBOW_OFFSET;
        current.leaderPoints[1] = [elbowX, current.y];
        current.leaderPoints[2] = [current.x, current.y];
      }
    }
  };

  adjustSide(rightLabels);
  adjustSide(leftLabels);

  return [...rightLabels, ...leftLabels];
}

export function PieChartLabels(props: Readonly<PieChartLabelsProps>) {
  const { arcs, hoveredIndex, onLabelClick, onLabelHover, radius, segments } = props;

  const labels = calculateLabelPositions(arcs, segments, radius);

  return (
    <g className="pie-chart-labels">
      {labels.map((label) => {
        const isHovered = hoveredIndex === label.index;

        return (
          <g
            className="sw-cursor-pointer"
            data-testid={`pie-chart-label-${label.index}`}
            key={label.segment.value}
            onClick={() => {
              onLabelClick(label.segment);
            }}
            onMouseEnter={() => {
              onLabelHover(label.index);
            }}
            onMouseLeave={() => {
              onLabelHover(null);
            }}
          >
            <polyline
              data-testid={`pie-chart-label-line-${label.index}`}
              fill="none"
              points={label.leaderPoints.map((point) => point.join(',')).join(' ')}
              stroke={label.segment.color}
              strokeWidth={1}
              style={{
                opacity: isHovered ? LEADER_LINE_OPACITY_HOVERED : LEADER_LINE_OPACITY_NORMAL,
                transition: 'opacity 200ms',
              }}
            />

            <foreignObject
              data-testid={`pie-chart-label-container-${label.index}`}
              height={LABEL_FONT_SIZE_PX * 2 + LABEL_LINE_OFFSET * 2}
              width={LABEL_MAX_WIDTH}
              x={label.textAnchor === 'start' ? label.x : label.x - LABEL_MAX_WIDTH}
              y={label.y - LABEL_LINE_OFFSET - LABEL_FONT_SIZE_PX / 2}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: label.textAnchor === 'start' ? 'left' : 'right',
                }}
                title={label.segment.label}
              >
                <span
                  data-testid={`pie-chart-label-text-${label.index}`}
                  style={{
                    color: cssVar('color-text-default'),
                    fontSize: LABEL_FONT_SIZE,
                    fontWeight: isHovered ? LABEL_FONT_WEIGHT_HOVERED : LABEL_FONT_WEIGHT_NORMAL,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'font-weight 200ms',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label.segment.label}
                </span>
                <span
                  style={{
                    color: cssVar('color-text-subtle'),
                    fontSize: LABEL_FONT_SIZE,
                  }}
                >
                  {label.segment.percentage}%
                </span>
              </div>
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}
