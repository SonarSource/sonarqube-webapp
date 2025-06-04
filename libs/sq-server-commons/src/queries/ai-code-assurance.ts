/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import { noop } from 'lodash';
import { createQueryHook } from '~shared/queries/common';
import {
  getProjectBranchesAiCodeAssuranceStatus,
  getProjectContainsAiCode,
  getProjectDetectedAiCode,
  setProjectAiGeneratedCode,
} from '../api/ai-code-assurance';
import { Component } from '../types/types';
import { invalidateProjectsListQuery } from './projects';

export const AI_CODE_ASSURANCE_QUERY_PREFIX = 'project-ai-code-assurance';

export const useProjectBranchesAiCodeAssuranceStatusQuery = createQueryHook(
  ({ project, branch }: { branch?: string; project: Component }) => {
    return queryOptions({
      queryKey: [
        AI_CODE_ASSURANCE_QUERY_PREFIX,
        project.key,
        'code-assurance',
        'branch',
        branch,
      ] as const,
      queryFn: ({ queryKey: [_1, project, _2, _3, branch] }) =>
        getProjectBranchesAiCodeAssuranceStatus(project, branch),
    });
  },
);

export const useProjectContainsAiCodeQuery = createQueryHook(
  ({ project }: { project: Component }) => {
    return queryOptions({
      queryKey: [AI_CODE_ASSURANCE_QUERY_PREFIX, project.key, 'containsAiCode'],
      queryFn: ({ queryKey: [_, projectKey] }) => getProjectContainsAiCode(projectKey),
    });
  },
);

export const useProjectDetectedAiCodeQuery = createQueryHook(
  ({ project }: { project: Component }) => {
    return queryOptions({
      queryKey: [AI_CODE_ASSURANCE_QUERY_PREFIX, project.key, 'detectedAiCode'],
      queryFn: ({ queryKey: [_, projectKey] }) => getProjectDetectedAiCode(projectKey),
    });
  },
);

export function useProjectAiGeneratedCodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ project, isAiGeneratedCode }: { isAiGeneratedCode: boolean; project: string }) =>
      setProjectAiGeneratedCode(project, isAiGeneratedCode),
    onSuccess: (_, { project }) => {
      queryClient
        .invalidateQueries({ queryKey: [AI_CODE_ASSURANCE_QUERY_PREFIX, project] })
        .catch(noop);
      invalidateProjectsListQuery(queryClient);
    },
  });
}
