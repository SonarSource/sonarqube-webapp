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

import { ComponentQualifier } from '~shared/types/component';
import { getComponents, Project } from '../api/project-management';
import { createQueryHook, StaleTime } from './common';

const PROJECT_QUERY_PAGE_SIZE = 500;

export const useGetAllProjectsQuery = createQueryHook(() => {
  return {
    queryKey: ['project-search', 'all'] as const,
    queryFn: async () => {
      let pageIndex = 1;
      let totalElements = 0;
      let allProjects: Project[] = [];
      let components;

      do {
        /* eslint-disable no-await-in-loop */
        components = await getComponents({
          p: pageIndex,
          ps: PROJECT_QUERY_PAGE_SIZE,
          qualifiers: ComponentQualifier.Project,
        });
        totalElements = components.paging.total;
        allProjects = allProjects.concat(components.components);
        pageIndex++;
      } while (allProjects.length < totalElements);

      return allProjects;
    },
    staleTime: StaleTime.LIVE,
  };
});
