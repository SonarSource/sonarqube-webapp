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
  useOnboardingBoundProjectCountsQuery,
  useOnboardingDopSettingsQuery,
} from '~adapters/queries/onboarding';
import {
  DevopsConfigurationFilters,
  DevopsConfigurationRow,
  filterDevopsConfigurationRows,
  sliceDevopsConfigurationRows,
} from './devopsConfigurationRows';

interface Params {
  filters: DevopsConfigurationFilters;
  /** 1-based, as everywhere else in the dashboard. */
  pageIndex: number;
  pageSize: number;
}

/**
 * One page of the instance's DevOps platform configurations, each with its bound-project count.
 *
 * Lists, filters and pages before counting, so the per-configuration fan-out stays bounded by the
 * page size rather than growing with the number of configurations.
 */
export function useDevopsConfigurationRows({ filters, pageIndex, pageSize }: Params) {
  const { data: dopSettings, isPending: areSettingsPending } = useOnboardingDopSettingsQuery();

  const matches = useMemo(
    () =>
      filterDevopsConfigurationRows(
        (dopSettings ?? []).map(({ id, key, type, url }) => ({
          alm: type,
          id,
          imported: undefined,
          key,
          url,
        })),
        filters,
      ),
    [dopSettings, filters],
  );

  const pageWithoutCounts = useMemo(
    () => sliceDevopsConfigurationRows(matches, pageIndex, pageSize),
    [matches, pageIndex, pageSize],
  );

  const countedIds = useMemo(() => pageWithoutCounts.map(({ id }) => id), [pageWithoutCounts]);

  const { data: counts } = useOnboardingBoundProjectCountsQuery(countedIds);

  const page = useMemo<DevopsConfigurationRow[]>(
    () => pageWithoutCounts.map((row) => ({ ...row, imported: counts[row.id] })),
    [counts, pageWithoutCounts],
  );

  return {
    // Only the list gates the table; the counts fill in as they land, so names, search and paging
    // are not hidden behind a skeleton.
    isPending: areSettingsPending,
    page,
    /** Configurations matching the filters, across every page. */
    total: matches.length,
  };
}
