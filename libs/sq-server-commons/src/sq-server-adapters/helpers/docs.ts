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

import type { DocLink } from '../../helpers/doc-links';
import { useUncataloguedDocUrl } from '../../helpers/docs';

/**
 * SharedDocLink entries are consistent across cloud and server.
 * Though they may not necessarily have the same URL,
 * they deal with the same subject matter */
export enum SharedDocLink {
  AnalyzingDependencies = '/advanced-security/analyzing-projects-for-dependencies/',
  ArchitectureModel = '/design-and-architecture/configuring-the-architecture-analysis/',
  ArchitectureModelDeclaration = '/design-and-architecture/configuring-the-architecture-analysis/#declaration',
  DependencyRisks = '/advanced-security/reviewing-and-fixing-dependency-risks/',
  JiraIntegration = '/instance-administration/jira-integration',
  JiraIntegrationProjectBinding = '/project-administration/jira-integration',
  JiraIntegrationTroubleshooting = '/instance-administration/jira-integration#troubleshooting',
  LicenseProfiles = '/advanced-security/managing-license-profiles-and-policies/',
  NewCodeDefinition = '/user-guide/about-new-code#new-code-definitions',
  SCATroubleshooting = '/advanced-security/troubleshooting/',
}

/**
 * Returns a URL for a shared documentation link.
 * Only use this for SharedDocLink entries.
 * For other documentation links, use `useDocUrl` instead.
 */
export function useSharedDocUrl(to: SharedDocLink | DocLink): string;
export function useSharedDocUrl(): (to: SharedDocLink | DocLink) => string;
export function useSharedDocUrl(to?: SharedDocLink | DocLink) {
  return useUncataloguedDocUrl(to);
}
