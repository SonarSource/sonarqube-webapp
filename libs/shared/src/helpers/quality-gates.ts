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
