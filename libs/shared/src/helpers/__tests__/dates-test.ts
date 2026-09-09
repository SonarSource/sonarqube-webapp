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

import { getUtcDateRangeEndingToday, parseCalendarDate } from '../dates';

describe('parseCalendarDate', () => {
  it('parses a date-only value as a local date rather than UTC', () => {
    const date = parseCalendarDate('2026-08-28');

    expect(date).toBeDefined();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(7);
    expect(date?.getDate()).toBe(28);
    expect(date?.getHours()).toBe(0);
  });

  it('extracts the same calendar date from a full ISO timestamp, ignoring its time/offset', () => {
    const date = parseCalendarDate('2026-08-28T23:59:59.000Z');

    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(7);
    expect(date?.getDate()).toBe(28);
  });

  it('returns undefined for values with no recognizable calendar date', () => {
    expect(parseCalendarDate('')).toBeUndefined();
    expect(parseCalendarDate('not-a-date')).toBeUndefined();
  });
});

describe('getUtcDateRangeEndingToday', () => {
  const now = new Date('2026-08-31T15:45:30.123Z');

  it.each([
    [7, '2026-08-25'],
    [30, '2026-08-02'],
    [90, '2026-06-03'],
    [365, '2025-09-01'],
  ])('maps %s days to an inclusive range starting %s', (days, expectedFrom) => {
    expect(getUtcDateRangeEndingToday(days, now)).toEqual({ from: expectedFrom, to: '2026-08-31' });
  });

  it('produces an inclusive range spanning exactly the requested number of calendar days', () => {
    const { from, to } = getUtcDateRangeEndingToday(7, now);
    const spanDays =
      (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) /
        (24 * 60 * 60 * 1000) +
      1;

    expect(spanDays).toBe(7);
  });

  it('is unaffected by the time-of-day component of `now`', () => {
    const midnight = new Date('2026-08-31T00:00:00.000Z');
    const lateNight = new Date('2026-08-31T23:59:59.999Z');

    expect(getUtcDateRangeEndingToday(30, midnight)).toEqual(
      getUtcDateRangeEndingToday(30, lateNight),
    );
  });

  it('crosses a year boundary correctly', () => {
    const newYearsDay = new Date('2026-01-01T12:00:00Z');

    expect(getUtcDateRangeEndingToday(7, newYearsDay)).toEqual({
      from: '2025-12-26',
      to: '2026-01-01',
    });
  });
});
