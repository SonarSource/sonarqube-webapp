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
import { render } from '~shared/helpers/test-utils';
import { LineChart } from '../LineChart';

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

/** Runs `callback` with `globalThis.ResizeObserver` forced to `undefined`, then restores the previous descriptor. */
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

jest.mock('../../RenderArea', () => ({
  RenderArea: ({ areaPath }: { areaPath: string | null }) => (
    <div>{`area:${areaPath === null ? 'none' : 'present'}`}</div>
  ),
}));

jest.mock('../../RenderChartFooter', () => ({
  FOOTER_GAP_PX: 8,
  LEGEND_ROW_HEIGHT_PX: 32,
  SINGLE_DATAPOINT_MESSAGE_HEIGHT_PX: 24,
  // The real footer renders its legend as a focusable <button> inside the same <svg> (via a
  // <foreignObject>) — stub it with a real button so tests can exercise focus/keydown events
  // that bubble up from it, the way they do in the browser.
  RenderChartFooter: ({ showLegend }: { showLegend: boolean }) => (
    <>
      <div>{`footer:${String(showLegend)}`}</div>
      {showLegend && <button type="button">legend-item</button>}
    </>
  ),
}));

jest.mock('../../RenderDots', () => ({
  RenderDots: ({
    hoveredDotIndex,
    showDot,
  }: {
    hoveredDotIndex: number | undefined;
    showDot: boolean;
  }) => <div>{`render-dots:${String(showDot)}:${String(hoveredDotIndex)}`}</div>,
}));

// Every real caller's formatDotValue returns rendered UI (e.g. <Text>{value}</Text> or a rating
// badge), never a plain string — use this in place of formatDotValue={String} wherever a test
// touches the announcer, so a regression that stringifies the node (producing "[object Object]")
// gets caught instead of silently passing.
function formatDotValueAsNode(value: number) {
  return <strong>{value}%</strong>;
}

