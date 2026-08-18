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

const PORTFOLIO_RATING_BADGE_BREAKDOWN_METRIC_KEYS: ReadonlySet<MetricKey> = new Set([
  MetricKey.releasability_rating,
  MetricKey.reliability_rating,
  MetricKey.maintainability_rating,
  MetricKey.security_rating,
  MetricKey.security_review_rating,
  MetricKey.sca_rating_any_issue,
  MetricKey.sca_rating_any_security,
  MetricKey.sca_rating_vulnerability,
  MetricKey.sca_rating_licensing,
  MetricKey.sca_rating_malware,
]);

export function isPortfolioDashboardRatingBadgeBreakdownMetricKey(
  metricKey: MetricKey | null,
): metricKey is MetricKey {
  return metricKey !== null && PORTFOLIO_RATING_BADGE_BREAKDOWN_METRIC_KEYS.has(metricKey);
}
