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

import * as reportErrorModule from '~adapters/helpers/report-error';
import { ensureOrReport } from '../ensureOrReport';

describe('ensureOrReport', () => {
  const reportError = jest
    .spyOn(reportErrorModule, 'reportError')
    .mockImplementation(() => () => undefined);

  afterEach(() => {
    reportError.mockClear();
  });

  it('should return the value if it is defined', () => {
    expect(ensureOrReport('foo', 'fallback', 'message')).toBe('foo');
    expect(ensureOrReport(0, -1, 'message')).toBe(0);
    expect(ensureOrReport(false, true, 'message')).toBe(false);
    expect(reportError).not.toHaveBeenCalled();
  });

  it('should return the fallback and report when value is undefined', () => {
    expect(ensureOrReport(undefined, 'fallback', 'value was missing (undefined case)')).toBe(
      'fallback',
    );
    expect(reportError).toHaveBeenCalledWith('value was missing (undefined case)', undefined);
  });

  it('should return the fallback and report when value is null', () => {
    expect(ensureOrReport(null, 'fallback', 'value was missing (null case)')).toBe('fallback');
    expect(reportError).toHaveBeenCalledWith('value was missing (null case)', undefined);
  });

  it('should forward the capture context to reportError', () => {
    ensureOrReport(undefined, 'fallback', 'value was missing (with context)', {
      extra: { id: '123' },
    });
    expect(reportError).toHaveBeenCalledWith('value was missing (with context)', {
      extra: { id: '123' },
    });
  });

  it('should report a given message only once, even across repeated calls', () => {
    ensureOrReport(undefined, 'fallback', 'repeated missing value');
    ensureOrReport(undefined, 'fallback', 'repeated missing value');
    ensureOrReport(undefined, 'fallback', 'repeated missing value');
    expect(reportError).toHaveBeenCalledTimes(1);
  });
});
