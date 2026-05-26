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

import { IssueSeverity } from '../types/issues';
import { Metric } from '../types/measures';
import { MetricType } from '../types/metrics';
import { QualityGateConditionOperator } from '../types/quality-gates';
import { scaConditionOperator } from './sca';

const QUALITY_GATE_OPERATOR_LABEL_IDS: Record<
  string,
  Record<QualityGateConditionOperator, string>
> = {
  rating: {
    GT: 'quality_gates.operator.GT.rating',
    LT: 'quality_gates.operator.LT.rating',
    GTE: 'quality_gates.operator.GTE.rating',
  },
  // Based on the backend implementation, GT maps to GTE for issue severity metrics
  // the stored threshold value is already DB_value - 1, so > threshold is semantically >= severity
  issueSeverity: {
    GT: 'quality_gates.operator.GTE.issueSeverity',
    LT: 'quality_gates.operator.LT.issueSeverity',
    GTE: 'quality_gates.operator.GTE.issueSeverity',
  },
  other: {
    GT: 'quality_gates.operator.GT',
    LT: 'quality_gates.operator.LT',
    GTE: 'quality_gates.operator.GTE',
  },
};

export function getOperatorLabelId(op: QualityGateConditionOperator, metric: Metric) {
  const opOverride = scaConditionOperator(metric.key) ?? op;

  if (metric.type === MetricType.Rating) {
    return QUALITY_GATE_OPERATOR_LABEL_IDS.rating[opOverride];
  }

  if (metric.type === MetricType.IssueSeverity) {
    return QUALITY_GATE_OPERATOR_LABEL_IDS.issueSeverity[opOverride];
  }

  return QUALITY_GATE_OPERATOR_LABEL_IDS.other[opOverride];
}

export const QUALITY_GATE_SONAR_WAY = 'Sonar way';
export const QUALITY_GATE_AGENTIC_AI = 'Sonar way for Agentic AI';

// this date corresponds to the introduction of the new agentic quality gate Sonar way for Agentic AI
export const AGENTIC_QUALITY_GATE_NEW_BADGE_EXPIRATION = '2026-08-19T23:59:59.999Z';

export function isAgenticQualityGate(gate: { isBuiltIn: boolean; name: string }): boolean {
  return gate.isBuiltIn && gate.name === QUALITY_GATE_AGENTIC_AI;
}

export function getBuiltInQualityGateHelperTextKey(gate: {
  isBuiltIn: boolean;
  name: string;
}): string | undefined {
  const { isBuiltIn, name } = gate;

  if (isAgenticQualityGate({ isBuiltIn, name })) {
    return 'project_quality_gate.aica_builtin_gate_help';
  } else if (name === QUALITY_GATE_SONAR_WAY) {
    return 'project_quality_gate.sonar_way_help';
  }

  return undefined;
}

/**
 * These levels are modeled in the DB as 5, 10, 15, 20, 25
 * In order to get the GreaterThanOrEqual operator, we need to subtract 1
 */
export const ISSUE_SEVERITY_CONDITION_MAPPING: Record<string, IssueSeverity> = {
  '4': IssueSeverity.Info,
  '9': IssueSeverity.Minor,
  '14': IssueSeverity.Major,
  '19': IssueSeverity.Critical,
  '24': IssueSeverity.Blocker,
};
