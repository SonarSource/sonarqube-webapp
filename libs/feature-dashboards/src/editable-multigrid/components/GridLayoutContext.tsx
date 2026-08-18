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

import { createContext, useContext } from 'react';
import type {
  Card,
  Dimensions,
  Group,
  RenderCardFunction,
  RenderCardHeader,
  RenderDragPreviewFunction,
  RenderGroupFunction,
  RenderResizeHandle,
  ShadowState,
} from '../types';

interface GridLayoutContextValue<
  CardType extends Card = Card,
  GroupType extends Group<CardType> = Group<CardType>,
> {
  // Global keyboard drag cancellation - called when mouse drag/resize starts
  cancelAllKeyboardDrags: () => void;
  // Global keyboard resize cancellation - called when mouse drag/resize starts
  cancelAllKeyboardResizes: () => void;
  clearShadowState: () => void;
  getGroups: () => GroupType[];
  getMaxSize: (card: CardType) => Dimensions;
  getMinSize: (card: CardType) => Dimensions;
  // Shadow state management - stores which group has the shadow and the shadow card data
  getShadowState: () => ShadowState<CardType> | null;
  // Card deletion callback - called with card key and group key
  onCardDelete: (cardKey: string, groupKey: string) => void;
  // Card edit callback - called with card key and group key (optional)
  onCardEdit?: (cardKey: string, groupKey: string) => void;
  onResize: (cardKey: string, groupKey: string, size: Dimensions) => void;
  onResizeStart: (cardKey: string, groupKey: string, size: Dimensions) => void;
  onResizeStop: (cardKey: string, groupKey: string, size: Dimensions) => void;
  registerKeyboardDragCancel: (cardKey: string, cancel: () => void) => void;
  registerKeyboardResizeCancel: (cardKey: string, cancel: () => void) => void;
  renderCard: RenderCardFunction<CardType>;
  renderCardHeader: RenderCardHeader<CardType>;
  renderDragPreview: RenderDragPreviewFunction<CardType>;
  renderGroup: RenderGroupFunction<CardType, GroupType>;
  renderResizeHandle: RenderResizeHandle;
  unregisterKeyboardDragCancel: (cardKey: string) => void;
  unregisterKeyboardResizeCancel: (cardKey: string) => void;
  // Stable function that returns current groups (reads from ref internally)
  updateGroupList: (groups: GroupType[]) => void;
  updateShadowState: (state: ShadowState<CardType>) => void;
}

const GridLayoutContext = createContext<GridLayoutContextValue | null>(null);

export function GridLayoutProvider<
  CardType extends Card = Card,
  GroupType extends Group<CardType> = Group<CardType>,
>({
  children,
  value,
}: Readonly<{
  children: React.ReactNode;
  value: GridLayoutContextValue<CardType, GroupType>;
}>) {
  return (
    // Type assertion is safe: React Context doesn't support generic providers.
    // The context is created as GridLayoutContextValue (no generics) but we ensure
    // type safety through the generic parameter on GridLayoutProvider.
    <GridLayoutContext.Provider value={value as GridLayoutContextValue}>
      {children}
    </GridLayoutContext.Provider>
  );
}

export function useGridLayout<
  CardType extends Card = Card,
  GroupType extends Group<CardType> = Group<CardType>,
>() {
  const context = useContext(GridLayoutContext);
  if (!context) {
    throw new Error('useGridLayout must be used within a GridLayoutProvider');
  }
  return context as GridLayoutContextValue<CardType, GroupType>;
}
