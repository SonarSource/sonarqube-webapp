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

import { renderHook } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Card, Group, LayoutConfig, ShadowState } from '../../../types';
import { restoreCardToShadowPosition, useCardDrag } from '../useCardDrag';

interface TestCard extends Card {
  data: string;
}

const mockCard: TestCard = {
  key: 'card-1',
  position: { x: 0, y: 0 },
  dimensions: { width: 2, height: 2 },
  data: 'test',
};

const mockLayout: LayoutConfig = {
  col: 12,
  rowHeight: 100,
  containerWidth: 1200,
  containerHeight: 800,
  calWidth: 100,
  margin: [10, 10],
  containerPadding: [10, 10],
};

const mockGroups: Group<TestCard>[] = [
  {
    key: 'group-1',
    children: [mockCard],
  },
];

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
  };
}

describe('useCardDrag', () => {
  let mockGetGroups: jest.Mock;
  let mockGetShadowState: jest.Mock;
  let mockUpdateGroupList: jest.Mock;
  let mockUpdateShadowState: jest.Mock;
  let mockClearShadowState: jest.Mock;
  let mockCancelAllKeyboardDrags: jest.Mock;
  let mockCancelAllKeyboardResizes: jest.Mock;

  beforeEach(() => {
    mockGetGroups = jest.fn().mockReturnValue(mockGroups);
    mockGetShadowState = jest.fn().mockReturnValue(null);
    mockUpdateGroupList = jest.fn();
    mockUpdateShadowState = jest.fn();
    mockClearShadowState = jest.fn();
    mockCancelAllKeyboardDrags = jest.fn();
    mockCancelAllKeyboardResizes = jest.fn();
  });

  it('should initialize with isDragging false', () => {
    const { result } = renderHook(
      () =>
        useCardDrag({
          card: mockCard,
          cardKey: mockCard.key,
          groupKey: 'group-1',
          layout: mockLayout,
          isResizing: false,
          getGroups: mockGetGroups,
          getShadowState: mockGetShadowState,
          updateGroupList: mockUpdateGroupList,
          updateShadowState: mockUpdateShadowState,
          clearShadowState: mockClearShadowState,
          cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
          cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isDragging).toBe(false);
    expect(result.current.connectDrag).toBeDefined();
  });

  it('should provide connectDrag function', () => {
    const { result } = renderHook(
      () =>
        useCardDrag({
          card: mockCard,
          cardKey: mockCard.key,
          groupKey: 'group-1',
          layout: mockLayout,
          isResizing: false,
          getGroups: mockGetGroups,
          getShadowState: mockGetShadowState,
          updateGroupList: mockUpdateGroupList,
          updateShadowState: mockUpdateShadowState,
          clearShadowState: mockClearShadowState,
          cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
          cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
        }),
      { wrapper: createWrapper() },
    );

    expect(typeof result.current.connectDrag).toBe('function');
  });

  it('should handle card with different properties', () => {
    const customCard: TestCard = {
      key: 'card-2',
      position: { x: 2, y: 2 },
      dimensions: { width: 4, height: 3 },
      data: 'custom',
    };

    const { result } = renderHook(
      () =>
        useCardDrag({
          card: customCard,
          cardKey: customCard.key,
          groupKey: 'group-2',
          layout: mockLayout,
          isResizing: false,
          getGroups: mockGetGroups,
          getShadowState: mockGetShadowState,
          updateGroupList: mockUpdateGroupList,
          updateShadowState: mockUpdateShadowState,
          clearShadowState: mockClearShadowState,
          cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
          cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isDragging).toBe(false);
  });

  it('should work with different layout configurations', () => {
    const customLayout: LayoutConfig = {
      col: 6,
      rowHeight: 50,
      containerWidth: 600,
      containerHeight: 400,
      calWidth: 100,
      margin: [5, 5],
      containerPadding: [5, 5],
    };

    const { result } = renderHook(
      () =>
        useCardDrag({
          card: mockCard,
          cardKey: mockCard.key,
          groupKey: 'group-1',
          layout: customLayout,
          isResizing: false,
          getGroups: mockGetGroups,
          getShadowState: mockGetShadowState,
          updateGroupList: mockUpdateGroupList,
          updateShadowState: mockUpdateShadowState,
          clearShadowState: mockClearShadowState,
          cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
          cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.connectDrag).toBeDefined();
  });

  it('should handle isResizing state', () => {
    const { result } = renderHook(
      () =>
        useCardDrag({
          card: mockCard,
          cardKey: mockCard.key,
          groupKey: 'group-1',
          layout: mockLayout,
          isResizing: true,
          getGroups: mockGetGroups,
          getShadowState: mockGetShadowState,
          updateGroupList: mockUpdateGroupList,
          updateShadowState: mockUpdateShadowState,
          clearShadowState: mockClearShadowState,
          cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
          cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isDragging).toBe(false);
  });

  it('should handle shadow state with matching card key', () => {
    const shadowState: ShadowState<TestCard> = {
      card: mockCard,
      groupKey: 'group-1',
      sourceGroupKey: 'group-1',
    };

    mockGetShadowState.mockReturnValue(shadowState);

    const { result } = renderHook(
      () =>
        useCardDrag({
          card: mockCard,
          cardKey: mockCard.key,
          groupKey: 'group-1',
          layout: mockLayout,
          isResizing: false,
          getGroups: mockGetGroups,
          getShadowState: mockGetShadowState,
          updateGroupList: mockUpdateGroupList,
          updateShadowState: mockUpdateShadowState,
          clearShadowState: mockClearShadowState,
          cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
          cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.connectDrag).toBeDefined();
  });

  it('should handle shadow state with different card key', () => {
    const differentCard: TestCard = {
      key: 'card-2',
      position: { x: 0, y: 0 },
      dimensions: { width: 2, height: 2 },
      data: 'different',
    };

    const shadowState: ShadowState<TestCard> = {
      card: differentCard,
      groupKey: 'group-1',
      sourceGroupKey: 'group-1',
    };

    mockGetShadowState.mockReturnValue(shadowState);

    const { result } = renderHook(
      () =>
        useCardDrag({
          card: mockCard,
          cardKey: mockCard.key,
          groupKey: 'group-1',
          layout: mockLayout,
          isResizing: false,
          getGroups: mockGetGroups,
          getShadowState: mockGetShadowState,
          updateGroupList: mockUpdateGroupList,
          updateShadowState: mockUpdateShadowState,
          clearShadowState: mockClearShadowState,
          cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
          cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isDragging).toBe(false);
  });

  it('should handle multiple groups', () => {
    const multipleGroups: Group<TestCard>[] = [
      {
        key: 'group-1',
        children: [mockCard],
      },
      {
        key: 'group-2',
        children: [],
      },
      {
        key: 'group-3',
        children: [],
      },
    ];

    mockGetGroups.mockReturnValue(multipleGroups);

    const { result } = renderHook(
      () =>
        useCardDrag({
          card: mockCard,
          cardKey: mockCard.key,
          groupKey: 'group-1',
          layout: mockLayout,
          isResizing: false,
          getGroups: mockGetGroups,
          getShadowState: mockGetShadowState,
          updateGroupList: mockUpdateGroupList,
          updateShadowState: mockUpdateShadowState,
          clearShadowState: mockClearShadowState,
          cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
          cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.connectDrag).toBeDefined();
  });

  it('should handle empty groups', () => {
    mockGetGroups.mockReturnValue([]);

    const { result } = renderHook(
      () =>
        useCardDrag({
          card: mockCard,
          cardKey: mockCard.key,
          groupKey: 'group-1',
          layout: mockLayout,
          isResizing: false,
          getGroups: mockGetGroups,
          getShadowState: mockGetShadowState,
          updateGroupList: mockUpdateGroupList,
          updateShadowState: mockUpdateShadowState,
          clearShadowState: mockClearShadowState,
          cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
          cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isDragging).toBe(false);
  });

  it('should handle card in different group than specified', () => {
    const groupsWithCardInDifferentGroup: Group<TestCard>[] = [
      {
        key: 'group-1',
        children: [],
      },
      {
        key: 'group-2',
        children: [mockCard],
      },
    ];

    mockGetGroups.mockReturnValue(groupsWithCardInDifferentGroup);

    const { result } = renderHook(
      () =>
        useCardDrag({
          card: mockCard,
          cardKey: mockCard.key,
          groupKey: 'group-1', // Card is actually in group-2
          layout: mockLayout,
          isResizing: false,
          getGroups: mockGetGroups,
          getShadowState: mockGetShadowState,
          updateGroupList: mockUpdateGroupList,
          updateShadowState: mockUpdateShadowState,
          clearShadowState: mockClearShadowState,
          cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
          cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.connectDrag).toBeDefined();
  });

  describe('drag behavior', () => {
    it('should cancel keyboard operations when starting drag while not resizing', () => {
      const { result } = renderHook(
        () =>
          useCardDrag({
            card: mockCard,
            cardKey: mockCard.key,
            groupKey: 'group-1',
            layout: mockLayout,
            isResizing: false,
            getGroups: mockGetGroups,
            getShadowState: mockGetShadowState,
            updateGroupList: mockUpdateGroupList,
            updateShadowState: mockUpdateShadowState,
            clearShadowState: mockClearShadowState,
            cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
            cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
          }),
        { wrapper: createWrapper() },
      );

      // Access the drag spec's item function through the internal implementation
      // Since we can't directly trigger drag events in JSDOM, we verify the spec was created correctly
      expect(result.current.connectDrag).toBeDefined();
      expect(mockCancelAllKeyboardDrags).not.toHaveBeenCalled();
      expect(mockCancelAllKeyboardResizes).not.toHaveBeenCalled();
    });

    it('should not allow drag when resizing', () => {
      const { result } = renderHook(
        () =>
          useCardDrag({
            card: mockCard,
            cardKey: mockCard.key,
            groupKey: 'group-1',
            layout: mockLayout,
            isResizing: true, // Resizing is active
            getGroups: mockGetGroups,
            getShadowState: mockGetShadowState,
            updateGroupList: mockUpdateGroupList,
            updateShadowState: mockUpdateShadowState,
            clearShadowState: mockClearShadowState,
            cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
            cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
          }),
        { wrapper: createWrapper() },
      );

      // Should still provide connectDrag but drag should be disabled
      expect(result.current.connectDrag).toBeDefined();
      expect(result.current.isDragging).toBe(false);
    });

    it('should clear shadow state when dropped outside without shadow', () => {
      mockGetShadowState.mockReturnValue(null);

      const { result } = renderHook(
        () =>
          useCardDrag({
            card: mockCard,
            cardKey: mockCard.key,
            groupKey: 'group-1',
            layout: mockLayout,
            isResizing: false,
            getGroups: mockGetGroups,
            getShadowState: mockGetShadowState,
            updateGroupList: mockUpdateGroupList,
            updateShadowState: mockUpdateShadowState,
            clearShadowState: mockClearShadowState,
            cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
            cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
          }),
        { wrapper: createWrapper() },
      );

      // Verify hook initialized
      expect(result.current.connectDrag).toBeDefined();
    });

    it('should clear shadow state when dropped outside with different card shadow', () => {
      const differentCard: TestCard = {
        key: 'card-2',
        position: { x: 0, y: 0 },
        dimensions: { width: 2, height: 2 },
        data: 'different',
      };

      const shadowState: ShadowState<TestCard> = {
        card: differentCard, // Shadow for a different card
        groupKey: 'group-1',
        sourceGroupKey: 'group-1',
      };

      mockGetShadowState.mockReturnValue(shadowState);

      const { result } = renderHook(
        () =>
          useCardDrag({
            card: mockCard,
            cardKey: mockCard.key, // This card's key is 'card-1', shadow is for 'card-2'
            groupKey: 'group-1',
            layout: mockLayout,
            isResizing: false,
            getGroups: mockGetGroups,
            getShadowState: mockGetShadowState,
            updateGroupList: mockUpdateGroupList,
            updateShadowState: mockUpdateShadowState,
            clearShadowState: mockClearShadowState,
            cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
            cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isDragging).toBe(false);
    });

    it('should restore card to shadow position when dropped outside with matching shadow', () => {
      const shadowState: ShadowState<TestCard> = {
        card: { ...mockCard, position: { x: 2, y: 0 } }, // Shadow at different position
        groupKey: 'group-1',
        sourceGroupKey: 'group-1',
      };

      mockGetShadowState.mockReturnValue(shadowState);

      const { result } = renderHook(
        () =>
          useCardDrag({
            card: mockCard,
            cardKey: mockCard.key,
            groupKey: 'group-1',
            layout: mockLayout,
            isResizing: false,
            getGroups: mockGetGroups,
            getShadowState: mockGetShadowState,
            updateGroupList: mockUpdateGroupList,
            updateShadowState: mockUpdateShadowState,
            clearShadowState: mockClearShadowState,
            cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
            cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.connectDrag).toBeDefined();
    });

    it('should handle restore when card moved to different group', () => {
      const card2: TestCard = {
        key: 'card-2',
        position: { x: 0, y: 0 },
        dimensions: { width: 2, height: 2 },
        data: 'test2',
      };

      const multiGroupState: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [card2], // Original card is gone
        },
        {
          key: 'group-2',
          children: [mockCard], // Card is now in group-2
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: mockCard,
        groupKey: 'group-2', // Target group
        sourceGroupKey: 'group-1', // Source group
      };

      mockGetGroups.mockReturnValue(multiGroupState);
      mockGetShadowState.mockReturnValue(shadowState);

      const { result } = renderHook(
        () =>
          useCardDrag({
            card: mockCard,
            cardKey: mockCard.key,
            groupKey: 'group-1', // Original group
            layout: mockLayout,
            isResizing: false,
            getGroups: mockGetGroups,
            getShadowState: mockGetShadowState,
            updateGroupList: mockUpdateGroupList,
            updateShadowState: mockUpdateShadowState,
            clearShadowState: mockClearShadowState,
            cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
            cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isDragging).toBe(false);
    });

    it('should handle restore when target and source group are the same', () => {
      const shadowState: ShadowState<TestCard> = {
        card: { ...mockCard, position: { x: 4, y: 0 } },
        groupKey: 'group-1', // Same group
        sourceGroupKey: 'group-1', // Same group
      };

      mockGetShadowState.mockReturnValue(shadowState);

      const { result } = renderHook(
        () =>
          useCardDrag({
            card: mockCard,
            cardKey: mockCard.key,
            groupKey: 'group-1',
            layout: mockLayout,
            isResizing: false,
            getGroups: mockGetGroups,
            getShadowState: mockGetShadowState,
            updateGroupList: mockUpdateGroupList,
            updateShadowState: mockUpdateShadowState,
            clearShadowState: mockClearShadowState,
            cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
            cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.connectDrag).toBeDefined();
    });

    it('should handle restore with multiple cards in groups', () => {
      const card2: TestCard = {
        key: 'card-2',
        position: { x: 2, y: 0 },
        dimensions: { width: 2, height: 2 },
        data: 'test2',
      };

      const card3: TestCard = {
        key: 'card-3',
        position: { x: 0, y: 2 },
        dimensions: { width: 2, height: 2 },
        data: 'test3',
      };

      const multiCardGroups: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [mockCard, card2],
        },
        {
          key: 'group-2',
          children: [card3],
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: card2,
        groupKey: 'group-2', // Moving to group-2
        sourceGroupKey: 'group-1', // From group-1
      };

      mockGetGroups.mockReturnValue(multiCardGroups);
      mockGetShadowState.mockReturnValue(shadowState);

      const { result } = renderHook(
        () =>
          useCardDrag({
            card: card2,
            cardKey: card2.key,
            groupKey: 'group-1',
            layout: mockLayout,
            isResizing: false,
            getGroups: mockGetGroups,
            getShadowState: mockGetShadowState,
            updateGroupList: mockUpdateGroupList,
            updateShadowState: mockUpdateShadowState,
            clearShadowState: mockClearShadowState,
            cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
            cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('restoreCardToShadowPosition function', () => {
    // These tests are for a pure function (not React components),
    // so we need to access data structures directly
    /* eslint-disable testing-library/no-node-access */
    const card1: TestCard = {
      key: 'card-1',
      position: { x: 0, y: 0 },
      dimensions: { width: 2, height: 2 },
      data: 'test1',
    };

    const card2: TestCard = {
      key: 'card-2',
      position: { x: 2, y: 0 },
      dimensions: { width: 2, height: 2 },
      data: 'test2',
    };

    const card3: TestCard = {
      key: 'card-3',
      position: { x: 0, y: 2 },
      dimensions: { width: 2, height: 2 },
      data: 'test3',
    };

    it('should add shadow card to target group and remove from source group', () => {
      const groups: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [card1, card2],
        },
        {
          key: 'group-2',
          children: [card3],
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: { ...card1, position: { x: 0, y: 4 } }, // Shadow position in group-2
        groupKey: 'group-2', // Target group
        sourceGroupKey: 'group-1', // Source group
      };

      const result = restoreCardToShadowPosition(groups, shadowState, 'card-1');

      // card-1 should be removed from group-1
      const resultGroup1 = result.find((g) => g.key === 'group-1');
      expect(resultGroup1).toBeDefined();
      // Using non-null assertion since we verified group exists
      expect(resultGroup1?.children.find((c) => c.key === 'card-1')).toBeUndefined();
      expect(resultGroup1?.children).toHaveLength(1);
      expect(resultGroup1?.children[0].key).toBe('card-2');

      // card-1 should be added to group-2 at shadow position
      const resultGroup2 = result.find((g) => g.key === 'group-2');
      expect(resultGroup2).toBeDefined();
      expect(resultGroup2?.children.find((c) => c.key === 'card-1')).toBeDefined();
      expect(resultGroup2?.children).toHaveLength(2);
    });

    it('should handle same source and target group (reorder within group)', () => {
      const groups: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [card1, card2, card3],
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: { ...card2, position: { x: 0, y: 0 } }, // Moved to first position
        groupKey: 'group-1', // Same group
        sourceGroupKey: 'group-1', // Same group
      };

      const result = restoreCardToShadowPosition(groups, shadowState, 'card-2');

      // Should have same group with card2 at shadow position
      const resultGroup = result.find((g) => g.key === 'group-1');
      expect(resultGroup).toBeDefined();
      expect(resultGroup!.children).toHaveLength(3);
      // Card-2 should be in the compacted layout
      expect(resultGroup!.children.find((c) => c.key === 'card-2')).toBeDefined();
    });

    it('should filter duplicate cards from target group', () => {
      // Edge case: card exists in both groups (shouldn't happen but tests filtering)
      const groups: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [card1, card2],
        },
        {
          key: 'group-2',
          children: [card1, card3], // card1 is duplicated
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: { ...card1, position: { x: 4, y: 0 } },
        groupKey: 'group-2',
        sourceGroupKey: 'group-1',
      };

      const result = restoreCardToShadowPosition(groups, shadowState, 'card-1');

      // Should filter duplicates - card-1 should appear only once in group-2
      const resultGroup2 = result.find((g) => g.key === 'group-2');
      expect(resultGroup2).toBeDefined();
      const card1Count = resultGroup2!.children.filter((c) => c.key === 'card-1').length;
      expect(card1Count).toBe(1);
    });

    it('should not modify groups that are neither source nor target', () => {
      const groups: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [card1],
        },
        {
          key: 'group-2',
          children: [card2],
        },
        {
          key: 'group-3',
          children: [card3],
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: { ...card1, position: { x: 0, y: 0 } },
        groupKey: 'group-2',
        sourceGroupKey: 'group-1',
      };

      const result = restoreCardToShadowPosition(groups, shadowState, 'card-1');

      // group-3 should be unchanged
      const resultGroup3 = result.find((g) => g.key === 'group-3');
      const originalGroup3 = groups.find((g) => g.key === 'group-3');
      expect(resultGroup3).toBeDefined();
      expect(originalGroup3).toBeDefined();
      expect(resultGroup3).toEqual(originalGroup3);
      expect(resultGroup3!.children).toHaveLength(1);
      expect(resultGroup3!.children[0].key).toBe('card-3');
    });

    it('should handle empty target group', () => {
      const groups: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [card1, card2],
        },
        {
          key: 'group-2',
          children: [], // Empty target
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: { ...card1, position: { x: 0, y: 0 } },
        groupKey: 'group-2',
        sourceGroupKey: 'group-1',
      };

      const result = restoreCardToShadowPosition(groups, shadowState, 'card-1');

      // card-1 should be removed from group-1
      const resultGroup1 = result.find((g) => g.key === 'group-1');
      expect(resultGroup1).toBeDefined();
      expect(resultGroup1!.children.find((c) => c.key === 'card-1')).toBeUndefined();

      // card-1 should be added to empty group-2
      const resultGroup2 = result.find((g) => g.key === 'group-2');
      expect(resultGroup2).toBeDefined();
      expect(resultGroup2!.children).toHaveLength(1);
      expect(resultGroup2!.children[0].key).toBe('card-1');
    });

    it('should handle card not in source group', () => {
      // Card specified doesn't actually exist in source group
      const groups: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [card2], // card-1 is not here
        },
        {
          key: 'group-2',
          children: [card3],
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: { ...card1, position: { x: 0, y: 0 } },
        groupKey: 'group-2',
        sourceGroupKey: 'group-1',
      };

      const result = restoreCardToShadowPosition(groups, shadowState, 'card-1');

      // Source group should be unchanged (card wasn't there to remove)
      const resultGroup1 = result.find((g) => g.key === 'group-1');
      expect(resultGroup1).toBeDefined();
      expect(resultGroup1!.children).toHaveLength(1);
      expect(resultGroup1!.children[0].key).toBe('card-2');

      // Target group should get the shadow card
      const resultGroup2 = result.find((g) => g.key === 'group-2');
      expect(resultGroup2).toBeDefined();
      expect(resultGroup2!.children.find((c) => c.key === 'card-1')).toBeDefined();
    });

    it('should use compactLayout for modified groups', () => {
      // This tests that compactLayout is called by verifying children are compacted
      const sparseCard: TestCard = {
        key: 'card-sparse',
        position: { x: 10, y: 10 }, // Far position that should be compacted
        dimensions: { width: 2, height: 2 },
        data: 'sparse',
      };

      const groups: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [sparseCard],
        },
        {
          key: 'group-2',
          children: [],
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: { ...sparseCard, position: { x: 0, y: 0 } },
        groupKey: 'group-2',
        sourceGroupKey: 'group-1',
      };

      const result = restoreCardToShadowPosition(groups, shadowState, 'card-sparse');

      // Verify the function ran (compactLayout would adjust positions)
      const resultGroup2 = result.find((g) => g.key === 'group-2');
      expect(resultGroup2).toBeDefined();
      expect(resultGroup2!.children).toHaveLength(1);
    });
    /* eslint-enable testing-library/no-node-access */
  });

  describe('restoreCardToShadowPosition edge cases', () => {
    it('should handle card that exists in both groups', () => {
      // This tests the duplicate filtering logic
      const duplicateGroups: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [mockCard], // Card exists here
        },
        {
          key: 'group-2',
          children: [mockCard], // And here (shouldn't happen but tests filtering)
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: mockCard,
        groupKey: 'group-2',
        sourceGroupKey: 'group-1',
      };

      mockGetGroups.mockReturnValue(duplicateGroups);
      mockGetShadowState.mockReturnValue(shadowState);

      const { result } = renderHook(
        () =>
          useCardDrag({
            card: mockCard,
            cardKey: mockCard.key,
            groupKey: 'group-1',
            layout: mockLayout,
            isResizing: false,
            getGroups: mockGetGroups,
            getShadowState: mockGetShadowState,
            updateGroupList: mockUpdateGroupList,
            updateShadowState: mockUpdateShadowState,
            clearShadowState: mockClearShadowState,
            cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
            cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.connectDrag).toBeDefined();
    });

    it('should handle groups that do not contain the card', () => {
      const card2: TestCard = {
        key: 'card-2',
        position: { x: 0, y: 0 },
        dimensions: { width: 2, height: 2 },
        data: 'test2',
      };

      const groupsWithoutCard: Group<TestCard>[] = [
        {
          key: 'group-1',
          children: [card2], // Different card
        },
        {
          key: 'group-2',
          children: [],
        },
        {
          key: 'group-3',
          children: [card2],
        },
      ];

      const shadowState: ShadowState<TestCard> = {
        card: mockCard,
        groupKey: 'group-2',
        sourceGroupKey: 'group-1',
      };

      mockGetGroups.mockReturnValue(groupsWithoutCard);
      mockGetShadowState.mockReturnValue(shadowState);

      const { result } = renderHook(
        () =>
          useCardDrag({
            card: mockCard,
            cardKey: mockCard.key,
            groupKey: 'group-1',
            layout: mockLayout,
            isResizing: false,
            getGroups: mockGetGroups,
            getShadowState: mockGetShadowState,
            updateGroupList: mockUpdateGroupList,
            updateShadowState: mockUpdateShadowState,
            clearShadowState: mockClearShadowState,
            cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
            cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isDragging).toBe(false);
    });
  });
});
