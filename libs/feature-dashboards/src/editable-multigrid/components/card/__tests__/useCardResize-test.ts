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

import { act, renderHook } from '@testing-library/react';
import type { Dimensions, LayoutConfig } from '../../../types';
import type { ResizeCallbackData } from '../ResizableBox';
import { useCardResize } from '../useCardResize';

const mockLayout: LayoutConfig = {
  col: 12,
  rowHeight: 100,
  containerWidth: 1200,
  containerHeight: 800,
  calWidth: 100,
  margin: [10, 10],
  containerPadding: [10, 10],
};

const mockDimensions: Dimensions = {
  width: 2,
  height: 2,
};

describe('useCardResize', () => {
  let mockOnResize: jest.Mock;
  let mockOnResizeStart: jest.Mock;
  let mockOnResizeStop: jest.Mock;
  let mockCancelAllKeyboardDrags: jest.Mock;
  let mockCancelAllKeyboardResizes: jest.Mock;

  beforeEach(() => {
    mockOnResize = jest.fn();
    mockOnResizeStart = jest.fn();
    mockOnResizeStop = jest.fn();
    mockCancelAllKeyboardDrags = jest.fn();
    mockCancelAllKeyboardResizes = jest.fn();
  });

  it('should initialize with isResizing false', () => {
    const { result } = renderHook(() =>
      useCardResize({
        cardKey: 'card-1',
        groupKey: 'group-1',
        dimensions: mockDimensions,
        layout: mockLayout,
        onResize: mockOnResize,
        onResizeStart: mockOnResizeStart,
        onResizeStop: mockOnResizeStop,
        cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
        cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
      }),
    );

    expect(result.current.isResizing).toBe(false);
    expect(result.current.resizeDimensions).toBeNull();
    expect(result.current.resizeGridDimensions).toBeNull();
  });

  it('should provide resize handlers', () => {
    const { result } = renderHook(() =>
      useCardResize({
        cardKey: 'card-1',
        groupKey: 'group-1',
        dimensions: mockDimensions,
        layout: mockLayout,
        onResize: mockOnResize,
        onResizeStart: mockOnResizeStart,
        onResizeStop: mockOnResizeStop,
        cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
        cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
      }),
    );

    expect(typeof result.current.handleResizeStart).toBe('function');
    expect(typeof result.current.handleResize).toBe('function');
    expect(typeof result.current.handleResizeStop).toBe('function');
  });

  it('should handle resize start', () => {
    const { result } = renderHook(() =>
      useCardResize({
        cardKey: 'card-1',
        groupKey: 'group-1',
        dimensions: mockDimensions,
        layout: mockLayout,
        onResize: mockOnResize,
        onResizeStart: mockOnResizeStart,
        onResizeStop: mockOnResizeStop,
        cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
        cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
      }),
    );

    const stopPropagationMock = jest.fn();
    const mockEvent = {
      stopPropagation: stopPropagationMock,
    } as unknown as React.MouseEvent;

    const mockData: ResizeCallbackData = {
      size: { width: 220, height: 220 },
    };

    act(() => {
      result.current.handleResizeStart(mockEvent, mockData);
    });

    expect(result.current.isResizing).toBe(true);
    expect(result.current.resizeDimensions).toEqual({ width: 220, height: 220 });
    expect(mockOnResizeStart).toHaveBeenCalledWith('card-1', 'group-1', mockDimensions);
    expect(mockCancelAllKeyboardDrags).toHaveBeenCalled();
    expect(mockCancelAllKeyboardResizes).toHaveBeenCalled();
    expect(stopPropagationMock).toHaveBeenCalled();
  });

  it('should handle resize', () => {
    const { result } = renderHook(() =>
      useCardResize({
        cardKey: 'card-1',
        groupKey: 'group-1',
        dimensions: mockDimensions,
        layout: mockLayout,
        onResize: mockOnResize,
        onResizeStart: mockOnResizeStart,
        onResizeStop: mockOnResizeStop,
        cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
        cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
      }),
    );

    const stopPropagationMock = jest.fn();
    const mockEvent = {
      stopPropagation: stopPropagationMock,
    } as unknown as React.MouseEvent;

    const mockData: ResizeCallbackData = {
      size: { width: 330, height: 220 },
    };

    act(() => {
      result.current.handleResize(mockEvent, mockData);
    });

    expect(result.current.resizeDimensions).toEqual({ width: 330, height: 220 });
    expect(mockOnResize).toHaveBeenCalledWith('card-1', 'group-1', expect.any(Object));
    expect(stopPropagationMock).toHaveBeenCalled();
  });

  it('should handle resize stop', () => {
    const { result } = renderHook(() =>
      useCardResize({
        cardKey: 'card-1',
        groupKey: 'group-1',
        dimensions: mockDimensions,
        layout: mockLayout,
        onResize: mockOnResize,
        onResizeStart: mockOnResizeStart,
        onResizeStop: mockOnResizeStop,
        cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
        cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
      }),
    );

    const stopPropagationMock = jest.fn();
    const mockEvent = {
      stopPropagation: stopPropagationMock,
    } as unknown as React.MouseEvent;

    const mockData: ResizeCallbackData = {
      size: { width: 330, height: 220 },
    };

    // Start resize first
    act(() => {
      result.current.handleResizeStart(mockEvent, mockData);
    });

    expect(result.current.isResizing).toBe(true);

    // Stop resize
    act(() => {
      result.current.handleResizeStop(mockEvent, mockData);
    });

    expect(result.current.isResizing).toBe(false);
    expect(result.current.resizeDimensions).toBeNull();
    expect(result.current.resizeGridDimensions).toBeNull();
    expect(mockOnResizeStop).toHaveBeenCalledWith('card-1', 'group-1', expect.any(Object));
    expect(stopPropagationMock).toHaveBeenCalled();
  });

  it('should handle complete resize sequence', () => {
    const { result } = renderHook(() =>
      useCardResize({
        cardKey: 'card-1',
        groupKey: 'group-1',
        dimensions: mockDimensions,
        layout: mockLayout,
        onResize: mockOnResize,
        onResizeStart: mockOnResizeStart,
        onResizeStop: mockOnResizeStop,
        cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
        cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
      }),
    );

    const mockEvent = {
      stopPropagation: jest.fn(),
    } as unknown as React.MouseEvent;

    // Start
    act(() => {
      result.current.handleResizeStart(mockEvent, { size: { width: 220, height: 220 } });
    });

    expect(result.current.isResizing).toBe(true);

    // Resize
    act(() => {
      result.current.handleResize(mockEvent, { size: { width: 250, height: 240 } });
    });

    expect(result.current.resizeDimensions).toEqual({ width: 250, height: 240 });

    // Resize again
    act(() => {
      result.current.handleResize(mockEvent, { size: { width: 280, height: 260 } });
    });

    expect(result.current.resizeDimensions).toEqual({ width: 280, height: 260 });

    // Stop
    act(() => {
      result.current.handleResizeStop(mockEvent, { size: { width: 280, height: 260 } });
    });

    expect(result.current.isResizing).toBe(false);
    expect(result.current.resizeDimensions).toBeNull();
  });

  it('should work with different card and group keys', () => {
    const { result } = renderHook(() =>
      useCardResize({
        cardKey: 'custom-card',
        groupKey: 'custom-group',
        dimensions: mockDimensions,
        layout: mockLayout,
        onResize: mockOnResize,
        onResizeStart: mockOnResizeStart,
        onResizeStop: mockOnResizeStop,
        cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
        cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
      }),
    );

    const mockEvent = {
      stopPropagation: jest.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleResizeStart(mockEvent, { size: { width: 220, height: 220 } });
    });

    expect(mockOnResizeStart).toHaveBeenCalledWith('custom-card', 'custom-group', mockDimensions);
  });

  it('should work with different dimensions', () => {
    const customDimensions: Dimensions = {
      width: 4,
      height: 3,
    };

    const { result } = renderHook(() =>
      useCardResize({
        cardKey: 'card-1',
        groupKey: 'group-1',
        dimensions: customDimensions,
        layout: mockLayout,
        onResize: mockOnResize,
        onResizeStart: mockOnResizeStart,
        onResizeStop: mockOnResizeStop,
        cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
        cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
      }),
    );

    const mockEvent = {
      stopPropagation: jest.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleResizeStart(mockEvent, { size: { width: 440, height: 320 } });
    });

    expect(mockOnResizeStart).toHaveBeenCalledWith('card-1', 'group-1', customDimensions);
  });

  it('should work with different layout configurations', () => {
    const customLayout: LayoutConfig = {
      col: 6,
      rowHeight: 50,
      containerWidth: 600,
      containerHeight: 400,
      calWidth: 100,
      margin: [5, 5],
      containerPadding: [5, 5],
    };

    const { result } = renderHook(() =>
      useCardResize({
        cardKey: 'card-1',
        groupKey: 'group-1',
        dimensions: mockDimensions,
        layout: customLayout,
        onResize: mockOnResize,
        onResizeStart: mockOnResizeStart,
        onResizeStop: mockOnResizeStop,
        cancelAllKeyboardDrags: mockCancelAllKeyboardDrags,
        cancelAllKeyboardResizes: mockCancelAllKeyboardResizes,
      }),
    );

    const mockEvent = {
      stopPropagation: jest.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleResizeStart(mockEvent, { size: { width: 210, height: 110 } });
    });

    expect(result.current.isResizing).toBe(true);
  });
});
