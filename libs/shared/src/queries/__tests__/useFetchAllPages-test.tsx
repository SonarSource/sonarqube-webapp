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

import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { reportError } from '~adapters/helpers/report-error';
import { useFetchAllPages } from '../common';

jest.mock('~adapters/helpers/report-error', () => ({ reportError: jest.fn() }));

type Page = { hasNext: boolean; pageIndex: number };

const QUERY_KEY = ['test', 'fetch-all-pages'];
const MAX_FETCHED_PAGES = 50;

function useTestQuery(fetchPage: (pageIndex: number) => Promise<Page>) {
  const query = useInfiniteQuery({
    queryKey: QUERY_KEY,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.pageIndex + 1 : undefined),
    retry: false,
  });

  return useFetchAllPages(query, QUERY_KEY);
}

let queryClient: QueryClient;

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  // eslint-disable-next-line local-rules/no-query-client-imports
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  jest.clearAllMocks();
});

describe('useFetchAllPages', () => {
  it('drains every page until hasNext is false', async () => {
    const fetchPage = jest.fn((pageIndex: number): Promise<Page> =>
      Promise.resolve({ hasNext: pageIndex < 3, pageIndex }),
    );

    const { result } = renderHook(() => useTestQuery(fetchPage), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.data?.pages.length).toBe(3);
    });

    expect(result.current.hasNextPage).toBe(false);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(result.current.data?.pages.map((page) => page.pageIndex)).toEqual([1, 2, 3]);
    expect(reportError).not.toHaveBeenCalled();
  });

  it('stops after one failed page and reports reason: page-error', async () => {
    const fetchPage = jest.fn((pageIndex: number): Promise<Page> => {
      if (pageIndex === 1) {
        return Promise.resolve({ hasNext: true, pageIndex });
      }
      return Promise.reject(new Error('boom'));
    });

    const { result } = renderHook(() => useTestQuery(fetchPage), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isFetchNextPageError).toBe(true);
    });

    await waitFor(() => {
      expect(reportError).toHaveBeenCalledWith('Stopped fetching pages before draining the query', {
        extra: { fetchedPages: 1, queryKey: 'test/fetch-all-pages', reason: 'page-error' },
      });
    });

    // Give a re-fire a chance to happen before asserting it didn't: the guard must hold even
    // after the failed page settles, not just at the instant it errors.
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('stops at the page cap and reports reason: page-limit', async () => {
    const fetchPage = jest.fn((pageIndex: number): Promise<Page> =>
      Promise.resolve({ hasNext: true, pageIndex }),
    );

    renderHook(() => useTestQuery(fetchPage), { wrapper: Wrapper });

    await waitFor(
      () => {
        expect(reportError).toHaveBeenCalled();
      },
      { timeout: 10000 },
    );

    expect(fetchPage).toHaveBeenCalledTimes(MAX_FETCHED_PAGES);
    expect(reportError).toHaveBeenCalledWith('Stopped fetching pages before draining the query', {
      extra: {
        fetchedPages: MAX_FETCHED_PAGES,
        queryKey: 'test/fetch-all-pages',
        reason: 'page-limit',
      },
    });
  }, 15000);
});
