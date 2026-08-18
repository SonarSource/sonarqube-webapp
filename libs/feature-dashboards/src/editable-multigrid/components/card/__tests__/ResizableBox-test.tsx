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

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ResizeHandleElementProps } from '../../../types';
import { ResizableBox } from '../ResizableBox';

const mockRenderResizeHandle = jest.fn(
  ({ resizeHandleRef, onKeyDown, isHovered, isResizing }: ResizeHandleElementProps) => (
    <div
      data-hovered={isHovered}
      data-resizing={isResizing}
      data-testid="resize-handle"
      onKeyDown={onKeyDown}
      ref={resizeHandleRef}
      role="button"
      tabIndex={0}
    >
      Resize Handle
    </div>
  ),
);

beforeEach(() => {
  jest.clearAllMocks();
});

it('should render children with resize handle', () => {
  render(
    <ResizableBox height={200} renderResizeHandle={mockRenderResizeHandle} width={300}>
      {(handle) => (
        <div>
          Content
          {handle}
        </div>
      )}
    </ResizableBox>,
  );

  expect(screen.getByText('Content')).toBeInTheDocument();
  expect(screen.getByText('Resize Handle')).toBeInTheDocument();
});

it('should apply correct dimensions to container', () => {
  const { container } = render(
    <ResizableBox height={250} renderResizeHandle={mockRenderResizeHandle} width={400}>
      {(handle) => (
        <div>
          Content
          {handle}
        </div>
      )}
    </ResizableBox>,
  );

  const containerDiv = container.firstChild as HTMLElement;
  expect(containerDiv).toHaveStyle({
    width: '400px',
    height: '250px',
    position: 'relative',
  });
});

it('should call onResizeStart when mouse down on handle', () => {
  const onResizeStart = jest.fn();

  render(
    <ResizableBox
      height={200}
      onResizeStart={onResizeStart}
      renderResizeHandle={mockRenderResizeHandle}
      width={300}
    >
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');
  fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });

  expect(onResizeStart).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      size: { width: 300, height: 200 },
    }),
  );
});

it('should call onResize during mouse move', () => {
  const onResize = jest.fn();

  render(
    <ResizableBox
      height={200}
      onResize={onResize}
      renderResizeHandle={mockRenderResizeHandle}
      width={300}
    >
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');

  // Start resize
  fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });

  // Move mouse
  fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });

  expect(onResize).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      size: { width: 350, height: 250 },
    }),
  );
});

it('should call onResizeStop on mouse up', () => {
  const onResizeStop = jest.fn();

  render(
    <ResizableBox
      height={200}
      onResizeStop={onResizeStop}
      renderResizeHandle={mockRenderResizeHandle}
      width={300}
    >
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');

  // Start resize
  fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });

  // End resize
  fireEvent.mouseUp(document, { clientX: 150, clientY: 150 });

  expect(onResizeStop).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      size: { width: 350, height: 250 },
    }),
  );
});

it('should respect min constraints', () => {
  const onResize = jest.fn();

  render(
    <ResizableBox
      height={200}
      minConstraints={[100, 100]}
      onResize={onResize}
      renderResizeHandle={mockRenderResizeHandle}
      width={300}
    >
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');

  // Start resize at (100, 100)
  fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });

  // Try to resize below minimum: move to (50, 50) which would result in
  // width = 300 + (50 - 100) = 250, height = 200 + (50 - 100) = 150
  // But we need to move further to actually go below minimum
  // Move to (-150, -50) to get width = 300 + (-150 - 100) = 50, height = 200 + (-50 - 100) = 50
  fireEvent.mouseMove(document, { clientX: -150, clientY: -50 });

  // Should be clamped to minimum
  expect(onResize).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      size: { width: 100, height: 100 },
    }),
  );
});

it('should respect max constraints', () => {
  const onResize = jest.fn();

  render(
    <ResizableBox
      height={200}
      maxConstraints={[400, 300]}
      onResize={onResize}
      renderResizeHandle={mockRenderResizeHandle}
      width={300}
    >
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');

  // Start resize
  fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });

  // Try to resize above maximum
  fireEvent.mouseMove(document, { clientX: 500, clientY: 400 });

  // Should be clamped to maximum
  expect(onResize).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      size: { width: 400, height: 300 },
    }),
  );
});

