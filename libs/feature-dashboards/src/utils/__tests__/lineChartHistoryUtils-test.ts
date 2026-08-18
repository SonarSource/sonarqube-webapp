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

import { parseLineChartRatingValue } from '../lineChartHistoryUtils';

describe('lineChartHistoryUtils', () => {
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
