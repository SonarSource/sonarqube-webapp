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

import { act, renderHook } from '@testing-library/react';
import type { Card, Group } from '../../../types';
import { useKeyboardResize } from '../useKeyboardResize';

// Test helpers
function createCard(key: string, x: number, y: number, width = 1, height = 1): Card {
  return {
    dimensions: { height, width },
    key,
    position: { x, y },
  };
}

function createGroup(key: string, cards: Card[]): Group<Card> {
  return {
    children: cards,
    key,
  };
}

describe('useKeyboardResize', () => {
  const defaultProps = {
    card: createCard('card-1', 0, 0, 2, 2),
    cardKey: 'card-1',
    dimensions: { height: 2, width: 2 },
    getGroups: jest.fn(() => [
      createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)]),
    ]) as () => Group<Card>[],
    groupKey: 'group-1',
    isKeyboardDragging: false,
    maxSize: { height: 6, width: 6 },
    maxWidthInGrid: 6,
    minSize: { height: 1, width: 1 },
    onResizeStop: jest.fn(),
    registerKeyboardResizeCancel: jest.fn(),
    unregisterKeyboardResizeCancel: jest.fn(),
    updateGroupList: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not be resizing initially', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    expect(result.current.isKeyboardResizing).toBe(false);
    expect(result.current.keyboardResizeDimensions).toBeNull();
  });

  it('should start keyboard resize on Enter key', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardResizing).toBe(true);
    expect(result.current.keyboardResizeDimensions).toEqual({ h: 2, w: 2 });
  });

  it('should not start resize when already keyboard dragging', () => {
    const props = { ...defaultProps, isKeyboardDragging: true };
    const { result } = renderHook(() => useKeyboardResize(props));

    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardResizing).toBe(false);
  });

  it('should increase width with ArrowRight', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions?.w).toBe(2);

    // Increase width
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowRight',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions?.w).toBe(3);
    expect(defaultProps.updateGroupList).toHaveBeenCalled();
  });

  it('should decrease width with ArrowLeft', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Decrease width
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowLeft',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions?.w).toBe(1);
    expect(defaultProps.updateGroupList).toHaveBeenCalled();
  });

  it('should not decrease width below minimum', () => {
    const props = {
      ...defaultProps,
      dimensions: { height: 2, width: 1 },
      card: createCard('card-1', 0, 0, 1, 2),
    };
    const { result } = renderHook(() => useKeyboardResize(props));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions?.w).toBe(1);

    // Try to decrease width below minimum
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowLeft',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Should stay at minimum
    expect(result.current.keyboardResizeDimensions?.w).toBe(1);
  });

  it('should not increase width beyond maximum', () => {
    const props = {
      ...defaultProps,
      dimensions: { height: 2, width: 6 },
      card: createCard('card-1', 0, 0, 6, 2),
      maxWidthInGrid: 6,
    };
    const { result } = renderHook(() => useKeyboardResize(props));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions?.w).toBe(6);

    // Try to increase width beyond maximum
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowRight',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Should stay at maximum
    expect(result.current.keyboardResizeDimensions?.w).toBe(6);
  });

  it('should increase height with ArrowDown', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions?.h).toBe(2);

    // Increase height
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowDown',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions?.h).toBe(3);
    expect(defaultProps.updateGroupList).toHaveBeenCalled();
  });

  it('should decrease height with ArrowUp', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Decrease height
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowUp',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions?.h).toBe(1);
    expect(defaultProps.updateGroupList).toHaveBeenCalled();
  });

  it('should not decrease height below minimum', () => {
    const props = {
      ...defaultProps,
      dimensions: { height: 1, width: 2 },
      card: createCard('card-1', 0, 0, 2, 1),
    };
    const { result } = renderHook(() => useKeyboardResize(props));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions?.h).toBe(1);

    // Try to decrease height below minimum
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowUp',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Should stay at minimum
    expect(result.current.keyboardResizeDimensions?.h).toBe(1);
  });

  it('should not increase height beyond maximum', () => {
    const props = {
      ...defaultProps,
      dimensions: { height: 6, width: 2 },
      card: createCard('card-1', 0, 0, 2, 6),
    };
    const { result } = renderHook(() => useKeyboardResize(props));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions?.h).toBe(6);

    // Try to increase height beyond maximum
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowDown',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Should stay at maximum
    expect(result.current.keyboardResizeDimensions?.h).toBe(6);
  });

  it('should finalize resize on Enter', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Resize to 3x3
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowRight',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowDown',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions).toEqual({ h: 3, w: 3 });

    // Finalize with Enter
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardResizing).toBe(false);
    expect(result.current.keyboardResizeDimensions).toBeNull();
    expect(defaultProps.onResizeStop).toHaveBeenCalledWith('card-1', 'group-1', {
      height: 3,
      width: 3,
    });
  });

  it('should finalize resize on Tab', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Finalize with Tab
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Tab',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardResizing).toBe(false);
    expect(defaultProps.onResizeStop).toHaveBeenCalledWith('card-1', 'group-1', {
      height: 2,
      width: 2,
    });
  });

  it('should cancel resize on Escape', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Resize to 3x3
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowRight',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.keyboardResizeDimensions).toEqual({ h: 2, w: 3 });

    // Cancel with Escape
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Escape',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardResizing).toBe(false);
    expect(result.current.keyboardResizeDimensions).toBeNull();
    expect(defaultProps.onResizeStop).not.toHaveBeenCalled();
  });

  it('should not respond to other keys when not resizing', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    act(() => {
      result.current.handleResizeKeyDown({
        key: 'ArrowRight',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardResizing).toBe(false);
    expect(defaultProps.updateGroupList).not.toHaveBeenCalled();
  });

  it('should not respond to unhandled keys during resize', () => {
    const { result } = renderHook(() => useKeyboardResize(defaultProps));

    // Start resize
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    const initialDimensions = result.current.keyboardResizeDimensions;

    // Press an unhandled key
    act(() => {
      result.current.handleResizeKeyDown({
        key: 'a',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Dimensions should not change
    expect(result.current.keyboardResizeDimensions).toEqual(initialDimensions);
  });
});
