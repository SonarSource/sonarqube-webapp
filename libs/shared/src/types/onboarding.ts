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

/**
 * Response of `GET /api/v2/onboarding/overview`.
 *
 * The endpoint returns `cards`, `checklist`, `momentum`, `charts` and
 * `devopsPlatforms` sections, all consumed by the dashboard.
 */
export interface OnboardingOverview {
  cards: OnboardingCards;
  charts: OnboardingCharts;
  checklist: OnboardingChecklist;
  devopsPlatforms: OnboardingDevopsPlatforms;
  momentum: OnboardingMomentum;
}

interface OnboardingCards {
  prIntegration: PrIntegrationCard;
  projectsOnboarded: ProjectsOnboardedCard;
  repositoriesDiscovered: RepositoriesDiscoveredCard;
  scanHealth: ScanHealthCard;
  scanMethod: ScanMethodCard;
}

interface RepositoriesDiscoveredCard {
  byAlm: RepositoriesDiscoveredByAlm[];
  discovered: number | null;
  imported: number;
  notYetImported: number | null;
}

interface RepositoriesDiscoveredByAlm {
  alm: OnboardingAlm;
  discovered: number | null;
  imported: number;
}

interface ProjectsOnboardedCard {
  importedEmpty: number;
  onboarded: number;
  percentOfImported: number | null;
  totalProjects: number;
}

interface ScanHealthCard {
  failed: number;
  healthy: number;
}

interface ScanMethodCard {
  byCi: ScanMethodByCi[];
  ci: number;
  local: number;
  managed: number;
}

interface ScanMethodByCi {
  count: number;
  system: string;
}

interface PrIntegrationCard {
  percentOfOnboarded: number | null;
  prDecorationCount: number;
}

type OnboardingChecklistStatus = 'DONE' | 'IN_PROGRESS' | 'NOT_STARTED' | 'UNKNOWN';

type OnboardingMaturityLabel = 'Starting' | 'Growing' | 'Established' | 'Advanced';

interface OnboardingChecklist {
  items: OnboardingChecklistItem[];
  maturityLabel: OnboardingMaturityLabel;
  overallMaturityPct: number;
}

interface OnboardingChecklistItem {
  completed: number | null;
  completionPct: number | null;
  id: string;
  status: OnboardingChecklistStatus;
  total: number | null;
}

export interface OnboardingMomentum {
  currentState: OnboardingMomentumState;
  importedCount: number;
  onboardedCount: number;
  startDate: number | null;
  totalRepos: number | null;
  weeklyDelta: number;
  weeklyHistory: OnboardingMomentumWeek[];
}

interface OnboardingMomentumWeek {
  cumulativeImported: number;
  cumulativeOnboarded: number;
  weekStart: number;
}

interface OnboardingMomentumState {
  ciCount: number;
  failedScanCount: number;
  importedEmptyCount: number;
  localCount: number;
  managedCount: number;
}

interface OnboardingCharts {
  onboardingCoverage: OnboardingCoverageChart;
  qualityGateStatus: QualityGateStatusChart;
  scanConfiguration: ScanConfigurationChart;
}

interface OnboardingCoverageChart {
  failed: number;
  healthy: number;
  notOnboarded: number | null;
}

interface ScanConfigurationChart {
  ci: number;
  local: number;
  managed: number;
  notOnboarded: number | null;
}

interface QualityGateStatusChart {
  failing: number;
  notComputed: number;
  notOnboarded: number | null;
  passing: number;
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

export enum OnboardingProjectOnboarding {
  Analysed = 'ANALYSED',
  ImportedEmpty = 'IMPORTED_EMPTY',
  NotImported = 'NOT_IMPORTED',
}

export enum OnboardingProjectScanMethod {
  Ci = 'CI',
  Local = 'LOCAL',
  Managed = 'MANAGED',
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

/** The legacy filter tabs — the only tokens the backend reports counts for. */
export type OnboardingProjectsCountFilter =
  | 'all'
  | 'fully_onboarded'
  | 'needs_attention'
  | 'not_onboarded'
  | 'failed_scans'
  | 'autoscan'
  | 'stale'
  | 'local';

/** "Scan status" dimension of the `filter` param. */
export enum OnboardingProjectsScanStatusFilter {
  Scanned = 'scanned',
  NotScanned = 'not_scanned',
  NotOnboarded = 'not_onboarded',
}

/** "Analysis mode" dimension of the `filter` param. */
export enum OnboardingProjectsAnalysisModeFilter {
  Ci = 'ci',
  Autoscan = 'autoscan',
  NoAnalysisMode = 'no_analysis_mode',
}

/**
 * "Gate status" dimension of the `filter` param.
 */
export enum OnboardingProjectsGateStatusFilter {
  GatePassed = 'gate_passed',
  GateFailed = 'gate_failed',
  GateNotComputed = 'gate_not_computed',
}

/** "Visibility" dimension of the `filter` param. */
export enum OnboardingProjectsVisibilityFilter {
  Private = 'private',
  Public = 'public',
}

/**
 * Any single token accepted by the `filter` param. Several tokens can be sent comma-separated; the
 * backend ANDs them across dimensions, e.g. `filter=scanned,ci`.
 */
export type OnboardingProjectsFilter =
  | OnboardingProjectsCountFilter
  | OnboardingProjectsScanStatusFilter
  | OnboardingProjectsAnalysisModeFilter
  | OnboardingProjectsGateStatusFilter
  | OnboardingProjectsVisibilityFilter;

export type OnboardingProjectsFilterCounts = Record<OnboardingProjectsCountFilter, number>;

interface OnboardingProjectsPage {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface OnboardingProjectsResponse {
  filterCounts: OnboardingProjectsFilterCounts;
  page: OnboardingProjectsPage;
  projects: OnboardingProject[];
}

export interface OnboardingProject {
  alm: OnboardingAlm | null;
  ciSystem?: string;
  coverage?: number;
  gateStatus: OnboardingProjectGateStatus | null;
  isPrivate: boolean;
  key: string | null;
  language?: string;
  lastActivity?: number;
  lastScan?: number;
  name: string;
  onboarding: OnboardingProjectOnboarding;
  path?: string;
  scanHealth: OnboardingProjectScanHealth | null;
  scanMethod: OnboardingProjectScanMethod | null;
  stale: boolean;
}
