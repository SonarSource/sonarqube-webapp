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
  OnboardingDevopsPlatform,
  OnboardingOverview,
  OnboardingProject,
  OnboardingProjectAnalysisMode,
  OnboardingProjectGateStatus,
  OnboardingProjectScanHealth,
  OnboardingProjectScanStatus,
  OnboardingStatistics,
} from '../../types/onboarding';
import { HttpStatus } from '../../types/request';
import { AbstractServiceMock } from './AbstractServiceMock';

// Mocks resolve against the per-product mock prefix (SQS `/api/v2`, SQC `/web-api`),
// which differs from the API client's `API_V2_BASE_URL`.
const ONBOARDING_PATH = `${API_V2_MOCKS_PREFIX}/onboarding`;
const ONBOARDING_OVERVIEW_PATH = `${ONBOARDING_PATH}/overview`;
const ONBOARDING_STATISTICS_PATH = `${ONBOARDING_PATH}/statistics`;
const ONBOARDING_PROJECTS_PATH = `${ONBOARDING_PATH}/projects`;

export interface OnboardingServiceData {
  // When true, the overview endpoint responds with an error (used to test error states).
  failOverview: boolean;
  // When true, the statistics endpoint responds with an error (used to test error states).
  failStatistics: boolean;
  overview: OnboardingOverview;
  statistics: OnboardingStatistics;
  // Full project list; the projects endpoint applies search/filter/pagination server-side.
  projects: OnboardingProject[];
}

function matchesSearch(project: OnboardingProject, query: string) {
  const needle = query.trim().toLowerCase();
  if (needle === '') {
    return true;
  }
  return [project.name, project.key, project.path]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(needle));
}

export function mockOnboardingOverview(
  steps: Partial<OnboardingOverview['steps']> = {},
): OnboardingOverview {
  return {
    progressPct: 75,
    steps: {
      devopsPlatforms: { configured: 1 },
      projects: { analyzed: 1, notImported: 295, notScanned: 11, percent: null, total: 301 },
      repositories: { discovered: 301, imported: 6, percent: null },
      ...steps,
    },
  };
}

export function mockOnboardingStatistics(
  overrides: Partial<OnboardingStatistics> = {},
): OnboardingStatistics {
  return {
    discoveredTotal: 301,
    timeline: [
      { date: '2025-02-01T00:00:00Z', projectsScanned: 1, repositoriesImported: 2 },
      { date: '2025-03-01T00:00:00Z', projectsScanned: 6, repositoriesImported: 10 },
      { date: '2025-04-01T00:00:00Z', projectsScanned: 30, repositoriesImported: 40 },
      { date: '2025-05-01T00:00:00Z', projectsScanned: 60, repositoriesImported: 80 },
      { date: '2025-06-01T00:00:00Z', projectsScanned: 87, repositoriesImported: 106 },
    ],
    devopsPlatforms: {
      total: 120,
      shares: [
        { platform: OnboardingDevopsPlatform.Github, count: 50, percentage: 42 },
        { platform: OnboardingDevopsPlatform.Bitbucket, count: 24, percentage: 20 },
        { platform: OnboardingDevopsPlatform.Gitlab, count: 16, percentage: 13 },
        { platform: OnboardingDevopsPlatform.AzureDevops, count: 16, percentage: 13 },
        { platform: OnboardingDevopsPlatform.NotBound, count: 14, percentage: 12 },
      ],
    },
    ...overrides,
  };
}

/**
 * `gateStatus`/`scanHealth`/`isStale` are populated here even though the real backend never sends
 * them, so tests can flip `PROJECT_HEALTH_FEATURE_ENABLED`/`STALE_PROJECTS_FEATURE_ENABLED` on and
 * prove the stubbed UI still renders correctly.
 */
