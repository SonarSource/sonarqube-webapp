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

/**
 * Behind a reverse proxy that forces `HttpOnly=true` on every cookie, the `XSRF-TOKEN`
 * cookie becomes unreadable by JavaScript. The server also echoes the token as the
 * `X-XSRF-TOKEN` response header on authenticated requests, so it's cached here and
 * preferred over the cookie.
 */
let cachedCSRFToken: string | undefined;

export function getCachedCSRFToken(): string | undefined {
  return cachedCSRFToken;
}

export function setCachedCSRFToken(token: string): void {
  cachedCSRFToken = token;
}

export function clearCachedCSRFToken(): void {
  cachedCSRFToken = undefined;
}
