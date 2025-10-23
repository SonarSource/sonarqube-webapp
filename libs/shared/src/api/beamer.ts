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

import { getBeamerAPIKey } from '~adapters/helpers/vendorConfig';
import { axiosToCatch } from '../helpers/axios-clients';
import { BeamerNewsItem } from '../types/beamer';

export const PAGE_SIZE = 10;

interface BeamerUnreadCountResponse {
  count: number;
}

export interface GetBeamerUnreadCountArgs {
  filter: string;
  userId: string;
}

export function getBeamerUnreadCount({
  filter,
  userId,
}: GetBeamerUnreadCountArgs): Promise<BeamerUnreadCountResponse> {
  return axiosToCatch.get('https://api.getbeamer.com/v0/unread/count', {
    params: {
      filter,
      userId,
    },
    headers: {
      'Beamer-Api-Key': getBeamerAPIKey(),
    },
  });
}

export interface GetBeamerNewsListArgs {
  filter: string;
  page?: number;
  userId: string;
}

export function getBeamerNewsList({
  filter,
  userId,
  page = 0,
}: GetBeamerNewsListArgs): Promise<BeamerNewsItem[]> {
  return axiosToCatch.get('https://api.getbeamer.com/v0/posts', {
    params: {
      // Exclude posts
      archived: false,
      expired: false,
      published: true,

      filter,
      userId,
      page,
      maxResults: PAGE_SIZE,
    },
    headers: {
      'Beamer-Api-Key': getBeamerAPIKey(),
    },
  });
}

/**
 * This returns unread posts and marks them as read.
 * We only use it to mark unread posts as read, because we want to display all posts
 */
export function markUnreadPosts({ filter, userId }: GetBeamerNewsListArgs): Promise<void> {
  return axiosToCatch.get('https://api.getbeamer.com/v0/unread', {
    params: {
      filter,
      userId,
    },
    headers: {
      'Beamer-Api-Key': getBeamerAPIKey(),
    },
  });
}
