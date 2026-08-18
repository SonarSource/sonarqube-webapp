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

import {
  applyPushToWidgets,
  canPushWidgets,
  canWidgetFitAtPosition,
  detectSwapOpportunity,
  dimensionsCompatible,
  dimensionsEqual,
  findPushedWidgets,
  getSectionHeight,
  getWidgetDropPosition,
  isPointInWidget,
  isSwapSafe,
  isValidDropPosition,
  joinSections,
  mouseToGridPosition,
  normalizeSection,
  sortWidgets,
  splitSection,
} from '../positioning';
import { ImplicitSectionInstance, SectionInstance, WidgetInstance } from '../types';

type TestWidgetProps = { test: Record<string, never> };

// Helper to create test widgets
function createWidget(
  key: string,
  x: number,
  y: number,
  width: number,
  height: number,
): WidgetInstance<TestWidgetProps> {
  return {
    key,
    type: 'test',
    position: { x, y },
    dimensions: { width, height },
    props: {},
  };
}

// Helper to create test section
function createSection(
  widgets: WidgetInstance<TestWidgetProps>[],
): SectionInstance<TestWidgetProps> {
  return {
    type: 'implicit',
    children: widgets,
  };
}

// Helper to create implicit section (for joinSections)
function createImplicitSection(
  widgets: WidgetInstance<TestWidgetProps>[],
): ImplicitSectionInstance<TestWidgetProps> {
  return {
    type: 'implicit',
    children: widgets,
  };
}

// Helper to check if two widgets collide
function widgetsCollide(
  w1: WidgetInstance<TestWidgetProps>,
  w2: WidgetInstance<TestWidgetProps>,
): boolean {
  return !(
    w1.position.x >= w2.position.x + w2.dimensions.width ||
    w2.position.x >= w1.position.x + w1.dimensions.width ||
    w1.position.y >= w2.position.y + w2.dimensions.height ||
    w2.position.y >= w1.position.y + w1.dimensions.height
  );
}

// Helper to find all collisions in a section
function findCollisions(section: SectionInstance<TestWidgetProps>): Array<[string, string]> {
  const collisions: Array<[string, string]> = [];
  for (let i = 0; i < section.children.length; i++) {
    for (let j = i + 1; j < section.children.length; j++) {
      const w1 = section.children[i];
      const w2 = section.children[j];
      if (widgetsCollide(w1, w2)) {
        collisions.push([w1.key, w2.key]);
      }
    }
  }
  return collisions;
}

describe('sortWidgets', () => {
  it('should sort widgets by y coordinate first', () => {
    const widgets = [
      createWidget('a', 0, 5, 3, 3),
      createWidget('b', 0, 2, 3, 3),
      createWidget('c', 0, 8, 3, 3),
    ];

    const sorted = sortWidgets(widgets);
    expect(sorted.map((w) => w.key)).toEqual(['b', 'a', 'c']);
  });

  it('should sort widgets by x coordinate when y is equal', () => {
    const widgets = [
      createWidget('a', 6, 0, 3, 3),
      createWidget('b', 0, 0, 3, 3),
      createWidget('c', 3, 0, 3, 3),
    ];

    const sorted = sortWidgets(widgets);
    expect(sorted.map((w) => w.key)).toEqual(['b', 'c', 'a']);
  });

  it('should handle empty array', () => {
    expect(sortWidgets([])).toEqual([]);
  });

  it('should handle single widget', () => {
    const widget = createWidget('a', 5, 5, 3, 3);
    expect(sortWidgets([widget])).toEqual([widget]);
  });
});

describe('getSectionHeight', () => {
  it('should return the maximum bottom edge of all widgets', () => {
    const section = createSection([
      createWidget('a', 0, 0, 3, 4), // bottom at y=4
      createWidget('b', 3, 2, 3, 5), // bottom at y=7
      createWidget('c', 6, 1, 3, 3), // bottom at y=4
    ]);

    expect(getSectionHeight(section)).toBe(7);
  });

  it('should return 0 for empty section', () => {
    const section = createSection([]);
    expect(getSectionHeight(section)).toBe(0);
  });

  it('should handle single widget', () => {
    const section = createSection([createWidget('a', 0, 5, 3, 4)]);
    expect(getSectionHeight(section)).toBe(9);
  });
});

