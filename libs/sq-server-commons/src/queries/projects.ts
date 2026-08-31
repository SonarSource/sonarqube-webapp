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

import {
  InfiniteData,
  infiniteQueryOptions,
  QueryClient,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { isDefined } from '~shared/helpers/types';
import {
  createInfiniteQueryHook,
  createQueryHook,
  getNextPagingParam,
  getPreviousPagingParam,
  StaleTime,
  useFetchAllPages,
} from '~shared/queries/common';
import { ComponentRaw, getScannableProjects, searchProjects } from '../api/components';
import { deleteProject } from '../api/project-management';
import { useAvailableFeatures } from '../context/available-features/withAvailableFeatures';
import { convertToQueryData, defineFacets } from '../helpers/projects';
import { RequestData } from '../helpers/request';
import { Feature } from '../types/features';
import { ProjectsQuery } from '../types/projects';
import { removeMeasuresByComponentKey } from './measures';

export const PROJECTS_PAGE_SIZE = 50;
const ALL_PROJECTS_PAGE_SIZE = 500;

export const projectsQueryKeys = {
  all: () => ['project'] as const,
  allList: () => [...projectsQueryKeys.all(), 'list'] as const,
  allProjects: () => [...projectsQueryKeys.all(), 'all-projects'] as const,
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
    const { hasFeature } = useAvailableFeatures();
    const scaEnabled = hasFeature(Feature.Sca);
    const data = convertToQueryData(query, isFavorite, isStandardMode, {
      ps: PROJECTS_PAGE_SIZE,
      facets: defineFacets(query, isStandardMode, scaEnabled).join(),
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
      getPreviousPageParam: getPreviousPagingParam,
      initialPageParam: pageIndex,
    });
  },
);

export const useProjectQuery = createQueryHook((key: string) => {
  return queryOptions({
    queryKey: projectsQueryKeys.details(key),
    queryFn: ({ queryKey: [_1, _2, key] }) => searchProjects({ filter: `query=${key}` }),
    select: (data) => data.components.find((el) => el.key === key),
    staleTime: StaleTime.NEVER,
  });
});

/**
 * Fetches every project on the instance. `search_projects` has no filter for a specific set of
 * uuids or keys, so any lookup keyed by uuid (see `useProjectKeysByUuid`) has to page through the
 * full list and filter client-side — this pages it at {@link ALL_PROJECTS_PAGE_SIZE} per page.
 * Unlike {@link useProjectsQuery}, there is no UI driving pagination here: the remaining pages
 * drain in the background via {@link useFetchAllPages}, so `data` starts with just the first page
 * and grows as more land. Callers derive whatever shape they need via `select`, same as any other
 * query.
 */
export function useAllProjectsQuery<TData>(options: {
  enabled?: boolean;
  select: (projects: Array<ComponentRaw & { uuid: string }>) => TData;
}) {
  const { enabled = true, select } = options;
  // Keyed on `select`, not written inline — the only caller today builds a Map from the
  // result, and query-core can't structurally compare Maps, so any new reference here
  // means a full Map rebuild (and a dagre re-layout downstream) even if nothing changed.
  const wrappedSelect = useCallback(
    (data: InfiniteData<Awaited<ReturnType<typeof searchProjects>>>) =>
      select(
        data.pages
          .flatMap((page) => page.components)
          .filter((component): component is ComponentRaw & { uuid: string } =>
            isDefined(component.uuid),
          ),
      ),
    [select],
  );
  const query = useInfiniteQuery({
    enabled,
    queryKey: projectsQueryKeys.allProjects(),
    queryFn: ({ pageParam }) => searchProjects({ p: pageParam, ps: ALL_PROJECTS_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: getNextPagingParam,
    select: wrappedSelect,
    staleTime: StaleTime.LONG,
    refetchOnWindowFocus: false,
  });

  return useFetchAllPages(query, projectsQueryKeys.allProjects());
}

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
