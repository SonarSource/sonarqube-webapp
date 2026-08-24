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

import { parseCalendarDate } from '../dates';

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
