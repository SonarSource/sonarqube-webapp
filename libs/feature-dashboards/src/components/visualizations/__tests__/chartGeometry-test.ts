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

import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import {
  createLinearYScale,
  createTimeXScale,
  getNearestIndex,
  hasSingleDatapoint,
  seriesHasValidData,
  useChartDimensions,
} from '../chartGeometry';

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

describe('getNearestIndex', () => {
  it('returns 0 for an empty array', () => {
    expect(getNearestIndex([], 100)).toBe(0);
  });

  it('returns 0 for a single-point array', () => {
    expect(getNearestIndex([{ x: 50, y: 1 }], 0)).toBe(0);
  });

  it('returns the index whose x is closest to the target', () => {
    const data = [
      { x: 0, y: 1 },
      { x: 10, y: 2 },
      { x: 30, y: 3 },
    ];
    expect(getNearestIndex(data, 11)).toBe(1);
    expect(getNearestIndex(data, 25)).toBe(2);
    expect(getNearestIndex(data, -5)).toBe(0);
  });

  it('coerces Date x-values to numeric distance', () => {
    const data = [
      { x: new Date('2026-01-01T00:00:00.000Z'), y: 1 },
      { x: new Date('2026-01-10T00:00:00.000Z'), y: 2 },
    ];
    const target = new Date('2026-01-09T00:00:00.000Z').getTime();
    expect(getNearestIndex(data, target)).toBe(1);
  });
});

describe('hasSingleDatapoint', () => {
  it('only matches data containing exactly one point', () => {
    expect(hasSingleDatapoint([])).toBe(false);
    expect(hasSingleDatapoint([{ x: 0, y: 1 }])).toBe(true);
    expect(
      hasSingleDatapoint([
        { x: 0, y: 1 },
        { x: 1, y: 2 },
      ]),
    ).toBe(false);
    expect(hasSingleDatapoint([{ x: 0, y: undefined as unknown as number }])).toBe(false);
    expect(hasSingleDatapoint([{ x: 0, y: null as unknown as number }])).toBe(false);
    expect(hasSingleDatapoint([{ x: 0, y: Number.NaN }])).toBe(false);
  });
});

describe('seriesHasValidData', () => {
  it('matches when at least one series contains a usable value', () => {
    expect(seriesHasValidData([])).toBe(false);
    expect(
      seriesHasValidData([
        {
          color: '#000',
          data: [{ x: 0, y: undefined as unknown as number }],
          id: 'invalid',
          label: 'Invalid',
        },
      ]),
    ).toBe(false);
    expect(
      seriesHasValidData([{ color: '#000', data: [{ x: 0, y: 1 }], id: 'valid', label: 'Valid' }]),
    ).toBe(true);
  });
});

describe('createTimeXScale', () => {
  it('maps the date domain onto [0, availableWidth]', () => {
    const dates = [new Date('2026-01-01'), new Date('2026-01-31')];
    const scale = createTimeXScale(dates, 300);
    expect(scale(dates[0])).toBe(0);
    expect(scale(dates[1])).toBe(300);
  });
});

describe('createLinearYScale', () => {
  it('returns a fixed [1,5] domain for rating metrics, oriented top-down', () => {
    const scale = createLinearYScale([], 100, true);
    expect(scale(1)).toBe(0);
    expect(scale(5)).toBe(100);
  });

  it('returns a [0, max] domain with .nice() for non-rating metrics, oriented bottom-up', () => {
    const scale = createLinearYScale([0, 17], 100, false);
    expect(scale(0)).toBe(100);
    const [domainMin, domainMax] = scale.domain();
    expect(domainMin).toBe(0);
    expect(domainMax).toBeGreaterThanOrEqual(17);
  });

  it('treats an empty values array as max 0', () => {
    const scale = createLinearYScale([], 100, false);
    expect(scale.domain()).toEqual([0, 0]);
  });
});

describe('useChartDimensions', () => {
  beforeEach(() => {
    setContainerSize(400, 240);
  });

  it('reads dimensions from the ref element once mounted and not pending', () => {
    const ref = createRef<HTMLDivElement>();
    const element = document.createElement('div');
    Object.defineProperty(ref, 'current', { value: element, writable: false });

    const { result } = renderHook(() => useChartDimensions(ref, false));

    expect(result.current).toEqual({ height: 240, width: 400 });
  });

  it('stays at zero dimensions while pending', () => {
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', {
      value: document.createElement('div'),
      writable: false,
    });

    const { result } = renderHook(() => useChartDimensions(ref, true));

    expect(result.current).toEqual({ height: 0, width: 0 });
  });

  it('picks up dimensions when pending flips from true to false', () => {
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', {
      value: document.createElement('div'),
      writable: false,
    });

    const { result, rerender } = renderHook(
      ({ pending }: { pending: boolean }) => useChartDimensions(ref, pending),
      { initialProps: { pending: true } },
    );

    expect(result.current).toEqual({ height: 0, width: 0 });

    rerender({ pending: false });

    expect(result.current).toEqual({ height: 240, width: 400 });
  });

  it('falls back to window resize listener when ResizeObserver is unavailable', () => {
    withResizeObserverUndefined(() => {
      const addEventListenerSpy = jest.spyOn(globalThis, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(globalThis, 'removeEventListener');

      const ref = createRef<HTMLDivElement>();
      Object.defineProperty(ref, 'current', {
        value: document.createElement('div'),
        writable: false,
      });

      const { unmount } = renderHook(() => useChartDimensions(ref, false));
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  it('does nothing when the ref has no element', () => {
    const ref = createRef<HTMLDivElement>();
    const { result } = renderHook(() => useChartDimensions(ref, false));
    expect(result.current).toEqual({ height: 0, width: 0 });
  });
});
