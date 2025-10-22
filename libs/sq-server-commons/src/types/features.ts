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
  AiCodeAssurance = 'ai-code-assurance',
  Announcement = 'announcement',
  Architecture = 'architecture-project',
  BranchSupport = 'branch-support',
  FixSuggestions = 'fix-suggestions',
  FixSuggestionsMarketing = 'fix-suggestions-marketing',
  FromSonarQubeUpdate = 'from-sonarqube-update',
  GithubProvisioning = 'github-provisioning',
  GitlabProvisioning = 'gitlab-provisioning',
  JiraIntegration = 'jira',
  LoginMessage = 'login-message',
  MonoRepositoryPullRequestDecoration = 'monorepo',
  MultipleAlm = 'multiple-alm',
  PrioritizedRules = 'prioritized-rules',
  ProjectImport = 'project-import',
  RegulatoryReport = 'regulatory-reports',
  Sca = 'sca',
  Scim = 'scim',
}
