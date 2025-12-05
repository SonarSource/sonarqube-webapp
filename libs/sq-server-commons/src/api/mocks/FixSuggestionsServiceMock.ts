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
  getFixSuggestionServiceInfo,
  getFixSuggestionsIssues,
  getLlmProviders,
  getSuggestions,
  ServiceInfo,
  SuggestionServiceStatus,
  updateFeatureEnablement,
} from '../fix-suggestions';
import { ISSUE_101, ISSUE_1101 } from './data/ids';

jest.mock('../fix-suggestions');

export type MockFixSuggestionServiceInfo = {
  status: SuggestionServiceStatus | 'WTF';
};

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
    provider: {
      key: 'OPENAI',
      modelKey: 'gpt-3.5-turbo',
    },
  };

  serviceInfo: MockFixSuggestionServiceInfo | undefined = {
    status: 'SUCCESS',
  };

  constructor() {
    jest.mocked(getSuggestions).mockImplementation(this.handleGetFixSuggestion);
    jest.mocked(getFixSuggestionsIssues).mockImplementation(this.handleGetFixSuggestionsIssues);
    jest.mocked(getFixSuggestionServiceInfo).mockImplementation(this.handleGetServiceInfo);
    jest.mocked(updateFeatureEnablement).mockImplementation(this.handleUpdateFeatureEnablement);
    jest.mocked(getFeatureEnablement).mockImplementation(this.handleGetFeatureEnablement);
    jest.mocked(getLlmProviders).mockImplementation(this.handleGetLlmProviders);
  }

  reset = () => {
    this.serviceInfo = {
      status: 'SUCCESS',
    };
    this.featureEnablement = {
      enablement: AiCodeFixFeatureEnablement.allProjects,
      enabledProjectKeys: [],
      provider: {
        key: 'OPENAI',
        modelKey: 'gpt-3.5-turbo',
      },
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

  handleGetServiceInfo = () => {
    if (this.serviceInfo) {
      return this.reply(this.serviceInfo as ServiceInfo);
    }
    return Promise.reject(new Error('Error'));
  };

  handleGetFeatureEnablement = () => {
    return this.reply(this.featureEnablement);
  };

  handleUpdateFeatureEnablement = (f: AIFeatureEnablement) => {
    this.featureEnablement = f;
    return Promise.resolve();
  };

  handleGetLlmProviders = () => {
    return this.reply([
      {
        key: 'OPENAI',
        name: 'OpenAI',
        models: [
          {
            key: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            recommended: true,
          },
          {
            key: 'gpt-3.5',
            name: 'GPT-3.5',
            recommended: false,
          },
        ],
        selfHosted: false,
        recommended: true,
      },
      {
        key: 'AZURE_OPENAI',
        name: 'Azure OpenAI',
        selfHosted: true,
        recommended: false,
      },
      {
        key: 'ANTHROPIC',
        name: 'Anthropic',
        selfHosted: false,
        models: [
          {
            key: 'davinci',
            name: 'Davinci',
            recommended: false,
          },
          {
            key: 'curie',
            name: 'Curie',
            recommended: false,
          },
        ],
      },
    ]);
  };

  disableForAllProject() {
    this.featureEnablement = {
      enablement: AiCodeFixFeatureEnablement.disabled as const,
      enabledProjectKeys: null,
      provider: null,
    };
  }

  enableSomeProject(key: string) {
    this.featureEnablement = {
      enablement: AiCodeFixFeatureEnablement.someProjects as const,
      enabledProjectKeys: [key],
      provider: { key: 'OPENAI', modelKey: 'gpt-3.5-turbo' },
    };
  }

  enableAllProjectWithAzureProvider() {
    this.featureEnablement = {
      enablement: AiCodeFixFeatureEnablement.allProjects as const,
      enabledProjectKeys: null,
      provider: { key: 'AZURE_OPENAI', endpoint: 'http://localhost:8080', modelKey: null },
    };
  }

  reply<T>(response: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(cloneDeep(response));
      }, 10);
    });
  }

  setServiceInfo(info: MockFixSuggestionServiceInfo | undefined) {
    this.serviceInfo = info;
  }
}
