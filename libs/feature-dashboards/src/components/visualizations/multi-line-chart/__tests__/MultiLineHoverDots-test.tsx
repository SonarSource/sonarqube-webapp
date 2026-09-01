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

/* eslint-disable testing-library/no-container, testing-library/no-node-access -- svg circle has no role; assert presence/absence directly */

import { render } from '@testing-library/react';
import { scaleLinear, scaleTime } from 'd3-scale';
import type { LineChartSeries } from '../../../../types/visualization';
import { MultiLineHoverDots } from '../MultiLineHoverDots';

function buildSeries(overrides: Partial<LineChartSeries> = {}): LineChartSeries {
  return {
    color: '#0099ff',
    data: [
      { x: new Date('2026-03-01T00:00:00.000Z'), y: 2 },
      { x: new Date('2026-03-15T00:00:00.000Z'), y: 5 },
    ],
    id: 's',
    label: 'S',
    ...overrides,
  };
}

function renderInSvg(children: React.ReactNode) {
  return render(<svg>{children}</svg>);
}

const xScale = scaleTime()
  .domain([new Date('2026-03-01T00:00:00.000Z'), new Date('2026-03-15T00:00:00.000Z')])
  .range([0, 100]);
const yScale = scaleLinear().domain([0, 10]).range([100, 0]);

function nearestIndex(data: { x: number | Date }[], xValue: number): number {
  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < data.length; i++) {
    const distance = Math.abs(Number(data[i].x) - xValue);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = i;
    }
  }
  return nearest;
}

describe('MultiLineHoverDots', () => {
  it('renders nothing when hoveredSeriesIndex is undefined', () => {
    const { container } = renderInSvg(
      <MultiLineHoverDots
        getNearestIndex={nearestIndex}
        hoveredDateMs={new Date('2026-03-08T00:00:00.000Z').getTime()}
        series={[buildSeries()]}
        xScale={xScale}
        yScale={yScale}
      />,
    );

    expect(container.querySelector('circle')).toBeNull();
  });

  it('renders nothing when the series at the index is missing', () => {
    const { container } = renderInSvg(
      <MultiLineHoverDots
        getNearestIndex={nearestIndex}
        hoveredDateMs={new Date('2026-03-08T00:00:00.000Z').getTime()}
        hoveredSeriesIndex={3}
        series={[buildSeries()]}
        xScale={xScale}
        yScale={yScale}
      />,
    );

    expect(container.querySelector('circle')).toBeNull();
  });

  it('renders nothing when the nearest point has an undefined y', () => {
    const { container } = renderInSvg(
      <MultiLineHoverDots
        getNearestIndex={nearestIndex}
        hoveredDateMs={new Date('2026-03-08T00:00:00.000Z').getTime()}
        hoveredSeriesIndex={0}
        series={[
          buildSeries({
            data: [
              {
                x: new Date('2026-03-01T00:00:00.000Z'),
                y: undefined as unknown as number,
              },
            ],
          }),
        ]}
        xScale={xScale}
        yScale={yScale}
      />,
    );

    expect(container.querySelector('circle')).toBeNull();
  });

  it('does not cover an always-visible single-point marker when hidden', () => {
    const { container } = renderInSvg(
      <MultiLineHoverDots
        getNearestIndex={nearestIndex}
        hide
        hoveredDateMs={new Date('2026-03-01T00:00:00.000Z').getTime()}
        hoveredSeriesIndex={0}
        series={[buildSeries()]}
        xScale={xScale}
        yScale={yScale}
      />,
    );

    expect(container.querySelector('circle')).toBeNull();
  });

  it('renders a circle stroked with the focused series color', () => {
    const { container } = renderInSvg(
      <MultiLineHoverDots
        getNearestIndex={nearestIndex}
        hoveredDateMs={new Date('2026-03-15T00:00:00.000Z').getTime()}
        hoveredSeriesIndex={0}
        series={[buildSeries({ color: '#ff00aa' })]}
        xScale={xScale}
        yScale={yScale}
      />,
    );

    const circle = container.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(circle).toHaveAttribute('stroke', '#ff00aa');
    expect(circle).toHaveAttribute('r', '4');
  });
});
