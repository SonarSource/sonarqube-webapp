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

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Card, Group, Position, ShadowState } from '../../types';
import { addCardWithCollisionAndCompact } from '../../utils';
import { compactLayout } from '../../utils/compact';

/**
 * Finds the next card in the same column (same X position) below the current position.
 * Returns the Y position of the next card, or null if no card found.
 */
function findNextCardInColumn<CardType extends Card = Card>(
  group: Group<CardType>,
  currentX: number,
  currentY: number,
  cardKey: string,
): number | null {
  // Find all cards in the same column (overlapping X position) that are below currentY
  const cardsInColumn = group.children
    .filter(
      (c) =>
        c.key !== cardKey &&
        c.position.x < currentX + 1 && // Card starts before or at our X
        c.position.x + c.dimensions.width > currentX, // Card ends after our X
    )
    .filter((c) => {
      const cardTop = c.position.y;
      // Card is below current position (card top is below currentY)
      return cardTop > currentY;
    })
    .sort((a, b) => a.position.y - b.position.y); // Sort by Y position

  if (cardsInColumn.length === 0) {
    return null;
  }

  // Return the Y position of the first card below
  return cardsInColumn[0].position.y;
}

/**
 * Finds the previous card in the same column (same X position) above the current position.
 * Returns the Y position of the previous card, or null if no card found.
 */
function findPreviousCardInColumn<CardType extends Card = Card>(
  group: Group<CardType>,
  currentX: number,
  currentY: number,
  cardKey: string,
): number | null {
  // Find all cards in the same column (overlapping X position) that are above currentY
  const cardsInColumn = group.children
    .filter(
      (c) =>
        c.key !== cardKey &&
        c.position.x < currentX + 1 && // Card starts before or at our X
        c.position.x + c.dimensions.width > currentX, // Card ends after our X
    )
    .filter((c) => {
      const cardTop = c.position.y;
      // Card is above current position
      return cardTop < currentY;
    })
    .sort((a, b) => b.position.y - a.position.y); // Sort by Y position descending

  if (cardsInColumn.length === 0) {
    return null;
  }

  // Return the Y position of the first card above
  return cardsInColumn[0].position.y;
}

/**
 * Handles arrow down navigation logic for keyboard drag.
 * Extracted to reduce nesting depth.
 */
function handleArrowDownNavigation<CardType extends Card = Card>(
  groups: Group<CardType>[],
  currentTargetGroupKey: string,
  currentY: number,
  currentX: number,
  cardKey: string,
): { newY: number; targetGroupKey: string } {
  const currentGroup = groups.find((g) => g.key === currentTargetGroupKey);
  if (!currentGroup) {
    return { newY: currentY + 1, targetGroupKey: currentTargetGroupKey };
  }

  // Try to find the next card in the same column
  const nextCardY = findNextCardInColumn(currentGroup, currentX, currentY, cardKey);
  if (nextCardY !== null) {
    return { newY: nextCardY, targetGroupKey: currentTargetGroupKey };
  }

  const maxRowInGroup = currentGroup.children.reduce(
    (max, c) => Math.max(max, c.position.y + c.dimensions.height - 1),
    0,
  );

  if (currentY < maxRowInGroup) {
    return { newY: currentY + 1, targetGroupKey: currentTargetGroupKey };
  }

  // At or past max row, try moving to next group
  const currentGroupIndex = groups.findIndex((g) => g.key === currentTargetGroupKey);
  if (currentGroupIndex < groups.length - 1) {
    const nextGroup = groups[currentGroupIndex + 1];
    return { newY: 0, targetGroupKey: nextGroup.key };
  }

  // Already at last group, just increment Y
  return { newY: currentY + 1, targetGroupKey: currentTargetGroupKey };
}

/**
 * Handles arrow up navigation logic for keyboard drag.
 */