it('should set handle hover state on mouse enter/leave', async () => {
  const user = userEvent.setup();

  render(
    <ResizableBox height={200} renderResizeHandle={mockRenderResizeHandle} width={300}>
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');

  // Initially not hovered
  expect(handle).toHaveAttribute('data-hovered', 'false');

  // Hover
  await user.hover(handle);
  expect(handle).toHaveAttribute('data-hovered', 'true');

  // Unhover
  await user.unhover(handle);
  expect(handle).toHaveAttribute('data-hovered', 'false');
});

it('should set handle hover state on focus/blur', async () => {
  render(
    <ResizableBox height={200} renderResizeHandle={mockRenderResizeHandle} width={300}>
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');

  // Initially not hovered
  expect(handle).toHaveAttribute('data-hovered', 'false');

  // Focus - wrap in act to handle state update
  act(() => {
    handle.focus();
  });
  await waitFor(() => {
    expect(handle).toHaveAttribute('data-hovered', 'true');
  });

  // Blur - need to wait for state update
  act(() => {
    handle.blur();
  });
  await waitFor(() => {
    expect(handle).toHaveAttribute('data-hovered', 'false');
  });
});

it('should indicate resizing state', () => {
  render(
    <ResizableBox height={200} renderResizeHandle={mockRenderResizeHandle} width={300}>
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');

  // Initially not resizing
  expect(handle).toHaveAttribute('data-resizing', 'false');

  // Start resize
  fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });
  expect(handle).toHaveAttribute('data-resizing', 'true');

  // End resize
  fireEvent.mouseUp(document, { clientX: 150, clientY: 150 });
  expect(handle).toHaveAttribute('data-resizing', 'false');
});

it('should handle keyboard events on resize handle', async () => {
  const resizeHandleKeyDown = jest.fn();

  render(
    <ResizableBox
      height={200}
      renderResizeHandle={mockRenderResizeHandle}
      resizeHandleKeyDown={resizeHandleKeyDown}
      width={300}
    >
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');

  // Focus the handle explicitly - wrap in act to handle state update
  act(() => {
    handle.focus();
  });
  await waitFor(() => {
    expect(handle).toHaveFocus();
  });

  // Send keyboard event directly to the handle
  fireEvent.keyDown(handle, { key: 'ArrowRight', code: 'ArrowRight' });

  expect(resizeHandleKeyDown).toHaveBeenCalled();
});

it('should not call onResize if not resizing', () => {
  const onResize = jest.fn();

  render(
    <ResizableBox
      height={200}
      onResize={onResize}
      renderResizeHandle={mockRenderResizeHandle}
      width={300}
    >
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  // Move mouse without starting resize
  fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });

  expect(onResize).not.toHaveBeenCalled();
});

it('should clean up event listeners on unmount', () => {
  const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

  const { unmount } = render(
    <ResizableBox height={200} renderResizeHandle={mockRenderResizeHandle} width={300}>
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');

  // Start resize
  fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });

  // Unmount
  unmount();

  // Should have cleaned up
  expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

  removeEventListenerSpy.mockRestore();
});

it('should prevent default and stop propagation on mousedown', () => {
  const onResizeStart = jest.fn();

  render(
    <ResizableBox
      height={200}
      onResizeStart={onResizeStart}
      renderResizeHandle={mockRenderResizeHandle}
      width={300}
    >
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');
  const event = new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true });
  const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
  const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

  fireEvent(handle, event);

  expect(preventDefaultSpy).toHaveBeenCalled();
  expect(stopPropagationSpy).toHaveBeenCalled();
});

it('should handle multiple resize cycles', () => {
  const onResizeStart = jest.fn();
  const onResizeStop = jest.fn();

  render(
    <ResizableBox
      height={200}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      renderResizeHandle={mockRenderResizeHandle}
      width={300}
    >
      {(handle) => <div>{handle}</div>}
    </ResizableBox>,
  );

  const handle = screen.getByTestId('resize-handle');

  // First resize cycle
  fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });
  fireEvent.mouseUp(document, { clientX: 150, clientY: 150 });

  // Second resize cycle
  fireEvent.mouseDown(handle, { clientX: 150, clientY: 150 });
  fireEvent.mouseUp(document, { clientX: 200, clientY: 200 });

  expect(onResizeStart).toHaveBeenCalledTimes(2);
  expect(onResizeStop).toHaveBeenCalledTimes(2);
});
