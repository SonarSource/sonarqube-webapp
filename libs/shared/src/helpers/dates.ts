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

const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

// Shared display format for a bare calendar date (e.g. a snooze/deferral date), so every call
// site formats it identically instead of repeating the same options object.
export const CALENDAR_DATE_DISPLAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

// Fields like deferralDate only carry calendar-date meaning, but the backend may serialize them
// either as a bare 'YYYY-MM-DD' or as a full timestamp (e.g. with a 'Z' suffix). Parsing either
// form with `new Date(...)` treats it as an instant and converts it to the viewer's timezone,
// which can shift the displayed day by one for viewers behind UTC. We only ever want the calendar
// date that was intended, so we extract it directly and build a local date from it.
export function parseCalendarDate(value: string): Date | undefined {
  const match = CALENDAR_DATE_PATTERN.exec(value);

  if (!match) {
    return undefined;
  }

  const [, year, month, day] = match;

  return new Date(Number(year), Number(month) - 1, Number(day));
}