function handleArrowUpNavigation<CardType extends Card = Card>(
  groups: Group<CardType>[],
  currentTargetGroupKey: string,
  currentY: number,
  currentX: number,
  cardKey: string,
): { newY: number; targetGroupKey: string } {
  const currentGroup = groups.find((g) => g.key === currentTargetGroupKey);
  if (!currentGroup) {
    return { newY: Math.max(0, currentY - 1), targetGroupKey: currentTargetGroupKey };
  }

  // Try to find the previous card in the same column
  const prevCardY = findPreviousCardInColumn(currentGroup, currentX, currentY, cardKey);
  if (prevCardY !== null) {
    return { newY: prevCardY, targetGroupKey: currentTargetGroupKey };
  }

  if (currentY > 0) {
    return { newY: currentY - 1, targetGroupKey: currentTargetGroupKey };
  }

  // At Y=0, try moving to previous group
  const currentGroupIndex = groups.findIndex((g) => g.key === currentTargetGroupKey);
  if (currentGroupIndex > 0) {
    const prevGroup = groups[currentGroupIndex - 1];
    const maxY = prevGroup.children.reduce(
      (max, c) => Math.max(max, c.position.y + c.dimensions.height),
      0,
    );
    return { newY: maxY, targetGroupKey: prevGroup.key };
  }

  // Already at first group and Y=0
  return { newY: 0, targetGroupKey: currentTargetGroupKey };
}

/**
 * Finalizes keyboard drag - converts shadow to real card.
 */
function finalizeDragPosition<CardType extends Card = Card>(
  groups: Group<CardType>[],
  shadowState: ShadowState<CardType>,
  cardKey: string,
): Group<CardType>[] {
  return groups.map((g) => {
    if (g.key === shadowState.groupKey) {
      // Shadow is already a CardType, just add it to children
      const cardsWithoutOriginal = g.children.filter((c) => c.key !== cardKey);
      return {
        ...g,
        children: compactLayout([...cardsWithoutOriginal, shadowState.card]),
      };
    }
    const cardsWithoutOriginal = g.children.filter((c) => c.key !== cardKey);
    return {
      ...g,
      children:
        cardsWithoutOriginal.length === g.children.length
          ? g.children
          : compactLayout(cardsWithoutOriginal),
    };
  });
}

/**
 * Cancels keyboard drag - returns card to original position.
 */
function cancelDragPosition<CardType extends Card = Card>(
  groups: Group<CardType>[],
  card: CardType,
  cardKey: string,
  groupKey: string,
): Group<CardType>[] {
  return groups.map((g) => {
    if (g.key === groupKey) {
      const hasOriginal = g.children.some((c) => c.key === cardKey);
      if (hasOriginal) {
        return g;
      }
      return {
        ...g,
        children: compactLayout([...g.children, card]),
      };
    }
    return g;
  });
}

/**
 * Updates shadow position and affected groups.
 */
