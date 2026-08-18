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

import type { QGStatusExtended } from '~shared/types/common';
import { Metric } from '~shared/types/measures';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { MeasureFilters } from '../types/dashboard-widget';
import type {
  OrganizationsIssueCountHistoryDay,
  OrganizationsMeasuresHistoryDay,
} from '../types/organization-line-chart-history';
import { getThirtyDayTrendValues, getThirtyDayTrendWindow } from './datetime';
import { parseMeasureValue } from './measureValues';
import { issueCountHistoryToPieCounts } from './organizationIssueCountHistory';
import { sumIssueCountDistribution } from './organizationIssueHistory';

type PortfolioComputedProject = {
  measures: ReadonlyArray<{ name: string; value: string }>;
};

type QualityGateStatus = QGStatusExtended;

function isQualityGateStatus(value: string | undefined): value is QualityGateStatus {
  return value === 'ERROR' || value === 'NONE' || value === 'NOT_COMPUTED' || value === 'OK';
}

/**
 * Metric shape for **rich** (issue-based) count trend/sparkline. Issue totals are not backed by
 * measure metadata; they are always integer counts where lower is better.
 */
export function resolveRichCountTrendMetricMetadata(actualMetricKey: MetricKey): Metric {
  return {
    direction: -1,
    key: actualMetricKey,
    name: actualMetricKey,
    type: MetricType.Integer,
  };
}

/** Trend: latest value vs last point before now−30d (else earliest). */
function computeThirtyDayTrend(points: readonly { t: number; value: string }[]): {
  current: string | null;
  past: string | null;
} {
  return getThirtyDayTrendValues(
    points,
    (p) => p.t,
    (p) => p.value,
  );
}

export function portfolioIssueCountHistoryLatestTotal(
  history: OrganizationsIssueCountHistoryDay[] | undefined,
): number | null {
  if (!history?.length) {
    return null;
  }

  const latestDay = history.reduce(
    (a, b) => (Date.parse(a.date) > Date.parse(b.date) ? a : b),
    history[0],
  );
  return sumIssueCountDistribution(latestDay);
}

export function portfolioIssueHistoryToTrend(
  days: OrganizationsIssueCountHistoryDay[] | undefined,
): {
  current: string | null;
  past: string | null;
} {
  if (!days?.length) {
    return { current: null, past: null };
  }

  const points = days.map((d) => ({
    t: new Date(d.date).getTime(),
    value: String(sumIssueCountDistribution(d)),
  }));
  return computeThirtyDayTrend(points);
}

function issueCountForDistributionKey(
  day: OrganizationsIssueCountHistoryDay,
  distributionKey: string,
): number {
  const entry = day.distribution.find((e) => e.key === distributionKey);
  return entry?.value ?? 0;
}

/** Rule count from a `RULE_KEY` slice snapshot (same aggregation as portfolio top-list overview). */
export function getPortfolioRuleCountFromDistributionHistory(
  history: OrganizationsIssueCountHistoryDay[] | undefined,
  ruleKey: string,
): number {
  return issueCountHistoryToPieCounts(history)[ruleKey] ?? 0;
}

/**
 * Latest vs ~30 days ago for issue-count history. Uses the last history point strictly before
 * `now − 30d` as the comparison baseline (same approach as project measure trends).
 */
export function portfolioIssueCountHistoryToThirtyDayTrendValues(
  days: OrganizationsIssueCountHistoryDay[] | undefined,
  options?: { distributionKey?: string },
): {
  current: string | null;
  past: string | null;
} {
  if (!days?.length) {
    return { current: null, past: null };
  }

  const { distributionKey } = options ?? {};

  const points = days.map((day) => {
    const count =
      distributionKey === undefined
        ? sumIssueCountDistribution(day)
        : issueCountForDistributionKey(day, distributionKey);
    return { t: new Date(day.date).getTime(), value: String(count) };
  });

  return getThirtyDayTrendValues(
    points,
    (p) => p.t,
    (p) => p.value,
  );
}

/** 30-day trend for a single slice dimension value (e.g. one rule in a `RULE_KEY` distribution). */
export function issueCountHistoryRuleToTrend(
  days: OrganizationsIssueCountHistoryDay[] | undefined,
  distributionKey: string,
): {
  current: string | null;
  past: string | null;
} {
  if (!days?.length) {
    return { current: null, past: null };
  }

  const points = days.map((d) => ({
    t: new Date(d.date).getTime(),
    value: String(issueCountForDistributionKey(d, distributionKey)),
  }));
  return computeThirtyDayTrend(points);
}

