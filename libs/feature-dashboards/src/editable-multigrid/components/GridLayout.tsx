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

import { debounce } from 'lodash';
import React, { Component, type JSX } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LAYOUT_CONTENT_SELECTOR, RESIZE_DEBOUNCE_MS } from '../constants';
import type {
  Card,
  Dimensions,
  DragItem,
  Group,
  LayoutConfig,
  RenderCardFunction,
  RenderCardHeader,
  RenderDragPreviewFunction,
  RenderGroupFunction,
  RenderResizeHandle,
  ShadowState,
} from '../types';
import { layoutCheck } from '../utils/collision';
import { compactLayout } from '../utils/compact';
import { addCardWithCollisionAndCompact } from '../utils/layoutOperations';
import { calColWidth, calGridXY, clamp } from '../utils/utils';
import { CustomDragLayer } from './CustomDragLayer';
import { GridLayoutProvider } from './GridLayoutContext';
import { GroupItemComponent } from './GroupItemComponent';

interface LayoutProps<
  CardType extends Card = Card,
  GroupType extends Group<CardType> = Group<CardType>,
> {
  getMaxSize?: (card: CardType) => Dimensions;
  getMinSize?: (card: CardType) => Dimensions;
  groups: GroupType[];
  layout?: LayoutConfig;
  /** Callback when a card is deleted */
  onCardDelete?: (cardKey: string, groupKey: string) => void;
  /** Callback when a card is edited */
  onCardEdit?: (cardKey: string, groupKey: string) => void;
  onGroupsChange: (groups: GroupType[]) => void;
  renderCard: RenderCardFunction<CardType>;
  renderCardHeader: RenderCardHeader<CardType>;
  renderDragPreview: RenderDragPreviewFunction<CardType>;
  renderGroup: RenderGroupFunction<CardType, GroupType>;
  renderResizeHandle: RenderResizeHandle;
}

interface LayoutState<
  CardType extends Card = Card,
  GroupType extends Group<CardType> = Group<CardType>,
> {
  defaultLayout: LayoutConfig;
  layout: LayoutConfig;
  shadowState: ShadowState<CardType> | null;
  temporaryGroups: GroupType[] | null; // Used during drag/resize for visual feedback
}

/**
 * GridLayout - Core grid layout component with drag-and-drop support.
 *
 * NOTE: This is intentionally a class component for several performance reasons:
 * 1. Stable context value caching via instance method (createContextValue called once)
 * 2. Ref-based render prop pattern for context stability even with inline arrow functions
 * 3. Clean ResizeObserver lifecycle management
 * 4. Complex state coordination that benefits from class method organization
 *
 * Converting to a functional component would require careful memoization to avoid
 * excessive re-renders when parent components pass inline render functions.
 */

export class GridLayout<
  CardType extends Card = Card,
  GroupType extends Group<CardType> = Group<CardType>,
