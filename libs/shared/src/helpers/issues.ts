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

import { IssueTransition } from '../types/issues';

const HUNTER_AGENT_EXTERNAL_RULE_ENGINE = 'hunter-agent';
const EXTERNAL_RULE_REPO_PREFIX = 'external_';

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
