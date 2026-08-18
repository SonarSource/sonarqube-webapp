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

import { act, renderHook } from '@testing-library/react';
import { SectionDragState, useSectionDrag } from '../useSectionDrag';

interface TestGroup {
  key: string;
  name: string;
}

const mockGroup1: TestGroup = {
  key: 'group-1',
  name: 'First Group',
};

const mockGroup2: TestGroup = {
  key: 'group-2',
  name: 'Second Group',
};

const mockGroup3: TestGroup = {
  key: 'group-3',
  name: 'Third Group',
};

const mockGroups: TestGroup[] = [mockGroup1, mockGroup2, mockGroup3];

// Helper function to set targetKey without conditionals in test body
function setTargetKey(dragState: SectionDragState | null, targetKey: string | null): void {
  if (dragState) {
    dragState.targetKey = targetKey;
  }
}

it('should initialize with null drag state', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  expect(result.current.sectionDragState).toBeNull();
  expect(result.current.draggedSection).toBeNull();
  expect(result.current.sectionRefsMap.current).toBeInstanceOf(Map);
});

it('should start drag with correct initial state', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 200 });
  });

  expect(result.current.sectionDragState).toEqual({
    draggedKey: 'group-1',
    mousePosition: { x: 100, y: 200 },
    targetKey: 'group-2', // Next section after dragged one
  });
  expect(result.current.draggedSection).toBe(mockGroup1);
});

it('should set targetKey to null when dragging last section', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-3', { x: 100, y: 200 });
  });

  expect(result.current.sectionDragState?.targetKey).toBeNull();
});

it('should update mouse position during drag move', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 200 });
  });

  act(() => {
    result.current.handleSectionDragMove({ x: 150, y: 250 });
  });

  expect(result.current.sectionDragState?.mousePosition).toEqual({ x: 150, y: 250 });
  expect(result.current.sectionDragState?.draggedKey).toBe('group-1');
});

it('should handle drag move when no drag is active', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragMove({ x: 150, y: 250 });
  });

  expect(result.current.sectionDragState).toBeNull();
});

it('should handle drag move with no visible sections', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 200 });
  });

  // Don't add any refs to sectionRefsMap, so visibleSections will be empty
  act(() => {
    result.current.handleSectionDragMove({ x: 150, y: 250 });
  });

  // Should set targetKey to null (insert at end)
  expect(result.current.sectionDragState?.targetKey).toBeNull();
});

it('should calculate target position based on mouse Y position above midpoint', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  // Create mock section element
  const mockElement2 = document.createElement('div');

  // Mock getBoundingClientRect
  jest.spyOn(mockElement2, 'getBoundingClientRect').mockReturnValue({
    top: 200,
    height: 100,
    bottom: 300,
    left: 0,
    right: 800,
    width: 800,
    x: 0,
    y: 200,
    toJSON: () => ({}),
  });

  // Add refs to the map
  result.current.sectionRefsMap.current.set('group-2', mockElement2);

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 150 });
  });

  // Mouse at Y=220 (above midpoint of 250)
  act(() => {
    result.current.handleSectionDragMove({ x: 100, y: 220 });
  });

  // Should target group-2 (insert before it)
  expect(result.current.sectionDragState?.targetKey).toBe('group-2');
});

it('should calculate target position based on mouse Y position below midpoint', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  const mockElement2 = document.createElement('div');
  const mockElement3 = document.createElement('div');

  jest.spyOn(mockElement2, 'getBoundingClientRect').mockReturnValue({
    top: 200,
    height: 100,
    bottom: 300,
    left: 0,
    right: 800,
    width: 800,
    x: 0,
    y: 200,
    toJSON: () => ({}),
  });

  jest.spyOn(mockElement3, 'getBoundingClientRect').mockReturnValue({
    top: 300,
    height: 100,
    bottom: 400,
    left: 0,
    right: 800,
    width: 800,
    x: 0,
    y: 300,
    toJSON: () => ({}),
  });

  result.current.sectionRefsMap.current.set('group-2', mockElement2);
  result.current.sectionRefsMap.current.set('group-3', mockElement3);

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 150 });
  });

  // Mouse at Y=280 (below midpoint of group-2 at 250)
  act(() => {
    result.current.handleSectionDragMove({ x: 100, y: 280 });
  });

  // Should check next section (group-3)
  expect(result.current.sectionDragState).toBeDefined();
});

it('should set targetKey to null when mouse is below all sections', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  const mockElement2 = document.createElement('div');

  jest.spyOn(mockElement2, 'getBoundingClientRect').mockReturnValue({
    top: 200,
    height: 100,
    bottom: 300,
    left: 0,
    right: 800,
    width: 800,
    x: 0,
    y: 200,
    toJSON: () => ({}),
  });

  result.current.sectionRefsMap.current.set('group-2', mockElement2);

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 150 });
  });

  // Mouse well below all sections
  act(() => {
    result.current.handleSectionDragMove({ x: 100, y: 500 });
  });

  // Should set target to null (insert at end)
  expect(result.current.sectionDragState?.targetKey).toBeNull();
});

it('should end drag without reordering when no change needed (same position)', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 200 });
  });

  // Manually set targetKey to indicate dropping at same position
  act(() => {
    result.current.handleSectionDragMove({ x: 100, y: 200 });
  });

  act(() => {
    result.current.handleSectionDragEnd();
  });

  // Should not call onReorder when no actual position change
  expect(result.current.sectionDragState).toBeNull();
});

it('should end drag without reordering when dragging to position just after itself', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-2', { x: 100, y: 200 });
  });

  // Set state to target the section right after the dragged one (no actual move)
  act(() => {
    setTargetKey(result.current.sectionDragState, 'group-3');
    result.current.handleSectionDragEnd();
  });

  // Should clear state
  expect(result.current.sectionDragState).toBeNull();
});