describe('LineChart', () => {
  beforeEach(() => {
    setContainerSize(400, 240);
  });

  it('renders no-data state on fetch error', () => {
    render(
      <LineChart
        ariaLabel="line-chart"
        data={[]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError
        isMetricRating={false}
        isPending={false}
      />,
    );

    expect(screen.getByText('no-data')).toBeInTheDocument();
  });

  it('renders loading state while pending', () => {
    render(
      <LineChart
        ariaLabel="line-chart"
        data={[]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending
      />,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('renders no-data when series has no usable points', async () => {
    render(
      <LineChart
        ariaLabel="line-chart"
        data={[{ x: new Date('2026-03-01T00:00:00.000Z'), y: undefined as unknown as number }]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
      />,
    );

    expect(await screen.findByText('no-data')).toBeInTheDocument();
  });

  it('renders chart and updates hovered dot on mouse move when tooltip is enabled', async () => {
    render(
      <LineChart
        ariaLabel="line-chart"
        data={[
          { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
          { x: new Date('2026-03-15T00:00:00.000Z'), y: 3 },
        ]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        metricName="Coverage"
        milestoneValue={2}
        showArea
        showDots
        showLegend
        showMilestone
        showTooltip
      />,
    );

    const svg = await screen.findByLabelText('line-chart');
    expect(screen.getByText('area:present')).toBeInTheDocument();
    expect(screen.getByText('footer:true')).toBeInTheDocument();
    expect(screen.getByText('render-dots:false:undefined')).toBeInTheDocument();

    fireEvent.mouseMove(svg, { clientX: 180, clientY: 80 });
    expect(screen.getByText(/render-dots:true:/)).toBeInTheDocument();

    fireEvent.mouseLeave(svg);
    expect(screen.getByText('render-dots:false:undefined')).toBeInTheDocument();
  });

  it('renders chart without area by default and does not show tooltip dot when disabled', async () => {
    render(
      <LineChart
        ariaLabel="line-chart-no-tooltip"
        data={[
          { x: new Date('2026-03-01T00:00:00.000Z'), y: 2 },
          { x: new Date('2026-03-15T00:00:00.000Z'), y: 4 },
        ]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
      />,
    );

    const svg = await screen.findByLabelText('line-chart-no-tooltip');
    expect(screen.getByText('area:none')).toBeInTheDocument();
    expect(screen.getByText('footer:false')).toBeInTheDocument();

    fireEvent.mouseMove(svg, { clientX: 150, clientY: 90 });
    expect(screen.getByText('render-dots:false:undefined')).toBeInTheDocument();
  });

  it('renders five fixed y-axis grid lines for rating metrics', async () => {
    render(
      <LineChart
        ariaLabel="line-chart-rating"
        data={[
          { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
          { x: new Date('2026-03-15T00:00:00.000Z'), y: 5 },
        ]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating
        isPending={false}
      />,
    );

    await screen.findByLabelText('line-chart-rating');
    expect(screen.getByText('y-ticks:5')).toBeInTheDocument();
  });

  it('renders milestone only when value is defined and showMilestone is enabled', async () => {
    const { rerender } = render(
      <LineChart
        ariaLabel="line-chart-milestone"
        data={[
          { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
          { x: new Date('2026-03-15T00:00:00.000Z'), y: 4 },
        ]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        milestoneColor="#ff9800"
        showMilestone
      />,
    );

    const svg = await screen.findByLabelText('line-chart-milestone');
    expect(svg).not.toContainHTML('stroke="#ff9800"');

    rerender(
      <LineChart
        ariaLabel="line-chart-milestone"
        data={[
          { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
          { x: new Date('2026-03-15T00:00:00.000Z'), y: 4 },
        ]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        milestoneColor="#ff9800"
        milestoneValue={3}
        showMilestone
      />,
    );
    expect(screen.getByLabelText('line-chart-milestone')).toContainHTML('stroke="#ff9800"');
  });

  it('uses an outlined marker for a single data point; dots appear on hover', async () => {
    render(
      <LineChart
        ariaLabel="line-chart-single-point"
        color="#123456"
        data={[{ x: new Date('2026-03-01T00:00:00.000Z'), y: 2 }]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        metricName="Metric"
        showDots
        showTooltip
      />,
    );

    const svg = await screen.findByLabelText('line-chart-single-point');
    // eslint-disable-next-line testing-library/no-node-access -- svg chart marker has no role
    const marker = svg.querySelector('circle');
    expect(marker).toHaveAttribute('fill', '#123456');
    expect(marker).toHaveAttribute('r', '3');
    expect(marker).toHaveAttribute('stroke-width', '2');
    expect(screen.getByText('render-dots:false:undefined')).toBeInTheDocument();

    fireEvent.mouseMove(svg, { clientX: 200, clientY: 80 });
    expect(screen.getByText(/render-dots:true:0/)).toBeInTheDocument();
  });

  it('supports keyboard navigation to the same point values exposed on hover', async () => {
    render(
      <LineChart
        ariaLabel="line-chart-keyboard"
        data={[
          { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
          { x: new Date('2026-03-08T00:00:00.000Z'), y: 2 },
          { x: new Date('2026-03-15T00:00:00.000Z'), y: 3 },
        ]}
        formatDotValue={formatDotValueAsNode}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        metricName="Coverage"
        showDots
        showTooltip
      />,
    );

    const svg = await screen.findByLabelText('line-chart-keyboard');
    expect(svg).toHaveAttribute('tabindex', '0');

    // The live region must already be mounted (empty) before it gets a value: screen readers
    // only announce mutations to a pre-existing live region, not a node that appears already
    // populated in the same commit.
    expect(screen.getByTestId('line-chart-announcer')).toHaveTextContent('');

    fireEvent.focus(svg);
    expect(screen.getByText('render-dots:true:2')).toBeInTheDocument();
    // formatDotValue renders a node (as every real caller does), not a plain string — this must
    // show up as real text, not "[object Object]" from an accidental String(node) coercion.
    expect(screen.getByTestId('line-chart-announcer')).toHaveTextContent('Coverage: 3%');

    fireEvent.keyDown(svg, { key: 'ArrowLeft' });
    expect(screen.getByText('render-dots:true:1')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-announcer')).toHaveTextContent('Coverage: 2%');

    fireEvent.keyDown(svg, { key: 'ArrowLeft' });
    expect(screen.getByText('render-dots:true:0')).toBeInTheDocument();

    // Clamped at the first point.
    fireEvent.keyDown(svg, { key: 'ArrowLeft' });
    expect(screen.getByText('render-dots:true:0')).toBeInTheDocument();

    fireEvent.keyDown(svg, { key: 'ArrowRight' });
    expect(screen.getByText('render-dots:true:1')).toBeInTheDocument();

    fireEvent.keyDown(svg, { key: 'Escape' });
    expect(screen.getByText('render-dots:false:undefined')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-announcer')).toHaveTextContent('');
  });

  it('ignores focus/blur/keydown events bubbling up from the legend button, not the svg itself', async () => {
    render(
      <LineChart
        ariaLabel="line-chart-legend-bubble"
        data={[
          { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
          { x: new Date('2026-03-15T00:00:00.000Z'), y: 3 },
        ]}
        formatDotValue={formatDotValueAsNode}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        metricName="Coverage"
        showDots
        showLegend
        showTooltip
      />,
    );

    await screen.findByLabelText('line-chart-legend-bubble');
    const legendButton = screen.getByText('legend-item');

    fireEvent.focus(legendButton);
    expect(screen.getByText('render-dots:false:undefined')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-announcer')).toHaveTextContent('');

    fireEvent.keyDown(legendButton, { key: 'ArrowLeft' });
    expect(screen.getByText('render-dots:false:undefined')).toBeInTheDocument();

    fireEvent.blur(legendButton);
    expect(screen.getByText('render-dots:false:undefined')).toBeInTheDocument();
  });

  it('does not spam the live region while the mouse is hovering, only for keyboard navigation', async () => {
    render(
      <LineChart
        ariaLabel="line-chart-mouse-vs-keyboard"
        data={[
          { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
          { x: new Date('2026-03-15T00:00:00.000Z'), y: 3 },
        ]}
        formatDotValue={formatDotValueAsNode}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        metricName="Coverage"
        showDots
        showTooltip
      />,
    );

    const svg = await screen.findByLabelText('line-chart-mouse-vs-keyboard');

    fireEvent.mouseMove(svg, { clientX: 180, clientY: 80 });
    expect(screen.getByText(/render-dots:true:/)).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-announcer')).toHaveTextContent('');

    fireEvent.focus(svg);
    expect(screen.getByTestId('line-chart-announcer')).not.toHaveTextContent('');

    fireEvent.mouseMove(svg, { clientX: 150, clientY: 90 });
    expect(screen.getByTestId('line-chart-announcer')).toHaveTextContent('');
  });

  it('hides the keyboard-focused point on blur', async () => {
    render(
      <LineChart
        ariaLabel="line-chart-keyboard-blur"
        data={[
          { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
          { x: new Date('2026-03-15T00:00:00.000Z'), y: 3 },
        ]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
        showDots
        showTooltip
      />,
    );

    const svg = await screen.findByLabelText('line-chart-keyboard-blur');
    fireEvent.focus(svg);
    expect(screen.getByText('render-dots:true:1')).toBeInTheDocument();

    fireEvent.blur(svg);
    expect(screen.getByText('render-dots:false:undefined')).toBeInTheDocument();
  });

  it('is not keyboard-focusable when tooltips are disabled', async () => {
    render(
      <LineChart
        ariaLabel="line-chart-no-keyboard"
        data={[
          { x: new Date('2026-03-01T00:00:00.000Z'), y: 1 },
          { x: new Date('2026-03-15T00:00:00.000Z'), y: 3 },
        ]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
      />,
    );

    const svg = await screen.findByLabelText('line-chart-no-keyboard');
    expect(svg).not.toHaveAttribute('tabindex');
  });

  it('keeps zero-sized placeholder when container dimensions are zero', () => {
    setContainerSize(0, 0);

    render(
      <LineChart
        ariaLabel="line-chart-zero-size"
        data={[{ x: new Date('2026-03-01T00:00:00.000Z'), y: 1 }]}
        formatDotValue={String}
        formatTick={String}
        hasFetchError={false}
        isMetricRating={false}
        isPending={false}
      />,
    );

    expect(screen.queryByLabelText('line-chart-zero-size')).not.toBeInTheDocument();
    expect(screen.queryByText('no-data')).not.toBeInTheDocument();
  });

  it('registers and unregisters window resize fallback only when ResizeObserver is unavailable and not pending', () => {
    withResizeObserverUndefined(() => {
      const addEventListenerSpy = jest.spyOn(globalThis, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(globalThis, 'removeEventListener');

      const { rerender, unmount } = render(
        <LineChart
          ariaLabel="line-chart-listener"
          data={[{ x: new Date('2026-03-01T00:00:00.000Z'), y: 1 }]}
          formatDotValue={String}
          formatTick={String}
          hasFetchError={false}
          isMetricRating={false}
          isPending
        />,
      );

      expect(addEventListenerSpy).not.toHaveBeenCalledWith('resize', expect.any(Function));

      rerender(
        <LineChart
          ariaLabel="line-chart-listener"
          data={[{ x: new Date('2026-03-01T00:00:00.000Z'), y: 1 }]}
          formatDotValue={String}
          formatTick={String}
          hasFetchError={false}
          isMetricRating={false}
          isPending={false}
        />,
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});
