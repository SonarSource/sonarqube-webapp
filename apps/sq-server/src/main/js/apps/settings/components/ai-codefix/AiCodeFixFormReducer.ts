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

import { AIFeatureEnablement } from '~sq-server-commons/api/fix-suggestions';
import { Project } from '~sq-server-commons/api/project-management';
import {
  SelectListFilter,
  SelectListSearchParams,
} from '~sq-server-commons/components/controls/SelectList';
import { CustomHeader, getProviderKey, Provider } from '~sq-server-commons/queries/fix-suggestions';
import { AiCodeFixFeatureEnablement } from '~sq-server-commons/types/fix-suggestions';

type DispatchMessage =
  | {
      projects: Project[];
      searchParams: SelectListSearchParams;
      type: 'filter';
    }
  | { projectKey: string; type: 'select' }
  | { projectKey: string; type: 'unselect' }
  | { type: 'toggle-enablement' }
  | { type: 'switch-enablement' }
  | { providerKey: string; type: 'selectProvider' }
  | { configKey: string; type: 'setProviderConfig'; value: string }
  | { type: 'addHeader' }
  | { index: number; type: 'removeHeader' }
  | { field: keyof CustomHeader; index: number; type: 'updateHeader'; value: string | boolean }
  | { initialEnablement: AIFeatureEnablement; projects: Project[]; type: 'cancel' }
  | { initialEnablement: AIFeatureEnablement; projects: Project[]; type: 'initialize' };

export interface FormState {
  enabledProjectKeys: string[] | null;
  enablement: AiCodeFixFeatureEnablement;
  projectsToDisplay: string[];
  providers: Provider[];
  selectedProviderKey: string | null;
}

function deriveSelection(providers: Provider[]): string | null {
  const selected = providers.find((p) => p.selected);
  return selected ? getProviderKey(selected) : null;
}

function getRecommendedProviderKey(providers: Provider[]): string | null {
  const recommended = providers.find((p) => p.recommended === true);
  const provider = recommended ?? providers[0];
  return provider ? getProviderKey(provider) : null;
}

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

      if (enablement === AiCodeFixFeatureEnablement.disabled) {
        return {
          ...formState,
          enablement,
          enabledProjectKeys: null,
          selectedProviderKey: null,
          providers: formState.providers.map((p) => ({ ...p, selected: false })),
        };
      }

      const recommendedKey = getRecommendedProviderKey(formState.providers);

      return {
        ...formState,
        enablement,
        enabledProjectKeys: formState.enabledProjectKeys ?? [],
        selectedProviderKey: recommendedKey,
        providers: formState.providers.map((p) => ({
          ...p,
          selected: getProviderKey(p) === recommendedKey,
        })),
      };
    }
    case 'initialize':
    case 'cancel': {
      const { providers } = action.initialEnablement;
      return {
        ...formState,
        enablement: action.initialEnablement.enablement,
        providers,
        enabledProjectKeys: action.initialEnablement.enabledProjectKeys,
        selectedProviderKey: deriveSelection(providers),
        projectsToDisplay:
          action.initialEnablement.enablement === AiCodeFixFeatureEnablement.someProjects
            ? action.projects.map((p) => p.key)
            : [],
      };
    }
    case 'selectProvider':
      return {
        ...formState,
        selectedProviderKey: action.providerKey,
        providers: formState.providers.map((p) => ({
          ...p,
          selected: getProviderKey(p) === action.providerKey,
        })),
      };
    case 'setProviderConfig': {
      return {
        ...formState,
        providers: formState.providers.map((p) =>
          getProviderKey(p) === formState.selectedProviderKey
            ? { ...p, config: { ...p.config, [action.configKey]: action.value } }
            : p,
        ),
      };
    }
    case 'addHeader': {
      return {
        ...formState,
        providers: formState.providers.map((p) =>
          getProviderKey(p) === formState.selectedProviderKey
            ? { ...p, headers: [...(p.headers ?? []), { name: '', value: '', secret: false }] }
            : p,
        ),
      };
    }
    case 'removeHeader': {
      return {
        ...formState,
        providers: formState.providers.map((p) => {
          if (getProviderKey(p) !== formState.selectedProviderKey) {
            return p;
          }
          const headers = [...(p.headers ?? [])];
          headers.splice(action.index, 1);
          return { ...p, headers };
        }),
      };
    }
    case 'updateHeader': {
      return {
        ...formState,
        providers: formState.providers.map((p) => {
          if (getProviderKey(p) !== formState.selectedProviderKey) {
            return p;
          }
          const headers = (p.headers ?? []).map((h, i) =>
            i === action.index ? { ...h, [action.field]: action.value } : h,
          );
          return { ...p, headers };
        }),
      };
    }
    case 'switch-enablement':
      return {
        ...formState,
        enabledProjectKeys: [],
        enablement:
          formState.enablement === AiCodeFixFeatureEnablement.allProjects
            ? AiCodeFixFeatureEnablement.someProjects
            : AiCodeFixFeatureEnablement.allProjects,
      };
  }
}
