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

import { renderHook } from '@testing-library/react';
import { DashboardFilter, PAGE_SIZE } from '../../../types/dashboard-list';
import { useMergedDashboardListState } from '../useMergedDashboardListState';

describe('useMergedDashboardListState', () => {
  function item(id: string) {
    return { id };
  }

  it('returns built-in dashboards and paging from the built-in query when filter is BuiltIn', () => {
    const { result } = renderHook(() =>
      useMergedDashboardListState({
        builtInDashboardsData: { items: [item('b1')], page: { total: 12 } },
        currentPage: 2,
        customDashboardsData: { items: [item('c1')], page: {} },
        filter: DashboardFilter.BuiltIn,
        pageSize: PAGE_SIZE,
      }),
    );

    expect(result.current.dashboards).toEqual([item('b1')]);
    expect(result.current.paging).toEqual({
      pageIndex: 2,
      pageSize: PAGE_SIZE,
      total: 12,
    });
  });

  it('returns custom dashboards and paging from the custom query when filter is Custom', () => {
    const { result } = renderHook(() =>
      useMergedDashboardListState({
        builtInDashboardsData: { items: [item('b1')], page: {} },
        currentPage: 1,
        customDashboardsData: { items: [item('c1'), item('c2')], page: { total: 20 } },
        filter: DashboardFilter.Custom,
        pageSize: PAGE_SIZE,
      }),
    );

    expect(result.current.dashboards).toEqual([item('c1'), item('c2')]);
    expect(result.current.paging).toEqual({
      pageIndex: 1,
      pageSize: PAGE_SIZE,
      total: 20,
    });
  });

  it('merges built-in and custom lists and paginates client-side when filter is All', () => {
    const builtIn = [item('b1'), item('b2')];
    const custom = [item('c1'), item('c2'), item('c3')];
    const { result } = renderHook(() =>
      useMergedDashboardListState({
        builtInDashboardsData: { items: builtIn, page: {} },
        currentPage: 1,
        customDashboardsData: { items: custom, page: {} },
        filter: DashboardFilter.All,
        pageSize: 2,
      }),
    );

    expect(result.current.dashboards).toEqual([item('b1'), item('b2')]);
    expect(result.current.paging).toEqual({ pageIndex: 1, pageSize: 2, total: 5 });
  });

  it('returns the second page slice when filter is All', () => {
    const builtIn = [item('b1')];
    const custom = [item('c1'), item('c2'), item('c3')];
    const { result } = renderHook(() =>
      useMergedDashboardListState({
        builtInDashboardsData: { items: builtIn, page: {} },
        currentPage: 2,
        customDashboardsData: { items: custom, page: {} },
        filter: DashboardFilter.All,
        pageSize: 2,
      }),
    );

    expect(result.current.dashboards).toEqual([item('c2'), item('c3')]);
    expect(result.current.paging.total).toBe(4);
  });
});
