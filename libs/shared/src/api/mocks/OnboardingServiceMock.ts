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

import { http } from 'msw';
import { API_V2_MOCKS_PREFIX } from '~adapters/helpers/urls';
import {
  OnboardingOverview,
  OnboardingProject,
  OnboardingProjectsFilter,
  OnboardingProjectsFilterCounts,
} from '../../types/onboarding';
import { HttpStatus } from '../../types/request';
import { AbstractServiceMock } from './AbstractServiceMock';

// Mocks resolve against the per-product mock prefix (SQS `/api/v2`, SQC `/web-api`),
// which differs from the API client's `API_V2_BASE_URL`.
const ONBOARDING_PATH = `${API_V2_MOCKS_PREFIX}/onboarding`;
const ONBOARDING_OVERVIEW_PATH = `${ONBOARDING_PATH}/overview`;
const ONBOARDING_PROJECTS_PATH = `${ONBOARDING_PATH}/projects`;

export interface OnboardingServiceData {
  // When true, the overview endpoint responds with an error (used to test error states).
  failOverview: boolean;
  overview: OnboardingOverview;
  // Full project list; the projects endpoint applies search/filter/pagination server-side.
  projects: OnboardingProject[];
}

/** Mirrors the backend filter tabs so the mock can compute matches and per-tab counts. */
const FILTER_PREDICATES: Record<OnboardingProjectsFilter, (project: OnboardingProject) => boolean> =
  {
    all: () => true,
    // eslint-disable-next-line camelcase
    fully_onboarded: (p) => p.onboarding === 'ANALYSED' && p.scanHealth === 'HEALTHY',
    // eslint-disable-next-line camelcase
    needs_attention: (p) =>
      p.scanHealth === 'FAILED' || p.gateStatus === 'FAILED' || p.onboarding === 'IMPORTED_EMPTY',
    // eslint-disable-next-line camelcase
    not_onboarded: (p) => p.onboarding === 'NOT_IMPORTED',
    // eslint-disable-next-line camelcase
    failed_scans: (p) => p.scanHealth === 'FAILED',
    autoscan: (p) => p.scanMethod === 'MANAGED',
    local: (p) => p.scanMethod === 'LOCAL',
    stale: (p) => p.stale,
  };

function matchesSearch(project: OnboardingProject, query: string) {
  const needle = query.trim().toLowerCase();
  if (needle === '') {
    return true;
  }
  return [project.name, project.key, project.path]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(needle));
}

function computeFilterCounts(projects: OnboardingProject[]): OnboardingProjectsFilterCounts {
  return Object.fromEntries(
    (Object.keys(FILTER_PREDICATES) as OnboardingProjectsFilter[]).map((key) => [
      key,
      projects.filter(FILTER_PREDICATES[key]).length,
    ]),
  ) as OnboardingProjectsFilterCounts;
}

export function mockOnboardingOverview(
  overrides: Partial<OnboardingOverview['cards']> = {},
): OnboardingOverview {
  return {
    cards: {
      repositoriesDiscovered: {
        discovered: 301,
        imported: 6,
        notYetImported: 295,
        byAlm: [{ alm: 'github', discovered: 301, imported: 6 }],
      },
      projectsOnboarded: {
        onboarded: 1,
        totalProjects: 6,
        importedEmpty: 5,
        percentOfTotal: 16.7,
      },
      scanHealth: { healthy: 1, failed: 0 },
      scanMethod: {
        ci: 1,
        local: 0,
        managed: 0,
        byCi: [{ system: 'Github Actions', count: 1 }],
      },
      prIntegration: { prDecorationCount: 6, percentOfTotal: 100 },
      ...overrides,
    },
    checklist: {
      overallMaturityPct: 180.1,
      maturityLabel: 'Advanced',
      items: [
        { id: 'discover', completed: 301, total: null, completionPct: 100, status: 'DONE' },
        { id: 'onboard', completed: 1, total: 301, completionPct: 0.3, status: 'IN_PROGRESS' },
        { id: 'failing', completed: 1, total: 1, completionPct: 100, status: 'DONE' },
        { id: 'full-ci', completed: 1, total: 1, completionPct: 100, status: 'DONE' },
        { id: 'pr-deco', completed: 6, total: 1, completionPct: 600, status: 'DONE' },
      ],
    },
    momentum: {
      startDate: 1740528000000,
      onboardedCount: 87,
      importedCount: 106,
      totalRepos: 120,
      weeklyDelta: 12,
      weeklyHistory: [
        { weekStart: 1740528000000, cumulativeImported: 2, cumulativeOnboarded: 1 },
        { weekStart: 1741132800000, cumulativeImported: 10, cumulativeOnboarded: 6 },
        { weekStart: 1741737600000, cumulativeImported: 40, cumulativeOnboarded: 30 },
        { weekStart: 1742342400000, cumulativeImported: 80, cumulativeOnboarded: 60 },
        { weekStart: 1742947200000, cumulativeImported: 106, cumulativeOnboarded: 87 },
      ],
      currentState: {
        ciCount: 70,
        localCount: 10,
        managedCount: 7,
        failedScanCount: 11,
        importedEmptyCount: 19,
      },
    },
    charts: {
      onboardingCoverage: { healthy: 76, failed: 11, notOnboarded: 33 },
      scanConfiguration: { ci: 31, local: 12, managed: 44, notOnboarded: 33 },
      qualityGateStatus: { passing: 42, failing: 23, notComputed: 11, notOnboarded: 33 },
    },
    devopsPlatforms: {
      total: 120,
      shares: [
        { platform: 'github', count: 50, percentage: 42 },
        { platform: 'bitbucket', count: 24, percentage: 20 },
        { platform: 'gitlab', count: 16, percentage: 13 },
        { platform: 'azure_devops', count: 16, percentage: 13 },
        { platform: 'NOT_BOUND', count: 14, percentage: 12 },
      ],
    },
  };
}

