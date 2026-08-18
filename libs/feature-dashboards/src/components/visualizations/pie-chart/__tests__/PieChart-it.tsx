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

import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { numberFormatter } from '~shared/helpers/measures';
import { renderWithContext } from '~shared/helpers/test-utils';
import type { PieChartSegment } from '../../../../types/visualization';
import { PieChart } from '../PieChart';

const mockSegments: PieChartSegment[] = [
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
  {
    color: '#BA8927',
    count: 10,
    label: 'Low',
    percentage: '20',
    value: 'LOW',
  },
];

beforeEach(() => {
  jest.useFakeTimers();
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    bottom: 300,
    height: 200,
    left: 100,
    right: 300,
    toJSON: () => ({}),
    top: 100,
    width: 200,
    x: 100,
    y: 100,
  }));
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('PieChart', () => {
  it('renders pie chart with segments', () => {
    renderWithContext(<PieChart height={200} segments={mockSegments} width={200} />);

    expect(screen.getByLabelText('project_dashboard.widget.pie_chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-segment-0')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-segment-1')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-segment-2')).toBeInTheDocument();
  });

  it('handles mouse enter and shows tooltip', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithContext(<PieChart height={200} segments={mockSegments} width={200} />);

    await user.hover(screen.getByTestId('pie-chart-segment-0'));

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText(numberFormatter(25))).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('formats tooltip count with locale-aware grouping', async () => {
    const user = userEvent.setup({ delay: null });
    const segments: PieChartSegment[] = [
      { ...mockSegments[0], count: 12_345 },
      mockSegments[1],
      mockSegments[2],
    ];
    renderWithContext(<PieChart height={200} segments={segments} width={200} />);

    await user.hover(screen.getByTestId('pie-chart-segment-0'));

    expect(screen.getByText(numberFormatter(12_345))).toBeInTheDocument();
  });

  it('keeps tooltip visible on mouse move', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithContext(<PieChart height={200} segments={mockSegments} width={200} />);

    const svg = screen.getByLabelText('project_dashboard.widget.pie_chart');
    await user.hover(screen.getByTestId('pie-chart-segment-0'));

    expect(screen.getByText('High')).toBeInTheDocument();

    act(() => {
      svg.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 200,
          clientY: 200,
        }),
      );
    });

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-tooltip')).toBeInTheDocument();
  });

  it('handles mouse leave events', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithContext(<PieChart height={200} segments={mockSegments} width={200} />);

    const firstSegment = screen.getByTestId('pie-chart-segment-0');
    await user.hover(firstSegment);
    expect(screen.getByText('High')).toBeInTheDocument();

    await user.unhover(firstSegment);

    expect(screen.getByLabelText('project_dashboard.widget.pie_chart')).toBeInTheDocument();
  });

  it('does not hide tooltip if mouse stays in same position on leave', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithContext(<PieChart height={200} segments={mockSegments} width={200} />);

    const svg = screen.getByLabelText('project_dashboard.widget.pie_chart');
    const firstSegment = screen.getByTestId('pie-chart-segment-0');

    await user.hover(firstSegment);
    expect(screen.getByText('High')).toBeInTheDocument();

    const clientX = 150;
    const clientY = 150;
    svg.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX,
        clientY,
      }),
    );

    act(() => {
      firstSegment.dispatchEvent(
        new MouseEvent('mouseleave', {
          bubbles: true,
          clientX,
          clientY,
        }),
      );
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('calls onSegmentClick when segment is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onSegmentClick = jest.fn();

    renderWithContext(
      <PieChart height={200} onSegmentClick={onSegmentClick} segments={mockSegments} width={200} />,
    );

    await user.click(screen.getByTestId('pie-chart-segment-0'));

    expect(onSegmentClick).toHaveBeenCalledWith(mockSegments[0]);
  });

  it('clears hover timeout when re-entering segment', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithContext(<PieChart height={200} segments={mockSegments} width={200} />);

    const firstSegment = screen.getByTestId('pie-chart-segment-0');
    const secondSegment = screen.getByTestId('pie-chart-segment-1');

    await user.hover(firstSegment);
    expect(screen.getByText('High')).toBeInTheDocument();

    await user.pointer({ coords: { clientX: 150, clientY: 150 }, target: firstSegment });
    await user.unhover(firstSegment);
    await user.pointer({ coords: { clientX: 160, clientY: 160 } });
    await user.hover(secondSegment);

    expect(screen.getByText('Medium')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('applies hover styles to segments', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithContext(<PieChart height={200} segments={mockSegments} width={200} />);

    const firstSegment = screen.getByTestId('pie-chart-segment-0') as unknown as SVGPathElement;
    const initialPath = firstSegment.getAttribute('d');

    await user.hover(firstSegment);

    expect(firstSegment.getAttribute('d')).not.toBe(initialPath);
  });

  it('renders empty chart when no segments provided', () => {
    renderWithContext(<PieChart height={200} segments={[]} width={200} />);

    expect(screen.getByLabelText('project_dashboard.widget.pie_chart')).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart-segment-0')).not.toBeInTheDocument();
  });

  it('throttles mouse move updates using requestAnimationFrame', async () => {
    const user = userEvent.setup({ delay: null });
    const mockRequestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const mockCancelAnimationFrame = jest.fn();

    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;

    renderWithContext(<PieChart height={200} segments={mockSegments} width={200} />);

    const svg = screen.getByLabelText('project_dashboard.widget.pie_chart');
    await user.hover(screen.getByTestId('pie-chart-segment-0'));

    act(() => {
      svg.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 160,
          clientY: 160,
        }),
      );
    });

    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });
});
