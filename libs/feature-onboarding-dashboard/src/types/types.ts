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

import { To } from 'react-router-dom';
import {
  ANY_PROJECTS_FILTER,
  OnboardingProjectScanStatus,
  OnboardingProjectsGateStatusFilter,
  OnboardingRepositoriesVisibility,
  ProjectFilterOption,
} from '~shared/types/onboarding';

/** What activating a row menu entry does. */
export enum RowActionKind {
  Button = 'BUTTON',
  Link = 'LINK',
}

/**
 * Where a row menu entry leads: somewhere to navigate to, or something to run. Shared by every row
 * action list of the dashboard, so their cells can all discriminate on the same {@link RowActionKind}.
 */
export type RowActionTarget =
  | { isExternal?: boolean; kind: RowActionKind.Link; to: To }
  | { kind: RowActionKind.Button; onClick: VoidFunction };

/** How the left slot of the card is rendered, depending on the step and binding state. */
export enum StepCardVisual {
  AvatarUnbound = 'AVATAR_UNBOUND',
  AvatarDone = 'AVATAR_DONE',
  CountRing = 'COUNT_RING',
  RingLocked = 'RING_LOCKED',
  Donut = 'DONUT',
}

export type ScanStatusFilterValue = OnboardingProjectScanStatus | typeof ANY_PROJECTS_FILTER;

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
