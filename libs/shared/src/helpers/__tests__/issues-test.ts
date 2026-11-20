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

import { IssueProducer, IssueTransition } from '../../types/issues';
import {
  getExternalRuleKey,
  isAgentFindingAttachedToBranch,
  isAgentFindingRuleEngine,
  isHunterAgentIssue,
  isHunterAgentRuleEngine,
  isHunterAgentRuleKey,
  orderIssueTransitions,
} from '../issues';

describe('isHunterAgentIssue', () => {
  it.each([
    [{ producer: IssueProducer.HunterAgent }, true],
    [{ producer: IssueProducer.Scanner }, false],
    [{ producer: IssueProducer.SunsetRadar }, false],
    [{ producer: IssueProducer.ReliabilityAgent }, false],
    [
      {
        producer: IssueProducer.ReliabilityAgent,
        externalRuleEngine: 'hunter-agent',
      },
      false,
    ],
    [
      {
        producer: IssueProducer.ReliabilityAgent,
        rule: 'hunter-agent:business-logic',
      },
      false,
    ],
    [{}, false],
    [{ externalRuleEngine: 'hunter-agent' }, true],
    [{ externalRuleEngine: 'Hunter-Agent' }, true],
    [{ rule: 'hunter-agent:business-logic' }, true],
    [{ rule: 'external_hunter-agent:business-logic' }, true],
    [{ rule: 'javascript:S1067' }, false],
    [{ externalRuleEngine: 'eslint' }, false],
    [{ producer: IssueProducer.Scanner, externalRuleEngine: 'hunter-agent' }, false],
    [{ producer: IssueProducer.Scanner, rule: 'hunter-agent:business-logic' }, false],
    [
      {
        producer: IssueProducer.SunsetRadar,
        externalRuleEngine: 'hunter-agent',
      },
      false,
    ],
    [{ producer: IssueProducer.HunterAgent, externalRuleEngine: 'eslint' }, true],
  ])('classifies %j as %s', (issue, expected) => {
    expect(isHunterAgentIssue(issue)).toBe(expected);
  });
});

describe('isHunterAgentRuleEngine', () => {
  it('detects hunter-agent case-insensitively', () => {
    expect(isHunterAgentRuleEngine('hunter-agent')).toBe(true);
    expect(isHunterAgentRuleEngine('HUNTER-AGENT')).toBe(true);
    expect(isHunterAgentRuleEngine('Hunter-Agent')).toBe(true);
  });

  it('returns false for other engines and undefined', () => {
    expect(isHunterAgentRuleEngine('eslint')).toBe(false);
    expect(isHunterAgentRuleEngine('')).toBe(false);
    expect(isHunterAgentRuleEngine()).toBe(false);
  });
});

describe('isAgentFindingRuleEngine', () => {
  it.each([
    'hunter-agent',
    'HUNTER-AGENT',
    'reliability-agent',
    'Reliability-Agent',
    'sunset-radar',
    'Sunset-Radar',
  ])('detects the agent rule engine %s', (engine) => {
    expect(isAgentFindingRuleEngine(engine)).toBe(true);
  });

  it.each(['eslint', 'sunset', 'sunset-radar-2', ''])('rejects the rule engine "%s"', (engine) => {
    expect(isAgentFindingRuleEngine(engine)).toBe(false);
  });

  it('rejects an undefined rule engine', () => {
    expect(isAgentFindingRuleEngine()).toBe(false);
  });
});

describe('isAgentFindingAttachedToBranch', () => {
  it.each([
    ['an agent finding attached to the branch', 'hunter-agent', 'proj', 'proj', true],
    ['a sunset radar finding attached to the branch', 'sunset-radar', 'proj', 'proj', true],
    ['an agent finding attached to a file', 'hunter-agent', 'proj:src/main.js', 'proj', false],
    ['a non-agent issue attached to the branch', 'eslint', 'proj', 'proj', false],
    ['an issue without rule engine attached to the branch', undefined, 'proj', 'proj', false],
  ])('classifies %s', (_, externalRuleEngine, component, projectKey, expected) => {
    expect(isAgentFindingAttachedToBranch({ component, externalRuleEngine, projectKey })).toBe(
      expected,
    );
  });
});

describe('getExternalRuleKey', () => {
  it('strips the external_ prefix', () => {
    expect(getExternalRuleKey('external_hunter-agent:some-rule')).toBe('hunter-agent:some-rule');
    expect(getExternalRuleKey('external_eslint:no-unused-vars')).toBe('eslint:no-unused-vars');
  });

  it('returns the key unchanged when no external_ prefix is present', () => {
    expect(getExternalRuleKey('hunter-agent:some-rule')).toBe('hunter-agent:some-rule');
    expect(getExternalRuleKey('squid:S1337')).toBe('squid:S1337');
  });
});

describe('isHunterAgentRuleKey', () => {
  it('detects a hunter-agent rule key', () => {
    expect(isHunterAgentRuleKey('hunter-agent:rule-test')).toBe(true);
  });

  it('detects a hunter-agent rule key with the external_ prefix', () => {
    expect(isHunterAgentRuleKey('external_hunter-agent:rule-test')).toBe(true);
  });

  it('detects a hunter-agent rule key case-insensitively', () => {
    expect(isHunterAgentRuleKey('external_Hunter-Agent:rule-test')).toBe(true);
  });

  it('returns false for rule keys from other repositories', () => {
    expect(isHunterAgentRuleKey('squid:S1337')).toBe(false);
    expect(isHunterAgentRuleKey('external_eslint:no-unused-vars')).toBe(false);
  });
});

describe('orderIssueTransitions', () => {
  it('orderIssueTransitions should list Snooze first', () => {
    expect(
      orderIssueTransitions([
        IssueTransition.Confirm,
        IssueTransition.Accept,
        IssueTransition.Snooze,
        IssueTransition.FalsePositive,
      ]),
    ).toEqual([
      IssueTransition.Snooze,
      IssueTransition.Accept,
      IssueTransition.FalsePositive,
      IssueTransition.Confirm,
    ]);
  });
});
