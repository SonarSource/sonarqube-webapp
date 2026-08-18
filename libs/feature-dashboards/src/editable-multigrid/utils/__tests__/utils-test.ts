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
import {
  calcGridItemPixelSize,
  calColWidth,
  calcWH,
  calGridItemPosition,
  calGridXY,
  calWHtoPx,
  checkInContainer,
  clamp,
  getContainerMaxHeight,
  layoutBottom,
} from '../utils';

describe('calColWidth', () => {
  it('should calculate column width with margins', () => {
    // containerWidth=800, col=6, padding=[10,10], margin=[10,10]
    // Formula: (800 - 10*2 - 10*(6+1)) / 6 = (800 - 20 - 70) / 6 = 710 / 6 ≈ 118.33
    const result = calColWidth(800, 6, [10, 10], [10, 10]);
    expect(result).toBeCloseTo(118.33, 1);
  });

  it('should calculate column width without margins', () => {
    // containerWidth=800, col=6, padding=[10,10], margin=[0,0]
    // Formula: (800 - 10*2) / 6 = 780 / 6 = 130
    const result = calColWidth(800, 6, [10, 10], [0, 0]);
    expect(result).toBe(130);
  });

  it('should handle zero padding', () => {
    // containerWidth=600, col=6, padding=[0,0], margin=[10,10]
    // Formula: (600 - 0 - 10*7) / 6 = (600 - 70) / 6 = 530 / 6 ≈ 88.33
    const result = calColWidth(600, 6, [0, 0], [10, 10]);
    expect(result).toBeCloseTo(88.33, 1);
  });

  it('should handle single column', () => {
    // containerWidth=200, col=1, padding=[10,10], margin=[5,5]
    // Formula: (200 - 10*2 - 5*2) / 1 = (200 - 20 - 10) / 1 = 170
    const result = calColWidth(200, 1, [10, 10], [5, 5]);
    expect(result).toBe(170);
  });
});

describe('layoutBottom', () => {
  const createCard = (y: number, height: number): Card => ({
    key: `card-${y}-${height}`,
    position: { x: 0, y },
    dimensions: { width: 1, height },
  });

  it('should return 0 for empty layout', () => {
    expect(layoutBottom([])).toBe(0);
  });

  it('should return bottom of single card', () => {
    const layout = [createCard(0, 2)];
    expect(layoutBottom(layout)).toBe(2);
  });

  it('should return bottom of lowest card', () => {
    const layout = [createCard(0, 2), createCard(3, 1), createCard(1, 4)];
    // Card at y=1 with height=4 ends at y=5
    expect(layoutBottom(layout)).toBe(5);
  });
});

describe('getContainerMaxHeight', () => {
  const createCard = (y: number, height: number): Card => ({
    key: `card-${y}-${height}`,
    position: { x: 0, y },
    dimensions: { width: 1, height },
  });

  it('should calculate container height', () => {
    // Cards end at row 3, rowHeight=100, margin=[10,10]
    // Formula: 3 * 100 + (3-1) * 10 + 2 * 10 = 300 + 20 + 20 = 340
    const layout = [createCard(0, 3)];
    expect(getContainerMaxHeight(layout, 100, [10, 10])).toBe(340);
  });

  it('should handle empty layout', () => {
    // 0 rows: 0 * 100 + (0-1) * 10 + 2 * 10 = 0 - 10 + 20 = 10
    expect(getContainerMaxHeight([], 100, [10, 10])).toBe(10);
  });
});

describe('calGridItemPosition', () => {
  it('should calculate pixel position from grid coordinates', () => {
    // gridx=2, gridy=1, margin=[10,10], rowHeight=100, calWidth=120
    // x = round(2 * 120 + 10 * 3) = round(240 + 30) = 270
    // y = round(1 * 100 + 10 * 2) = round(100 + 20) = 120
    const result = calGridItemPosition(2, 1, [10, 10], 100, 120);
    expect(result.x).toBe(270);
    expect(result.y).toBe(120);
  });

  it('should handle zero position', () => {
    // x = round(0 * 120 + 10 * 1) = 10
    // y = round(0 * 100 + 10 * 1) = 10
    const result = calGridItemPosition(0, 0, [10, 10], 100, 120);
    expect(result.x).toBe(10);
    expect(result.y).toBe(10);
  });
});

