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
import { useDragLayer } from 'react-dnd';
import type { Card, DragItem } from '../types';
import { CardListDragPreview } from './CardListDragPreview';
import { useGridLayout } from './GridLayoutContext';

const CustomLayer = styled.div({
  left: -20,
  pointerEvents: 'none',
  position: 'fixed',
  top: -20,
  zIndex: 100,
});

/**
 * Custom drag layer component for rendering drag previews.
 * Note: Cursor during HTML5 drag is controlled by the browser's native DnD API.
 */
export function CustomDragLayer() {
  const { renderDragPreview } = useGridLayout();

  const { clientOffset, isDragging, item } = useDragLayer((monitor) => ({
    clientOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
    item: monitor.getItem<DragItem<Card>>(),
  }));

  if (!isDragging || item?.type !== 'card' || !item.layout || !item.card) {
    return null;
  }

  const { x, y } = clientOffset ?? { x: 0, y: 0 };
  const transform = `translate(${x}px, ${y}px)`;

  return (
    <CustomLayer>
      <div style={{ WebkitTransform: transform, transform }}>
        <CardListDragPreview
          card={item.card}
          layout={item.layout}
          renderDragPreview={renderDragPreview}
        />
      </div>
    </CustomLayer>
  );
}
