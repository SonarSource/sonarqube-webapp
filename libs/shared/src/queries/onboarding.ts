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

import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  getOnboardingOverview,
  getOnboardingProjects,
  OnboardingOverviewQuery,
  OnboardingProjectsQuery,
} from '../api/onboarding';
import { createQueryHook, StaleTime } from './common';

/**
 * Base hooks shared by SQ-Server and SQ-Cloud. The `organizationKey` is only
 * provided by SQ-Cloud (where the feature is org-scoped) and is injected by the
 * `~adapters/queries/onboarding` wrappers — feature code should use those, not these.
 */
export const useOnboardingOverviewQuery = createQueryHook((params: OnboardingOverviewQuery) =>
  queryOptions({
    queryKey: ['onboarding', 'overview', params],
    queryFn: () => getOnboardingOverview(params),
    staleTime: StaleTime.LONG,
  }),
);

export const useOnboardingProjectsQuery = createQueryHook((params: OnboardingProjectsQuery) =>
  queryOptions({
    queryKey: ['onboarding', 'projects', params],
    queryFn: () => getOnboardingProjects(params),
    // Keep the previous page visible while the next one loads to avoid table flicker.
    placeholderData: keepPreviousData,
    staleTime: StaleTime.LONG,
  }),
);
