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

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGlobalCursor } from '../../hooks/useGlobalCursor';
import type { RenderResizeHandle } from '../../types';

export interface ResizeCallbackData {
  size: { height: number; width: number };
}

interface Props {
  children: (handle: React.ReactNode) => React.ReactNode;
  height: number;
  maxConstraints?: [number, number];
  minConstraints?: [number, number];
  onResize?: (e: React.MouseEvent, data: ResizeCallbackData) => void;
  onResizeStart?: (e: React.MouseEvent, data: ResizeCallbackData) => void;
  onResizeStop?: (e: React.MouseEvent, data: ResizeCallbackData) => void;
  renderResizeHandle: RenderResizeHandle;
  resizeHandleKeyDown?: React.KeyboardEventHandler;
  width: number;
}

export function ResizableBox(props: Readonly<Props>) {
  const {
    children,
    height,
    maxConstraints = [Infinity, Infinity],
    minConstraints = [1, 1],
    onResize,
    onResizeStart,
    onResizeStop,
    renderResizeHandle,
    resizeHandleKeyDown,
    width,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleElementRef = useRef<HTMLElement | null>(null);
  const [resizeState, setResizeState] = useState<{
    startHeight: number;
    startWidth: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [isHandleHovered, setIsHandleHovered] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if ('preventDefault' in e) {
        e.preventDefault();
      }
      if ('stopPropagation' in e) {
        e.stopPropagation();
      }

      // NOTE: Don't set cursor here - the useEffect will handle it when resizeState changes.
      // Setting it here would make the cleanup restore 'nwse-resize' instead of the original cursor.

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = width;
      const startHeight = height;

      setResizeState({
        startHeight,
        startWidth,
        startX,
        startY,
      });

      onResizeStart?.(e as React.MouseEvent, {
        size: { height: startHeight, width: startWidth },
      });
    },
    [width, height, onResizeStart],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeState) {
        return;
      }

      const { startHeight, startWidth, startX, startY } = resizeState;

      // Calculate delta based on resize direction
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Calculate new dimensions based on direction
      let newWidth = startWidth + deltaX;
      let newHeight = startHeight + deltaY;

      // Apply constraints - ensure we never go below minimum or above maximum
      newWidth = Math.max(minConstraints[0], Math.min(maxConstraints[0], newWidth));
      newHeight = Math.max(minConstraints[1], Math.min(maxConstraints[1], newHeight));

      // Call onResize with synthetic React event
      onResize?.(e as unknown as React.MouseEvent, {
        size: { height: newHeight, width: newWidth },
      });
    },
    [resizeState, minConstraints, maxConstraints, onResize],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!resizeState) {
        return;
      }

      const { startHeight, startWidth, startX, startY } = resizeState;

      // Calculate final dimensions
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let finalWidth = startWidth + deltaX;
      let finalHeight = startHeight + deltaY;

      // Apply constraints
      finalWidth = Math.max(minConstraints[0], Math.min(maxConstraints[0], finalWidth));
      finalHeight = Math.max(minConstraints[1], Math.min(maxConstraints[1], finalHeight));

      onResizeStop?.(e as unknown as React.MouseEvent, {
        size: { height: finalHeight, width: finalWidth },
      });

      setResizeState(null);
    },
    [resizeState, minConstraints, maxConstraints, onResizeStop],
  );

  // Set global cursor while resizing
  useGlobalCursor(Boolean(resizeState), 'nwse-resize');

  // Set up global mouse listeners when resizing
  useEffect(() => {
    if (!resizeState) {
      return undefined;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState, handleMouseMove, handleMouseUp]);

  // Callback ref for the resize handle - attaches event listeners when element is connected
  const resizeHandleRefCallback = useCallback(
    (element: HTMLElement | null) => {
      // Clean up previous element's listeners
      const prevElement = resizeHandleElementRef.current;
      if (prevElement) {
        prevElement.removeEventListener('mousedown', handleMouseDown as EventListener);
        prevElement.removeEventListener('mouseenter', () => {
          setIsHandleHovered(true);
        });
        prevElement.removeEventListener('mouseleave', () => {
          setIsHandleHovered(false);
        });
        prevElement.removeEventListener('focus', () => {
          setIsHandleHovered(true);
        });
        prevElement.removeEventListener('blur', () => {
          setIsHandleHovered(false);
        });
      }

      resizeHandleElementRef.current = element;

      if (element) {
        const onMouseEnter = () => {
          setIsHandleHovered(true);
        };
        const onMouseLeave = () => {
          setIsHandleHovered(false);
        };
        const onFocus = () => {
          setIsHandleHovered(true);
        };
        const onBlur = () => {
          setIsHandleHovered(false);
        };

        element.addEventListener('mousedown', handleMouseDown as EventListener);
        element.addEventListener('mouseenter', onMouseEnter);
        element.addEventListener('mouseleave', onMouseLeave);
        element.addEventListener('focus', onFocus);
        element.addEventListener('blur', onBlur);
      }
    },
    [handleMouseDown],
  );

  const noopKeyHandler = () => {
    /* noop */
  };

  const handleNode = renderResizeHandle({
    isHovered: isHandleHovered,
    isResizing: Boolean(resizeState),
    onKeyDown: resizeHandleKeyDown ?? noopKeyHandler,
    resizeHandleRef: resizeHandleRefCallback,
  });

  const content = children(handleNode);

  return (
    <div
      ref={containerRef}
      style={{
        height,
        position: 'relative',
        width,
      }}
    >
      {content}
    </div>
  );
}
