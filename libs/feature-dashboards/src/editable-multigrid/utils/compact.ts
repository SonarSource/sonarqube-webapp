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
import { getFirstCollision } from './collision';

/**
 * Sorts layout items by position.x (ascending), then by position.y (ascending)
 * @param layout The layout array to sort
 * @returns New sorted layout array
 */
const sortLayout = (layout: Card[]): Card[] => {
  return [...layout].sort((a, b) => {
    if (
      a.position.y > b.position.y ||
      (a.position.y === b.position.y && a.position.x > b.position.x)
    ) {
      return 1;
    } else if (a.position.y === b.position.y && a.position.x === b.position.x) {
      return 0;
    }
    return -1;
  });
};

/**
 * Finds the final Y position for an item by moving it upward until collision or boundary.
 * @param finishedLayout Completed items to check against
 * @param item The item to find position for
 * @returns Final Y position
 */
const findCompactedYPosition = (finishedLayout: Card[], item: Card): number => {
  if (finishedLayout.length === 0) {
    return 0;
  }

  const tempPosition = { x: item.position.x, y: item.position.y };

  // Move item upward until it hits a collision or boundary

  while (true) {
    const tempCard = { ...item, position: tempPosition };
    const firstCollision = getFirstCollision(finishedLayout, tempCard);

    if (firstCollision) {
      // Collision found - place item right below the collision
      return firstCollision.position.y + firstCollision.dimensions.height;
    }

    // No collision at current position - try moving up
    if (tempPosition.y === 0) {
      // Already at top boundary
      return 0;
    }

    tempPosition.y--;
  }
};

/**
 * Compacts a single item so it sits flush against the boundary or adjacent elements.
 * Preserves the original object reference if position doesn't change (for memoization).
 * @param finishedLayout Completed items to compare against for collision detection
 * @param item The item to compact
 * @returns Item with new coordinate position, or original item if unchanged
 */
const compactItem = (finishedLayout: Card[], item: Card): Card => {
  const finalY = findCompactedYPosition(finishedLayout, item);

  // CRITICAL: Preserve object reference if position didn't change
  // This enables memoization to work - unchanged cards keep same reference
  if (finalY === item.position.y) {
    return item;
  }

  // Position changed - create new object
  return {
    ...item,
    position: { ...item.position, y: finalY },
  };
};

/**
 * Vertical compaction - makes each element sit flush against boundaries or adjacent elements
 * @param layout The layout array
 * @param _movingItem The item currently being moved (optional, unused)
 * @returns New compacted layout
 */
export function compactLayout<T extends Card = Card>(layout: T[], _movingItem?: T): T[] {
  const sorted = sortLayout(layout);
  const compareList: Card[] = [];
  const needCompact = Array.from<T>({ length: layout.length });

  for (let i = 0, { length } = sorted; i < length; i++) {
    const finished = compactItem(compareList, sorted[i]);
    compareList.push(finished);
    needCompact[i] = finished as T;
  }
  return needCompact;
}