export function mockOnboardingProjects(): OnboardingProject[] {
  return [
    {
      key: 'platform-jobs',
      name: 'platform-jobs',
      path: 'billing/platform-jobs',
      alm: OnboardingDevopsPlatform.Github,
      scanStatus: OnboardingProjectScanStatus.NotScanned,
      analysisMode: OnboardingProjectAnalysisMode.None,
      scanHealth: OnboardingProjectScanHealth.Healthy,
      gateStatus: OnboardingProjectGateStatus.NotComputed,
      isStale: false,
    },
    {
      key: 'payments-gateway',
      name: 'payments-gateway',
      path: 'identity/payments-gateway',
      alm: OnboardingDevopsPlatform.Github,
      scanStatus: OnboardingProjectScanStatus.Scanned,
      analysisMode: OnboardingProjectAnalysisMode.Ci,
      scanHealth: OnboardingProjectScanHealth.Failed,
      gateStatus: OnboardingProjectGateStatus.Failed,
      lastScan: 1740528000000,
      isStale: true,
    },
    {
      key: 'web-core',
      name: 'web-core',
      path: 'search/web-core',
      alm: OnboardingDevopsPlatform.Gitlab,
      scanStatus: OnboardingProjectScanStatus.Scanned,
      analysisMode: OnboardingProjectAnalysisMode.None,
      scanHealth: OnboardingProjectScanHealth.Healthy,
      gateStatus: OnboardingProjectGateStatus.Passed,
      lastScan: 1740528000000,
      isStale: false,
    },
    {
      key: 'identity-lib',
      name: 'identity-lib',
      path: 'growth/identity-lib',
      alm: OnboardingDevopsPlatform.Bitbucket,
      scanStatus: OnboardingProjectScanStatus.Scanned,
      analysisMode: OnboardingProjectAnalysisMode.Automatic,
      scanHealth: OnboardingProjectScanHealth.Healthy,
      gateStatus: OnboardingProjectGateStatus.Passed,
      lastScan: 1741132800000,
      isStale: true,
    },
    {
      key: 'mobile-worker',
      name: 'mobile-worker',
      path: 'identity/mobile-worker',
      alm: OnboardingDevopsPlatform.AzureDevops,
      scanStatus: OnboardingProjectScanStatus.NotScanned,
      analysisMode: OnboardingProjectAnalysisMode.None,
      scanHealth: OnboardingProjectScanHealth.Healthy,
      gateStatus: OnboardingProjectGateStatus.NotComputed,
      isStale: true,
    },
  ];
}

export const OnboardingServiceDefaultDataset: OnboardingServiceData = {
  failOverview: false,
  failStatistics: false,
  overview: mockOnboardingOverview(),
  projects: mockOnboardingProjects(),
  statistics: mockOnboardingStatistics(),
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

  setFailStatistics = (failStatistics: boolean) => {
    this.data.failStatistics = failStatistics;
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
    http.get(ONBOARDING_STATISTICS_PATH, () => {
      if (this.data.failStatistics) {
        return this.errorsWithStatus(HttpStatus.InternalServerError);
      }

      return this.ok(this.data.statistics);
    }),
    http.get(ONBOARDING_PROJECTS_PATH, ({ request }) => {
      const url = new URL(request.url);
      const q = url.searchParams.get('q') ?? '';
      const scanStatus = url.searchParams.get('scanStatus') as OnboardingProjectScanStatus | null;
      const analysisMode = url.searchParams.get(
        'analysisMode',
      ) as OnboardingProjectAnalysisMode | null;
      const pageIndex = Number(url.searchParams.get('pageIndex') ?? '1');
      const pageSize = Number(this.overridePageSize ?? url.searchParams.get('pageSize') ?? '50');

      const filtered = this.data.projects
        .filter((project) => matchesSearch(project, q))
        .filter((project) => scanStatus === null || project.scanStatus === scanStatus)
        .filter((project) => analysisMode === null || project.analysisMode === analysisMode);

      const start = (pageIndex - 1) * pageSize;
      const projects = pageSize <= 0 ? [] : filtered.slice(start, start + pageSize);

      const total = filtered.length;

      return this.ok({
        page: { pageIndex, pageSize, total },
        projects,
      });
    }),
  ];
}
