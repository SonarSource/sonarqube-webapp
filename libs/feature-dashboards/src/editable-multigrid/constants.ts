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

/**
 * Layout Configuration Constants
 *
 * These values define the grid layout behavior for the editable multigrid component.
 * They are designed to work together with the Echoes design system.
 */

/**
 * Default margin between grid items [horizontal, vertical] in pixels.
 * Matches the Echoes spacing scale (dimension-space-200).
 */
export const DEFAULT_GRID_MARGIN: [number, number] = [16, 16];

/**
 * Default container padding [horizontal, vertical] in pixels.
 * Set to 0 as the parent container typically provides padding.
 */
export const DEFAULT_CONTAINER_PADDING: [number, number] = [0, 0];

/**
 * Animation & Transition Constants
 */

/**
 * Standard transition duration for card movements and resizing.
 * Kept short for responsive feel while still providing visual feedback.
 */
const TRANSITION_DURATION_MS = 200;

/**
 * CSS transition timing for smooth animations.
 */
const TRANSITION_EASE = 'ease-out';

/**
 * Standard transition CSS for card position/size changes.
 */
export const CARD_TRANSITION = `all ${TRANSITION_DURATION_MS}ms ${TRANSITION_EASE}`;

/**
 * Resize & Drag Behavior Constants
 */

/**
 * Debounce delay for container resize handling.
 * Prevents excessive recalculations during window resize.
 */
export const RESIZE_DEBOUNCE_MS = 150;

/**
 * Opacity for cards being dragged.
 * Semi-transparent to indicate the card's original position.
 */
export const DRAG_OPACITY = 0.5;

/**
 * Opacity for resize shadow preview.
 */
export const RESIZE_SHADOW_OPACITY = 0.3;

/**
 * Z-index for cards during resize.
 * Ensures the resizing card appears above other cards.
 */
export const RESIZE_Z_INDEX = 2;

/**
 * Card Styling Constants
 * These match the Echoes design system.
 */

/**
 * Border radius for cards matching Echoes component styling.
 */
export const CARD_BORDER_RADIUS = '4px';

/**
 * Internal padding for card content.
 * Matches Echoes dimension-space-200.
 */
export const CARD_PADDING = '16px';

/**
 * CSS selector for finding layout content containers.
 * Used to measure accurate width for grid calculations.
 */
export const LAYOUT_CONTENT_SELECTOR = '[data-layout-pagecontent], [data-page-content]';
