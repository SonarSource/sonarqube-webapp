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

import { throwGlobalError } from '~adapters/helpers/error';
import { getJSON } from '~adapters/helpers/request';
import { BranchParameters } from '~shared/types/branch-like';
import { ComponentQualifier, Visibility } from '~shared/types/component';
import { Metric } from '~shared/types/measures';
import { Paging } from '~shared/types/paging';
import { post, RequestData } from '../helpers/request';
import {
  ComponentMeasure,
  DuplicatedFile,
  Duplication,
  MyProject,
  SourceViewerFile,
} from '../types/types';
import { AiCodeAssuranceStatus } from './ai-code-assurance';

export interface BaseSearchProjectsParameters {
  analyzedBefore?: string;
  onProvisionedOnly?: boolean;
  projects?: string;
  q?: string;
  qualifiers?: string;
  visibility?: Visibility;
}

export interface ProjectBase {
  key: string;
  name: string;
  qualifier: string;
  visibility: Visibility;
}

export interface ComponentRaw {
  aiCodeAssurance?: AiCodeAssuranceStatus;
  analysisDate?: string;
  containsAiCode?: boolean;
  isAiCodeFixEnabled?: boolean;
  isFavorite?: boolean;
  key: string;
  leakPeriodDate?: string;
  name: string;
  needIssueSync?: boolean;
  qualifier: ComponentQualifier;
  tags: string[];
  uuid?: string;
  visibility: Visibility;
}

export function searchProjectTags(data?: { ps?: number; q?: string }): Promise<any> {
  return getJSON('/api/project_tags/search', data).catch(throwGlobalError);
}

export function setApplicationTags(data: { application: string; tags: string }): Promise<void> {
  return post('/api/applications/set_tags', data);
}

export function setProjectTags(data: { project: string; tags: string }): Promise<void> {
  return post('/api/project_tags/set', data);
}

export function getComponentTree(
  strategy: string,
  component: string,
  metrics: string[] = [],
  additional: RequestData = {},
): Promise<{
  baseComponent: ComponentMeasure;
  components: ComponentMeasure[];
  metrics: Metric[];
  paging: Paging;
}> {
  const url = '/api/measures/component_tree';
  const data = {
    ...additional,
    component,
    metricKeys: metrics.join(','),
    strategy,
  };
  return getJSON(url, data).catch(throwGlobalError);
}

export function getComponent(
  data: { component: string; metricKeys: string } & BranchParameters,
): Promise<{ component: ComponentMeasure }> {
  return getJSON('/api/measures/component', data);
}

export function getComponentData(data: { component: string } & BranchParameters): Promise<{
  ancestors: Array<Omit<ComponentRaw, 'tags'>>;
  component: Omit<ComponentRaw, 'tags'>;
}> {
  return getJSON('/api/components/show', data);
}

export function doesComponentExists(
  data: { component: string } & BranchParameters,
): Promise<boolean> {
  return getComponentData(data).then(
    ({ component }) => component !== undefined,
    () => false,
  );
}

export function getComponentShow(data: { component: string } & BranchParameters): Promise<any> {
  return getComponentData(data).catch(throwGlobalError);
}

export function getBreadcrumbs(
  data: { component: string } & BranchParameters,
): Promise<Array<Omit<ComponentRaw, 'tags'>>> {
  return getComponentShow(data).then((r) => {
    const reversedAncestors = [...r.ancestors].reverse();
    return [...reversedAncestors, r.component];
  });
}

export function getMyProjects(data: {
  p?: number;
  ps?: number;
}): Promise<{ paging: Paging; projects: MyProject[] }> {
  return getJSON('/api/projects/search_my_projects', data);
}

export interface Facet {
  property: string;
  values: Array<{ count: number; val: string }>;
}

export function searchProjects(data: RequestData): Promise<{
  components: ComponentRaw[];
  facets: Facet[];
  paging: Paging;
}> {
  const url = '/api/components/search_projects';
  return getJSON(url, data);
}

export function searchComponents(data?: {
  ps?: number;
  q?: string;
  qualifiers?: string;
}): Promise<any> {
  return getJSON('/api/components/search', data);
}

export function changeKey(data: { from: string; to: string }) {
  return post('/api/projects/update_key', data).catch(throwGlobalError);
}

export interface SuggestionsResponse {
  projects: Array<{ key: string; name: string }>;
  results: Array<{
    items: Array<{
      isFavorite: boolean;
      isRecentlyBrowsed: boolean;
      key: string;
      match: string;
      name: string;
      project: string;
    }>;
    more: number;
    q: string;
  }>;
  warning?: string;
}

export function getSuggestions(
  query?: string,
  recentlyBrowsed?: string[],
  more?: string,
): Promise<SuggestionsResponse> {
  const data: RequestData = {};
  if (query) {
    data.s = query;
  }
  if (recentlyBrowsed) {
    data.recentlyBrowsed = recentlyBrowsed.join();
  }
  if (more) {
    data.more = more;
  }
  return getJSON('/api/components/suggestions', data).catch(throwGlobalError);
}

export function getComponentForSourceViewer(
  data: { component: string } & BranchParameters,
): Promise<SourceViewerFile> {
  return getJSON('/api/components/app', data);
}

export function getDuplications(
  data: { key: string } & BranchParameters,
): Promise<{ duplications: Duplication[]; files: Record<string, DuplicatedFile> }> {
  return getJSON('/api/duplications/show', data).catch(throwGlobalError);
}

export function getTests(
  data: {
    sourceFileKey: string;
    sourceFileLineNumber: number | string;
  } & BranchParameters,
): Promise<any> {
  return getJSON('/api/tests/list', data).then((r) => r.tests);
}

export interface ProjectResponse {
  key: string;
  name: string;
}

export function getScannableProjects(): Promise<{
  projects: ProjectResponse[];
}> {
  return getJSON('/api/projects/search_my_scannable_projects').catch(throwGlobalError);
}

export { getDirectories, getFiles, getTree } from '~shared/api/components';
