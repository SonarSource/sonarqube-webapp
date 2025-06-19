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

import {
  InfiniteData,
  QueryClient,
  QueryKey,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseQueryOptions,
  UseQueryResult,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { omit } from 'lodash';
import { ReactElement } from 'react';
import { reportError } from '~adapters/helpers/report-error';
import { Paging } from '../types/paging';

export enum StaleTime {
  /** Use it when the data doesn't change during the user's session or the data doesn't need to be update-to-date in the UI. */
  // eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member
  NEVER = Infinity,
  /** Use it when the data can change at any time because of user interactions or background tasks, and it's critical to reflect it live in the UI. */
  LIVE = 0,
  /** Use it when the data changes often and you want to be able to see it refreshed quickly but it's critical to see it live. */
  SHORT = 10000,
  /** Use it when the data rarely changes, anything bigger than 60s doesn't change much in term of network load or UX. */
  LONG = 60000,
  /** Use it for ambiguous cases where you can't decide between {@link StaleTime.SHORT} or {@link StaleTime.LONG}. It should rarely be used. */
  MEDIUM = 30000,
}

type QueryHook<TData, TArgs extends any[]> = (...args: TArgs) => UseQueryResult<TData>;

interface Props<TData, TArgs extends any[]> {
  args?: TArgs;
  children: (value: UseQueryResult<TData>) => ReactElement | null;
  query: QueryHook<TData, TArgs>;
}

export default function UseQuery<TData, TArgs extends any[]>(props: Props<TData, TArgs>) {
  const { query, args = [] as unknown as TArgs } = props;

  return props.children(query(...args));
}

const isFnWithoutParams = <T>(fn: ((data: any) => T) | (() => T)): fn is () => T => fn.length === 0;

type SuspenseQueryOptions = { isSuspense?: boolean };

type ResultType<TOptions extends SuspenseQueryOptions, TError, SelectType> = TOptions extends {
  isSuspense: true;
}
  ? UseSuspenseQueryResult<SelectType, TError>
  : UseQueryResult<SelectType, TError>;

type QueryOptionsType<
  TQueryData,
  TError,
  SelectType,
  TQueryKey extends QueryKey,
  TOptions extends SuspenseQueryOptions,
> = TOptions extends {
  isSuspense: true;
}
  ? Omit<
      UseSuspenseQueryOptions<TQueryData, TError, SelectType, TQueryKey>,
      'queryKey' | 'queryFn'
    > & { isSuspense: true }
  : TOptions extends { isSuspense: false }
    ? Omit<UseQueryOptions<TQueryData, TError, SelectType, TQueryKey>, 'queryKey' | 'queryFn'> & {
        isSuspense: false;
      }
    : Omit<UseQueryOptions<TQueryData, TError, SelectType, TQueryKey>, 'queryKey' | 'queryFn'> &
        TOptions;

export function createQueryHook<
  T = unknown,
  TQueryData = unknown,
  TError = Error,
  TData = TQueryData,
  TQueryKey extends QueryKey = QueryKey,
>(
  fn:
    | ((
        data: T,
      ) =>
        | UseQueryOptions<TQueryData, TError, TData, TQueryKey>
        | UseSuspenseQueryOptions<TQueryData, TError, TData, TQueryKey>)
    | (() =>
        | UseQueryOptions<TQueryData, TError, TData, TQueryKey>
        | UseSuspenseQueryOptions<TQueryData, TError, TData, TQueryKey>),
): unknown extends T
  ? <TOptions extends SuspenseQueryOptions = SuspenseQueryOptions, SelectType = TData>(
      options?: QueryOptionsType<TQueryData, TError, SelectType, TQueryKey, TOptions>,
    ) => ResultType<TOptions, TError, SelectType>
  : <TOptions extends SuspenseQueryOptions = SuspenseQueryOptions, SelectType = TData>(
      data: T,
      options?: QueryOptionsType<TQueryData, TError, SelectType, TQueryKey, TOptions>,
    ) => ResultType<TOptions, TError, SelectType>;

export function createQueryHook(
  fn:
    | ((data: unknown) => UseQueryOptions | UseSuspenseQueryOptions)
    | (() => UseQueryOptions | UseSuspenseQueryOptions),
) {
  if (isFnWithoutParams(fn)) {
    return (
      options?: QueryOptionsType<unknown, Error, unknown, QueryKey, SuspenseQueryOptions>,
    ) => {
      const queryFnOptions = fn();
      return useGetQuery(queryFnOptions, options);
    };
  }

  return (
    data: unknown,
    options?: QueryOptionsType<unknown, Error, unknown, QueryKey, SuspenseQueryOptions>,
  ) => {
    const queryFnOptions = fn(data);
    return useGetQuery(queryFnOptions, options);
  };
}

function useGetQuery(
  queryFnOptions:
    | UseQueryOptions<unknown, Error, unknown, QueryKey>
    | UseSuspenseQueryOptions<unknown, Error, unknown, QueryKey>,
  options?: QueryOptionsType<unknown, Error, unknown, QueryKey, SuspenseQueryOptions>,
) {
  const queryClient = useQueryClient();
  const queryOptions = { ...queryFnOptions, ...omit(options, 'isSuspense') };

  if (!options?.isSuspense) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery(queryOptions);
  }

  validateSuspenseUsage(queryFnOptions.queryKey, queryClient);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useSuspenseQuery(queryOptions);
}

