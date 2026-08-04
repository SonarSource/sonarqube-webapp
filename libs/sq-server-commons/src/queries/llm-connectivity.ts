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
  updateLlmProvider,
} from '../api/llm-connectivity';
import { LlmProviderUpdate } from '../types/llm-connectivity';

const llmConnectivityQueryKeys = {
  definitions: () => ['llm-connectivity', 'llm-provider-definitions'] as const,
  providers: () => ['llm-connectivity', 'llm-providers'] as const,
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
    queryFn: getLlmProviders,
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
