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

import { differenceInDays, format, subMonths } from 'date-fns';
import { HistoryRange } from '../data/widgets/line-chart';

export interface HistoricalTrendValues {
  current: string | null;
  past: string | null;
}

/** Milliseconds in one calendar day (24h), used for dashboard trend comparison windows. */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Rolling window for “vs last 30 days” trend badges and history cut-offs. */
export const THIRTY_DAYS_MS = 30 * MS_PER_DAY;

/** Stay inside the organizations history API one-year window (clock skew / end-of-day safety). */
const ORGANIZATIONS_HISTORY_RETENTION_BUFFER_DAYS = 1;

export const FORMAT_MONTH_DAY: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
export const FORMAT_MONTH_YEAR: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
export const FORMAT_FULL: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};
export const FORMAT_DAY_TIME: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
};

/**
 * Determines the appropriate date format based on the tick values.
 * Checks for duplicate tick labels at each granularity level to pick the most
 * compact format that still produces unique labels.
 */
export function getDateFormatOptions(ticks: Date[]): Intl.DateTimeFormatOptions {
  const firstDate = ticks.at(0);
  const lastDate = ticks.at(-1);

  // Not enough ticks to determine range - use full format
  if (firstDate === undefined || lastDate === undefined) {
    return FORMAT_FULL;
  }

  // Check for duplicate days among ticks — need time to distinguish them
  const daySet = new Set(ticks.map((tick) => format(tick, 'yyyy-MM-dd')));
  if (daySet.size < ticks.length) {
    return FORMAT_DAY_TIME;
  }

  // Check for duplicate month-year combinations — need day to distinguish them
  const monthYearSet = new Set(ticks.map((tick) => format(tick, 'yyyy-MM')));
  if (monthYearSet.size < ticks.length) {
    return FORMAT_MONTH_DAY;
  }

  const rangeInDays = differenceInDays(lastDate, firstDate);

  // For short ranges (less than 60 days), include day for better readability
  if (rangeInDays < 60) {
    return FORMAT_MONTH_DAY;
  }

  // For longer ranges (60+ days), show month and year
  return FORMAT_MONTH_YEAR;
}

export function formatDateFull(date: Date): string {
  return date.toLocaleString(undefined, FORMAT_FULL);
}

export function formatDateDayTime(date: Date): string {
  return date.toLocaleString(undefined, FORMAT_DAY_TIME);
}

// --- Generalized UTC Date Math ---

/** Returns UTC midnight for a given date. */
export function startOfUTCDay(date: Date | number): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Subtracts UTC months from a date, clamping the day to the last valid day of the target month. */
export function subUTCMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  let targetMonth = date.getUTCMonth() - months;
  let targetYear = year;

  while (targetMonth < 0) {
    targetMonth += 12;
    targetYear -= 1;
  }
  while (targetMonth > 11) {
    targetMonth -= 12;
    targetYear += 1;
  }

  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(date.getUTCDate(), lastDayOfTargetMonth);

  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      targetDay,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
}

/** Subtracts UTC years from a date. */
export function subUTCYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d;
}

/** Adds UTC days to a date. */
export function addUTCDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// --- Domain Specific Date Logic ---

/** Organizations history APIs reject `startDate` more than one UTC calendar year in the past. */
export function organizationsHistoryEarliestAllowedStartDate(from: Date = new Date()): string {
  return startOfUTCDay(subUTCYears(from, 1)).toISOString();
}

/**
 * Earliest safe `startDate` for max-retention (1 year / all time) requests.
 * One day inside the API window avoids rejections like SONARCLOUD-ZJ3.
 */
export function organizationsHistoryStartDateWithRetentionBuffer(from: Date = new Date()): string {
  const earliest = subUTCYears(from, 1);
  const buffered = addUTCDays(earliest, ORGANIZATIONS_HISTORY_RETENTION_BUFFER_DAYS);
  return startOfUTCDay(buffered).toISOString();
}

/** Clamps an ISO `startDate` to the organizations API lookback window, using the
 *  retention buffer (one day inside the one-year boundary) since the exact boundary is rejected. */
export function clampOrganizationsHistoryStartDate(
  startDate: string,
  from: Date = new Date(),
): string {
  const bufferedStartMs = Date.parse(organizationsHistoryStartDateWithRetentionBuffer(from));
  const requestedMs = Date.parse(startDate);

  if (
    Number.isNaN(bufferedStartMs) ||
    Number.isNaN(requestedMs) ||
    requestedMs >= bufferedStartMs
  ) {
    return startDate;
  }

  return new Date(bufferedStartMs).toISOString();
}

export function historyRangeToMonths(historyRange: HistoryRange): number {
  return Number(historyRange === HistoryRange.All ? HistoryRange.Last12Months : historyRange);
}

export interface DashboardHistoryDateRange {
  startDate: string;
}

/**
 * The feature conversion boundary from dashboard history duration to API dates.
 *
 * Zero or omitted months means "latest snapshot". Because an entity may not have an analysis
 * today, snapshot queries request the retained window and consumers select its latest point.
 * Positive values use UTC calendar-month subtraction and are clamped to API retention.
 *
 * The Server adapter mirrors this in `sq-server-commons/helpers/dashboard-widget-data.ts` because
 * it cannot import from the feature that consumes the adapter. Keep both implementations and their
 * tests aligned.
 */
