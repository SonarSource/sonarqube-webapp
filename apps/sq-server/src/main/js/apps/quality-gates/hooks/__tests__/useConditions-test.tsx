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

import { renderHook } from '@testing-library/react';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { mockMetric } from '~sq-server-commons/helpers/testMocks';
import { Condition } from '~sq-server-commons/types/types';
import { DecoratedCondition, useConditions } from '../useConditions';

const METRICS = {
  [MetricKey.new_violations]: mockMetric({
    key: MetricKey.new_violations,
    name: 'New Issues',
    type: MetricType.Integer,
  }),
  [MetricKey.new_coverage]: mockMetric({
    key: MetricKey.new_coverage,
    name: 'Coverage on New Code',
    type: MetricType.Percent,
  }),
  [MetricKey.new_security_hotspots_reviewed]: mockMetric({
    key: MetricKey.new_security_hotspots_reviewed,
    name: 'Security Hotspots Reviewed on New Code',
    type: MetricType.Percent,
  }),
  [MetricKey.new_duplicated_lines_density]: mockMetric({
    key: MetricKey.new_duplicated_lines_density,
    name: 'Duplicated Lines on New Code',
    type: MetricType.Percent,
  }),
  [MetricKey.new_sca_severity_any_issue]: mockMetric({
    key: MetricKey.new_sca_severity_any_issue,
    name: 'New Dependency Risk',
    type: MetricType.Rating,
  }),
  [MetricKey.coverage]: mockMetric({
    key: MetricKey.coverage,
    name: 'Overall Coverage',
    type: MetricType.Percent,
  }),
  [MetricKey.bugs]: mockMetric({
    key: MetricKey.bugs,
    name: 'Bugs',
    type: MetricType.Integer,
  }),
  [MetricKey.software_quality_security_rating]: mockMetric({
    key: MetricKey.software_quality_security_rating,
    name: 'Software Quality Security Rating',
    type: MetricType.Rating,
  }),
};

function mockCondition(overrides: Partial<Condition> & { metric: string }): Condition {
  return {
    id: `cond-${overrides.metric}`,
    error: '1',
    op: 'GT',
    ...overrides,
  };
}

function setup(
  args: {
    conditions?: Condition[];
    isAiCodeSupported?: boolean;
    isBuiltIn?: boolean;
    isScaAvailable?: boolean;
    isScaEnabled?: boolean;
  } = {},
) {
  return renderHook(() =>
    useConditions({
      conditions: [],
      metrics: METRICS,
      ...args,
    }),
  );
}