const SUSPENDED_QUERY_ERROR_MESSAGE = 'Suspense query threw an error, no initial data for key';

/**
 * Validate that the query data is available when using suspense queries.
 * Otherwise log and report to sentry.
 */
function validateSuspenseUsage(queryKey: QueryKey, queryClient: QueryClient) {
  const queryData = queryClient.getQueryData<unknown>(queryKey);

  if (!queryData) {
    const info = queryKey.join('/');

    reportError(SUSPENDED_QUERY_ERROR_MESSAGE, {
      extra: info,
    });
  }
}

type UseInfiniteQueryOptionsToOmit =
  | 'getNextPageParam'
  | 'getPreviousPageParam'
  | 'initialPageParam'
  | 'queryFn'
  | 'queryKey';

export function createInfiniteQueryHook<
  T = unknown,
  TQueryFnData = unknown,
  TError = Error,
  TData = InfiniteData<TQueryFnData>,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  fn:
    | ((
        data: T,
      ) => UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>)
    | (() => UseInfiniteQueryOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryData,
        TQueryKey,
        TPageParam
      >),
): unknown extends T
  ? <SelectType = TData>(
      options?: Omit<
        UseInfiniteQueryOptions<
          TQueryFnData,
          TError,
          SelectType,
          TQueryData,
          TQueryKey,
          TPageParam
        >,
        UseInfiniteQueryOptionsToOmit
      >,
    ) => UseInfiniteQueryResult<SelectType, TError>
  : <SelectType = TData>(
      data: T,
      options?: Omit<
        UseInfiniteQueryOptions<
          TQueryFnData,
          TError,
          SelectType,
          TQueryData,
          TQueryKey,
          TPageParam
        >,
        UseInfiniteQueryOptionsToOmit
      >,
    ) => UseInfiniteQueryResult<SelectType, TError>;

export function createInfiniteQueryHook(
  fn: ((data?: any) => UseInfiniteQueryOptions) | (() => UseInfiniteQueryOptions),
) {
  if (isFnWithoutParams(fn)) {
    return (options?: Omit<UseInfiniteQueryOptions, UseInfiniteQueryOptionsToOmit>) =>
      useInfiniteQuery({ ...fn(), ...options });
  }

  return (data: any, options?: Omit<UseInfiniteQueryOptions, UseInfiniteQueryOptionsToOmit>) =>
    useInfiniteQuery({ ...fn(data), ...options });
}

export const getNextPageParam = <T extends { page: Paging }>(params: T) =>
  params.page.total <= params.page.pageIndex * params.page.pageSize
    ? undefined
    : params.page.pageIndex + 1;

export const getPreviousPageParam = <T extends { page: Paging }>(params: T) =>
  params.page.pageIndex === 1 ? undefined : params.page.pageIndex - 1;
