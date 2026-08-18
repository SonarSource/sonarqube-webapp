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
import { useKeyboardDrag } from '../useKeyboardDrag';

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

describe('useKeyboardDrag', () => {
  const defaultProps = {
    card: createCard('card-1', 0, 0, 2, 2),
    cardKey: 'card-1',
    clearShadowState: jest.fn(),
    col: 6,
    dimensions: { height: 2, width: 2 },
    getGroups: jest.fn(() => [
      createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)]),
    ]) as () => Group<Card>[],
    getShadowState: jest.fn(() => null),
    groupKey: 'group-1',
    isKeyboardResizing: false,
    isResizing: false,
    position: { x: 0, y: 0 },
    registerKeyboardDragCancel: jest.fn(),
    unregisterKeyboardDragCancel: jest.fn(),
    updateGroupList: jest.fn(),
    updateShadowState: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not be dragging initially', () => {
    const { result } = renderHook(() => useKeyboardDrag(defaultProps));

    expect(result.current.isKeyboardDragging).toBe(false);
  });

  it('should start keyboard drag on Enter key', () => {
    const { result } = renderHook(() => useKeyboardDrag(defaultProps));

    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardDragging).toBe(true);
    expect(defaultProps.updateShadowState).toHaveBeenCalledWith(
      expect.objectContaining({
        groupKey: 'group-1',
        sourceGroupKey: 'group-1',
      }),
    );
    expect(defaultProps.registerKeyboardDragCancel).toHaveBeenCalledWith(
      'card-1',
      expect.any(Function),
    );
  });

  it('should not start drag when already resizing', () => {
    const props = { ...defaultProps, isResizing: true };
    const { result } = renderHook(() => useKeyboardDrag(props));

    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardDragging).toBe(false);
  });

  it('should not start drag when keyboard resizing', () => {
    const props = { ...defaultProps, isKeyboardResizing: true };
    const { result } = renderHook(() => useKeyboardDrag(props));

    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardDragging).toBe(false);
  });

  it('should cancel drag on Escape', () => {
    const { result } = renderHook(() => useKeyboardDrag(defaultProps));

    // Start drag
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardDragging).toBe(true);

    // Cancel with Escape
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Escape',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardDragging).toBe(false);
    expect(defaultProps.clearShadowState).toHaveBeenCalled();
  });

  it('should finalize drag on second Enter', () => {
    const mockShadowState = {
      card: createCard('card-1', 2, 0, 2, 2),
      groupKey: 'group-1',
      sourceGroupKey: 'group-1',
    };
    const props = {
      ...defaultProps,
      getShadowState: jest.fn(() => mockShadowState),
    };
    const { result } = renderHook(() => useKeyboardDrag(props));

    // Start drag
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Finalize with Enter
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.isKeyboardDragging).toBe(false);
    expect(defaultProps.updateGroupList).toHaveBeenCalled();
    expect(defaultProps.clearShadowState).toHaveBeenCalled();
  });

  it('should move left with ArrowLeft', () => {
    const props = {
      ...defaultProps,
      position: { x: 2, y: 0 },
      card: createCard('card-1', 2, 0, 2, 2),
    };
    const { result } = renderHook(() => useKeyboardDrag(props));

    // Start drag
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Move left
    act(() => {
      result.current.handleDragKeyDown({
        key: 'ArrowLeft',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Should have called updateGroupList with new position
    expect(defaultProps.updateGroupList).toHaveBeenCalled();
  });

  it('should not move left past boundary', () => {
    const props = {
      ...defaultProps,
      position: { x: 0, y: 0 },
    };
    const { result } = renderHook(() => useKeyboardDrag(props));

    // Start drag
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Clear mock to check if it's NOT called again
    defaultProps.updateGroupList.mockClear();

    // Try to move left (should stay at 0)
    act(() => {
      result.current.handleDragKeyDown({
        key: 'ArrowLeft',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Should not call updateGroupList since position didn't change
    expect(defaultProps.updateGroupList).not.toHaveBeenCalled();
  });

  it('should move right with ArrowRight', () => {
    const { result } = renderHook(() => useKeyboardDrag(defaultProps));

    // Start drag
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Move right
    act(() => {
      result.current.handleDragKeyDown({
        key: 'ArrowRight',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(defaultProps.updateGroupList).toHaveBeenCalled();
  });

  it('should not move right past boundary', () => {
    const props = {
      ...defaultProps,
      position: { x: 4, y: 0 }, // At x=4 with width=2, can't go right (4+2=6=col)
      card: createCard('card-1', 4, 0, 2, 2),
    };
    const { result } = renderHook(() => useKeyboardDrag(props));

    // Start drag
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    defaultProps.updateGroupList.mockClear();

    // Try to move right
    act(() => {
      result.current.handleDragKeyDown({
        key: 'ArrowRight',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(defaultProps.updateGroupList).not.toHaveBeenCalled();
  });

  it('should move down with ArrowDown', () => {
    const { result } = renderHook(() => useKeyboardDrag(defaultProps));

    // Start drag
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Move down
    act(() => {
      result.current.handleDragKeyDown({
        key: 'ArrowDown',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(defaultProps.updateGroupList).toHaveBeenCalled();
  });

  it('should move up with ArrowUp', () => {
    const props = {
      ...defaultProps,
      position: { x: 0, y: 2 },
      card: createCard('card-1', 0, 2, 2, 2),
    };
    const { result } = renderHook(() => useKeyboardDrag(props));

    // Start drag
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Move up
    act(() => {
      result.current.handleDragKeyDown({
        key: 'ArrowUp',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(defaultProps.updateGroupList).toHaveBeenCalled();
  });

  it('should unregister cancel on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardDrag(defaultProps));

    unmount();

    expect(defaultProps.unregisterKeyboardDragCancel).toHaveBeenCalledWith('card-1');
  });

  it('should move to previous group on ArrowUp at y=0', () => {
    const groups = [
      createGroup('group-1', [createCard('card-a', 0, 0, 2, 2)]),
      createGroup('group-2', [createCard('card-1', 0, 0, 2, 2)]),
    ];
    const props = {
      ...defaultProps,
      card: createCard('card-1', 0, 0, 2, 2),
      getGroups: jest.fn(() => groups),
      groupKey: 'group-2',
      position: { x: 0, y: 0 },
    };
    const { result } = renderHook(() => useKeyboardDrag(props));

    // Start drag
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Move up (should go to previous group)
    act(() => {
      result.current.handleDragKeyDown({
        key: 'ArrowUp',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Should update groups with card moved to group-1
    expect(props.updateGroupList).toHaveBeenCalled();
    expect(props.updateShadowState).toHaveBeenCalledWith(
      expect.objectContaining({
        groupKey: 'group-1',
      }),
    );
  });

  it('should move to next group on ArrowDown at max row', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)]),
      createGroup('group-2', [createCard('card-b', 0, 0, 2, 2)]),
    ];
    const props = {
      ...defaultProps,
      card: createCard('card-1', 0, 0, 2, 2),
      getGroups: jest.fn(() => groups),
      groupKey: 'group-1',
      position: { x: 0, y: 0 },
    };
    const { result } = renderHook(() => useKeyboardDrag(props));

    // Start drag
    act(() => {
      result.current.handleDragKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Move down past the bottom of group-1 (card height is 2, so max row is 1)
    // First move puts us at y=1
    act(() => {
      result.current.handleDragKeyDown({
        key: 'ArrowDown',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    // Second move should go to next group at y=0
    act(() => {
      result.current.handleDragKeyDown({
        key: 'ArrowDown',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(props.updateShadowState).toHaveBeenCalledWith(
      expect.objectContaining({
        groupKey: 'group-2',
      }),
    );
  });
});