/** Chronological totals per day for the count sparkline (portfolio issue history). */
export function portfolioIssueHistoryToSparklineSeries(
  days: OrganizationsIssueCountHistoryDay[] | undefined,
): number[] {
  if (!days?.length) {
    return [];
  }

  const points = days.map((d) => ({
    t: Date.parse(d.date),
    value: sumIssueCountDistribution(d),
  }));
  return getThirtyDayTrendWindow(points, (p) => p.t).map((p) => p.value);
}

function measuresHistoryMetricPointsByDate(
  days: OrganizationsMeasuresHistoryDay[] | undefined,
  metricKey: string,
): { date: string; value: string }[] {
  if (!days?.length) {
    return [];
  }

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  return sorted
    .map((day) => {
      const entry = day.measures.find((m) => m.metric === metricKey);
      return entry?.value === undefined ? undefined : { date: day.date, value: entry.value };
    })
    .filter((point): point is { date: string; value: string } => point !== undefined);
}

/** Latest measure value from portfolio history for `metricKey`. */
export function portfolioMeasuresHistoryLatestValue(
  days: OrganizationsMeasuresHistoryDay[] | undefined,
  metricKey: string,
): string | undefined {
  return measuresHistoryMetricPointsByDate(days, metricKey).at(-1)?.value;
}

export function portfolioMeasuresHistoryToTrend(
  days: OrganizationsMeasuresHistoryDay[] | undefined,
  metricKey: string,
): { current: string | null; past: string | null } {
  const datedPoints = measuresHistoryMetricPointsByDate(days, metricKey);

  if (datedPoints.length === 0) {
    return { current: null, past: null };
  }

  const points = datedPoints.map((p) => ({
    t: new Date(p.date).getTime(),
    value: p.value,
  }));
  return computeThirtyDayTrend(points);
}

/** Chronological numeric series for the count sparkline (portfolio measure history). */
export function portfolioMeasuresHistoryToSparklineSeries(
  days: OrganizationsMeasuresHistoryDay[] | undefined,
  metricKey: string,
  metricType: MetricType | string | undefined,
  measureFilters: MeasureFilters | undefined,
): number[] {
  const datedPoints = measuresHistoryMetricPointsByDate(days, metricKey);
  const isMetricData = metricType === MetricType.Data;
  const windowedPoints = getThirtyDayTrendWindow(
    datedPoints.map((p) => ({ ...p, t: new Date(p.date).getTime() })),
    (p) => p.t,
  );
  const series: number[] = [];

  for (const p of windowedPoints) {
    const parsed = isMetricData ? parseMeasureValue(p.value, measureFilters) : p.value;
    const n = typeof parsed === 'number' ? parsed : Number(parsed);
    if (!Number.isNaN(n)) {
      series.push(n);
    }
  }

  return series;
}

const QG_RANK: Record<QualityGateStatus, number> = {
  ERROR: 3,
  NONE: 2,
  NOT_COMPUTED: 1,
  OK: 0,
};

function aggregateWorstQualityGateFromValues(rawValues: readonly string[]): string | undefined {
  let worst: QualityGateStatus | undefined;
  let worstRank = -1;
  for (const v of rawValues) {
    if (!isQualityGateStatus(v)) {
      continue;
    }
    const rank = QG_RANK[v];
    if (rank <= worstRank) {
      continue;
    }
    worstRank = rank;
    worst = v;
  }
  return worst;
}

function aggregateIntegerOrDataSum(rawValues: readonly string[]): string | undefined {
  const sum = rawValues.reduce((acc, v) => acc + Number.parseInt(v, 10), 0);
  return Number.isNaN(sum) ? undefined : String(sum);
}

function aggregateRatingOrPercentValues(
  rawValues: readonly string[],
  type: MetricType.Rating | MetricType.Percent,
): string | undefined {
  const nums = rawValues.map((v) => Number.parseFloat(v)).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) {
    return undefined;
  }
  const picked = type === MetricType.Rating ? Math.max(...nums) : mean(nums);
  return String(picked);
}

export function aggregatePortfolioComputedMeasures(
  projects: PortfolioComputedProject[],
  metricKey: string,
  metric: Metric | undefined,
): string | undefined {
  const rawValues = projects
    .map((p) => p.measures.find((m) => m.name === metricKey)?.value)
    .filter((v): v is string => v !== undefined && v !== '');
  if (rawValues.length === 0) {
    return undefined;
  }

  if (metricKey === MetricKey.alert_status) {
    return aggregateWorstQualityGateFromValues(rawValues);
  }

  const type = metric?.type;
  if (type === MetricType.Integer || type === MetricType.Data) {
    return aggregateIntegerOrDataSum(rawValues);
  }

  if (type === MetricType.Rating || type === MetricType.Percent) {
    return aggregateRatingOrPercentValues(rawValues, type);
  }

  return rawValues[0];
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