describe('joinSections', () => {
  it('should join two sections vertically', () => {
    const sectionA = createImplicitSection([
      createWidget('a', 0, 0, 3, 4),
      createWidget('b', 3, 0, 3, 3),
    ]);

    const sectionB = createImplicitSection([
      createWidget('c', 0, 0, 3, 3),
      createWidget('d', 3, 2, 3, 3),
    ]);

    const joined = joinSections(sectionA, sectionB);

    // Section A has height 4, so section B widgets should be offset by 4
    // Note: joinSections normalizes, so positions may be compacted
    expect(joined.children).toHaveLength(4);
    const widgetC = joined.children.find((w) => w.key === 'c');
    const widgetD = joined.children.find((w) => w.key === 'd');

    expect(widgetC?.position).toEqual({ x: 0, y: 4 });
    // Widget D gets compacted up to y=3 (directly below widget b at y=3)
    expect(widgetD?.position).toEqual({ x: 3, y: 3 });
  });

  it('should normalize the joined section', () => {
    const sectionA = createImplicitSection([createWidget('a', 6, 0, 3, 3)]);
    const sectionB = createImplicitSection([createWidget('b', 6, 0, 3, 3)]);

    const joined = joinSections(sectionA, sectionB);

    // Both widgets should be compacted to the left
    expect(joined.children[0].position.x).toBe(0);
  });
});

describe('isValidDropPosition', () => {
  it('should return false for negative x position', () => {
    const section = createSection([]);
    expect(isValidDropPosition({ x: -1, y: 0 }, { width: 3, height: 3 }, section)).toBe(false);
  });

  it('should return false for negative y position', () => {
    const section = createSection([]);
    expect(isValidDropPosition({ x: 0, y: -1 }, { width: 3, height: 3 }, section)).toBe(false);
  });

  it('should return false when widget exceeds grid width (12 columns)', () => {
    const section = createSection([]);
    expect(isValidDropPosition({ x: 10, y: 0 }, { width: 3, height: 3 }, section)).toBe(false);
  });

  it('should return true when widget fits exactly at grid edge', () => {
    const section = createSection([]);
    expect(isValidDropPosition({ x: 9, y: 0 }, { width: 3, height: 3 }, section)).toBe(true);
  });

  it('should return false when position collides with existing widget', () => {
    const section = createSection([createWidget('a', 3, 3, 6, 4)]);

    // Try to place a widget that would overlap
    expect(isValidDropPosition({ x: 5, y: 4 }, { width: 3, height: 3 }, section)).toBe(false);
  });

  it('should return true when position does not collide', () => {
    const section = createSection([createWidget('a', 0, 0, 3, 3)]);

    // Place widget to the right
    expect(isValidDropPosition({ x: 3, y: 0 }, { width: 3, height: 3 }, section)).toBe(true);
  });

  it('should allow widgets that are adjacent (touching but not overlapping)', () => {
    const section = createSection([createWidget('a', 0, 0, 3, 3)]);

    // Widget directly to the right (x=3)
    expect(isValidDropPosition({ x: 3, y: 0 }, { width: 3, height: 3 }, section)).toBe(true);

    // Widget directly below (y=3)
    expect(isValidDropPosition({ x: 0, y: 3 }, { width: 3, height: 3 }, section)).toBe(true);
  });
});

