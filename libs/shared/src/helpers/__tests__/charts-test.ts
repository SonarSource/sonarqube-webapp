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

import { scaleTime } from 'd3-scale';
import { noop } from 'lodash';
import * as React from 'react';
import {
  makeOverlayPointerDown,
  makeOverlayPointerMove,
  makeOverlayPointerUp,
  makeSelectionPointerDown,
  makeZoomHandlePointerDown,
  ZoomOverlayState,
} from '../charts';

interface FakePointerEvent<T extends Element> extends React.PointerEvent<T> {
  currentTarget: T & {
    getBoundingClientRect: () => { left: number };
    setPointerCapture: jest.Mock;
  };
  stopPropagation: jest.Mock;
}

// Minimal pointer event factory — only the fields our handlers read
function pointerEvent<T extends Element = SVGRectElement>(
  fields: Partial<{ clientX: number; getBoundingClientRectLeft: number; pointerId: number }> = {},
): FakePointerEvent<T> {
  const { clientX = 0, pointerId = 1, getBoundingClientRectLeft = 0 } = fields;
  return {
    clientX,
    pointerId,
    stopPropagation: jest.fn(),
    currentTarget: {
      setPointerCapture: jest.fn(),
      getBoundingClientRect: () => ({ left: getBoundingClientRectLeft }),
    },
  } as unknown as FakePointerEvent<T>;
}

const xScale = scaleTime()
  .domain([new Date(2020, 0, 1), new Date(2020, 11, 31)])
  .range([0, 1000]);

const xDim = [0, 1000];

// ---------------------------------------------------------------------------
// makeOverlayPointerDown
// ---------------------------------------------------------------------------

function makeDragStateRef(
  initial: ZoomOverlayState = {},
): React.MutableRefObject<ZoomOverlayState> {
  return { current: initial };
}

describe('makeOverlayPointerDown', () => {
  it('sets overlayLeftPos and newZoomStart from the event', () => {
    const dragState = makeDragStateRef();
    const handler = makeOverlayPointerDown(xDim, dragState);

    handler(pointerEvent({ clientX: 300, getBoundingClientRectLeft: 50 }));

    expect(dragState.current).toEqual({ overlayLeftPos: 50, newZoomStart: 250 });
  });

  it('clamps newZoomStart to xDim bounds', () => {
    const dragState = makeDragStateRef();
    const handler = makeOverlayPointerDown(xDim, dragState);

    // clientX - overlayLeft = -10, below xDim[0]
    handler(pointerEvent({ clientX: 40, getBoundingClientRectLeft: 50 }));
    expect(dragState.current).toMatchObject({ newZoomStart: 0 });

    // clientX - overlayLeft = 1100, above xDim[1]
    handler(pointerEvent({ clientX: 1150, getBoundingClientRectLeft: 50 }));
    expect(dragState.current).toMatchObject({ newZoomStart: 1000 });
  });

  it('captures the pointer', () => {
    const handler = makeOverlayPointerDown(xDim, makeDragStateRef());
    const event = pointerEvent({ clientX: 300, pointerId: 7, getBoundingClientRectLeft: 50 });
    handler(event);

    expect(event.currentTarget.setPointerCapture).toHaveBeenCalledWith(7);
  });
});

// ---------------------------------------------------------------------------
// makeOverlayPointerMove
// ---------------------------------------------------------------------------

