/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
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

import { queryOptions } from '@tanstack/react-query';
import { ComponentQualifier } from '~sonar-aligned/types/component';
import {
  getProjectBranchesAiCodeAssuranceStatus,
  getProjectContainsAiCode,
} from '../api/ai-code-assurance';
import { useAvailableFeatures } from '../app/components/available-features/withAvailableFeatures';
import { Feature } from '../types/features';
import { Component } from '../types/types';
import { createQueryHook } from './common';

export const AI_CODE_ASSURANCE_QUERY_PREFIX = 'project-ai-code-assurance';

export const useProjectBranchesAiCodeAssuranceStatusQuery = createQueryHook(
  ({ project, branch }: { branch?: string; project: Component }) => {
    const { hasFeature } = useAvailableFeatures();

    return queryOptions({
      queryKey: [AI_CODE_ASSURANCE_QUERY_PREFIX, project.key, 'branch', branch] as const, // - or _ ?
      queryFn: ({ queryKey: [_1, project, _2, branch] }) =>
        getProjectBranchesAiCodeAssuranceStatus(project, branch),
      enabled:
        project.qualifier === ComponentQualifier.Project && hasFeature(Feature.AiCodeAssurance),
    });
  },
);

export const useProjectContainsAiCodeQuery = createQueryHook(
  ({ project }: { project: Component }) => {
    const { hasFeature } = useAvailableFeatures();

    return queryOptions({
      queryKey: [AI_CODE_ASSURANCE_QUERY_PREFIX, project.key],
      queryFn: ({ queryKey: [_, projectKey] }) => getProjectContainsAiCode(projectKey),
      enabled:
        project.qualifier === ComponentQualifier.Project && hasFeature(Feature.AiCodeAssurance),
    });
  },
);
