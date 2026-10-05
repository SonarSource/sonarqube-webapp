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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byText } from '~shared/helpers/testSelector';
import {
  FILE3_KEY,
  HUNTER_AGENT_RULE,
  ISSUE_4,
  ISSUE_TO_RULE,
  PARENT_COMPONENT_KEY,
} from '~sq-server-commons/api/mocks/data/ids';
import type * as RulesApi from '~sq-server-commons/api/rules';
import { mockRawIssue } from '~sq-server-commons/helpers/testMocks';
import {
  branchHandler,
  componentsHandler,
  issuesHandler,
  modeHandler,
  usersHandler,
} from '~sq-server-commons/utils/issues-test-utils';
import { renderProjectIssuesApp } from '../test-utils';

// Matches a file registered by default in ComponentsServiceMock, so the code viewer can resolve it.
const REGISTERED_COMPONENT = `${PARENT_COMPONENT_KEY}:${FILE3_KEY}`;

// IssuesServiceMock registers its mock implementation via `jest.mock('../../api/rules')`, so this
// must be fetched lazily from the mock registry rather than imported at module scope, which would
// bind to the real module if evaluated before that mock registration runs.
const getRuleDetailsMock = () =>
  jest.mocked(jest.requireMock<typeof RulesApi>('~sq-server-commons/api/rules').getRuleDetails);

jest.mock('../sidebar/Sidebar', () => {
  const fakeSidebar = () => {
    return <div data-guiding-id="issue-5" />;
  };
  return {
    __esModule: true,
    default: fakeSidebar,
    Sidebar: fakeSidebar,
  };
});

beforeEach(() => {
  issuesHandler.reset();
  componentsHandler.reset();
  branchHandler.reset();
  usersHandler.reset();
  modeHandler.reset();
  window.scrollTo = jest.fn();
  window.HTMLElement.prototype.scrollTo = jest.fn();
});

it('should navigate to Why is this an issue tab', async () => {
  renderProjectIssuesApp('project/issues?issues=issue2&open=issue2&id=myproject&why=1');

  expect(
    await screen.findByRole(
      'tab',
      { name: `coding_rules.description_section.title.root_cause` },
      { timeout: 10_000 },
    ),
  ).toHaveAttribute('aria-current', 'true');

  expect(byText(/Introduction to this rule/).get()).toBeInTheDocument();
});

it('should show education principles', async () => {
  const user = userEvent.setup();
  renderProjectIssuesApp('project/issues?issues=issue2&open=issue2&id=myproject');
  await user.click(
    await screen.findByRole(
      'tab',
      { name: `coding_rules.description_section.title.more_info` },
      { timeout: 10_000 },
    ),
  );
  expect(screen.getByRole('heading', { name: 'Defense-in-depth', level: 3 })).toBeInTheDocument();
});

it('should hide the rule description context selector for Hunter agent issues', async () => {
  const user = userEvent.setup();
  const issueKey = 'hunterAgentIssue';
  issuesHandler.setIssueList([
    {
      issue: mockRawIssue(false, {
        key: issueKey,
        component: REGISTERED_COMPONENT,
        rule: HUNTER_AGENT_RULE,
        externalRuleEngine: 'hunter-agent',
        ruleDescriptionContextKey: 'spring',
      }),
      snippets: {},
    },
  ]);

  renderProjectIssuesApp(`project/issues?issues=${issueKey}&open=${issueKey}&id=myproject`);

  await user.click(
    await screen.findByRole(
      'tab',
      { name: 'coding_rules.description_section.title.assess_the_problem' },
      { timeout: 10_000 },
    ),
  );
  expect(byText(/Assess content/).get()).toBeInTheDocument();
  expect(screen.queryByRole('radio', { name: 'Spring' })).not.toBeInTheDocument();

  await user.click(
    screen.getByRole('tab', { name: 'coding_rules.description_section.title.more_info' }),
  );
  expect(byText(/Resources content/).get()).toBeInTheDocument();
  expect(screen.queryByRole('radio', { name: 'Spring' })).not.toBeInTheDocument();
});

it('should send the issue rule description context key for Hunter Agent issues, and only render that context', async () => {
  const user = userEvent.setup();
  const issueKey = 'hunterAgentIssue';
  issuesHandler.setIssueList([
    {
      issue: mockRawIssue(false, {
        key: issueKey,
        component: REGISTERED_COMPONENT,
        rule: HUNTER_AGENT_RULE,
        externalRuleEngine: 'hunter-agent',
        ruleDescriptionContextKey: 'spring',
      }),
      snippets: {},
    },
  ]);

  renderProjectIssuesApp(`project/issues?issues=${issueKey}&open=${issueKey}&id=myproject`);

  await screen.findByRole('tab', {
    name: 'coding_rules.description_section.title.root_cause',
  });

  expect(getRuleDetailsMock()).toHaveBeenCalledWith(
    expect.objectContaining({ contextKey: 'spring', key: HUNTER_AGENT_RULE }),
  );

  // The mock actually filters descriptionSections by the requested contextKey, so only the
  // 'spring' section comes back from the API and the competing 'other' context never renders.
  await user.click(
    screen.getByRole('tab', {
      name: 'coding_rules.description_section.title.assess_the_problem',
    }),
  );
  expect(byText(/Assess content/).get()).toBeInTheDocument();
  expect(screen.queryByText(/Other framework content/)).not.toBeInTheDocument();
});

it('should not send a rule description context key for a regular (non Hunter Agent) issue, and render its full description', async () => {
  renderProjectIssuesApp('project/issues?issues=issue4&open=issue4&id=myproject&why=1');

  await screen.findByRole('tab', {
    name: 'coding_rules.description_section.title.root_cause',
  });

  expect(getRuleDetailsMock()).toHaveBeenCalledWith(
    expect.objectContaining({ contextKey: undefined, key: ISSUE_TO_RULE[ISSUE_4] }),
  );

  // No contextKey means no filtering, so the rule's description renders as-is.
  expect(byText(/Default description/).get()).toBeInTheDocument();
});
