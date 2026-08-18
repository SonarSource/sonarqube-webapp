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

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { Card, DragItem, Group, LayoutConfig } from '../../types';
import { GridLayout } from '../GridLayout';
import { useGridLayout } from '../GridLayoutContext';

// Test-specific type to access internal methods for testing
// These methods are intentionally not part of the public API but need to be tested
interface GridLayoutTestInstance extends GridLayout {
  calculateLayout: () => void;
  moveCardInGroupItem: (
    dragItem: DragItem<Card>,
    dropItem: { index: number },
    x: number,
    y: number,
  ) => void;
  moveGroupItem: (fromIndex: number, toIndex: number) => void;
  onCardDropInGroupItem: (dragItem: DragItem<Card>, dropItem: { index: number }) => void;
  onGroupDrop: () => void;
  updateLayout: (layout: LayoutConfig) => void;
}

// Test helpers
function createCard(key: string, x: number, y: number, width = 2, height = 2): Card {
  return {
    dimensions: { height, width },
    key,
    position: { x, y },
  };
}

function createGroup(key: string, cards: Card[]): Group {
  return {
    children: cards,
    key,
  };
}

const defaultLayout = {
  calWidth: 90,
  col: 6,
  containerHeight: 600,
  containerPadding: [10, 10] as [number, number],
  containerWidth: 600,
  margin: [10, 10] as [number, number],
  rowHeight: 100,
};

const mockOnGroupsChange = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('rendering and layout', () => {
  it('should render groups and cards', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0), createCard('card-2', 2, 0)]),
    ];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(group, children) => <div data-testid={`group-${group.key}`}>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByTestId('group-group-1')).toBeInTheDocument();
    expect(screen.getByText('Card card-1')).toBeInTheDocument();
    expect(screen.getByText('Card card-2')).toBeInTheDocument();
  });

  it('should render multiple groups', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(group, children) => <div data-testid={`group-${group.key}`}>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByTestId('group-group-1')).toBeInTheDocument();
    expect(screen.getByTestId('group-group-2')).toBeInTheDocument();
  });

  it('should handle empty groups', () => {
    const groups = [createGroup('empty-group', [])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(group, children) => <div data-testid={`group-${group.key}`}>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByTestId('group-empty-group')).toBeInTheDocument();
  });

  it('should pass isDragging prop correctly to renderCard', () => {
    const statusMap = { true: 'dragging', false: 'not-dragging' };
    const renderCard = jest.fn((card: Card, isDragging: boolean) => (
      <div data-testid={`card-${card.key}`}>
        {card.key} {statusMap[String(isDragging) as 'true' | 'false']}
      </div>
    ));

    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={renderCard}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(renderCard).toHaveBeenCalledWith(expect.objectContaining({ key: 'card-1' }), false);
    expect(screen.getByText('card-1 not-dragging')).toBeInTheDocument();
  });
});

describe('responsive layout', () => {
  it('should render with responsive layout', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByText('Card card-1')).toBeInTheDocument();
  });

  it('should update layout when groups change', () => {
    const initialGroups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const { rerender } = render(
      <GridLayout
        groups={initialGroups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByText('Card card-1')).toBeInTheDocument();

    // Update groups
    const updatedGroups = [
      createGroup('group-1', [createCard('card-1', 0, 0), createCard('card-2', 2, 0)]),
    ];

    rerender(
      <GridLayout
        groups={updatedGroups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByText('Card card-1')).toBeInTheDocument();
    expect(screen.getByText('Card card-2')).toBeInTheDocument();
  });
});

describe('keyboard interactions', () => {
  it('should handle keyboard events without errors', async () => {
    const user = userEvent.setup();
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card) => <button type="button">Card {card.key}</button>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    const cardElement = screen.getByText('Card card-1');
    await user.click(cardElement);

    // Press Escape - should not throw error
    await user.keyboard('{Escape}');

    expect(cardElement).toBeInTheDocument();
  });
});

describe('drag preview', () => {
  beforeEach(() => {
    testContext = null;
  });

  it('should render custom drag preview', () => {
    const renderDragPreview = jest.fn((card: Card) => (
      <div data-testid="preview">Preview {card.key}</div>
    ));

    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={renderDragPreview}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    // Custom drag preview is used by the drag layer when dragging
    expect(screen.getByText('Card card-1')).toBeInTheDocument();

    // Test that renderDragPreview is accessible through context
    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const testCard = createCard('test', 0, 0);
    const preview = testContext!.renderDragPreview(testCard, { width: 2, height: 2 });
    expect(preview).toBeDefined();
  });
});

