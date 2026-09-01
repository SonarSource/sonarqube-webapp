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
import type { RefObject } from 'react';
import { renderWithContext } from '~shared/helpers/test-utils';
import type { LineChartSeries } from '../../../../types/visualization';
import { MultiLineChart } from '../MultiLineChart';

function setContainerSize(width: number, height: number) {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: height,
  });
}

function withResizeObserverUndefined(callback: () => void) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver');
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: undefined,
    writable: true,
  });
  try {
    callback();
  } finally {
    if (originalDescriptor === undefined) {
      Reflect.deleteProperty(globalThis, 'ResizeObserver');
    } else {
      Object.defineProperty(globalThis, 'ResizeObserver', originalDescriptor);
    }
  }
}

jest.mock('../../../common/WidgetNoData', () => ({
  WidgetNoData: () => <div>no-data</div>,
}));

jest.mock('../../../common/WidgetLoadingSpinner', () => ({
  WidgetLoadingSpinner: () => <div>loading</div>,
}));

jest.mock('../../RenderXAxis', () => ({
  RenderXAxis: () => null,
}));

jest.mock('../../RenderYAxis', () => ({
  RenderYAxis: ({ ticks }: { ticks: number[] }) => <div>{`y-ticks:${ticks.length}`}</div>,
}));

