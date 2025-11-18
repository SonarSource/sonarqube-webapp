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

import { get, remove, save, sessionGet, sessionRemove, sessionSave } from '../storage';

jest.mock('~adapters/helpers/report-error', () => ({ reportError: jest.fn() }));

describe('save', () => {
  describe('with localstorage support', () => {
    it('should persist the value when passed and clear it when not passed', () => {
      save('my_test_key', 'test value');

      expect(globalThis.localStorage.getItem('my_test_key')).toBeDefined();

      save('my_test_key');

      expect(globalThis.localStorage.getItem('my_test_key')).toBeNull();
    });
  });
});

describe('remove', () => {
  it('should persist the value when passed and clear it when explicitly removed', () => {
    save('my_test_key', 'test value');

    expect(globalThis.localStorage.getItem('my_test_key')).toBeDefined();

    remove('my_test_key');

    expect(globalThis.localStorage.getItem('my_test_key')).toBeNull();
  });

  it('should remove an item when a suffix is provided', () => {
    save('my_test_key', 'test value', 'suffix_test');

    expect(globalThis.localStorage.getItem('my_test_key.suffix_test')).toBeDefined();

    remove('my_test_key', 'suffix_test');

    expect(globalThis.localStorage.getItem('my_test_key.suffix_test')).toBeNull();
  });
});

describe('get', () => {
  it('should persist the value when passed and clear it when explicitly removed', () => {
    save('my_test_key', 'test value');

    expect(globalThis.localStorage.getItem('my_test_key')).toBeDefined();

    get('my_test_key');

    expect(globalThis.localStorage.getItem('my_test_key')).toBe('test value');
  });

  it('should remove an item when a suffix is provided', () => {
    save('my_test_key', 'test value', 'suffix_test');

    expect(globalThis.localStorage.getItem('my_test_key.suffix_test')).toBeDefined();

    get('my_test_key', 'suffix_test');

    expect(globalThis.localStorage.getItem('my_test_key.suffix_test')).toBe('test value');
  });
});

describe('sessionSave', () => {
  describe('with localstorage support', () => {
    it('should persist the value when passed and clear it when not passed', () => {
      sessionSave('my_test_key', 'test value');

      expect(globalThis.sessionStorage.getItem('my_test_key')).toBeDefined();

      sessionSave('my_test_key');

      expect(globalThis.sessionStorage.getItem('my_test_key')).toBeNull();
    });
  });
});

describe('sessionRemove', () => {
  it('should persist the value when passed and clear it when explicitly removed', () => {
    sessionSave('my_test_key', 'test value');

    expect(globalThis.sessionStorage.getItem('my_test_key')).toBeDefined();

    sessionRemove('my_test_key');

    expect(globalThis.sessionStorage.getItem('my_test_key')).toBeNull();
  });

  it('should remove an item when a suffix is provided', () => {
    sessionSave('my_test_key', 'test value', 'suffix_test');

    expect(globalThis.sessionStorage.getItem('my_test_key.suffix_test')).toBeDefined();

    sessionRemove('my_test_key', 'suffix_test');

    expect(globalThis.sessionStorage.getItem('my_test_key.suffix_test')).toBeNull();
  });
});

describe('sessionGet', () => {
  it('should persist the value when passed and clear it when explicitly removed', () => {
    sessionSave('my_test_key', 'test value');

    expect(globalThis.sessionStorage.getItem('my_test_key')).toBeDefined();

    sessionGet('my_test_key');

    expect(globalThis.sessionStorage.getItem('my_test_key')).toBe('test value');
  });

  it('should remove an item when a suffix is provided', () => {
    sessionSave('my_test_key', 'test value', 'suffix_test');

    expect(globalThis.sessionStorage.getItem('my_test_key.suffix_test')).toBeDefined();

    sessionGet('my_test_key', 'suffix_test');

    expect(globalThis.sessionStorage.getItem('my_test_key.suffix_test')).toBe('test value');
  });
});

describe('when localstorage is not supported', () => {
  beforeEach(() => {
    jest.spyOn(globalThis.Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage not supported');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null', () => {
    expect(get('my_test_key')).toBeNull();
  });
});