export function mockOnboardingProjects(): OnboardingProject[] {
  return [
    {
      key: 'platform-jobs',
      name: 'platform-jobs',
      path: 'billing/platform-jobs',
      language: 'Kotlin',
      alm: 'github',
      onboarding: 'NOT_IMPORTED',
      scanMethod: 'CI',
      scanHealth: 'HEALTHY',
      gateStatus: 'NOT_COMPUTED',
      stale: false,
    },
    {
      key: 'payments-gateway',
      name: 'payments-gateway',
      path: 'identity/payments-gateway',
      language: 'Java',
      alm: 'github',
      onboarding: 'ANALYSED',
      scanMethod: 'CI',
      ciSystem: 'Github Actions',
      scanHealth: 'FAILED',
      gateStatus: 'FAILED',
      lastScan: 1740528000000,
      coverage: 91.7,
      lastActivity: 1742947200000,
      stale: true,
    },
    {
      key: 'web-core',
      name: 'web-core',
      path: 'search/web-core',
      language: 'Kotlin',
      alm: 'gitlab',
      onboarding: 'ANALYSED',
      scanMethod: 'LOCAL',
      scanHealth: 'HEALTHY',
      gateStatus: 'PASSED',
      lastScan: 1740528000000,
      coverage: 92.7,
      lastActivity: 1742947200000,
      stale: false,
    },
    {
      key: 'identity-lib',
      name: 'identity-lib',
      path: 'growth/identity-lib',
      language: 'Python',
      alm: 'bitbucket',
      onboarding: 'ANALYSED',
      scanMethod: 'MANAGED',
      scanHealth: 'HEALTHY',
      gateStatus: 'PASSED',
      lastScan: 1741132800000,
      coverage: 64,
      lastActivity: 1742947200000,
      stale: true,
    },
    {
      key: 'mobile-worker',
      name: 'mobile-worker',
      path: 'identity/mobile-worker',
      language: 'JavaScript',
      alm: 'azure_devops',
      onboarding: 'IMPORTED_EMPTY',
      scanMethod: 'MANAGED',
      scanHealth: 'HEALTHY',
      gateStatus: 'NOT_COMPUTED',
      lastScan: 1741737600000,
      lastActivity: 1742947200000,
      stale: true,
    },
  ];
}

export const OnboardingServiceDefaultDataset: OnboardingServiceData = {
  failOverview: false,
  overview: mockOnboardingOverview(),
  projects: mockOnboardingProjects(),
};

export class OnboardingServiceMock extends AbstractServiceMock<OnboardingServiceData> {
  constructor(data: OnboardingServiceData = OnboardingServiceDefaultDataset) {
    super(data);
  }

  setOverview = (overview: OnboardingOverview) => {
    this.data.overview = overview;
  };

  setFailOverview = (failOverview: boolean) => {
    this.data.failOverview = failOverview;
  };

  setProjects = (projects: OnboardingProject[]) => {
    this.data.projects = projects;
  };

  handlers = [
    http.get(ONBOARDING_OVERVIEW_PATH, () => {
      if (this.data.failOverview) {
        return this.errorsWithStatus(HttpStatus.InternalServerError);
      }

      return this.ok(this.data.overview);
    }),
    http.get(ONBOARDING_PROJECTS_PATH, ({ request }) => {
      const url = new URL(request.url);
      const q = url.searchParams.get('q') ?? '';
      const filter = (url.searchParams.get('filter') ?? 'all') as OnboardingProjectsFilter;
      const pageIndex = Number(url.searchParams.get('pageIndex') ?? '1');
      const pageSize = Number(url.searchParams.get('pageSize') ?? '50');

      const searched = this.data.projects.filter((project) => matchesSearch(project, q));
      const filterCounts = computeFilterCounts(searched);
      const filtered = searched.filter(FILTER_PREDICATES[filter] ?? FILTER_PREDICATES.all);

      const start = (pageIndex - 1) * pageSize;
      const projects = pageSize <= 0 ? [] : filtered.slice(start, start + pageSize);

      return this.ok({
        filterCounts,
        page: { pageIndex, pageSize, total: filtered.length },
        projects,
      });
    }),
  ];
}
