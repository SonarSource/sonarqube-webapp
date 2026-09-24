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

import { render, renderHook, screen } from '@testing-library/react';
import { addons } from '~sq-server-addons/index';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { mockIssue } from '~sq-server-commons/helpers/testMocks';
import { Component } from '~sq-server-commons/types/types';
import { useAdditionalIssueActions } from '../useAdditionalIssueActions';

jest.mock('~sq-server-addons/index', () => ({
  addons: {},
}));

afterEach(() => {
  addons.remediationAgent = undefined;
  addons.jira = undefined;
});

const issue = mockIssue();

function setup(
  args: {
    branch?: string;
    component?: Component;
    remediationAgentProjectKey?: string;
  } = {},
) {
  return renderHook(() =>
    useAdditionalIssueActions({
      branch: undefined,
      component: undefined,
      remediationAgentProjectKey: undefined,
      ...args,
    }),
  );
}

describe('useAdditionalIssueActions', () => {
  it('returns no actions when neither addon is available', () => {
    const { result } = setup({
      component: mockComponent(),
      remediationAgentProjectKey: 'my-project',
    });

    expect(result.current).toHaveLength(0);
  });

  it('does not add the remediation agent action when the addon is available but no project key is given', () => {
    addons.remediationAgent = { IssueAssignToAgentButton: () => null } as unknown as NonNullable<
      typeof addons.remediationAgent
    >;

    const { result } = setup();

    expect(result.current).toHaveLength(0);
  });

  it('adds the remediation agent action, threading branch/issue/projectKey through, when both are available', () => {
    addons.remediationAgent = {
      IssueAssignToAgentButton: ({
        branch,
        issue: actionIssue,
        projectKey,
      }: Readonly<{ branch?: string; issue: { key: string }; projectKey: string }>) => (
        <button type="button">{`agent:${projectKey}:${actionIssue.key}:${branch}`}</button>
      ),
    } as unknown as NonNullable<typeof addons.remediationAgent>;

    const { result } = setup({ branch: 'main', remediationAgentProjectKey: 'my-project' });

    expect(result.current).toHaveLength(1);
    const [Action] = result.current;
    render(<Action issue={issue} />);

    expect(
      screen.getByRole('button', { name: `agent:my-project:${issue.key}:main` }),
    ).toBeInTheDocument();
  });

  it('does not add the jira action when the addon is available but no component is given', () => {
    addons.jira = { IssueJiraWorkItem: () => null } as unknown as NonNullable<typeof addons.jira>;

    const { result } = setup({ remediationAgentProjectKey: 'my-project' });

    expect(result.current).toHaveLength(0);
  });

  it('adds the jira action, threading component/issue through, when both are available', () => {
    const component = mockComponent({ key: 'my-project' });
    addons.jira = {
      IssueJiraWorkItem: ({
        component: actionComponent,
        issue: actionIssue,
      }: Readonly<{ component: { key: string }; issue: { key: string } }>) => (
        <span>{`jira:${actionComponent.key}:${actionIssue.key}`}</span>
      ),
    } as unknown as NonNullable<typeof addons.jira>;

    const { result } = setup({ component });

    expect(result.current).toHaveLength(1);
    const [Action] = result.current;
    render(<Action issue={issue} />);

    expect(screen.getByText(`jira:${component.key}:${issue.key}`)).toBeInTheDocument();
  });

  it('adds both actions, remediation agent before jira, when both addons and their required props are available', () => {
    addons.remediationAgent = {
      IssueAssignToAgentButton: () => <button type="button">agent-action</button>,
    } as unknown as NonNullable<typeof addons.remediationAgent>;
    addons.jira = {
      IssueJiraWorkItem: () => <span>jira-action</span>,
    } as unknown as NonNullable<typeof addons.jira>;

    const { result } = setup({
      component: mockComponent(),
      remediationAgentProjectKey: 'my-project',
    });

    expect(result.current).toHaveLength(2);
    const [First, Second] = result.current;
    render(
      <>
        <First issue={issue} />
        <Second issue={issue} />
      </>,
    );

    expect(screen.getByText('agent-action')).toBeInTheDocument();
    expect(screen.getByText('jira-action')).toBeInTheDocument();
  });
});
