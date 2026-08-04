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

import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import {
  createLlmProvider,
  deleteLlmProvider,
  getLlmProviderDefinitions,
  getLlmProviders,
  getLlmProviderSelections,
  updateLlmProvider,
  upsertLlmProviderSelection,
} from '../api/llm-connectivity';
import { AiCapability, LlmProviderUpdate } from '../types/llm-connectivity';

const llmConnectivityQueryKeys = {
  definitions: () => ['llm-connectivity', 'llm-provider-definitions'] as const,
  providers: () => ['llm-connectivity', 'llm-providers'] as const,
  providersForCapability: (aiCapability: `${AiCapability}`) =>
    ['llm-connectivity', 'llm-providers', aiCapability] as const,
  selection: (aiCapability: `${AiCapability}`) =>
    ['llm-connectivity', 'llm-provider-mappings', aiCapability] as const,
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
    onSuccess() {
      client.invalidateQueries({ queryKey: llmConnectivityQueryKeys.providers() });
    },
  });
}

export function useDeleteLlmProviderMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: deleteLlmProvider,
    onSuccess() {
      client.invalidateQueries({ queryKey: llmConnectivityQueryKeys.providers() });
    },
  });
}

export function useUpsertLlmProviderSelectionMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: upsertLlmProviderSelection,
    onSuccess(_, { aiCapability }) {
      client.invalidateQueries({ queryKey: llmConnectivityQueryKeys.selection(aiCapability) });
    },
  });
}