describe('getWidgetDropPosition', () => {
  it('should exclude the widget itself when calculating position', () => {
    const widget = createWidget('a', 5, 5, 3, 3);
    const section = createSection([widget, createWidget('b', 0, 0, 3, 3)]);

    // Widget 'a' should be able to move to (3, 0) without colliding with itself
    const newPosition = getWidgetDropPosition(widget, section);
    expect(newPosition).toEqual({ x: 3, y: 0 });
  });

  it('should compact widget to top-left when space is available', () => {
    const widget = createWidget('a', 10, 10, 3, 3);
    const section = createSection([widget]);

    const newPosition = getWidgetDropPosition(widget, section);
    expect(newPosition).toEqual({ x: 0, y: 0 });
  });

  it('should find valid position when starting position collides with other widgets', () => {
    const widgetA = createWidget('a', 3, 4, 3, 3);
    const widgetB = createWidget('b', 3, 0, 6, 5); // Overlaps with A at y=4

    const section = createSection([widgetA, widgetB]);

    // Widget A should be moved to a non-colliding position
    const newPosition = getWidgetDropPosition(widgetA, section);

    // Verify the new position doesn't collide with B by checking there's no overlap
    const collisions = findCollisions(
      createSection([{ ...widgetA, position: newPosition }, widgetB]),
    );
    expect(collisions).toEqual([]);
  });

  it('should wrap to next row when widget cannot fit on current row', () => {
    // Fill entire first row with widgets
    const section = createSection([
      createWidget('row1-a', 0, 0, 6, 3),
      createWidget('row1-b', 6, 0, 6, 3),
    ]);

    // Try to place a large widget that collides with the first row
    const widget = createWidget('new', 0, 0, 12, 3);

    const newPosition = getWidgetDropPosition(widget, section);

    // Widget should wrap to the next row (y >= 3)
    expect(newPosition.y).toBeGreaterThanOrEqual(3);
    expect(newPosition.x).toBe(0);
  });
});

describe('normalizeSection', () => {
  it('should compact widgets to top-left', () => {
    const section = createSection([createWidget('a', 6, 5, 3, 3), createWidget('b', 3, 10, 3, 3)]);

    const normalized = normalizeSection(section);

    expect(normalized.children[0].position).toEqual({ x: 0, y: 0 });
    expect(normalized.children[1].position).toEqual({ x: 3, y: 0 });
  });

  it('should handle widgets that need to wrap to next row', () => {
    const section = createSection([
      createWidget('a', 0, 0, 6, 3),
      createWidget('b', 6, 0, 6, 3),
      createWidget('c', 0, 3, 6, 3),
    ]);

    const normalized = normalizeSection(section);

    // A and B should be on same row, C should wrap
    expect(normalized.children[0].position).toEqual({ x: 0, y: 0 });
    expect(normalized.children[1].position).toEqual({ x: 6, y: 0 });
    expect(normalized.children[2].position).toEqual({ x: 0, y: 3 });
  });

  it('should resolve collisions by moving widgets', () => {
    const section = createSection([
      createWidget('a', 0, 0, 3, 4),
      createWidget('b', 3, 0, 6, 5),
      createWidget('c', 0, 4, 3, 4),
      createWidget('d', 3, 4, 3, 4), // Collides with B
    ]);

    const normalized = normalizeSection(section);

    // Verify no collisions in result
    const collisions = findCollisions(normalized);
    expect(collisions).toEqual([]);
  });

  it('should maintain widget order after normalization', () => {
    const section = createSection([
      createWidget('a', 0, 0, 3, 3),
      createWidget('b', 3, 0, 3, 3),
      createWidget('c', 0, 3, 3, 3),
    ]);

    const normalized = normalizeSection(section);

    // Widgets should be sorted by y, then x
    expect(normalized.children[0].key).toBe('a');
    expect(normalized.children[1].key).toBe('b');
    expect(normalized.children[2].key).toBe('c');
  });

  it('should handle empty section', () => {
    const section = createSection([]);
    const normalized = normalizeSection(section);
    expect(normalized.children).toEqual([]);
  });

  it('should handle single widget', () => {
    const section = createSection([createWidget('a', 5, 5, 3, 3)]);
    const normalized = normalizeSection(section);

    expect(normalized.children).toHaveLength(1);
    expect(normalized.children[0].position).toEqual({ x: 0, y: 0 });
  });
});

