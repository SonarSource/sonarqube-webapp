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

import { DeprecatedBadge } from '~shared/components/badges/DeprecatedBadge';
import { MetricKey } from '~shared/types/metrics';
import { PieChartMetric } from '../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import {
  ISSUE_DENSITY_METRIC_OPTION_VALUE,
  type MetricGroup,
  type PieChartMetricSelectOption,
} from '../../types/widget-common';

/** Metrics shown in dashboard widget pickers that map to deprecated security hotspots. */
const DEPRECATED_WIDGET_METRIC_KEYS = new Set<MetricKey>([
  MetricKey.security_hotspots,
  MetricKey.security_hotspots_reviewed,
  MetricKey.security_review_rating,
]);

function isIssueResolutionStatisticValue(
  value: MetricGroup['items'][number]['value'],
): value is IssueResolutionStatistic {
  return Object.values(IssueResolutionStatistic).includes(value as IssueResolutionStatistic);
}

function withDeprecatedMetricSuffix(item: MetricGroup['items'][number]) {
  if (
    isIssueResolutionStatisticValue(item.value) ||
    item.value === ISSUE_DENSITY_METRIC_OPTION_VALUE
  ) {
    return item;
  }
  if (DEPRECATED_WIDGET_METRIC_KEYS.has(item.value as MetricKey)) {
    return { ...item, suffix: <DeprecatedBadge /> };
  }
  return item;
}

export function withDeprecatedMetricGroupSuffixes(groups: MetricGroup[]): MetricGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map(withDeprecatedMetricSuffix),
  }));
}

export function withDeprecatedPieChartMetricSelectOptionSuffixes(
  options: PieChartMetricSelectOption[],
): PieChartMetricSelectOption[] {
  return options.map((option) =>
    option.value === PieChartMetric.HotspotCount
      ? { ...option, suffix: <DeprecatedBadge /> }
      : option,
  );
}
