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

/** Every action the row menu of the DevOps platform configurations table can offer. */
export enum DevopsConfigurationRowAction {
  ImportRepositories = 'IMPORT_REPOSITORIES',
  AnalyzeProjects = 'ANALYZE_PROJECTS',
  ViewOnPlatform = 'VIEW_ON_PLATFORM',
}

export const DEVOPS_CONFIGURATION_ROW_ACTION_LABEL_KEYS: Record<
  DevopsConfigurationRowAction,
  string
> = {
  [DevopsConfigurationRowAction.ImportRepositories]:
    'onboarding_dashboard.journey.binding.modal.action.import_repositories',
  [DevopsConfigurationRowAction.AnalyzeProjects]:
    'onboarding_dashboard.journey.binding.modal.action.analyze_projects',
  [DevopsConfigurationRowAction.ViewOnPlatform]:
    'onboarding_dashboard.journey.binding.modal.action.view_on_platform',
};

// Every configuration offers the same three, in design order. Whether one can actually be performed
// is decided by useDevopsConfigurationRowActionItems, which drops the entry rather than show it dead.
export function getDevopsConfigurationRowActions(): readonly DevopsConfigurationRowAction[] {
  return [
    DevopsConfigurationRowAction.ImportRepositories,
    DevopsConfigurationRowAction.AnalyzeProjects,
    DevopsConfigurationRowAction.ViewOnPlatform,
  ];
}