> extends Component<LayoutProps<CardType, GroupType>, LayoutState<CardType, GroupType>> {
  // Cached context value - created once and never recreated
  private cachedContextValue: ReturnType<typeof this.createContextValue> | null = null;

  // Container ref for layout calculations
  private readonly containerRef = React.createRef<HTMLDivElement>();

  // Registry for keyboard drag cancel functions - keyed by cardKey
  private readonly keyboardDragCancelRegistry = new Map<string, () => void>();

  // Registry for keyboard resize cancel functions - keyed by cardKey
  private readonly keyboardResizeCancelRegistry = new Map<string, () => void>();

  // Resize observer for responsive layout
  private resizeObserver: ResizeObserver | undefined;

  // Debounced resize handler
  private readonly debouncedCalculateLayout: ReturnType<typeof debounce>;

  // Refs to hold current render props - allows context to use stable wrappers
  // that always call the latest version of the render functions
  private readonly renderPropsRef = {
    getMaxSize: undefined as ((card: CardType) => Dimensions) | undefined,
    getMinSize: undefined as ((card: CardType) => Dimensions) | undefined,
    renderCard: undefined as RenderCardFunction<CardType> | undefined,
    renderCardHeader: undefined as RenderCardHeader<CardType> | undefined,
    renderDragPreview: undefined as RenderDragPreviewFunction<CardType> | undefined,
    renderGroup: undefined as RenderGroupFunction<CardType, GroupType> | undefined,
    renderResizeHandle: undefined as RenderResizeHandle | undefined,
  };

  static readonly defaultProps: Partial<LayoutProps> = {
    layout: {
      calWidth: 175,
      col: 6,
      containerHeight: 300,
      containerPadding: [0, 0] as [number, number],
      containerWidth: 1200,
      margin: [10, 10] as [number, number],
      rowHeight: 175,
    },
  };

  constructor(props: LayoutProps<CardType, GroupType>) {
    super(props);
    const defaultLayoutConfig: LayoutConfig = {
      calWidth: 175,
      col: 6,
      containerHeight: 300,
      containerPadding: [0, 0] as [number, number],
      containerWidth: 1200,
      margin: [10, 10] as [number, number],
      rowHeight: 175,
    };
    this.state = {
      defaultLayout: defaultLayoutConfig,
      layout: props.layout ?? defaultLayoutConfig,
      shadowState: null,
      temporaryGroups: null,
    };

    // Create debounced layout calculation handler
    this.debouncedCalculateLayout = debounce(this.calculateLayout, RESIZE_DEBOUNCE_MS);
  }

  componentDidMount() {
    // Use ResizeObserver for accurate container width detection
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.debouncedCalculateLayout();
      });
      if (this.containerRef.current) {
        this.resizeObserver.observe(this.containerRef.current);
      }
    }
    // Fallback to window resize for older browsers
    window.addEventListener('resize', this.debouncedCalculateLayout);
    // Initialize layout on mount (immediate, not debounced)
    this.calculateLayout();
  }

  componentDidUpdate() {
    // Clean up stale entries from keyboard registries
    // This prevents memory leaks if cards are removed without proper unmounting
    const allCardKeys = new Set<string>();
    this.props.groups.forEach((group) => {
      group.children.forEach((card) => {
        allCardKeys.add(card.key);
      });
    });

    // Remove registry entries for cards that no longer exist
    this.keyboardDragCancelRegistry.forEach((_, key) => {
      if (!allCardKeys.has(key)) {
        this.keyboardDragCancelRegistry.delete(key);
      }
    });

    this.keyboardResizeCancelRegistry.forEach((_, key) => {
      if (!allCardKeys.has(key)) {
        this.keyboardResizeCancelRegistry.delete(key);
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedCalculateLayout);
    this.resizeObserver?.disconnect();
    // Cancel any pending debounced calls
    if (this.debouncedCalculateLayout?.cancel) {
      this.debouncedCalculateLayout.cancel();
    }
  }

  /**
   * Calculate layout based on current container size.
   * This is debounced via debouncedCalculateLayout to avoid excessive recalculations.
   */
  calculateLayout = () => {
    // Use containerRef instead of document.querySelector
    const host = this.containerRef.current;
    if (!host) {
      return;
    }

    // Look for a layout content ancestor for accurate width measurement
    const contentAncestor = host.closest<HTMLElement>(LAYOUT_CONTENT_SELECTOR);

    // Use ancestor width, or parent width, or host width
    const clientWidth =
      contentAncestor?.clientWidth ?? host.parentElement?.clientWidth ?? host.clientWidth;

    if (!clientWidth) {
      return;
    }

    // Round to avoid sub-pixel jitter causing infinite loops
    const roundedWidth = Math.round(clientWidth);

    const { col, containerPadding, margin } = this.state.layout;
    const layout = { ...this.state.layout };

    // Use fixed column count from layout config
    const calWidth = calColWidth(roundedWidth, col, containerPadding, margin);
    const roundedCalWidth = Math.round(calWidth);

    // Only update if values actually changed (prevents infinite re-render loops)
    if (
      roundedCalWidth === Math.round(this.state.layout.calWidth) &&
      roundedWidth === Math.round(this.state.layout.containerWidth)
    ) {
      return;
    }

    // Only update column width - keep rowHeight fixed in pixels
    layout.calWidth = roundedCalWidth;
    // Keep col and rowHeight fixed - don't recalculate them
    layout.containerWidth = roundedWidth;

    this.updateLayout(layout);
  };

  /**
   * Card operations within groups
   */

  /**
   * Move dragging card over a group
   * @param dragItem The object being dragged
   * @param hoverItem The object being hovered over during drag
   * @param x Current element's x-axis position on the page in pixels
   * @param y Current element's y-axis position on the page in pixels
   */
  moveCardInGroupItem = (
    dragItem: DragItem<CardType>,
    hoverItem: { index: number },
    x: number,
    y: number,
  ) => {
    const { col, containerWidth, margin, rowHeight } = this.state.layout;

    // Get the shadow card - either from state (if already set) or from the drag item (first hover)
    let shadowCard: Card;
    let sourceGroupKey: string;
    const currentShadowState = this.state.shadowState;
    if (currentShadowState?.card) {
      shadowCard = { ...currentShadowState.card };
      // Preserve original source group key from when drag started
      ({ sourceGroupKey } = currentShadowState);
    } else if (dragItem.card && dragItem.groupKey) {
      // First hover: initialize shadow from the drag item
      shadowCard = { ...dragItem.card } as Card;
      // Record the original source group
      sourceGroupKey = dragItem.groupKey;
    } else {
      return;
    }

    // Calculate current grid coordinates
    const gridPos = calGridXY(
      x,
      y,
      shadowCard.dimensions.width,
      margin,
      containerWidth,
      col,
      rowHeight,
    );

    // Only skip if shadow was already set AND position hasn't changed
    // On first hover (no currentShadowState), we need to set things up
    if (
      currentShadowState &&
      gridPos.x === shadowCard.position.x &&
      gridPos.y === shadowCard.position.y
    ) {
      return;
    }

    const groupIndex = hoverItem.index;
    const targetGroup = (this.state.temporaryGroups ?? this.props.groups)[groupIndex];
    if (!targetGroup) {
      // Silently bail if group not found (can happen during rapid state changes)
      return;
    }

    shadowCard = { ...shadowCard, position: { x: gridPos.x, y: gridPos.y } };

    // Use temporaryGroups if it exists (during ongoing drag), otherwise use props
    const currentGroups = this.state.temporaryGroups ?? this.props.groups;

    // Find which group originally contains the card (source group)
    const sourceGroupIndex = currentGroups.findIndex((g) =>
      g.children.some((card) => card.key === shadowCard.key),
    );

    // Track previous shadow group to compact it when shadow moves to a new group
    const previousShadowGroupKey = currentShadowState?.groupKey;
    const previousShadowGroupIndex = previousShadowGroupKey
      ? currentGroups.findIndex((g) => g.key === previousShadowGroupKey)
      : -1;

    // Build new groups array, preserving references for unchanged groups
    const groups = currentGroups.map((g, idx) => {
      const isTargetGroup = idx === groupIndex;
      const isSourceGroup = idx === sourceGroupIndex;
      const isPreviousShadowGroup = idx === previousShadowGroupIndex && idx !== groupIndex;

      // Check if this group needs to change
      if (isTargetGroup) {
        // Target group: run collision detection with shadow included
        const childrenWithoutCard = isSourceGroup
          ? g.children.filter((card) => card.key !== shadowCard.key)
          : g.children;

        const newShadowCard = { ...shadowCard } as CardType;

        // Add shadow card with collision detection and compaction
        const compactedLayout = addCardWithCollisionAndCompact(childrenWithoutCard, newShadowCard);

        // Regular cards are everything except the shadow
        const regularCards = compactedLayout.filter((c) => c.key !== shadowCard.key);

        return {
          ...g,
          children: regularCards,
        };
      } else if (isSourceGroup) {
        // Source group (not target): remove card and compact
        const childrenWithoutCard = g.children.filter((card) => card.key !== shadowCard.key);
        const compactedChildren = compactLayout(childrenWithoutCard);

        return {
          ...g,
          children: compactedChildren,
        };
      } else if (isPreviousShadowGroup) {
        // Previous shadow group (shadow moved away): compact to fill the gap
        const compactedChildren = compactLayout(g.children);
        return {
          ...g,
          children: compactedChildren,
        };
      }
      // Unchanged group - return as-is
      return g;
    });

    // Update shadow state with new position and target group
    const typedShadowCard = shadowCard as CardType;
    const shadowFromLayout: CardType = (() => {
      const targetChildren = groups[groupIndex]?.children ?? [];
      // Re-run collision to get final shadow position
      const cardsWithShadow: CardType[] = [...targetChildren, typedShadowCard];
      const layoutAfterCollision = layoutCheck(
        cardsWithShadow,
        typedShadowCard,
        typedShadowCard.key,
        typedShadowCard.key,
      );
      const compactedLayout = compactLayout<CardType>(layoutAfterCollision, typedShadowCard);
      return compactedLayout.find((c) => c.key === shadowCard.key) ?? typedShadowCard;
    })();

    this.updateShadowState({
      card: shadowFromLayout,
      groupKey: targetGroup.key,
      sourceGroupKey,
    });
    // During drag, we temporarily update groups for shadow positioning
    // but don't call onGroupsChange until drop
    this.updateGroupList(groups);
  };

  /**
   * Drop card into a group
   * @param dragItem The card object being dragged
   * @param dropItem The target group object for the drop (used as fallback)
   */
  onCardDropInGroupItem = (dragItem: DragItem<CardType>, dropItem: { index: number }) => {
    const draggedCardKey = dragItem.id;
    const { shadowState } = this.state;

    // If no shadow exists, the user didn't move far enough - just clear shadow and keep card in place
    // DON'T clear temporaryGroups - it may contain finalized state from a previous keyboard drag
    if (!shadowState) {
      this.clearShadowState();
      return;
    }

    // Use temporaryGroups which has the card positioning information
    const currentGroups = this.state.temporaryGroups ?? this.props.groups;

    // Find the target group by shadow's groupKey
    const targetGroupIndex = currentGroups.findIndex((g) => g.key === shadowState.groupKey);

    // Fallback to dropItem.index if group not found
    const finalTargetIndex = targetGroupIndex === -1 ? dropItem.index : targetGroupIndex;

    // Find which group the card was originally in (source group) using stored sourceGroupKey
    // This is more reliable than searching by card key, since the card was removed during drag
    const sourceGroupIndex = currentGroups.findIndex((g) => g.key === shadowState.sourceGroupKey);

    // Build new groups, preserving references for unchanged groups
    const groups = currentGroups.map((g, idx): Group<CardType> => {
      const isTargetGroup = idx === finalTargetIndex;
      const isSourceGroup = idx === sourceGroupIndex;

      if (isTargetGroup) {
        // Target group: convert shadow to real card, compact
        // First filter out any existing card with the same key to avoid duplicates
        const childrenWithoutDraggedCard = g.children.filter((c) => c.key !== draggedCardKey);
        const newChildren = [...childrenWithoutDraggedCard, shadowState.card];
        return {
          ...g,
          children: compactLayout(newChildren),
        };
      } else if (isSourceGroup && !isTargetGroup) {
        // Source group (not target): remove card, compact
        const childrenWithoutCard = g.children.filter((card) => card.key !== draggedCardKey);
        return {
          ...g,
          children: compactLayout(childrenWithoutCard),
        };
      }
      // Unchanged group
      return g;
    }) as GroupType[];
    // Type assertion is safe: map preserves GroupType structure through spread operator.
    // TypeScript can't infer that Group<CardType> → Group<CardType> preserves GroupType's
    // additional properties, but we only modify 'children' and preserve all other properties.

    this.props.onGroupsChange(groups);
    this.clearShadowState();
    // Clear temporary groups after drop
    this.setState({ temporaryGroups: null });
  };

  /**
   * Handle resize start
   */
  onCardResizeStart = (_cardKey: string, _groupKey: string, _dimensions: Dimensions) => {
    // No-op: can be used for logging or tracking
  };

  /**
   * Handle resize - update card dimensions in real-time
   */
  onCardResize = (cardKey: string, groupKey: string, newSize: Dimensions) => {
    const { layout } = this.state;
    // Use temporaryGroups if it exists (during ongoing resize), otherwise use props
    const groups = this.state.temporaryGroups ?? this.props.groups;

    // Find the card to get its current position
    const group = groups.find((g) => g.key === groupKey);
    const card = group?.children.find((c) => c.key === cardKey);
    if (!card) {
      // Silently bail if card not found (can happen during rapid state changes)
      return;
    }

    // Clamp dimensions to valid ranges, accounting for card position
    const maxW = layout.col - card.position.x;
    const w = clamp(newSize.width, 1, maxW);
    const h = clamp(newSize.height, 1, Infinity);

    // Update card dimensions in the group (immutably)
    const updatedGroups = groups.map((g) => {
      if (g.key !== groupKey) {
        return g;
      }

      return {
        ...g,
        children: g.children.map((c) =>
          c.key === cardKey ? { ...c, dimensions: { height: h, width: w } } : c,
        ),
      };
    });

    // Run compaction for the affected group
    const compactedGroups = updatedGroups.map((g) => {
      if (g.key !== groupKey) {
        return g;
      }

      return { ...g, children: compactLayout(g.children) };
    });

    // During resize, temporarily update groups for visual feedback
    // but don't call onGroupsChange until resizeStop
    this.updateGroupList(compactedGroups);
  };

  /**
   * Handle resize stop - finalize dimensions and run full compaction
   */
  onCardResizeStop = (cardKey: string, groupKey: string, newSize: Dimensions) => {
    const { layout } = this.state;
    // Use temporaryGroups which has the latest resize state
    const groups = this.state.temporaryGroups ?? this.props.groups;

    // Find the card to get its current position
    const group = groups.find((g) => g.key === groupKey);
    const card = group?.children.find((c) => c.key === cardKey);
    if (!card) {
      // Silently bail if card not found (can happen during rapid state changes)
      return;
    }

    // Clamp dimensions to valid ranges, accounting for card position
    const maxW = layout.col - card.position.x;
    const finalW = clamp(newSize.width, 1, maxW);
    const finalH = clamp(newSize.height, 1, Infinity);

    // Update card dimensions and compact ONLY the affected group
    const updatedGroups = groups.map((g) => {
      if (g.key !== groupKey) {
        return g;
      }

      // Update the resized card's dimensions
      const updatedChildren = g.children.map((c) =>
        c.key === cardKey ? { ...c, dimensions: { height: finalH, width: finalW } } : c,
      );

      // Only compact this group since dimensions changed might affect layout
      return {
        ...g,
        children: compactLayout(updatedChildren),
      };
    });

    this.props.onGroupsChange(updatedGroups);
    // Clear temporary groups after resize stop
    this.setState({ temporaryGroups: null });
  };

  /**
   * Initialize group items
   */
  initGroupItem(groups: GroupType[]): JSX.Element[] {
    const { shadowState } = this.state;

    return groups.map((g, i) => (
      <GroupItemComponent
        defaultLayout={this.state.defaultLayout}
        group={g}
        handleLoad={this.debouncedCalculateLayout}
        index={i}
        key={g.key}
        layout={this.state.layout}
        moveCardInGroupItem={this.moveCardInGroupItem}
        moveGroupItem={this.moveGroupItem}
        onCardDropInGroupItem={this.onCardDropInGroupItem}
        onGroupDrop={this.onGroupDrop}
        shadowCard={shadowState?.groupKey === g.key ? shadowState.card : undefined}
      />
    ));
  }

  /**
   * Update group data temporarily (for drag/resize visual feedback)
   */
  updateGroupList = (groups: GroupType[]) => {
    this.setState({ temporaryGroups: groups });
  };

  /**
   * Get current groups (reads from state/props)
   * This is a stable function reference that can be used in callbacks
   */
  getGroups = (): GroupType[] => {
    return this.state.temporaryGroups ?? this.props.groups;
  };

  /**
   * Get min size for a card - stable function reference
   */
  getMinSize = (card: CardType): Dimensions => {
    const { getMinSize } = this.props;
    return getMinSize ? getMinSize(card) : { height: 1, width: 1 };
  };

  /**
   * Get max size for a card - stable function reference
   */
  getMaxSize = (card: CardType): Dimensions => {
    const { getMaxSize } = this.props;
    return getMaxSize ? getMaxSize(card) : { height: Infinity, width: Infinity };
  };

  /**
   * Handle card deletion - calls the onCardDelete prop
   */
  onCardDelete = (cardKey: string, groupKey: string) => {
    this.props.onCardDelete?.(cardKey, groupKey);
  };

  /**
   * Handle card edit - calls the onCardEdit prop
   */
  onCardEdit = (cardKey: string, groupKey: string) => {
    this.props.onCardEdit?.(cardKey, groupKey);
  };

  /**
   * Create context value - only called ONCE.
   * Uses wrapper functions that access renderPropsRef to always call latest versions.
   */
  createContextValue = () => ({
    cancelAllKeyboardDrags: this.cancelAllKeyboardDrags,
    cancelAllKeyboardResizes: this.cancelAllKeyboardResizes,
    clearShadowState: this.clearShadowState,
    getGroups: this.getGroups,
    getMaxSize: this.getMaxSize,
    getMinSize: this.getMinSize,
    getShadowState: this.getShadowState,
    onCardDelete: this.onCardDelete,
    onCardEdit: this.onCardEdit,
    onResize: this.onCardResize,
    onResizeStart: this.onCardResizeStart,
    onResizeStop: this.onCardResizeStop,
    registerKeyboardDragCancel: this.registerKeyboardDragCancel,
    registerKeyboardResizeCancel: this.registerKeyboardResizeCancel,
    // Stable wrapper functions that always call the latest render props from ref
    renderCard: ((card: CardType, isDragging: boolean) =>
      this.renderPropsRef.renderCard?.(card, isDragging)) as RenderCardFunction<CardType>,
    renderCardHeader: ((props: Parameters<RenderCardHeader<CardType>>[0]) =>
      this.renderPropsRef.renderCardHeader?.(props)) as RenderCardHeader<CardType>,
    renderDragPreview: ((card: CardType, size: { height: number; width: number }) =>
      this.renderPropsRef.renderDragPreview?.(card, size)) as RenderDragPreviewFunction<CardType>,
    renderGroup: ((group: GroupType, children: React.ReactNode, index: number) =>
      this.renderPropsRef.renderGroup?.(group, children, index)) as RenderGroupFunction<
      CardType,
      GroupType
    >,
    renderResizeHandle: ((props: Parameters<RenderResizeHandle>[0]) =>
      this.renderPropsRef.renderResizeHandle?.(props)) as RenderResizeHandle,
    unregisterKeyboardDragCancel: this.unregisterKeyboardDragCancel,
    unregisterKeyboardResizeCancel: this.unregisterKeyboardResizeCancel,
    updateGroupList: this.updateGroupList,
    updateShadowState: this.updateShadowState,
  });

  /**
   * Get or create stable context value.
   * Context is created once and never recreated - render props are accessed via refs.
   */
  getContextValue = () => {
    // Update refs to point to latest render props
    this.renderPropsRef.getMaxSize = this.props.getMaxSize;
    this.renderPropsRef.getMinSize = this.props.getMinSize;
    this.renderPropsRef.renderCard = this.props.renderCard;
    this.renderPropsRef.renderCardHeader = this.props.renderCardHeader;
    this.renderPropsRef.renderDragPreview = this.props.renderDragPreview;
    this.renderPropsRef.renderGroup = this.props.renderGroup;
    this.renderPropsRef.renderResizeHandle = this.props.renderResizeHandle;

    // Create context only once
    if (!this.cachedContextValue) {
      this.cachedContextValue = this.createContextValue();
    }

    return this.cachedContextValue;
  };

  /**
   * Placeholder for group reordering - stable function reference
   */
  /**
   * Reorder groups during drag
   */
  moveGroupItem = (dragIndex: number, hoverIndex: number) => {
    const source = this.state.temporaryGroups ?? this.props.groups;
    if (dragIndex === hoverIndex || dragIndex < 0 || hoverIndex < 0) {
      return;
    }
    const updated = [...source];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, removed);
    this.updateGroupList(updated);
  };

  /**
   * Finalize group reordering on drop
   */
  onGroupDrop = () => {
    // Finalize the temporary group order by calling onGroupsChange
    if (this.state.temporaryGroups) {
      this.props.onGroupsChange(this.state.temporaryGroups);
      this.setState({ temporaryGroups: null });
    }
  };

  /**
   * Register a keyboard drag cancel function for a card
   */
  registerKeyboardDragCancel = (cardKey: string, cancel: () => void) => {
    this.keyboardDragCancelRegistry.set(cardKey, cancel);
  };

  /**
   * Unregister a keyboard drag cancel function for a card
   */
  unregisterKeyboardDragCancel = (cardKey: string) => {
    this.keyboardDragCancelRegistry.delete(cardKey);
  };

  /**
   * Cancel all active keyboard drags - called when mouse drag/resize starts
   */
  cancelAllKeyboardDrags = () => {
    this.keyboardDragCancelRegistry.forEach((cancel) => {
      cancel();
    });
    this.keyboardDragCancelRegistry.clear();
  };

  /**
   * Register a keyboard resize cancel function for a card
   */
  registerKeyboardResizeCancel = (cardKey: string, cancel: () => void) => {
    this.keyboardResizeCancelRegistry.set(cardKey, cancel);
  };

  /**
   * Unregister a keyboard resize cancel function for a card
   */
  unregisterKeyboardResizeCancel = (cardKey: string) => {
    this.keyboardResizeCancelRegistry.delete(cardKey);
  };

  /**
   * Cancel all active keyboard resizes - called when mouse drag/resize starts
   */
  cancelAllKeyboardResizes = () => {
    this.keyboardResizeCancelRegistry.forEach((cancel) => {
      cancel();
    });
    this.keyboardResizeCancelRegistry.clear();
  };

  /**
   * Get current shadow state
   */
  getShadowState = (): ShadowState<CardType> | null => {
    return this.state.shadowState;
  };

  /**
   * Update shadow state (which group has the shadow and the shadow card data)
   */
  updateShadowState = (shadowState: ShadowState<CardType>) => {
    this.setState({ shadowState });
  };

  /**
   * Clear shadow state
   */
  clearShadowState = () => {
    this.setState({ shadowState: null });
  };

  /**
   * Update layout
   */
  updateLayout = (layout: LayoutConfig) => {
    this.setState({ layout });
  };

  render() {
    // Use temporary groups during drag/resize, otherwise use props
    const groups = this.state.temporaryGroups ?? this.props.groups;

    // Get stable context value (only changes when render props change)
    const contextValue = this.getContextValue();

    return (
      <DndProvider backend={HTML5Backend}>
        <GridLayoutProvider value={contextValue}>
          <div data-testid="grid-layout-container" ref={this.containerRef}>
            <CustomDragLayer />
            {this.initGroupItem(groups)}
          </div>
        </GridLayoutProvider>
      </DndProvider>
    );
  }
}
