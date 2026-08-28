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

/** DevOps platform a discovered repository / project can originate from, including unbound. */
export enum OnboardingDevopsPlatform {
  AzureDevops = 'azure_devops',
  Bitbucket = 'bitbucket',
  BitbucketCloud = 'bitbucket_cloud',
  Github = 'github',
  Gitlab = 'gitlab',
  /** Repository not bound to any ALM. */
  NotBound = 'NOT_BOUND',
}

/** ALM platforms a discovered repository / project can originate from. */
export type OnboardingAlm = Exclude<OnboardingDevopsPlatform, OnboardingDevopsPlatform.NotBound>;

/**
 * ALM providers that have an icon asset under `/images/alm(s)/{key}.svg`. These keys
 * must exist in each product's theme `images` map so the theme-aware icon resolver can
 * look them up without an unchecked cast.
 */
export type AlmIconKey = 'azure' | 'bitbucket' | 'github' | 'gitlab';

/**
 * Return shape of the `useAutoImportToggle` adapter hook. Declared here so both adapter
 * implementations agree on the shape without circular imports.
 */
export interface AutoImportToggle {
  /** Whether new repositories are imported automatically, as last known from the server. */
  autoImportEnabled: boolean;

  /**
   * Whether the setting was already on when the panel loaded, i.e. it is on and nothing has been
   * saved since. Lets callers greet organizations that need no action with a confirmation instead
   * of a control they have no reason to touch.
   */
  isEnabledOnFirstLoad: boolean;

  /** Whether the setting is still being fetched for the first time. */
  isLoading: boolean;

  /** Whether a change is currently being saved. */
  isPending: boolean;

  /** Undefined on products that have no organization-level auto-import setting. */
  toggleAutoImport: ((enabled: boolean) => void) | undefined;

  /** Installation-specific permissions URL */
  repositoryAccessUrl: string | undefined;
}

/**
 * The two ends of an organization's DevOps platform binding, as displayed by the onboarding
 * dashboard. Not part of any API response — the overview endpoint does not carry these names, so
 * each product resolves them through `~adapters/queries/onboarding`. Declared here so both adapter
 * implementations agree on the shape.
 */
export interface OnboardingCurrentBinding {
  /** Name of the DevOps platform organization the Sonar organization is bound to. */
  devopsOrganizationName: string;
  /** Name of the Sonar organization. */
  organizationName: string;
}

/** Number of DevOps platform configurations that exist for one ALM. */
export interface OnboardingDevopsPlatformConfigurations {
  count: number;
  platform: OnboardingAlm;
}

/** Return shape of the `useOnboardingDevopsConfigurations` adapter hook. */
export interface OnboardingDevopsConfigurations {
  /**
   * Configuration count per DevOps platform. `undefined` only on products where an organization
   * binds to a single platform (SQ-Cloud), never "not known yet" — a product that can hold several
   * reports an empty array until the split is known, so it is never mistaken for a single-binding
   * one.
   */
  byPlatform: OnboardingDevopsPlatformConfigurations[] | undefined;
}

/**
 * Response of `GET /api/v2/onboarding/overview`.
 *
 * Mirrors `OnboardingOverviewResponse` in the onboarding capability's `openapi.yaml`. One contract
 * serves both products — the capability ships as a single `onboarding-unified-app`.
 *
 * The per-project cohort breakdowns and the adoption history are not here; they live on
 * `GET /api/v2/onboarding/statistics` ({@link OnboardingStatistics}).
 */
export interface OnboardingOverview {
  /** Overall journey completion, 0-100. */
  progressPct: number;
  steps: OnboardingSteps;
}

/** The three sequential steps of the onboarding journey. */
interface OnboardingSteps {
  devopsPlatforms: OnboardingDevopsPlatformsStep;
  projects: OnboardingProjectsStep;
  repositories: OnboardingRepositoriesStep;
}

interface OnboardingDevopsPlatformsStep {
  /**
   * Configured DevOps platform integrations. On Server this counts the instance's ALM
   * configurations; on Cloud an organization binds to at most one, so it is 0 or 1.
   */
  configured: number;
}

interface OnboardingRepositoriesStep {
  /** Null when no platform is configured, or when discovery is unavailable. */
  discovered: number | null;
  imported: number;
  /** Imported over discovered, 0-100. Null when `discovered` is null or zero. */
  percent: number | null;
}

interface OnboardingProjectsStep {
  analyzed: number;
  /** Discovered repositories with no project yet. Null when `discovered` is null. */
  notImported: number | null;
  notScanned: number;
  percent: number | null;
  /** Equal to discovered repositories. Null when `discovered` is null. */
  total: number | null;
}

/** Response of `GET /api/v2/onboarding/statistics`. */
export interface OnboardingStatistics {
  devopsPlatforms: OnboardingDevopsPlatforms;
  /** Current discovered-repository count, the chart's reference line. Null when unavailable. */
  discoveredTotal: number | null;
  /** Monthly cumulative adoption, oldest first. Empty when the scope has no projects. */
  timeline: OnboardingTimelinePoint[];
}

