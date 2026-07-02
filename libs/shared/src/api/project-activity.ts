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

import { Paging } from '../types/paging';

const PROJECT_ACTIVITY_PAGE_SIZE = 500;

interface PaginatedAnalyses {
  analyses: unknown[];
  paging: Paging;
}

/**
 * Recursively fetches every page of a project-activity search and concatenates the analyses.
 * `fetchPage` performs the actual (app-specific) request for a single page.
 */
export async function fetchAllProjectActivity<T extends PaginatedAnalyses>(
  fetchPage: (paging: { p: number; ps: number }) => Promise<T>,
  pageSize: number = PROJECT_ACTIVITY_PAGE_SIZE,
): Promise<T> {
  const collectPage = async (p: number, prev?: T): Promise<T> => {
    const response = await fetchPage({ p, ps: pageSize });
    const result = (
      prev ? { ...response, analyses: [...prev.analyses, ...response.analyses] } : response
    ) as T;

    if (result.paging.pageIndex * result.paging.pageSize >= result.paging.total) {
      return result;
    }

    return collectPage(result.paging.pageIndex + 1, result);
  };

  return collectPage(1);
}
