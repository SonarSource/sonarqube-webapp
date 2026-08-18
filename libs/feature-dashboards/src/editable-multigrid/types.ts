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
 * Editable Multi-Grid Layout System
 *
 * A drag-and-drop grid layout system supporting multiple groups/sections,
 * with cards that can be moved between groups, resized, and reordered.
 */
import type React from 'react';

/**
 * Position in grid coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Dimensions in grid units
 */
export interface Dimensions {
  height: number;
  width: number;
}

/**
 * Represents a single card/item in the grid
 * Generic over WidgetType to support different widget types
 */
export interface Card {
  dimensions: Dimensions;
  key: string;
  position: Position;
}

/**
 * Represents a group/section containing multiple cards
 * Generic over T to support different card types extending Card
 */
export interface Group<CardType extends Card = Card> {
  children: CardType[];
  key: string;
}

/**
 * Shadow state during drag operations
 * Stored separately from Group to keep the data model clean
 */
export interface ShadowState<CardType extends Card = Card> {
  card: CardType;
  groupKey: string;
  sourceGroupKey: string;
}

/**
 * Layout configuration parameters
 */
export interface LayoutConfig {
  calWidth: number;
  col: number;
  containerHeight: number;
  containerPadding: [number, number];
  containerWidth: number;
  margin: [number, number];
  rowHeight: number;
}

/**
 * Position in pixels
 */
export interface PixelPosition {
  x: number;
  y: number;
}

/**
 * Size in pixels
 */
export interface PixelSize {
  hPx: number;
  wPx: number;
}

/**
 * Drag and drop monitor item
 */
export interface DragItem<CardType> {
  card?: CardType;
  groupKey?: string; // Source group key for the dragged card
  id: string;
  index?: number;
  layout?: LayoutConfig;
  type: string;
}

/**
 * Render function for card content
 */
export type RenderCardFunction<CardType> = (card: CardType, isDragging: boolean) => React.ReactNode;

/**
 * Render function for drag preview
 */
export type RenderDragPreviewFunction<CardType> = (
  card: CardType,
  dimensions: Dimensions,
) => React.ReactNode;

/**
 * Render function for group container
 * Receives the group data, children (the rendered grid), and index as props
 */
export type RenderGroupFunction<CardType extends Card, GroupType extends Group<CardType>> = (
  group: GroupType,
  children: React.ReactNode,
  index: number,
) => React.ReactNode;

/**
 * Props passed to the resize handle render function
 * Uses a ref pattern for clean event attachment
 */
export interface ResizeHandleElementProps {
  /** Whether the resize handle is hovered or focused */
  isHovered: boolean;
  /** Whether the card is currently being resized */
  isResizing: boolean;
  /** Keyboard handler for resize - attach to the focusable element */
  onKeyDown: React.KeyboardEventHandler;
  /** Ref callback to attach to the resize handle element - handles all mouse/keyboard events */
  resizeHandleRef: React.RefCallback<HTMLElement>;
}

/**
 * Render function for resize handle
 * Allows full customization of the resize handle appearance
 */
export type RenderResizeHandle = (props: ResizeHandleElementProps) => React.ReactNode;

/**
 * Props passed to the card header render function
 * The header can contain a drag handle, title, or any custom content
 */
export interface CardHeaderElementProps<CardType extends Card = Card> {
  /** Card data for displaying title or other info */
  card: CardType;
  /** Ref callback to attach to the draggable element (or the entire header if it should all be draggable) */
  dragHandleRef: React.RefCallback<HTMLElement>;
  /** Whether the card is currently being dragged (mouse) */
  isDragging: boolean;
  /** Whether the card is being dragged via keyboard */
  isKeyboardDragging: boolean;
  /** Callback to delete this card */
  onDelete: () => void;
  /** Callback to edit this card (optional - if not provided, edit button won't be shown) */
  onEdit?: () => void;
  /** Keyboard handler for drag initiation - attach to the focusable drag element */
  onKeyDown: React.KeyboardEventHandler;
}

/**
 * Render function for card header/drag handle
 * Allows full customization of the drag handle area - can be a simple handle,
 * a full-width title bar, or any combination
 */
export type RenderCardHeader<CardType extends Card = Card> = (
  props: CardHeaderElementProps<CardType>,
) => React.ReactNode;
