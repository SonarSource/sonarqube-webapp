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

import { ScaleTime } from 'd3-scale';
import { sortBy } from 'lodash';
import * as React from 'react';

export type ZoomXScale = ScaleTime<number, number>;

export interface ZoomOverlayState {
  newZoomStart?: number;
  overlayLeftPos?: number;
}

export function makeOverlayPointerDown(
  xDim: number[],
  dragState: React.MutableRefObject<ZoomOverlayState>,
) {
  return (e: React.PointerEvent<SVGRectElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const overlayLeftPos = e.currentTarget.getBoundingClientRect().left;
    const newZoomStart = Math.round(
      Math.max(xDim[0], Math.min(e.clientX - overlayLeftPos, xDim[1])),
    );
    dragState.current = { overlayLeftPos, newZoomStart };
  };
}

export function makeOverlayPointerMove(
  xScale: ZoomXScale,
  xDim: number[],
  dragState: React.MutableRefObject<ZoomOverlayState>,
  handleZoomUpdate: (xScale: ZoomXScale, xArray: number[]) => void,
) {
  return (e: React.PointerEvent<SVGRectElement>) => {
    const { newZoomStart, overlayLeftPos } = dragState.current;
    if (newZoomStart == null || overlayLeftPos == null) {
      return;
    }
    const x = Math.max(xDim[0], Math.min(e.clientX - overlayLeftPos, xDim[1]));
    handleZoomUpdate(xScale, sortBy([newZoomStart, x]));
  };
}

export function makeOverlayPointerUp(
  xScale: ZoomXScale,
  xDim: number[],
  dragState: React.MutableRefObject<ZoomOverlayState>,
  handleZoomUpdate: (xScale: ZoomXScale, xArray: number[]) => void,
) {
  return (e: React.PointerEvent<SVGRectElement>) => {
    const { newZoomStart, overlayLeftPos } = dragState.current;
    if (newZoomStart === undefined || overlayLeftPos === undefined) {
      return;
    }
    const x = Math.round(Math.max(xDim[0], Math.min(e.clientX - overlayLeftPos, xDim[1])));
    handleZoomUpdate(xScale, newZoomStart === x ? xDim : sortBy([newZoomStart, x]));
    dragState.current = { newZoomStart: undefined, overlayLeftPos: undefined };
  };
}

function makeDragPointerDown<T extends SVGElement>(
  onMove: (delta: number) => void,
): (e: React.PointerEvent<T>) => void {
  return (e: React.PointerEvent<T>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const originClientX = e.clientX;

    const handleMove = (moveEvent: PointerEvent) => {
      onMove(moveEvent.clientX - originClientX);
    };

    const handleUp = (upEvent: PointerEvent) => {
      onMove(upEvent.clientX - originClientX);
      globalThis.removeEventListener('pointermove', handleMove);
      globalThis.removeEventListener('pointerup', handleUp);
    };

    globalThis.addEventListener('pointermove', handleMove);
    globalThis.addEventListener('pointerup', handleUp);
  };
}

export function makeSelectionPointerDown(
  xScale: ZoomXScale,
  startX: number,
  width: number,
  xDim: number[],
  handleZoomUpdate: (xScale: ZoomXScale, xArray: number[]) => void,
) {
  return makeDragPointerDown<SVGRectElement>((delta) => {
    const x = Math.max(xDim[0], Math.min(startX + delta, xDim[1] - width));
    handleZoomUpdate(xScale, [x, width + x]);
  });
}

export function makeZoomHandlePointerDown(
  xScale: ZoomXScale,
  handleX: number,
  fixedPos: number,
  xDim: number[],
  handleDirection: string,
  handleZoomUpdate: (xScale: ZoomXScale, xArray: number[]) => void,
) {
  return makeDragPointerDown<SVGGElement>((delta) => {
    const x = Math.max(xDim[0], Math.min(handleX + delta, xDim[1]));
    handleZoomUpdate(xScale, handleDirection === 'right' ? [fixedPos, x] : [x, fixedPos]);
  });
}