describe('checkInContainer', () => {
  it('should return position unchanged when within bounds', () => {
    const result = checkInContainer(2, 3, 6, 2);
    expect(result).toEqual({ x: 2, y: 3 });
  });

  it('should clamp position to right boundary', () => {
    // gridX=5, width=2 would overflow col=6, so clamp to 6-2=4
    const result = checkInContainer(5, 0, 6, 2);
    expect(result).toEqual({ x: 4, y: 0 });
  });

  it('should clamp position to left boundary', () => {
    const result = checkInContainer(-1, 0, 6, 2);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('should clamp position to top boundary', () => {
    const result = checkInContainer(0, -1, 6, 2);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('should clamp to both boundaries', () => {
    const result = checkInContainer(-5, -5, 6, 2);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('should handle card width equal to column count', () => {
    const result = checkInContainer(0, 0, 6, 6);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('should clamp when card width exceeds column count', () => {
    // Card wider than container should be clamped to left edge
    const result = checkInContainer(2, 0, 6, 8);
    expect(result.x).toBeLessThanOrEqual(0);
  });
});

describe('calGridXY', () => {
  it('should convert pixel coordinates to grid coordinates', () => {
    // x=300, y=150, containerWidth=800, col=6
    // gridX = floor((300/800) * 6) = floor(2.25) = 2
    // gridY = floor(150 / (100 + 10)) = floor(1.36) = 1
    const result = calGridXY(300, 150, 2, [10, 10], 800, 6, 100);
    expect(result.x).toBe(2);
    expect(result.y).toBe(1);
  });

  it('should clamp to container bounds', () => {
    // Very large x and y should be clamped
    const result = calGridXY(9999, 9999, 2, [10, 10], 800, 6, 100);
    expect(result.x).toBe(4); // 6 - 2 = 4 (max x for width=2)
    expect(result.y).toBeGreaterThan(0);
  });

  it('should handle zero coordinates', () => {
    const result = calGridXY(0, 0, 1, [10, 10], 800, 6, 100);
    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe('calWHtoPx', () => {
  it('should convert grid dimensions to pixels', () => {
    // w=2, h=3, margin=[10,10], rowHeight=100, calWidth=120
    // wPx = round(2 * 120 + (2-1) * 10) = round(240 + 10) = 250
    // hPx = round(3 * 100 + (3-1) * 10) = round(300 + 20) = 320
    const result = calWHtoPx(2, 3, [10, 10], 100, 120);
    expect(result.wPx).toBe(250);
    expect(result.hPx).toBe(320);
  });

  it('should handle single unit dimensions', () => {
    // w=1, h=1: no inter-item margins
    // wPx = round(1 * 120 + 0 * 10) = 120
    // hPx = round(1 * 100 + 0 * 10) = 100
    const result = calWHtoPx(1, 1, [10, 10], 100, 120);
    expect(result.wPx).toBe(120);
    expect(result.hPx).toBe(100);
  });
});

describe('calcWH', () => {
  it('should convert pixel dimensions to grid units', () => {
    // pixelW=250, pixelH=320, calWidth=120, rowHeight=100, margin=[10,10]
    // w = round((250 + 10) / (120 + 10)) = round(260/130) = 2
    // h = round((320 + 10) / (100 + 10)) = round(330/110) = 3
    const result = calcWH(250, 320, 120, 100, [10, 10]);
    expect(result.w).toBe(2);
    expect(result.h).toBe(3);
  });

  it('should round to nearest grid unit', () => {
    // Slightly larger dimensions should still round correctly
    const result = calcWH(260, 330, 120, 100, [10, 10]);
    expect(result.w).toBe(2);
    expect(result.h).toBe(3);
  });
});

describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('should return min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('should return max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should handle edge cases', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('calcGridItemPixelSize', () => {
  it('should calculate pixel size from grid dimensions', () => {
    // w=2, h=3, calWidth=120, rowHeight=100, margin=[10,10]
    // width = 2 * 120 + (2-1) * 10 = 240 + 10 = 250
    // height = 3 * 100 + (3-1) * 10 = 300 + 20 = 320
    const result = calcGridItemPixelSize(2, 3, 120, 100, [10, 10]);
    expect(result.width).toBe(250);
    expect(result.height).toBe(320);
  });

  it('should handle single unit dimensions', () => {
    const result = calcGridItemPixelSize(1, 1, 120, 100, [10, 10]);
    expect(result.width).toBe(120);
    expect(result.height).toBe(100);
  });
});