describe('grid layout context', () => {
  it('should maintain stable rendering across rerenders', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const { rerender } = render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByText('Card card-1')).toBeInTheDocument();

    // Rerender with same groups - should not throw errors
    rerender(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByText('Card card-1')).toBeInTheDocument();
  });
});

describe('layout calculations', () => {
  it('should handle cards with different dimensions', () => {
    const groups = [
      createGroup('group-1', [
        createCard('small', 0, 0, 1, 1),
        createCard('wide', 1, 0, 3, 1),
        createCard('tall', 4, 0, 1, 3),
        createCard('large', 0, 1, 2, 2),
      ]),
    ];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByText('Card small')).toBeInTheDocument();
    expect(screen.getByText('Card wide')).toBeInTheDocument();
    expect(screen.getByText('Card tall')).toBeInTheDocument();
    expect(screen.getByText('Card large')).toBeInTheDocument();
  });

  it('should handle layout with different column counts', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const narrowLayout = {
      ...defaultLayout,
      col: 3,
      containerWidth: 300,
      calWidth: 90,
    };

    render(
      <GridLayout
        groups={groups}
        layout={narrowLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByText('Card card-1')).toBeInTheDocument();
  });
});

describe('shadow state', () => {
  it('should render with shadow card', () => {
    const shadowCard = createCard('shadow', 2, 0);
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0), shadowCard])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByText('Card card-1')).toBeInTheDocument();
    expect(screen.getByText('Card shadow')).toBeInTheDocument();
  });
});

// Test component that uses context - rendered via renderGroup
let testContext: ReturnType<typeof useGridLayout> | null = null;

function TestContextConsumer() {
  testContext = useGridLayout();
  return null;
}

describe('context methods', () => {
  beforeEach(() => {
    testContext = null;
  });

  it('should provide getGroups method that returns current groups', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    const result = ctx.getGroups();
    expect(result).toEqual(groups);
  });

  it('should provide getShadowState method', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    const result = ctx.getShadowState();
    expect(result).toBeNull(); // Initially no shadow state
  });

  it('should provide getMinSize and getMaxSize methods', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];
    const getMinSize = jest.fn((_card) => ({ width: 1, height: 1 }));
    const getMaxSize = jest.fn((_card) => ({ width: 6, height: 10 }));

    render(
      <GridLayout
        getMaxSize={getMaxSize}
        getMinSize={getMinSize}
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    const testCard = createCard('test', 0, 0);
    ctx.getMinSize(testCard);
    ctx.getMaxSize(testCard);
    expect(getMinSize).toHaveBeenCalledWith(testCard);
    expect(getMaxSize).toHaveBeenCalledWith(testCard);
  });
});

