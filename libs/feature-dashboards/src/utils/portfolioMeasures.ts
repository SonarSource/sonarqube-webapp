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

import { MetricKey } from '~shared/types/metrics';

export const PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE: ReadonlySet<MetricKey> = new Set([
  MetricKey.reliability_rating,
  MetricKey.maintainability_rating,
  MetricKey.ncloc,
  MetricKey.security_rating,
  MetricKey.security_review_rating,
  MetricKey.coverage,
  MetricKey.lines_to_cover,
  MetricKey.duplicated_lines_density,
  MetricKey.duplicated_lines,
  MetricKey.branch_coverage,
  MetricKey.conditions_to_cover,
  MetricKey.duplicated_blocks,
  MetricKey.reliability_remediation_effort,
  MetricKey.security_remediation_effort,
  MetricKey.security_hotspots_reviewed,
  MetricKey.sca_count_any_issue,
  MetricKey.sca_count_any_security,
  MetricKey.sca_count_licensing,
  MetricKey.sca_count_malware,
  MetricKey.sca_count_vulnerability,
  MetricKey.sca_rating_any_issue,
  MetricKey.sca_rating_any_security,
  MetricKey.sca_rating_licensing,
  MetricKey.sca_rating_malware,
  MetricKey.sca_rating_vulnerability,
  MetricKey.sqale_debt_ratio,
  MetricKey.uncovered_conditions,
  MetricKey.uncovered_lines,
]);

export function getPortfolioDashboardMeasureRequestKey(
  metricKey: MetricKey,
  isScopeNew: boolean,
): string {
  if (!isScopeNew) {
    return metricKey;
  }
  if (!PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE.has(metricKey)) {
    return metricKey;
  }
  return `new_${metricKey}`;
}
