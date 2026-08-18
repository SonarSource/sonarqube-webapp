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

import { fireEvent, screen } from '@testing-library/react';
import { pie as d3Pie, type PieArcDatum } from 'd3-shape';
import { renderWithContext } from '~shared/helpers/test-utils';
import type { PieChartSegment } from '../../../../types/visualization';
import { PieChartLabels } from '../PieChartLabels';

const segments: PieChartSegment[] = [
  {
    color: '#BE342A',
    count: 25,
    label: 'High',
    percentage: '50',
    value: 'HIGH',
  },
  {
    color: '#CE7536',
    count: 15,
    label: 'Medium',
    percentage: '30',
    value: 'MEDIUM',
  },
];

function renderLabels(args?: {
  arcs?: Array<PieArcDatum<PieChartSegment>>;
  hoveredIndex?: number | null;
  onLabelClick?: (segment: PieChartSegment) => void;
  onLabelHover?: (index: number | null) => void;
}) {
  const pie = d3Pie<PieChartSegment>()
    .sort(null)
    .value((segment) => segment.count);

  const arcs = args?.arcs ?? pie(segments);

  return renderWithContext(
    <svg>
      <g>
        <PieChartLabels
          arcs={arcs}
          hoveredIndex={args?.hoveredIndex ?? null}
          onLabelClick={args?.onLabelClick ?? jest.fn()}
          onLabelHover={args?.onLabelHover ?? jest.fn()}
          radius={80}
          segments={segments}
        />
      </g>
    </svg>,
  );
}

describe('PieChartLabels', () => {
  it('renders labels and percentages for each segment', () => {
    renderLabels();

    expect(screen.getByTitle('High')).toHaveTextContent('High');
    expect(screen.getByTitle('High')).toHaveTextContent('50%');
    expect(screen.getByTitle('Medium')).toHaveTextContent('Medium');
    expect(screen.getByTitle('Medium')).toHaveTextContent('30%');
  });

  it('forwards click and hover interactions', () => {
    const onLabelClick = jest.fn();
    const onLabelHover = jest.fn();

    renderLabels({ onLabelClick, onLabelHover });

    const highLabel = screen.getByTitle('High');
    fireEvent.mouseEnter(highLabel);
    fireEvent.click(highLabel);
    fireEvent.mouseLeave(highLabel);

    expect(onLabelHover).toHaveBeenNthCalledWith(1, 0);
    expect(onLabelHover).toHaveBeenNthCalledWith(2, null);
    expect(onLabelClick).toHaveBeenCalledWith(segments[0]);
  });

  it('applies hovered styling to the matching label', () => {
    renderLabels({ hoveredIndex: 0 });

    expect(screen.getByTestId('pie-chart-label-line-0')).toHaveStyle({ opacity: '1' });
    expect(screen.getByTestId('pie-chart-label-line-1')).toHaveStyle({ opacity: '0.7' });
    expect(screen.getByTestId('pie-chart-label-text-0')).toHaveStyle({ fontWeight: '600' });
    expect(screen.getByTestId('pie-chart-label-text-1')).toHaveStyle({ fontWeight: '400' });
  });

  it('resolves overlapping labels on the same side by spacing them apart', () => {
    const overlapSegments: PieChartSegment[] = [
      { color: '#111', count: 10, label: 'First', percentage: '50', value: 'FIRST' },
      { color: '#222', count: 10, label: 'Second', percentage: '50', value: 'SECOND' },
    ];
    const overlapArcs = [
      {
        data: overlapSegments[0],
        endAngle: 1.55,
        index: 0,
        padAngle: 0,
        startAngle: 1.45,
        value: 10,
      },
      {
        data: overlapSegments[1],
        endAngle: 1.6,
        index: 1,
        padAngle: 0,
        startAngle: 1.5,
        value: 10,
      },
    ] as Array<PieArcDatum<PieChartSegment>>;

    renderWithContext(
      <svg>
        <g>
          <PieChartLabels
            arcs={overlapArcs}
            hoveredIndex={null}
            onLabelClick={jest.fn()}
            onLabelHover={jest.fn()}
            radius={80}
            segments={overlapSegments}
          />
        </g>
      </svg>,
    );

    const firstY = Number(screen.getByTestId('pie-chart-label-container-0').getAttribute('y'));
    const secondY = Number(screen.getByTestId('pie-chart-label-container-1').getAttribute('y'));

    expect(secondY - firstY).toBeGreaterThanOrEqual(30);
  });
});
