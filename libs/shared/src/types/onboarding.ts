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

export interface RepositoriesDiscoveredCard {
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

export interface ProjectsOnboardedCard {
  importedEmpty: number;
  onboarded: number;
  percentOfImported: number | null;
  totalProjects: number;
}

export interface ScanHealthCard {
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

export interface PrIntegrationCard {
  percentOfOnboarded: number | null;
  prDecorationCount: number;
}

type OnboardingChecklistStatus = 'DONE' | 'IN_PROGRESS' | 'NOT_STARTED' | 'UNKNOWN';

type OnboardingMaturityLabel = 'Starting' | 'Growing' | 'Established' | 'Advanced';

export interface OnboardingChecklist {
  items: OnboardingChecklistItem[];
  maturityLabel: OnboardingMaturityLabel;
  overallMaturityPct: number;
}

export interface OnboardingChecklistItem {
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

export interface ScanConfigurationChart {
  ci: number;
  local: number;
  managed: number;
  notOnboarded: number | null;
}

export interface QualityGateStatusChart {
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

export type OnboardingProjectsFilter =
  | 'all'
  | 'fully_onboarded'
  | 'needs_attention'
  | 'not_onboarded'
  | 'failed_scans'
  | 'autoscan'
  | 'stale'
  | 'local';

export type OnboardingProjectsFilterCounts = Record<OnboardingProjectsFilter, number>;

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