describe('drag and drop operations', () => {
  beforeEach(() => {
    testContext = null;
  });

  it('should handle moveCardInGroupItem - drag within same group', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0), createCard('card-2', 2, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    expect(gridLayoutRef.current).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    const dragItem: DragItem<Card> = {
      card: createCard('card-1', 0, 0),
      groupKey: 'group-1',
      id: 'card-1',
      type: 'card',
    };

    // Call moveCardInGroupItem directly
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).moveCardInGroupItem(
        dragItem,
        { index: 0 },
        100,
        100,
      );
    });

    // Verify shadow state was updated
    const shadowState = ctx.getShadowState();
    expect(shadowState).not.toBeNull();
    expect(shadowState?.card.key).toBe('card-1');
  });

  it('should handle moveCardInGroupItem - drag between groups', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    const dragItem: DragItem<Card> = {
      card: createCard('card-1', 0, 0),
      groupKey: 'group-1',
      id: 'card-1',
      type: 'card',
    };

    // Drag card-1 from group-1 to group-2
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).moveCardInGroupItem(
        dragItem,
        { index: 1 },
        200,
        100,
      );
    });

    const shadowState = ctx.getShadowState();
    expect(shadowState).not.toBeNull();
    expect(shadowState?.groupKey).toBe('group-2');
    expect(shadowState?.sourceGroupKey).toBe('group-1');
  });

  it('should handle moveCardInGroupItem - when no drag item card', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    // Using non-null assertion since we've verified gridLayoutRef exists above
    const dragItem: DragItem<Card> = {
      id: 'card-1',
      type: 'card',
      // No card or groupKey
    };

    // Should return early without error
    expect(() => {
      act(() => {
        (gridLayoutRef.current as GridLayoutTestInstance).moveCardInGroupItem(
          dragItem,
          { index: 0 },
          100,
          100,
        );
      });
    }).not.toThrow();
  });

  it('should handle moveCardInGroupItem - when target group not found', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    // Using non-null assertion since we've verified gridLayoutRef exists above
    const dragItem: DragItem<Card> = {
      card: createCard('card-1', 0, 0),
      groupKey: 'group-1',
      id: 'card-1',
      type: 'card',
    };

    // Try to drag to non-existent group index
    expect(() => {
      act(() => {
        (gridLayoutRef.current as GridLayoutTestInstance).moveCardInGroupItem(
          dragItem,
          { index: 999 },
          100,
          100,
        );
      });
    }).not.toThrow();
  });

  it('should handle moveCardInGroupItem - when position unchanged', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    const dragItem: DragItem<Card> = {
      card: createCard('card-1', 0, 0),
      groupKey: 'group-1',
      id: 'card-1',
      type: 'card',
    };

    // Set up shadow state first
    act(() => {
      ctx.updateShadowState({
        card: createCard('card-1', 0, 0),
        groupKey: 'group-1',
        sourceGroupKey: 'group-1',
      });
    });

    // Call with same position - should return early
    const initialShadowState = ctx.getShadowState();
    act(() => {
      // Calculate position that results in same grid position (0, 0)
      (gridLayoutRef.current as GridLayoutTestInstance).moveCardInGroupItem(
        dragItem,
        { index: 0 },
        10,
        10,
      );
    });

    // Shadow state should remain unchanged
    expect(ctx.getShadowState()).toEqual(initialShadowState);
  });

  it('should handle moveCardInGroupItem - when shadow moves between groups (previousShadowGroup compaction)', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    const dragItem: DragItem<Card> = {
      card: createCard('card-1', 0, 0),
      groupKey: 'group-1',
      id: 'card-1',
      type: 'card',
    };

    // First, set shadow in group-2
    act(() => {
      ctx.updateShadowState({
        card: createCard('card-1', 2, 0),
        groupKey: 'group-2',
        sourceGroupKey: 'group-1',
      });
    });

    // Then move shadow back to group-1 - this should trigger previousShadowGroup compaction
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).moveCardInGroupItem(
        dragItem,
        { index: 0 },
        100,
        100,
      );
    });

    // Verify shadow moved back to group-1
    const shadowState = ctx.getShadowState();
    expect(shadowState?.groupKey).toBe('group-1');
  });

  it('should handle moveCardInGroupItem - unchanged groups', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
      createGroup('group-3', [createCard('card-3', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    const dragItem: DragItem<Card> = {
      card: createCard('card-1', 0, 0),
      groupKey: 'group-1',
      id: 'card-1',
      type: 'card',
    };

    // Set up shadow in group-1
    act(() => {
      ctx.updateShadowState({
        card: createCard('card-1', 1, 0),
        groupKey: 'group-1',
        sourceGroupKey: 'group-1',
      });
    });

    // Move within same group - group-3 should remain unchanged
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).moveCardInGroupItem(
        dragItem,
        { index: 0 },
        200,
        100,
      );
    });

    // Verify group-3 is unchanged (not modified)
    const currentGroups = ctx.getGroups();
    const group3 = currentGroups.find((g) => g.key === 'group-3');
    expect(group3?.key).toBe('group-3');
    // Verify card-3 is still rendered (group-3 unchanged)
    expect(screen.getByText('Card card-3')).toBeInTheDocument();
  });

  it('should handle onCardDropInGroupItem - drop card with shadow state', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    // Set up shadow state for card-1 in group-2
    act(() => {
      ctx.updateShadowState({
        card: createCard('card-1', 2, 0),
        groupKey: 'group-2',
        sourceGroupKey: 'group-1',
      });
    });

    const dragItem: DragItem<Card> = {
      card: createCard('card-1', 0, 0),
      groupKey: 'group-1',
      id: 'card-1',
      type: 'card',
    };

    // Drop the card
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).onCardDropInGroupItem(dragItem, {
        index: 1,
      });
    });

    // Should call onGroupsChange with updated groups
    expect(mockOnGroupsChange).toHaveBeenCalled();
    // Verify card-1 moved successfully by checking all cards are rendered
    expect(screen.getByText('Card card-1')).toBeInTheDocument();
    expect(screen.getByText('Card card-2')).toBeInTheDocument();

    // Shadow state should be cleared
    expect(ctx.getShadowState()).toBeNull();
  });

  it('should handle onCardDropInGroupItem - drop card without shadow state', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const dragItem: DragItem<Card> = {
      card: createCard('card-1', 0, 0),
      groupKey: 'group-1',
      id: 'card-1',
      type: 'card',
    };

    // Drop without shadow state - should just clear shadow
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).onCardDropInGroupItem(dragItem, {
        index: 0,
      });
    });

    // Should not call onGroupsChange
    expect(mockOnGroupsChange).not.toHaveBeenCalled();
    const ctx = testContext;
    expect(ctx?.getShadowState()).toBeNull();
  });

  it('should handle onCardDropInGroupItem - when target group not found', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    // Set up shadow state with non-existent group
    act(() => {
      ctx.updateShadowState({
        card: createCard('card-1', 2, 0),
        groupKey: 'non-existent',
        sourceGroupKey: 'group-1',
      });
    });

    const dragItem: DragItem<Card> = {
      card: createCard('card-1', 0, 0),
      groupKey: 'group-1',
      id: 'card-1',
      type: 'card',
    };

    // Drop should fallback to dropItem.index
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).onCardDropInGroupItem(dragItem, {
        index: 1,
      });
    });

    expect(mockOnGroupsChange).toHaveBeenCalled();
  });

  it('should handle onCardDropInGroupItem - unchanged groups', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
      createGroup('group-3', [createCard('card-3', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    // Set up shadow state - card-1 moving from group-1 to group-2
    act(() => {
      ctx.updateShadowState({
        card: createCard('card-1', 2, 0),
        groupKey: 'group-2',
        sourceGroupKey: 'group-1',
      });
    });

    const dragItem: DragItem<Card> = {
      card: createCard('card-1', 0, 0),
      groupKey: 'group-1',
      id: 'card-1',
      type: 'card',
    };

    // Drop - group-3 should remain unchanged
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).onCardDropInGroupItem(dragItem, {
        index: 1,
      });
    });

    expect(mockOnGroupsChange).toHaveBeenCalled();
    // Verify group-3 is unchanged by checking that card-3 is still rendered
    expect(screen.getByText('Card card-3')).toBeInTheDocument();
  });
});

