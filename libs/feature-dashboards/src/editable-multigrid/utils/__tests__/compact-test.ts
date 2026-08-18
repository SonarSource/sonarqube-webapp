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
import { compactLayout } from '../compact';

// Helper to create a card with minimal required fields
function createCard(key: string, x: number, y: number, width: number, height: number): Card {
  return {
    key,
    position: { x, y },
    dimensions: { width, height },
  };
}

describe('compact', () => {
  describe('compactLayout()', () => {
    it('should return empty array for empty input', () => {
      expect(compactLayout([])).toEqual([]);
    });

    it('should move single card to y=0', () => {
      const layout = [createCard('a', 0, 5, 2, 2)];

      const result = compactLayout(layout);

      expect(result[0].position.y).toBe(0);
      expect(result[0].position.x).toBe(0); // X should remain unchanged
    });

    it('should preserve x position during compaction', () => {
      const layout = [createCard('a', 3, 5, 2, 2)];

      const result = compactLayout(layout);

      expect(result[0].position.x).toBe(3);
      expect(result[0].position.y).toBe(0);
    });

    it('should stack cards vertically when in same column', () => {
      const layout = [
        createCard('a', 0, 0, 2, 2),
        createCard('b', 0, 5, 2, 2), // Gap at y=2,3,4
      ];

      const result = compactLayout(layout);

      expect(result.find((c) => c.key === 'a')?.position.y).toBe(0);
      expect(result.find((c) => c.key === 'b')?.position.y).toBe(2); // Should be right after 'a'
    });

    it('should allow cards to be side by side at y=0', () => {
      const layout = [
        createCard('a', 0, 5, 2, 2),
        createCard('b', 2, 10, 2, 2), // Different column
      ];

      const result = compactLayout(layout);

      // Both should compact to y=0 since they don't overlap horizontally
      expect(result.find((c) => c.key === 'a')?.position.y).toBe(0);
      expect(result.find((c) => c.key === 'b')?.position.y).toBe(0);
    });

    it('should preserve object reference when position unchanged', () => {
      const cardA = createCard('a', 0, 0, 2, 2); // Already at y=0
      const layout = [cardA];

      const result = compactLayout(layout);

      // Should return the same object reference for memoization
      expect(result[0]).toBe(cardA);
    });

    it('should create new object when position changes', () => {
      const cardA = createCard('a', 0, 5, 2, 2); // Needs to move to y=0
      const layout = [cardA];

      const result = compactLayout(layout);

      // Should be a new object since position changed
      expect(result[0]).not.toBe(cardA);
      expect(result[0].position.y).toBe(0);
    });

    it('should handle complex layout with multiple cards', () => {
      const layout = [
        createCard('a', 0, 10, 2, 2),
        createCard('b', 0, 20, 2, 2),
        createCard('c', 2, 15, 2, 2),
        createCard('d', 4, 0, 2, 2), // Already at top, different column
      ];

      const result = compactLayout(layout);

      // Card 'a' should move to y=0 (first in column 0-1)
      expect(result.find((c) => c.key === 'a')?.position.y).toBe(0);

      // Card 'b' should stack below 'a' at y=2
      expect(result.find((c) => c.key === 'b')?.position.y).toBe(2);

      // Card 'c' is in column 2-3, should go to y=0
      expect(result.find((c) => c.key === 'c')?.position.y).toBe(0);

      // Card 'd' is already at y=0, should stay there
      expect(result.find((c) => c.key === 'd')?.position.y).toBe(0);
    });

    it('should respect card height when stacking', () => {
      const layout = [
        createCard('a', 0, 0, 2, 3), // Height 3
        createCard('b', 0, 10, 2, 2), // Should end up at y=3
      ];

      const result = compactLayout(layout);

      expect(result.find((c) => c.key === 'a')?.position.y).toBe(0);
      expect(result.find((c) => c.key === 'b')?.position.y).toBe(3);
    });

    it('should handle overlapping cards by stacking them', () => {
      // Two cards that would overlap if at same position
      const layout = [
        createCard('a', 0, 0, 3, 2),
        createCard('b', 1, 0, 3, 2), // Overlaps horizontally with 'a'
      ];

      const result = compactLayout(layout);

      const cardA = result.find((c) => c.key === 'a');
      const cardB = result.find((c) => c.key === 'b');

      expect(cardA).toBeDefined();
      expect(cardB).toBeDefined();

      const aY = cardA!.position.y;
      const bY = cardB!.position.y;

      // One should be at 0, the other at 2 (after the first one's height)
      expect(Math.min(aY, bY)).toBe(0);
      expect(Math.max(aY, bY)).toBe(2);
    });

    it('should sort by position before compacting', () => {
      // Cards in reverse order by position
      const layout = [
        createCard('b', 0, 5, 2, 2),
        createCard('a', 0, 0, 2, 2), // This should be processed first
      ];

      const result = compactLayout(layout);

      // 'a' is at y=0 originally, should stay there
      // 'b' should compact to y=2 (after 'a')
      expect(result.find((c) => c.key === 'a')?.position.y).toBe(0);
      expect(result.find((c) => c.key === 'b')?.position.y).toBe(2);
    });

    it('should handle cards with width spanning multiple columns', () => {
      const layout = [
        createCard('wide', 0, 0, 6, 2), // Spans columns 0-5
        createCard('narrow', 2, 10, 2, 2), // In middle, should stack below
      ];

      const result = compactLayout(layout);

      expect(result.find((c) => c.key === 'wide')?.position.y).toBe(0);
      expect(result.find((c) => c.key === 'narrow')?.position.y).toBe(2);
    });

    it('should handle many cards efficiently', () => {
      // Create 20 cards in a vertical stack
      const layout = Array.from({ length: 20 }, (_, i) => createCard(`card-${i}`, 0, i * 10, 2, 2));

      const result = compactLayout(layout);

      // All cards should be compacted to consecutive positions
      result.forEach((card, index) => {
        expect(card.position.y).toBe(index * 2); // Each card height is 2
      });
    });

    it('should handle cards with varying heights', () => {
      const layout = [
        createCard('a', 0, 10, 2, 1), // Height 1
        createCard('b', 0, 20, 2, 3), // Height 3
        createCard('c', 0, 30, 2, 2), // Height 2
      ];

      const result = compactLayout(layout);

      expect(result.find((c) => c.key === 'a')?.position.y).toBe(0);
      expect(result.find((c) => c.key === 'b')?.position.y).toBe(1); // After 'a' (height 1)
      expect(result.find((c) => c.key === 'c')?.position.y).toBe(4); // After 'b' (1 + 3)
    });

    it('should compact cards in multiple columns independently', () => {
      const layout = [
        createCard('a', 0, 10, 1, 2), // Column 0
        createCard('b', 1, 15, 1, 2), // Column 1
        createCard('c', 2, 5, 1, 2), // Column 2
      ];

      const result = compactLayout(layout);

      // All should compact to y=0 since they're in different columns
      expect(result.find((c) => c.key === 'a')?.position.y).toBe(0);
      expect(result.find((c) => c.key === 'b')?.position.y).toBe(0);
      expect(result.find((c) => c.key === 'c')?.position.y).toBe(0);
    });
  });
});
