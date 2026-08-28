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

import {
  OnboardingProjectAnalysisMode,
  OnboardingProjectScanStatus,
  OnboardingProjectsGateStatusFilter,
  OnboardingRepositoriesVisibility,
} from '~shared/types/onboarding';

/** The three onboarding steps, in order, that the dashboard guides users through. */
export enum JourneyStep {
  Binding = 'BINDING',
  Repositories = 'REPOSITORIES',
  Projects = 'PROJECTS',
}

/** How the left slot of the card is rendered, depending on the step and binding state. */
export enum StepCardVisual {
  AvatarUnbound = 'AVATAR_UNBOUND',
  AvatarDone = 'AVATAR_DONE',
  CountRing = 'COUNT_RING',
  RingLocked = 'RING_LOCKED',
  Donut = 'DONUT',
}

/**
 * Progressive-disclosure level of the dashboard. Controls which statistics/tables are unlocked:
 * - `Unbound`: nothing bound yet — only the binding step + a locked statistics placeholder.
 * - `BoundNoImport`: bound but no repositories imported — onboarding chart + "unlock more" placeholder.
 * - `Imported`: at least one repository imported — onboarding chart + the all-projects table.
 */
export enum JourneyLevel {
  Unbound = 'UNBOUND',
  BoundNoImport = 'BOUND_NO_IMPORT',
  Imported = 'IMPORTED',
}

/**
 * View model for the onboarding dashboard, derived once from `OnboardingOverview` by
 * {@link deriveJourneyState}. Every field is a primitive ready for rendering, so the presentational
 * components never need to reach back into the raw API shape.
 */
export interface JourneyState {
  /** The step selected by default (first incomplete step). */
  activeStep: JourneyStep;
  /** Breakdown for the "Analyze your projects" panel. */
  analyze: {
    notImported: number;
    notScanned: number;
  };
  /** Number of projects that have been analysed (scanned). */
  analyzed: number;
  /** Analysed projects as a percentage of total projects, 0–100. */
  analyzedPct: number;
  /** Number of configured DevOps platform integrations. 0 or 1 on products that bind to one. */
  configured: number;
  /** Total repositories discovered on the bound DevOps platform(s). */
  discovered: number;
  /** Number of repositories imported into SonarQube. */
  imported: number;
  /** Imported repositories as a percentage of discovered, 0–100. */
  importedPct: number;
  /** Whether the organization is bound to at least one DevOps platform. */
  isBound: boolean;
  /** Progressive-disclosure level controlling which sections are unlocked. */
  level: JourneyLevel;
  /** Repositories discovered but not yet imported. */
  notYetImported: number;
  /** Overall onboarding maturity percentage shown in the header ring, 0–100. */
  overallPct: number;
  /** Total number of projects across the organization. */
  totalProjects: number;
}

/**
 * The backend's dimension-agnostic "no constraint" token, reused as the value of every dropdown's
 * "All" option so the select always holds a value and needs no synthetic sentinel.
 */
export const ANY_PROJECTS_FILTER = 'all' as const;

export interface ProjectFilterOption<T extends string> {
  labelKey: string;
  value: T;
}

export type ScanStatusFilterValue = OnboardingProjectScanStatus | typeof ANY_PROJECTS_FILTER;

export type AnalysisModeFilterValue = OnboardingProjectAnalysisMode | typeof ANY_PROJECTS_FILTER;

export type GateStatusFilterValue = OnboardingProjectsGateStatusFilter | typeof ANY_PROJECTS_FILTER;

/**
 * Options of the dropdowns shown above the project tables. Filtering itself is done server-side —
 * these only drive the option labels/order.
 */
export const SCAN_STATUS_FILTER_OPTIONS: ReadonlyArray<ProjectFilterOption<ScanStatusFilterValue>> =
  [
    { labelKey: 'onboarding_dashboard.projects.filter.all', value: ANY_PROJECTS_FILTER },
    {
      labelKey: 'onboarding_dashboard.projects.filter.scanned',
      value: OnboardingProjectScanStatus.Scanned,
    },
    {
      labelKey: 'onboarding_dashboard.projects.filter.not_scanned',
      value: OnboardingProjectScanStatus.NotScanned,
    },
  ];

export const ANALYSIS_MODE_FILTER_OPTIONS: ReadonlyArray<
  ProjectFilterOption<AnalysisModeFilterValue>
> = [
  { labelKey: 'onboarding_dashboard.projects.filter.all', value: ANY_PROJECTS_FILTER },
  {
    labelKey: 'onboarding_dashboard.projects.filter.ci',
    value: OnboardingProjectAnalysisMode.Ci,
  },
  {
    labelKey: 'onboarding_dashboard.projects.filter.autoscan',
    value: OnboardingProjectAnalysisMode.Automatic,
  },
  {
    labelKey: 'onboarding_dashboard.projects.filter.no_analysis_mode',
    value: OnboardingProjectAnalysisMode.None,
  },
];

/**
 * Reuses the gate status labels of `GateStatusBadge` so filter and badge wording stay in sync.
 * Dead until `PROJECT_HEALTH_FEATURE_ENABLED` is flipped — the backend doesn't serve gate status
 * on `/onboarding/projects` yet.
 */
export const GATE_STATUS_FILTER_OPTIONS: ReadonlyArray<ProjectFilterOption<GateStatusFilterValue>> =
  [
    { labelKey: 'onboarding_dashboard.projects.filter.all', value: ANY_PROJECTS_FILTER },
    { labelKey: 'metric.level.OK', value: OnboardingProjectsGateStatusFilter.GatePassed },
    { labelKey: 'metric.level.ERROR', value: OnboardingProjectsGateStatusFilter.GateFailed },
    {
      labelKey: 'onboarding_dashboard.projects.gate.not_computed',
      value: OnboardingProjectsGateStatusFilter.GateNotComputed,
    },
  ];

/**
 * Quality gate status and "scan failed" health aren't part of the current `/onboarding/projects`
 * contract — every real response omits them. Flip this once the backend adds them to light back up
 * the gate-status column/filter/badge and the failed-scan badge, without touching the components.
 */
export const PROJECT_HEALTH_FEATURE_ENABLED = false;

/**
 * Staleness isn't part of the current `/onboarding/projects` contract. Flip this once the backend
 * adds it to bring back the "Commits not being scanned" card.
 */
export const STALE_PROJECTS_FEATURE_ENABLED = false;

/** Filter dropdown options for the repositories modal. */
export const REPOSITORY_VISIBILITY_FILTER_OPTIONS: ReadonlyArray<
  ProjectFilterOption<OnboardingRepositoriesVisibility>
> = [
  {
    labelKey: 'onboarding_dashboard.projects.filter.all',
    value: OnboardingRepositoriesVisibility.All,
  },
  {
    labelKey: 'onboarding_dashboard.repositories.filter.private',
    value: OnboardingRepositoriesVisibility.Private,
  },
  {
    labelKey: 'onboarding_dashboard.repositories.filter.public',
    value: OnboardingRepositoriesVisibility.Public,
  },
];
