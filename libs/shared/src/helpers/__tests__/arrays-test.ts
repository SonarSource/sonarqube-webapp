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

import { groupConsecutiveBy } from '../arrays';

describe('groupConsecutiveBy', () => {
  it('should return no groups for an empty list', () => {
    expect(groupConsecutiveBy([], (item) => item)).toEqual([]);
  });

  it('should group only consecutive items and never merge or reorder reappearing keys', () => {
    const items = [
      { id: 1, file: 'foo' },
      { id: 2, file: 'foo' },
      { id: 3, file: 'bar' },
      { id: 4, file: 'foo' },
    ];

    expect(groupConsecutiveBy(items, (item) => item.file)).toEqual([
      [items[0], items[1]],
      [items[2]],
      [items[3]],
    ]);
  });
});
