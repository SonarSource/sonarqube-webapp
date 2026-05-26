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
import { augmentMetricsForIssueSeverity } from '../metrics';

function buildMetric(overrides: Partial<Metric> & Pick<Metric, 'key'>): Metric {
  return {
    name: overrides.key,
    type: MetricType.Integer,
    ...overrides,
  };
}

describe('augmentMetricsForIssueSeverity', () => {
  it.each([
    MetricKey.new_bugs_severity,
    MetricKey.new_vulnerabilities_severity,
    MetricKey.new_code_smells_severity,
  ])('changes the type of %s to ISSUE_SEVERITY', (key) => {
    const metric = buildMetric({ key, type: MetricType.Integer });

    const [result] = augmentMetricsForIssueSeverity([metric]);

    expect(result.type).toBe(MetricType.IssueSeverity);
  });

  it('leaves non-severity metrics untouched', () => {
    const metrics: Metric[] = [
      buildMetric({ key: MetricKey.bugs, type: MetricType.Integer }),
      buildMetric({ key: MetricKey.coverage, type: MetricType.Percent }),
    ];

    expect(augmentMetricsForIssueSeverity(metrics)).toEqual(metrics);
  });
});