export function dashboardHistoryDateRange(
  months = 0,
  from: Date = new Date(),
): DashboardHistoryDateRange {
  if (!Number.isInteger(months) || months < 0) {
    throw new RangeError(
      `Dashboard history duration must be a non-negative integer; got ${months}`,
    );
  }

  if (months === 0) {
    return {
      startDate: organizationsHistoryStartDateWithRetentionBuffer(from),
    };
  }

  const requestedStart = startOfUTCDay(subUTCMonths(from, months)).toISOString();
  return {
    startDate: clampOrganizationsHistoryStartDate(requestedStart, from),
  };
}

/**
 * Whether a calendar date falls inside the rolling window implied by {@link HistoryRange}
 * for legacy project measures-history charts (numeric enum string = months to look back from
 * “today”, local calendar). {@link HistoryRange.All} represents the last 12 months.
 */
export function isDateInLineChartRange(pointDate: Date, historyRange: HistoryRange): boolean {
  const maxDate = new Date();
  const months = historyRangeToMonths(historyRange);
  const rangeStartDate = subMonths(maxDate, months);
  return pointDate >= rangeStartDate && pointDate <= maxDate;
}

/** Generalized function to get an ISO UTC midnight string N months in the past. */
export function historySinceIsoDate(monthsBack: number, from: Date = new Date()): string {
  return dashboardHistoryDateRange(Math.max(monthsBack, 1), from).startDate;
}

/** ISO UTC midnight for organizations API `startDate`; clamps ranges ≥ 12 months to retention. */
export function lineChartSinceDate(historyRange: HistoryRange, from: Date = new Date()): string {
  return dashboardHistoryDateRange(historyRangeToMonths(historyRange), from).startDate;
}

/** ISO UTC midnight 30 days ago, used as API `startDate` for portfolio issue trend history. */
export function issueHistoryTrendStartDate(): string {
  return startOfUTCDay(Date.now() - THIRTY_DAYS_MS).toISOString();
}

/**
 * Extracts latest value and a comparison point roughly 30 days in the past.
 * Uses the last history point strictly before `now − 30d` as the comparison baseline.
 */
export function getThirtyDayTrendValues<T>(
  points: readonly T[],
  getTimestamp: (point: T) => number,
  getValue: (point: T) => string | null,
): HistoricalTrendValues {
  const window = getThirtyDayTrendWindow(points, getTimestamp);
  if (window.length === 0) {
    return { current: null, past: null };
  }
  const last = window.at(-1);
  return {
    current: last === undefined ? null : getValue(last),
    past: getValue(window[0]),
  };
}

/**
 * Returns the subset of points starting from the comparison baseline
 * (the last point strictly before `now − 30d`).
 */
// --- MTTR Duration Formatting ---

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const DAYS_PER_MONTH = 30.44;
const DAYS_PER_YEAR = 365;

export interface MttrFormatOptions {
  compact?: boolean;
}

type MttrUnit = 'days' | 'hours' | 'months' | 'years';

function getMttrMessageId(value: number, unit: MttrUnit, compact: boolean): string {
  const unitKey = value === 1 ? unit.slice(0, -1) : unit;
  return compact ? `mttr.short.x_${unit}` : `mttr.x_${unitKey}`;
}

/**
 * Returns the i18n message id and values for an MTTR value (in calendar minutes, 24h/day).
 * Do NOT use `formatDuration` — that utility uses 8h/day work-effort hours.
 *
 * Pass the result directly to `formatMessage`: `formatMessage({ id }, values)`.
 */
export function getMttrCalendarMessage(
  minutes: number,
  options: MttrFormatOptions = {},
): { id: string; values: { value: number } } {
  const { compact = false } = options;

  if (minutes < MINUTES_PER_HOUR) {
    return { id: 'mttr.x_minutes', values: { value: Math.round(minutes) } };
  }

  if (minutes < MINUTES_PER_DAY) {
    const hours = Number.parseFloat((minutes / MINUTES_PER_HOUR).toFixed(1));
    if (hours < 24) {
      return { id: getMttrMessageId(hours, 'hours', compact), values: { value: hours } };
    }
  }

  const days = minutes / MINUTES_PER_DAY;

  if (days < DAYS_PER_MONTH) {
    const roundedDays = Number.parseFloat(days.toFixed(1));
    return { id: getMttrMessageId(roundedDays, 'days', compact), values: { value: roundedDays } };
  }

  if (days < DAYS_PER_YEAR) {
    const months = Number.parseFloat((days / DAYS_PER_MONTH).toFixed(1));
    if (months < 12) {
      return { id: getMttrMessageId(months, 'months', compact), values: { value: months } };
    }
  }

  const years = Number.parseFloat((days / DAYS_PER_YEAR).toFixed(1));
  return { id: getMttrMessageId(years, 'years', compact), values: { value: years } };
}

export function getThirtyDayTrendWindow<T>(
  points: readonly T[],
  getTimestamp: (point: T) => number,
): T[] {
  const sorted = [...points]
    .filter((p) => !Number.isNaN(getTimestamp(p)))
    .sort((a, b) => getTimestamp(a) - getTimestamp(b));

  const threshold = Date.now() - THIRTY_DAYS_MS;
  let startIndex = 0;

  for (let i = 0; i < sorted.length; i += 1) {
    if (getTimestamp(sorted[i]) < threshold) {
      startIndex = i;
    }
  }

  return sorted.slice(startIndex);
}