describe('useConditions', () => {
  it('returns empty arrays when given no conditions', () => {
    const { result } = setup();

    expect(result.current).toEqual({
      builtInNewCodeConditions: [],
      builtInOverallConditions: [],
      existingConditions: [],
      newCodeConditions: [],
      overallCodeConditions: [],
      uniqDuplicates: [],
    });
  });

  it('filters out conditions whose metric is not in the metrics dict', () => {
    const known = mockCondition({ metric: MetricKey.coverage });
    const unknown = mockCondition({ metric: 'not_a_metric' });

    const { result } = setup({ conditions: [known, unknown] });

    expect(result.current.existingConditions).toEqual([known]);
    expect(result.current.overallCodeConditions).toEqual([known]);
  });

  it('splits conditions into new-code and overall by metric prefix', () => {
    const overallCoverage = mockCondition({ metric: MetricKey.coverage });
    const overallBugs = mockCondition({ metric: MetricKey.bugs });
    const newCoverage = mockCondition({ metric: MetricKey.new_coverage });

    const { result } = setup({ conditions: [overallCoverage, overallBugs, newCoverage] });

    expect(result.current.overallCodeConditions.map((c) => c.metric)).toEqual(
      expect.arrayContaining([MetricKey.coverage, MetricKey.bugs]),
    );
    expect(result.current.newCodeConditions.map((c) => c.metric)).toEqual([MetricKey.new_coverage]);
    expect(result.current.builtInNewCodeConditions).toEqual([]);
    expect(result.current.builtInOverallConditions).toEqual([]);
  });

  it('sorts new-code conditions by CAYC priority order', () => {
    const conditions = [
      mockCondition({ metric: MetricKey.new_coverage }),
      mockCondition({ metric: MetricKey.new_violations }),
      mockCondition({ metric: MetricKey.new_duplicated_lines_density }),
      mockCondition({ metric: MetricKey.new_security_hotspots_reviewed }),
    ];

    const { result } = setup({ conditions });

    expect(result.current.newCodeConditions.map((c) => c.metric)).toEqual([
      MetricKey.new_violations,
      MetricKey.new_security_hotspots_reviewed,
      MetricKey.new_coverage,
      MetricKey.new_duplicated_lines_density,
    ]);
  });

  it('routes CAYC conditions to builtInNewCodeConditions when isBuiltIn', () => {
    const caycCondition = mockCondition({
      metric: MetricKey.new_violations,
      isCaycCondition: true,
    });
    const customCondition = mockCondition({ metric: MetricKey.new_coverage });

    const { result } = setup({
      conditions: [caycCondition, customCondition],
      isBuiltIn: true,
    });

    expect(result.current.builtInNewCodeConditions.map((c) => c.metric)).toEqual([
      MetricKey.new_violations,
      MetricKey.new_coverage,
    ]);
    expect(result.current.newCodeConditions.map((c) => c.metric)).toEqual([]);
  });

  it('detects duplicate conditions and returns one entry per duplicated metric', () => {
    const dup1 = mockCondition({ id: 'a1', metric: MetricKey.coverage });
    const dup2 = mockCondition({ id: 'a2', metric: MetricKey.coverage });
    const dup3 = mockCondition({ id: 'b1', metric: MetricKey.new_coverage });
    const dup4 = mockCondition({ id: 'b2', metric: MetricKey.new_coverage });
    const unique = mockCondition({ id: 'c1', metric: MetricKey.bugs });

    const { result } = setup({ conditions: [dup1, dup2, dup3, dup4, unique] });

    expect(result.current.uniqDuplicates).toHaveLength(2);
    expect(result.current.uniqDuplicates.map((d) => d.metric)).toEqual(
      expect.arrayContaining([METRICS[MetricKey.coverage], METRICS[MetricKey.new_coverage]]),
    );
  });

  it('decorates new-code conditions on SCA metrics, disabling when SCA is not enabled or available', () => {
    const scaCondition = mockCondition({ metric: MetricKey.new_sca_severity_any_issue });
    const regularCondition = mockCondition({ metric: MetricKey.new_coverage });

    const { result } = setup({ conditions: [scaCondition, regularCondition] });

    const decoratedSca = result.current.newCodeConditions.find(
      (c) => c.metric === MetricKey.new_sca_severity_any_issue,
    ) as DecoratedCondition;
    const decoratedRegular = result.current.newCodeConditions.find(
      (c) => c.metric === MetricKey.new_coverage,
    ) as DecoratedCondition;

    expect(decoratedSca.isDisabled).toBe(true);
    expect(decoratedSca.suffix).toBeDefined();
    expect(decoratedRegular.isDisabled).toBe(false);
    expect(decoratedRegular.suffix).toBeUndefined();
  });

  it('does not disable SCA conditions when SCA is enabled and available', () => {
    const scaCondition = mockCondition({ metric: MetricKey.new_sca_severity_any_issue });

    const { result } = setup({
      conditions: [scaCondition],
      isScaEnabled: true,
      isScaAvailable: true,
    });

    const decorated = result.current.newCodeConditions[0] as DecoratedCondition;
    expect(decorated.isDisabled).toBe(false);
    expect(decorated.suffix).toBeDefined();
  });

  it('decorates built-in new-code conditions with the SCA decorator', () => {
    const scaCayc = mockCondition({
      metric: MetricKey.new_sca_severity_any_issue,
      isCaycCondition: true,
    });

    const { result } = setup({ conditions: [scaCayc], isBuiltIn: true });

    expect(result.current.builtInNewCodeConditions[0].isDisabled).toBe(true);
    expect(result.current.builtInNewCodeConditions[0].suffix).toBeDefined();
  });

  it('does not decorate overall-code conditions', () => {
    const overall = mockCondition({ metric: MetricKey.bugs });

    const { result } = setup({ conditions: [overall] });

    const decorated = result.current.overallCodeConditions[0] as DecoratedCondition;
    expect(decorated.isDisabled).toBeUndefined();
    expect(decorated.suffix).toBeUndefined();
  });
});