describe('splitSection', () => {
  it('should split section at given y coordinate', () => {
    const section = createSection([
      createWidget('a', 0, 0, 3, 3),
      createWidget('b', 3, 0, 3, 3),
      createWidget('c', 0, 5, 3, 3),
      createWidget('d', 3, 5, 3, 3),
    ]);

    const [above, below] = splitSection(section, 5);

    expect(above.children).toHaveLength(2);
    expect(below.children).toHaveLength(2);

    expect(above.children.map((w) => w.key)).toEqual(['a', 'b']);
    expect(below.children.map((w) => w.key)).toEqual(['c', 'd']);
  });

  it('should adjust y positions in below section', () => {
    const section = createSection([
      createWidget('a', 0, 0, 3, 3),
      createWidget('b', 0, 5, 3, 3),
      createWidget('c', 0, 8, 3, 3),
    ]);

    const [, below] = splitSection(section, 5);

    // Widget b was at y=5, should now be at y=0
    // Widget c was at y=8, should now be at y=3
    expect(below.children[0].position.y).toBe(0);
    expect(below.children[1].position.y).toBe(3);
  });

  it('should handle split with all widgets above', () => {
    const section = createSection([createWidget('a', 0, 0, 3, 3), createWidget('b', 3, 0, 3, 3)]);

    const [above, below] = splitSection(section, 10);

    expect(above.children).toHaveLength(2);
    expect(below.children).toHaveLength(0);
  });

  it('should handle split with all widgets below', () => {
    const section = createSection([createWidget('a', 0, 5, 3, 3), createWidget('b', 3, 5, 3, 3)]);

    const [above, below] = splitSection(section, 0);

    expect(above.children).toHaveLength(0);
    expect(below.children).toHaveLength(2);
  });

  it('should preserve widget properties', () => {
    const section = createSection([createWidget('a', 0, 5, 6, 4)]);

    const [, below] = splitSection(section, 5);

    expect(below.children[0].key).toBe('a');
    expect(below.children[0].dimensions).toEqual({ width: 6, height: 4 });
    expect(below.children[0].position.x).toBe(0);
  });
});

describe('mouseToGridPosition', () => {
  const createMockRect = (left: number, top: number, width: number): DOMRect => {
    return {
      left,
      top,
      width,
      height: 500,
      right: left + width,
      bottom: top + 500,
      x: left,
      y: top,
      toJSON: () => ({}),
    };
  };

  it('should convert mouse coordinates to grid position', () => {
    const sectionRect = createMockRect(0, 0, 800);
    const gridWidth = 12;

    // Click near the top-left (accounting for padding)
    const position = mouseToGridPosition(20, 20, sectionRect, gridWidth);
    expect(position).toEqual({ x: 0, y: 0 });
  });

  it('should account for section padding', () => {
    const sectionRect = createMockRect(0, 0, 800);
    const gridWidth = 12;

    // Click at exact padding boundary (16px)
    const position = mouseToGridPosition(16, 16, sectionRect, gridWidth);
    expect(position).toEqual({ x: 0, y: 0 });
  });

  it('should calculate correct grid column', () => {
    const sectionRect = createMockRect(0, 0, 800);
    const gridWidth = 12;

    // Calculate expected cell width: (800 - 32 padding - 88 gaps) / 12 = ~56.67px per cell
    // Click in middle column (column 6): 16 + (6 * 56.67) + (6 * 8) ≈ 404px
    const position = mouseToGridPosition(400, 20, sectionRect, gridWidth);
    expect(position.x).toBeGreaterThanOrEqual(5);
    expect(position.x).toBeLessThanOrEqual(7);
  });

  it('should calculate correct grid row', () => {
    const sectionRect = createMockRect(0, 0, 800);
    const gridWidth = 12;

    // Row height is 40px + 8px gap = 48px per row
    // Row 2 starts at: 16 + (2 * 48) = 112px
    const position = mouseToGridPosition(20, 112, sectionRect, gridWidth);
    expect(position.y).toBe(2);
  });

  it('should clamp x to grid boundaries', () => {
    const sectionRect = createMockRect(0, 0, 800);
    const gridWidth = 12;

    // Click far right beyond grid
    const position = mouseToGridPosition(5000, 20, sectionRect, gridWidth);
    expect(position.x).toBe(11); // Max x is gridWidth - 1
  });

  it('should not allow negative coordinates', () => {
    const sectionRect = createMockRect(100, 100, 800);
    const gridWidth = 12;

    // Click to the left of section
    const position = mouseToGridPosition(50, 50, sectionRect, gridWidth);
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
  });

  it('should handle different grid widths', () => {
    const sectionRect = createMockRect(0, 0, 800);
    const gridWidth = 6; // Half the columns

    const position = mouseToGridPosition(400, 20, sectionRect, gridWidth);
    expect(position.x).toBeLessThan(6);
  });

  it('should account for section offset', () => {
    const sectionRect = createMockRect(100, 200, 800);
    const gridWidth = 12;

    // Mouse at absolute position (120, 220) = relative (20, 20) within section
    const position = mouseToGridPosition(120, 220, sectionRect, gridWidth);
    expect(position).toEqual({ x: 0, y: 0 });
  });
});

