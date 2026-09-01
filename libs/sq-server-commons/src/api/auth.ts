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

import { clearCachedCSRFToken } from '../helpers/csrf-token';
import { getCSRFTokenValue, request } from '../helpers/request';
import { getCurrentUser } from './users';

export function logIn(login: string, password: string): Promise<Response> {
  return request('/api/authentication/login')
    .setMethod('POST')
    .setData({ login, password })
    .submit()
    .then(basicCheckStatus);
}

export async function logOut(): Promise<Response> {
  if (!getCSRFTokenValue()) {
    // `/sessions/logout` skips the app bootstrap that normally primes the CSRF token
    // cache, so on deployments where the XSRF-TOKEN cookie is unreadable (HttpOnly
    // reverse proxy) the logout POST itself would otherwise be CSRF-rejected.
    await getCurrentUser().catch(() => {});
  }

  return request('/api/authentication/logout')
    .setMethod('POST')
    .submit()
    .then(basicCheckStatus)
    .finally(clearCachedCSRFToken);
}

function basicCheckStatus(response: Response): Promise<Response> {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  return Promise.reject(response);
}
