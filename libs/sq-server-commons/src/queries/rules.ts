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
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createInfiniteQueryHook,
  createQueryHook,
  getNextPagingParam,
  getPreviousPagingParam,
  StaleTime,
} from '~shared/queries/common';
import { RuleActivationAdvanced, RuleDetails } from '~shared/types/rules';
import { createRule, deleteRule, getRuleDetails, searchRules, updateRule } from '../api/rules';
import { SearchRulesResponse } from '../types/coding-rules';
import { SearchRulesQuery } from '../types/rules';
import { mapRestRuleToRule } from '../utils/coding-rules';

function getRulesQueryKey(type: 'search' | 'details', data?: SearchRulesQuery | string) {
  const key = ['rules', type] as (string | SearchRulesQuery)[];
  if (data) {
    key.push(data);
  }
  return key;
}

export const useSearchRulesQuery = createInfiniteQueryHook((data: SearchRulesQuery) => {
  return infiniteQueryOptions({
    queryKey: getRulesQueryKey('search', data),
    queryFn: ({ pageParam, queryKey: [, , query] }) => {
      if (!query) {
        return {
          paging: { pageIndex: 1, pageSize: data.ps ?? 100, total: 0 },
          rules: [],
        } as SearchRulesResponse;
      }

      return searchRules({ ...data, p: pageParam });
    },
    staleTime: StaleTime.NEVER,
    getNextPageParam: getNextPagingParam,
    getPreviousPageParam: getPreviousPagingParam,
    initialPageParam: data.p ?? 1,
  });
});

export const useRuleDetailsQuery = createQueryHook((data: { actives?: boolean; key: string }) => {
  return queryOptions({
    queryKey: getRulesQueryKey('details', data.key),
    queryFn: () => getRuleDetails(data),
    staleTime: StaleTime.NEVER,
  });
});

export function useCreateRuleMutation(
  searchQuery?: SearchRulesQuery,
  onSuccess?: (rule: RuleDetails) => unknown,
  onError?: (error: Response) => unknown,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRule,
    onError,
    onSuccess: (rule) => {
      const mappedRule = mapRestRuleToRule(rule);
      onSuccess?.(mappedRule);
      queryClient.resetQueries({ queryKey: getRulesQueryKey('search', searchQuery) });
    },
  });
}

export function useUpdateRuleMutation(
  searchQuery?: SearchRulesQuery,
  onSuccess?: (rule: RuleDetails) => unknown,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRule,
    onSuccess: (rule) => {
      onSuccess?.(rule);
      queryClient.resetQueries({ queryKey: getRulesQueryKey('search', searchQuery) });
      queryClient.setQueryData<{
        actives?: RuleActivationAdvanced[];
        rule: RuleDetails;
      }>(getRulesQueryKey('details', rule.key), (oldData) => {
        return {
          ...oldData,
          rule,
        };
      });
    },
  });
}

export function useDeleteRuleMutation(
  searchQuery?: SearchRulesQuery,
  onSuccess?: (key: string) => unknown,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { key: string }) => deleteRule(params),
    onSuccess: (_, data) => {
      onSuccess?.(data.key);
      queryClient.setQueryData<InfiniteData<SearchRulesResponse>>(
        getRulesQueryKey('search', searchQuery),
        (oldData) => {
          return oldData
            ? {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  paging: { ...page.paging, total: page.paging.total - 1 },
                  rules: page.rules.filter((rule) => rule.key !== data.key),
                })),
              }
            : undefined;
        },
      );
      queryClient.invalidateQueries({
        queryKey: getRulesQueryKey('search', searchQuery),
      });
    },
  });
}
