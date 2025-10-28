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

import { Spinner } from '@sonarsource/echoes-react';
import { groupBy } from 'lodash';
import * as React from 'react';
import { addons } from '~sq-server-addons/index';
import IssueItem from '~sq-server-commons/components/issue/Issue';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Component, Issue } from '~sq-server-commons/types/types';
import ComponentBreadcrumbs from './ComponentBreadcrumbs';

interface IssuesListProps {
  branchLike: BranchLike | undefined;
  checked: string[];
  component: Component | undefined;
  issues: Issue[];
  onIssueChange: (issue: Issue) => void;
  onIssueCheck: ((issueKey: string) => void) | undefined;
  onIssueSelect: (issueKey: string) => void;
  onPopupToggle: (issue: string, popupName: string, open?: boolean) => void;
  openPopup: { issue: string; name: string } | undefined;
  selectedIssue: Issue | undefined;
}

export default function IssuesList({
  branchLike,
  checked,
  component,
  issues,
  onIssueChange,
  onIssueCheck,
  onIssueSelect,
  onPopupToggle,
  openPopup,
  selectedIssue,
}: Readonly<IssuesListProps>) {
  const [prerender, setPrerender] = React.useState(true);

  const issuesByComponent = React.useMemo(
    () => groupBy(issues, (issue) => `(${issue.component} : ${issue.branch})`),
    [issues],
  );

  const additionalIssueActions = React.useMemo(() => {
    const additionalActions = [] as Required<
      React.ComponentProps<typeof IssueItem>
    >['additionalIssueActions'];

    if (addons.jira !== undefined && component !== undefined) {
      const JiraWorkItemComponent = addons.jira.IssueJiraWorkItem;
      additionalActions.push(({ issue }) => (
        <JiraWorkItemComponent component={component} issue={issue} />
      ));
    }

    return additionalActions;
  }, [component]);

  React.useEffect(() => {
    if (issues.length > 0) {
      setPrerender(false);
    }
  }, [issues]);

  return (
    <Spinner isLoading={prerender}>
      <ul>
        {Object.entries(issuesByComponent).map(([key, issues]: [string, Issue[]]) => (
          <li key={key}>
            <ComponentBreadcrumbs component={component} issue={issues[0]} />
            <ul>
              {issues.map((issue) => (
                <IssueItem
                  additionalIssueActions={additionalIssueActions}
                  branchLike={branchLike}
                  checked={checked.includes(issue.key)}
                  issue={issue}
                  key={issue.key}
                  onChange={onIssueChange}
                  onCheck={onIssueCheck}
                  onPopupToggle={onPopupToggle}
                  onSelect={onIssueSelect}
                  openPopup={
                    openPopup && openPopup.issue === issue.key ? openPopup.name : undefined
                  }
                  selected={selectedIssue != null && selectedIssue.key === issue.key}
                />
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Spinner>
  );
}
