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
import { RuleDetails } from '~shared/types/rules';
import { mockIssue, mockRuleDetails } from '../../../helpers/testMocks';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { Issue } from '../../../types/types';
import IssueHeader from '../IssueHeader';

function setup(issueOverrides: Partial<Issue> = {}, ruleOverrides: Partial<RuleDetails> = {}) {
  const issue = mockIssue(false, issueOverrides);
  const ruleDetails = mockRuleDetails({ key: issue.rule, name: issue.ruleName, ...ruleOverrides });

  return renderComponent(
    <IssueHeader
      issue={issue}
      navigation={<nav>tabs</nav>}
      onIssueChange={jest.fn()}
      ruleDetails={ruleDetails}
    />,
  );
}

describe('external rule engine badge', () => {
  it('shows badge for hunter-agent issues', () => {
    setup({ externalRuleEngine: 'hunter-agent' }, { isExternal: true });

    expect(screen.getByText('hunter-agent')).toBeInTheDocument();
  });

  it('shows badge for non-hunter-agent external issues', () => {
    setup({ externalRuleEngine: 'eslint' }, { isExternal: true });

    expect(screen.getByText('eslint')).toBeInTheDocument();
  });
});

describe('external rule key deduplication', () => {
  it('does not show rule key when it matches the rule name', () => {
    setup(
      { externalRuleEngine: 'hunter-agent' },
      {
        key: 'external_hunter-agent:broken-access-control-abc123',
        name: 'hunter-agent:broken-access-control-abc123',
        isExternal: true,
      },
    );

    expect(screen.getAllByText('hunter-agent:broken-access-control-abc123')).toHaveLength(1);
  });

  it('does not show rule key when only the external_ prefix differs from the rule name', () => {
    setup(
      { externalRuleEngine: 'eslint' },
      {
        key: 'external_eslint:no-unused-vars',
        name: 'eslint:no-unused-vars',
        isExternal: true,
      },
    );

    expect(screen.getAllByText('eslint:no-unused-vars')).toHaveLength(1);
  });

  it('shows rule key in parentheses when it differs from the rule name', () => {
    setup(
      { externalRuleEngine: 'eslint' },
      {
        key: 'external_eslint:no-unused-vars',
        name: 'No unused variables',
        isExternal: true,
      },
    );

    expect(screen.getByText('No unused variables')).toBeInTheDocument();
    expect(screen.getByText('(eslint:no-unused-vars)')).toBeInTheDocument();
  });
});
