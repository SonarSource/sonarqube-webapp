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

import { useState } from 'react';
import type { Dimensions, LayoutConfig } from '../../types';
import { calcWH } from '../../utils';
import type { ResizeCallbackData } from './ResizableBox';

interface UseCardResizeProps {
  // Cancel ALL active keyboard operations when mouse resize starts
  cancelAllKeyboardDrags: () => void;
  cancelAllKeyboardResizes: () => void;
  cardKey: string;
  dimensions: Dimensions;
  groupKey: string;
  layout: LayoutConfig;
  onResize: (cardKey: string, groupKey: string, size: Dimensions) => void;
  onResizeStart: (cardKey: string, groupKey: string, size: Dimensions) => void;
  onResizeStop: (cardKey: string, groupKey: string, size: Dimensions) => void;
}

export function useCardResize({
  cancelAllKeyboardDrags,
  cancelAllKeyboardResizes,
  cardKey,
  dimensions,
  groupKey,
  layout,
  onResize,
  onResizeStart,
  onResizeStop,
}: UseCardResizeProps) {
  const { calWidth, margin, rowHeight } = layout;

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDimensions, setResizeDimensions] = useState<{
    height: number;
    width: number;
  } | null>(null);
  const [resizeGridDimensions, setResizeGridDimensions] = useState<{
    h: number;
    w: number;
  } | null>(null);

  const handleResizeStart = (e: React.MouseEvent, data: ResizeCallbackData) => {
    e.stopPropagation();
    // Cancel ALL active keyboard operations (from any card) before starting mouse resize
    cancelAllKeyboardDrags();
    cancelAllKeyboardResizes();
    setIsResizing(true);
    setResizeDimensions({ height: data.size.height, width: data.size.width });
    const { h, w } = calcWH(data.size.width, data.size.height, calWidth, rowHeight, margin);
    setResizeGridDimensions({ h, w });
    onResizeStart(cardKey, groupKey, dimensions);
  };

  const handleResize = (e: React.MouseEvent, data: ResizeCallbackData) => {
    e.stopPropagation();
    // Update local state with pixel dimensions for immediate visual feedback
    setResizeDimensions({ height: data.size.height, width: data.size.width });

    // Convert pixel size to grid units
    const { h, w } = calcWH(data.size.width, data.size.height, calWidth, rowHeight, margin);
    setResizeGridDimensions({ h, w });

    onResize(cardKey, groupKey, { height: h, width: w });
  };

  const handleResizeStop = (e: React.MouseEvent, data: ResizeCallbackData) => {
    e.stopPropagation();
    setIsResizing(false);
    setResizeDimensions(null); // Clear local resize state
    setResizeGridDimensions(null); // Clear grid dimensions

    // Convert pixel size to grid units
    const { h, w } = calcWH(data.size.width, data.size.height, calWidth, rowHeight, margin);
    onResizeStop(cardKey, groupKey, { height: h, width: w });
  };

  return {
    handleResize,
    handleResizeStart,
    handleResizeStop,
    isResizing,
    resizeDimensions,
    resizeGridDimensions,
  };
}
