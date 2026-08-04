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

import { cloneDeep } from 'lodash';
import { http, HttpResponse } from 'msw';
import { AbstractServiceMock } from '~shared/api/mocks/AbstractServiceMock';
import { HttpStatus } from '~shared/types/request';
import {
  AiCapability,
  LlmHttpHeader,
  LlmHttpHeaderWrite,
  LlmProvider,
  LlmProviderConfiguration,
  LlmProviderConfigurationValue,
  LlmProviderConfigurationWrite,
  LlmProviderCreate,
  LlmProviderDefinition,
  LlmProviderFieldType,
  LlmProviderSelection,
  LlmProviderSelectionUpsert,
  LlmProviderType,
  LlmProviderUpdate,
  MAX_LLM_PROVIDERS,
} from '../../types/llm-connectivity';
import {
  LLM_PROVIDER_DEFINITIONS_PATH,
  LLM_PROVIDER_MAPPINGS_PATH,
  LLM_PROVIDERS_PATH,
} from '../llm-connectivity';

export const SONAR_PROVIDER_ID = '00000000-0000-0000-0000-00000000s0nr';

export const SONAR_PROVIDER: LlmProvider = {
  id: SONAR_PROVIDER_ID,
  provider: LlmProviderType.Sonar,
  label: 'Sonar',
  configuration: {},
};

export const CUSTOM_PROXY_DEFINITION: LlmProviderDefinition = {
  provider: LlmProviderType.CustomProxy,
  label: 'Custom proxy',
  fields: [
    {
      key: 'endpoint',
      label: 'Base URL',
      required: true,
      type: LlmProviderFieldType.String,
      secret: false,
    },
    {
      key: 'llmKey',
      label: 'LLM API Key',
      required: false,
      type: LlmProviderFieldType.String,
      secret: true,
    },
    {
      key: 'headers',
      label: 'Custom headers',
      required: false,
      type: LlmProviderFieldType.HttpHeaders,
    },
  ],
};

export interface LlmConnectivityServiceData {
  definitions: LlmProviderDefinition[];
  providers: LlmProvider[];
  selections: LlmProviderSelection[];
}

export const LlmConnectivityServiceDefaultDataset: LlmConnectivityServiceData = {
  definitions: [CUSTOM_PROXY_DEFINITION],
  providers: [SONAR_PROVIDER],
  selections: [],
};

const INCOMPATIBLE_PROVIDER_MESSAGE = 'This provider is not compatible with this AI capability.';

function isHttpHeaders(value: unknown): value is LlmHttpHeaderWrite[] {
  return Array.isArray(value);
}

function stripSecrets(
  configuration: LlmProviderConfigurationWrite,
  definition: LlmProviderDefinition | undefined,
): LlmProviderConfiguration {
  return Object.fromEntries(
    Object.entries(configuration).flatMap<[string, LlmProviderConfigurationValue]>(
      ([key, value]) => {
        if (isHttpHeaders(value)) {
          const headers: LlmHttpHeader[] = value.map(({ name, secret, value: headerValue }) => ({
            name,
            secret,
            value: secret ? '' : (headerValue ?? ''),
          }));
          return [[key, headers]];
        }

        const field = definition?.fields.find((field) => field.key === key);
        return field?.secret === true ? [] : [[key, value]];
      },
    ),
  );
}

export default class LlmConnectivityServiceMock extends AbstractServiceMock<LlmConnectivityServiceData> {
  #connectionFailureMessage: string | undefined;
  #deleteBlockedMessage: string | undefined;
  #definitionsFailureMessage: string | undefined;
  #mappingFailureMessage: string | undefined;
  #nextId = 1;
  #providersFailureMessage: string | undefined;

  lastUpdateRequest: { data: LlmProviderUpdate; id: string } | undefined;

  get providers() {
    return this.data.providers;
  }

  get selections() {
    return this.data.selections;
  }

  setProviders = (providers: LlmProvider[]) => {
    this.data.providers = cloneDeep(providers);
  };

  setSelection = (selection: LlmProviderSelection) => {
    this.data.selections = [
      ...this.data.selections.filter(
        (currentSelection) => currentSelection.aiCapability !== selection.aiCapability,
      ),
      cloneDeep(selection),
    ];
  };

  fillToLimit = () => {
    this.data.providers = Array.from({ length: MAX_LLM_PROVIDERS }, (_, index) =>
      this.buildCustomProxy(index),
    );
  };

  setConnectionFailure = (message: string) => {
    this.#connectionFailureMessage = message;
  };

  setDeleteBlocked = (message: string) => {
    this.#deleteBlockedMessage = message;
  };

  setDefinitionsFailure = (message: string | undefined) => {
    this.#definitionsFailureMessage = message;
  };

  setProvidersFailure = (message: string | undefined) => {
    this.#providersFailureMessage = message;
  };

  setMappingFailure = (message: string = INCOMPATIBLE_PROVIDER_MESSAGE) => {
    this.#mappingFailureMessage = message;
  };

