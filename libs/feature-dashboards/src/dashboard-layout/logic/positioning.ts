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
  Dimensions,
  ImplicitSectionInstance,
  Position,
  SectionInstance,
  WidgetInstance,
} from './types';

// Sort lexicographically by position.y then position.x
export function sortWidgets<T>(widgets: WidgetInstance<T>[]): WidgetInstance<T>[] {
  return widgets.sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
}

export function getSectionHeight<T>(section: SectionInstance<T>): number {
  return Math.max(
    0,
    ...section.children.map((child) => child.position.y + child.dimensions.height),
  );
}

export function joinSections<T>(a: ImplicitSectionInstance<T>, b: ImplicitSectionInstance<T>) {
  const aHeight = getSectionHeight(a);
  return normalizeSection({
    children: [
      ...a.children,
      ...b.children.map((child) => ({
        ...child,
        position: { x: child.position.x, y: child.position.y + aHeight },
      })),
    ],
    type: 'implicit',
  });
}

export function normalizeSection<T>(section: SectionInstance<T>): SectionInstance<T> {
  // Process widgets one by one, applying drop positioning to each
  const normalizedWidgets: WidgetInstance<T>[] = [];

  for (const widget of sortWidgets(section.children)) {
    // Create a temporary section with only the widgets we've already processed
    const tempSection: SectionInstance<T> = {
      ...section,
      children: normalizedWidgets,
    };

    // Get the drop position for this widget
    const newPosition = getDropPosition(widget.position, widget.dimensions, tempSection);

    // Add the widget with its new position to our normalized list
    const updatedWidget = {
      ...widget,
      position: newPosition,
    };
    normalizedWidgets.push(updatedWidget);
  }

  // Sort the normalized widgets and return the section
  return {
    ...section,
    children: sortWidgets(normalizedWidgets),
  };
}

function getDropPosition<T>(
  position: Position,
  dimensions: Dimensions,
  section: SectionInstance<T>,
): Position {
  const currentPosition = { ...position };

  // First, if the starting position collides, move down/right until we find a valid position
  while (collidesWithAnyWidget(currentPosition, dimensions, section)) {
    // Try moving right first (prefer horizontal movement)
    currentPosition.x += 1;

    // If we've gone too far right, wrap to next row
    if (currentPosition.x + dimensions.width > 12) {
      currentPosition.x = 0;
      currentPosition.y += 1;
    }
  }

  // Now compact: try moving up and left as much as possible
  // Should always terminate early
  for (let iterations = 0; iterations < 20; iterations++) {
    let moved = false;

    // Try moving up
    while (
      currentPosition.y > 0 &&
      !collidesWithAnyWidget(
        { x: currentPosition.x, y: currentPosition.y - 1 },
        dimensions,
        section,
      )
    ) {
      currentPosition.y -= 1;
      moved = true;
    }

    // Try moving left
    while (
      currentPosition.x > 0 &&
      !collidesWithAnyWidget(
        { x: currentPosition.x - 1, y: currentPosition.y },
        dimensions,
        section,
      )
    ) {
      currentPosition.x -= 1;
      moved = true;
    }

    if (!moved) {
      break;
    }
  }

  return currentPosition;
}

function rectanglesCollide(
  pos1: Position,
  dim1: Dimensions,
  pos2: Position,
  dim2: Dimensions,
): boolean {
  return !(
    pos1.x >= pos2.x + dim2.width ||
    pos2.x >= pos1.x + dim1.width ||
    pos1.y >= pos2.y + dim2.height ||
    pos2.y >= pos1.y + dim1.height
  );
}

function collidesWithAnyWidget<T>(
  position: Position,
  dimensions: Dimensions,
  section: SectionInstance<T>,
): boolean {
  return section.children.some((widget) => {
    return rectanglesCollide(position, dimensions, widget.position, widget.dimensions);
  });
}

export function getWidgetDropPosition<T>(
  widget: WidgetInstance<T>,
  section: SectionInstance<T>,
): Position {
  const sectionWithoutWidget: SectionInstance<T> = {
    ...section,
    children: section.children.filter((child) => child.key !== widget.key),
  };

  return getDropPosition(widget.position, widget.dimensions, sectionWithoutWidget);
}

