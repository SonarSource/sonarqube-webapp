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

import { cssVar } from '@sonarsource/echoes-react';
import { CHART_CATEGORICAL_COLORS } from '~shared/helpers/charts';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { formatDashboardMeasure } from './dashboard-measures';

export const DashboardMetricType = { Raw: 'raw', Rich: 'rich' } as const;
export const RichMetricKey = {
  Hotspots: 'hotspotCount',
  Issues: 'issueCount',
  Lines: 'lineCount',
  Projects: 'projectCount',
} as const;
export type DashboardEntityType = 'PORTFOLIO' | 'PROJECT_BRANCH';
export const CodeScope = { Overall: 'overall', New: 'new' } as const;
export type CodeScopeValue = (typeof CodeScope)[keyof typeof CodeScope];
export const HistoryRange = {
  All: '99',
  Last12Months: '12',
  Last6Months: '6',
  Last3Months: '3',
  LastMonth: '1',
} as const;
export const LineChartGroupBy = {
  None: 'none',
  Rule: 'rule',
  Severity: 'severity',
  SoftwareQuality: 'softwareQuality',
  Status: 'status',
} as const;
export const PieChartMetric = {
  IssueCount: RichMetricKey.Issues,
  HotspotCount: RichMetricKey.Hotspots,
  LineCount: RichMetricKey.Lines,
  ProjectCount: RichMetricKey.Projects,
} as const;
export const PieChartIssueSlice = {
  ImpactSoftwareQualities: 'impactSoftwareQualities',
  ImpactSeverities: 'impactSeverities',
  CleanCodeAttributeCategories: 'cleanCodeAttributeCategories',
  IssueStatuses: 'issueStatuses',
  Languages: 'languages',
  Rules: 'rules',
} as const;
export const PieChartHotspotSlice = {
  ReviewPriority: 'reviewPriority',
  ReviewStatus: 'reviewStatus',
  SecurityCategory: 'securityCategory',
} as const;
export const PieChartLineSlice = {
  Language: 'language',
  Coverage: 'coverage',
  Duplications: 'duplications',
} as const;
export const PieChartProjectSlice = { Status: 'status' } as const;
export const PieChartIssueFilter = {
  Security: 'security',
  Reliability: 'reliability',
  Maintainability: 'maintainability',
} as const;

export interface MeasureFilters {
  impactSeverities?: SoftwareImpactSeverity[];
  impactSoftwareQuality?: string;
  issueStatus?: string;
}

export interface DashboardMetric {
  measureFilters?: MeasureFilters;
  metricKey?: string;
  type: string;
}

export interface PieChartWidget {
  filter: string;
  metric: string;
  scope: string;
  slice: string;
}

export interface TopListWidget {
  limit: number;
  metric: DashboardMetric;
}

export interface TopListWidgetLinkProps {
  metric: DashboardMetric;
  rankBy: string;
  scope: CodeScopeValue;
}

export interface HistoryDay {
  date: string;
  distribution: Array<{ key: string; value: number }>;
}