describe('Widget Swap Functions', () => {
  describe('isPointInWidget', () => {
    it('should return true when point is inside widget bounds', () => {
      const widget = createWidget('a', 3, 3, 6, 4);
      expect(isPointInWidget({ x: 5, y: 5 }, widget.position, widget.dimensions)).toBe(true);
    });

    it('should return true when point is at widget top-left corner', () => {
      const widget = createWidget('a', 3, 3, 6, 4);
      expect(isPointInWidget({ x: 3, y: 3 }, widget.position, widget.dimensions)).toBe(true);
    });

    it('should return false when point is at widget bottom-right edge (exclusive)', () => {
      const widget = createWidget('a', 3, 3, 6, 4);
      expect(isPointInWidget({ x: 9, y: 7 }, widget.position, widget.dimensions)).toBe(false);
    });

    it('should return false when point is outside widget bounds', () => {
      const widget = createWidget('a', 3, 3, 6, 4);
      expect(isPointInWidget({ x: 10, y: 10 }, widget.position, widget.dimensions)).toBe(false);
    });
  });

  describe('dimensionsEqual', () => {
    it('should return true for identical dimensions', () => {
      expect(dimensionsEqual({ width: 6, height: 4 }, { width: 6, height: 4 })).toBe(true);
    });

    it('should return false for different widths', () => {
      expect(dimensionsEqual({ width: 6, height: 4 }, { width: 4, height: 4 })).toBe(false);
    });

    it('should return false for different heights', () => {
      expect(dimensionsEqual({ width: 6, height: 4 }, { width: 6, height: 3 })).toBe(false);
    });
  });

  describe('dimensionsCompatible', () => {
    it('should return true for identical dimensions', () => {
      expect(dimensionsCompatible({ width: 6, height: 4 }, { width: 6, height: 4 })).toBe(true);
    });

    it('should return true for same width, different height', () => {
      expect(dimensionsCompatible({ width: 6, height: 4 }, { width: 6, height: 3 })).toBe(true);
    });

    it('should return true for same height, different width', () => {
      expect(dimensionsCompatible({ width: 6, height: 4 }, { width: 4, height: 4 })).toBe(true);
    });

    it('should return false for completely different dimensions', () => {
      expect(dimensionsCompatible({ width: 6, height: 4 }, { width: 4, height: 3 })).toBe(false);
    });
  });

  describe('canWidgetFitAtPosition', () => {
    it('should return true when widget fits without collisions', () => {
      const section = createSection([createWidget('b', 0, 0, 3, 3)]);
      const widget = createWidget('a', 6, 6, 3, 3);

      expect(canWidgetFitAtPosition(widget, { x: 6, y: 0 }, section)).toBe(true);
    });

    it('should return false when widget exceeds grid width', () => {
      const section = createSection([]);
      const widget = createWidget('a', 0, 0, 6, 3);

      expect(canWidgetFitAtPosition(widget, { x: 7, y: 0 }, section)).toBe(false);
    });

    it('should return false when widget collides with another widget', () => {
      const section = createSection([createWidget('b', 3, 3, 6, 4)]);
      const widget = createWidget('a', 0, 0, 6, 3);

      expect(canWidgetFitAtPosition(widget, { x: 5, y: 4 }, section)).toBe(false);
    });

    it('should exclude the widget itself from collision checks', () => {
      const widget = createWidget('a', 0, 0, 4, 3);
      const section = createSection([widget, createWidget('b', 6, 0, 4, 3)]);

      // Widget A (width 4) can move to x=2 without colliding with itself or B (at x=6)
      expect(canWidgetFitAtPosition(widget, { x: 2, y: 0 }, section)).toBe(true);
    });
  });

  describe('isSwapSafe', () => {
    it("should return true when both widgets can occupy each other's positions", () => {
      const widgetA = createWidget('a', 0, 0, 6, 3);
      const widgetB = createWidget('b', 6, 0, 6, 3);
      const section = createSection([widgetA, widgetB]);

      expect(isSwapSafe(widgetA, widgetB, section)).toBe(true);
    });

    it('should return false when swapping would cause A to collide with another widget', () => {
      const widgetA = createWidget('a', 0, 0, 6, 3);
      const widgetB = createWidget('b', 6, 0, 6, 3);
      const widgetC = createWidget('c', 7, 1, 4, 2); // Overlaps with where A would be at B's position
      const section = createSection([widgetA, widgetB, widgetC]);

      expect(isSwapSafe(widgetA, widgetB, section)).toBe(false);
    });

    it('should return false when swapping would cause B to collide with another widget', () => {
      const widgetA = createWidget('a', 0, 0, 6, 3);
      const widgetB = createWidget('b', 6, 0, 6, 3);
      const widgetC = createWidget('c', 1, 1, 4, 2); // Overlaps with where B would be at A's position
      const section = createSection([widgetA, widgetB, widgetC]);

      expect(isSwapSafe(widgetA, widgetB, section)).toBe(false);
    });

    it('should handle widgets with different dimensions', () => {
      const widgetA = createWidget('a', 0, 0, 6, 2);
      const widgetB = createWidget('b', 6, 0, 6, 3);
      const section = createSection([widgetA, widgetB]);

      expect(isSwapSafe(widgetA, widgetB, section)).toBe(true);
    });
  });

  describe('detectSwapOpportunity', () => {
    it.each([
      ['mouse is over compatible widget', 6, 3],
      ['same width, different heights', 6, 2],
      ['same height, different widths', 4, 3],
    ])('should detect swap when %s', (_, widthA, heightA) => {
      const widgetA = createWidget('a', 0, 0, widthA, heightA);
      const widgetB = createWidget('b', 6, 0, 6, 3);
      const section = createSection([widgetA, widgetB]);

      const result = detectSwapOpportunity(widgetA, { x: 7, y: 1 }, section);
      expect(result).toEqual(widgetB);
    });

    it('should return null when mouse is not over any widget', () => {
      const widgetA = createWidget('a', 0, 0, 6, 3);
      const widgetB = createWidget('b', 6, 0, 6, 3);
      const section = createSection([widgetA, widgetB]);

      const result = detectSwapOpportunity(widgetA, { x: 0, y: 5 }, section);
      expect(result).toBeNull();
    });

    it('should return null when dimensions are not compatible', () => {
      const widgetA = createWidget('a', 0, 0, 6, 2);
      const widgetB = createWidget('b', 6, 0, 4, 3);
      const section = createSection([widgetA, widgetB]);

      const result = detectSwapOpportunity(widgetA, { x: 7, y: 1 }, section);
      expect(result).toBeNull();
    });

    it('should return null when swap would exceed grid bounds', () => {
      const widgetA = createWidget('a', 0, 0, 4, 3);
      const widgetB = createWidget('b', 9, 0, 3, 3);
      const section = createSection([widgetA, widgetB]);

      // A (width 4) at B's position (x=9) would exceed grid (9+4=13 > 12)
      const result = detectSwapOpportunity(widgetA, { x: 10, y: 1 }, section);
      expect(result).toBeNull();
    });

    it('should return null when swap is not safe (collision with other widgets)', () => {
      const widgetA = createWidget('a', 0, 0, 6, 3);
      const widgetB = createWidget('b', 6, 0, 6, 3);
      const widgetC = createWidget('c', 1, 1, 4, 2); // Overlaps with where B would be after swap
      const section = createSection([widgetA, widgetB, widgetC]);

      // Swapping A and B would cause B to collide with C at A's position
      const result = detectSwapOpportunity(widgetA, { x: 7, y: 1 }, section);
      expect(result).toBeNull();
    });
  });
});

