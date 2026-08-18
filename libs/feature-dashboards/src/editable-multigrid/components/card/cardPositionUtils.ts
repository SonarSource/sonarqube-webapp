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

import type { LayoutConfig, Position } from '../../types';
import { calcGridItemPixelSize, calGridItemPosition, calWHtoPx } from '../../utils';

/**
 * Calculate pixel position and size for a card
 */
export function calculateCardTransform(
  gridPosition: Position,
  dimensions: { height: number; width: number },
  layout: LayoutConfig,
  resizeDimensions: { height: number; width: number } | null,
) {
  const { calWidth, margin, rowHeight } = layout;

  // Calculate pixel position
  const pixelPosition = calGridItemPosition(
    gridPosition.x,
    gridPosition.y,
    margin,
    rowHeight,
    calWidth,
  );
  const { x, y } = pixelPosition;

  // Calculate pixel size
  const pixelSize = calWHtoPx(dimensions.width, dimensions.height, margin, rowHeight, calWidth);
  const { hPx, wPx } = pixelSize;

  // Use resize dimensions during active resize, otherwise use grid-based dimensions
  const actualWidth = resizeDimensions?.width ?? wPx;
  const actualHeight = resizeDimensions?.height ?? hPx;

  return {
    actualHeight,
    actualWidth,
    baseHeight: hPx,
    baseWidth: wPx,
    x,
    y,
  };
}

/**
 * Calculate resize constraints for a card
 */
export function calculateResizeConstraints(
  position: Position,
  minSize: { height: number; width: number },
  maxSize: { height: number; width: number },
  col: number,
  layout: LayoutConfig,
) {
  const { calWidth, margin, rowHeight } = layout;

  // Maximum width is constrained by card's maxSize.width and remaining space to right edge
  const maxWidthInGrid = Math.min(maxSize.width, col - position.x);

  const minConstraints = calcGridItemPixelSize(
    minSize.width,
    minSize.height,
    calWidth,
    rowHeight,
    margin,
  );

  const maxConstraints = calcGridItemPixelSize(
    maxWidthInGrid,
    maxSize.height,
    calWidth,
    rowHeight,
    margin,
  );

  return { maxConstraints, maxWidthInGrid, minConstraints };
}
