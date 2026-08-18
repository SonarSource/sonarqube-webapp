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

import { useCallback, useRef, useState } from 'react';

/**
 * Section drag state - uses string keys, not indices
 */
export interface SectionDragState {
  draggedKey: string;
  mousePosition: { x: number; y: number };
  // Key of section to insert BEFORE, or null to insert at end
  targetKey: string | null;
}

/**
 * Hook for managing section drag-and-drop state and operations.
 *
 * Handles:
 * - Tracking drag state (dragged section, mouse position, drop target)
 * - Computing drop target based on mouse position
 * - Reordering sections on drop
 * - Managing section element refs for position calculations
 *
 * @param groups - Current section groups
 * @param onReorder - Callback when sections are reordered
 * @returns Drag state and handlers
 */
export function useSectionDrag<GroupType extends { key: string }>(
  groups: GroupType[],
  onReorder: (newGroups: GroupType[]) => void,
) {
  const [sectionDragState, setSectionDragState] = useState<SectionDragState | null>(null);
  // Use ref to avoid closure issues with event listeners
  const sectionDragStateRef = useRef<SectionDragState | null>(null);
  sectionDragStateRef.current = sectionDragState;
  // Store refs to section elements by key
  const sectionRefsMap = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const handleSectionDragStart = useCallback(
    (sectionKey: string, mousePos: { x: number; y: number }) => {
      // Find the section after the dragged one to use as initial target
      const draggedIndex = groups.findIndex((g) => g.key === sectionKey);
      const nextSection = groups[draggedIndex + 1];
      // If there's a next section, target it; otherwise insert at end (null)
      const initialTargetKey = nextSection ? nextSection.key : null;

      setSectionDragState({
        draggedKey: sectionKey,
        mousePosition: mousePos,
        targetKey: initialTargetKey,
      });
    },
    [groups],
  );

  const handleSectionDragMove = useCallback(
    (mousePos: { x: number; y: number }) => {
      const currentDragState = sectionDragStateRef.current;
      if (!currentDragState) {
        return;
      }

      // Get visible section refs (non-dragged ones) sorted by their position in groups array
      const visibleSections: Array<{ element: HTMLDivElement; key: string }> = [];
      sectionRefsMap.current.forEach((element, key) => {
        if (element && key !== currentDragState.draggedKey) {
          visibleSections.push({ element, key });
        }
      });

      // Sort by position in groups array
      const groupsRef = groups; // Capture for closure
      visibleSections.sort((a, b) => {
        const indexA = groupsRef.findIndex((g) => g.key === a.key);
        const indexB = groupsRef.findIndex((g) => g.key === b.key);
        return indexA - indexB;
      });

      // Default: insert at end (null means after all sections)
      let newTargetKey: string | null = null;

      if (visibleSections.length === 0) {
        // No other sections, insert at end
        newTargetKey = null;
      } else {
        // Check each visible section
        let foundPosition = false;
        for (const { element, key } of visibleSections) {
          const rect = element.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;

          if (mousePos.y < midY) {
            // Mouse is above this section's midpoint - insert before it
            newTargetKey = key;
            foundPosition = true;
            break;
          }
        }

        if (!foundPosition) {
          // Mouse is below all visible sections - insert at end
          newTargetKey = null;
        }
      }

      setSectionDragState((prev) =>
        prev ? { ...prev, mousePosition: mousePos, targetKey: newTargetKey } : null,
      );
    },
    [groups],
  );

  const handleSectionDragEnd = useCallback(() => {
    const currentDragState = sectionDragStateRef.current;
    if (!currentDragState) {
      return;
    }

    const { draggedKey, targetKey } = currentDragState;

    // Find indices for reordering
    const draggedIndex = groups.findIndex((g) => g.key === draggedKey);
    const targetIndex =
      targetKey === null ? groups.length : groups.findIndex((g) => g.key === targetKey);

    // Check if actual reorder is needed
    const noChange =
      draggedIndex === targetIndex ||
      draggedIndex === targetIndex - 1 ||
      (targetKey === null && draggedIndex === groups.length - 1);

    if (!noChange && draggedIndex !== -1) {
      const newGroups = [...groups];
      const [draggedGroup] = newGroups.splice(draggedIndex, 1);

      // Calculate insertion point after removal
      const insertAt =
        targetKey === null ? newGroups.length : newGroups.findIndex((g) => g.key === targetKey);

      newGroups.splice(insertAt === -1 ? newGroups.length : insertAt, 0, draggedGroup);
      onReorder(newGroups);
    }

    setSectionDragState(null);
  }, [groups, onReorder]);

  // Get the dragged section for ghost rendering
  const draggedSection = sectionDragState
    ? groups.find((g) => g.key === sectionDragState.draggedKey)
    : null;

  return {
    sectionDragState,
    draggedSection,
    sectionRefsMap,
    handleSectionDragStart,
    handleSectionDragMove,
    handleSectionDragEnd,
  };
}