describe('Widget Push Functions', () => {
  describe('findPushedWidgets', () => {
    it('should find widgets that overlap with expanded area', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 3);
      const widgetB = createWidget('b', 4, 0, 4, 3);
      const section = createSection([resizedWidget, widgetB]);

      const pushedWidgets = findPushedWidgets(resizedWidget, { width: 6, height: 3 }, section);
      expect(pushedWidgets).toHaveLength(1);
      expect(pushedWidgets[0].key).toBe('b');
    });

    it('should return empty array when widget is shrinking', () => {
      const resizedWidget = createWidget('a', 0, 0, 6, 3);
      const section = createSection([resizedWidget]);

      const pushedWidgets = findPushedWidgets(resizedWidget, { width: 4, height: 3 }, section);
      expect(pushedWidgets).toEqual([]);
    });

    it('should return empty array when no widgets overlap', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 3);
      const widgetB = createWidget('b', 6, 0, 4, 3);
      const section = createSection([resizedWidget, widgetB]);

      const pushedWidgets = findPushedWidgets(resizedWidget, { width: 5, height: 3 }, section);
      expect(pushedWidgets).toEqual([]);
    });

    it('should find multiple widgets when expansion affects several', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 2);
      const widgetB = createWidget('b', 4, 0, 4, 3);
      const widgetC = createWidget('c', 0, 2, 6, 2);
      const section = createSection([resizedWidget, widgetB, widgetC]);

      const pushedWidgets = findPushedWidgets(resizedWidget, { width: 6, height: 3 }, section);
      expect(pushedWidgets).toHaveLength(2);
      expect(pushedWidgets.map((w) => w.key).sort()).toEqual(['b', 'c']);
    });
  });

  describe('canPushWidgets', () => {
    it('should return true when widgets can be pushed to the right', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 3);
      const widgetB = createWidget('b', 4, 0, 4, 3);
      const section = createSection([resizedWidget, widgetB]);

      const pushedWidgets = [widgetB];
      const canPush = canPushWidgets(
        resizedWidget,
        { width: 6, height: 3 },
        pushedWidgets,
        section,
      );
      expect(canPush).toBe(true);
    });

    it('should return false when pushed widget would exceed grid bounds', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 3);
      const widgetB = createWidget('b', 4, 0, 8, 3);
      const section = createSection([resizedWidget, widgetB]);

      const pushedWidgets = [widgetB];
      // B is 8 wide at x=4, pushing by 2 would put it at x=6, width 8 -> exceeds 12
      const canPush = canPushWidgets(
        resizedWidget,
        { width: 6, height: 3 },
        pushedWidgets,
        section,
      );
      expect(canPush).toBe(false);
    });

    it('should return false when pushed widget would collide with another widget', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 3);
      const widgetB = createWidget('b', 4, 0, 4, 3);
      const widgetC = createWidget('c', 10, 0, 2, 3);
      const section = createSection([resizedWidget, widgetB, widgetC]);

      const pushedWidgets = [widgetB];
      // Pushing B by 4 (to x=8) would collide with C at x=10
      const canPush = canPushWidgets(
        resizedWidget,
        { width: 8, height: 3 },
        pushedWidgets,
        section,
      );
      expect(canPush).toBe(false);
    });

    it('should handle vertical push (expanding down)', () => {
      const resizedWidget = createWidget('a', 0, 0, 6, 2);
      const widgetB = createWidget('b', 0, 2, 6, 2);
      const section = createSection([resizedWidget, widgetB]);

      const pushedWidgets = [widgetB];
      const canPush = canPushWidgets(
        resizedWidget,
        { width: 6, height: 3 },
        pushedWidgets,
        section,
      );
      expect(canPush).toBe(true);
    });

    it('should return true for empty pushed widgets array', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 3);
      const section = createSection([resizedWidget]);

      const canPush = canPushWidgets(resizedWidget, { width: 6, height: 3 }, [], section);
      expect(canPush).toBe(true);
    });
  });

  describe('applyPushToWidgets', () => {
    it('should push widgets to the right when expanding horizontally', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 3);
      const widgetB = createWidget('b', 4, 0, 4, 3);
      const section = createSection([resizedWidget, widgetB]);

      const pushedWidgets = [widgetB];
      const result = applyPushToWidgets(
        resizedWidget,
        { width: 6, height: 3 },
        pushedWidgets,
        section,
      );

      const pushedB = result.children.find((w) => w.key === 'b');
      expect(pushedB?.position.x).toBe(6); // Pushed by 2 (from 4 to 6)
    });

    it('should push widgets down when expanding vertically', () => {
      const resizedWidget = createWidget('a', 0, 0, 6, 2);
      const widgetB = createWidget('b', 0, 2, 6, 2);
      const section = createSection([resizedWidget, widgetB]);

      const pushedWidgets = [widgetB];
      const result = applyPushToWidgets(
        resizedWidget,
        { width: 6, height: 3 },
        pushedWidgets,
        section,
      );

      const pushedB = result.children.find((w) => w.key === 'b');
      expect(pushedB?.position.y).toBe(3); // Pushed by 1 (from 2 to 3)
    });

    it('should not modify widgets that are not being pushed', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 3);
      const widgetB = createWidget('b', 4, 0, 4, 3);
      const widgetC = createWidget('c', 0, 3, 4, 3);
      const section = createSection([resizedWidget, widgetB, widgetC]);

      const pushedWidgets = [widgetB];
      const result = applyPushToWidgets(
        resizedWidget,
        { width: 6, height: 3 },
        pushedWidgets,
        section,
      );

      const unchangedC = result.children.find((w) => w.key === 'c');
      expect(unchangedC?.position).toEqual({ x: 0, y: 3 });
    });

    it('should return unchanged section when no widgets to push', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 3);
      const section = createSection([resizedWidget]);

      const result = applyPushToWidgets(resizedWidget, { width: 6, height: 3 }, [], section);
      expect(result).toEqual(section);
    });

    it('should handle pushing multiple widgets', () => {
      const resizedWidget = createWidget('a', 0, 0, 4, 3);
      const widgetB = createWidget('b', 4, 0, 4, 3);
      const widgetC = createWidget('c', 8, 0, 2, 3);
      const section = createSection([resizedWidget, widgetB, widgetC]);

      const pushedWidgets = [widgetB, widgetC];
      const result = applyPushToWidgets(
        resizedWidget,
        { width: 6, height: 3 },
        pushedWidgets,
        section,
      );

      const pushedB = result.children.find((w) => w.key === 'b');
      const pushedC = result.children.find((w) => w.key === 'c');
      expect(pushedB?.position.x).toBe(6);
      expect(pushedC?.position.x).toBe(10);
    });
  });
});