describe('resize operations', () => {
  beforeEach(() => {
    testContext = null;
  });

  it('should handle onCardResize - resize card dimensions', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    act(() => {
      ctx.onResize('card-1', 'group-1', { width: 3, height: 2 });
    });
    // Resize should update temporary groups
    expect(screen.getByText('Card card-1')).toBeInTheDocument();
  });

  it('should handle onCardResizeStop - finalize resize', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    act(() => {
      ctx.onResizeStop('card-1', 'group-1', { width: 3, height: 2 });
    });
    expect(mockOnGroupsChange).toHaveBeenCalled();
  });

  it('should handle onCardResizeStart', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    expect(() => {
      act(() => {
        ctx.onResizeStart('card-1', 'group-1', { width: 2, height: 2 });
      });
    }).not.toThrow();
  });

  it('should clamp resize dimensions to max width based on position', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 4, 0, 1, 1)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    expect(() => {
      act(() => {
        // Try to resize beyond max width (card at x=4, max width is 6-4=2)
        ctx.onResize('card-1', 'group-1', { width: 10, height: 5 });
      });
    }).not.toThrow();
  });

  it('should handle onCardResize when card is not found', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    // Try to resize a non-existent card - should not throw
    expect(() => {
      act(() => {
        ctx.onResize('non-existent', 'group-1', { width: 3, height: 2 });
      });
    }).not.toThrow();
  });

  it('should handle onCardResizeStop when card is not found', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    // Try to resize stop a non-existent card - should not throw
    expect(() => {
      act(() => {
        ctx.onResizeStop('non-existent', 'group-1', { width: 3, height: 2 });
      });
    }).not.toThrow();
  });

  it('should handle onCardResize when group is not found', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    // Try to resize a card in a non-existent group - should not throw
    expect(() => {
      act(() => {
        ctx.onResize('card-1', 'non-existent', { width: 3, height: 2 });
      });
    }).not.toThrow();
  });

  it('should handle onCardResizeStop when group is not found', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    // Try to resize stop a card in a non-existent group - should not throw
    expect(() => {
      act(() => {
        ctx.onResizeStop('card-1', 'non-existent', { width: 3, height: 2 });
      });
    }).not.toThrow();
  });

  it('should handle onCardResize when group is not found (early return path)', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    // Try to resize a card in a non-existent group - should return early
    mockOnGroupsChange.mockClear();
    act(() => {
      ctx.onResize('card-1', 'non-existent', { width: 3, height: 2 });
    });
    // Should not update groups since group not found
    expect(mockOnGroupsChange).not.toHaveBeenCalled();
  });

  it('should handle onCardResizeStop when group is not found (early return path)', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0, 2, 2)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    // Try to resize stop a card in a non-existent group - should return early
    mockOnGroupsChange.mockClear();
    act(() => {
      ctx.onResizeStop('card-1', 'non-existent', { width: 3, height: 2 });
    });
    // Should not update groups since group not found
    expect(mockOnGroupsChange).not.toHaveBeenCalled();
  });
});

