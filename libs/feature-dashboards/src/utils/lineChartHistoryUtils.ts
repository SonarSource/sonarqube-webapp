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

import type { LineChartSeries } from '../types/visualization';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const LIMITED_HISTORY_TOLERANCE_DAYS = 7;

/**
 * Returns the first valid date represented by a chart when its returned history starts
 * meaningfully later than requested. A short tolerance accounts for sparse analysis schedules.
 */
export function getLimitedHistoryStartDate(
  series: LineChartSeries[],
  requestedStartDate: Date,
): Date | undefined {
  const requestedStart = requestedStartDate.getTime();
  if (!Number.isFinite(requestedStart)) {
    return undefined;
  }

  let earliestTimestamp = Number.POSITIVE_INFINITY;
  for (const entry of series) {
    for (const point of entry.data) {
      const timestamp = Number(point.x);
      if (Number.isFinite(timestamp) && Number.isFinite(point.y)) {
        earliestTimestamp = Math.min(earliestTimestamp, timestamp);
      }
    }
  }

  if (!Number.isFinite(earliestTimestamp)) {
    return undefined;
  }

  const requestedStartDay = Math.floor(requestedStart / MILLISECONDS_PER_DAY);
  const earliestHistoryDay = Math.floor(earliestTimestamp / MILLISECONDS_PER_DAY);
  return earliestHistoryDay - requestedStartDay > LIMITED_HISTORY_TOLERANCE_DAYS
    ? new Date(earliestTimestamp)
    : undefined;
}

/**
 * Parses API measure values for rating metrics (letter grades or numeric 1–5 scale)
 * into a numeric Y value for line charts.
 */
export function parseLineChartRatingValue(value: string | number): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 1) {
    const upper = trimmed.toUpperCase();
    if (upper >= 'A' && upper <= 'E') {
      const upperCodePoint = upper.codePointAt(0);
      const baseCodePoint = 'A'.codePointAt(0);
      if (upperCodePoint === undefined || baseCodePoint === undefined) {
        return undefined;
      }
      return upperCodePoint - baseCodePoint + 1;
    }
  }

  const numeric = Number.parseFloat(trimmed);
  return Number.isFinite(numeric) ? numeric : undefined;
}
