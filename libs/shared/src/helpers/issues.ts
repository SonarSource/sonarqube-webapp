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

import { IssueProducer, IssueTransition } from '../types/issues';

const HUNTER_AGENT_EXTERNAL_RULE_ENGINE = 'hunter-agent';
const EXTERNAL_RULE_REPO_PREFIX = 'external_';

/** Producer is authoritative; legacy identifiers support older core responses. */
export function isHunterAgentIssue(issue: {
  externalRuleEngine?: string;
  producer?: IssueProducer;
  rule?: string;
}) {
  if (issue.producer !== undefined) {
    return issue.producer === IssueProducer.HunterAgent;
  }

  return (
    isHunterAgentRuleEngine(issue.externalRuleEngine) ||
    (issue.rule !== undefined && isHunterAgentRuleKey(issue.rule))
  );
}

/**
 * Name of the engine to display as a badge for an issue: its external rule engine, or Hunter Agent
 * for issues recognised through their producer (they have no external rule engine).
 */
export function getIssueEngineBadgeName(issue: {
  externalRuleEngine?: string;
  producer?: IssueProducer;
  rule?: string;
}) {
  if (issue.externalRuleEngine) {
    return issue.externalRuleEngine;
  }

  return isHunterAgentIssue(issue) ? HUNTER_AGENT_EXTERNAL_RULE_ENGINE : undefined;
}

export function isTransitionVisible(transition: IssueTransition) {
  return transition !== IssueTransition.WontFix && transition !== IssueTransition.Resolve;
}

export function transitionRequiresComment(transition: IssueTransition) {
  return [IssueTransition.Accept, IssueTransition.FalsePositive].includes(transition);
}

export function orderIssueTransitions(transitions: IssueTransition[]) {
  const order = Object.values(IssueTransition);
  return transitions.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

export function isHunterAgentRuleEngine(externalRuleEngine?: string) {
  return externalRuleEngine?.toLowerCase() === HUNTER_AGENT_EXTERNAL_RULE_ENGINE;
}

/**
 * Issues that an agent other than Hunter creates with their own issue-specific rule description.
 * Hunter Agent issues are detected by `isHunterAgentIssue`.
 */
export function isAgentFindingRuleEngine(externalRuleEngine?: string) {
  return (
    externalRuleEngine?.toLowerCase() === 'reliability-agent' ||
    externalRuleEngine?.toLowerCase() === 'sunset-radar'
  );
}

/** Agent findings whose file could not be resolved are attached to the branch itself */
export function isAgentFindingAttachedToBranch(issue: {
  component: string;
  externalRuleEngine?: string;
  producer?: IssueProducer;
  projectKey: string;
  rule?: string;
}) {
  return (
    (isHunterAgentIssue(issue) || isAgentFindingRuleEngine(issue.externalRuleEngine)) &&
    issue.component === issue.projectKey
  );
}

export function getExternalRuleKey(ruleKey: string) {
  return ruleKey.startsWith(EXTERNAL_RULE_REPO_PREFIX)
    ? ruleKey.slice(EXTERNAL_RULE_REPO_PREFIX.length)
    : ruleKey;
}

export function isHunterAgentRuleKey(ruleKey: string) {
  return getExternalRuleKey(ruleKey)
    .toLowerCase()
    .startsWith(`${HUNTER_AGENT_EXTERNAL_RULE_ENGINE}:`);
}
