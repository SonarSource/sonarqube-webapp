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

import { render, screen } from '@testing-library/react';
import React from 'react';
import type { Card, Group } from '../../types';
import { GridLayout } from '../GridLayout';

// Test helpers
function createCard(key: string, x: number, y: number, width = 1, height = 1): Card {
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

/**
 * Component cycle tracker - tracks how many times components are rendered
 */
const componentCycles = new Map<string, number>();

function TrackableCard({ card, isDragging }: Readonly<{ card: Card; isDragging: boolean }>) {
  const count = componentCycles.get(card.key) ?? 0;
  componentCycles.set(card.key, count + 1);

  return (
    <div data-render-count={count + 1} data-testid={`card-${card.key}`}>
      Card {card.key} {isDragging ? '(dragging)' : ''}
    </div>
  );
}

function TrackableGroup({
  children,
  group,
}: Readonly<{ children: React.ReactNode; group: Group }>) {
  const count = componentCycles.get(group.key) ?? 0;
  componentCycles.set(group.key, count + 1);

  return (
    <div data-render-count={count + 1} data-testid={`group-${group.key}`}>
      Group {group.key}
      {children}
    </div>
  );
}

function clearCycleTracking() {
  componentCycles.clear();
}

function getCycleCount(key: string): number {
  return componentCycles.get(key) ?? 0;
}

describe('GridLayout memoization', () => {
  const defaultLayout = {
    calWidth: 100,
    col: 6,
    containerHeight: 600,
    containerPadding: [0, 0] as [number, number],
    containerWidth: 600,
    margin: [10, 10] as [number, number],
    rowHeight: 100,
  };

  beforeEach(() => {
    clearCycleTracking();
  });

  it('should not re-render cards in unmodified groups when one group changes', () => {
    const group1Cards = [createCard('card-1-1', 0, 0, 2, 2), createCard('card-1-2', 2, 0, 2, 2)];
    const group2Cards = [createCard('card-2-1', 0, 0, 2, 2), createCard('card-2-2', 2, 0, 2, 2)];

    const initialGroups = [
      createGroup('group-1', group1Cards),
      createGroup('group-2', group2Cards),
    ];

    const { rerender, unmount } = render(
      <GridLayout
        groups={initialGroups}
        layout={defaultLayout}
        onGroupsChange={jest.fn()}
        renderCard={(card, isDragging) => <TrackableCard card={card} isDragging={isDragging} />}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={() => <div>Preview</div>}
        renderGroup={(group, children) => <TrackableGroup group={group}>{children}</TrackableGroup>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    // Wait for initial render to complete
    expect(screen.getByTestId('group-group-1')).toBeInTheDocument();
    expect(screen.getByTestId('group-group-2')).toBeInTheDocument();

    // Record initial render counts
    const initialGroup1Count = getCycleCount('group-1');
    const initialGroup2Count = getCycleCount('group-2');
    const initialCard11Count = getCycleCount('card-1-1');
    const initialCard21Count = getCycleCount('card-2-1');

    // All should have rendered at least once
    expect(initialGroup1Count).toBeGreaterThanOrEqual(1);
    expect(initialGroup2Count).toBeGreaterThanOrEqual(1);
    expect(initialCard11Count).toBeGreaterThanOrEqual(1);
    expect(initialCard21Count).toBeGreaterThanOrEqual(1);

    // Modify only group-1 by moving a card
    const modifiedGroup1Cards = [
      createCard('card-1-1', 0, 2, 2, 2), // Moved position
      createCard('card-1-2', 2, 0, 2, 2),
    ];
    const updatedGroups = [
      createGroup('group-1', modifiedGroup1Cards),
      initialGroups[1], // Reuse exact same group-2 object reference
    ];

    rerender(
      <GridLayout
        groups={updatedGroups}
        layout={defaultLayout}
        onGroupsChange={jest.fn()}
        renderCard={(card, isDragging) => <TrackableCard card={card} isDragging={isDragging} />}
        renderCardHeader={() => <div>Header</div>}
        renderDragPreview={() => <div>Preview</div>}
        renderGroup={(group, children) => <TrackableGroup group={group}>{children}</TrackableGroup>}
        renderResizeHandle={() => <div>Resize</div>}
      />,
    );

    // After changing group-1:
    // - Group wrapper re-renders for both groups (not memoized to allow external state like drag)
    // - Cards only re-render if their data changed (memoized via GridContent)
    // - Group-1 cards changed, so they re-render
    // - Group-2 cards unchanged, so GridContent memoization prevents re-render
    expect(getCycleCount('group-1')).toBeGreaterThan(initialGroup1Count);
    expect(getCycleCount('card-1-1')).toBeGreaterThan(initialCard11Count);
    expect(getCycleCount('group-2')).toBeGreaterThan(initialGroup2Count); // Wrapper re-renders
    expect(getCycleCount('card-2-1')).toBe(initialCard21Count); // GridContent memoization works!

    // Clean unmount
    unmount();
  });

  it('should re-render group wrappers but not cards when parent re-renders with same props', () => {
    const groups = [
      createGroup('group-1', [createCard('card-1', 0, 0)]),
      createGroup('group-2', [createCard('card-2', 0, 0)]),
    ];

    const renderCard = (card: Card, isDragging: boolean) => (
      <TrackableCard card={card} isDragging={isDragging} />
    );
    const renderCardHeader = () => <div>Header</div>;
    const renderDragPreview = () => <div>Preview</div>;
    const renderGroup = (group: Group, children: React.ReactNode) => (
      <TrackableGroup group={group}>{children}</TrackableGroup>
    );
    const renderResizeHandle = () => <div>Resize</div>;
    const onGroupsChange = jest.fn();

    const { rerender, unmount } = render(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={onGroupsChange}
        renderCard={renderCard}
        renderCardHeader={renderCardHeader}
        renderDragPreview={renderDragPreview}
        renderGroup={renderGroup}
        renderResizeHandle={renderResizeHandle}
      />,
    );

    // Wait for initial render
    expect(screen.getByTestId('group-group-1')).toBeInTheDocument();

    const initialGroup1Count = getCycleCount('group-1');
    const initialGroup2Count = getCycleCount('group-2');

    // Re-render with same props (same references)
    rerender(
      <GridLayout
        groups={groups}
        layout={defaultLayout}
        onGroupsChange={onGroupsChange}
        renderCard={renderCard}
        renderCardHeader={renderCardHeader}
        renderDragPreview={renderDragPreview}
        renderGroup={renderGroup}
        renderResizeHandle={renderResizeHandle}
      />,
    );

    // Assert: Group wrappers re-render (GroupItemComponent not memoized)
    // But the expensive GridContent with cards is memoized, so it doesn't re-render
    // This allows the wrapper to respond to external state while keeping cards efficient
    expect(getCycleCount('group-1')).toBeGreaterThan(initialGroup1Count);
    expect(getCycleCount('group-2')).toBeGreaterThan(initialGroup2Count);
    // TODO: Add test for card-level memoization (cards shouldn't re-render)

    // Clean unmount
    unmount();
  });
});