export interface MeasuresHistoryDay {
  date: string;
  measures: Array<{ metric: string; type: string; value: string }>;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * MS_PER_DAY;
export const DEFAULT_ISSUE_IMPACTS = [
  'SECURITY:BLOCKER',
  'SECURITY:HIGH',
  'SECURITY:MEDIUM',
  'SECURITY:LOW',
  'SECURITY:INFO',
  'RELIABILITY:BLOCKER',
  'RELIABILITY:HIGH',
  'RELIABILITY:MEDIUM',
  'RELIABILITY:LOW',
  'RELIABILITY:INFO',
  'MAINTAINABILITY:BLOCKER',
  'MAINTAINABILITY:HIGH',
  'MAINTAINABILITY:MEDIUM',
  'MAINTAINABILITY:LOW',
  'MAINTAINABILITY:INFO',
];
const ISSUE_STATUSES_FOR_STATUS_SLICE = [
  'OPEN',
  'CONFIRMED',
  'ACCEPTED',
  'FALSE_POSITIVE',
  'FIXED',
];
const PIE_SLICE_TO_HISTORY_DIMENSION: Record<string, string> = {
  [PieChartIssueSlice.ImpactSeverities]: 'SEVERITY',
  [PieChartIssueSlice.IssueStatuses]: 'STATUS',
  [PieChartIssueSlice.ImpactSoftwareQualities]: 'SOFTWARE_QUALITY',
  [PieChartIssueSlice.Rules]: 'RULE_KEY',
  [PieChartHotspotSlice.ReviewPriority]: 'SEVERITY',
  [PieChartHotspotSlice.ReviewStatus]: 'STATUS',
  [PieChartHotspotSlice.SecurityCategory]: 'RULE_KEY',
};
const SOFTWARE_QUALITY_BY_METRIC: Partial<Record<MetricKey, SoftwareQuality>> = {
  [MetricKey.security_issues]: SoftwareQuality.Security,
  [MetricKey.software_quality_security_issues]: SoftwareQuality.Security,
  [MetricKey.new_security_issues]: SoftwareQuality.Security,
  [MetricKey.new_software_quality_security_issues]: SoftwareQuality.Security,
  [MetricKey.reliability_issues]: SoftwareQuality.Reliability,
  [MetricKey.software_quality_reliability_issues]: SoftwareQuality.Reliability,
  [MetricKey.new_reliability_issues]: SoftwareQuality.Reliability,
  [MetricKey.new_software_quality_reliability_issues]: SoftwareQuality.Reliability,
  [MetricKey.maintainability_issues]: SoftwareQuality.Maintainability,
  [MetricKey.software_quality_maintainability_issues]: SoftwareQuality.Maintainability,
  [MetricKey.new_maintainability_issues]: SoftwareQuality.Maintainability,
  [MetricKey.new_software_quality_maintainability_issues]: SoftwareQuality.Maintainability,
};
const NEW_CODE_METRICS = new Set<MetricKey>([
  MetricKey.reliability_rating,
  MetricKey.maintainability_rating,
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
  MetricKey.sqale_debt_ratio,
  MetricKey.uncovered_conditions,
  MetricKey.uncovered_lines,
]);

/* History windows */

function startOfUTCDay(date: Date | number): Date {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

function subUTCMonths(date: Date, months: number): Date {
  const target = new Date(date);
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() - months);
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  target.setUTCHours(
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
  return target;
}

export function organizationsHistoryStartDateWithRetentionBuffer(from = new Date()): string {
  const oneYearAgo = new Date(from);
  oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);
  oneYearAgo.setUTCDate(oneYearAgo.getUTCDate() + 1);
  return startOfUTCDay(oneYearAgo).toISOString();
}

export function historySinceIsoDate(monthsBack: number, from = new Date()): string {
  return startOfUTCDay(subUTCMonths(from, Math.max(monthsBack, 1))).toISOString();
}

export function lineChartSinceDate(historyRange: string, from = new Date()): string {
  const months = Number(
    historyRange === HistoryRange.All ? HistoryRange.Last12Months : historyRange,
  );
  const date = historySinceIsoDate(months, from);
  return months >= 12 ? organizationsHistoryStartDateWithRetentionBuffer(from) : date;
}

export function issueHistoryTrendStartDate(): string {
  return startOfUTCDay(Date.now() - THIRTY_DAYS_MS).toISOString();
}

function historyRangeMonths(historyRange: string): number {
  return Number(historyRange === HistoryRange.All ? HistoryRange.Last12Months : historyRange);
}

function isDateInHistoryRange(date: Date, historyRange: string): boolean {
  const start = subUTCMonths(new Date(), historyRangeMonths(historyRange));
  return date >= start && date <= new Date();
}

export function getThirtyDayTrendWindow<T>(
  points: readonly T[],
  getTimestamp: (point: T) => number,
): T[] {
  const sorted = [...points]
    .filter((point) => !Number.isNaN(getTimestamp(point)))
    .sort((a, b) => getTimestamp(a) - getTimestamp(b));
  const threshold = Date.now() - THIRTY_DAYS_MS;
  let startIndex = 0;
  for (let index = 0; index < sorted.length; index += 1) {
    if (getTimestamp(sorted[index]) < threshold) {
      startIndex = index;
    }
  }
  return sorted.slice(startIndex);
}

function trend<T>(
  points: readonly T[],
  getTimestamp: (point: T) => number,
  getValue: (point: T) => string,
): { current: string | null; past: string | null } {
  const window = getThirtyDayTrendWindow(points, getTimestamp);
  const last = window.at(-1);
  return {
    current: last === undefined ? null : getValue(last),
    past: window.length === 0 ? null : getValue(window[0]),
  };
}

function sumDistribution(day: HistoryDay): number {
  return day.distribution.reduce((sum, entry) => sum + entry.value, 0);
}

function latestHistoryDay<T extends { date: string }>(history: T[] | undefined): T | undefined {
  return history?.reduce<T | undefined>(
    (current, candidate) =>
      current === undefined || Date.parse(candidate.date) > Date.parse(current.date)
        ? candidate
        : current,
    undefined,
  );
}

/* Issue history */

export function issueCountHistoryToPieCounts(
  history: HistoryDay[] | undefined,
): Record<string, number> {
  const latest = latestHistoryDay(history);
  return latest === undefined
    ? {}
    : Object.fromEntries(
        latest.distribution
          .filter((entry) => entry.value > 0)
          .map((entry) => [entry.key, entry.value]),
      );
}

export function portfolioIssueCountHistoryLatestTotal(
  history: HistoryDay[] | undefined,
): number | null {
  const latest = latestHistoryDay(history);
  return latest === undefined ? null : sumDistribution(latest);
}

export function portfolioIssueHistoryToTrend(history: HistoryDay[] | undefined): {
  current: string | null;
  past: string | null;
} {
  const points = (history ?? []).map((day) => ({
    t: Date.parse(day.date),
    value: String(sumDistribution(day)),
  }));
  return trend(
    points,
    (point) => point.t,
    (point) => point.value,
  );
}

export function portfolioIssueHistoryToSparklineSeries(
  history: HistoryDay[] | undefined,
): number[] {
  return getThirtyDayTrendWindow(
    (history ?? []).map((day) => ({ t: Date.parse(day.date), value: sumDistribution(day) })),
    (point) => point.t,
  ).map((point) => point.value);
}

export function issueCountHistoryRuleToTrend(
  history: HistoryDay[] | undefined,
  ruleKey: string,
): { current: string | null; past: string | null } {
  const points = (history ?? []).map((day) => ({
    t: Date.parse(day.date),
    value: String(day.distribution.find((entry) => entry.key === ruleKey)?.value ?? 0),
  }));
  return trend(
    points,
    (point) => point.t,
    (point) => point.value,
  );
}

function impactsForQuality(
  quality: string,
  severities: string[] = ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW', 'INFO'],
): string[] {
  return severities.map((severity) => `${quality}:${severity}`);
}

export function issueHistoryFilterParams(measureFilters: MeasureFilters | undefined): {
  impacts?: string[];
  severities?: SoftwareImpactSeverity[];
} {
  if (!measureFilters) {
    return {};
  }
  const { impactSeverities, impactSoftwareQuality } = measureFilters;
  if (impactSoftwareQuality) {
    return {
      impacts: impactsForQuality(
        impactSoftwareQuality,
        impactSeverities?.length ? impactSeverities : undefined,
      ),
    };
  }
  if (impactSeverities && impactSeverities.length > 0) {
    return { severities: impactSeverities };
  }
  return {};
}

function getIssueHistoryImpacts(
  measureFilters: MeasureFilters | undefined,
  richMetricKey: string | undefined,
  resolvedIssueMetricKey: MetricKey | undefined,
): string[] | undefined {
  const severities = measureFilters?.impactSeverities ?? [];
  if (measureFilters?.impactSoftwareQuality) {
    return impactsForQuality(
      measureFilters.impactSoftwareQuality,
      severities.length ? severities : undefined,
    );
  }
  if (severities.length) {
    return [
      ...impactsForQuality('SECURITY', severities),
      ...impactsForQuality('RELIABILITY', severities),
      ...impactsForQuality('MAINTAINABILITY', severities),
    ];
  }
  if (resolvedIssueMetricKey !== undefined) {
    const quality = SOFTWARE_QUALITY_BY_METRIC[resolvedIssueMetricKey];
    if (quality) {
      return impactsForQuality(quality, severities.length ? severities : undefined);
    }
  }
  return richMetricKey === RichMetricKey.Hotspots ? undefined : [...DEFAULT_ISSUE_IMPACTS];
}

function getIssueHistoryStatuses(
  measureFilters: MeasureFilters | undefined,
  richMetricKey: string | undefined,
): string[] | undefined {
  const issueStatus = measureFilters?.issueStatus;
  if (
    issueStatus &&
    ['OPEN', 'CONFIRMED', 'ACCEPTED', 'FALSE_POSITIVE', 'FIXED'].includes(issueStatus)
  ) {
    return [issueStatus];
  }
  return richMetricKey === RichMetricKey.Hotspots ? undefined : ['OPEN'];
}

export function issueHistoryQueryExtras(
  measureFilters: MeasureFilters | undefined,
  richMetricKey: string | undefined,
  resolvedIssueMetricKey: MetricKey | undefined,
): { impacts?: string[]; issueTypes?: string[]; severities?: string[]; statuses?: string[] } {
  const extras: {
    impacts?: string[];
    issueTypes?: string[];
    severities?: string[];
    statuses?: string[];
  } = {};
  const impacts = getIssueHistoryImpacts(measureFilters, richMetricKey, resolvedIssueMetricKey);
  if (impacts !== undefined) {
    extras.impacts = impacts;
  }
  if (richMetricKey === RichMetricKey.Hotspots) {
    extras.issueTypes = ['SECURITY_HOTSPOT'];
  }
  const statuses = getIssueHistoryStatuses(measureFilters, richMetricKey);
  if (statuses !== undefined) {
    extras.statuses = statuses;
  }
  return extras;
}

export function getActualMetricKey(metric: DashboardMetric): MetricKey | undefined {
  if (metric.type === DashboardMetricType.Raw) {
    return metric.metricKey as MetricKey | undefined;
  }
  if (metric.type !== DashboardMetricType.Rich) {
    return undefined;
  }
  if (metric.metricKey === RichMetricKey.Hotspots) {
    return MetricKey.security_hotspots;
  }
  return MetricKey.violations;
}

export function getPortfolioDashboardMeasureRequestKey(
  metricKey: MetricKey,
  isNewCode: boolean,
): string {
  return isNewCode && NEW_CODE_METRICS.has(metricKey) ? `new_${metricKey}` : metricKey;
}

function parseMeasureValue(value: string, filters?: MeasureFilters): string | number | undefined {
  if (!Number.isNaN(Number(value))) {
    return value;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return undefined;
    }
    const data = parsed as Record<string, unknown>;
    if (filters?.impactSeverities?.length) {
      return filters.impactSeverities.reduce(
        (sum, severity) => sum + Number(data[severity] ?? 0),
        0,
      );
    }
    return Number(data.total ?? 0);
  } catch {
    return undefined;
  }
}

