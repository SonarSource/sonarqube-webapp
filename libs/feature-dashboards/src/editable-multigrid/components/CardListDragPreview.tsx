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

import type { Card, LayoutConfig, RenderDragPreviewFunction } from '../types';
import { calWHtoPx } from '../utils/utils';

interface Props {
  card: Card;
  layout: LayoutConfig;
  renderDragPreview: RenderDragPreviewFunction<Card>;
}

/**
 * Drag preview component for displaying layered card preview during drag operations
 */
export function CardListDragPreview(props: Readonly<Props>) {
  const { card, layout, renderDragPreview } = props;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
  };

  const pixelSize = calWHtoPx(
    card.dimensions.width,
    card.dimensions.height,
    layout.margin,
    layout.rowHeight,
    layout.calWidth,
  );

  return (
    <div style={containerStyle}>
      {renderDragPreview(card, {
        height: pixelSize.hPx,
        width: pixelSize.wPx,
      })}
    </div>
  );
}
