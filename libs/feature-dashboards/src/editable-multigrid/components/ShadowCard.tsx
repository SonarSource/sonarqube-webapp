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
import type { Card, LayoutConfig, Position } from '../types';
import { calGridItemPosition, calWHtoPx } from '../utils/utils';

const ShadowDiv = styled.div({
  border: `2px dashed ${cssVar('color-border-accent-default')}`,
  borderRadius: '4px',
  pointerEvents: 'none',
  position: 'absolute',
  transition: 'all 0.2s ease-in-out',
  zIndex: 0,
});

interface Props {
  card: Card;
  layout: LayoutConfig;
  position: Position;
}

export function ShadowCard(props: Readonly<Props>) {
  const { card, layout, position: gridPosition } = props;
  const { dimensions } = card;
  const { calWidth, margin, rowHeight } = layout;

  const pixelPosition = calGridItemPosition(
    gridPosition.x,
    gridPosition.y,
    margin,
    rowHeight,
    calWidth,
  );
  const { x, y } = pixelPosition;
  const pixelSize = calWHtoPx(dimensions.width, dimensions.height, margin, rowHeight, calWidth);
  const { hPx, wPx } = pixelSize;

  // Style matches WidgetTargetPreview (FF-off style)
  return (
    <ShadowDiv
      data-widget-target-preview
      style={{
        height: hPx,
        transform: `translate(${x}px, ${y}px)`,
        width: wPx,
      }}
    />
  );
}