jest.mock('../../RenderChartFooter', () => ({
  FOOTER_GAP_PX: 8,
  LEGEND_ROW_HEIGHT_PX: 32,
  SINGLE_DATAPOINT_MESSAGE_HEIGHT_PX: 24,
  RenderChartFooter: ({
    focusedSeriesIndex,
    isSingleDatapoint,
    legendContainerRef,
    legendItems,
    onLegendMouseEnter,
    onLegendMouseLeave,
    onSeriesHover,
    onSeriesSelect,
    showLegend,
    singleDatapointMessageId,
  }: {
    focusedSeriesIndex: number | undefined;
    isSingleDatapoint: boolean;
    legendContainerRef?: RefObject<HTMLDivElement | null>;
    legendItems: Array<{ color: string; label: string; seriesIndex?: number }>;
    onLegendMouseEnter?: () => void;
    onLegendMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onSeriesHover?: (index: number | undefined) => void;
    onSeriesSelect?: (index: number) => void;
    showLegend: boolean;
    singleDatapointMessageId?: string;
  }) => (
    <div
      data-testid="legend-container"
      onMouseEnter={onLegendMouseEnter}
      onMouseLeave={onLegendMouseLeave}
      ref={legendContainerRef}
    >
      <div data-testid="footer-summary">
        {`footer:${String(showLegend)}:single=${String(isSingleDatapoint)}:message=${String(singleDatapointMessageId)}:focused=${String(focusedSeriesIndex)}:count=${legendItems.length}`}
      </div>
      {legendItems.map((item, index) => (
        <button
          data-testid={`footer-item-${index}`}
          key={item.label}
          onClick={() => onSeriesSelect?.(index)}
          onMouseEnter={() => onSeriesHover?.(index)}
          onMouseLeave={() => onSeriesHover?.(undefined)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('../MultiLineHoverDots', () => ({
  MultiLineHoverDots: ({ hoveredSeriesIndex }: { hoveredSeriesIndex?: number }) => (
    <g data-testid="hover-dots">{`focus=${String(hoveredSeriesIndex)}`}</g>
  ),
}));

function buildSeries(overrides: Partial<LineChartSeries> = {}): LineChartSeries {
  return {
    color: '#ff0000',
    data: [
      { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
      { x: new Date('2026-03-15T00:00:00.000Z'), y: 3 },
    ],
    id: 'a',
    label: 'Series A',
    ...overrides,
  };
}

function renderRaf(): jest.SpyInstance<number, [callback: FrameRequestCallback]> {
  return jest
    .spyOn(globalThis, 'requestAnimationFrame')
    .mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
}

describe('MultiLineChart', () => {
  beforeEach(() => {
    setContainerSize(400, 240);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders no-data state on fetch error', () => {
    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError
        isMetricRating={false}
        isPending={false}
        series={[]}
      />,
    );

    expect(screen.getByText('no-data')).toBeInTheDocument();
  });

  it('renders loading state while pending', () => {
    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending
        series={[buildSeries()]}
      />,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('renders no-data when series array is empty', async () => {
    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[]}
      />,
    );

    expect(await screen.findByText('no-data')).toBeInTheDocument();
  });

  it('renders no-data when no series has a usable y value', async () => {
    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[
          buildSeries({
            data: [{ x: new Date('2026-03-01T00:00:00.000Z'), y: undefined as unknown as number }],
          }),
        ]}
      />,
    );

    expect(await screen.findByText('no-data')).toBeInTheDocument();
  });

  it('renders one path per series with the series color', async () => {
    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[
          buildSeries({ color: '#aaa', id: 'a', label: 'A' }),
          buildSeries({ color: '#bbb', id: 'b', label: 'B' }),
        ]}
      />,
    );

    const svg = await screen.findByLabelText('multi-line-chart');
    /* eslint-disable testing-library/no-node-access -- stroke path has no role */
    const paths = svg.querySelectorAll('path');
    expect(paths).toHaveLength(2);
    expect(paths[0]).toHaveAttribute('stroke', '#aaa');
    expect(paths[1]).toHaveAttribute('stroke', '#bbb');
    /* eslint-enable testing-library/no-node-access */
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=undefined:count=2');
  });

  it('shows tooltip with series values and total on mouse move; clears on mouse leave', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={(value) => `v${value}`}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[
          buildSeries({ color: '#aaa', id: 'a', label: 'A' }),
          buildSeries({
            color: '#bbb',
            data: [
              { x: new Date('2026-03-01T00:00:00.000Z'), y: 2 },
              { x: new Date('2026-03-15T00:00:00.000Z'), y: 4 },
            ],
            id: 'b',
            label: 'B',
          }),
        ]}
        showTooltip
      />,
    );

    const svg = await screen.findByLabelText('multi-line-chart');

    fireEvent.mouseMove(svg, { clientX: 200, clientY: 100 });
    const tooltip = await screen.findByTestId('line-chart-tooltip');
    expect(tooltip).toHaveTextContent('A');
    expect(tooltip).toHaveTextContent('B');
    // Per-series formatted values
    expect(tooltip).toHaveTextContent(/v\d/);
    // Two series → total row rendered
    expect(tooltip).toHaveTextContent(/total/i);

    fireEvent.mouseLeave(svg);
    expect(screen.queryByTestId('line-chart-tooltip')).not.toBeInTheDocument();
  });

  it('does not throw when mouse leave relatedTarget is not a Node', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[buildSeries()]}
        showTooltip
      />,
    );

    const svg = await screen.findByLabelText('multi-line-chart');
    fireEvent.mouseMove(svg, { clientX: 200, clientY: 100 });
    expect(screen.getByTestId('line-chart-tooltip')).toBeInTheDocument();

    expect(() => {
      fireEvent.mouseLeave(svg, { relatedTarget: globalThis });
    }).not.toThrow();
    expect(screen.queryByTestId('line-chart-tooltip')).not.toBeInTheDocument();
  });

  it('clears chart hover when leaving svg toward legend without resetting series focus', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[buildSeries({ id: 'a', label: 'A' }), buildSeries({ id: 'b', label: 'B' })]}
        showLegend
        showTooltip
      />,
    );

    const svg = await screen.findByLabelText('multi-line-chart');
    const legend = screen.getByTestId('legend-container');

    fireEvent.mouseMove(svg, { clientX: 200, clientY: 100 });
    expect(screen.getByTestId('line-chart-tooltip')).toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByTestId('footer-item-1'));
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=1');

    fireEvent.mouseLeave(svg, { relatedTarget: legend });
    expect(screen.queryByTestId('line-chart-tooltip')).not.toBeInTheDocument();
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=1');
  });

  it('keeps series focus when leaving legend toward chart', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[buildSeries({ id: 'a', label: 'A' }), buildSeries({ id: 'b', label: 'B' })]}
        showLegend
      />,
    );

    const svg = await screen.findByLabelText('multi-line-chart');
    const legend = screen.getByTestId('legend-container');

    fireEvent.mouseEnter(screen.getByTestId('footer-item-0'));
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=0');

    fireEvent.mouseLeave(legend, { relatedTarget: svg });
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=0');
  });

  it('clears series focus when leaving legend outside the chart', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[buildSeries({ id: 'a', label: 'A' }), buildSeries({ id: 'b', label: 'B' })]}
        showLegend
      />,
    );

    await screen.findByLabelText('multi-line-chart');
    const legend = screen.getByTestId('legend-container');

    fireEvent.mouseEnter(screen.getByTestId('footer-item-0'));
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=0');

    fireEvent.mouseLeave(legend, { relatedTarget: window });
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=undefined');
  });

  it('does not show a total row when only one series has a point near the hover', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={(value) => `v${value}`}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[buildSeries({ id: 'only', label: 'Only' })]}
        showTooltip
      />,
    );

    const svg = await screen.findByLabelText('multi-line-chart');
    fireEvent.mouseMove(svg, { clientX: 200, clientY: 100 });
    const tooltip = await screen.findByTestId('line-chart-tooltip');
    expect(tooltip).not.toHaveTextContent(/total/i);
  });

  it('renders five fixed y-axis grid lines for rating metrics', async () => {
    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart-rating"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating
        isPending={false}
        series={[
          buildSeries({
            data: [
              { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
              { x: new Date('2026-03-15T00:00:00.000Z'), y: 5 },
            ],
          }),
        ]}
      />,
    );

    await screen.findByLabelText('multi-line-chart-rating');
    expect(screen.getByText('y-ticks:5')).toBeInTheDocument();
  });

  it('omits the total row for rating metrics', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating
        isPending={false}
        series={[
          buildSeries({
            color: '#aaa',
            data: [
              { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
              { x: new Date('2026-03-15T00:00:00.000Z'), y: 4 },
            ],
            id: 'a',
            label: 'A',
          }),
          buildSeries({
            color: '#bbb',
            data: [
              { x: new Date('2026-03-01T00:00:00.000Z'), y: 2 },
              { x: new Date('2026-03-15T00:00:00.000Z'), y: 3 },
            ],
            id: 'b',
            label: 'B',
          }),
        ]}
        showTooltip
      />,
    );

    expect(screen.getByText('y-ticks:5')).toBeInTheDocument();
    const svg = await screen.findByLabelText('multi-line-chart');
    fireEvent.mouseMove(svg, { clientX: 200, clientY: 100 });
    const tooltip = await screen.findByTestId('line-chart-tooltip');
    expect(tooltip).not.toHaveTextContent(/total/i);
  });

  it('skips tooltip when the pointer is outside the plot area', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[buildSeries()]}
        showTooltip
      />,
    );

    const svg = await screen.findByLabelText('multi-line-chart');
    // clientX=5 → mouseChartX = 5 - paddingLeft(60) = -55 → outside
    fireEvent.mouseMove(svg, { clientX: 5, clientY: 100 });
    expect(screen.queryByTestId('line-chart-tooltip')).not.toBeInTheDocument();
  });

  it('focuses a series on legend hover and toggles selection on legend click', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[buildSeries({ id: 'a', label: 'A' }), buildSeries({ id: 'b', label: 'B' })]}
        showLegend
      />,
    );

    await screen.findByLabelText('multi-line-chart');

    fireEvent.mouseEnter(screen.getByTestId('footer-item-1'));
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=1');

    fireEvent.mouseLeave(screen.getByTestId('footer-item-1'));
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=undefined');

    fireEvent.click(screen.getByTestId('footer-item-0'));
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=0');

    // Clicking the same series again clears the selection.
    fireEvent.click(screen.getByTestId('footer-item-0'));
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=undefined');
  });

  it('resets hover and selection when the series id list changes', async () => {
    renderRaf();

    const { rerender } = renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[buildSeries({ id: 'a', label: 'A' }), buildSeries({ id: 'b', label: 'B' })]}
        showLegend
      />,
    );

    await screen.findByLabelText('multi-line-chart');
    fireEvent.click(screen.getByTestId('footer-item-1'));
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=1');

    rerender(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[buildSeries({ id: 'x', label: 'X' }), buildSeries({ id: 'y', label: 'Y' })]}
        showLegend
      />,
    );

    expect(screen.getByTestId('footer-summary')).toHaveTextContent('focused=undefined');
  });

  it('renders single-point series as outlined markers while preserving other series lines', async () => {
    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[
          buildSeries({
            data: [{ x: new Date('2026-03-01T00:00:00.000Z'), y: 2 }],
            id: 'a',
            label: 'A',
          }),
          buildSeries({ color: '#00ff00', id: 'b', label: 'B' }),
        ]}
      />,
    );

    const svg = await screen.findByLabelText('multi-line-chart');
    /* eslint-disable testing-library/no-node-access -- chart primitives have no roles */
    const marker = svg.querySelector('circle');
    const line = svg.querySelector('path');
    expect(marker).toHaveAttribute('fill', '#ff0000');
    expect(marker).toHaveAttribute('r', '3');
    expect(marker).toHaveAttribute('stroke-width', '2');
    expect(line).toHaveAttribute('stroke', '#00ff00');
    expect(line).toHaveAttribute('stroke-width', '2');
    /* eslint-enable testing-library/no-node-access */
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('single=true');
    expect(screen.getByTestId('footer-summary')).toHaveTextContent(
      'message=dashboard.line_chart.single_data_series',
    );
  });

  it('does not render a marker or message for a single entry without a usable value', async () => {
    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[
          buildSeries(),
          buildSeries({
            data: [
              {
                x: new Date('2026-03-01T00:00:00.000Z'),
                y: undefined as unknown as number,
              },
            ],
            id: 'b',
            label: 'B',
          }),
        ]}
      />,
    );

    const svg = await screen.findByLabelText('multi-line-chart');
    // eslint-disable-next-line testing-library/no-node-access -- chart primitives have no roles
    expect(svg.querySelector('circle')).toBeNull();
    expect(screen.getByTestId('footer-summary')).toHaveTextContent('single=false');
  });

  it('includes the single-point message in the tooltip when any series has one point', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[
          buildSeries({
            data: [{ x: new Date('2026-03-01T00:00:00.000Z'), y: 2 }],
            id: 'a',
            label: 'A',
          }),
          buildSeries({ id: 'b', label: 'B' }),
        ]}
        showTooltip
      />,
    );

    fireEvent.mouseMove(await screen.findByLabelText('multi-line-chart'), {
      clientX: 200,
      clientY: 100,
    });

    expect(await screen.findByTestId('line-chart-tooltip')).toHaveTextContent(
      'dashboard.line_chart.single_data_series',
    );
  });

  it('uses the singular message for a single-series chart with one point', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[
          buildSeries({
            data: [{ x: new Date('2026-03-01T00:00:00.000Z'), y: 2 }],
          }),
        ]}
        showTooltip
      />,
    );

    fireEvent.mouseMove(await screen.findByLabelText('multi-line-chart'), {
      clientX: 200,
      clientY: 100,
    });

    expect(await screen.findByTestId('line-chart-tooltip')).toHaveTextContent(
      'dashboard.line_chart.single_data',
    );
    expect(screen.getByTestId('footer-summary')).toHaveTextContent(
      'message=dashboard.line_chart.single_data',
    );
  });

  it('uses the series message when multiple series each have one point', async () => {
    renderRaf();

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[
          buildSeries({
            data: [{ x: new Date('2026-03-01T00:00:00.000Z'), y: 2 }],
          }),
          buildSeries({
            data: [{ x: new Date('2026-03-01T00:00:00.000Z'), y: 3 }],
            id: 'b',
            label: 'B',
          }),
        ]}
        showTooltip
      />,
    );

    fireEvent.mouseMove(await screen.findByLabelText('multi-line-chart'), {
      clientX: 200,
      clientY: 100,
    });

    expect(await screen.findByTestId('line-chart-tooltip')).toHaveTextContent(
      'dashboard.line_chart.single_data_series',
    );
  });

  it('keeps a zero-sized placeholder when container dimensions are zero', () => {
    setContainerSize(0, 0);

    renderWithContext(
      <MultiLineChart
        ariaLabel="multi-line-chart-zero"
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        series={[buildSeries()]}
      />,
    );

    expect(screen.queryByLabelText('multi-line-chart-zero')).not.toBeInTheDocument();
    expect(screen.queryByText('no-data')).not.toBeInTheDocument();
  });

  it('falls back to window resize when ResizeObserver is unavailable', () => {
    withResizeObserverUndefined(() => {
      const addEventListenerSpy = jest.spyOn(globalThis, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(globalThis, 'removeEventListener');

      const { unmount } = renderWithContext(
        <MultiLineChart
          ariaLabel="multi-line-chart"
          formatDotValue={String}
          formatTick={String}
          hasFetchError={false}
          isMetricRating={false}
          isPending={false}
          series={[buildSeries()]}
        />,
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});
