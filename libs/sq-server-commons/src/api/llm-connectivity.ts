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

import { axiosClient, axiosToCatch } from '~shared/helpers/axios-clients';
import {
  LlmProvider,
  LlmProviderCreate,
  LlmProviderDefinition,
  LlmProviderUpdate,
} from '../types/llm-connectivity';

export const LLM_CONNECTIVITY_PATH = '/api/v2/llm-connectivity';
export const LLM_PROVIDER_DEFINITIONS_PATH = `${LLM_CONNECTIVITY_PATH}/llm-provider-definitions`;
export const LLM_PROVIDERS_PATH = `${LLM_CONNECTIVITY_PATH}/llm-providers`;

export function getLlmProviderDefinitions() {
  return axiosClient
    .get<{ providerDefinitions: LlmProviderDefinition[] }>(LLM_PROVIDER_DEFINITIONS_PATH)
    .then((response) => response.providerDefinitions);
}

export function getLlmProviders() {
  return axiosClient
    .get<{ providers: LlmProvider[] }>(LLM_PROVIDERS_PATH)
    .then((response) => response.providers);
}

/*
 * Writes use `axiosToCatch` so the form can render the connection-test failure
 * inline instead of firing a global toast.
 */

export function createLlmProvider(data: LlmProviderCreate) {
  return axiosToCatch.post<LlmProvider, LlmProviderCreate>(LLM_PROVIDERS_PATH, data);
}

export function updateLlmProvider(id: string, data: LlmProviderUpdate) {
  return axiosToCatch.patch<LlmProvider, LlmProviderUpdate>(`${LLM_PROVIDERS_PATH}/${id}`, data);
}

export function deleteLlmProvider(id: string) {
  return axiosToCatch.delete(`${LLM_PROVIDERS_PATH}/${id}`);
}