/* Measures history */

function measurePoints(
  history: MeasuresHistoryDay[] | undefined,
  metricKey: string,
): Array<{ date: string; value: string }> {
  return (history ?? [])
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((day) => {
      const value = day.measures.find((measure) => measure.metric === metricKey)?.value;
      return value === undefined ? [] : [{ date: day.date, value }];
    });
}

export function portfolioMeasuresHistoryLatestValue(
  history: MeasuresHistoryDay[] | undefined,
  metricKey: string,
): string | undefined {
  return measurePoints(history, metricKey).at(-1)?.value;
}

export function portfolioMeasuresHistoryToTrend(
  history: MeasuresHistoryDay[] | undefined,
  metricKey: string,
): { current: string | null; past: string | null } {
  const points = measurePoints(history, metricKey).map((point) => ({
    ...point,
    t: Date.parse(point.date),
  }));
  return trend(
    points,
    (point) => point.t,
    (point) => point.value,
  );
}

export function portfolioMeasuresHistoryToSparklineSeries(
  history: MeasuresHistoryDay[] | undefined,
  metricKey: string,
  metricType: string | undefined,
  filters: MeasureFilters | undefined,
): number[] {
  return getThirtyDayTrendWindow(
    measurePoints(history, metricKey).map((point) => ({ ...point, t: Date.parse(point.date) })),
    (point) => point.t,
  ).flatMap((point) => {
    const parsed =
      metricType === MetricType.Data ? parseMeasureValue(point.value, filters) : point.value;
    const value = Number(parsed);
    return Number.isNaN(value) ? [] : [value];
  });
}