export function splitSection<T>(
  section: SectionInstance<T>,
  y: number,
): [SectionInstance<T>, SectionInstance<T>] {
  const sectionAbove = {
    ...section,
    children: section.children.filter((child) => child.position.y < y),
  };

  const sectionBelow = {
    ...section,
    children: section.children
      .filter((child) => child.position.y >= y)
      .map((child) => ({
        ...child,
        position: { x: child.position.x, y: child.position.y - y },
      })),
  };

  return [sectionAbove, sectionBelow];
}

/**
 * Check if a position is valid (no collisions) in a section
 */
export function isValidDropPosition<T>(
  position: Position,
  dimensions: Dimensions,
  section: SectionInstance<T>,
): boolean {
  if (position.x < 0 || position.y < 0) {
    return false;
  }
  if (position.x + dimensions.width > 12) {
    return false;
  }

  // Check for collisions with existing widgets
  return !collidesWithAnyWidget(position, dimensions, section);
}

/**
 * Convert mouse coordinates to grid coordinates within a section
 */
export function mouseToGridPosition(
  mouseX: number,
  mouseY: number,
  sectionRect: DOMRect,
  gridWidth: number,
): Position {
  // Calculate relative position within the section
  const relativeX = mouseX - sectionRect.left;
  const relativeY = mouseY - sectionRect.top;

  // Convert to grid coordinates
  // Assuming standard grid constants from ReadonlyDashboard
  const GRID_GAP = 8;
  const ROW_HEIGHT = 40;
  const SECTION_PADDING = 16;

  // Account for section padding
  const contentX = Math.max(0, relativeX - SECTION_PADDING);
  const contentY = Math.max(0, relativeY - SECTION_PADDING);

  // Calculate cell size based on available width
  const availableWidth = sectionRect.width - 2 * SECTION_PADDING;
  const cellWidth = (availableWidth - GRID_GAP * (gridWidth - 1)) / gridWidth;

  // Convert to grid coordinates
  const gridX = Math.floor(contentX / (cellWidth + GRID_GAP));
  const gridY = Math.floor(contentY / (ROW_HEIGHT + GRID_GAP));

  return {
    x: Math.max(0, Math.min(gridX, gridWidth - 1)),
    y: Math.max(0, gridY),
  };
}

export const findLastImplicitSectionIndex = <WPM extends {}>(
  sections: SectionInstance<WPM>[],
): number => {
  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].type === 'implicit') {
      return i;
    }
  }
  return -1;
};

/**
 * Find widgets that would be pushed by resizing a widget to new dimensions
 * Returns widgets that overlap with the expanded area
 */
export function findPushedWidgets<T>(
  resizedWidget: WidgetInstance<T>,
  newDimensions: Dimensions,
  section: SectionInstance<T>,
): WidgetInstance<T>[] {
  const oldDimensions = resizedWidget.dimensions;
  const { position } = resizedWidget;

  // Calculate the expansion area (the new space the widget will occupy)
  const expandedRight = position.x + newDimensions.width > position.x + oldDimensions.width;
  const expandedDown = position.y + newDimensions.height > position.y + oldDimensions.height;

  if (!expandedRight && !expandedDown) {
    return []; // Widget is shrinking or staying same size, no push needed
  }

  // Find widgets that overlap with the new expanded area
  return section.children.filter((widget) => {
    if (widget.key === resizedWidget.key) {
      return false;
    }

    // Check if this widget collides with the expanded widget
    return rectanglesCollide(position, newDimensions, widget.position, widget.dimensions);
  });
}

/**
 * Calculate the new position for a pushed widget
 */
function calculatePushedWidgetPosition<T>(
  widget: WidgetInstance<T>,
  resizePosition: Position,
  oldDimensions: Dimensions,
  deltaWidth: number,
  deltaHeight: number,
): Position {
  const newPosition = { ...widget.position };

  // Determine push direction based on where the widget is relative to expansion
  if (deltaWidth > 0 && widget.position.x >= resizePosition.x + oldDimensions.width) {
    // Widget is to the right, push right
    newPosition.x += deltaWidth;
  } else if (deltaHeight > 0 && widget.position.y >= resizePosition.y + oldDimensions.height) {
    // Widget is below, push down
    newPosition.y += deltaHeight;
  } else {
    // Widget overlaps in a complex way, try pushing right first
    if (deltaWidth > 0) {
      newPosition.x += deltaWidth;
    }
    if (deltaHeight > 0) {
      newPosition.y += deltaHeight;
    }
  }

  return newPosition;
}

