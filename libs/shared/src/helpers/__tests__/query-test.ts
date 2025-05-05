/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { queryToSearchString } from '../query';

describe('queryToSearchString', () => {
  it('should handle query as array', () => {
    expect(
      queryToSearchString([
        ['key1', 'value1'],
        ['key1', 'value2'],
        ['key2', 'value1'],
      ]),
    ).toBe('?key1=value1&key1=value2&key2=value1');
  });

  it('should handle query as string', () => {
    expect(queryToSearchString('a=1')).toBe('?a=1');
  });

  it('should handle query as URLSearchParams', () => {
    expect(queryToSearchString(new URLSearchParams({ a: '1', b: '2' }))).toBe('?a=1&b=2');
  });

  it('should handle all types', () => {
    const query = {
      author: ['GRRM', 'JKR', 'Stross'],
      b1: true,
      b2: false,
      number: 0,
      emptyArray: [],
      normalString: 'hello',
      undef: undefined,
    };

    expect(queryToSearchString(query)).toBe(
      '?author=GRRM&author=JKR&author=Stross&b1=true&b2=false&number=0&normalString=hello',
    );
  });

  it('should handle an missing query', () => {
    expect(queryToSearchString()).toBeUndefined();
  });
});
