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

import { queryOptions } from '@tanstack/react-query';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import { Paging } from '~shared/types/paging';
import { getPermissionTemplates } from '../api/permissions';

export const PERMISSION_TEMPLATES_PAGE_SIZE = 50;

export const permissionTemplatesQueryKeys = {
  all: () => ['permission-templates'],
  list: (pageIndex?: number, q?: string) => [
    ...permissionTemplatesQueryKeys.all(),
    'list',
    pageIndex,
    q,
  ],
};

export const usePermissionTemplatesQuery = createQueryHook(
  ({
    pageIndex = 1,
    pageSize = PERMISSION_TEMPLATES_PAGE_SIZE,
    q,
  }: Partial<Omit<Paging, 'total'>> & {
    q?: string;
  }) => {
    return queryOptions({
      queryKey: permissionTemplatesQueryKeys.list(pageIndex, q),
      queryFn: () =>
        getPermissionTemplates({
          pageIndex,
          pageSize,
          q,
        }),
      staleTime: StaleTime.LONG,
    });
  },
);
