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

import { TopListLimit } from '../../../../types/widget-common';
import { buildTopListRows } from '../topListRowUtils';

describe('buildTopListRows', () => {
  it('returns at most five rows sorted by count descending by default', () => {
    const rows = buildTopListRows(
      {
        a: 1,
        b: 10,
        c: 5,
        d: 20,
        e: 3,
        f: 100,
        g: 2,
      },
      (value) => `Label ${value}`,
    );

    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.value)).toEqual(['f', 'd', 'b', 'c', 'e']);
    expect(rows[0]).toMatchObject({ count: 100, label: 'Label f', rank: 1 });
  });

  it('respects the configured row limit', () => {
    const counts = Object.fromEntries(
      Array.from({ length: 20 }, (_, index) => [`key-${index}`, 20 - index]),
    );

    expect(
      buildTopListRows(counts, (value) => value, undefined, undefined, TopListLimit.Ten),
    ).toHaveLength(10);
    expect(
      buildTopListRows(counts, (value) => value, undefined, undefined, TopListLimit.Fifteen),
    ).toHaveLength(15);
  });

  it('omits zero-count entries and does not pad rows', () => {
    const rows = buildTopListRows({ a: 0, b: 4, c: 0 }, (value) => value);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ count: 4, label: 'b', rank: 1, value: 'b' });
  });

  it('sets trendData to null when the resolver returns null', () => {
    const rows = buildTopListRows(
      { a: 1 },
      () => 'A',
      undefined,
      () => null,
    );

    expect(rows[0]?.trendData).toBeNull();
  });

  it('resolves separate label and count navigation targets', () => {
    const rows = buildTopListRows(
      { a: 1 },
      () => 'A',
      (value) => `/label/${value}`,
      undefined,
      TopListLimit.Five,
      (value) => `/count/${value}`,
    );

    expect(rows[0]).toMatchObject({ countLinkTo: '/count/a', linkTo: '/label/a' });
  });
});
