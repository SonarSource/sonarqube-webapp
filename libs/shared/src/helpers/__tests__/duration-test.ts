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

import { formatDuration, formatDurationShort, getDurationParts } from '../duration';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 12 * ONE_MONTH;

describe('getDurationParts', () => {
  it('splits milliseconds into units', () => {
    expect(getDurationParts(ONE_YEAR * 2 + ONE_MONTH + ONE_DAY * 3 + 1501)).toEqual({
      years: 2,
      months: 1,
      days: 3,
      hours: 0,
      minutes: 0,
      seconds: 1,
      milliseconds: 501,
    });
  });

  it('clamps negative values to zero', () => {
    expect(getDurationParts(-5000).seconds).toBe(0);
  });
});

describe('formatDuration', () => {
  it.each([
    [ONE_YEAR * 4 + ONE_MONTH * 2 + ONE_DAY * 10, '4 years 2 months'],
    [ONE_YEAR * 4 + ONE_DAY * 10, '4 years'],
    [ONE_HOUR * 4 + ONE_MINUTE * 10, '4 hours 10 minutes'],
    [ONE_DAY * 4 + ONE_MINUTE * 10, '4 days'],
    [ONE_MINUTE, '1 minute'],
    [ONE_SECOND, 'less than a minute'],
  ])('formats %s ms as %s', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});

describe('formatDurationShort', () => {
  it.each([
    [173, '173ms'],
    [999, '999ms'],
    [1000, '1s'],
    [1001, '1.001s'],
    [1050, '1.05s'],
    [1501, '1.501s'],
    [9999, '9.999s'],
    [59_000, '59s'],
    [60_000, '1min 0s'],
    [62_757, '1min 2s'],
    [224_567, '3min 44s'],
    [21 * ONE_MINUTE, '21min'],
    [80 * ONE_MINUTE, '1h 20min'],
    [50 * ONE_HOUR, '50h 0min'],
    [0, ''],
    [undefined, ''],
  ])('formats %s ms as %s', (ms, expected) => {
    expect(formatDurationShort(ms)).toBe(expected);
  });
});
