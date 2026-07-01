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

import { OnboardingProjectsFilter } from '~shared/types/onboarding';

/**
 * Filter tabs shown above the repositories table. Filtering itself is done server-side — these
 * only drive the tab labels/order; per-tab counts come from the API response `filterCounts`.
 */
export const PROJECT_FILTERS: Array<{ key: OnboardingProjectsFilter; labelKey: string }> = [
  { key: 'all', labelKey: 'onboarding_dashboard.projects.filter.all' },
  { key: 'failed_scans', labelKey: 'onboarding_dashboard.projects.filter.failed_scans' },
  { key: 'autoscan', labelKey: 'onboarding_dashboard.projects.filter.autoscan' },
  { key: 'not_onboarded', labelKey: 'onboarding_dashboard.projects.filter.not_onboarded' },
];
