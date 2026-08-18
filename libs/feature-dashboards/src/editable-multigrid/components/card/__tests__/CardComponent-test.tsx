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

import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import {
  CARD_TRANSITION,
  DRAG_OPACITY,
  RESIZE_SHADOW_OPACITY,
  RESIZE_Z_INDEX,
} from '../../../constants';
import type { Card, LayoutConfig, Position, ResizeHandleElementProps } from '../../../types';
import { useGridLayout } from '../../GridLayoutContext';
import { CardComponent, MemoizedCardComponent } from '../CardComponent';
import { useCardDrag } from '../useCardDrag';
import { useCardResize } from '../useCardResize';
import { useKeyboardDrag } from '../useKeyboardDrag';
import { useKeyboardResize } from '../useKeyboardResize';

jest.mock('../../GridLayoutContext', () => ({
  useGridLayout: jest.fn(),
}));

jest.mock('../useCardResize', () => ({
  useCardResize: jest.fn(),
}));

jest.mock('../useCardDrag', () => ({
  useCardDrag: jest.fn(),
}));

jest.mock('../useKeyboardDrag', () => ({
  useKeyboardDrag: jest.fn(),
}));

jest.mock('../useKeyboardResize', () => ({
  useKeyboardResize: jest.fn(),
}));

const mockUseGridLayout = jest.mocked(useGridLayout);
const mockUseCardResize = jest.mocked(useCardResize);
const mockUseCardDrag = jest.mocked(useCardDrag);
const mockUseKeyboardDrag = jest.mocked(useKeyboardDrag);
const mockUseKeyboardResize = jest.mocked(useKeyboardResize);

interface TestCard extends Card {
  label: string;
}

const mockCard: TestCard = {
  dimensions: { height: 2, width: 2 },
  key: 'card-1',
  label: 'Test card',
  position: { x: 1, y: 0 },
};

const mockLayout: LayoutConfig = {
  calWidth: 100,
  col: 6,
  containerHeight: 600,
  containerPadding: [0, 0],
  containerWidth: 600,
  margin: [10, 10],
  rowHeight: 100,
};

const gridPosition: Position = { x: 1, y: 0 };

const mockRenderResizeHandle = jest.fn(
  ({ resizeHandleRef, onKeyDown }: ResizeHandleElementProps) => (
    <button
      aria-label="Resize"
      data-testid="resize-handle"
      onKeyDown={onKeyDown}
      ref={(element) => {
        resizeHandleRef(element);
      }}
      type="button"
    />
  ),
);

function getPositionedWrapper(): HTMLElement {
  /* eslint-disable testing-library/no-node-access -- absolute-position wrapper has no semantic role */
  const card = screen.getByTestId('card-content').closest('.card');
  const wrapper = card?.parentElement?.parentElement;
  /* eslint-enable testing-library/no-node-access */

  if (!wrapper) {
    throw new Error('positioned wrapper not found');
  }

  return wrapper;
}

function createKeyboardDragMock(
  overrides: Partial<ReturnType<typeof useKeyboardDrag>> = {},
): ReturnType<typeof useKeyboardDrag> {
  return {
    finalizeKeyboardDrag: jest.fn(),
    handleDragKeyDown: jest.fn(),
    isKeyboardDragging: false,
    ...overrides,
  };
}

function createDefaultGridContext(): ReturnType<typeof useGridLayout> {
  return {
    cancelAllKeyboardDrags: jest.fn(),
    cancelAllKeyboardResizes: jest.fn(),
    clearShadowState: jest.fn(),
    getGroups: jest.fn(() => []),
    getMaxSize: jest.fn(() => ({ height: 4, width: 6 })),
    getMinSize: jest.fn(() => ({ height: 1, width: 1 })),
    getShadowState: jest.fn(() => null),
    onCardDelete: jest.fn(),
    onCardEdit: jest.fn(),
    onResize: jest.fn(),
    onResizeStart: jest.fn(),
    onResizeStop: jest.fn(),
    registerKeyboardDragCancel: jest.fn(),
    registerKeyboardResizeCancel: jest.fn(),
    renderCard: jest.fn((card: TestCard) => <div data-testid="card-content">{card.label}</div>),
    renderCardHeader: jest.fn(
      ({
        dragHandleRef,
        onDelete,
        onEdit,
        onKeyDown,
      }: {
        dragHandleRef: React.RefCallback<HTMLElement>;
        onDelete: () => void;
        onEdit?: () => void;
        onKeyDown: (event: React.KeyboardEvent) => void;
      }) => (
        <div data-testid="card-header">
          <div className="drag-handle-container" data-testid="drag-handle" ref={dragHandleRef} />
          <button data-testid="delete-button" onClick={onDelete} type="button">
            Delete
          </button>
          {onEdit ? (
            <button data-testid="edit-button" onClick={onEdit} type="button">
              Edit
            </button>
          ) : null}
          <button
            aria-label="Drag"
            data-testid="drag-keydown-target"
            onKeyDown={onKeyDown}
            type="button"
          />
        </div>
      ),
    ),
    renderDragPreview: jest.fn(),
    renderGroup: jest.fn(),
    renderResizeHandle: mockRenderResizeHandle,
    unregisterKeyboardDragCancel: jest.fn(),
    unregisterKeyboardResizeCancel: jest.fn(),
    updateGroupList: jest.fn(),
    updateShadowState: jest.fn(),
  };
}