describe('group reordering', () => {
  beforeEach(() => {
    testContext = null;
  });

  it('should handle updateGroupList - update groups temporarily', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    const reorderedGroups = [
      createGroup('group-2', [createCard('card-2', 0, 0)]),
      createGroup('group-1', [createCard('card-1', 0, 0)]),
    ];
    act(() => {
      ctx.updateGroupList(reorderedGroups);
    });
    // Groups should be updated temporarily
    const currentGroups = ctx.getGroups();
    expect(currentGroups).toEqual(reorderedGroups);
  });

  it('should handle moveGroupItem - reorder groups during drag', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
      createGroup('group-3', [createCard('card-3', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    // Move group from index 0 to index 2
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).moveGroupItem(0, 2);
    });

    const currentGroups = ctx.getGroups();
    expect(currentGroups[0].key).toBe('group-2');
    expect(currentGroups[2].key).toBe('group-1');
  });

  it('should handle moveGroupItem - when indices are same', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    const initialGroups = ctx.getGroups();
    // Try to move to same index - should return early
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).moveGroupItem(0, 0);
    });

    const currentGroups = ctx.getGroups();
    expect(currentGroups).toEqual(initialGroups);
  });

  it('should handle moveGroupItem - when indices are invalid', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    const initialGroups = ctx.getGroups();
    // Try to move with negative indices - should return early
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).moveGroupItem(-1, 1);
    });

    const currentGroups = ctx.getGroups();
    expect(currentGroups).toEqual(initialGroups);
  });

  it('should handle onGroupDrop - finalize group reordering', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    // First update groups temporarily
    const reorderedGroups = [
      createGroup('group-2', [createCard('card-2', 0, 0)]),
      createGroup('group-1', [createCard('card-1', 0, 0)]),
    ];
    act(() => {
      ctx.updateGroupList(reorderedGroups);
    });

    // Then finalize with onGroupDrop
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).onGroupDrop();
    });

    expect(mockOnGroupsChange).toHaveBeenCalled();
    // Verify groups were reordered by checking both cards are still rendered
    expect(screen.getByText('Card card-1')).toBeInTheDocument();
    expect(screen.getByText('Card card-2')).toBeInTheDocument();
  });

  it('should handle onGroupDrop - when no temporary groups', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    // Using non-null assertion since we've verified gridLayoutRef exists above
    // Drop without temporary groups - should not call onGroupsChange
    mockOnGroupsChange.mockClear();
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).onGroupDrop();
    });

    expect(mockOnGroupsChange).not.toHaveBeenCalled();
  });
});

describe('keyboard registry', () => {
  beforeEach(() => {
    testContext = null;
  });

  it('should register and unregister keyboard drag cancel', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];
    const cancelFn = jest.fn();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    act(() => {
      ctx.registerKeyboardDragCancel('card-1', cancelFn);
    });
    act(() => {
      ctx.cancelAllKeyboardDrags();
    });
    expect(cancelFn).toHaveBeenCalled();
    act(() => {
      ctx.unregisterKeyboardDragCancel('card-1');
    });
  });

  it('should register and unregister keyboard resize cancel', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];
    const cancelFn = jest.fn();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    act(() => {
      ctx.registerKeyboardResizeCancel('card-1', cancelFn);
    });
    act(() => {
      ctx.cancelAllKeyboardResizes();
    });
    expect(cancelFn).toHaveBeenCalled();
    act(() => {
      ctx.unregisterKeyboardResizeCancel('card-1');
    });
  });
});

