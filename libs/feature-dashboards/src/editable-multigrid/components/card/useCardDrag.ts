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

import { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import type { Card, Group, LayoutConfig, ShadowState } from '../../types';
import { compactLayout } from '../../utils/compact';
import { getCspSafeEmptyImage } from '../../utils/emptyDragPreview';

/**
 * Restores card to shadow position when dropped outside valid target.
 * Extracted to reduce nesting depth.
 */
export function restoreCardToShadowPosition<CardType extends Card>(
  groups: Group<CardType>[],
  shadowState: ShadowState<CardType>,
  cardKey: string,
): Group<CardType>[] {
  return groups.map((group) => {
    const isTargetGroup = group.key === shadowState.groupKey;
    const isSourceGroup = group.key === shadowState.sourceGroupKey;

    if (isTargetGroup) {
      // Target group: add shadow card, filter duplicates
      const childrenWithoutCard = group.children.filter((c) => c.key !== cardKey);
      return {
        ...group,
        children: compactLayout([...childrenWithoutCard, shadowState.card]),
      };
    }
    if (isSourceGroup && !isTargetGroup) {
      // Source group (different from target): remove card and compact
      const childrenWithoutCard = group.children.filter((c) => c.key !== cardKey);
      return {
        ...group,
        children: compactLayout(childrenWithoutCard),
      };
    }
    return group;
  });
}

interface UseCardDragProps<CardType extends Card> {
  // Cancel ALL active keyboard drags when mouse drag starts (from any card)
  cancelAllKeyboardDrags: () => void;
  // Cancel ALL active keyboard resizes when mouse drag starts (from any card)
  cancelAllKeyboardResizes: () => void;
  card: CardType;
  cardKey: string;
  clearShadowState: () => void;
  // Stable function references from context
  getGroups: () => Group<CardType>[];
  getShadowState: () => ShadowState<CardType> | null;
  groupKey: string;
  isResizing: boolean;
  layout: LayoutConfig;
  updateGroupList: (groups: Group<CardType>[]) => void;
  updateShadowState: (state: ShadowState<CardType>) => void;
}

export function useCardDrag<CardType extends Card>({
  cancelAllKeyboardDrags,
  cancelAllKeyboardResizes,
  card,
  cardKey,
  clearShadowState,
  getGroups,
  getShadowState,
  groupKey,
  isResizing,
  layout,
  updateGroupList,
  updateShadowState,
}: UseCardDragProps<CardType>) {
  const [{ isDragging }, connectDrag, connectDragPreview] = useDrag(
    () => ({
      canDrag: () => !isResizing,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (_item, monitor) => {
        // End drag: if dropped outside valid target, restore card to its shadow position
        if (!monitor.didDrop()) {
          const shadowState = getShadowState();

          // If no shadow exists, clear state and return
          if (!shadowState) {
            clearShadowState();
            return;
          }

          // Only restore if THIS card has the shadow
          if (shadowState.card.key !== cardKey) {
            // Shadow belongs to a different card - just clear our state
            clearShadowState();
            return;
          }

          // Read current groups and restore card to shadow position
          const currentGroups = getGroups();
          const updatedGroups = restoreCardToShadowPosition(currentGroups, shadowState, cardKey);

          clearShadowState();
          updateGroupList(updatedGroups);
        }
      },
      item: () => {
        // Prevent drag if currently resizing
        if (isResizing) {
          return null;
        }
        // Cancel ALL active keyboard operations (from any card) before starting mouse drag
        cancelAllKeyboardDrags();
        cancelAllKeyboardResizes();
        // DON'T set state here - it causes re-render which cancels the drag!
        // The shadow will be set on first hover via moveCardInGroupItem
        return { card, groupKey, id: cardKey, layout, type: 'card' };
      },
      type: 'item',
    }),
    // Note: All context functions are stable references
    [
      card,
      layout,
      cardKey,
      groupKey,
      isResizing,
      getGroups,
      getShadowState,
      clearShadowState,
      updateGroupList,
      updateShadowState,
      cancelAllKeyboardDrags,
      cancelAllKeyboardResizes,
    ],
  );

  useEffect(() => {
    // Use empty image as drag preview to show custom drag layer
    connectDragPreview(getCspSafeEmptyImage(), {
      captureDraggingState: true,
    });
  }, [connectDragPreview]);

  // Note: Global grabbing cursor is now set in CustomDragLayer which has more reliable
  // access to the global drag state from the drag monitor

  return {
    connectDrag,
    isDragging,
  };
}