function createDefaultHookMocks() {
  const keyboardResizeHandler = jest.fn();

  mockUseCardResize.mockReturnValue({
    handleResize: jest.fn(),
    handleResizeStart: jest.fn(),
    handleResizeStop: jest.fn(),
    isResizing: false,
    resizeDimensions: null,
    resizeGridDimensions: null,
  });

  mockUseCardDrag.mockReturnValue({
    connectDrag: jest.fn(),
    isDragging: false,
  });

  mockUseKeyboardDrag.mockReturnValue(createKeyboardDragMock());

  mockUseKeyboardResize.mockReturnValue({
    handleResizeKeyDown: keyboardResizeHandler,
    isKeyboardResizing: false,
    keyboardResizeDimensions: null,
  });

  return { keyboardResizeHandler };
}

function renderCardComponent(
  props: Partial<{
    card: TestCard;
    cardKey: string;
    groupKey: string;
    layout: LayoutConfig;
    position: Position;
  }> = {},
) {
  return render(
    <CardComponent
      card={props.card ?? mockCard}
      cardKey={props.cardKey ?? mockCard.key}
      groupKey={props.groupKey ?? 'group-1'}
      layout={props.layout ?? mockLayout}
      position={props.position ?? gridPosition}
    />,
  );
}

describe('CardComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGridLayout.mockReturnValue(createDefaultGridContext());
    createDefaultHookMocks();
  });

  it('renders card header, content, and resize handle', () => {
    renderCardComponent();

    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toHaveTextContent('Test card');
    expect(screen.getByTestId('resize-handle')).toBeInTheDocument();
  });

  it('uses default opacity and transition when idle', () => {
    renderCardComponent();
    const wrapper = getPositionedWrapper();

    expect(wrapper).toHaveStyle({ opacity: '1', transition: CARD_TRANSITION, zIndex: 'auto' });
  });

  it('applies drag opacity and disables transition while dragging', () => {
    mockUseCardDrag.mockReturnValue({
      connectDrag: jest.fn(),
      isDragging: true,
    });

    renderCardComponent();
    const wrapper = getPositionedWrapper();

    expect(wrapper).toHaveStyle({ opacity: String(DRAG_OPACITY), transition: 'none' });
  });

  it('applies correct styles to drag-handle-container based on dragging state', () => {
    const { rerender } = renderCardComponent();
    const dragHandle = screen.getByTestId('drag-handle');

    // Idle state: opacity 0, pointer-events none
    expect(dragHandle).toHaveStyle({ opacity: '0', 'pointer-events': 'none' });

    mockUseCardDrag.mockReturnValue({
      connectDrag: jest.fn(),
      isDragging: true,
    });

    rerender(
      <CardComponent
        card={mockCard}
        cardKey={mockCard.key}
        groupKey="group-1"
        layout={mockLayout}
        position={gridPosition}
      />,
    );

    // Dragging state: opacity 1, pointer-events auto
    expect(dragHandle).toHaveStyle({ opacity: '1', 'pointer-events': 'auto' });
  });

  it('hides the card while keyboard dragging', () => {
    mockUseKeyboardDrag.mockReturnValue(createKeyboardDragMock({ isKeyboardDragging: true }));

    renderCardComponent();
    const wrapper = getPositionedWrapper();

    expect(wrapper).toHaveStyle({ opacity: '0' });
  });

  it('renders resize shadow during mouse resize', () => {
    mockUseCardResize.mockReturnValue({
      handleResize: jest.fn(),
      handleResizeStart: jest.fn(),
      handleResizeStop: jest.fn(),
      isResizing: true,
      resizeDimensions: { height: 250, width: 250 },
      resizeGridDimensions: { h: 3, w: 3 },
    });

    renderCardComponent();
    /* eslint-disable-next-line testing-library/no-node-access -- resize shadow overlay has no semantic role */
    const shadow = document.querySelector('.card-shadow');

    expect(shadow).toBeInTheDocument();
    expect(shadow).toHaveStyle({
      opacity: String(RESIZE_SHADOW_OPACITY),
      position: 'absolute',
      transition: CARD_TRANSITION,
    });
    expect(getPositionedWrapper()).toHaveStyle({
      transition: 'none',
      zIndex: String(RESIZE_Z_INDEX),
    });
  });

  it('renders resize shadow during keyboard resize', () => {
    mockUseKeyboardResize.mockReturnValue({
      handleResizeKeyDown: jest.fn(),
      isKeyboardResizing: true,
      keyboardResizeDimensions: { h: 2, w: 2 },
    });

    renderCardComponent();

    /* eslint-disable-next-line testing-library/no-node-access -- resize shadow overlay has no semantic role */
    expect(document.querySelector('.card-shadow')).toBeInTheDocument();
  });

  it('does not render resize shadow when resize dimensions are missing', () => {
    mockUseCardResize.mockReturnValue({
      handleResize: jest.fn(),
      handleResizeStart: jest.fn(),
      handleResizeStop: jest.fn(),
      isResizing: true,
      resizeDimensions: { height: 250, width: 250 },
      resizeGridDimensions: null,
    });

    renderCardComponent();

    /* eslint-disable-next-line testing-library/no-node-access -- resize shadow overlay has no semantic role */
    expect(document.querySelector('.card-shadow')).not.toBeInTheDocument();
  });

  it('calls onCardDelete from the header', () => {
    const context = createDefaultGridContext();
    mockUseGridLayout.mockReturnValue(context);

    renderCardComponent();

    fireEvent.click(screen.getByTestId('delete-button'));

    expect(context.onCardDelete).toHaveBeenCalledWith('card-1', 'group-1');
  });

  it('calls onCardEdit from the header when provided', () => {
    const context = createDefaultGridContext();
    mockUseGridLayout.mockReturnValue(context);

    renderCardComponent();

    fireEvent.click(screen.getByTestId('edit-button'));

    expect(context.onCardEdit).toHaveBeenCalledWith('card-1', 'group-1');
  });

  it('omits edit action when onCardEdit is not provided', () => {
    const context = { ...createDefaultGridContext(), onCardEdit: undefined };
    mockUseGridLayout.mockReturnValue(context);

    renderCardComponent();

    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
  });

  it('connects the drag handle to react-dnd', () => {
    const connectDrag = jest.fn();
    mockUseCardDrag.mockReturnValue({
      connectDrag,
      isDragging: false,
    });

    renderCardComponent();

    expect(connectDrag).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('skips keyboard resize on Enter while keyboard dragging', () => {
    const { keyboardResizeHandler } = createDefaultHookMocks();
    mockUseKeyboardDrag.mockReturnValue(createKeyboardDragMock({ isKeyboardDragging: true }));

    renderCardComponent();

    fireEvent.keyDown(screen.getByTestId('resize-handle'), { key: 'Enter' });

    expect(keyboardResizeHandler).not.toHaveBeenCalled();
  });

  it('forwards other resize handle keys to keyboard resize', () => {
    const { keyboardResizeHandler } = createDefaultHookMocks();

    renderCardComponent();

    fireEvent.keyDown(screen.getByTestId('resize-handle'), { key: 'ArrowRight' });

    expect(keyboardResizeHandler).toHaveBeenCalled();
  });

  it('forwards Enter to keyboard resize when not keyboard dragging', () => {
    const { keyboardResizeHandler } = createDefaultHookMocks();

    renderCardComponent();

    fireEvent.keyDown(screen.getByTestId('resize-handle'), { key: 'Enter' });

    expect(keyboardResizeHandler).toHaveBeenCalled();
  });

  it('passes isDragging state to header and card content renderers', () => {
    const context = createDefaultGridContext();
    mockUseGridLayout.mockReturnValue(context);
    mockUseCardDrag.mockReturnValue({
      connectDrag: jest.fn(),
      isDragging: true,
    });

    renderCardComponent();

    expect(context.renderCardHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        card: mockCard,
        isDragging: true,
        isKeyboardDragging: false,
      }),
    );
    expect(context.renderCard).toHaveBeenCalledWith(mockCard, true);
  });

  it('reconnects drag handle when connectDrag changes', () => {
    const connectDrag = jest.fn();
    mockUseCardDrag.mockReturnValue({
      connectDrag,
      isDragging: false,
    });

    const { rerender } = renderCardComponent();
    const nextConnectDrag = jest.fn();
    mockUseCardDrag.mockReturnValue({
      connectDrag: nextConnectDrag,
      isDragging: false,
    });

    rerender(
      <CardComponent
        card={mockCard}
        cardKey={mockCard.key}
        groupKey="group-1"
        layout={mockLayout}
        position={gridPosition}
      />,
    );

    expect(nextConnectDrag).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

describe('MemoizedCardComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGridLayout.mockReturnValue(createDefaultGridContext());
    createDefaultHookMocks();
  });

  it('renders the same card UI as CardComponent', () => {
    render(
      <MemoizedCardComponent
        card={mockCard}
        cardKey={mockCard.key}
        groupKey="group-1"
        layout={mockLayout}
        position={gridPosition}
      />,
    );

    expect(screen.getByTestId('card-content')).toHaveTextContent('Test card');
  });
});
