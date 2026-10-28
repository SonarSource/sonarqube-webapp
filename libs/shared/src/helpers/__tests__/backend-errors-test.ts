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

import {
  getApiErrorMessage,
  getBackendErrorMessage,
  getBackendErrorMessages,
  getBackendErrorSummary,
} from '../backend-errors';

describe('getBackendErrorMessage', () => {
  it('prefers msg over message', () => {
    expect(getBackendErrorMessage({ msg: 'Legacy message', message: 'Current message' })).toBe(
      'Legacy message',
    );
  });

  it('returns message when msg is absent', () => {
    expect(getBackendErrorMessage({ message: 'Current message' })).toBe('Current message');
  });

  it('returns undefined for missing or invalid messages', () => {
    expect(getBackendErrorMessage(null)).toBeUndefined();
    expect(getBackendErrorMessage({ msg: '', message: 42 })).toBeUndefined();
  });
});

describe('getBackendErrorMessages', () => {
  it('extracts both supported message fields and ignores invalid entries', () => {
    expect(
      getBackendErrorMessages({
        errors: [{ msg: 'First' }, { message: 'Second' }, { msg: '' }, null, 42],
      }),
    ).toEqual(['First', 'Second']);
  });

  it('returns an empty array when errors is absent or invalid', () => {
    expect(getBackendErrorMessages({})).toEqual([]);
    expect(getBackendErrorMessages({ errors: 'not-an-array' })).toEqual([]);
  });
});

describe('getBackendErrorSummary', () => {
  it('prefers a top-level message over nested errors', () => {
    expect(
      getBackendErrorSummary({ message: 'Top-level message', errors: [{ msg: 'Nested message' }] }),
    ).toBe('Top-level message');
  });

  it('joins nested errors when no top-level message is available', () => {
    expect(getBackendErrorSummary({ errors: [{ msg: 'First' }, { message: 'Second' }] })).toBe(
      'First. Second',
    );
  });

  it('returns undefined when there are no messages', () => {
    expect(getBackendErrorSummary({})).toBeUndefined();
  });
});

describe('getApiErrorMessage', () => {
  it('returns undefined when response data is unavailable', () => {
    expect(getApiErrorMessage(null)).toBeUndefined();
    expect(getApiErrorMessage(new Error('Network error'))).toBeUndefined();
    expect(getApiErrorMessage({ response: { data: null } })).toBeUndefined();
  });

  it('extracts a top-level message or joined legacy errors from response data', () => {
    expect(getApiErrorMessage({ response: { data: { message: 'Server message' } } })).toBe(
      'Server message',
    );
    expect(
      getApiErrorMessage({ response: { data: { errors: [{ msg: 'First' }, { msg: 'Second' }] } } }),
    ).toBe('First. Second');
  });
});
