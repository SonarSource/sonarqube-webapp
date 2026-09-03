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
  OnboardingProject,
  OnboardingProjectAnalysisMode,
  OnboardingProjectScanHealth,
  OnboardingProjectScanStatus,
} from '~shared/types/onboarding';
import { PROJECT_HEALTH_FEATURE_ENABLED } from '../../types/types';

/** Every action the row menu of a project table can offer. */
export enum ProjectRowAction {
  ConfigureCi = 'CONFIGURE_CI',
  HowToRunNewScan = 'HOW_TO_RUN_NEW_SCAN',
  RerunAutomaticAnalysis = 'RERUN_AUTOMATIC_ANALYSIS',
  RestoreAccess = 'RESTORE_ACCESS',
  ViewProject = 'VIEW_PROJECT',
}

export const PROJECT_ROW_ACTION_LABEL_KEYS: Record<ProjectRowAction, string> = {
  [ProjectRowAction.ConfigureCi]: 'onboarding_dashboard.projects.action.configure_ci',
  [ProjectRowAction.HowToRunNewScan]: 'onboarding_dashboard.projects.action.how_to_run_new_scan',
  [ProjectRowAction.RerunAutomaticAnalysis]:
    'onboarding_dashboard.projects.action.rerun_automatic_analysis',
  [ProjectRowAction.RestoreAccess]: 'onboarding_dashboard.projects.action.restore_access',
  [ProjectRowAction.ViewProject]: 'onboarding_dashboard.projects.action.view_project',
};

/** Imported but never analysed: the user needs to get a first scan running. */
const NOT_SCANNED_ACTIONS = [
  ProjectRowAction.ConfigureCi,
  ProjectRowAction.RestoreAccess,
  ProjectRowAction.ViewProject,
];

/** Analysed by automatic analysis: can be re-run, or upgraded to a full CI scan. */
const AUTOSCAN_ACTIONS = [
  ProjectRowAction.ConfigureCi,
  ProjectRowAction.RerunAutomaticAnalysis,
  ProjectRowAction.RestoreAccess,
  ProjectRowAction.ViewProject,
];

/** Analysed by a CI pipeline: nothing to configure, only guidance on scanning again. */
const CI_SCAN_ACTIONS = [ProjectRowAction.HowToRunNewScan, ProjectRowAction.ViewProject];

/**
 * Fallback for the states the design doesn't cover — a failed scan, or an analysed project with no
 * CI/automatic analysis mode (a local scan). None of the remediation actions is known to apply, so
 * only the always-safe one is offered.
 */
const VIEW_ONLY_ACTIONS = [ProjectRowAction.ViewProject];

/**
 * Menus of the analysed projects, keyed by analysis mode. Adding an analysis mode to the design
 * means adding an entry here, not another branch in {@link getProjectRowActions}.
 */
const ANALYSED_ACTIONS_BY_ANALYSIS_MODE: Partial<
  Record<OnboardingProjectAnalysisMode, readonly ProjectRowAction[]>
> = {
  [OnboardingProjectAnalysisMode.Ci]: CI_SCAN_ACTIONS,
  [OnboardingProjectAnalysisMode.Automatic]: AUTOSCAN_ACTIONS,
};

/**
 * Actions that require the "Create projects" permission. When the user lacks this permission, the
 * row menu is replaced by a permission popover so they understand why nothing happens.
 */
export const PERMISSION_REQUIRED_ACTIONS = new Set([
  ProjectRowAction.ConfigureCi,
  ProjectRowAction.RerunAutomaticAnalysis,
  ProjectRowAction.RestoreAccess,
]);

/**
 * The actions offered for a project, in the order the design lists them.
 *
 * The states are discriminated the same way {@link getOnboardingBadge} picks the scan status badge
 * — failed, then analysed (by analysis mode), then not yet scanned — so the menu always matches the
 * badge the user sees in the same row. There's no "import this repository" entry: this endpoint
 * only ever lists imported projects.
 */
export function getProjectRowActions(project: OnboardingProject): readonly ProjectRowAction[] {
  if (PROJECT_HEALTH_FEATURE_ENABLED && project.scanHealth === OnboardingProjectScanHealth.Failed) {
    return VIEW_ONLY_ACTIONS;
  }

  if (project.scanStatus === OnboardingProjectScanStatus.Scanned) {
    return ANALYSED_ACTIONS_BY_ANALYSIS_MODE[project.analysisMode] ?? VIEW_ONLY_ACTIONS;
  }

  return NOT_SCANNED_ACTIONS;
}
