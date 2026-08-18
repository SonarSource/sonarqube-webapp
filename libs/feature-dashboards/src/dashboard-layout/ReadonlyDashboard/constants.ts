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

export const GRID_CONSTANTS = {
  // Layout
  GAP: '16px',
  PADDING: '16px',
  ROW_HEIGHT: 40, // px
  BORDER_RADIUS: '8px',

  // Transitions
  TRANSITION_DURATION: '150ms',
  TRANSITION_EASING: 'ease-in-out',

  // Spacing
  SECTION_MARGIN_BOTTOM: '16px',
} as const;

/** Parsed padding/gap (px) — keep in sync with `GRID_CONSTANTS` token strings. */
const GRID_GAP_PX = Number.parseInt(GRID_CONSTANTS.GAP, 10);
const GRID_PADDING_PX = Number.parseInt(GRID_CONSTANTS.PADDING, 10);

/** Row budget for implicit sections while an explicit section is being dragged (compact preview). */
const IMPLICIT_SECTION_MINIMIZED_ROW_COUNT_DURING_DRAG = 3;

// Helper to calculate section content height
export function calculateSectionHeight(maxRows: number): number {
  return maxRows * GRID_CONSTANTS.ROW_HEIGHT + (maxRows - 1) * GRID_GAP_PX + GRID_PADDING_PX * 2; // top and bottom padding of the grid region
}

function implicitSectionMinimizedPaddedMaxHeightPx(maxRows: number): number {
  return calculateSectionHeight(maxRows);
}

/**
 * Border-box `max-height` in px for the implicit-section clip wrapper during explicit-section drag.
 * Height matches the grid region (containerPadding is on the multigrid, not this wrapper).
 */
export function implicitSectionDragMinimizeClipHeightPx(): number {
  return implicitSectionMinimizedPaddedMaxHeightPx(
    IMPLICIT_SECTION_MINIMIZED_ROW_COUNT_DURING_DRAG,
  );
}
