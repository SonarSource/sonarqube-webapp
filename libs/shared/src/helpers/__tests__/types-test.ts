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

import { ensure, isDefined, isStringDefined } from '../types';

describe('isDefined', () => {
  it('should return true if value is defined', () => {
    expect(isDefined('foo')).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined(1)).toBe(true);
    expect(isDefined({})).toBe(true);
    expect(isDefined(true)).toBe(true);
    expect(isDefined(false)).toBe(true);
  });

  it('should return false if value is undefined', () => {
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined(null)).toBe(false);
  });
});

describe('isStringDefined', () => {
  it('should return true if value is defined', () => {
    expect(isStringDefined('foo')).toBe(true);
  });

  it('should return false if value is undefined', () => {
    expect(isStringDefined(undefined)).toBe(false);
    expect(isStringDefined(null)).toBe(false);
    expect(isStringDefined('')).toBe(false);
  });
});

describe('ensure', () => {
  it('should return the value if it is defined', () => {
    expect(ensure('foo', 'message')).toBe('foo');
    expect(ensure('', 'message')).toBe('');
    expect(ensure(0, 'message')).toBe(0);
    expect(ensure(false, 'message')).toBe(false);
    expect(ensure({}, 'message')).toEqual({});
  });

  it('should throw with the given message if value is undefined', () => {
    expect(() => ensure(undefined, 'value was missing')).toThrow('value was missing');
  });

  it('should throw with the given message if value is null', () => {
    expect(() => ensure(null, 'value was missing')).toThrow('value was missing');
  });
});