export interface OnboardingTimelinePoint {
  /** First instant of the month, ISO-8601 with offset. */
  date: string;
  projectsScanned: number;
  repositoriesImported: number;
}

export interface OnboardingDevopsPlatforms {
  shares: OnboardingDevopsPlatformShare[];
  total: number | null;
}

export interface OnboardingDevopsPlatformShare {
  count: number;
  percentage: number | null;
  platform: OnboardingDevopsPlatform;
}

/** Whether an imported project has ever been analysed. Mirrors the backend's `ScanStatus`. */
export enum OnboardingProjectScanStatus {
  NotScanned = 'NOT_SCANNED',
  Scanned = 'SCANNED',
}

/**
 * How a project is analysed. Mirrors the backend's `AnalysisMode`: `None` covers both a project
 * analysed without CI/automatic analysis (a locally run scanner) and one never analysed at all —
 * the two are told apart by {@link OnboardingProjectScanStatus}.
 */
export enum OnboardingProjectAnalysisMode {
  Automatic = 'AUTOMATIC',
  Ci = 'CI',
  None = 'NONE',
}

export enum OnboardingProjectScanHealth {
  Failed = 'FAILED',
  Healthy = 'HEALTHY',
}

export enum OnboardingProjectGateStatus {
  Failed = 'FAILED',
  NotComputed = 'NOT_COMPUTED',
  Passed = 'PASSED',
}

/**
 * "Gate status" filter dimension. Not part of the current `/onboarding/projects` contract — see
 * `PROJECT_HEALTH_FEATURE_ENABLED` in the onboarding-dashboard feature.
 */
export enum OnboardingProjectsGateStatusFilter {
  GatePassed = 'gate_passed',
  GateFailed = 'gate_failed',
  GateNotComputed = 'gate_not_computed',
}

interface OnboardingProjectsPage {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface OnboardingProjectsResponse {
  page: OnboardingProjectsPage;
  projects: OnboardingProject[];
}

export interface OnboardingProject {
  alm: OnboardingAlm | null;
  analysisMode: OnboardingProjectAnalysisMode;
  /** Always present — the endpoint only ever lists imported projects. */
  key: string;
  lastScan?: number;
  name: string;
  path?: string;
  scanStatus: OnboardingProjectScanStatus;

  /**
   * Quality gate status. Not part of the current `/onboarding/projects` contract — every real
   * response omits it. Kept so the gate-status column/badge can switch back on via
   * `PROJECT_HEALTH_FEATURE_ENABLED` the moment the backend adds it, without a rewrite.
   */
  gateStatus?: OnboardingProjectGateStatus;
  /** Same caveat as {@link gateStatus}. */
  scanHealth?: OnboardingProjectScanHealth;

  /** Not part of the current contract — see `STALE_PROJECTS_FEATURE_ENABLED`. */
  isStale?: boolean;
}

export enum OnboardingRepositoriesVisibility {
  All = 'ALL',
  Private = 'PRIVATE',
  Public = 'PUBLIC',
}

interface OnboardingRepositoriesPage {
  pageIndex: number;
  pageSize: number;
  total: number;
}

/** Params accepted by {@link useOnboardingRepositoriesQuery}, normalized across products. */
export interface OnboardingRepositoriesQuery {
  /** SQ-Server only: the DOP setting to scope the repository search to. */
  dopSettingId?: string;
  /** SQ-Server only: the GitHub organization to scope the repository search to. */
  githubOrganization?: string;
  pageIndex: number;
  pageSize: number;
  q?: string;
  visibility: OnboardingRepositoriesVisibility;
}

/**
 * Normalized response of the repositories adapter query. Concrete adapters fetch from different
 * transports and map into this shared shape so the feature-level `RepositoriesTable` stays product-agnostic.
 */
export interface OnboardingRepositoriesResponse {
  page: OnboardingRepositoriesPage;
  repositories: OnboardingRepository[];
}

/**
 * Normalized DevOps platform configuration entry returned by the `useOnboardingDopSettingsQuery`
 * adapter hook. On SQ-Server, each entry corresponds to a bound DOP setting the admin configured.
 */
export interface OnboardingDopSetting {
  /** Stable identifier used as the select value. */
  id: string;
  /** Human-readable label (the admin-given config key) shown in the platform dropdown. */
  key: string;
  /** The ALM platform type, used to derive the subtitle and icon. */
  type: OnboardingAlm;
}

/**
 * `data` shape returned by both `useOnboardingDopSettingsQuery` adapter implementations. Widened
 * to include `null` so the SQ-Cloud stub can signal "platform selector not applicable" without
 * diverging from the SQ-Server hook's full `UseQueryResult` shape.
 */
export type OnboardingDopSettingsQueryData = OnboardingDopSetting[] | null;

/**
 * Discovered repository as displayed in the "Import repositories" table. A subset of what
 * an imported project (see {@link OnboardingProject}) carries, since not-yet-imported repositories
 * have no scan/gate/coverage data.
 */
export interface OnboardingRepository {
  alm: OnboardingAlm | null;
  id: string;
  isImported: boolean;
  isPrivate: boolean;
  name: string;
  slug?: string;
}
