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

import { max, min } from 'd3-array';
import { scaleLinear, scaleTime, type ScaleLinear, type ScaleTime } from 'd3-scale';
import { useEffect, useState, type RefObject } from 'react';
import type { LineChartDataPoint, LineChartSeries } from '../../types/visualization';

export interface ChartDimensions {
  height: number;
  width: number;
}

export const SINGLE_DATAPOINT_RADIUS_PX = 3;
export const SINGLE_DATAPOINT_OUTLINE_WIDTH_PX = 2;

export function hasSingleDatapoint(data: LineChartDataPoint[]): boolean {
  const point = data[0];
  return data.length === 1 && point?.y != null && !Number.isNaN(point.y);
}

export function seriesHasValidData(series: LineChartSeries[]): boolean {
  return series.some((entry) =>
    entry.data.some((point) => point.y != null && !Number.isNaN(point.y)),
  );
}

/**
 * Returns the index of the data point whose `x` is numerically closest to `xScaleValue`.
 * Returns 0 for empty input — callers gate on `data.length` before using the result.
 */
export function getNearestIndex(data: LineChartDataPoint[], xScaleValue: number): number {
  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < data.length; i++) {
    const pointX = Number(data[i].x);
    const distance = Math.abs(pointX - xScaleValue);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = i;
    }
  }

  return nearest;
}

/**
 * Observes `containerRef`'s element size and returns its current `offsetWidth`/`offsetHeight`.
 * Uses `ResizeObserver` when available and falls back to a `window` `resize` listener otherwise.
 * No-op while `isPending` is true so charts don't measure into a still-loading container.
 */
export function useChartDimensions(
  containerRef: RefObject<HTMLElement | null>,
  isPending: boolean,
): ChartDimensions {
  const [dimensions, setDimensions] = useState<ChartDimensions>({ height: 0, width: 0 });

  useEffect(() => {
    if (isPending) {
      return () => undefined;
    }

    const updateDimensions = () => {
      if (!containerRef.current) {
        return;
      }

      setDimensions({
        height: containerRef.current.offsetHeight,
        width: containerRef.current.offsetWidth,
      });
    };

    const observedContainer = containerRef.current;
    const resizeObserver =
      observedContainer && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            updateDimensions();
          })
        : undefined;
    const shouldUseWindowResizeFallback = !resizeObserver;

    if (resizeObserver && observedContainer) {
      resizeObserver.observe(observedContainer);
    }

    updateDimensions();
    if (shouldUseWindowResizeFallback) {
      window.addEventListener('resize', updateDimensions);
    }
    return () => {
      resizeObserver?.disconnect();
      if (shouldUseWindowResizeFallback) {
        window.removeEventListener('resize', updateDimensions);
      }
    };
  }, [containerRef, isPending]);

  return dimensions;
}

/** Builds a d3 time scale spanning the min/max of `dates`, mapped onto `[0, availableWidth]`. */
export function createTimeXScale(dates: Date[], availableWidth: number): ScaleTime<number, number> {
  const xMin = min(dates);
  const xMax = max(dates);
  return scaleTime()
    .domain([xMin as Date, xMax as Date])
    .range([0, availableWidth]);
}

/**
 * Builds a d3 linear y scale.
 * Rating metrics use a fixed `[1, 5]` domain mapped top-down (low rating = small y).
 * Other metrics use `[0, max]`, `.nice()`, mapped bottom-up.
 */
export function createLinearYScale(
  values: number[],
  availableHeight: number,
  isMetricRating: boolean,
): ScaleLinear<number, number> {
  if (isMetricRating) {
    return scaleLinear().domain([1, 5]).range([0, availableHeight]);
  }
  const yMax = max(values) ?? 0;
  return scaleLinear().domain([0, yMax]).nice().range([availableHeight, 0]);
}
