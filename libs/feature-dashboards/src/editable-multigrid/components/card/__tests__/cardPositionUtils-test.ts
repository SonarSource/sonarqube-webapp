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

import type { LayoutConfig } from '../../../types';
import { calculateCardTransform, calculateResizeConstraints } from '../cardPositionUtils';

describe('calculateCardTransform', () => {
  const mockLayout: LayoutConfig = {
    calWidth: 120,
    col: 6,
    containerHeight: 300,
    containerPadding: [10, 10],
    containerWidth: 800,
    margin: [10, 10],
    rowHeight: 100,
  };

  it('should calculate correct pixel position and size', () => {
    const gridPosition = { x: 2, y: 1 };
    const dimensions = { width: 2, height: 2 };

    const result = calculateCardTransform(gridPosition, dimensions, mockLayout, null);

    // x = round(2 * 120 + 10 * 3) = 270
    // y = round(1 * 100 + 10 * 2) = 120
    expect(result.x).toBe(270);
    expect(result.y).toBe(120);
    // width = round(2 * 120 + 1 * 10) = 250
    // height = round(2 * 100 + 1 * 10) = 210
    expect(result.baseWidth).toBe(250);
    expect(result.baseHeight).toBe(210);
    expect(result.actualWidth).toBe(250);
    expect(result.actualHeight).toBe(210);
  });

  it('should use resize dimensions when provided', () => {
    const gridPosition = { x: 0, y: 0 };
    const dimensions = { width: 1, height: 1 };
    const resizeDimensions = { width: 300, height: 250 };

    const result = calculateCardTransform(gridPosition, dimensions, mockLayout, resizeDimensions);

    expect(result.actualWidth).toBe(300);
    expect(result.actualHeight).toBe(250);
    // Base dimensions should still be calculated from grid
    expect(result.baseWidth).toBe(120);
    expect(result.baseHeight).toBe(100);
  });

  it('should handle zero position', () => {
    const gridPosition = { x: 0, y: 0 };
    const dimensions = { width: 1, height: 1 };

    const result = calculateCardTransform(gridPosition, dimensions, mockLayout, null);

    // x = round(0 * 120 + 10 * 1) = 10
    // y = round(0 * 100 + 10 * 1) = 10
    expect(result.x).toBe(10);
    expect(result.y).toBe(10);
  });
});

describe('calculateResizeConstraints', () => {
  const mockLayout: LayoutConfig = {
    calWidth: 120,
    col: 6,
    containerHeight: 300,
    containerPadding: [10, 10],
    containerWidth: 800,
    margin: [10, 10],
    rowHeight: 100,
  };

  it('should calculate constraints based on min/max size', () => {
    const position = { x: 0, y: 0 };
    const minSize = { width: 1, height: 1 };
    const maxSize = { width: 4, height: 4 };

    const result = calculateResizeConstraints(position, minSize, maxSize, 6, mockLayout);

    // minConstraints: 1x1 grid = 120x100 pixels
    expect(result.minConstraints.width).toBe(120);
    expect(result.minConstraints.height).toBe(100);

    // maxConstraints: 4x4 grid (not limited by position at x=0)
    // width = 4 * 120 + 3 * 10 = 480 + 30 = 510
    // height = 4 * 100 + 3 * 10 = 400 + 30 = 430
    expect(result.maxConstraints.width).toBe(510);
    expect(result.maxConstraints.height).toBe(430);
    expect(result.maxWidthInGrid).toBe(4);
  });

  it('should limit max width based on position near right edge', () => {
    const position = { x: 4, y: 0 }; // Only 2 columns available to the right
    const minSize = { width: 1, height: 1 };
    const maxSize = { width: 4, height: 4 };

    const result = calculateResizeConstraints(position, minSize, maxSize, 6, mockLayout);

    // At x=4 with col=6, only 2 columns available (6-4=2)
    // maxWidthInGrid = min(4, 2) = 2
    expect(result.maxWidthInGrid).toBe(2);
    // width = 2 * 120 + 1 * 10 = 240 + 10 = 250
    expect(result.maxConstraints.width).toBe(250);
  });

  it('should handle minimum size larger than available space', () => {
    const position = { x: 5, y: 0 }; // Only 1 column available
    const minSize = { width: 1, height: 1 };
    const maxSize = { width: 6, height: 3 };

    const result = calculateResizeConstraints(position, minSize, maxSize, 6, mockLayout);

    expect(result.maxWidthInGrid).toBe(1);
    expect(result.maxConstraints.width).toBe(120);
  });
});
