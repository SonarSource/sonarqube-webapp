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

import { OnboardingAlm } from '~shared/types/onboarding';
import { ANY_PROJECTS_FILTER } from '../../../types/types';
import { DevopsPlatformFilterValue } from '../../devops/platformConfig';

/** One DevOps platform configuration, as displayed by {@link DevopsConfigurationsModal}. */
export interface DevopsConfigurationRow {
  alm: OnboardingAlm;
  id: string;
  /**
   * Projects bound to this configuration. `undefined` while loading or on failure — never conflated
   * with zero, which would read as "nothing imported yet".
   */
  imported: number | undefined;
  /** The admin-given configuration name. The only per-configuration label the backend carries. */
  key: string;
  /** The platform's API base URL, when it reports one. See `OnboardingDopSetting.url`. */
  url?: string;
}

export interface DevopsConfigurationFilters {
  platform: DevopsPlatformFilterValue;
  /** Free-text search, matched against the configuration name. Already debounced by the caller. */
  query: string;
}

// Filtered in the browser: the whole list arrives in one cached response, since an instance holds a
// handful of configurations rather than a pageable corpus.
export function filterDevopsConfigurationRows(
  rows: readonly DevopsConfigurationRow[],
  { platform, query }: DevopsConfigurationFilters,
): DevopsConfigurationRow[] {
  const normalizedQuery = query.trim().toLowerCase();

  return rows.filter(
    (row) =>
      (platform === ANY_PROJECTS_FILTER || row.alm === platform) &&
      (normalizedQuery === '' || row.key.toLowerCase().includes(normalizedQuery)),
  );
}

/** The rows of one page, `pageIndex` being 1-based as everywhere else in the dashboard. */
export function sliceDevopsConfigurationRows(
  rows: readonly DevopsConfigurationRow[],
  pageIndex: number,
  pageSize: number,
): DevopsConfigurationRow[] {
  const start = (pageIndex - 1) * pageSize;

  return rows.slice(start, start + pageSize);
}
