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

import type { Card } from '../types';

/**
 * Checks if two cards collide with each other
 * @returns True if cards collide, false otherwise
 */
export const collision = (a: Card, b: Card): boolean => {
  if (
    a.position.x === b.position.x &&
    a.position.y === b.position.y &&
    a.dimensions.width === b.dimensions.width &&
    a.dimensions.height === b.dimensions.height
  ) {
    return true;
  }
  if (a.position.x + a.dimensions.width <= b.position.x) {
    return false;
  } // a is to the left of b
  if (a.position.x >= b.position.x + b.dimensions.width) {
    return false;
  } // a is to the right of b
  if (a.position.y + a.dimensions.height <= b.position.y) {
    return false;
  } // a is above b
  if (a.position.y >= b.position.y + b.dimensions.height) {
    return false;
  } // a is below b
  return true;
};

/**
 * Gets the first item in the layout that collides with the given item
 * @returns The colliding item or null if no collision
 */
export const getFirstCollision = (layout: Card[], item: Card): Card | null => {
  for (let i = 0, { length } = layout; i < length; i++) {
    if (collision(layout[i], item)) {
      return layout[i];
    }
  }
  return null;
};

/**
 * Calculate the Y offset for a colliding item
 * @param item The item that is colliding
 * @param layoutItem The item being positioned
 * @returns The new Y offset for the colliding item
 */
function calculateCollisionOffset(item: Card, layoutItem: Card): number {
  // Default: move item below the layout item
  let offsetY = item.position.y + 1;

  // Check if the current card coordinates overlap with target card plus height
  // This prevents overlap scenarios:
  // Vertical: dragging a (0,1) w:1 h:1 block over a (0,0) w:1 h:2 vertical rectangle keeps the rectangle stationary
  if (
    layoutItem.position.y > item.position.y &&
    layoutItem.position.y < item.position.y + item.dimensions.height
  ) {
    offsetY = item.position.y;
  }

  return offsetY;
}

/**
 * Process a single layout item for collision detection
 * @param item The item to process
 * @param layoutItem The item being positioned
 * @param cardKey The key of the card being checked
 * @param firstItemKey The key of the first/original moved item
 * @returns Object containing the processed item and collision info
 */
function processLayoutItem(
  item: Card,
  layoutItem: Card,
  cardKey: string,
  firstItemKey: string,
): { item: Card; key?: string; movedItem?: Card } {
  // Update the first item with new position
  if (item.key === cardKey && firstItemKey === cardKey) {
    return { item: { ...item, ...layoutItem } };
  }

  // Skip the card being moved
  if (item.key === cardKey) {
    return { item };
  }

  // Check for collision
  if (collision(item, layoutItem)) {
    const offsetY = calculateCollisionOffset(item, layoutItem);
    const newItem = {
      ...item,
      position: { ...item.position, y: offsetY },
    };
    return { item: newItem, movedItem: newItem, key: item.key };
  }

  return { item };
}

/**
 * Recursively checks layout for collisions and moves items to avoid overlaps.
 * Items are always shifted down (vertical compaction) to maintain layout integrity.
 * @param layout The current layout array
 * @param layoutItem The item being positioned
 * @param cardKey The key of the card being checked
 * @param firstItemKey The key of the first/original moved item
 * @returns Updated layout array with collision-free positioning
 */
export function layoutCheck<T extends Card = Card>(
  layout: T[],
  layoutItem: T,
  cardKey: string,
  firstItemKey: string,
): T[] {
  const movedItems: Array<{ card: T; key: string }> = [];

  // Process all items for collisions
  let newlayout = layout.map((item) => {
    const result = processLayoutItem(item, layoutItem, cardKey, firstItemKey);

    if (result.movedItem && result.key) {
      movedItems.push({ card: result.movedItem as T, key: result.key });
    }

    return result.item as T;
  });

  // Recursively handle cascading collisions
  for (const { card, key } of movedItems) {
    newlayout = layoutCheck(newlayout, card, key, firstItemKey);
  }

  return newlayout;
}
