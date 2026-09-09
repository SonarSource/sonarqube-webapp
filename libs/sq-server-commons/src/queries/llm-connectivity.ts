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
  queryOptions,
  useMutation,
  useQueries,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import {
  createLlmProvider,
  deleteLlmProvider,
  getLlmProviderDefinitions,
  getLlmProviders,
  getLlmProviderSelections,
  updateLlmProvider,
  upsertLlmProviderSelection,
  validateLlmProvider,
} from '../api/llm-connectivity';
import {
  AiCapability,
  LlmProviderUpdate,
  LlmProviderValidation,
  LlmProviderValidationState,
} from '../types/llm-connectivity';

const llmConnectivityQueryKeys = {
  definitions: () => ['llm-connectivity', 'llm-provider-definitions'] as const,
  providers: () => ['llm-connectivity', 'llm-providers'] as const,
  providersForCapability: (aiCapability: `${AiCapability}`) =>
    ['llm-connectivity', 'llm-providers', aiCapability] as const,
  selection: (aiCapability: `${AiCapability}`) =>
    ['llm-connectivity', 'llm-provider-mappings', aiCapability] as const,
  validation: (llmProviderId: string) =>
    ['llm-connectivity', 'llm-provider-validations', llmProviderId] as const,
};

export const useLlmProviderDefinitionsQuery = createQueryHook(() =>
  queryOptions({
    queryKey: llmConnectivityQueryKeys.definitions(),
    queryFn: getLlmProviderDefinitions,
    staleTime: StaleTime.LONG,
  }),
);

export const useLlmProvidersQuery = createQueryHook(() =>
  queryOptions({
    queryKey: llmConnectivityQueryKeys.providers(),
    queryFn: () => getLlmProviders(),
    staleTime: StaleTime.NEVER,
  }),
);

/** The providers a given AI capability accepts, which excludes the `SONAR` provider. */
export const useCapabilityLlmProvidersQuery = createQueryHook((aiCapability: AiCapability) =>
  queryOptions({
    queryKey: llmConnectivityQueryKeys.providersForCapability(aiCapability),
    queryFn: () => getLlmProviders(aiCapability),
    staleTime: StaleTime.NEVER,
  }),
);

/** There is at most one selection per capability, so the list collapses to a single entry. */
export const useLlmProviderSelectionQuery = createQueryHook((aiCapability: AiCapability) =>
  queryOptions({
    queryKey: llmConnectivityQueryKeys.selection(aiCapability),
    queryFn: () => getLlmProviderSelections(aiCapability),
    select: (selections) => selections.find((selection) => selection.aiCapability === aiCapability),
    staleTime: StaleTime.NEVER,
  }),
);

/**
 * Fans out one connection test per provider, and reports each provider's state separately.
 * Credentials can be revoked upstream at any moment and the server caches nothing, so a verdict is
 * only meaningful when freshly fetched: each probe is re-run whenever an admin opens the page
 * (`refetchOnMount`), and never expires on its own (`staleTime`) so re-renders in between do not
 * re-hit the providers.
 *
 * A failed probe is a legitimate "unknown" rather than a transient glitch, hence no retries.
 *
 * `combine` pairs each result with its provider by position, which `useQueries` guarantees to match
 * the order of `queries`. It cannot key off the payload instead, because a probe that is still in
 * flight or that failed has no payload to read the id from. `useCallback` keeps the reference stable
 * so `useQueries` can still memoize; callers therefore have to pass a memoized `llmProviderIds`.
 */
export function useLlmProviderValidationsQuery(llmProviderIds: string[]) {
  const combine = useCallback(
    (results: UseQueryResult<LlmProviderValidation>[]) =>
      new Map<string, LlmProviderValidationState>(
        llmProviderIds.map((llmProviderId, index) => {
          const result = results[index];

          return [
            llmProviderId,
            {
              isFetching: result?.isFetching ?? false,
              // React Query keeps the last successful `data` around after a failed refetch, so a
              // stale "valid" verdict would otherwise survive a recheck that just failed. Only
              // trust `data` when the latest fetch actually succeeded.
              validation: result?.isSuccess ? result.data : undefined,
            },
          ] as const;
        }),
      ),
    [llmProviderIds],
  );

  return useQueries({
    queries: llmProviderIds.map((llmProviderId) => ({
      queryKey: llmConnectivityQueryKeys.validation(llmProviderId),
      queryFn: () => validateLlmProvider(llmProviderId),
      staleTime: StaleTime.NEVER,
      refetchOnMount: 'always' as const,
      retry: false,
    })),
    combine,
  });
}

export function useCreateLlmProviderMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: createLlmProvider,
    onSuccess() {
      client.invalidateQueries({ queryKey: llmConnectivityQueryKeys.providers() });
    },
  });
}

export function useUpdateLlmProviderMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ data, id }: { data: LlmProviderUpdate; id: string }) =>
      updateLlmProvider(id, data),
    onSuccess(_, { id }) {
      client.invalidateQueries({ queryKey: llmConnectivityQueryKeys.providers() });
      // A rotated secret or a new endpoint changes the verdict, so the cached one must not survive
      // the edit that invalidated it.
      client.invalidateQueries({ queryKey: llmConnectivityQueryKeys.validation(id) });
    },
  });
}

export function useDeleteLlmProviderMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: deleteLlmProvider,
    onSuccess() {
      client.invalidateQueries({ queryKey: llmConnectivityQueryKeys.providers() });
      // The verdict is deliberately left in the cache to be garbage-collected. Removing it here
      // would rebuild the query through the row's still-mounted observer while the provider list is
      // stale, and probe a provider that no longer exists. Leaving it is inert: provider ids are
      // server-generated UUIDs, so no later provider can inherit this one's verdict, and no row
      // remains that could render it.
    },
  });
}

export function useUpsertLlmProviderSelectionMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: upsertLlmProviderSelection,
    onSuccess(_, { aiCapability }) {
      client.invalidateQueries({ queryKey: llmConnectivityQueryKeys.selection(aiCapability) });
      client.invalidateQueries({ queryKey: ['purchasable-features'] });
    },
  });
}
