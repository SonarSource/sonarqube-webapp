# Editable Multi-Grid Layout System

A reusable, generic drag-and-drop grid layout system for React that supports multiple groups/sections with cards that can be moved between groups, resized, and reordered. Built with accessibility and performance in mind.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Integration Guide](#integration-guide)
- [Performance Considerations](#performance-considerations)
- [Accessibility Features](#accessibility-features)
- [Design Decisions](#design-decisions)

---

## Architecture Overview

### Component Hierarchy

```
GridLayout (Root Container)
├── DndProvider (React DnD)
├── CustomDragLayer (Global drag preview)
└── GroupItemComponent (For each group)
    └── CardComponent (For each card)
        ├── CardHeader (Drag handle area)
        ├── Card Content (User-provided)
        └── ResizableBox (Resize handles)
```

### Data Flow

```
User Interaction
    ↓
GridLayout (State Management)
    ↓
Shadow State + Temporary Groups (Preview)
    ↓
Collision Detection + Compaction
    ↓
onGroupsChange (Callback to parent)
    ↓
Parent Updates Groups Prop
    ↓
Re-render with New Layout
```

### State Management

The system uses three layers of state:

1. **Props State** (`groups`): The source of truth from the parent
2. **Temporary Groups** (`temporaryGroups`): Used during drag/resize for visual preview
3. **Shadow State** (`shadowState`): Represents a card being keyboard-dragged (shows destination preview)

During operations:

- **Idle**: Renders `props.groups`
- **Mouse Drag/Resize**: Renders `temporaryGroups` (optimistic preview)
- **Keyboard Drag**: Renders `props.groups` + shadow card inserted at destination

---

## Core Concepts

### Card

A **Card** is the basic draggable/resizable unit in the grid.

```typescript
interface Card {
  key: string; // Unique identifier
  position: Position; // { x, y } in grid units
  dimensions: Dimensions; // { width, height } in grid units
}
```

Cards are **generic** - extend this interface with your own data:

```typescript
interface WidgetCard extends Card {
  widgetType: 'metric' | 'chart' | 'table';
  title: string;
  config: WidgetConfig;
}
```

### Group

A **Group** is a container that holds multiple cards.

```typescript
interface Group<CardType extends Card = Card> {
  key: string; // Unique identifier
  children: CardType[]; // Cards within this group
}
```

Groups provide:

- Independent grid spaces (each group has its own coordinate system)
- Visual separation (sections/categories)
- Organizational structure (cards can be moved between groups)

### Grid Coordinates

All positions and dimensions are in **grid units**, not pixels:

- `position: { x: 2, y: 1 }` → 3rd column, 2nd row
- `dimensions: { width: 3, height: 2 }` → Spans 3 columns, 2 rows

The layout config converts these to pixels for rendering:

```typescript
const pixelX = position.x * (columnWidth + margin[0]) + containerPadding[0];
const pixelY = position.y * (rowHeight + margin[1]) + containerPadding[1];
```

---

## API Reference

### GridLayout Props

#### Required Props

| Prop                 | Type                                                                  | Description                          |
| -------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| `groups`             | `GroupType[]`                                                         | Array of groups with their cards     |
| `onGroupsChange`     | `(groups: GroupType[]) => void`                                       | Callback when layout changes         |
| `renderCard`         | `(card: CardType, isDragging: boolean) => ReactNode`                  | Render function for card content     |
| `renderCardHeader`   | `(props: CardHeaderElementProps) => ReactNode`                        | Render function for drag handle area |
| `renderDragPreview`  | `(card: CardType, dimensions: Dimensions) => ReactNode`               | Render function for drag preview     |
| `renderGroup`        | `(group: GroupType, children: ReactNode, index: number) => ReactNode` | Render function for group wrapper    |
| `renderResizeHandle` | `(props: ResizeHandleElementProps) => ReactNode`                      | Render function for resize handles   |

#### Optional Props

| Prop                    | Type                                          | Default                   | Description                          |
| ----------------------- | --------------------------------------------- | ------------------------- | ------------------------------------ |
| `layout`                | `LayoutConfig`                                | See constants.ts          | Grid layout configuration            |
| `getMinSize`            | `(card: CardType) => Dimensions`              | `{ width: 1, height: 1 }` | Minimum card size constraints        |
| `getMaxSize`            | `(card: CardType) => Dimensions`              | `{ width: 6, height: 4 }` | Maximum card size constraints        |
| `onCardDelete`          | `(cardKey: string, groupKey: string) => void` | `undefined`               | Callback when a card is deleted      |
| `onCardEdit`            | `(cardKey: string, groupKey: string) => void` | `undefined`               | Callback when a card is edited       |
| `renderGroupDependency` | `unknown`                                     | `undefined`               | Dependency to force group re-renders |

### Render Function Props

#### CardHeaderElementProps

```typescript
interface CardHeaderElementProps<CardType> {
  card: CardType; // Card data
  dragHandleRef: React.RefCallback<HTMLElement>; // Attach to draggable element
  isDragging: boolean; // True during mouse drag
  isKeyboardDragging: boolean; // True during keyboard drag
  onDelete: () => void; // Delete callback
  onEdit?: () => void; // Edit callback (optional)
  onKeyDown: React.KeyboardEventHandler; // Keyboard handler for drag
}
```

#### ResizeHandleElementProps

```typescript
interface ResizeHandleElementProps {
  isHovered: boolean; // True when handle is hovered/focused
  isResizing: boolean; // True during resize
  resizeHandleRef: React.RefCallback<HTMLElement>; // Attach to handle element
  onKeyDown: React.KeyboardEventHandler; // Keyboard handler for resize
}
```

---

## Integration Guide

### Basic Example

```tsx
import { GridLayout } from 'libs/shared/src/editable-multigrid';
import type { Card, Group } from 'libs/shared/src/editable-multigrid';

// 1. Define your card type
interface MyCard extends Card {
  title: string;
  content: string;
}

// 2. Define your group type
interface MyGroup extends Group<MyCard> {
  title: string;
}

// 3. Use the component
function MyDashboard() {
  const [groups, setGroups] = useState<MyGroup[]>([
    {
      key: 'section-1',
      title: 'Main Section',
      children: [
        {
          key: 'card-1',
          title: 'Card 1',
          content: 'Hello',
          position: { x: 0, y: 0 },
          dimensions: { width: 2, height: 1 },
        },
      ],
    },
  ]);

  return (
    <GridLayout
      groups={groups}
      onGroupsChange={setGroups}
      renderCard={(card) => <div>{card.content}</div>}
      renderCardHeader={({ card, dragHandleRef, onKeyDown, isDragging }) => (
        <div ref={dragHandleRef} onKeyDown={onKeyDown}>
          {card.title}
        </div>
      )}
      renderDragPreview={(card) => <div>{card.title}</div>}
      renderGroup={(group, children) => (
        <section>
          <h2>{group.title}</h2>
          {children}
        </section>
      )}
      renderResizeHandle={({ resizeHandleRef, onKeyDown }) => (
        <button ref={resizeHandleRef} onKeyDown={onKeyDown}>
          ↘
        </button>
      )}
    />
  );
}
```

### Advanced: Custom Card Constraints

```tsx
<GridLayout
  groups={groups}
  onGroupsChange={setGroups}
  getMinSize={(card) => {
    // Charts need more space
    if (card.widgetType === 'chart') {
      return { width: 2, height: 2 };
    }
    return { width: 1, height: 1 };
  }}
  getMaxSize={(card) => {
    // Metrics can't be too large
    if (card.widgetType === 'metric') {
      return { width: 2, height: 1 };
    }
    return { width: 6, height: 4 };
  }}
  // ... other props
/>
```

### Advanced: Custom Layout Configuration

```tsx
const customLayout: LayoutConfig = {
  col: 12, // 12 columns instead of default 6
  rowHeight: 80, // Shorter rows
  margin: [8, 8], // Tighter spacing
  containerPadding: [16, 16],
  // These will be calculated automatically:
  calWidth: 0,
  containerWidth: 0,
  containerHeight: 0,
};

<GridLayout
  layout={customLayout}
  // ... other props
/>;
```

---

## Performance Considerations

### Reference Preservation

The library uses **reference preservation** to enable React's memoization:

```typescript
// ✅ Good - Preserves reference when position unchanged
if (finalY === item.position.y) {
  return item; // Same object reference
}

// ❌ Bad - Always creates new object
return { ...item, position: { x: item.position.x, y: finalY } };
```

This pattern appears throughout the codebase (compaction, collision detection) to minimize re-renders.

### Memoization Strategy

1. **Component Level**: `CardComponent` and `GroupItemComponent` are wrapped in `memo()`
2. **Hook Level**: `useKeyboardDrag` and `useKeyboardResize` minimize state updates
3. **Context Level**: `GridLayout` uses a class component to maintain stable context value

### Class Component Rationale

`GridLayout` is a **class component** (not functional) for performance:

1. **Stable context value**: `createContextValue()` called once, cached forever
2. **Ref-based render props**: Even inline arrow functions don't cause context changes
3. **ResizeObserver lifecycle**: Clean setup/teardown without useEffect complexity
4. **State coordination**: Multiple related state pieces (layout, shadow, temporary groups)

### Performance Tips

- **Keep render functions pure**: They're called frequently during drag/resize
- **Memoize expensive card content**: Use `React.memo()` on your card content components
- **Avoid inline object creation**: Define `getMinSize`/`getMaxSize` outside render if static
- **Use `renderGroupDependency`** sparingly: Only when absolutely needed for group re-renders

---

## Accessibility Features

### Keyboard Navigation

The library provides full keyboard support:

#### Dragging

1. Focus the card header (drag handle)
2. Press `Enter` to start drag mode
3. Use arrow keys to move the shadow card
4. Press `Enter` to confirm, `Escape` to cancel, or `Tab` to confirm and move focus

#### Resizing

1. Focus the resize handle
2. Press `Enter` to start resize mode
3. Use arrow keys to adjust size
4. Press `Enter` to confirm, `Escape` to cancel

#### Screen Reader Hints

- Drag handles announce "Press Enter to start dragging"
- During drag: "Use arrow keys to move, Enter to drop, Escape to cancel"
- Resize handles announce "Press Enter to start resizing"

### ARIA Labels

Render functions should provide appropriate ARIA labels:

```tsx
renderCardHeader={({ dragHandleRef, onKeyDown }) => (
  <div
    ref={dragHandleRef}
    onKeyDown={onKeyDown}
    role="button"
    tabIndex={0}
    aria-label="Drag handle"
  >
    ...
  </div>
)}
```

### Focus Management

- Focus is automatically restored after keyboard drag/resize
- Tab order is preserved during operations
- Visual focus indicators should be styled by consumers

---

## Design Decisions

### Why Not Use `react-grid-layout`?

We built a custom implementation instead of using the popular `react-grid-layout` library because:

1. **Multi-Group Support**: We need multiple independent grids (sections) with cards that can move between them
2. **Keyboard Accessibility**: Our specific requirements for keyboard navigation and screen reader support
3. **Integration**: Tight integration with our existing dashboard architecture and data model
4. **Control**: Full control over collision detection and compaction algorithms to match our UX requirements
5. **Bundle Size**: Smaller bundle without unused features from a general-purpose library

### Shadow Card Pattern

During **keyboard drag**, we use a "shadow card" approach:

- Original card stays in place (maintains layout stability)
- Shadow card appears at destination (shows where it will go)
- On confirm, original moves to shadow position

This differs from mouse drag (which moves the actual card) because:

- Keyboard users need clear visual feedback about where the card will land
- Allows cancellation without layout disruption
- Better screen reader experience (announced position changes)

### Collision Detection Algorithm

We use **Axis-Aligned Bounding Box (AABB)** collision detection:

```typescript
function collides(card1: Card, card2: Card): boolean {
  return !(
    card1.position.x + card1.dimensions.width <= card2.position.x ||
    card2.position.x + card2.dimensions.width <= card1.position.x ||
    card1.position.y + card1.dimensions.height <= card2.position.y ||
    card2.position.y + card2.dimensions.height <= card1.position.y
  );
}
```

When collisions occur, cards are moved down one row at a time until no collisions remain. Then compaction moves everything up to minimize vertical space.

### Compaction Strategy

Compaction runs after every drag/resize to eliminate gaps:

1. Sort cards by y-position (top to bottom)
2. For each card, move up as far as possible without collisions
3. Preserve horizontal positions (only vertical compaction)
4. Preserve object references when positions don't change (for memoization)

### Layout Calculation Timing

Initial layout uses placeholder values, then calculates actual values in `componentDidMount`:

```typescript
constructor(props) {
  this.state = {
    layout: props.layout ?? defaultLayoutConfig, // Placeholders
  };
}

componentDidMount() {
  this.calculateLayout(); // Real values based on container size
}
```

This causes a brief flash on first render but is necessary because:

- Container dimensions aren't available until mounted in the DOM
- Server-side rendering compatibility
- ResizeObserver needs a mounted element

---

## File Organization

```
editable-multigrid/
├── README.md                    ← This file
├── index.ts                     ← Public API
├── types.ts                     ← TypeScript definitions
├── constants.ts                 ← Configuration constants
├── components/
│   ├── GridLayout.tsx           ← Main component (class component)
│   ├── GridLayoutContext.tsx    ← Context provider
│   ├── GroupItemComponent.tsx   ← Group wrapper
│   ├── CustomDragLayer.tsx      ← Global drag preview
│   ├── ShadowCard.tsx           ← Keyboard drag preview
│   └── card/
│       ├── CardComponent.tsx    ← Individual card
│       ├── MemoizedCardContent.tsx
│       ├── ResizableBox.tsx     ← Resize functionality
│       ├── useCardDrag.ts       ← Mouse drag hook
│       ├── useCardResize.ts     ← Mouse resize hook
│       ├── useKeyboardDrag.ts   ← Keyboard drag hook
│       ├── useKeyboardResize.ts ← Keyboard resize hook
│       ├── cardPositionUtils.ts ← Position calculations
│       └── __tests__/           ← Unit tests
├── hooks/
│   └── useGlobalCursor.ts       ← Cursor style management
└── utils/
    ├── index.ts                 ← Utility exports
    ├── utils.ts                 ← General utilities
    ├── collision.ts             ← Collision detection
    ├── compact.ts               ← Compaction algorithm
    └── __tests__/               ← Utility tests
```

---

## Testing

### Current Coverage

- ✅ **Utils**: Full coverage of collision detection, compaction, and position calculations
- ✅ **Hooks**: Unit tests for keyboard drag/resize logic
- ⚠️ **Components**: Limited integration tests

### Running Tests

```bash
# Run all multigrid tests
yarn nx test sq-server --testPathPattern=editable-multigrid

# Run specific test file
yarn nx test sq-server libs/shared/src/editable-multigrid/utils/__tests__/compact-test.ts
```

---

## Common Patterns

### Updating Card Data

```tsx
// ✅ Good - Update groups immutably
const updatedGroups = groups.map((group) => ({
  ...group,
  children: group.children.map((card) =>
    card.key === targetKey ? { ...card, title: newTitle } : card,
  ),
}));
setGroups(updatedGroups);
```

### Adding a New Card

```tsx
const newCard: MyCard = {
  key: `card-${Date.now()}`,
  title: 'New Card',
  position: { x: 0, y: 0 }, // Library will auto-position
  dimensions: { width: 2, height: 1 },
};

const updatedGroups = groups.map((group) =>
  group.key === targetGroupKey ? { ...group, children: [...group.children, newCard] } : group,
);

setGroups(updatedGroups);
```

### Removing a Card

```tsx
// Option 1: Use onCardDelete callback
<GridLayout
  onCardDelete={(cardKey, groupKey) => {
    const updated = groups.map(group =>
      group.key === groupKey
        ? { ...group, children: group.children.filter(c => c.key !== cardKey) }
        : group
    );
    setGroups(updated);
  }}
  // ... other props
/>

// Option 2: Handle in renderCardHeader
renderCardHeader={({ card, onDelete }) => (
  <div>
    <button onClick={onDelete}>×</button>
  </div>
)}
```

---

## Troubleshooting

### Cards overlap after drag

- **Cause**: Collision detection or compaction not running
- **Solution**: Ensure `onGroupsChange` callback updates state properly

### Performance issues with many cards

- **Cause**: Render functions creating new objects/functions
- **Solution**: Memoize card content, define callbacks outside render

### Keyboard drag not working

- **Cause**: Missing `onKeyDown` handler on drag handle
- **Solution**: Pass `onKeyDown` to focusable element in `renderCardHeader`

### Resize constraints not working

- **Cause**: `getMinSize`/`getMaxSize` returning invalid values
- **Solution**: Ensure min ≤ current size ≤ max, and min width/height ≥ 1

### Layout calculation wrong on first render

- **Expected**: Brief flash as layout calculates container size
- **Solution**: Accept this or hide content until `componentDidMount` completes

---

## Future Enhancements

Potential improvements not yet implemented:

- [ ] Undo/redo support at library level
- [ ] Configurable compaction direction (horizontal or none)
- [ ] Built-in group reordering (currently left to consumers)
- [ ] Touch device support (mobile drag/resize)
- [ ] Virtualization for very large grids (100+ cards)
- [ ] Snap-to-grid during drag (currently only on drop)
- [ ] Animation during compaction (currently instant)

---

## Questions?

For implementation questions or issues:

1. Check this README first
2. Look at `EditableDashboard.tsx` for a real-world example
3. Review the inline comments in `GridLayout.tsx` and related files
4. Reach out to the dashboard team

---

**Last Updated**: January 20, 2026
**Version**: 1.0.0