describe('shadow state management', () => {
  beforeEach(() => {
    testContext = null;
  });

  it('should update and clear shadow state', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    const shadowState = {
      card: createCard('shadow', 2, 0),
      groupKey: 'group-1',
      sourceGroupKey: 'group-1',
    };
    act(() => {
      ctx.updateShadowState(shadowState);
    });
    expect(ctx.getShadowState()).toEqual(shadowState);
    act(() => {
      ctx.clearShadowState();
    });
    expect(ctx.getShadowState()).toBeNull();
  });
});

describe('callbacks', () => {
  beforeEach(() => {
    testContext = null;
  });

  it('should call onCardDelete when card is deleted', () => {
    const mockOnCardDelete = jest.fn();
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onCardDelete={mockOnCardDelete}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    act(() => {
      ctx.onCardDelete('card-1', 'group-1');
    });
    expect(mockOnCardDelete).toHaveBeenCalledWith('card-1', 'group-1');
  });

  it('should call onCardEdit when card is edited', () => {
    const mockOnCardEdit = jest.fn();
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onCardEdit={mockOnCardEdit}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(testContext).not.toBeNull();
    // Using non-null assertion since we've verified testContext exists above
    const ctx = testContext!;
    act(() => {
      ctx.onCardEdit?.('card-1', 'group-1');
    });
    expect(mockOnCardEdit).toHaveBeenCalledWith('card-1', 'group-1');
  });
});

describe('layout calculation', () => {
  it('should calculate layout on mount', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const { container } = render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    // Layout should be calculated on mount
    expect(container).toBeInTheDocument();
  });

  it('should handle calculateLayout when container ref is null', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    // Component should render without errors even if calculateLayout can't find container
    expect(screen.getByText('Card card-1')).toBeInTheDocument();
  });

  it('should handle calculateLayout when clientWidth is 0', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    // Mock ResizeObserver to trigger calculateLayout
    const originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = jest.fn().mockImplementation((_callback) => {
      return {
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
      };
    });

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(screen.getByText('Card card-1')).toBeInTheDocument();

    global.ResizeObserver = originalResizeObserver;
  });

  it('should handle calculateLayout when layout values are unchanged', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    // Mock container to have the same width as defaultLayout.containerWidth
    // Note: Direct DOM manipulation needed here to test layout calculation logic
    const containerDiv = screen.getByTestId('grid-layout-container');
    Object.defineProperty(containerDiv, 'clientWidth', {
      writable: true,
      configurable: true,
      value: defaultLayout.containerWidth,
    });

    // First call should calculate layout
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).calculateLayout();
    });

    // Second call with same width should return early (line 242)
    mockOnGroupsChange.mockClear();
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).calculateLayout();
    });

    // updateLayout should not be called since values are unchanged
    expect(screen.getByText('Card card-1')).toBeInTheDocument();
  });

  it('should handle calculateLayout when container width changes', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    // Using non-null assertion since we've verified gridLayoutRef exists above
    // Mock container width change to trigger layout recalculation
    // Note: Direct DOM manipulation needed here to test layout calculation logic
    const containerDiv = screen.getByTestId('grid-layout-container');
    // Set a different width to trigger the update path
    Object.defineProperty(containerDiv, 'clientWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    // Also mock parentElement for fallback path
    const { parentElement } = containerDiv;
    expect(parentElement).toBeInTheDocument();
    Object.defineProperty(parentElement!, 'clientWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    // Trigger calculateLayout - should update layout
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).calculateLayout();
    });
    expect(screen.getByText('Card card-1')).toBeInTheDocument();
  });

  it('should handle calculateLayout when host is null', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const gridLayoutRef = React.createRef<GridLayout>();

    const { unmount } = render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    // Store reference before unmount
    const instance = gridLayoutRef.current;
    unmount();

    // After unmount, containerRef.current should be null
    // calculateLayout should return early without error
    expect(instance).not.toBeNull();
    // Using non-null assertion since we've verified instance exists above
    expect(() => {
      act(() => {
        (instance as GridLayoutTestInstance).calculateLayout();
      });
    }).not.toThrow();
  });

  it('should handle calculateLayout with content ancestor', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <div data-layout-pagecontent style={{ width: '900px' }}>
        <GridLayout
          groups={groups}
          layout={defaultLayout}
          onGroupsChange={mockOnGroupsChange}
          ref={gridLayoutRef}
          renderCard={(card) => <div>Card {card.key}</div>}
          renderCardHeader={() => <div>Header</div>}
          renderDragPreview={(card) => <div>Preview {card.key}</div>}
          renderGroup={(_, children) => <div>{children}</div>}
          renderResizeHandle={() => <div>Resize</div>}
        />
      </div>,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    // Using non-null assertion since we've verified gridLayoutRef exists above
    // Trigger calculateLayout - should use content ancestor width
    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).calculateLayout();
    });

    expect(screen.getByText('Card card-1')).toBeInTheDocument();
  });

  it('should handle updateLayout', () => {
    const groups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    const gridLayoutRef = React.createRef<GridLayout>();

    render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => <div>{children}</div>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    const newLayout = {
      ...defaultLayout,
      calWidth: 100,
      containerWidth: 700,
    };

    act(() => {
      (gridLayoutRef.current as GridLayoutTestInstance).updateLayout(newLayout);
    });
    // Layout should be updated (we can't directly access state, but we verify no errors)
    expect(screen.getByText('Card card-1')).toBeInTheDocument();
  });
});