function updateShadowPosition<CardType extends Card = Card>(
  groups: Group<CardType>[],
  card: CardType,
  cardKey: string,
  groupKey: string,
  targetGroupKey: string,
  newX: number,
  newY: number,
): {
  shadowCard: CardType;
  updatedGroups: Group<CardType>[];
} {
  // Update shadow card position
  const shadowCard: CardType = {
    ...card,
    position: { x: newX, y: newY },
  };

  const updatedGroups = groups.map((g) => {
    const isSourceGroup = g.key === groupKey;
    const isTargetGroup = g.key === targetGroupKey;

    if (isSourceGroup && !isTargetGroup) {
      // Source group (not target): keep original card (hidden via opacity)
      // but compact other cards around it
      const otherCards = g.children.filter((c) => c.key !== cardKey);
      const originalCard = g.children.find((c) => c.key === cardKey);
      return {
        ...g,
        // Keep original card so CardComponent stays mounted for keyboard events
        children: originalCard
          ? [...compactLayout(otherCards), originalCard]
          : compactLayout(otherCards),
      };
    }

    if (isTargetGroup) {
      // Target group: run collision detection with shadow
      const otherCards = isSourceGroup ? g.children.filter((c) => c.key !== cardKey) : g.children;

      // Add shadow card with collision detection and compaction
      const compacted = addCardWithCollisionAndCompact(otherCards, shadowCard);

      // Find where shadow ended up after compaction
      const shadowFromLayout = compacted.find((c) => c.key === cardKey);
      // Regular cards are everything except the shadow
      const regularCards = compacted.filter((c) => c.key !== cardKey);

      // Keep original card in source group if same group (hidden via opacity)
      const originalCard = isSourceGroup ? g.children.find((c) => c.key === cardKey) : null;

      return {
        ...g,
        children: originalCard ? [...regularCards, originalCard] : regularCards,
        // Return shadow from layout for state update
        shadowFromLayout,
      };
    }
    return g;
  }) as (Group<CardType> & { shadowFromLayout?: CardType })[];

  // Extract the shadow from target group
  const targetGroup = updatedGroups.find((g) => g.key === targetGroupKey);
  const finalShadowCard = targetGroup?.shadowFromLayout ?? shadowCard;

  // Clean up temporary property
  const cleanedGroups = updatedGroups.map((g) => {
    const { shadowFromLayout: _, ...rest } = g;
    return rest;
  });

  return {
    shadowCard: finalShadowCard,
    updatedGroups: cleanedGroups,
  };
}

interface UseKeyboardDragProps<CardType extends Card = Card> {
  card: CardType;
  cardKey: string;
  clearShadowState: () => void;
  col: number;
  dimensions: { height: number; width: number };
  // Stable function references from context
  getGroups: () => Group<CardType>[];
  getShadowState: () => ShadowState<CardType> | null;
  groupKey: string;
  isKeyboardResizing: boolean;
  isResizing: boolean;
  position: Position;
  // Global keyboard drag cancellation registry
  registerKeyboardDragCancel: (cardKey: string, cancel: () => void) => void;
  unregisterKeyboardDragCancel: (cardKey: string) => void;
  updateGroupList: (groups: Group<CardType>[]) => void;
  updateShadowState: (state: ShadowState<CardType>) => void;
}