function parseRatingValue(value: string): number | undefined {
  const normalized = value.trim().toUpperCase();
  if (normalized.length === 1 && normalized >= 'A' && normalized <= 'E') {
    const codePoint = normalized.codePointAt(0);
    const firstLetterCodePoint = 'A'.codePointAt(0);
    if (codePoint !== undefined && firstLetterCodePoint !== undefined) {
      return codePoint - firstLetterCodePoint + 1;
    }
  }
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : undefined;
}

export function portfolioMeasuresToLineData(
  history: MeasuresHistoryDay[] | undefined,
  measuresHistoryKey: string,
  historyRange: string,
  metricKey: MetricKey,
  metricType: string | undefined,
  filters: MeasureFilters | undefined,
): Array<{ x: Date; y: number }> {
  const isRating = metricType === MetricType.Rating || metricKey.endsWith('_rating');
  const isData = metricType === MetricType.Data;
  return measurePoints(history, measuresHistoryKey).flatMap((point) => {
    const date = new Date(point.date);
    if (!isDateInHistoryRange(date, historyRange)) {
      return [];
    }
    const parsed = isData ? parseMeasureValue(point.value, filters) : point.value;
    const value = isRating ? parseRatingValue(String(parsed)) : Number(parsed);
    return value === undefined || Number.isNaN(value) ? [] : [{ x: date, y: value }];
  });
}

export function portfolioIssueHistoryToLineData(
  history: HistoryDay[] | undefined,
  historyRange: string,
): Array<{ x: Date; y: number }> {
  return (history ?? []).flatMap((day) => {
    const date = new Date(day.date);
    return isDateInHistoryRange(date, historyRange) ? [{ x: date, y: sumDistribution(day) }] : [];
  });
}

function lineColor(value: string, index: number, slice?: string): string {
  if (
    slice === PieChartIssueSlice.ImpactSeverities ||
    slice === PieChartHotspotSlice.ReviewPriority
  ) {
    const colors: Record<string, string> = {
      BLOCKER: cssVar('color-charts-severity-blocker'),
      HIGH: cssVar('color-charts-severity-high'),
      MEDIUM: cssVar('color-charts-severity-medium'),
      LOW: cssVar('color-charts-severity-low'),
      INFO: cssVar('color-charts-severity-info'),
    };
    return (
      colors[value.toUpperCase()] ??
      CHART_CATEGORICAL_COLORS[index % CHART_CATEGORICAL_COLORS.length]
    );
  }
  return CHART_CATEGORICAL_COLORS[index % CHART_CATEGORICAL_COLORS.length];
}

/* Pie chart formatting */

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function lineChartDataToSingleSeries(
  data: Array<{ x: Date; y: number }>,
  label: string,
): Array<{ color: string; data: Array<{ x: Date; y: number }>; id: string; label: string }> {
  return data.length ? [{ color: CHART_CATEGORICAL_COLORS[0], data, id: 'total', label }] : [];
}

type PieChartLabelMetadata = {
  languages?: Record<string, { name: string }>;
  rules?: Record<string, { name: string }>;
  securityCategories?: Record<string, { title: string }>;
};

function getCleanCodeAttributeLabel(
  value: string,
  slice: string,
  formatMessage: (descriptor: { id: string }) => string,
): string | undefined {
  const categories = ['ADAPTABLE', 'CONSISTENT', 'INTENTIONAL', 'RESPONSIBLE'];
  if (
    slice === PieChartIssueSlice.CleanCodeAttributeCategories &&
    categories.includes(value.toUpperCase())
  ) {
    return formatMessage({ id: `cct.clean_code_attribute_category.${value.toUpperCase()}` });
  }
  return undefined;
}

