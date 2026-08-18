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

import { useMemo } from 'react';
import {
  DashboardFilter,
  DashboardListPaging,
  DashboardListQueryPage,
  PAGE_SIZE,
} from '../../types/dashboard-list';

function getMergedDashboardListState<TItem>({
  builtInDashboardsData,
  currentPage,
  customDashboardsData,
  filter,
  pageSize,
}: {
  builtInDashboardsData?: DashboardListQueryPage<TItem>;
  currentPage: number;
  customDashboardsData?: DashboardListQueryPage<TItem>;
  filter: DashboardFilter;
  pageSize: number;
}): { dashboards: TItem[]; paging: DashboardListPaging } {
  const builtInItems = builtInDashboardsData?.items ?? [];
  const customItems = customDashboardsData?.items ?? [];

  if (filter === DashboardFilter.BuiltIn) {
    return {
      dashboards: builtInItems,
      paging: {
        pageIndex: currentPage,
        pageSize,
        total: builtInDashboardsData?.page?.total ?? 0,
      },
    };
  }

  if (filter === DashboardFilter.Custom) {
    return {
      dashboards: customItems,
      paging: {
        pageIndex: currentPage,
        pageSize,
        total: customDashboardsData?.page?.total ?? 0,
      },
    };
  }

  const allItems = [...builtInItems, ...customItems];
  const total = allItems.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = allItems.slice(startIndex, startIndex + pageSize);

  return {
    dashboards: paginatedItems,
    paging: { pageIndex: currentPage, pageSize, total },
  };
}

export function useMergedDashboardListState<TItem>({
  builtInDashboardsData,
  currentPage,
  customDashboardsData,
  filter,
  pageSize = PAGE_SIZE,
}: {
  builtInDashboardsData?: DashboardListQueryPage<TItem>;
  currentPage: number;
  customDashboardsData?: DashboardListQueryPage<TItem>;
  filter: DashboardFilter;
  pageSize?: number;
}): { dashboards: TItem[]; paging: DashboardListPaging } {
  return useMemo(
    () =>
      getMergedDashboardListState({
        builtInDashboardsData,
        currentPage,
        customDashboardsData,
        filter,
        pageSize,
      }),
    [builtInDashboardsData, currentPage, customDashboardsData, filter, pageSize],
  );
}
