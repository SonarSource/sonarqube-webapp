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

/* eslint-disable testing-library/no-node-access */
/* eslint-disable jest-dom/prefer-to-have-text-content */
/* eslint-disable jest-dom/prefer-to-have-attribute */

import { renderHook } from '@testing-library/react';
import { useGlobalCursor } from '../useGlobalCursor';

describe('useGlobalCursor', () => {
  afterEach(() => {
    // Clean up any style elements that might have been left behind
    document.querySelectorAll('style[data-global-cursor]').forEach((el) => {
      el.remove();
    });
  });

  it('should not add style element when isActive is false', () => {
    renderHook(() => {
      useGlobalCursor(false, 'grabbing');
    });

    const styleElements = document.querySelectorAll('style[data-global-cursor]');
    expect(styleElements).toHaveLength(0);
  });

  it('should add style element when isActive is true', () => {
    renderHook(() => {
      useGlobalCursor(true, 'grabbing');
    });

    const styleElements = document.querySelectorAll('style[data-global-cursor]');
    expect(styleElements).toHaveLength(1);
    expect(styleElements[0].textContent).toContain('cursor: grabbing !important');
  });

  it.each([
    ['nwse-resize', 'cursor: nwse-resize !important'],
    ['grabbing', '*, *::before, *::after'],
    ['grabbing', '!important'],
  ])('should have style containing expected content (%s)', (cursor, expectedContent) => {
    renderHook(() => {
      useGlobalCursor(true, cursor);
    });

    const styleElements = document.querySelectorAll('style[data-global-cursor]');
    expect(styleElements[0].textContent).toContain(expectedContent);
  });

  it('should remove style element when isActive becomes false', () => {
    const { rerender } = renderHook(
      ({ isActive, cursor }) => {
        useGlobalCursor(isActive, cursor);
      },
      {
        initialProps: { isActive: true, cursor: 'grabbing' },
      },
    );

    expect(document.querySelectorAll('style[data-global-cursor]')).toHaveLength(1);

    rerender({ isActive: false, cursor: 'grabbing' });

    expect(document.querySelectorAll('style[data-global-cursor]')).toHaveLength(0);
  });

  it('should remove style element on unmount', () => {
    const { unmount } = renderHook(() => {
      useGlobalCursor(true, 'grabbing');
    });

    expect(document.querySelectorAll('style[data-global-cursor]')).toHaveLength(1);

    unmount();

    expect(document.querySelectorAll('style[data-global-cursor]')).toHaveLength(0);
  });

  it('should update cursor when cursor value changes', () => {
    const { rerender } = renderHook(
      ({ isActive, cursor }) => {
        useGlobalCursor(isActive, cursor);
      },
      {
        initialProps: { isActive: true, cursor: 'grabbing' },
      },
    );

    let styleElements = document.querySelectorAll('style[data-global-cursor]');
    expect(styleElements[0].textContent).toContain('cursor: grabbing !important');

    rerender({ isActive: true, cursor: 'nwse-resize' });

    styleElements = document.querySelectorAll('style[data-global-cursor]');
    expect(styleElements[0].textContent).toContain('cursor: nwse-resize !important');
  });

  it('should handle multiple cursor types', () => {
    const cursors = ['grabbing', 'nwse-resize', 'move', 'pointer', 'not-allowed'];

    cursors.forEach((cursor) => {
      const { unmount } = renderHook(() => {
        useGlobalCursor(true, cursor);
      });

      const styleElements = document.querySelectorAll('style[data-global-cursor]');
      expect(styleElements[0].textContent).toContain(`cursor: ${cursor} !important`);

      unmount();
    });
  });

  it('should not add multiple style elements when rerendered with same values', () => {
    const { rerender } = renderHook(
      ({ isActive, cursor }) => {
        useGlobalCursor(isActive, cursor);
      },
      {
        initialProps: { isActive: true, cursor: 'grabbing' },
      },
    );

    expect(document.querySelectorAll('style[data-global-cursor]')).toHaveLength(1);

    rerender({ isActive: true, cursor: 'grabbing' });

    // Should still be just one element (old one removed, new one added)
    expect(document.querySelectorAll('style[data-global-cursor]')).toHaveLength(1);
  });

  it('should handle rapid toggling of isActive', () => {
    const { rerender } = renderHook(
      ({ isActive, cursor }) => {
        useGlobalCursor(isActive, cursor);
      },
      {
        initialProps: { isActive: false, cursor: 'grabbing' },
      },
    );

    expect(document.querySelectorAll('style[data-global-cursor]')).toHaveLength(0);

    rerender({ isActive: true, cursor: 'grabbing' });
    expect(document.querySelectorAll('style[data-global-cursor]')).toHaveLength(1);

    rerender({ isActive: false, cursor: 'grabbing' });
    expect(document.querySelectorAll('style[data-global-cursor]')).toHaveLength(0);

    rerender({ isActive: true, cursor: 'grabbing' });
    expect(document.querySelectorAll('style[data-global-cursor]')).toHaveLength(1);
  });

  it('should add data attribute to style element for identification', () => {
    renderHook(() => {
      useGlobalCursor(true, 'grabbing');
    });

    const styleElements = document.querySelectorAll('style[data-global-cursor]');
    expect(styleElements[0].getAttribute('data-global-cursor')).toBe('true');
  });
});
