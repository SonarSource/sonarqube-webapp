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

import { noop } from 'lodash';
import { http } from 'msw';
import { API_V2_MOCKS_PREFIX } from '~adapters/helpers/urls';
import {
  OnboardingDevopsPlatform,
  OnboardingOrganizationRow,
  OnboardingOrganizationSort,
  OnboardingOverview,
  OnboardingProject,
  OnboardingProjectAnalysisMode,
  OnboardingProjectGateStatus,
  OnboardingProjectScanHealth,
  OnboardingProjectScanStatus,
  OnboardingSortDirection,
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
const ONBOARDING_ORGANIZATIONS_PATH = `${ONBOARDING_PATH}/organizations`;

export interface OnboardingServiceData {
  // Served instead of `overview` and `statistics` when the request carries an `enterpriseId`.
  enterpriseOverview: OnboardingOverview;
  enterpriseStatistics: OnboardingStatistics;
  // When true, the overview endpoint responds with an error (used to test error states).
  failOverview: boolean;
  // When true, the statistics endpoint responds with an error (used to test error states).
  failStatistics: boolean;
  // When true, every request carrying an `enterpriseId` responds 403, as for a non-admin.
  forbidEnterprise: boolean;
  // Full organization list of the enterprise; the endpoint applies search/sort/pagination.
  organizations: OnboardingOrganizationRow[];
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

const ENTERPRISE_COVERAGE = { organizationsTotal: 12, organizationsUnavailable: 1 };

/** The overview of an enterprise of 12 organizations, 8 bound, 1 of which could not be read. */
export function mockOnboardingEnterpriseOverview(
  overrides: Partial<OnboardingOverview> = {},
): OnboardingOverview {
  return {
    coverage: ENTERPRISE_COVERAGE,
    progressPct: 45,
    steps: {
      devopsPlatforms: {
        byPlatform: [
          { count: 5, percentage: 62.5, platform: OnboardingDevopsPlatform.Github },
          { count: 2, percentage: 25, platform: OnboardingDevopsPlatform.Gitlab },
          { count: 1, percentage: 12.5, platform: OnboardingDevopsPlatform.AzureDevops },
        ],
        configured: 8,
        total: 12,
      },
      projects: { analyzed: 80, notImported: 100, notScanned: 620, percent: null, total: 800 },
      repositories: { discovered: 800, imported: 700, percent: null },
    },
    ...overrides,
  };
}

/** The enterprise overview while no organization is bound: the last two steps are locked. */
export function mockOnboardingUnboundEnterpriseOverview(): OnboardingOverview {
  const overview = mockOnboardingEnterpriseOverview();

  return {
    ...overview,
    progressPct: 0,
    steps: {
      ...overview.steps,
      devopsPlatforms: { byPlatform: [], configured: 0, total: 12 },
    },
  };
}

/** The enterprise overview when no organization could report how many repositories its platforms hold. */
export function mockOnboardingUncountedEnterpriseOverview(): OnboardingOverview {
  const overview = mockOnboardingEnterpriseOverview();

  return {
    ...overview,
    steps: {
      ...overview.steps,
      projects: { analyzed: 555, notImported: null, notScanned: 9155, percent: null, total: null },
      repositories: { discovered: null, imported: 9710, percent: null },
    },
  };
}

/** Organizations of an enterprise, in the order the backend serves them by progress. */
export function mockOnboardingOrganizations(): OnboardingOrganizationRow[] {
  return [
    {
      availability: 'AVAILABLE',
      bound: false,
      key: 'legacy-tools',
      name: 'Legacy tools',
      progressPct: 0,
      projects: { analyzed: 0, notImported: null, notScanned: 4, percent: null, total: null },
      repositories: { discovered: null, imported: 4, percent: null },
    },
    {
      availability: 'AVAILABLE',
      bound: true,
      devopsPlatform: OnboardingDevopsPlatform.Gitlab,
      key: 'data-platform',
      name: 'Data platform',
      progressPct: 35,
      projects: { analyzed: 10, notImported: 30, notScanned: 30, percent: 14, total: 70 },
      repositories: { discovered: 100, imported: 70, percent: 70 },
    },
    {
      availability: 'AVAILABLE',
      bound: true,
      devopsPlatform: OnboardingDevopsPlatform.Github,
      key: 'web-core',
      name: 'Web core',
      progressPct: 92,
      projects: { analyzed: 90, notImported: 0, notScanned: 5, percent: 95, total: 95 },
      repositories: { discovered: 95, imported: 95, percent: 100 },
    },
    {
      availability: 'UNAVAILABLE',
      bound: false,
      key: 'payments',
      name: 'Payments',
    },
  ];
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
  enterpriseOverview: mockOnboardingEnterpriseOverview(),
  enterpriseStatistics: mockOnboardingStatistics({
    coverage: ENTERPRISE_COVERAGE,
  }),
  failOverview: false,
  failStatistics: false,
  forbidEnterprise: false,
  organizations: mockOnboardingOrganizations(),
  overview: mockOnboardingOverview(),
  projects: mockOnboardingProjects(),
  statistics: mockOnboardingStatistics(),
};

type OnboardingHeldEndpoint = 'overview' | 'statistics';

export class OnboardingServiceMock extends AbstractServiceMock<OnboardingServiceData> {
  private heldResponses: Partial<
    Record<OnboardingHeldEndpoint, { promise: Promise<void>; release: () => void }>
  > = {};

  constructor(data: OnboardingServiceData = OnboardingServiceDefaultDataset) {
    super(data);
  }

  /**
   * Keeps the endpoint's responses pending until the returned callback runs, so a test can observe
   * the dashboard while that request is still in flight.
   */
  holdResponse = (endpoint: OnboardingHeldEndpoint) => {
    let release: () => void = noop;
    const promise = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.heldResponses[endpoint] = { promise, release };

    return release;
  };

  reset() {
    Object.values(this.heldResponses).forEach(({ release }) => {
      release();
    });
    this.heldResponses = {};
    super.reset();
  }

  setOverview = (overview: OnboardingOverview) => {
    this.data.overview = overview;
  };

  setStatistics = (statistics: OnboardingStatistics) => {
    this.data.statistics = statistics;
  };

  setEnterpriseOverview = (enterpriseOverview: OnboardingOverview) => {
    this.data.enterpriseOverview = enterpriseOverview;
  };

  setForbidEnterprise = (forbidEnterprise: boolean) => {
    this.data.forbidEnterprise = forbidEnterprise;
  };

  setOrganizations = (organizations: OnboardingOrganizationRow[]) => {
    this.data.organizations = organizations;
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

  /** Whether the request is for an enterprise, and refused as it is for a non-admin. */
  private isForbidden(request: Request) {
    return this.isEnterpriseRequest(request) && this.data.forbidEnterprise;
  }

  private isEnterpriseRequest(request: Request) {
    return new URL(request.url).searchParams.has('enterpriseId');
  }

  handlers = [
    http.get(ONBOARDING_OVERVIEW_PATH, async ({ request }) => {
      await this.heldResponses.overview?.promise;

      if (this.isForbidden(request)) {
        return this.errorsWithStatus(HttpStatus.Forbidden);
      }

      if (this.data.failOverview) {
        return this.errorsWithStatus(HttpStatus.InternalServerError);
      }

      return this.ok(
        this.isEnterpriseRequest(request) ? this.data.enterpriseOverview : this.data.overview,
      );
    }),
    http.get(ONBOARDING_STATISTICS_PATH, async ({ request }) => {
      await this.heldResponses.statistics?.promise;

      if (this.isForbidden(request)) {
        return this.errorsWithStatus(HttpStatus.Forbidden);
      }

      if (this.data.failStatistics) {
        return this.errorsWithStatus(HttpStatus.InternalServerError);
      }

      return this.ok(
        this.isEnterpriseRequest(request) ? this.data.enterpriseStatistics : this.data.statistics,
      );
    }),
    http.get(ONBOARDING_ORGANIZATIONS_PATH, ({ request }) => {
      const url = new URL(request.url);

      if (this.data.forbidEnterprise) {
        return this.errorsWithStatus(HttpStatus.Forbidden);
      }

      const needle = (url.searchParams.get('q') ?? '').trim().toLowerCase();
      const sort = url.searchParams.get('sort') ?? OnboardingOrganizationSort.Progress;
      const isDescending =
        url.searchParams.get('direction') === String(OnboardingSortDirection.Descending);
      const pageIndex = Number(url.searchParams.get('pageIndex') ?? '1');
      const pageSize = Number(this.overridePageSize ?? url.searchParams.get('pageSize') ?? '50');

      const matching = this.data.organizations.filter(
        ({ key, name }) =>
          needle === '' ||
          name.toLowerCase().includes(needle) ||
          key.toLowerCase().includes(needle),
      );
      // Unavailable organizations have no progress and come last, in either direction, as the contract says.
      const direction = isDescending ? -1 : 1;
      const sorted =
        sort === String(OnboardingOrganizationSort.Name)
          ? [...matching].sort((a, b) => direction * a.name.localeCompare(b.name))
          : [...matching].sort((a, b) => {
              if (a.progressPct == null || b.progressPct == null) {
                return Number(a.progressPct == null) - Number(b.progressPct == null);
              }
              return direction * (a.progressPct - b.progressPct);
            });

      const start = (pageIndex - 1) * pageSize;

      return this.ok({
        coverage: this.data.enterpriseOverview.coverage ?? {
          organizationsTotal: this.data.organizations.length,
          organizationsUnavailable: 0,
        },
        organizations: pageSize <= 0 ? [] : sorted.slice(start, start + pageSize),
        page: { pageIndex, pageSize, total: sorted.length },
      });
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