function getPieChartMetadataLabel(
  value: string,
  metric: string,
  slice: string,
  metadata: PieChartLabelMetadata,
): string | undefined {
  if (metric === PieChartMetric.HotspotCount && slice === PieChartHotspotSlice.SecurityCategory) {
    const label = metadata.securityCategories?.[value]?.title;
    if (label) {
      return label;
    }
  }
  if (
    slice === PieChartIssueSlice.Rules ||
    (metric === PieChartMetric.HotspotCount && slice === PieChartHotspotSlice.SecurityCategory)
  ) {
    const label = metadata.rules?.[value]?.name;
    if (label) {
      return label;
    }
  }
  if (slice === PieChartIssueSlice.Languages || slice === PieChartLineSlice.Language) {
    return metadata.languages?.[value]?.name;
  }
  return undefined;
}

function getLineChartLabel(value: string, metric: string, slice: string): string | undefined {
  if (metric === PieChartMetric.LineCount && slice === PieChartLineSlice.Coverage) {
    return value === 'covered' ? 'Covered' : 'Uncovered';
  }
  if (metric === PieChartMetric.LineCount && slice === PieChartLineSlice.Duplications) {
    return value === 'duplicated' ? 'Duplicated' : 'Non-duplicated';
  }
  return undefined;
}

export function aggregateSmallSegments(
  entries: Array<[string, number]>,
  total: number,
): Array<[string, number]> {
  if (entries.length <= 5) {
    return entries;
  }
  let cutoff = entries.length;
  for (let index = 4; index < entries.length; index += 1) {
    if ((entries[index][1] / total) * 100 < 5) {
      cutoff = index;
      break;
    }
  }
  if (entries.length > 8) {
    cutoff = Math.min(cutoff, Math.min(7, entries.length - 2));
  }
  return entries.length - cutoff < 2
    ? entries
    : [
        ...entries.slice(0, cutoff),
        [
          `OTHER_${entries.length - cutoff}`,
          entries.slice(cutoff).reduce((sum, [, count]) => sum + count, 0),
        ],
      ];
}

function orderForSlice(slice: string, metric: string): string[] | undefined {
  if (
    slice === PieChartIssueSlice.ImpactSeverities ||
    slice === PieChartHotspotSlice.ReviewPriority
  ) {
    return ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
  }
  if (slice === PieChartIssueSlice.IssueStatuses || slice === PieChartProjectSlice.Status) {
    return ['OPEN', 'FIXED', 'ACCEPTED', 'FALSE_POSITIVE', 'ERROR', 'NOT_COMPUTED', 'OK'];
  }
  if (slice === PieChartHotspotSlice.ReviewStatus) {
    return ['TO_REVIEW', 'FIXED', 'SAFE'];
  }
  if (metric === PieChartMetric.LineCount && slice === PieChartLineSlice.Coverage) {
    return ['uncovered', 'covered'];
  }
  if (metric === PieChartMetric.LineCount && slice === PieChartLineSlice.Duplications) {
    return ['duplicated', 'non-duplicated'];
  }
  return undefined;
}

export function sortSegments(
  entries: Array<[string, number]>,
  slice: string,
  metric: string,
): Array<[string, number]> {
  const order = orderForSlice(slice, metric);
  return entries.sort((a, b) => {
    if (!order) {
      return b[1] - a[1];
    }
    const ai = order.indexOf(a[0].toUpperCase());
    const bi = order.indexOf(b[0].toUpperCase());
    if (ai !== -1 && bi !== -1) {
      return ai - bi;
    }
    if (ai !== -1) {
      return -1;
    }
    if (bi !== -1) {
      return 1;
    }
    return b[1] - a[1];
  });
}

export function getDisplayedPieChartSegmentValues(
  counts: Record<string, number>,
  slice: string,
  metric: string,
): string[] {
  const entries = sortSegments(
    Object.entries(counts).filter(([, count]) => count > 0),
    slice,
    metric,
  );
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  return total === 0
    ? []
    : aggregateSmallSegments(entries, total)
        .map(([value]) => value)
        .filter((value) => !value.startsWith('OTHER_'));
}

export function formatPercentage(value: number): string {
  if (value >= 1) {
    return String(Math.round(value));
  }
  if (value === 0) {
    return '0';
  }
  return value.toPrecision(1);
}

export function formatPieChartSegmentLabel(
  value: string,
  formatMessage: (descriptor: { id: string }) => string,
  metric: string,
  slice: string,
  metadata: PieChartLabelMetadata = {},
): string {
  if (value.startsWith('OTHER_')) {
    return `Other (${value.split('_')[1]})`;
  }
  const cleanCodeAttributeLabel = getCleanCodeAttributeLabel(value, slice, formatMessage);
  if (cleanCodeAttributeLabel !== undefined) {
    return cleanCodeAttributeLabel;
  }
  const metadataLabel = getPieChartMetadataLabel(value, metric, slice, metadata);
  if (metadataLabel !== undefined) {
    return metadataLabel;
  }
  const lineChartLabel = getLineChartLabel(value, metric, slice);
  if (lineChartLabel !== undefined) {
    return lineChartLabel;
  }
  return titleCase(value);
}

