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

import {
  infiniteQueryOptions,
  QueryClient,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { createInfiniteQueryHook, createQueryHook, StaleTime } from '~shared/queries/common';
import { getScannableProjects, searchProjects } from '../api/components';
import { deleteProject } from '../api/project-management';
import { convertToQueryData, defineFacets } from '../helpers/projects';
import { getNextPagingParam } from '../helpers/react-query';
import { RequestData } from '../helpers/request';
import { ProjectsQuery } from '../types/projects';
import { removeMeasuresByComponentKey } from './measures';

export const PROJECTS_PAGE_SIZE = 50;

export const projectsQueryKeys = {
  all: () => ['project'] as const,
  allList: () => [...projectsQueryKeys.all(), 'list'] as const,
  list: (data?: RequestData) => [...projectsQueryKeys.allList(), data] as const,
  details: (key: string) => [...projectsQueryKeys.all(), 'details', key] as const,
  scannable: () => [...projectsQueryKeys.all(), 'my-scannable'] as const,
};

export const useProjectsQuery = createInfiniteQueryHook(
  ({
    isFavorite,
    query,
    pageIndex = 1,
    isStandardMode,
  }: {
    isFavorite: boolean;
    isStandardMode: boolean;
    pageIndex?: number;
    query: ProjectsQuery;
  }) => {
    const queryClient = useQueryClient();
    const data = convertToQueryData(query, isFavorite, isStandardMode, {
      ps: PROJECTS_PAGE_SIZE,
      facets: defineFacets(query, isStandardMode).join(),
      f: 'analysisDate,leakPeriodDate',
    });

    return infiniteQueryOptions({
      queryKey: projectsQueryKeys.list(data),
      queryFn: ({ pageParam: pageIndex }) => {
        return searchProjects({ ...data, p: pageIndex }).then((response) => {
          response.components.forEach((project) => {
            queryClient.setQueryData(['project', 'details', project.key], {
              components: [project],
            });
          });
          return response;
        });
      },
      staleTime: StaleTime.LONG,
      getNextPageParam: getNextPagingParam,
      getPreviousPageParam: getNextPagingParam,
      initialPageParam: pageIndex,
    });
  },
);

export const useProjectQuery = createQueryHook((key: string) => {
  return queryOptions({
    queryKey: projectsQueryKeys.details(key),
    queryFn: ({ queryKey: [_1, _2, key] }) => searchProjects({ filter: `query=${key}` }),
  });
});

export const useMyScannableProjectsQuery = createQueryHook(() => {
  return queryOptions({
    queryKey: projectsQueryKeys.scannable(),
    queryFn: () => getScannableProjects(),
    staleTime: StaleTime.NEVER,
  });
});

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => deleteProject(key),
    onSuccess: (_, key) => {
      resetProjectsListQuery(queryClient);
      removeMeasuresByComponentKey(key, queryClient);
    },
  });
}

export function invalidateProjectsListQuery(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: projectsQueryKeys.allList() });
}

function resetProjectsListQuery(queryClient: QueryClient) {
  queryClient.resetQueries({ queryKey: projectsQueryKeys.allList() });
}