/**
 * Check if a pushed widget at its new position would collide with other pushed widgets
 */
function wouldCollidWithOtherPushedWidgets<T>(
  pushedWidget: WidgetInstance<T>,
  newPosition: Position,
  pushedWidgets: WidgetInstance<T>[],
  resizePosition: Position,
  oldDimensions: Dimensions,
  deltaWidth: number,
  deltaHeight: number,
): boolean {
  for (const otherPushed of pushedWidgets) {
    if (otherPushed.key !== pushedWidget.key) {
      const otherNewPosition = calculatePushedWidgetPosition(
        otherPushed,
        resizePosition,
        oldDimensions,
        deltaWidth,
        deltaHeight,
      );

      if (
        rectanglesCollide(
          newPosition,
          pushedWidget.dimensions,
          otherNewPosition,
          otherPushed.dimensions,
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a single pushed widget can safely move to its new position
 */
function canPushWidget<T>(
  pushedWidget: WidgetInstance<T>,
  resizedWidget: WidgetInstance<T>,
  newDimensions: Dimensions,
  pushedWidgets: WidgetInstance<T>[],
  otherWidgets: WidgetInstance<T>[],
  deltaWidth: number,
  deltaHeight: number,
): boolean {
  const oldDimensions = resizedWidget.dimensions;
  const { position } = resizedWidget;

  const newPosition = calculatePushedWidgetPosition(
    pushedWidget,
    position,
    oldDimensions,
    deltaWidth,
    deltaHeight,
  );

  // Check if new position exceeds grid bounds
  if (newPosition.x + pushedWidget.dimensions.width > 12) {
    return false;
  }

  // Check if new position would collide with the resized widget
  if (rectanglesCollide(newPosition, pushedWidget.dimensions, position, newDimensions)) {
    return false;
  }

  // Check if new position would collide with other non-pushed widgets
  const wouldCollideWithOthers = otherWidgets.some((other) =>
    rectanglesCollide(newPosition, pushedWidget.dimensions, other.position, other.dimensions),
  );

  if (wouldCollideWithOthers) {
    return false;
  }

  // Check collisions with other pushed widgets at their new positions
  return !wouldCollidWithOtherPushedWidgets(
    pushedWidget,
    newPosition,
    pushedWidgets,
    position,
    oldDimensions,
    deltaWidth,
    deltaHeight,
  );
}

/**
 * Check if pushed widgets can safely move to accommodate a resize
 * For horizontal expansion: try to push widgets to the right
 * For vertical expansion: try to push widgets down
 */
export function canPushWidgets<T>(
  resizedWidget: WidgetInstance<T>,
  newDimensions: Dimensions,
  pushedWidgets: WidgetInstance<T>[],
  section: SectionInstance<T>,
): boolean {
  if (pushedWidgets.length === 0) {
    return true;
  }

  const oldDimensions = resizedWidget.dimensions;
  const deltaWidth = newDimensions.width - oldDimensions.width;
  const deltaHeight = newDimensions.height - oldDimensions.height;

  // Get all other widgets (not being resized or pushed)
  const otherWidgets = section.children.filter(
    (w) => w.key !== resizedWidget.key && !pushedWidgets.some((p) => p.key === w.key),
  );

  // Check if each pushed widget can move to its new position
  return pushedWidgets.every((pushedWidget) =>
    canPushWidget(
      pushedWidget,
      resizedWidget,
      newDimensions,
      pushedWidgets,
      otherWidgets,
      deltaWidth,
      deltaHeight,
    ),
  );
}

/**
 * Apply push to widgets, returning updated section
 */
export function applyPushToWidgets<T>(
  resizedWidget: WidgetInstance<T>,
  newDimensions: Dimensions,
  pushedWidgets: WidgetInstance<T>[],
  section: SectionInstance<T>,
): SectionInstance<T> {
  if (pushedWidgets.length === 0) {
    return section;
  }

  const oldDimensions = resizedWidget.dimensions;
  const { position } = resizedWidget;
  const deltaWidth = newDimensions.width - oldDimensions.width;
  const deltaHeight = newDimensions.height - oldDimensions.height;

  const pushedWidgetKeys = new Set(pushedWidgets.map((w) => w.key));

  return {
    ...section,
    children: section.children.map((widget) => {
      if (!pushedWidgetKeys.has(widget.key)) {
        return widget;
      }

      const newPosition = calculatePushedWidgetPosition(
        widget,
        position,
        oldDimensions,
        deltaWidth,
        deltaHeight,
      );

      return {
        ...widget,
        position: newPosition,
      };
    }),
  };
}

/**
 * Check if a point is within a widget's bounds
 */
export function isPointInWidget(
  point: Position,
  widgetPosition: Position,
  widgetDimensions: Dimensions,
): boolean {
  return (
    point.x >= widgetPosition.x &&
    point.x < widgetPosition.x + widgetDimensions.width &&
    point.y >= widgetPosition.y &&
    point.y < widgetPosition.y + widgetDimensions.height
  );
}

/**
 * Check if two dimensions are exactly equal
 */
export function dimensionsEqual(dim1: Dimensions, dim2: Dimensions): boolean {
  return dim1.width === dim2.width && dim1.height === dim2.height;
}

/**
 * Check if two dimensions share at least one common dimension (same width OR same height)
 */
export function dimensionsCompatible(dim1: Dimensions, dim2: Dimensions): boolean {
  return dim1.width === dim2.width || dim1.height === dim2.height;
}

/**
 * Check if a widget can fit at a specific position without collisions or exceeding bounds
 */
export function canWidgetFitAtPosition<T>(
  widget: WidgetInstance<T>,
  targetPosition: Position,
  section: SectionInstance<T>,
): boolean {
  // Check if widget would exceed grid bounds
  if (targetPosition.x + widget.dimensions.width > 12) {
    return false;
  }

  // Y position can extend infinitely, so no check needed

  // Check if widget would collide with other widgets (excluding the widget itself)
  const otherWidgets = section.children.filter((w) => w.key !== widget.key);
  return !otherWidgets.some((other) =>
    rectanglesCollide(targetPosition, widget.dimensions, other.position, other.dimensions),
  );
}

/**
 * Check if swapping two widgets would cause collisions with other widgets
 */
export function isSwapSafe<T>(
  widgetA: WidgetInstance<T>,
  widgetB: WidgetInstance<T>,
  section: SectionInstance<T>,
): boolean {
  // Get all other widgets (excluding A and B)
  const otherWidgets = section.children.filter(
    (w) => w.key !== widgetA.key && w.key !== widgetB.key,
  );

  // Check if A at B's position would collide with any other widget
  const aAtBPosition = otherWidgets.some((widget) =>
    rectanglesCollide(widgetB.position, widgetA.dimensions, widget.position, widget.dimensions),
  );

  // Check if B at A's position would collide with any other widget
  const bAtAPosition = otherWidgets.some((widget) =>
    rectanglesCollide(widgetA.position, widgetB.dimensions, widget.position, widget.dimensions),
  );

  return !aAtBPosition && !bAtAPosition;
}

/**
 * Detect if there's an opportunity to swap the dragged widget with another widget
 * Returns the widget that can be swapped with, or null if no swap is possible
 *
 * Allows swapping when widgets share at least one dimension (same width OR same height)
 * and both can fit in each other's positions without collisions.
 */
export function detectSwapOpportunity<T>(
  draggedWidget: WidgetInstance<T>,
  mouseGridPosition: Position,
  section: SectionInstance<T>,
): WidgetInstance<T> | null {
  // Find widget at mouse position
  const targetWidget = section.children.find(
    (widget) =>
      widget.key !== draggedWidget.key &&
      isPointInWidget(mouseGridPosition, widget.position, widget.dimensions),
  );

  if (!targetWidget) {
    return null;
  }

  // Check if dimensions are compatible (share at least one dimension)
  if (!dimensionsCompatible(draggedWidget.dimensions, targetWidget.dimensions)) {
    return null;
  }

  // Check if widgets would exceed grid bounds at their new positions
  if (draggedWidget.dimensions.width + targetWidget.position.x > 12) {
    return null;
  }
  if (targetWidget.dimensions.width + draggedWidget.position.x > 12) {
    return null;
  }

  // Check if swap is safe (no collisions would occur)
  if (!isSwapSafe(draggedWidget, targetWidget, section)) {
    return null;
  }

  return targetWidget;
}
