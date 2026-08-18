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

import { memo, useRef } from 'react';
import { useDrop } from 'react-dnd';
import type { Card, DragItem, Group, LayoutConfig } from '../types';
import { getContainerMaxHeight } from '../utils/utils';
import { MemoizedCardComponent } from './card/CardComponent';
import { useGridLayout } from './GridLayoutContext';
import { ShadowCard } from './ShadowCard';

/**
 * GridContent - Memoized component that renders cards within a group.
 *
 * This is where the expensive work happens (rendering many card components).
 * By memoizing this separately from GroupItemComponent, we allow the group
 * wrapper to re-render (e.g., for drag state changes in the parent) without
 * re-rendering the cards themselves.
 *
 * Cards only re-render when group.children, shadowCard, or layout actually changes.
 */
interface GridContentComponentProps<CardType extends Card> {
  calWidth: number;
  children: readonly CardType[];
  col: number;
  componentRef: React.RefObject<HTMLDivElement | null>;
  groupKey: string;
  layout: LayoutConfig;
  margin: [number, number];
  rowHeight: number;
  shadowCard?: CardType;
}

function GridContentComponent<CardType extends Card>(
  props: Readonly<GridContentComponentProps<CardType>>,
) {
  const { calWidth, children, col, componentRef, groupKey, layout, margin, rowHeight, shadowCard } =
    props;

  // Include shadow card in height calculation if present
  const cardsForHeight = shadowCard ? [...children, shadowCard] : [...children];
  const containerHeight = getContainerMaxHeight(cardsForHeight, rowHeight, margin);

  // Width = cells + all margins (including outer margins on both sides)
  const gridContentWidth = calWidth * col + (col + 1) * margin[0];

  return (
    <section
      className="card-container"
      ref={componentRef}
      style={{
        height: containerHeight,
        position: 'relative',
        width: gridContentWidth,
      }}
    >
      {children.map((card: CardType) => (
        <MemoizedCardComponent
          card={card}
          cardKey={card.key}
          groupKey={groupKey}
          key={`${groupKey}_${card.key}`}
          layout={layout}
          position={card.position}
        />
      ))}
      {shadowCard?.position && (
        <ShadowCard card={shadowCard} layout={layout} position={shadowCard.position} />
      )}
    </section>
  );
}

const GridContent = memo(GridContentComponent) as typeof GridContentComponent;

/**
 * Handles group hovering over group logic.
 * Extracted to reduce cognitive complexity.
 */
function handleGroupHover(
  dragIndex: number | undefined,
  hoverIndex: number,
  hoverBoundingRect: DOMRect,
  clientY: number,
  moveGroupItem: (dragIndex: number, hoverIndex: number) => void,
): boolean {
  if (dragIndex === undefined || dragIndex === hoverIndex) {
    return false;
  }

  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
  const hoverClientY = clientY - hoverBoundingRect.top;

  // Only perform the move when the mouse has crossed half of the item's height
  // When dragging downwards, only move when the cursor is below 50%
  // When dragging upwards, only move when the cursor is above 50%
  if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
    return false;
  }

  if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
    return false;
  }

  moveGroupItem(dragIndex, hoverIndex);
  return true;
}

/**
 * Handles card hovering over group logic.
 * Extracted to reduce cognitive complexity.
 */
function handleCardHover<CardType extends Card>(
  item: DragItem<CardType>,
  hoverItem: { index: number },
  domNode: HTMLDivElement,
  clientX: number,
  clientY: number,
  moveCardInGroupItem: (
    dragItem: DragItem<CardType>,
    hoverItem: { index: number },
    x: number,
    y: number,
  ) => void,
): void {
  const groupItemBoundingRect = domNode.getBoundingClientRect();
  const groupItemX = groupItemBoundingRect.left;
  const groupItemY = groupItemBoundingRect.top;

  moveCardInGroupItem(item, hoverItem, clientX - groupItemX, clientY - groupItemY);
}

interface Props<CardType extends Card = Card, GroupType extends Group<CardType> = Group<CardType>> {
  defaultLayout: LayoutConfig;
  group: GroupType;
  handleLoad: () => void;
  index: number;
  layout: LayoutConfig;
  moveCardInGroupItem: (
    dragItem: DragItem<CardType>,
    hoverItem: Props<CardType, GroupType>,
    x: number,
    y: number,
  ) => void;
  moveGroupItem: (dragIndex: number, hoverIndex: number) => void;
  onCardDropInGroupItem: (
    dragItem: DragItem<CardType>,
    dropItem: Props<CardType, GroupType>,
  ) => void;
  onGroupDrop: () => void;
  /** Shadow card to render in this group (if any) - passed from parent */
  shadowCard?: CardType;
}

export function GroupItemComponent<
  CardType extends Card = Card,
  GroupType extends Group<CardType> = Group<CardType>,
>(props: Readonly<Props<CardType, GroupType>>) {
  const {
    group,
    index,
    layout,
    moveCardInGroupItem,
    moveGroupItem,
    onCardDropInGroupItem,
    onGroupDrop,
    shadowCard,
  } = props;

  const { renderGroup } = useGridLayout<CardType, GroupType>();

  const { children, key } = group;

  const componentRef = useRef<HTMLDivElement>(null);

  const [, connectDropTarget] = useDrop(
    () => ({
      accept: ['item', 'group'],
      collect: () => ({}),
      drop: (item: DragItem<CardType>) => {
        if (item.type === 'card') {
          // Handle card drop within the group
          onCardDropInGroupItem(item, props);
        } else if (item.type === 'group') {
          // Finalize group reordering
          onGroupDrop();
        }
      },
      hover: (item: DragItem<CardType> & { index?: number }, monitor) => {
        const clientOffset = monitor.getClientOffset();
        const domNode = componentRef.current;

        if (!clientOffset || !domNode) {
          return;
        }

        if (item.type === 'group') {
          // Group hovering over group
          const moved = handleGroupHover(
            item.index,
            index,
            domNode.getBoundingClientRect(),
            clientOffset.y,
            moveGroupItem,
          );
          if (moved) {
            item.index = index;
          }
        } else if (item.type === 'card') {
          // Card hovering over group
          handleCardHover(
            item,
            props,
            domNode,
            clientOffset.x,
            clientOffset.y,
            moveCardInGroupItem,
          );
        }
      },
    }),
    [index, props, moveGroupItem, moveCardInGroupItem, onCardDropInGroupItem, onGroupDrop],
  );

  const { calWidth, col, margin, rowHeight } = layout;

  // Use memoized GridContent component - the expensive part
  // This will skip re-rendering when group wrapper changes (e.g., drag state)
  // but group.children, shadowCard, and layout remain the same
  const gridContent = (
    <GridContent
      calWidth={calWidth}
      col={col}
      componentRef={componentRef}
      groupKey={key}
      layout={layout}
      margin={margin}
      rowHeight={rowHeight}
      shadowCard={shadowCard}
    >
      {children}
    </GridContent>
  );

  return connectDropTarget(<div>{renderGroup(group, gridContent, index)}</div>);
}