function getIssueStatusColor(value: string): string | undefined {
  if (['OPEN', 'ERROR'].includes(value)) {
    return cssVar('color-charts-severity-high');
  }
  if (['FIXED', 'OK', 'REVIEWED'].includes(value)) {
    return cssVar('color-charts-categorical-3');
  }
  if (['ACCEPTED', 'NOT_COMPUTED'].includes(value)) {
    return cssVar('color-charts-severity-info');
  }
  if (['FALSE_POSITIVE', 'NONE'].includes(value)) {
    return cssVar('color-charts-placeholder-default');
  }
  return undefined;
}

function getHotspotStatusColor(value: string): string | undefined {
  if (value === 'TO_REVIEW') {
    return cssVar('color-charts-severity-high');
  }
  if (value === 'FIXED') {
    return cssVar('color-charts-categorical-3');
  }
  if (value === 'SAFE') {
    return cssVar('color-charts-severity-info');
  }
  return undefined;
}

function getLineChartColor(value: string, slice: string): string | undefined {
  if (slice === PieChartLineSlice.Coverage) {
    return value === 'uncovered'
      ? cssVar('color-charts-severity-high')
      : cssVar('color-charts-categorical-3');
  }
  if (slice === PieChartLineSlice.Duplications) {
    return value === 'duplicated'
      ? cssVar('color-charts-severity-high')
      : cssVar('color-charts-categorical-3');
  }
  return undefined;
}

export function getSegmentColor(value: string, index: number, slice: string): string {
  if (value.startsWith('OTHER_')) {
    return cssVar('color-charts-placeholder-default');
  }
  const upper = value.toUpperCase();
  if (
    slice === PieChartIssueSlice.ImpactSeverities ||
    slice === PieChartHotspotSlice.ReviewPriority
  ) {
    return lineColor(value, index, slice);
  }
  if (slice === PieChartIssueSlice.IssueStatuses || slice === PieChartProjectSlice.Status) {
    const color = getIssueStatusColor(upper);
    if (color !== undefined) {
      return color;
    }
  }
  if (slice === PieChartHotspotSlice.ReviewStatus) {
    const color = getHotspotStatusColor(upper);
    if (color !== undefined) {
      return color;
    }
  }
  const lineChartColor = getLineChartColor(value, slice);
  if (lineChartColor !== undefined) {
    return lineChartColor;
  }
  return CHART_CATEGORICAL_COLORS[index % CHART_CATEGORICAL_COLORS.length];
}

export function mapPieChartToIssueHistoryParams(args: {
  entityId: string;
  entityType: DashboardEntityType;
  filter: string;
  metric: string;
  slice: string;
}): {
  entityId: string;
  entityType: DashboardEntityType;
  impacts?: string[];
  issueTypes?: string[];
  sliceBy?: string;
  statuses?: string[];
} | null {
  const { entityId, entityType, filter, metric, slice } = args;
  if (metric === PieChartMetric.LineCount || metric === PieChartMetric.ProjectCount) {
    return null;
  }
  const sliceBy = PIE_SLICE_TO_HISTORY_DIMENSION[slice];
  if (!sliceBy) {
    return null;
  }
  if (metric === PieChartMetric.HotspotCount) {
    let statuses: string[] | undefined;
    if (filter === 'toReview') {
      statuses = ['TO_REVIEW'];
    } else if (filter === 'fixed') {
      statuses = ['FIXED'];
    } else if (filter === 'safe') {
      statuses = ['SAFE'];
    }
    return {
      entityId,
      entityType,
      issueTypes: ['SECURITY_HOTSPOT'],
      sliceBy,
      statuses,
    };
  }
  let quality: string | undefined;
  if (filter === PieChartIssueFilter.Security) {
    quality = 'SECURITY';
  } else if (filter === PieChartIssueFilter.Reliability) {
    quality = 'RELIABILITY';
  } else if (filter === PieChartIssueFilter.Maintainability) {
    quality = 'MAINTAINABILITY';
  }
  const statuses =
    slice === PieChartIssueSlice.IssueStatuses ? [...ISSUE_STATUSES_FOR_STATUS_SLICE] : ['OPEN'];
  return {
    entityId,
    entityType,
    impacts: quality ? impactsForQuality(quality) : [...DEFAULT_ISSUE_IMPACTS],
    sliceBy,
    statuses,
  };
}

export function supportsOrganizationPieChartIssueHistory(metric: string, slice: string): boolean {
  return (
    (metric === PieChartMetric.IssueCount || metric === PieChartMetric.HotspotCount) &&
    Boolean(PIE_SLICE_TO_HISTORY_DIMENSION[slice])
  );
}

export function isQualityGateStatusWidget(widget: PieChartWidget): boolean {
  return (
    widget.filter === '' &&
    widget.metric === PieChartMetric.ProjectCount &&
    widget.slice === PieChartProjectSlice.Status
  );
}

