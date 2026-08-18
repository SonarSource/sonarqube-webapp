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

import type { Card, PixelPosition, PixelSize, Position } from '../types';

/**
 * Calculates the width of each column given the total number of columns
 * @returns Width of a single cell in pixels
 */
export const calColWidth = (
  containerWidth: number,
  col: number,
  containerPadding: [number, number],
  margin: [number, number],
): number => {
  if (margin) {
    return (containerWidth - containerPadding[0] * 2 - margin[0] * (col + 1)) / col;
  }
  return (containerWidth - containerPadding[0] * 2) / col;
};

/**
 * Gets the Y coordinate of the bottommost cell in the current layout
 * @returns Y coordinate of the bottom cell
 */
export const layoutBottom = (layout: Card[]): number => {
  let max = 0;
  let bottomY: number;
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].position.y + layout[i].dimensions.height;
    if (bottomY > max) {
      max = bottomY;
    }
  }
  return max;
};

/**
 * Calculates the maximum height of the card container
 * @returns Container height in pixels
 */
export const getContainerMaxHeight = (
  cards: Card[],
  rowHeight: number,
  margin: [number, number],
): number => {
  const resultRow = layoutBottom(cards);
  return resultRow * rowHeight + (resultRow - 1) * margin[1] + 2 * margin[1];
};

/**
 * Converts grid position to pixel coordinates in the container
 * @returns Object containing x, y coordinates in pixels
 */
export const calGridItemPosition = (
  gridx: number,
  gridy: number,
  margin: [number, number],
  rowHeight: number,
  calWidth: number,
): PixelPosition => {
  const x = Math.round(gridx * calWidth + margin[0] * (gridx + 1));
  const y = Math.round(gridy * rowHeight + margin[1] * (gridy + 1));
  return { x, y };
};

/**
 * Prevents an element from overflowing the container boundaries
 * @param w Card width in grid units
 * @returns Grid coordinates object with x and y
 */
export const checkInContainer = (
  gridX: number,
  gridY: number,
  col: number,
  w: number,
): Position => {
  // Clamp X to valid range [0, col - w]
  const safeGridX = Math.max(0, Math.min(gridX, col - w));
  // Clamp Y to valid range [0, infinity)
  const safeGridY = Math.max(0, gridY);

  return { x: safeGridX, y: safeGridY };
};

/**
 * Calculates grid cell coordinates from pixel coordinates (x, y)
 * @returns Object containing gridx and gridy cell coordinates
 */
export const calGridXY = (
  x: number,
  y: number,
  cardWidth: number,
  margin: [number, number],
  containerWidth: number,
  col: number,
  rowHeight: number,
): Position => {
  // When converting coordinates to grid cells, round down without considering margin
  const gridX = Math.floor((x / containerWidth) * col);
  const gridY = Math.floor(y / (rowHeight + (margin ? margin[1] : 0)));
  // Prevent card from overflowing container
  return checkInContainer(gridX, gridY, col, cardWidth);
};

/**
 * Converts width and height to pixels
 * @returns Object containing wPx and hPx
 */
export const calWHtoPx = (
  w: number,
  h: number,
  margin: [number, number],
  rowHeight: number,
  calWidth: number,
): PixelSize => {
  const wPx = Math.round(w * calWidth + (w - 1) * margin[0]);
  const hPx = Math.round(h * rowHeight + (h - 1) * margin[1]);
  return { hPx, wPx };
};

/**
 * Convert pixel dimensions to grid units
 * @param pixelW Width in pixels
 * @param pixelH Height in pixels
 * @param calWidth Column width in pixels
 * @param rowHeight Row height in pixels
 * @param margin Margin between grid items
 * @returns Grid width and height as Dimensions
 */
export const calcWH = (
  pixelW: number,
  pixelH: number,
  calWidth: number,
  rowHeight: number,
  margin: [number, number],
): { h: number; w: number } => {
  const w = Math.round((pixelW + margin[0]) / (calWidth + margin[0]));
  const h = Math.round((pixelH + margin[1]) / (rowHeight + margin[1]));
  return { h, w };
};

/**
 * Clamp a value between min and max
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calculate pixel dimensions for a grid item
 * @param w Width in grid units
 * @param h Height in grid units
 * @param calWidth Column width in pixels
 * @param rowHeight Row height in pixels
 * @param margin Margin between grid items
 * @returns Pixel width and height
 */
export const calcGridItemPixelSize = (
  w: number,
  h: number,
  calWidth: number,
  rowHeight: number,
  margin: [number, number],
): { height: number; width: number } => {
  const width = w * calWidth + (w - 1) * margin[0];
  const height = h * rowHeight + (h - 1) * margin[1];
  return { height, width };
};
