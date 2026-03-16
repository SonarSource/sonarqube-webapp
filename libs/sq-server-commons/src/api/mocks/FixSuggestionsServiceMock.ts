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
import { AiCodeFixFeatureEnablement } from '../../types/fix-suggestions';
import {
  AIFeatureEnablement,
  FixParam,
  getFeatureEnablement,
  getFixSuggestionsIssues,
  getProviderKey,
  getSuggestions,
  Provider,
  updateFeatureEnablement,
  UpdateFeatureEnablementParams,
} from '../fix-suggestions';
import { ISSUE_101, ISSUE_1101 } from './data/ids';

jest.mock('../fix-suggestions', () => {
  const actual: typeof import('../fix-suggestions') = jest.requireActual('../fix-suggestions');
  return {
    ...actual,
    getFeatureEnablement: jest.fn(),
    getFixSuggestionServiceInfo: jest.fn(),
    getFixSuggestionsIssues: jest.fn(),
    getSuggestions: jest.fn(),
    updateFeatureEnablement: jest.fn(),
  };
});

export const DEFAULT_PROVIDERS: Provider[] = [
  {
    name: 'OpenAI - GPT-5.1',
    type: 'OPENAI',
    config: {},
    headers: null,
    model: 'GPT-5.1',
    recommended: true,
    selected: true,
    selfHosted: false,
  },
  {
    name: 'OpenAI - GPT-5',
    type: 'OPENAI',
    config: {},
    headers: null,
    model: 'GPT-5',
    recommended: false,
    selected: false,
    selfHosted: false,
  },
  {
    name: 'Azure OpenAI',
    type: 'AZURE_OPENAI',
    config: { endpoint: '', apiKey: '' },
    headers: null,
    model: null,
    recommended: null,
    selected: false,
    selfHosted: true,
  },
  {
    name: 'AWS BedRock',
    type: 'AWS_BEDROCK',
    config: { region: '', modelId: '' },
    headers: null,
    model: null,
    recommended: null,
    selected: false,
    selfHosted: true,
  },
  {
    name: 'Custom',
    type: 'CUSTOM',
    config: { endpoint: '', modelId: '' },
    headers: null,
    model: null,
    recommended: null,
    selected: false,
    selfHosted: true,
  },
];

export default class FixSuggestionsServiceMock {
  fixSuggestion = {
    id: '70b14d4c-d302-4979-9121-06ac7d563c5c',
    issueId: 'AYsVhClEbjXItrbcN71J',
    explanation:
      "Replaced 'require' statements with 'import' statements to comply with ECMAScript 2015 module management standards.",
    changes: [
      {
        startLine: 6,
        endLine: 7,
        newCode: "import { glob } from 'glob';\nimport fs from 'fs';",
      },
    ],
  };

  featureEnablement: AIFeatureEnablement = {
    enablement: AiCodeFixFeatureEnablement.allProjects,
    enabledProjectKeys: [],
    providers: cloneDeep(DEFAULT_PROVIDERS),
  };

  constructor() {
    jest.mocked(getSuggestions).mockImplementation(this.handleGetFixSuggestion);
    jest.mocked(getFixSuggestionsIssues).mockImplementation(this.handleGetFixSuggestionsIssues);
    jest.mocked(updateFeatureEnablement).mockImplementation(this.handleUpdateFeatureEnablement);
    jest.mocked(getFeatureEnablement).mockImplementation(this.handleGetFeatureEnablement);
  }

  reset = () => {
    this.featureEnablement = {
      enablement: AiCodeFixFeatureEnablement.allProjects,
      enabledProjectKeys: [],
      providers: cloneDeep(DEFAULT_PROVIDERS),
    };
  };

  handleGetFixSuggestionsIssues = (data: FixParam) => {
    if (data.issueId === ISSUE_1101) {
      return this.reply({
        aiSuggestion: 'NOT_AVAILABLE_FILE_LEVEL_ISSUE',
        id: 'id1',
      } as const);
    }
    return this.reply({ aiSuggestion: 'AVAILABLE', id: 'id1' } as const);
  };

  handleGetFixSuggestion = (data: FixParam) => {
    if (data.issueId === ISSUE_101) {
      return Promise.reject({ error: { msg: 'Invalid issue' } });
    }
    return this.reply(this.fixSuggestion);
  };

  handleGetFeatureEnablement = () => {
    return this.reply(this.featureEnablement);
  };

  handleUpdateFeatureEnablement = (f: UpdateFeatureEnablementParams) => {
    if (f.provider === null) {
      this.featureEnablement = {
        enablement: f.enablement,
        enabledProjectKeys: f.enabledProjectKeys ?? null,
        providers: this.featureEnablement.providers.map((p) => ({ ...p, selected: false })),
      } as AIFeatureEnablement;
      return Promise.resolve();
    }

    const { provider } = f;
    const savedKey = getProviderKey({
      type: provider.type,
      model: provider.model ?? null,
    });
    this.featureEnablement = {
      enablement: f.enablement,
      enabledProjectKeys: f.enabledProjectKeys ?? null,
      providers: this.featureEnablement.providers.map((p) => ({
        ...p,
        selected: getProviderKey(p) === savedKey,
        config: getProviderKey(p) === savedKey ? { ...p.config, ...provider.config } : p.config,
        headers: getProviderKey(p) === savedKey ? (provider.headers ?? p.headers) : p.headers,
      })),
    } as AIFeatureEnablement;
    return Promise.resolve();
  };

  disableForAllProject() {
    this.featureEnablement = {
      enablement: AiCodeFixFeatureEnablement.disabled,
      enabledProjectKeys: null,
      providers: cloneDeep(DEFAULT_PROVIDERS).map((p) => ({ ...p, selected: false })),
    };
  }

  enableSomeProject(key: string) {
    this.featureEnablement = {
      enablement: AiCodeFixFeatureEnablement.someProjects,
      enabledProjectKeys: [key],
      providers: cloneDeep(DEFAULT_PROVIDERS),
    };
  }

  enableAllProjectWithCustomProvider() {
    this.featureEnablement = {
      enablement: AiCodeFixFeatureEnablement.allProjects,
      enabledProjectKeys: null,
      providers: cloneDeep(DEFAULT_PROVIDERS).map((p) => ({
        ...p,
        selected: p.type === 'CUSTOM',
        config:
          p.type === 'CUSTOM'
            ? { endpoint: 'http://localhost:8080', modelId: 'my-model' }
            : p.config,
        headers:
          p.type === 'CUSTOM' ? [{ name: 'X-Api-Key', value: '****', secret: true }] : p.headers,
      })),
    };
  }

  enableAllProjectWithAzureProvider() {
    this.featureEnablement = {
      enablement: AiCodeFixFeatureEnablement.allProjects,
      enabledProjectKeys: null,
      providers: cloneDeep(DEFAULT_PROVIDERS).map((p) => ({
        ...p,
        selected: p.type === 'AZURE_OPENAI',
        config:
          p.type === 'AZURE_OPENAI'
            ? { endpoint: 'http://localhost:8080', apiKey: '****' }
            : p.config,
      })),
    };
  }

  reply<T>(response: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(cloneDeep(response));
      }, 10);
    });
  }
}
