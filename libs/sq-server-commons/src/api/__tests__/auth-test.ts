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

import { HttpStatus } from '~shared/types/request';
import {
  clearCachedCSRFToken,
  getCachedCSRFToken,
  setCachedCSRFToken,
} from '../../helpers/csrf-token';
import { logOut } from '../auth';

beforeEach(() => {
  clearCachedCSRFToken();
  window.fetch = jest.fn().mockResolvedValue(new Response('', { status: HttpStatus.Ok }));
});

it('should send the current CSRF token on the logout request, then clear the cache', async () => {
  setCachedCSRFToken('some-token');

  await logOut();

  expect(window.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/authentication/logout'),
    expect.objectContaining({ headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'some-token' }) }),
  );
  expect(getCachedCSRFToken()).toBeUndefined();
});

it('should clear the cached CSRF token even when the logout request fails', async () => {
  setCachedCSRFToken('some-token');
  window.fetch = jest.fn().mockResolvedValue(new Response('', { status: HttpStatus.Forbidden }));

  await logOut().catch(() => {});

  expect(getCachedCSRFToken()).toBeUndefined();
});

it('should prime the CSRF token with an authenticated GET before logging out when none is available (e.g. a direct /sessions/logout visit)', async () => {
  window.fetch = jest.fn().mockImplementation((url) =>
    Promise.resolve(
      String(url).includes('/api/users/current')
        ? new Response('{}', {
            status: HttpStatus.Ok,
            headers: { 'X-XSRF-TOKEN': 'primed-token' },
          })
        : new Response('', { status: HttpStatus.Ok }),
    ),
  );

  await logOut();

  const calls = jest.mocked(window.fetch).mock.calls;
  expect(calls[0][0]).toEqual(expect.stringContaining('/api/users/current'));
  expect(calls[1][0]).toEqual(expect.stringContaining('/api/authentication/logout'));
  expect(calls[1][1]).toEqual(
    expect.objectContaining({
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'primed-token' }),
    }),
  );
});

it('should not prime the CSRF token when one is already available', async () => {
  setCachedCSRFToken('cached-token');

  await logOut();

  expect(window.fetch).toHaveBeenCalledTimes(1);
  expect(window.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/authentication/logout'),
    expect.anything(),
  );
});
