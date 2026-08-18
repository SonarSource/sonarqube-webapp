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

import styled from '@emotion/styled';
import { cssVar } from '@sonarsource/echoes-react';
import { memo, useCallback, useRef } from 'react';
import {
  CARD_BORDER_RADIUS,
  CARD_PADDING,
  CARD_TRANSITION,
  DRAG_OPACITY,
  RESIZE_SHADOW_OPACITY,
  RESIZE_Z_INDEX,
} from '../../constants';
import type { Card, LayoutConfig, Position } from '../../types';
import { calWHtoPx } from '../../utils';
import { useGridLayout } from '../GridLayoutContext';
import { calculateCardTransform, calculateResizeConstraints } from './cardPositionUtils';
import { MemoizedCardContent } from './MemoizedCardContent';
import { ResizableBox } from './ResizableBox';
import { useCardDrag } from './useCardDrag';
import { useCardResize } from './useCardResize';
import { useKeyboardDrag } from './useKeyboardDrag';
import { useKeyboardResize } from './useKeyboardResize';

interface Props {
  card: Card;
  cardKey: string;
  groupKey: string;
  layout: LayoutConfig;
  position: Position;
}

export function CardComponent(props: Readonly<Props>) {
  const { card, groupKey, layout, position: gridPosition } = props;

  const {
    cancelAllKeyboardDrags,
    cancelAllKeyboardResizes,
    clearShadowState,
    getGroups,
    getMaxSize,
    getMinSize,
    getShadowState,
    onCardDelete,
    onCardEdit,
    onResize,
    onResizeStart,
    onResizeStop,
    registerKeyboardDragCancel,
    registerKeyboardResizeCancel,
    renderCard,
    renderCardHeader,
    renderResizeHandle,
    unregisterKeyboardDragCancel,
    unregisterKeyboardResizeCancel,
    updateGroupList,
    updateShadowState,
  } = useGridLayout();

  const { dimensions, key: cardKey, position } = card;

  const { calWidth, col } = layout;

  // Get resize configuration from context
  const minSize = getMinSize(card);
  const maxSize = getMaxSize(card);

  const dragHandleRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Mouse resize (cancels ALL keyboard operations on start)
  const {
    handleResize,
    handleResizeStart,
    handleResizeStop,
    isResizing,
    resizeDimensions,
    resizeGridDimensions,
  } = useCardResize({
    cancelAllKeyboardDrags,
    cancelAllKeyboardResizes,
    cardKey,
    dimensions,
    groupKey,
    layout,
    onResize,
    onResizeStart,
    onResizeStop,
  });

  // Calculate constraints (needed for keyboard resize)
  const { maxConstraints, maxWidthInGrid, minConstraints } = calculateResizeConstraints(
    position,
    minSize,
    maxSize,
    col,
    layout,
  );

  // Keyboard resize (before keyboard drag to get isKeyboardResizing)
  const {
    handleResizeKeyDown: keyboardResizeHandler,
    isKeyboardResizing,
    keyboardResizeDimensions,
  } = useKeyboardResize({
    card,
    cardKey,
    dimensions,
    getGroups,
    groupKey,
    isKeyboardDragging: false, // Passed to prevent both at once
    maxSize,
    maxWidthInGrid,
    minSize,
    onResizeStop,
    registerKeyboardResizeCancel,
    unregisterKeyboardResizeCancel,
    updateGroupList,
  });

  // Keyboard drag (registers cancel function with global registry)
  const { handleDragKeyDown, isKeyboardDragging } = useKeyboardDrag({
    card,
    cardKey,
    clearShadowState,
    col,
    dimensions,
    getGroups,
    getShadowState,
    groupKey,
    isKeyboardResizing,
    isResizing,
    position,
    registerKeyboardDragCancel,
    unregisterKeyboardDragCancel,
    updateGroupList,
    updateShadowState,
  });

  // Mouse drag (needs isResizing from above, cancels ALL keyboard operations on start)
  const { connectDrag, isDragging } = useCardDrag({
    cancelAllKeyboardDrags,
    cancelAllKeyboardResizes,
    card,
    cardKey,
    clearShadowState,
    getGroups,
    getShadowState,
    groupKey,
    isResizing,
    layout,
    updateGroupList,
    updateShadowState,
  });

  // Combined ref callback that connects both the local ref and react-dnd's connectDrag
  // Using useCallback with connectDrag in deps ensures we reconnect when it changes
  const dragHandleRefCallback = useCallback(
    (element: HTMLDivElement | null) => {
      // Store in our local ref
      dragHandleRef.current = element;
      // Connect to react-dnd
      if (element) {
        connectDrag(element);
      }
    },
    [connectDrag],
  );

  // Wrap keyboard resize handler to pass updated isKeyboardDragging
  const handleResizeKeyDown = (e: React.KeyboardEvent) => {
    // Prevent keyboard resize when drag is active
    if (isKeyboardDragging && e.key === 'Enter') {
      return;
    }
    keyboardResizeHandler(e);
  };

  // Calculate position transforms
  const { actualHeight, actualWidth, x, y } = calculateCardTransform(
    gridPosition,
    dimensions,
    layout,
    resizeDimensions,
  );

  // Calculate shadow size for keyboard resize
  const activeDimensions = resizeGridDimensions ?? keyboardResizeDimensions;
  const shadowSize = activeDimensions
    ? calWHtoPx(
        activeDimensions.w,
        activeDimensions.h,
        layout.margin,
        layout.rowHeight,
        layout.calWidth,
      )
    : null;

  return (
    <>
      {/* Render resize shadow behind the card */}
      {(isResizing || isKeyboardResizing) && shadowSize && (
        <div
          className="card-shadow"
          style={{
            height: shadowSize.hPx,
            opacity: RESIZE_SHADOW_OPACITY,
            position: 'absolute',
            transform: `translate(${x}px, ${y}px)`,
            transition: CARD_TRANSITION,
            width: shadowSize.wPx,
            zIndex: 1,
          }}
        />
      )}
      <div
        ref={dragRef}
        style={{
          height: actualHeight,
          opacity: (() => {
            if (isKeyboardDragging) {
              return 0;
            }
            if (isDragging) {
              return DRAG_OPACITY;
            }
            return 1;
          })(),
          position: 'absolute',
          transform: `translate(${x}px, ${y}px)`,
          // Smooth transitions when cards settle, but not during active drag
          transition: isDragging || isResizing ? 'none' : CARD_TRANSITION,
          width: actualWidth,
          zIndex: isResizing ? RESIZE_Z_INDEX : 'auto',
        }}
      >
        <ResizableBox
          height={actualHeight}
          maxConstraints={[maxConstraints.width, maxConstraints.height]}
          minConstraints={[minConstraints.width, minConstraints.height]}
          onResize={handleResize}
          onResizeStart={handleResizeStart}
          onResizeStop={handleResizeStop}
          renderResizeHandle={renderResizeHandle}
          resizeHandleKeyDown={handleResizeKeyDown}
          width={actualWidth}
        >
          {(handle) => (
            <CardDiv className="card" isDragging={isDragging}>
              {renderCardHeader({
                card,
                dragHandleRef: dragHandleRefCallback,
                isDragging,
                isKeyboardDragging,
                onDelete: () => {
                  onCardDelete(cardKey, groupKey);
                },
                onEdit: onCardEdit
                  ? () => {
                      onCardEdit(cardKey, groupKey);
                    }
                  : undefined,
                onKeyDown: handleDragKeyDown,
              })}
              <MemoizedCardContent
                card={card}
                isDragging={isDragging}
                key={`${cardKey}-${Math.round(calWidth)}`}
                renderCard={renderCard}
              />
              {handle}
            </CardDiv>
          )}
        </ResizableBox>
      </div>
    </>
  );
}

/**
 * Memoized CardComponent.
 *
 * Uses default shallow comparison which works because:
 * - card: Parent preserves reference for unchanged cards
 * - cardKey, groupKey: Primitives (strings)
 * - layout: Stable reference from state
 * - position: Passed from card.position (same reference as card)
 *
 * Cards not involved in drag/resize keep their reference and skip re-render.
 */
export const MemoizedCardComponent = memo(CardComponent);

const CardDiv = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isDragging',
})<{ isDragging?: boolean }>`
  align-items: stretch;
  background-color: ${cssVar('color-surface-default')};
  border: 1px solid ${cssVar('color-border-weak')};
  border-radius: ${CARD_BORDER_RADIUS};
  box-sizing: border-box;
  cursor: default;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: ${CARD_PADDING};
  position: relative;
  width: 100%;

  & .drag-handle-container {
    opacity: ${({ isDragging }) => (isDragging ? 1 : 0)};
    transition: opacity 0.2s;
    pointer-events: ${({ isDragging }) => (isDragging ? 'auto' : 'none')};
  }

  &:hover .drag-handle-container,
  &:focus-within .drag-handle-container {
    opacity: 1;
    pointer-events: auto;
  }
`;
