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
import { searchIssues } from '../api/issues';
import { RequestData } from '../helpers/request';
import { createQueryHook, StaleTime } from './common';

/**
 * Common issue search query, shared by every feature that needs raw issues from
 * `/api/issues/search`. Callers narrow the response with the `select` option.
 */
const issuesSearchQueryOptions = (query: RequestData) =>
  queryOptions({
    // Distinct from sq-cloud's `issues-search` key, which caches enriched issues
    queryKey: ['shared', 'issues-search', query],
    queryFn: () => searchIssues(query),
    staleTime: StaleTime.LIVE,
  });

export const useIssuesSearchQuery = createQueryHook(issuesSearchQueryOptions);
