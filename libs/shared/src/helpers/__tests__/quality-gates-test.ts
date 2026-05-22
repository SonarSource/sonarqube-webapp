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

import { Metric } from '../../types/measures';
import { MetricKey, MetricType } from '../../types/metrics';
import { QualityGateConditionOperator } from '../../types/quality-gates';
import {
  QUALITY_GATE_AGENTIC_AI,
  QUALITY_GATE_SONAR_WAY,
  getBuiltInQualityGateHelperTextKey,
  getOperatorLabelId,
  isAgenticQualityGate,
} from '../quality-gates';

type OperatorLabelDataSet = {
  expectedResult: string;
  metric: Metric;
  op: QualityGateConditionOperator;
  test: string;
};

describe('getOperatorLabelId', () => {
  it.each<OperatorLabelDataSet>([
    {
      test: 'non-SCA, non-rating',
      op: 'GT',
      metric: {
        key: MetricKey.accepted_issues,
        type: MetricType.Integer,
        name: 'name',
      },
      expectedResult: 'quality_gates.operator.GT',
    },
    {
      test: 'non-SCA, rating',
      op: 'GT',
      metric: {
        key: MetricKey.accepted_issues,
        type: MetricType.Rating,
        name: 'name',
      },
      expectedResult: 'quality_gates.operator.GT.rating',
    },
    {
      test: 'SCA severity, non-rating',
      op: 'GT',
      metric: {
        key: MetricKey.new_sca_severity_any_issue,
        type: MetricType.Integer,
        name: 'name',
      },
      expectedResult: 'quality_gates.operator.GTE',
    },
    {
      test: 'SCA, rating',
      op: 'GT',
      metric: {
        key: MetricKey.new_sca_severity_any_issue,
        type: MetricType.Rating,
        name: 'name',
      },
      expectedResult: 'quality_gates.operator.GTE.rating',
    },
  ])('should handle $test', ({ op, metric, expectedResult }) => {
    expect(getOperatorLabelId(op, metric)).toEqual(expectedResult);
  });
});

describe('isAgenticQualityGate', () => {
  it('should return true for AICA builtin gate', () => {
    const gate = { isBuiltIn: true, name: QUALITY_GATE_AGENTIC_AI };
    expect(isAgenticQualityGate(gate)).toBe(true);
  });

  it('should return false when isBuiltIn is false', () => {
    const gate = { isBuiltIn: false, name: QUALITY_GATE_AGENTIC_AI };
    expect(isAgenticQualityGate(gate)).toBe(false);
  });

  it('should return false for other builtin gates', () => {
    const gate = { isBuiltIn: true, name: 'Built-in Gate' };
    expect(isAgenticQualityGate(gate)).toBe(false);
  });

  it('should return false for custom gates', () => {
    const gate = { isBuiltIn: false, name: 'Custom Gate' };
    expect(isAgenticQualityGate(gate)).toBe(false);
  });
});

describe('getBuiltInQualityGateHelperTextKey', () => {
  it('should return AICA help key for AICA builtin gate', () => {
    const gate = { isBuiltIn: true, name: QUALITY_GATE_AGENTIC_AI };
    expect(getBuiltInQualityGateHelperTextKey(gate)).toBe(
      'project_quality_gate.aica_builtin_gate_help',
    );
  });

  it('should return Sonar way help key for Sonar way builtin gate', () => {
    const gate = { isBuiltIn: true, name: QUALITY_GATE_SONAR_WAY };
    expect(getBuiltInQualityGateHelperTextKey(gate)).toBe('project_quality_gate.sonar_way_help');
  });

  it('should return undefined for other builtin gates', () => {
    const gate = { isBuiltIn: true, name: 'Other Builtin Gate' };
    expect(getBuiltInQualityGateHelperTextKey(gate)).toBeUndefined();
  });

  it('should return undefined for custom gates', () => {
    const gate = { isBuiltIn: false, name: 'Custom Gate' };
    expect(getBuiltInQualityGateHelperTextKey(gate)).toBeUndefined();
  });

  it('should return undefined when both isBuiltIn is false but name is Aica qualified gate', () => {
    const gate = { isBuiltIn: false, name: QUALITY_GATE_AGENTIC_AI };
    expect(getBuiltInQualityGateHelperTextKey(gate)).toBeUndefined();
  });
});
