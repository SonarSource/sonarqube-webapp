/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

export enum Feature {
  Architecture = 'architecture-project',
  Announcement = 'announcement',
  BranchSupport = 'branch-support',
  LoginMessage = 'login-message',
  MonoRepositoryPullRequestDecoration = 'monorepo',
  MultipleAlm = 'multiple-alm',
  ProjectImport = 'project-import',
  RegulatoryReport = 'regulatory-reports',
  Sca = 'sca',
  ScaAvailable = 'sca-available',
  Scim = 'scim',
  GithubProvisioning = 'github-provisioning',
  GitlabProvisioning = 'gitlab-provisioning',
  PrioritizedRules = 'prioritized-rules',
  FixSuggestions = 'fix-suggestions',
  FixSuggestionsMarketing = 'fix-suggestions-marketing',
  AiCodeAssurance = 'ai-code-assurance',
}