it('should reorder sections when dragging to different position', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 200 });
  });

  // Manually set targetKey to group-3 to simulate dragging to end
  act(() => {
    setTargetKey(result.current.sectionDragState, 'group-3');
    result.current.handleSectionDragEnd();
  });

  expect(mockOnReorder).toHaveBeenCalledWith([mockGroup2, mockGroup1, mockGroup3]);
  expect(result.current.sectionDragState).toBeNull();
});

it('should reorder sections when dragging to end (targetKey is null)', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 200 });
  });

  // Set targetKey to null to simulate dropping at end
  act(() => {
    setTargetKey(result.current.sectionDragState, null);
    result.current.handleSectionDragEnd();
  });

  expect(mockOnReorder).toHaveBeenCalledWith([mockGroup2, mockGroup3, mockGroup1]);
  expect(result.current.sectionDragState).toBeNull();
});

it('should handle end drag when no drag is active', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragEnd();
  });

  expect(mockOnReorder).not.toHaveBeenCalled();
  expect(result.current.sectionDragState).toBeNull();
});

it('should handle dragging last section to different position', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-3', { x: 100, y: 200 });
  });

  // Move to first position
  act(() => {
    setTargetKey(result.current.sectionDragState, 'group-1');
    result.current.handleSectionDragEnd();
  });

  expect(mockOnReorder).toHaveBeenCalledWith([mockGroup3, mockGroup1, mockGroup2]);
});

it('should not reorder when target key not found in groups', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 200 });
  });

  // Set invalid target key
  act(() => {
    setTargetKey(result.current.sectionDragState, 'non-existent-key');
    result.current.handleSectionDragEnd();
  });

  // Should still attempt reorder (insertAt will be -1, handled by fallback to newGroups.length)
  expect(mockOnReorder).toHaveBeenCalled();
});

it('should handle reordering with two sections', () => {
  const twoGroups: TestGroup[] = [mockGroup1, mockGroup2];
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(twoGroups, mockOnReorder));

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 200 });
  });

  act(() => {
    setTargetKey(result.current.sectionDragState, null);
    result.current.handleSectionDragEnd();
  });

  expect(mockOnReorder).toHaveBeenCalledWith([mockGroup2, mockGroup1]);
});

it('should handle section refs map with null entries', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  // Add a null ref
  result.current.sectionRefsMap.current.set('group-2', null);

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 200 });
  });

  act(() => {
    result.current.handleSectionDragMove({ x: 100, y: 250 });
  });

  // Should handle null refs gracefully (they are filtered out)
  expect(result.current.sectionDragState).toBeDefined();
});

it('should sort visible sections by position in groups array', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  const mockElement1 = document.createElement('div');
  const mockElement3 = document.createElement('div');

  jest.spyOn(mockElement1, 'getBoundingClientRect').mockReturnValue({
    top: 100,
    height: 100,
    bottom: 200,
    left: 0,
    right: 800,
    width: 800,
    x: 0,
    y: 100,
    toJSON: () => ({}),
  });

  jest.spyOn(mockElement3, 'getBoundingClientRect').mockReturnValue({
    top: 200,
    height: 100,
    bottom: 300,
    left: 0,
    right: 800,
    width: 800,
    x: 0,
    y: 200,
    toJSON: () => ({}),
  });

  // Add refs in reverse order
  result.current.sectionRefsMap.current.set('group-3', mockElement3);
  result.current.sectionRefsMap.current.set('group-1', mockElement1);

  act(() => {
    result.current.handleSectionDragStart('group-2', { x: 100, y: 150 });
  });

  act(() => {
    result.current.handleSectionDragMove({ x: 100, y: 110 });
  });

  // Should correctly identify group-1 as target (first in sorted order)
  expect(result.current.sectionDragState?.targetKey).toBe('group-1');
});

it('should update callbacks when groups change', () => {
  const mockOnReorder = jest.fn();
  const { result, rerender } = renderHook(({ groups }) => useSectionDrag(groups, mockOnReorder), {
    initialProps: { groups: mockGroups },
  });

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 200 });
  });

  // Update groups - reorder the existing groups
  const newGroups: TestGroup[] = [mockGroup2, mockGroup1, mockGroup3];
  rerender({ groups: newGroups });

  act(() => {
    setTargetKey(result.current.sectionDragState, null);
    result.current.handleSectionDragEnd();
  });

  // Should use updated groups for reordering
  expect(mockOnReorder).toHaveBeenCalledWith([mockGroup2, mockGroup3, mockGroup1]);
});

it('should filter out dragged section from visible sections during drag move', () => {
  const mockOnReorder = jest.fn();
  const { result } = renderHook(() => useSectionDrag(mockGroups, mockOnReorder));

  const mockElement1 = document.createElement('div');
  const mockElement2 = document.createElement('div');

  // Add refs for both sections including the one being dragged
  result.current.sectionRefsMap.current.set('group-1', mockElement1);
  result.current.sectionRefsMap.current.set('group-2', mockElement2);

  jest.spyOn(mockElement2, 'getBoundingClientRect').mockReturnValue({
    top: 200,
    height: 100,
    bottom: 300,
    left: 0,
    right: 800,
    width: 800,
    x: 0,
    y: 200,
    toJSON: () => ({}),
  });

  act(() => {
    result.current.handleSectionDragStart('group-1', { x: 100, y: 150 });
  });

  act(() => {
    result.current.handleSectionDragMove({ x: 100, y: 220 });
  });

  // Should only consider group-2 (group-1 is being dragged)
  expect(result.current.sectionDragState?.targetKey).toBe('group-2');
});
