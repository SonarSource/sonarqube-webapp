/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { getJSON } from '~adapters/helpers/request';
import { Metric } from '~shared/types/measures';
import { MetricType } from '~shared/types/metrics';
import { SCA_ISSUE_RISK_SEVERITY_METRICS } from '../helpers/sca';
import { throwGlobalError } from '../sonar-aligned/helpers/error';

export interface MetricsResponse {
  metrics: Metric[];
  p: number;
  ps: number;
  total: number;
}

function getMetrics(data?: {
  isCustom?: boolean;
  p?: number;
  ps?: number;
}): Promise<MetricsResponse> {
  return getJSON('/api/metrics/search', data).catch(throwGlobalError);
}

/**
 * TODO: Backend tech debt:
 * SQ Server SCA Risk severity metrics are not typed correctly in the API.
 * They are currently typed as 'INT' but should be a new custom type 'SCA_RISK'.
 */
function augmentMetrics(metrics: Metric[]): Metric[] {
  return metrics.map((metric) => {
    if (SCA_ISSUE_RISK_SEVERITY_METRICS.includes(metric.key)) {
      metric.type = MetricType.ScaRisk;
    }
    return metric;
  });
}

export function getAllMetrics(data?: {
  isCustom?: boolean;
  p?: number;
  ps?: number;
}): Promise<Metric[]> {
  return inner(data);

  function inner(
    data: { p?: number; ps?: number } = { ps: 500 },
    prev?: MetricsResponse,
  ): Promise<Metric[]> {
    return getMetrics(data)
      .then((r) => ({
        ...r,
        metrics: augmentMetrics(r.metrics),
      }))
      .then((r) => {
        const result = prev ? prev.metrics.concat(r.metrics) : r.metrics;
        if (r.p * r.ps >= r.total) {
          return result;
        }
        return inner({ ...data, p: r.p + 1 }, { ...r, metrics: result });
      });
  }
}
