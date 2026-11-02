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

import { BeamerCacheEntry, GetBeamerUnreadCountArgs } from '../types/beamer';
import { get, save } from './storage';

export const BEAMER_NOTIFICATIONS_SETTING = 'beamer-notifications-setting';

export const BEAMER_CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

export const BEAMER_PAGE_SIZE = 10;

const BEAMER_UNREAD_COUNT_CACHE_KEY = 'sonarqube.beamer-unread-count';

function getBeamerUnreadCountCacheKey({ filter, userId }: GetBeamerUnreadCountArgs) {
  return `${BEAMER_UNREAD_COUNT_CACHE_KEY}.${userId}.${filter}`;
}

/**
 * Reads localStorage synchronously (rather than through React state) so that the value always
 * matches the current filter, even on the render where the filter changes.
 */
export function readBeamerUnreadCountCache(
  args: GetBeamerUnreadCountArgs,
): BeamerCacheEntry | undefined {
  try {
    return (
      (JSON.parse(get(getBeamerUnreadCountCacheKey(args)) ?? 'null') as BeamerCacheEntry | null) ??
      undefined
    );
  } catch {
    return undefined;
  }
}

/**
 * Passing no entry removes the cached value.
 */
export function writeBeamerUnreadCountCache(
  args: GetBeamerUnreadCountArgs,
  entry?: BeamerCacheEntry,
) {
  save(getBeamerUnreadCountCacheKey(args), entry ? JSON.stringify(entry) : undefined);
}
