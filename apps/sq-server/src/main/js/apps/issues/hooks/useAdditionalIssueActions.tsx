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

import { ComponentType, useMemo } from 'react';
import { addons } from '~sq-server-addons/index';
import { Component, Issue } from '~sq-server-commons/types/types';

export function useAdditionalIssueActions({
  branch,
  component,
  remediationAgentProjectKey,
}: {
  branch: string | undefined;
  component: Component | undefined;
  remediationAgentProjectKey: string | undefined;
}): ComponentType<{ issue: Issue }>[] {
  return useMemo(() => {
    const additionalActions: ComponentType<{ issue: Issue }>[] = [];

    if (
      addons.remediationAgent?.IssueAssignToAgentButton !== undefined &&
      remediationAgentProjectKey !== undefined
    ) {
      const AgentButton = addons.remediationAgent.IssueAssignToAgentButton;
      additionalActions.push(({ issue }) => (
        <AgentButton branch={branch} issue={issue} projectKey={remediationAgentProjectKey} />
      ));
    }

    if (addons.jira !== undefined && component !== undefined) {
      const { IssueJiraWorkItem } = addons.jira;
      additionalActions.push(({ issue }) => (
        <IssueJiraWorkItem component={component} issue={issue} />
      ));
    }

    return additionalActions;
  }, [branch, component, remediationAgentProjectKey]);
}
