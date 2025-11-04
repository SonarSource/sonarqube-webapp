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

import { AIFeatureEnablement, LLMOption } from '~sq-server-commons/api/fix-suggestions';
import { Project } from '~sq-server-commons/api/project-management';
import {
  SelectListFilter,
  SelectListSearchParams,
} from '~sq-server-commons/components/controls/SelectList';
import { AiCodeFixFeatureEnablement } from '~sq-server-commons/types/fix-suggestions';

type DispatchMessage =
  | {
      projects: Project[];
      searchParams: SelectListSearchParams;
      type: 'filter';
    }
  | { projectKey: string; type: 'select' }
  | { projectKey: string; type: 'unselect' }
  | { recommendedProvider?: LLMOption; type: 'toggle-enablement' }
  | { type: 'switch-enablement' }
  | { modelKey: string; providerKey: string; type: 'selectProvider' }
  | { provider: Partial<LLMOption>; type: 'setProvider' }
  | { initialEnablement: AIFeatureEnablement; projects: Project[]; type: 'cancel' }
  | { initialEnablement: AIFeatureEnablement; projects: Project[]; type: 'initialize' };

export type FormState =
  | {
      enabledProjectKeys: string[] | null;
      enablement: AiCodeFixFeatureEnablement.allProjects | AiCodeFixFeatureEnablement.someProjects;
      projectsToDisplay: string[];
      provider: Partial<LLMOption>;
    }
  | {
      enabledProjectKeys: null;
      enablement: AiCodeFixFeatureEnablement.disabled;
      projectsToDisplay: string[];
      provider: null;
    };

export function formReducer(formState: FormState, action: DispatchMessage): FormState {
  switch (action.type) {
    case 'filter': {
      const filteredProjects = action.searchParams.query
        ? action.projects.filter((p) =>
            `${p.key}@${p.name}`.toLowerCase().includes(action.searchParams.query.toLowerCase()),
          )
        : action.projects;

      const projectsToDisplay = filteredProjects
        .filter((p) => {
          switch (action.searchParams.filter) {
            case SelectListFilter.Selected:
              return formState.enabledProjectKeys?.includes(p.key);
            case SelectListFilter.Unselected:
              return !formState.enabledProjectKeys?.includes(p.key);
            default:
              return true;
          }
        })
        .map((p) => p.key);
      return {
        ...formState,
        projectsToDisplay,
      };
    }
    case 'select':
      if (formState.enablement === AiCodeFixFeatureEnablement.disabled) {
        return formState;
      }
      return {
        ...formState,
        enabledProjectKeys: [...(formState.enabledProjectKeys ?? []), action.projectKey],
      };
    case 'unselect':
      if (formState.enablement === AiCodeFixFeatureEnablement.disabled) {
        return formState;
      }
      return {
        ...formState,
        enabledProjectKeys:
          formState.enabledProjectKeys?.filter((key) => key !== action.projectKey) ?? [],
      };
    case 'toggle-enablement': {
      const enablement =
        formState.enablement === AiCodeFixFeatureEnablement.disabled
          ? AiCodeFixFeatureEnablement.allProjects
          : AiCodeFixFeatureEnablement.disabled;
      const enabledProjectKeys =
        enablement === AiCodeFixFeatureEnablement.disabled
          ? null
          : (formState.enabledProjectKeys ?? []);
      const provider =
        enablement === AiCodeFixFeatureEnablement.disabled
          ? null
          : (formState.provider ??
            action.recommendedProvider ?? { key: 'OPENAI', modelKey: 'OPENAI_GPT_4O' });
      return {
        ...formState,
        enablement,
        enabledProjectKeys,
        provider,
      } as FormState;
    }
    case 'initialize':
    case 'cancel':
      return {
        ...formState,
        enablement: action.initialEnablement.enablement,
        provider: action.initialEnablement.provider,
        enabledProjectKeys: action.initialEnablement.enabledProjectKeys,
        projectsToDisplay:
          action.initialEnablement.enablement === AiCodeFixFeatureEnablement.someProjects
            ? action.projects.map((p) => p.key)
            : [],
      } as FormState;
    case 'selectProvider':
      return {
        ...formState,
        provider: {
          ...formState.provider,
          key: action.providerKey,
          modelKey: action.modelKey,
        },
      } as FormState;
    case 'setProvider':
      return {
        ...formState,
        provider: action.provider,
      } as FormState;
    case 'switch-enablement':
      return {
        ...formState,
        enabledProjectKeys: [],
        enablement:
          formState.enablement === AiCodeFixFeatureEnablement.allProjects
            ? AiCodeFixFeatureEnablement.someProjects
            : AiCodeFixFeatureEnablement.allProjects,
      } as FormState;
  }
}
