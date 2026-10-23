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

import { clampPercent, toDisplayPercent } from '../percent';

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

describe('toDisplayPercent', () => {
  it.each([
    [-10, 0],
    [0, 0],
    [0.01, 1],
    [0.5, 1],
    [50.6, 51],
    [99.4, 99],
    [99.5, 99],
    [99.99, 99],
    [100, 100],
    [150, 100],
  ])('displays %s as %s', (value, expected) => {
    expect(toDisplayPercent(value)).toBe(expected);
  });
});