  buildCustomProxy = (index: number): LlmProvider => ({
    id: `custom-proxy-${index}`,
    provider: LlmProviderType.CustomProxy,
    label: `Company proxy ${index}`,
    configuration: { endpoint: `https://llm-${index}.internal.example.com/v1` },
  });

  override reset() {
    super.reset();
    this.#connectionFailureMessage = undefined;
    this.#deleteBlockedMessage = undefined;
    this.#definitionsFailureMessage = undefined;
    this.#mappingFailureMessage = undefined;
    this.#nextId = 1;
    this.#providersFailureMessage = undefined;
    this.lastUpdateRequest = undefined;
  }

  handlers = [
    http.get(LLM_PROVIDER_DEFINITIONS_PATH, () =>
      this.#definitionsFailureMessage === undefined
        ? this.ok({ providerDefinitions: this.data.definitions })
        : this.errorsWithStatus(HttpStatus.BadRequest, this.#definitionsFailureMessage),
    ),

    http.get(LLM_PROVIDERS_PATH, ({ request }) => {
      if (this.#providersFailureMessage !== undefined) {
        return this.errorsWithStatus(HttpStatus.BadRequest, this.#providersFailureMessage);
      }

      const aiCapability = this.getQueryParams(request).get('aiCapability');
      const providers =
        aiCapability === null || aiCapability === AiCapability.AiCodefix
          ? this.data.providers
          : this.data.providers.filter((provider) => provider.provider !== LlmProviderType.Sonar);

      return this.ok({ providers });
    }),

    http.get(LLM_PROVIDER_MAPPINGS_PATH, ({ request }) => {
      const aiCapability = this.getQueryParams(request).get('aiCapability');
      const providerMappings =
        aiCapability === null
          ? this.data.selections
          : this.data.selections.filter((selection) => selection.aiCapability === aiCapability);

      return this.ok({ providerMappings });
    }),

    http.post(LLM_PROVIDER_MAPPINGS_PATH, async ({ request }) => {
      if (this.#mappingFailureMessage !== undefined) {
        return this.badRequest(this.#mappingFailureMessage);
      }

      const data = (await request.json()) as LlmProviderSelectionUpsert;
      const selection: LlmProviderSelection = {
        aiCapability: data.aiCapability,
        llmProviderId: data.llmProviderId,
        modelIdentifier: data.modelIdentifier,
      };
      this.setSelection(selection);

      return this.ok(selection);
    }),

    http.post(LLM_PROVIDERS_PATH, async ({ request }) => {
      if (this.#connectionFailureMessage !== undefined) {
        return this.badRequest(this.#connectionFailureMessage);
      }

      if (this.data.providers.length >= MAX_LLM_PROVIDERS) {
        return this.badRequest(`You've reached the limit of ${MAX_LLM_PROVIDERS} providers.`);
      }

      const data = (await request.json()) as LlmProviderCreate;
      const definition = this.data.definitions.find(
        (definition) => definition.provider === data.provider,
      );
      const created: LlmProvider = {
        id: `llm-provider-${this.#nextId}`,
        provider: data.provider,
        label: data.label,
        configuration: stripSecrets(data.configuration, definition),
      };
      this.#nextId += 1;
      this.data.providers.push(created);

      return this.ok(created);
    }),

    http.patch(`${LLM_PROVIDERS_PATH}/:id`, async ({ params, request }) => {
      const id = String(params.id);
      const data = (await request.json()) as LlmProviderUpdate;
      this.lastUpdateRequest = { data, id };

      if (this.#connectionFailureMessage !== undefined) {
        return this.badRequest(this.#connectionFailureMessage);
      }

      const existing = this.data.providers.find((provider) => provider.id === id);
      if (existing === undefined || existing.provider === LlmProviderType.Sonar) {
        return this.badRequest('This provider cannot be modified.');
      }

      const definition = this.data.definitions.find(
        (definition) => definition.provider === existing.provider,
      );
      const updated: LlmProvider = {
        ...existing,
        label: data.label,
        configuration: stripSecrets(
          { ...existing.configuration, ...data.configuration },
          definition,
        ),
      };
      this.data.providers = this.data.providers.map((provider) =>
        provider.id === id ? updated : provider,
      );

      return this.ok(updated);
    }),

    http.delete(`${LLM_PROVIDERS_PATH}/:id`, ({ params }) => {
      if (this.#deleteBlockedMessage !== undefined) {
        return this.badRequest(this.#deleteBlockedMessage);
      }

      const id = String(params.id);
      const existing = this.data.providers.find((provider) => provider.id === id);
      if (existing === undefined || existing.provider === LlmProviderType.Sonar) {
        return this.badRequest('This provider cannot be deleted.');
      }

      this.data.providers = this.data.providers.filter((provider) => provider.id !== id);
      return new HttpResponse(null, { status: HttpStatus.NoContent });
    }),
  ];

  private badRequest(message: string) {
    return HttpResponse.json({ message }, { status: HttpStatus.BadRequest });
  }
}
