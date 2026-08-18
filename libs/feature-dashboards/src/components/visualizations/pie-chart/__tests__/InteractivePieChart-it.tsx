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

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { useResizeObserver } from '~shared/helpers/useResizeObserver';
import type { PieChartSegment } from '../../../../types/visualization';
import { InteractivePieChart } from '../InteractivePieChart';

expect.extend(toHaveNoViolations);

jest.mock('~shared/helpers/useResizeObserver', () => ({
  useResizeObserver: jest.fn(() => [500, undefined]),
}));

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
];

function mockContainerWidth(width: number) {
  jest.mocked(useResizeObserver).mockImplementation(() => [width, undefined]);
}

describe('InteractivePieChart', () => {
  beforeEach(() => {
    mockContainerWidth(500);
  });

  it('exposes the provided label as the chart accessible name with no a11y violations', async () => {
    const ariaLabel = 'Issues by severity. High: 25 (50%), Medium: 15 (30%)';

    const { container } = renderWithRouter(
      <InteractivePieChart
        ariaLabel={ariaLabel}
        getSegmentUrl={() => undefined}
        onSegmentClick={jest.fn()}
        segments={mockSegments}
        showLegend
      />,
    );

    expect(await screen.findByRole('img', { name: ariaLabel })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders links in the legend when segment urls are provided', async () => {
    renderWithRouter(
      <InteractivePieChart
        ariaLabel="Issues by severity. High: 25 (50%), Medium: 15 (30%)"
        getSegmentUrl={(segment) => `/next?segment=${segment.value}`}
        onSegmentClick={jest.fn()}
        segments={mockSegments}
        showLegend
      />,
    );

    expect(await screen.findByRole('link', { name: /High/ })).toHaveAttribute(
      'href',
      '/next?segment=HIGH',
    );
    expect(screen.getByRole('link', { name: /Medium/ })).toHaveAttribute(
      'href',
      '/next?segment=MEDIUM',
    );
  });

  it('renders non-link legend items when urls are not provided', async () => {
    renderWithRouter(
      <InteractivePieChart
        ariaLabel="Issues by severity. High: 25 (50%), Medium: 15 (30%)"
        getSegmentUrl={() => undefined}
        onSegmentClick={jest.fn()}
        segments={mockSegments}
        showLegend
      />,
    );

    expect((await screen.findAllByRole('button', { name: /High/ })).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /High/ })).not.toBeInTheDocument();
  });

  it('does not render the legend when showLegend is false', async () => {
    renderWithRouter(
      <InteractivePieChart
        ariaLabel="Issues by severity. High: 25 (50%), Medium: 15 (30%)"
        getSegmentUrl={() => '/next'}
        onSegmentClick={jest.fn()}
        segments={mockSegments}
        showLegend={false}
      />,
    );

    expect(await screen.findByTestId('pie-chart-container')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /High/ })).not.toBeInTheDocument();
  });

  it('forwards segment clicks to the supplied handler', async () => {
    const user = userEvent.setup({ delay: null });
    const onSegmentClick = jest.fn();

    renderWithRouter(
      <InteractivePieChart
        ariaLabel="Issues by severity. High: 25 (50%), Medium: 15 (30%)"
        getSegmentUrl={() => undefined}
        onSegmentClick={onSegmentClick}
        segments={mockSegments}
        showLegend
      />,
    );

    await user.click(await screen.findByTestId('pie-chart-segment-0'));

    expect(onSegmentClick).toHaveBeenCalledWith(mockSegments[0]);
  });

  it('forwards legend item clicks to onSegmentClick', async () => {
    const user = userEvent.setup({ delay: null });
    const onSegmentClick = jest.fn();

    renderWithRouter(
      <InteractivePieChart
        ariaLabel="Issues by severity. High: 25 (50%), Medium: 15 (30%)"
        getSegmentUrl={() => undefined}
        onSegmentClick={onSegmentClick}
        segments={mockSegments}
        showLegend
      />,
    );

    const legendItems = await screen.findAllByTestId('chart-horizontal-legend-item');
    await user.click(legendItems[1]);

    expect(onSegmentClick).toHaveBeenCalledWith(mockSegments[1]);
  });

  it('highlights the segment when its legend item is hovered, and clears on legend mouse leave', async () => {
    renderWithRouter(
      <InteractivePieChart
        ariaLabel="Issues by severity. High: 25 (50%), Medium: 15 (30%)"
        getSegmentUrl={() => undefined}
        onSegmentClick={jest.fn()}
        segments={mockSegments}
        showLegend
      />,
    );

    const segment = await screen.findByTestId('pie-chart-segment-0');
    const initialPath = segment.getAttribute('d');

    fireEvent.mouseEnter(screen.getAllByTestId('chart-horizontal-legend-item')[0]);

    await waitFor(() => {
      expect(segment.getAttribute('d')).not.toBe(initialPath);
    });

    fireEvent.mouseLeave(screen.getByTestId('chart-horizontal-legend'));

    await waitFor(() => {
      expect(segment).toHaveAttribute('d', initialPath);
    });
  });

  it('treats a missing observed width as zero so labels stay hidden until measured', async () => {
    jest.mocked(useResizeObserver).mockImplementation(() => [undefined, undefined]);

    renderWithRouter(
      <InteractivePieChart
        ariaLabel="Issues by severity. High: 25 (50%), Medium: 15 (30%)"
        getSegmentUrl={() => undefined}
        onSegmentClick={jest.fn()}
        segments={mockSegments}
        showLegend={false}
      />,
    );

    expect(await screen.findByTestId('pie-chart-container')).toBeInTheDocument();
    // Around-chart labels are hidden when containerWidth defaults to 0
    expect(screen.queryByText('High')).not.toBeInTheDocument();
  });

  it('shows chart labels only when the container is wide enough', async () => {
    const { rerender } = renderWithRouter(
      <InteractivePieChart
        ariaLabel="Issues by severity. High: 25 (50%), Medium: 15 (30%)"
        getSegmentUrl={() => undefined}
        onSegmentClick={jest.fn()}
        segments={mockSegments}
        showLegend={false}
      />,
    );

    expect(await screen.findByText('High')).toBeInTheDocument();

    mockContainerWidth(320);
    rerender(
      <InteractivePieChart
        ariaLabel="Issues by severity. High: 25 (50%), Medium: 15 (30%)"
        getSegmentUrl={() => undefined}
        onSegmentClick={jest.fn()}
        segments={mockSegments}
        showLegend={false}
      />,
    );

    expect(screen.queryByText('High')).not.toBeInTheDocument();
  });
});
