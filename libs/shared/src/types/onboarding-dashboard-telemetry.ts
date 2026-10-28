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

import { JourneyState, JourneyStep, OnboardingProject } from './onboarding';

export enum OnboardingDashboardSurface {
  AllProjectsTable = 'all_projects_table',
  BindingPanel = 'binding_panel',
  ConfigureProjectsModal = 'configure_projects_modal',
  ImportRepositoriesModal = 'import_repositories_modal',
  ProjectsPanel = 'projects_panel',
  RepositoriesPanel = 'repositories_panel',
  StaleProjectsTable = 'stale_projects_table',
  StatisticsPlaceholder = 'statistics_placeholder',
}

export enum OnboardingDashboardAction {
  BindOrganization = 'bind_organization',
  BindProject = 'bind_project',
  ConfigureCi = 'configure_ci',
  ConfigureProject = 'configure_project',
  ConfigureScanners = 'configure_scanners',
  DisableAutoImport = 'disable_auto_import',
  EnableAutoImport = 'enable_auto_import',
  HowToRunNewScan = 'how_to_run_new_scan',
  OpenProjectActions = 'open_project_actions',
  OpenRepositoriesImport = 'open_repositories_import',
  OpenRepositoryAccessSettings = 'open_repository_access_settings',
  RerunAutomaticAnalysis = 'rerun_automatic_analysis',
  RestoreProjectAccess = 'restore_project_access',
  ViewAllRepositories = 'view_all_repositories',
  ViewBindingSettings = 'view_binding_settings',
  ViewProject = 'view_project',
}

export enum OnboardingDashboardFilter {
  AnalysisMode = 'analysis_mode',
  DevopsPlatform = 'devops_platform',
  GateStatus = 'gate_status',
  RepositoryVisibility = 'repository_visibility',
  ScanStatus = 'scan_status',
}

export enum OnboardingDashboardBlockedReason {
  MissingCreateProjectsPermission = 'missing_create_projects_permission',
}

export enum RepositoriesImportMethod {
  Bulk = 'bulk',
  Selected = 'selected',
}

export interface OnboardingDashboardTelemetryScope {
  surface?: OnboardingDashboardSurface;
  visitId: string;
}

export interface OnboardingDashboardTelemetry {
  trackActionBlocked: (
    event: OnboardingDashboardTelemetryScope & {
      action: OnboardingDashboardAction;
      reason: OnboardingDashboardBlockedReason;
    },
  ) => void;
  trackActionSelected: (
    event: OnboardingDashboardTelemetryScope & {
      action: OnboardingDashboardAction;
      project?: OnboardingProject;
    },
  ) => void;
  trackFilterChanged: (
    event: OnboardingDashboardTelemetryScope & { filter: OnboardingDashboardFilter; value: string },
  ) => void;
  trackImportRequested: (
    event: OnboardingDashboardTelemetryScope & {
      importMethod: RepositoriesImportMethod;
      importRequestId: string;
      selectedCount?: number;
    },
  ) => void;
  trackStepSelected: (
    event: OnboardingDashboardTelemetryScope & {
      previousStep: JourneyStep;
      selectedStep: JourneyStep;
    },
  ) => void;
  trackViewed: (event: OnboardingDashboardTelemetryScope & { journeyState?: JourneyState }) => void;
}
