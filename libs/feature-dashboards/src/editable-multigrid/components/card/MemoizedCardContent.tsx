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

import { memo } from 'react';
import type { Card, RenderCardFunction } from '../../types';

interface Props<CardType extends Card = Card> {
  /** Card data for rendering */
  card: CardType;
  /** Whether card is being dragged */
  isDragging: boolean;
  /** Render function - should be wrapped in useCallback by consumer */
  renderCard: RenderCardFunction<CardType>;
}

/**
 * Inner card content component that renders the user-provided content.
 *
 * This is memoized so that expensive card content (SVGs, canvas, etc.)
 * doesn't re-render when only position changes.
 *
 * Default memo works here because:
 * - isDragging is a primitive (stable comparison)
 * - renderCard should be a stable reference (wrapped in useCallback)
 * - card object - we accept it may cause re-renders, but consumers can
 *   optimize by ensuring stable card references when only position changes
 */
function CardContentInner<CardType extends Card = Card>(props: Readonly<Props<CardType>>) {
  const { card, isDragging, renderCard } = props;

  return renderCard(card, isDragging);
}

/**
 * Memoized card content - uses simple shallow comparison.
 *
 * For best performance, consumers should:
 * 1. Wrap renderCard in useCallback
 * 2. Keep card object references stable when only position/dimensions change
 */
export const MemoizedCardContent = memo(CardContentInner) as typeof CardContentInner;
