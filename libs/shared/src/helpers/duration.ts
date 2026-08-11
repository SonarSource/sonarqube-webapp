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

import { Duration, formatDuration as formatDateFnsDuration } from 'date-fns';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 12 * ONE_MONTH;

/** Largest first. Months are 30 days, years are 12 such months. */
const UNITS = [
  ['years', ONE_YEAR],
  ['months', ONE_MONTH],
  ['days', ONE_DAY],
  ['hours', ONE_HOUR],
  ['minutes', ONE_MINUTE],
  ['seconds', ONE_SECOND],
] as const;

const MAX_LONG_FORMAT_UNITS = 2;

export interface DurationParts extends Required<Omit<Duration, 'weeks'>> {
  milliseconds: number;
}

export function getDurationParts(ms: number): DurationParts {
  let remainder = Math.max(0, Math.floor(ms));

  const parts = {} as DurationParts;
  for (const [unit, unitMs] of UNITS) {
    parts[unit] = Math.floor(remainder / unitMs);
    remainder -= parts[unit] * unitMs;
  }

  return { ...parts, milliseconds: remainder };
}

/** "less than a minute", or the two largest consecutive non-zero units: "4 years 2 months". */
export function formatDuration(ms: number): string {
  if (ms < ONE_MINUTE) {
    return 'less than a minute';
  }

  const parts = getDurationParts(ms);

  const format: (keyof Duration)[] = [];
  let lastIndex = -1;

  // skip the last unit (seconds), and stop at the first gap between non-zero units
  for (let i = 0; i < UNITS.length - 1 && format.length < MAX_LONG_FORMAT_UNITS; i++) {
    const [unit] = UNITS[i];
    if (parts[unit] > 0) {
      if (lastIndex >= 0 && lastIndex + 1 !== i) {
        break;
      }
      lastIndex = i;
      format.push(unit);
    }
  }

  return formatDateFnsDuration(parts, { format });
}

/** Compact form with sub-minute precision: "173ms", "1.05s", "59s", "1min 2s", "1h 20min". */
export function formatDurationShort(ms: number | undefined): string {
  if (!ms) {
    return '';
  }

  const parts = getDurationParts(ms);

  if (ms < ONE_SECOND) {
    return `${parts.milliseconds}ms`;
  }
  if (ms < 10 * ONE_SECOND) {
    // exact value, unpadded and unrounded: 1050ms -> "1.05s", 1001ms -> "1.001s"
    return `${ms / ONE_SECOND}s`;
  }
  if (ms < ONE_MINUTE) {
    return `${parts.seconds}s`;
  }
  if (ms < 10 * ONE_MINUTE) {
    return `${parts.minutes}min ${parts.seconds}s`;
  }

  const hours = ((parts.years * 12 + parts.months) * 30 + parts.days) * 24 + parts.hours;
  return hours === 0 ? `${parts.minutes}min` : `${hours}h ${parts.minutes}min`;
}
