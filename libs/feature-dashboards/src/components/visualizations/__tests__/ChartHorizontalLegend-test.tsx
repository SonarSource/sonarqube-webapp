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
import { renderWithContext, renderWithRouter } from '~shared/helpers/test-utils';
import { ChartHorizontalLegend, type LegendItem } from '../ChartHorizontalLegend';

function items(count: number, labelChar = 'X'): LegendItem[] {
  return Array.from({ length: count }, (_, index) => ({
    color: `#${index.toString(16).padStart(6, '0')}`,
    label: labelChar.repeat(3),
    seriesIndex: index,
  }));
}

describe('ChartHorizontalLegend', () => {
  it('renders nothing when there are no items', () => {
    renderWithContext(
      <ChartHorizontalLegend containerWidth={500} items={[]} onLegendMouseLeave={jest.fn()} />,
    );
    expect(screen.queryByTestId('chart-horizontal-legend')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chart-horizontal-legend-item')).not.toBeInTheDocument();
  });

  it('renders every item and no "more" button when the container is wide enough', () => {
    renderWithContext(
      <ChartHorizontalLegend
        containerWidth={5000}
        items={items(3)}
        onLegendMouseLeave={jest.fn()}
      />,
    );

    expect(screen.getAllByTestId('chart-horizontal-legend-item')).toHaveLength(3);
    expect(screen.queryByTestId('chart-horizontal-legend-more')).not.toBeInTheDocument();
  });

  it('shows a "more" button when items overflow the container', () => {
    renderWithContext(
      <ChartHorizontalLegend containerWidth={80} items={items(5)} onLegendMouseLeave={jest.fn()} />,
    );

    expect(screen.getByTestId('chart-horizontal-legend-more')).toBeInTheDocument();
    // At least one item is always visible (Math.max(1, …) in computeVisibleLegendItemCount).
    expect(screen.getAllByTestId('chart-horizontal-legend-item').length).toBeGreaterThanOrEqual(1);
  });

  it('invokes onSeriesSelect when a visible item is clicked', () => {
    const onSeriesSelect = jest.fn();
    renderWithContext(
      <ChartHorizontalLegend
        containerWidth={5000}
        items={items(2)}
        onLegendMouseLeave={jest.fn()}
        onSeriesSelect={onSeriesSelect}
      />,
    );

    fireEvent.click(screen.getAllByTestId('chart-horizontal-legend-item')[1]);
    expect(onSeriesSelect).toHaveBeenCalledWith(1);
  });

  it('invokes onSeriesHover on mouse enter of a visible item', () => {
    const onSeriesHover = jest.fn();
    renderWithContext(
      <ChartHorizontalLegend
        containerWidth={5000}
        items={items(2)}
        onLegendMouseLeave={jest.fn()}
        onSeriesHover={onSeriesHover}
      />,
    );

    fireEvent.mouseEnter(screen.getAllByTestId('chart-horizontal-legend-item')[0]);
    expect(onSeriesHover).toHaveBeenCalledWith(0);
  });

  it('marks the selected item with aria-pressed=true', () => {
    renderWithContext(
      <ChartHorizontalLegend
        containerWidth={5000}
        items={items(2)}
        onLegendMouseLeave={jest.fn()}
        selectedSeriesIndex={1}
      />,
    );

    const buttons = screen.getAllByTestId('chart-horizontal-legend-item');
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not register click/hover handlers for items missing a seriesIndex', () => {
    const onSeriesSelect = jest.fn();
    const onSeriesHover = jest.fn();
    renderWithContext(
      <ChartHorizontalLegend
        containerWidth={5000}
        items={[{ color: '#abc', label: 'standalone' }]}
        onLegendMouseLeave={jest.fn()}
        onSeriesHover={onSeriesHover}
        onSeriesSelect={onSeriesSelect}
      />,
    );

    const [button] = screen.getAllByTestId('chart-horizontal-legend-item');
    fireEvent.click(button);
    fireEvent.mouseEnter(button);

    expect(onSeriesSelect).not.toHaveBeenCalled();
    expect(onSeriesHover).not.toHaveBeenCalled();
  });

  it('forwards onLegendMouseEnter / onLegendMouseLeave to the visible legend container', () => {
    const onEnter = jest.fn();
    const onLeave = jest.fn();
    renderWithContext(
      <ChartHorizontalLegend
        containerWidth={5000}
        items={items(2)}
        onLegendMouseEnter={onEnter}
        onLegendMouseLeave={onLeave}
      />,
    );

    const legend = screen.getByTestId('chart-horizontal-legend');
    fireEvent.mouseEnter(legend);
    fireEvent.mouseLeave(legend);

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('leaves visibleCount at items.length when containerWidth is zero (no measurement run)', () => {
    renderWithContext(
      <ChartHorizontalLegend containerWidth={0} items={items(3)} onLegendMouseLeave={jest.fn()} />,
    );
    expect(screen.getAllByTestId('chart-horizontal-legend-item')).toHaveLength(3);
    expect(screen.queryByTestId('chart-horizontal-legend-more')).not.toBeInTheDocument();
  });

  it('renders items with a url as links with the right href and no aria-pressed', () => {
    renderWithRouter(
      <ChartHorizontalLegend
        containerWidth={5000}
        items={[
          { color: '#aaa', label: 'High', seriesIndex: 0, url: '/issues?severity=HIGH' },
          { color: '#bbb', label: 'Medium', seriesIndex: 1, url: '/issues?severity=MEDIUM' },
        ]}
        onLegendMouseLeave={jest.fn()}
        selectedSeriesIndex={0}
      />,
    );

    const links = screen.getAllByTestId('chart-horizontal-legend-item');
    expect(links).toHaveLength(2);
    expect(links[0].tagName).toBe('A');
    expect(links[0]).toHaveAttribute('href', '/issues?severity=HIGH');
    expect(links[0]).not.toHaveAttribute('aria-pressed');
    expect(links[1]).toHaveAttribute('href', '/issues?severity=MEDIUM');
  });

  it('renders mixed link and button items side by side', () => {
    renderWithRouter(
      <ChartHorizontalLegend
        containerWidth={5000}
        items={[
          { color: '#aaa', label: 'Linked', seriesIndex: 0, url: '/somewhere' },
          { color: '#bbb', label: 'Not linked', seriesIndex: 1 },
        ]}
        onLegendMouseLeave={jest.fn()}
      />,
    );

    const elements = screen.getAllByTestId('chart-horizontal-legend-item');
    expect(elements).toHaveLength(2);
    expect(elements[0].tagName).toBe('A');
    expect(elements[1].tagName).toBe('BUTTON');
    expect(elements[1]).toHaveAttribute('aria-pressed', 'false');
  });

  it('still invokes onSeriesHover on mouse enter of a link item', () => {
    const onSeriesHover = jest.fn();
    renderWithRouter(
      <ChartHorizontalLegend
        containerWidth={5000}
        items={[{ color: '#aaa', label: 'High', seriesIndex: 0, url: '/x' }]}
        onLegendMouseLeave={jest.fn()}
        onSeriesHover={onSeriesHover}
      />,
    );

    fireEvent.mouseEnter(screen.getByTestId('chart-horizontal-legend-item'));
    expect(onSeriesHover).toHaveBeenCalledWith(0);
  });
});
