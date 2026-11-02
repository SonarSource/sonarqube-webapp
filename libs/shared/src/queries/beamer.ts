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
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getBeamerNewsList,
  GetBeamerNewsListArgs,
  getBeamerUnreadCount,
  markUnreadPosts,
} from '../api/beamer';
import {
  BEAMER_CACHE_DURATION_MS,
  BEAMER_PAGE_SIZE,
  readBeamerUnreadCountCache,
  writeBeamerUnreadCountCache,
} from '../helpers/beamer';
import { GetBeamerUnreadCountArgs } from '../types/beamer';
import { createInfiniteQueryHook, createQueryHook, StaleTime } from './common';

export const useBeamerUnreadCountQuery = createQueryHook((data: GetBeamerUnreadCountArgs) => {
  return queryOptions({
    queryKey: ['beamer', 'unread-count', data.userId, data.filter],
    queryFn: async () => {
      const response = await getBeamerUnreadCount(data);
      writeBeamerUnreadCountCache(data, { data: { count: response.count }, timestamp: Date.now() });
      return response;
    },
    initialData: () => readBeamerUnreadCountCache(data)?.data,
    initialDataUpdatedAt: () => readBeamerUnreadCountCache(data)?.timestamp,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: BEAMER_CACHE_DURATION_MS,
  });
});

export function useMarkUnreadPostsMutation(data: GetBeamerNewsListArgs) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markUnreadPosts(data),
    onSuccess() {
      // Remove the cache entry so the next query fetches fresh data from the API.
      writeBeamerUnreadCountCache(data);
      void queryClient.invalidateQueries({
        queryKey: ['beamer', 'unread-count', data.userId, data.filter],
      });
    },
  });
}

export const useBeamerNewsListQuery = createInfiniteQueryHook((data: GetBeamerNewsListArgs) => {
  return infiniteQueryOptions({
    queryKey: ['beamer', 'news-list', data.userId, data.filter],
    queryFn: ({ pageParam }) => getBeamerNewsList({ ...data, page: pageParam }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: StaleTime.NEVER,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // Beamer returns max 10 posts per page by default
      // If we get less than 10 posts, there are no more pages
      return lastPage.length >= BEAMER_PAGE_SIZE ? lastPageParam + 1 : undefined;
    },
    getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => {
      return firstPageParam > 1 ? firstPageParam - 1 : undefined;
    },
  });
});
