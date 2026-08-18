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
import type { Card, Dimensions, Group } from '../../types';
import { layoutCheck } from '../../utils/collision';
import { compactLayout } from '../../utils/compact';

interface UseKeyboardResizeProps {
  card: Card;
  cardKey: string;
  dimensions: Dimensions;
  // Stable function references from context
  getGroups: () => Group[];
  groupKey: string;
  isKeyboardDragging: boolean;
  maxSize: Dimensions;
  maxWidthInGrid: number;
  minSize: Dimensions;
  onResizeStop: (cardKey: string, groupKey: string, size: Dimensions) => void;
  registerKeyboardResizeCancel: (cardKey: string, cancel: () => void) => void;
  unregisterKeyboardResizeCancel: (cardKey: string) => void;
  updateGroupList: (groups: Group[]) => void;
}

export function useKeyboardResize({
  card,
  cardKey,
  dimensions,
  getGroups,
  groupKey,
  isKeyboardDragging,
  maxSize,
  maxWidthInGrid,
  minSize,
  onResizeStop,
  registerKeyboardResizeCancel,
  unregisterKeyboardResizeCancel,
  updateGroupList,
}: UseKeyboardResizeProps) {
  const [isKeyboardResizing, setIsKeyboardResizing] = useState(false);
  const [keyboardResizeDimensions, setKeyboardResizeDimensions] = useState<{
    h: number;
    w: number;
  } | null>(null);

  // Use ref to track if we're keyboard resizing (for cancel callback)
  const isKeyboardResizingRef = useRef(false);
  isKeyboardResizingRef.current = isKeyboardResizing;

  const handleResizeKeyDown = (e: React.KeyboardEvent) => {
    // Start keyboard resize on Enter
    if (e.key === 'Enter' && !isKeyboardResizing && !isKeyboardDragging) {
      e.preventDefault();
      setIsKeyboardResizing(true);
      setKeyboardResizeDimensions({
        h: dimensions.height,
        w: dimensions.width,
      });
      return;
    }

    // Handle arrow keys and finalization during keyboard resize
    if (isKeyboardResizing && keyboardResizeDimensions) {
      let newW = keyboardResizeDimensions.w;
      let newH = keyboardResizeDimensions.h;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newW = Math.max(minSize.width, keyboardResizeDimensions.w - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newW = Math.min(maxWidthInGrid, keyboardResizeDimensions.w + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newH = Math.max(minSize.height, keyboardResizeDimensions.h - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newH = Math.min(maxSize.height, keyboardResizeDimensions.h + 1);
          break;
        case 'Enter':
        case 'Tab': {
          e.preventDefault();
          setIsKeyboardResizing(false);
          const finalW = keyboardResizeDimensions.w;
          const finalH = keyboardResizeDimensions.h;
          setKeyboardResizeDimensions(null);
          onResizeStop(cardKey, groupKey, { height: finalH, width: finalW });
          return;
        }
        case 'Escape':
          e.preventDefault();
          setIsKeyboardResizing(false);
          setKeyboardResizeDimensions(null);
          return;
        default:
          return;
      }

      // Update dimensions if changed
      if (newW !== keyboardResizeDimensions.w || newH !== keyboardResizeDimensions.h) {
        setKeyboardResizeDimensions({ h: newH, w: newW });

        // Update the groups with the new dimensions
        const resizedCard = {
          ...card,
          dimensions: { height: newH, width: newW },
        };

        const groups = getGroups();
        const updatedGroups = groups.map((g) => {
          if (g.key === groupKey) {
            const otherCards = g.children.filter((c) => c.key !== cardKey);
            const cardsWithResized = [...otherCards, resizedCard];

            const layoutAfterCollision = layoutCheck(
              cardsWithResized,
              resizedCard,
              resizedCard.key,
              resizedCard.key,
            );
            const compacted = compactLayout(layoutAfterCollision, resizedCard);

            return {
              ...g,
              children: compacted,
            };
          }
          return g;
        });

        updateGroupList(updatedGroups);
      }
    }
  };

  /**
   * Finalizes the current keyboard resize, applying the final dimensions.
   * Called when mouse drag/resize starts on another card to cleanly complete the keyboard resize.
   * Uses ref to check state to avoid stale closures when called from registry.
   */
  const finalizeKeyboardResize = useCallback(() => {
    if (!isKeyboardResizingRef.current || !keyboardResizeDimensions) {
      return;
    }

    setIsKeyboardResizing(false);
    const finalW = keyboardResizeDimensions.w;
    const finalH = keyboardResizeDimensions.h;
    setKeyboardResizeDimensions(null);
    onResizeStop(cardKey, groupKey, { height: finalH, width: finalW });
  }, [cardKey, groupKey, keyboardResizeDimensions, onResizeStop]);

  // Register/unregister keyboard resize finalize function with global registry
  useEffect(() => {
    if (isKeyboardResizing) {
      registerKeyboardResizeCancel(cardKey, finalizeKeyboardResize);
    } else {
      unregisterKeyboardResizeCancel(cardKey);
    }

    // Cleanup on unmount
    return () => {
      unregisterKeyboardResizeCancel(cardKey);
    };
  }, [
    isKeyboardResizing,
    cardKey,
    finalizeKeyboardResize,
    registerKeyboardResizeCancel,
    unregisterKeyboardResizeCancel,
  ]);

  return {
    handleResizeKeyDown,
    isKeyboardResizing,
    keyboardResizeDimensions,
  };
}
