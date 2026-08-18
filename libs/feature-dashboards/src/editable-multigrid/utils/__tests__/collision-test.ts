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

import type { Card } from '../../types';
import { collision, getFirstCollision, layoutCheck } from '../collision';

// Helper to create a card with minimal required fields
function createCard(key: string, x: number, y: number, width: number, height: number): Card {
  return {
    key,
    position: { x, y },
    dimensions: { width, height },
  };
}

describe('collision', () => {
  describe('collision()', () => {
    it.each([
      ['identical cards', 0, true],
      ['card A is to the left of card B', 2, false],
      ['cards share an edge and overlap', 1, true],
      ['adjacent cards (touching but not overlapping)', 2, false],
    ])('should detect collision correctly for %s', (_desc, bx, expected) => {
      const cardA = createCard('a', 0, 0, 2, 2);
      const cardB = createCard('b', bx as number, 0, 2, 2);

      expect(collision(cardA, cardB)).toBe(expected);
    });

    it('should return false when card A is to the right of card B', () => {
      const cardA = createCard('a', 4, 0, 2, 2);
      const cardB = createCard('b', 0, 0, 2, 2);

      expect(collision(cardA, cardB)).toBe(false);
    });

    it('should return false when card A is above card B', () => {
      const cardA = createCard('a', 0, 0, 2, 2);
      const cardB = createCard('b', 0, 2, 2, 2);

      expect(collision(cardA, cardB)).toBe(false);
    });

    it('should return false when card A is below card B', () => {
      const cardA = createCard('a', 0, 4, 2, 2);
      const cardB = createCard('b', 0, 0, 2, 2);

      expect(collision(cardA, cardB)).toBe(false);
    });

    it('should return true for overlapping cards', () => {
      const cardA = createCard('a', 0, 0, 3, 3);
      const cardB = createCard('b', 1, 1, 3, 3);

      expect(collision(cardA, cardB)).toBe(true);
    });

    it('should handle cards of different sizes', () => {
      const smallCard = createCard('small', 1, 1, 1, 1);
      const largeCard = createCard('large', 0, 0, 4, 4);

      expect(collision(smallCard, largeCard)).toBe(true);
    });

    it('should handle cards with width/height of 1', () => {
      const cardA = createCard('a', 0, 0, 1, 1);
      const cardB = createCard('b', 0, 0, 1, 1);

      expect(collision(cardA, cardB)).toBe(true);
    });
  });

  describe('getFirstCollision()', () => {
    it('should return null for empty layout', () => {
      const item = createCard('item', 0, 0, 2, 2);

      expect(getFirstCollision([], item)).toBeNull();
    });

    it('should return null when no collision exists', () => {
      const layout = [createCard('a', 0, 0, 2, 2), createCard('b', 4, 0, 2, 2)];
      const item = createCard('item', 2, 0, 2, 2);

      expect(getFirstCollision(layout, item)).toBeNull();
    });

    it('should return first colliding card', () => {
      const cardA = createCard('a', 0, 0, 2, 2);
      const cardB = createCard('b', 1, 1, 2, 2);
      const layout = [cardA, cardB];
      const item = createCard('item', 0, 0, 3, 3);

      expect(getFirstCollision(layout, item)).toBe(cardA);
    });

    it('should return the first collision in layout order', () => {
      const cardA = createCard('a', 0, 0, 2, 2);
      const cardB = createCard('b', 0, 0, 2, 2);
      const layout = [cardA, cardB];
      const item = createCard('item', 0, 0, 1, 1);

      expect(getFirstCollision(layout, item)).toBe(cardA);
    });
  });

  describe('layoutCheck()', () => {
    it('should return layout unchanged when no collisions', () => {
      const layout = [
        createCard('a', 0, 0, 2, 2),
        createCard('b', 4, 0, 2, 2),
        createCard('c', 0, 4, 2, 2),
      ];
      const movingItem = createCard('a', 0, 0, 2, 2);

      const result = layoutCheck(layout, movingItem, 'a', 'a');

      // Positions should remain the same
      expect(result.find((c) => c.key === 'b')?.position.y).toBe(0);
      expect(result.find((c) => c.key === 'c')?.position.y).toBe(4);
    });

    it('should push colliding cards down', () => {
      const layout = [
        createCard('a', 0, 0, 2, 2),
        createCard('b', 0, 0, 2, 2), // Same position as 'a' - collision
      ];
      const movingItem = createCard('a', 0, 0, 2, 2);

      const result = layoutCheck(layout, movingItem, 'a', 'a');

      // Card 'b' should be pushed down
      expect(result.find((c) => c.key === 'b')?.position.y).toBeGreaterThan(0);
    });

    it('should recursively resolve cascading collisions', () => {
      const layout = [
        createCard('a', 0, 0, 2, 2),
        createCard('b', 0, 1, 2, 2), // Overlaps with 'a'
        createCard('c', 0, 2, 2, 2), // Will overlap with 'b' after it moves
      ];
      const movingItem = createCard('a', 0, 0, 2, 2);

      const result = layoutCheck(layout, movingItem, 'a', 'a');

      // All cards should have distinct, non-overlapping Y positions
      const positions = result.map((c) => c.position.y);
      const yValues = new Set(positions);

      // Each card occupies height 2, so if properly laid out, no two should overlap
      expect(yValues.size).toBe(3);
    });

    it('should handle vertical overlap scenario correctly', () => {
      // Test the special case where layoutItem.y is within the height of an existing item
      const layout = [
        createCard('a', 0, 0, 2, 3), // Tall card at y=0, height=3 (occupies y=0,1,2)
        createCard('b', 0, 1, 2, 2), // Overlapping at y=1
      ];
      const movingItem = createCard('b', 0, 1, 2, 2);

      const result = layoutCheck(layout, movingItem, 'b', 'b');

      // Card 'a' should stay at y=0 (special case in collision offset logic)
      expect(result.find((c) => c.key === 'a')?.position.y).toBe(0);
    });

    it('should update the moving item when it matches firstItemKey', () => {
      const layout = [createCard('a', 0, 0, 2, 2), createCard('b', 2, 0, 2, 2)];
      const movingItem = createCard('a', 0, 2, 2, 2); // New position for 'a'

      const result = layoutCheck(layout, movingItem, 'a', 'a');

      // Card 'a' should be at the new position
      expect(result.find((c) => c.key === 'a')?.position.y).toBe(2);
    });

    it('should handle empty layout', () => {
      const layout: Card[] = [];
      const movingItem = createCard('a', 0, 0, 2, 2);

      const result = layoutCheck(layout, movingItem, 'a', 'a');

      expect(result).toEqual([]);
    });
  });
});
