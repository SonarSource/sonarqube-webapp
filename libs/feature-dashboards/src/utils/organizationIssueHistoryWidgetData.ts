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

import { type HistoryRange } from '../data/widgets/line-chart';
import { type MeasureFilters } from '../types/dashboard-widget';
import { type IssueSeverity } from '../types/organization-issue-count-history';
import { type IssueHistoryDay } from '../types/organization-issue-history';
import { getThirtyDayTrendValues, getThirtyDayTrendWindow } from './datetime';
import { issueHistoryToLineData, lineChartDataToSingleSeries } from './lineChartSeriesTransforms';
import { organizationIssueImpactQueryValuesForSoftwareQualities } from './organizationIssueCountHistoryUtils';

export type IssueHistoryMeasureFilters = Pick<
  MeasureFilters,
  'impactSeverities' | 'impactSoftwareQuality'
>;

export function issueHistoryFilterParams(measureFilters: IssueHistoryMeasureFilters | undefined): {
  impacts?: ReturnType<typeof organizationIssueImpactQueryValuesForSoftwareQualities>;
  severities?: IssueSeverity[];
} {
  if (!measureFilters) {
    return {};
  }
  const { impactSoftwareQuality, impactSeverities } = measureFilters;
  const severities = impactSeverities as IssueSeverity[] | undefined;

  if (impactSoftwareQuality) {
    return {
      impacts: organizationIssueImpactQueryValuesForSoftwareQualities(
        [impactSoftwareQuality],
        severities,
      ),
    };
  }
  if (severities && severities.length > 0) {
    return { severities };
  }
  return {};
}

export function issueHistoryLatestValue(days: IssueHistoryDay[] | undefined): number | null {
  if (!days?.length) {
    return null;
  }
  const latestDay = days.reduce(
    (a, b) => (Date.parse(a.date) > Date.parse(b.date) ? a : b),
    days[0],
  );
  return latestDay.distribution.find((d) => d.key === 'all')?.value ?? null;
}

export function issueHistoryToSparklineSeries(days: IssueHistoryDay[] | undefined): number[] {
  if (!days?.length) {
    return [];
  }
  const points = days
    .map((d) => ({
      t: Date.parse(d.date),
      value: d.distribution.find((e) => e.key === 'all')?.value ?? 0,
    }))
    .filter((p) => !Number.isNaN(p.t));
  return getThirtyDayTrendWindow(points, (p) => p.t).map((p) => p.value);
}

export function issueHistoryToTrend(days: IssueHistoryDay[] | undefined): {
  current: string | null;
  past: string | null;
} {
  if (!days?.length) {
    return { current: null, past: null };
  }
  const points = days
    .map((d) => ({
      t: Date.parse(d.date),
      value: String(d.distribution.find((e) => e.key === 'all')?.value ?? 0),
    }))
    .filter((p) => !Number.isNaN(p.t));
  return getThirtyDayTrendValues(
    points,
    (p) => p.t,
    (p) => p.value,
  );
}

export function issueHistoryCountData(days: IssueHistoryDay[] | undefined) {
  return {
    latestValue: issueHistoryLatestValue(days),
    sparklineSeries: issueHistoryToSparklineSeries(days),
    trend: issueHistoryToTrend(days),
  };
}

export function issueHistoryLineSeries(
  days: IssueHistoryDay[] | undefined,
  historyRange: HistoryRange,
  metricName: string,
) {
  return lineChartDataToSingleSeries(issueHistoryToLineData(days, historyRange), metricName);
}
