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

import { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { byText } from '../../../helpers/testSelector';
import { RuleStatus } from '../../../types/rules';
import { IssueProperties } from '../IssueProperties';

describe('external rule engine', () => {
  it('renders the badge and Properties label when externalRuleEngine is set', () => {
    setupWithProps({ issue: { externalRuleEngine: 'eslint' } });

    expect(byText('issue.details.properties').get()).toBeInTheDocument();
    expect(byText('eslint').get()).toBeInTheDocument();
  });

  it('does not render when externalRuleEngine is absent', () => {
    setupWithProps();

    expect(byText('issue.details.properties').query()).not.toBeInTheDocument();
  });

  it('renders both ADVANCED SAST and the engine badge in the same Properties section', () => {
    setupWithProps({
      issue: { internalTags: ['taint', 'advanced'], externalRuleEngine: 'eslint' },
    });

    expect(byText('issue.details.properties').get()).toBeInTheDocument();
    expect(byText('ADVANCED SAST').get()).toBeInTheDocument();
    expect(byText('eslint').get()).toBeInTheDocument();
  });
});

describe('internalTags', () => {
  it('renders when internalTags contains both taint and advanced', () => {
    setupWithProps({ issue: { internalTags: ['taint', 'advanced'] } });

    expect(byText('ADVANCED SAST').get()).toBeVisible();
  });

  it('does not render when only taint tag is present', () => {
    setupWithProps({ issue: { internalTags: ['taint'] } });

    expect(byText('ADVANCED SAST').query()).not.toBeInTheDocument();
  });

  it('does not render when internalTags is absent', () => {
    setupWithProps();

    expect(byText('ADVANCED SAST').query()).not.toBeInTheDocument();
  });
});

describe('beta rule status', () => {
  it('renders the badge and Properties label when rule status is Beta', () => {
    setupWithProps({ rule: { status: RuleStatus.Beta } });

    expect(byText('issue.details.properties').get()).toBeInTheDocument();
    expect(byText('rules.status.BETA').get()).toBeInTheDocument();
  });

  it('does not render when rule status is not Beta', () => {
    setupWithProps({ rule: { status: RuleStatus.Ready } });

    expect(byText('issue.details.properties').query()).not.toBeInTheDocument();
    expect(byText('rules.status.BETA').query()).not.toBeInTheDocument();
  });

  it('does not render when rule is absent', () => {
    setupWithProps();

    expect(byText('rules.status.BETA').query()).not.toBeInTheDocument();
  });

  it('renders both beta badge and external engine badge in the same Properties section', () => {
    setupWithProps({
      rule: { status: RuleStatus.Beta },
      issue: { externalRuleEngine: 'eslint' },
    });

    expect(byText('issue.details.properties').get()).toBeInTheDocument();
    expect(byText('rules.status.BETA').get()).toBeInTheDocument();
    expect(byText('eslint').get()).toBeInTheDocument();
  });

  it('renders beta badge with advanced sast badge in the same Properties section', () => {
    setupWithProps({
      rule: { status: RuleStatus.Beta },
      issue: { internalTags: ['taint', 'advanced'] },
    });

    expect(byText('issue.details.properties').get()).toBeInTheDocument();
    expect(byText('rules.status.BETA').get()).toBeInTheDocument();
    expect(byText('ADVANCED SAST').get()).toBeInTheDocument();
  });
});

function setupWithProps(props: Partial<ComponentProps<typeof IssueProperties>> = {}) {
  return renderWithContext(<IssueProperties issue={{}} {...props} />);
}