export function lineCountMeasureKeys(scope: string): string[] {
  const isNewCode = scope === CodeScope.New;
  const keys = new Set<string>([MetricKey.ncloc_language_distribution]);
  [
    MetricKey.lines_to_cover,
    MetricKey.uncovered_lines,
    MetricKey.coverage,
    MetricKey.ncloc,
    MetricKey.new_lines,
    MetricKey.duplicated_lines,
    MetricKey.duplicated_lines_density,
  ].forEach((key) => keys.add(getPortfolioDashboardMeasureRequestKey(key, isNewCode)));
  return [...keys];
}

function numberValue(value: unknown): number | undefined {
  const number = Number.parseFloat(String(value));
  return Number.isFinite(number) ? number : undefined;
}

function distributionCounts(value: unknown): Record<string, number> {
  if (typeof value === 'string') {
    try {
      return distributionCounts(JSON.parse(value));
    } catch {
      return {};
    }
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, raw]) => {
      const count = Number(raw);
      return Number.isFinite(count) && count > 0 ? [[key, count]] : [];
    }),
  );
}

function getCoveragePieData(getMeasure: (key: MetricKey) => number | undefined): {
  counts: Record<string, number>;
} {
  const linesToCover = getMeasure(MetricKey.lines_to_cover);
  const uncoveredLines = getMeasure(MetricKey.uncovered_lines);
  const coverage = getMeasure(MetricKey.coverage);
  let uncovered = uncoveredLines;
  if (uncovered === undefined && coverage !== undefined && linesToCover !== undefined) {
    uncovered = Math.max(0, linesToCover * (1 - coverage / 100));
  }
  if (linesToCover === undefined || uncovered === undefined) {
    return { counts: {} };
  }
  return {
    counts: {
      uncovered,
      covered: Math.max(0, linesToCover - uncovered),
    },
  };
}

function getDuplicationsPieData(
  measures: Record<string, unknown>,
  scope: string,
  getMeasure: (key: MetricKey) => number | undefined,
): { counts: Record<string, number> } {
  let totalLines = getMeasure(MetricKey.ncloc);
  if (scope === CodeScope.New) {
    totalLines = numberValue(measures[MetricKey.new_lines]) ?? totalLines;
  }
  const duplicatedLines = getMeasure(MetricKey.duplicated_lines);
  const duplicatedDensity = getMeasure(MetricKey.duplicated_lines_density);
  let duplicated = duplicatedLines;
  if (duplicated === undefined && duplicatedDensity !== undefined && totalLines !== undefined) {
    duplicated = totalLines * (duplicatedDensity / 100);
  }
  if (duplicated === undefined || totalLines === undefined) {
    return { counts: {} };
  }
  return {
    counts: {
      duplicated,
      'non-duplicated': Math.max(0, totalLines - duplicated),
    },
  };
}

export function organizationMeasuresToLineCountPieData(
  measures: Record<string, unknown> | undefined,
  slice: string,
  scope: string,
): { counts: Record<string, number> } {
  if (!measures) {
    return { counts: {} };
  }
  const get = (key: MetricKey): number | undefined =>
    numberValue(measures[getPortfolioDashboardMeasureRequestKey(key, scope === CodeScope.New)]);
  if (slice === PieChartLineSlice.Language) {
    return { counts: distributionCounts(measures[MetricKey.ncloc_language_distribution]) };
  }
  if (slice === PieChartLineSlice.Coverage) {
    return getCoveragePieData(get);
  }
  if (slice === PieChartLineSlice.Duplications) {
    return getDuplicationsPieData(measures, scope, get);
  }
  return { counts: {} };
}

function ratingDistributionToQualityGateCounts(
  ratingDistribution: Record<string, number>,
): Record<string, number> {
  return {
    ERROR: ['B', 'C', 'D', 'E'].reduce((sum, rating) => sum + (ratingDistribution[rating] ?? 0), 0),
    OK: ratingDistribution.A ?? 0,
  };
}

type PortfolioMeasures = Record<string, string | number | Record<string, number>>;

export function adaptServerReleasabilityDistribution(
  measures: PortfolioMeasures | undefined,
): PortfolioMeasures | undefined {
  const ratingDistribution = measures?.[MetricKey.releasability_rating_distribution];
  if (typeof ratingDistribution !== 'object') {
    return measures;
  }
  return {
    ...measures,
    [MetricKey.releasability_status_distribution]:
      ratingDistributionToQualityGateCounts(ratingDistribution),
  };
}

export function qualityGateCounts(
  measures: Record<string, unknown> | undefined,
): Record<string, number> {
  const statusDistribution = distributionCounts(
    measures?.[MetricKey.releasability_status_distribution],
  );
  return Object.keys(statusDistribution).length > 0
    ? statusDistribution
    : ratingDistributionToQualityGateCounts(
        distributionCounts(measures?.[MetricKey.releasability_rating_distribution]),
      );
}

export function tryQualityGateDistributionMessageId(value: string): string | undefined {
  return ['ERROR', 'OK', 'NONE'].includes(value) ? `metric.level.${value}` : undefined;
}

