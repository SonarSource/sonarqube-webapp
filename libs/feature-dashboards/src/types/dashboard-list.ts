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

export enum DashboardMode {
  Create = 'create',
  Duplicate = 'duplicate',
  Edit = 'edit',
}

export enum DashboardType {
  BuiltIn = 'built_in',
  Custom = 'custom',
}

/**
 * Filter for dashboard list views (custom vs built-in dashboards).
 */
export enum DashboardFilter {
  All = 'all',
  BuiltIn = 'built_in',
  Custom = 'custom',
}

/** Page size for project and portfolio dashboard list pagination. */
export const PAGE_SIZE = 8;

/** Shape shared by project and portfolio dashboard list API responses. */
export interface DashboardListQueryPage<TItem> {
  items: TItem[];
  page: { total?: number };
}

export interface DashboardListPaging {
  pageIndex: number;
  pageSize: number;
  total: number;
}