describe('makeOverlayPointerMove', () => {
  it('calls handleZoomUpdate with sorted [newZoomStart, x]', () => {
    const handleZoomUpdate = jest.fn();
    const dragState = makeDragStateRef({ newZoomStart: 400, overlayLeftPos: 0 });

    const handler = makeOverlayPointerMove(xScale, xDim, dragState, handleZoomUpdate);
    handler(pointerEvent({ clientX: 200 }));

    expect(handleZoomUpdate).toHaveBeenCalledWith(xScale, [200, 400]);
  });

  it('sorts the range when clientX is right of newZoomStart', () => {
    const handleZoomUpdate = jest.fn();
    const dragState = makeDragStateRef({ newZoomStart: 100, overlayLeftPos: 0 });

    const handler = makeOverlayPointerMove(xScale, xDim, dragState, handleZoomUpdate);
    handler(pointerEvent({ clientX: 700 }));

    expect(handleZoomUpdate).toHaveBeenCalledWith(xScale, [100, 700]);
  });

  it('does nothing when drag has not started (no state)', () => {
    const handleZoomUpdate = jest.fn();

    const handler = makeOverlayPointerMove(xScale, xDim, makeDragStateRef(), handleZoomUpdate);
    handler(pointerEvent({ clientX: 300 }));

    expect(handleZoomUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// makeOverlayPointerUp
// ---------------------------------------------------------------------------

describe('makeOverlayPointerUp', () => {
  it('calls handleZoomUpdate with the final range and resets drag state', () => {
    const handleZoomUpdate = jest.fn();
    const dragState = makeDragStateRef({ newZoomStart: 100, overlayLeftPos: 0 });

    const handler = makeOverlayPointerUp(xScale, xDim, dragState, handleZoomUpdate);
    handler(pointerEvent({ clientX: 600 }));

    expect(handleZoomUpdate).toHaveBeenCalledWith(xScale, [100, 600]);
    expect(dragState.current).toEqual({ newZoomStart: undefined, overlayLeftPos: undefined });
  });

  it('resets to xDim when pointer released at same position as start (single click)', () => {
    const handleZoomUpdate = jest.fn();
    const dragState = makeDragStateRef({ newZoomStart: 300, overlayLeftPos: 0 });

    const handler = makeOverlayPointerUp(xScale, xDim, dragState, handleZoomUpdate);
    handler(pointerEvent({ clientX: 300 }));

    expect(handleZoomUpdate).toHaveBeenCalledWith(xScale, xDim);
  });

  it('does nothing when drag has not started', () => {
    const handleZoomUpdate = jest.fn();

    const handler = makeOverlayPointerUp(xScale, xDim, makeDragStateRef(), handleZoomUpdate);
    handler(pointerEvent({ clientX: 300 }));

    expect(handleZoomUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// makeSelectionPointerDown
// ---------------------------------------------------------------------------

// Helper: spy on globalThis.addEventListener, fire the drag sequence, then restore
function fakePointerMoveEvent(clientX: number): PointerEvent {
  return { clientX } as unknown as PointerEvent;
}

function withGlobalPointerListeners(
  triggerDown: () => void,
  moves: Array<{ clientX: number }>,
  up: { clientX: number },
) {
  const listeners: Record<string, EventListener> = {};
  const addSpy = jest
    .spyOn(globalThis, 'addEventListener')
    .mockImplementation((type: string, listener: EventListenerOrEventListenerObject) => {
      listeners[type] = listener as EventListener;
    });
  const removeSpy = jest.spyOn(globalThis, 'removeEventListener').mockImplementation(noop);

  triggerDown();

  for (const move of moves) {
    listeners.pointermove?.(fakePointerMoveEvent(move.clientX));
  }
  listeners.pointerup?.(fakePointerMoveEvent(up.clientX));

  addSpy.mockRestore();
  removeSpy.mockRestore();

  return listeners;
}

describe('makeSelectionPointerDown', () => {
  it('calls handleZoomUpdate on pointermove with the dragged position', () => {
    const handleZoomUpdate = jest.fn();

    withGlobalPointerListeners(
      () => {
        makeSelectionPointerDown(
          xScale,
          200,
          100,
          xDim,
          handleZoomUpdate,
        )(pointerEvent({ clientX: 500 }));
      },
      [{ clientX: 550 }],
      { clientX: 550 },
    );

    // Dragged 50px right from originClientX=500: delta=50, x = clamp(200+50, 0, 900) = 250
    expect(handleZoomUpdate).toHaveBeenCalledWith(xScale, [250, 350]);
  });

  it('calls handleZoomUpdate on pointerup with final position', () => {
    const handleZoomUpdate = jest.fn();

    withGlobalPointerListeners(
      () => {
        makeSelectionPointerDown(
          xScale,
          200,
          100,
          xDim,
          handleZoomUpdate,
        )(pointerEvent({ clientX: 500 }));
      },
      [],
      { clientX: 600 },
    );

    // delta=100, x = clamp(200+100, 0, 900) = 300
    expect(handleZoomUpdate).toHaveBeenCalledWith(xScale, [300, 400]);
  });

  it('removes global listeners after pointerup', () => {
    const handleZoomUpdate = jest.fn();

    const removeSpy = jest.spyOn(globalThis, 'removeEventListener').mockImplementation(noop);
    jest.spyOn(globalThis, 'addEventListener').mockImplementation(noop);

    makeSelectionPointerDown(
      xScale,
      200,
      100,
      xDim,
      handleZoomUpdate,
    )(pointerEvent({ clientX: 500 }));

    // Simulate the internal onUp calling removeEventListener
    const upCalls = jest.mocked(globalThis.addEventListener).mock.calls;
    const onUp = upCalls.find((call) => call[0] === 'pointerup')?.[1];
    (onUp as ((e: PointerEvent) => void) | undefined)?.(fakePointerMoveEvent(600));

    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));

    removeSpy.mockRestore();
    jest.mocked(globalThis.addEventListener).mockRestore();
  });

  it('clamps position to xDim bounds', () => {
    const handleZoomUpdate = jest.fn();

    withGlobalPointerListeners(
      () => {
        makeSelectionPointerDown(
          xScale,
          900,
          100,
          xDim,
          handleZoomUpdate,
        )(pointerEvent({ clientX: 500 }));
      },
      [{ clientX: 2000 }],
      { clientX: 2000 },
    );

    // Moving far right: clamped to xDim[1] - width = 900
    expect(handleZoomUpdate).toHaveBeenCalledWith(xScale, [900, 1000]);
  });

  it('stops propagation and captures pointer on pointerdown', () => {
    const event = pointerEvent({ clientX: 300, pointerId: 3 });
    jest.spyOn(globalThis, 'addEventListener').mockImplementation(noop);

    makeSelectionPointerDown(xScale, 100, 100, xDim, jest.fn())(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.currentTarget.setPointerCapture).toHaveBeenCalledWith(3);

    jest.mocked(globalThis.addEventListener).mockRestore();
  });
});

// ---------------------------------------------------------------------------
// makeZoomHandlePointerDown
// ---------------------------------------------------------------------------

describe('makeZoomHandlePointerDown', () => {
  it('updates right handle: [fixedPos, x] on move', () => {
    const handleZoomUpdate = jest.fn();

    withGlobalPointerListeners(
      () => {
        makeZoomHandlePointerDown(
          xScale,
          700,
          200,
          xDim,
          'right',
          handleZoomUpdate,
        )(pointerEvent<SVGGElement>({ clientX: 700 }));
      },
      [{ clientX: 800 }],
      { clientX: 800 },
    );

    // delta=100, x = clamp(700+100, 0, 1000) = 800
    expect(handleZoomUpdate).toHaveBeenCalledWith(xScale, [200, 800]);
  });

  it('updates left handle: [x, fixedPos] on move', () => {
    const handleZoomUpdate = jest.fn();

    withGlobalPointerListeners(
      () => {
        makeZoomHandlePointerDown(
          xScale,
          300,
          800,
          xDim,
          'left',
          handleZoomUpdate,
        )(pointerEvent<SVGGElement>({ clientX: 300 }));
      },
      [{ clientX: 150 }],
      { clientX: 150 },
    );

    // delta=-150, x = clamp(300-150, 0, 1000) = 150
    expect(handleZoomUpdate).toHaveBeenCalledWith(xScale, [150, 800]);
  });

  it('removes global listeners after pointerup', () => {
    const handleZoomUpdate = jest.fn();

    const removeSpy = jest.spyOn(globalThis, 'removeEventListener').mockImplementation(noop);
    jest.spyOn(globalThis, 'addEventListener').mockImplementation(noop);

    makeZoomHandlePointerDown(
      xScale,
      700,
      200,
      xDim,
      'right',
      handleZoomUpdate,
    )(pointerEvent<SVGGElement>({ clientX: 700 }));

    const upCalls = jest.mocked(globalThis.addEventListener).mock.calls;
    const onUp = upCalls.find((call) => call[0] === 'pointerup')?.[1];
    (onUp as ((e: PointerEvent) => void) | undefined)?.(fakePointerMoveEvent(850));

    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));

    removeSpy.mockRestore();
    jest.mocked(globalThis.addEventListener).mockRestore();
  });

  it('clamps handle position to xDim bounds', () => {
    const handleZoomUpdate = jest.fn();

    withGlobalPointerListeners(
      () => {
        makeZoomHandlePointerDown(
          xScale,
          700,
          200,
          xDim,
          'right',
          handleZoomUpdate,
        )(pointerEvent<SVGGElement>({ clientX: 700 }));
      },
      [{ clientX: 1500 }],
      { clientX: 1500 },
    );

    expect(handleZoomUpdate).toHaveBeenCalledWith(xScale, [200, 1000]);
  });
});