export function resolveRichCountTrendMetricMetadata(_metricKey: MetricKey): {
  direction: number;
  type: MetricType;
} {
  return { direction: -1, type: MetricType.Integer };
}

export function computeTrendData(args: {
  activityUrl: { pathname: string };
  currentValue: string;
  measureFilters?: MeasureFilters;
  metric: { direction: number; type: MetricType };
  pastValue: string;
}): {
  activityUrl: { pathname: string };
  change: number;
  formattedChange: string;
  metricDirection: number;
  past: number;
  roundedChange: number;
} | null {
  const current = Number(parseMeasureValue(args.currentValue, args.measureFilters));
  const past = Number(parseMeasureValue(args.pastValue, args.measureFilters));
  if (Number.isNaN(current) || Number.isNaN(past)) {
    return null;
  }
  const change = current - past;
  const percentageChange = past === 0 ? 0 : (change / Math.abs(past)) * 100;
  const formattedChange =
    past === 0
      ? formatDashboardMeasure(Math.abs(change), args.metric.type)
      : formatDashboardMeasure(percentageChange, MetricType.Percent, {
          decimals: 1,
          omitExtraDecimalZeros: true,
        });
  return {
    activityUrl: args.activityUrl,
    change,
    formattedChange,
    metricDirection: args.metric.direction,
    past,
    roundedChange: past === 0 ? change : Number.parseFloat(formattedChange),
  };
}

export function portfolioMeasuresLatestRecord(
  history: MeasuresHistoryDay[] | undefined,
  metadata?: Record<string, { type: string }>,
): Record<string, string | number | Record<string, number>> | undefined {
  const latest = latestHistoryDay(history);
  if (!latest) {
    return undefined;
  }
  return Object.fromEntries(
    latest.measures.map((measure) => {
      const metricType = metadata?.[measure.metric]?.type ?? measure.type;
      if (metricType === MetricType.Rating) {
        return [measure.metric, normalizeRatingIndex(measure.value)];
      }
      if (metricType !== MetricType.Distribution && !measure.value.trim().startsWith('{')) {
        return [measure.metric, measure.value];
      }
      try {
        const parsed = JSON.parse(measure.value) as Record<string, unknown>;
        return [
          measure.metric,
          typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
            ? normalizeDistribution(parsed, measure.metric.endsWith('_rating_distribution'))
            : measure.value,
        ];
      } catch {
        return [measure.metric, measure.value];
      }
    }),
  );
}

function normalizeDistribution(
  distribution: Record<string, unknown>,
  isRatingDistribution: boolean,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(distribution).flatMap(([key, value]) => {
      const number = Number(value);
      if (Number.isNaN(number)) {
        return [];
      }
      return [[isRatingDistribution ? normalizeRatingIndex(key) : key, number]];
    }),
  );
}

function normalizeRatingIndex(value: string): string {
  const rating = Number(value);
  const ratingLabels = ['A', 'B', 'C', 'D', 'E'] as const;
  return Number.isInteger(rating) && rating >= 1 && rating <= ratingLabels.length
    ? ratingLabels[rating - 1]
    : value;
}

export function portfolioIssueHistoryToMultiLineSeries(
  history: HistoryDay[] | undefined,
  historyRange: string,
  groupBy: string,
): Array<{ color: string; data: Array<{ x: Date; y: number }>; id: string; label: string }> {
  if (!history?.length || groupBy === LineChartGroupBy.None) {
    return [];
  }
  let slice: string = PieChartIssueSlice.Rules;
  if (groupBy === LineChartGroupBy.Severity) {
    slice = PieChartIssueSlice.ImpactSeverities;
  } else if (groupBy === LineChartGroupBy.SoftwareQuality) {
    slice = PieChartIssueSlice.ImpactSoftwareQualities;
  } else if (groupBy === LineChartGroupBy.Status) {
    slice = PieChartIssueSlice.IssueStatuses;
  }
  const days = history.filter((day) => isDateInHistoryRange(new Date(day.date), historyRange));
  const totals = new Map<string, number>();
  days.forEach((day) => {
    day.distribution.forEach((entry) => {
      if (entry.value > 0) {
        totals.set(entry.key, (totals.get(entry.key) ?? 0) + entry.value);
      }
    });
  });
  let keys = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  if (groupBy === LineChartGroupBy.Rule) {
    keys = aggregateSmallSegments(
      keys,
      keys.reduce((sum, [, count]) => sum + count, 0),
    );
  }
  return keys.map(([key], index) => ({
    color: lineColor(key, index, slice),
    data: days.map((day) => ({
      x: new Date(day.date),
      y: key.startsWith('OTHER_')
        ? day.distribution
            .filter(
              (entry) => !keys.some(([kept]) => kept === entry.key && !kept.startsWith('OTHER_')),
            )
            .reduce((sum, entry) => sum + entry.value, 0)
        : (day.distribution.find((entry) => entry.key === key)?.value ?? 0),
    })),
    id: key,
    label: key.startsWith('OTHER_') ? `Other (${key.split('_')[1]})` : titleCase(key),
  }));
}
