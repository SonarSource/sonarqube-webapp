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

import { getLimitedHistoryStartDate, parseLineChartRatingValue } from '../lineChartHistoryUtils';

describe('lineChartHistoryUtils', () => {
  describe('getLimitedHistoryStartDate', () => {
    const requestedStart = new Date('2026-01-01T00:00:00.000Z');

    it('returns the earliest valid point when history starts over seven days late', () => {
      expect(
        getLimitedHistoryStartDate(
          [
            {
              color: '#000',
              data: [{ x: new Date('2026-02-01T00:00:00.000Z'), y: 2 }],
              id: 'later',
              label: 'Later',
            },
            {
              color: '#111',
              data: [
                { x: new Date('2026-01-20T00:00:00.000Z'), y: 1 },
                { x: new Date('invalid'), y: 3 },
                { x: new Date('2026-01-10T00:00:00.000Z'), y: Number.NaN },
              ],
              id: 'earlier',
              label: 'Earlier',
            },
          ],
          requestedStart,
        ),
      ).toEqual(new Date('2026-01-20T00:00:00.000Z'));
    });

    it('does not report small gaps, empty history, or invalid requested dates', () => {
      const withinTolerance = [
        {
          color: '#000',
          data: [{ x: new Date('2026-01-08T23:59:59.999Z'), y: 2 }],
          id: 'series',
          label: 'Series',
        },
      ];

      expect(getLimitedHistoryStartDate(withinTolerance, requestedStart)).toBeUndefined();
      expect(getLimitedHistoryStartDate([], requestedStart)).toBeUndefined();
      expect(getLimitedHistoryStartDate(withinTolerance, new Date('invalid'))).toBeUndefined();
    });
  });

  describe('parseLineChartRatingValue', () => {
    it('returns finite numbers as-is', () => {
      expect(parseLineChartRatingValue(3)).toBe(3);
      expect(parseLineChartRatingValue(Number.NaN)).toBeUndefined();
    });

    it('maps letter grades A–E to 1–5', () => {
      expect(parseLineChartRatingValue('A')).toBe(1);
      expect(parseLineChartRatingValue('e')).toBe(5);
    });

    it('parses numeric strings', () => {
      expect(parseLineChartRatingValue(' 2.5 ')).toBe(2.5);
      expect(parseLineChartRatingValue('invalid')).toBeUndefined();
    });
  });
});