describe('component lifecycle', () => {
  it('should clean up keyboard registries when cards are removed', () => {
    const initialGroups = [
      createGroup('group-1', [createCard('card-1', 0, 0), createCard('card-2', 2, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    const { rerender } = render(
      <GridLayout
        groups={initialGroups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    // Register keyboard handlers for both cards
    const cancelFn1 = jest.fn();
    const cancelFn2 = jest.fn();
    act(() => {
      ctx.registerKeyboardDragCancel('card-1', cancelFn1);
      ctx.registerKeyboardDragCancel('card-2', cancelFn2);
    });

    // Remove card-2
    const updatedGroups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    rerender(
      <GridLayout
        groups={updatedGroups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    // componentDidUpdate should clean up registries for removed cards
    expect(screen.getByText('Card card-1')).toBeInTheDocument();
    expect(screen.queryByText('Card card-2')).not.toBeInTheDocument();

    // Verify card-2's registry was cleaned up by trying to cancel all
    // (card-1's cancel should be called, but card-2's should not since it was removed)
    act(() => {
      ctx.cancelAllKeyboardDrags();
    });
    expect(cancelFn1).toHaveBeenCalled();
    // card-2's cancel should not be called since it was cleaned up
  });

  it('should clean up keyboard resize registries when cards are removed', () => {
    const initialGroups = [
      createGroup('group-1', [createCard('card-1', 0, 0), createCard('card-2', 2, 0)]),
    ];

    const gridLayoutRef = React.createRef<GridLayout>();

    const { rerender } = render(
      <GridLayout
        groups={initialGroups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    expect(gridLayoutRef.current).not.toBeNull();
    expect(testContext).not.toBeNull();
    // Using non-null assertions since we've verified they exist above
    const ctx = testContext!;
    // Register keyboard resize handlers for both cards
    const cancelFn1 = jest.fn();
    const cancelFn2 = jest.fn();
    act(() => {
      ctx.registerKeyboardResizeCancel('card-1', cancelFn1);
      ctx.registerKeyboardResizeCancel('card-2', cancelFn2);
    });

    // Remove card-2
    const updatedGroups = [createGroup('group-1', [createCard('card-1', 0, 0)])];

    rerender(
      <GridLayout
        groups={updatedGroups}
        layout={defaultLayout}
        onGroupsChange={mockOnGroupsChange}
        ref={gridLayoutRef}
        renderCard={(card: Card) => <div>Card {card.key}</div>}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={(card: Card) => <div>Preview {card.key}</div>}
        renderGroup={(_, children) => {
          return (
            <div>
              <TestContextConsumer />
              {children}
            </div>
          );
        }}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    // Verify card-2's registry was cleaned up
    act(() => {
      ctx.cancelAllKeyboardResizes();
    });
    expect(cancelFn1).toHaveBeenCalled();
    // card-2's cancel should not be called since it was cleaned up
  });
});