export function useKeyboardDrag<CardType extends Card = Card>({
  card,
  cardKey,
  clearShadowState,
  col,
  dimensions,
  getGroups,
  getShadowState,
  groupKey,
  isKeyboardResizing,
  isResizing,
  position,
  registerKeyboardDragCancel,
  unregisterKeyboardDragCancel,
  updateGroupList,
  updateShadowState,
}: UseKeyboardDragProps<CardType>) {
  const [isKeyboardDragging, setIsKeyboardDragging] = useState(false);
  const [keyboardDragPos, setKeyboardDragPos] = useState<Position | null>(null);
  const [currentTargetGroupKey, setCurrentTargetGroupKey] = useState<string>(groupKey);

  // Use ref to track if we're keyboard dragging (for cancel callback)
  const isKeyboardDraggingRef = useRef(false);
  isKeyboardDraggingRef.current = isKeyboardDragging;

  const handleDragKeyDown = (e: React.KeyboardEvent) => {
    // Start keyboard drag on Enter
    if (e.key === 'Enter' && !isKeyboardDragging && !isResizing && !isKeyboardResizing) {
      e.preventDefault();
      setIsKeyboardDragging(true);
      setKeyboardDragPos(position);
      setCurrentTargetGroupKey(groupKey);

      // Set up shadow state (shadow is now in GridLayout state, not on groups)
      // sourceGroupKey is the original group where the card started
      const shadowCard = { ...card };
      updateShadowState({ card: shadowCard, groupKey, sourceGroupKey: groupKey });
      return;
    }

    // Handle arrow keys and finalization during keyboard drag
    if (!isKeyboardDragging || !keyboardDragPos) {
      return;
    }

    const groups = getGroups();
    let newX = keyboardDragPos.x;
    let newY = keyboardDragPos.y;
    let targetGroupKey = currentTargetGroupKey;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newX = Math.max(0, keyboardDragPos.x - 1);
        break;

      case 'ArrowRight':
        e.preventDefault();
        newX = Math.min(col - dimensions.width, keyboardDragPos.x + 1);
        break;

      case 'ArrowUp': {
        e.preventDefault();
        const result = handleArrowUpNavigation(
          groups,
          currentTargetGroupKey,
          keyboardDragPos.y,
          keyboardDragPos.x,
          cardKey,
        );
        ({ targetGroupKey, newY } = result);
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        const result = handleArrowDownNavigation(
          groups,
          currentTargetGroupKey,
          keyboardDragPos.y,
          keyboardDragPos.x,
          cardKey,
        );
        ({ targetGroupKey, newY } = result);
        break;
      }

      case 'Enter':
      case 'Tab': {
        e.preventDefault();
        setIsKeyboardDragging(false);
        setKeyboardDragPos(null);
        setCurrentTargetGroupKey(groupKey);

        const shadowState = getShadowState();
        if (!shadowState) {
          clearShadowState();
          return;
        }

        const finalGroups = finalizeDragPosition(groups, shadowState, cardKey);
        clearShadowState();
        updateGroupList(finalGroups);
        return;
      }

      case 'Escape': {
        e.preventDefault();
        setIsKeyboardDragging(false);
        setKeyboardDragPos(null);
        setCurrentTargetGroupKey(groupKey);

        const cancelGroups = cancelDragPosition(groups, card, cardKey, groupKey);
        clearShadowState();
        updateGroupList(cancelGroups);
        return;
      }

      default:
        return;
    }

    // Move shadow if position or group changed
    if (
      newX !== keyboardDragPos.x ||
      newY !== keyboardDragPos.y ||
      targetGroupKey !== currentTargetGroupKey
    ) {
      setKeyboardDragPos({ x: newX, y: newY });
      setCurrentTargetGroupKey(targetGroupKey);

      const { shadowCard: finalShadowCard, updatedGroups } = updateShadowPosition(
        groups,
        card,
        cardKey,
        groupKey,
        targetGroupKey,
        newX,
        newY,
      );

      // Update shadow state with the final position after collision/compaction
      updateShadowState({
        card: finalShadowCard,
        groupKey: targetGroupKey,
        sourceGroupKey: groupKey,
      });

      updateGroupList(updatedGroups);
    }
  };

  /**
   * Finalizes the current keyboard drag, dropping the card at its current shadow position.
   * Called when mouse drag starts on another card to cleanly complete the keyboard drag.
   * Uses ref to check state to avoid stale closures when called from registry.
   */
  const finalizeKeyboardDrag = useCallback(() => {
    if (!isKeyboardDraggingRef.current) {
      return;
    }

    setIsKeyboardDragging(false);
    setKeyboardDragPos(null);
    setCurrentTargetGroupKey(groupKey);

    const groups = getGroups();
    const shadowState = getShadowState();

    // If no shadow state, nothing to finalize
    if (!shadowState) {
      clearShadowState();
      return;
    }

    // Finalize: convert shadow to real card at its current position
    const finalGroups = finalizeDragPosition(groups, shadowState, cardKey);

    clearShadowState();
    updateGroupList(finalGroups);
  }, [cardKey, groupKey, getGroups, getShadowState, clearShadowState, updateGroupList]);

  // Register/unregister keyboard drag finalize function with global registry
  useEffect(() => {
    if (isKeyboardDragging) {
      registerKeyboardDragCancel(cardKey, finalizeKeyboardDrag);
    } else {
      unregisterKeyboardDragCancel(cardKey);
    }

    // Cleanup on unmount
    return () => {
      unregisterKeyboardDragCancel(cardKey);
    };
  }, [
    isKeyboardDragging,
    cardKey,
    finalizeKeyboardDrag,
    registerKeyboardDragCancel,
    unregisterKeyboardDragCancel,
  ]);

  return {
    finalizeKeyboardDrag,
    handleDragKeyDown,
    isKeyboardDragging,
  };
}
