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
import { useRef } from 'react';
import { useObserveElementTruncation } from '../useObserveElementTruncation';

function stubWidths(el: HTMLElement, { clientWidth, scrollWidth }: WidthStub) {
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: clientWidth });
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: scrollWidth });
}

interface WidthStub {
  clientWidth: number;
  scrollWidth: number;
}

describe('useObserveElementTruncation', () => {
  it('returns true when scrollWidth exceeds clientWidth', () => {
    const el = document.createElement('span');
    stubWidths(el, { clientWidth: 100, scrollWidth: 150 });

    const { result } = renderHook(() => {
      const elementRef = useRef(el);
      return useObserveElementTruncation(elementRef, 'content');
    });

    expect(result.current).toBe(true);
  });

  it('returns false when scrollWidth equals clientWidth', () => {
    const el = document.createElement('span');
    stubWidths(el, { clientWidth: 100, scrollWidth: 100 });

    const { result } = renderHook(() => {
      const elementRef = useRef(el);
      return useObserveElementTruncation(elementRef, 'content');
    });

    expect(result.current).toBe(false);
  });

  it('recomputes when contentKey changes', () => {
    const el = document.createElement('span');
    stubWidths(el, { clientWidth: 100, scrollWidth: 100 });

    const { result, rerender } = renderHook(
      ({ contentKey }) => {
        const elementRef = useRef(el);
        return useObserveElementTruncation(elementRef, contentKey);
      },
      { initialProps: { contentKey: 'first' } },
    );

    expect(result.current).toBe(false);

    // Widen the content without remounting: only a contentKey change should trigger a recompute.
    stubWidths(el, { clientWidth: 100, scrollWidth: 150 });
    rerender({ contentKey: 'second' });

    expect(result.current).toBe(true);
  });
});
