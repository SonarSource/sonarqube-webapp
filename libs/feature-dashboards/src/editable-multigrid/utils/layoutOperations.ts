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
import { layoutCheck } from './collision';
import { compactLayout } from './compact';

/**
 * Add a card to an existing layout with collision detection and compaction.
 * This is a common operation used during drag and resize operations.
 *
 * Process:
 * 1. Remove any existing card with the same key (to avoid duplicates)
 * 2. Add the new card to the layout
 * 3. Run collision detection to move overlapping cards
 * 4. Compact the layout to eliminate gaps
 *
 * @param existingCards - The current cards in the layout
 * @param cardToAdd - The card to add (may replace an existing card with same key)
 * @returns New layout array with the card added, collisions resolved, and compacted
 */
export function addCardWithCollisionAndCompact<T extends Card>(
  existingCards: T[],
  cardToAdd: T,
): T[] {
  // Remove existing card with same key to avoid duplicates
  const cardsWithoutTarget = existingCards.filter((c) => c.key !== cardToAdd.key);

  // Add the new card
  const cardsWithNew = [...cardsWithoutTarget, cardToAdd];

  // Detect and resolve collisions
  const afterCollision = layoutCheck(cardsWithNew, cardToAdd, cardToAdd.key, cardToAdd.key);

  // Compact to eliminate gaps
  return compactLayout(afterCollision, cardToAdd);
}
