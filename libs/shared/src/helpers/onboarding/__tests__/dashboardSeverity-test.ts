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

import { clampPercent, getSeverityColorForPercent } from '../dashboardSeverity';

describe('clampPercent', () => {
  it.each([
    [-10, 0],
    [0, 0],
    [42, 42],
    [100, 100],
    [150, 100],
  ])('clamps %s to %s', (value, expected) => {
    expect(clampPercent(value)).toBe(expected);
  });
});

describe('getSeverityColorForPercent', () => {
  it('returns the same color inside a cohort and a different one across its boundary', () => {
    const cohorts = [
      [-1, 0],
      [1, 24],
      [25, 49],
      [50, 74],
      [75, 99],
      [100, 100],
    ];

    const colors = cohorts.map(([low, high]) => {
      const lowColor = getSeverityColorForPercent(low);

      expect(getSeverityColorForPercent(high)).toBe(lowColor);

      return lowColor;
    });

    expect(new Set(colors).size).toBe(cohorts.length);
  });
});
