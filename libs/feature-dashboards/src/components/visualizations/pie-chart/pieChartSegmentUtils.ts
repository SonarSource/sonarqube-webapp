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
import {
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartProjectSlice,
  PieChartSlice,
} from '../../../types/dashboard-widget';
import type { RuleMetadataByKey } from '../../../types/widget-common';

export interface AggregateSmallSegmentsOptions {
  maxSegments?: number;
  minPercentage?: number;
}

interface PieChartSegmentLabelMetadata {
  languages?: Record<string, { name: string }>;
  rules?: RuleMetadataByKey;
  /** SonarSource standard titles keyed by hotspot `securityCategory` (e.g. `dos`, `weak-cryptography`). */
  securityCategories?: Record<string, { title: string }>;
}

export const DEFAULT_PIE_CHART_COLORS = CHART_CATEGORICAL_COLORS;

export const SEVERITY_COLORS: Record<string, string> = {
  BLOCKER: cssVar('color-charts-severity-blocker'),
  HIGH: cssVar('color-charts-severity-high'),
  HIGH_PRIORITY: cssVar('color-charts-severity-high'),
  INFO: cssVar('color-charts-severity-info'),
  LOW: cssVar('color-charts-severity-low'),
  LOW_PRIORITY: cssVar('color-charts-severity-low'),
  MEDIUM: cssVar('color-charts-severity-medium'),
  MEDIUM_PRIORITY: cssVar('color-charts-severity-medium'),
};

export const PLACEHOLDER_COLOR = cssVar('color-charts-placeholder-default');

export const SENTIMENT_COLORS = {
  ACKNOWLEDGED: cssVar('color-charts-severity-info'),
  NEGATIVE: cssVar('color-charts-severity-high'),
  NEUTRAL: cssVar('color-charts-placeholder-default'),
  POSITIVE: cssVar('color-charts-categorical-3'),
};

const SEVERITY_ORDER = ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
const STATUS_ORDER = ['OPEN', 'FIXED', 'ACCEPTED', 'FALSE_POSITIVE', 'ERROR', 'NOT_COMPUTED', 'OK'];
const COVERAGE_ORDER = ['uncovered', 'covered'];
const DUPLICATION_ORDER = ['duplicated', 'non-duplicated'];
const HOTSPOT_REVIEW_ORDER = ['TO_REVIEW', 'FIXED', 'SAFE'];

function getInherentOrder(slice: PieChartSlice, metric: PieChartMetric): string[] | null {
  if (
    slice === PieChartIssueSlice.ImpactSeverities ||
    slice === PieChartHotspotSlice.ReviewPriority
  ) {
    return SEVERITY_ORDER;
  }

  if (slice === PieChartIssueSlice.IssueStatuses || slice === PieChartProjectSlice.Status) {
    return STATUS_ORDER;
  }

  if (slice === PieChartHotspotSlice.ReviewStatus) {
    return HOTSPOT_REVIEW_ORDER;
  }

  if (metric === PieChartMetric.LineCount) {
    if (slice === PieChartLineSlice.Coverage) {
      return COVERAGE_ORDER;
    }

    if (slice === PieChartLineSlice.Duplications) {
      return DUPLICATION_ORDER;
    }
  }

  return null;
}

function formatRuleLabel(value: string, metadata?: RuleMetadataByKey): string | null {
  if (!metadata) {
    return null;
  }

  const rule = metadata[value];
  if (!rule) {
    return null;
  }

  return rule.name;
}

function formatLanguageLabel(
  value: string,
  metadata?: Record<string, { name: string }>,
): string | null {
  if (!metadata) {
    return null;
  }

  const language = metadata[value];
  return language ? language.name : null;
}

function formatLineCountLabel(value: string, slice: PieChartSlice): string | null {
  if (slice === PieChartLineSlice.Coverage) {
    return value === 'covered' ? 'Covered' : 'Uncovered';
  }

  if (slice === PieChartLineSlice.Duplications) {
    return value === 'duplicated' ? 'Duplicated' : 'Non-duplicated';
  }

  return null;
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** i18n key for organizations/issue-search clean-code attribute category bucket keys. */
function cleanCodeAttributeCategoryMessageId(
  value: string,
): `cct.clean_code_attribute_category.${string}` | undefined {
  const normalized = value.trim().toUpperCase();
  switch (normalized) {
    case 'ADAPTABLE':
    case 'CONSISTENT':
    case 'INTENTIONAL':
    case 'RESPONSIBLE':
      return `cct.clean_code_attribute_category.${normalized}`;
    default:
      return undefined;
  }
}

/** Shared pie segment label for clean-code categories and standard slice metadata. */
export function formatPieChartSegmentLabel(
  value: string,
  formatMessage: (descriptor: { id: string }) => string,
  metric: PieChartMetric,
  slice: PieChartSlice,
  metadata?: PieChartSegmentLabelMetadata,
  options?: Readonly<{ needsLanguageMetadata?: boolean }>,
): string {
  const cleanCodeMessageId =
    slice === PieChartIssueSlice.CleanCodeAttributeCategories
      ? cleanCodeAttributeCategoryMessageId(value)
      : undefined;
  if (cleanCodeMessageId !== undefined) {
    return formatMessage({ id: cleanCodeMessageId });
  }

  const usesLanguageMetadata =
    slice === PieChartIssueSlice.Languages ||
    slice === PieChartLineSlice.Language ||
    Boolean(options?.needsLanguageMetadata);

  return formatSegmentLabel(value, metric, slice, {
    languages: usesLanguageMetadata ? metadata?.languages : undefined,
    rules: metadata?.rules,
    securityCategories: metadata?.securityCategories,
  });
}

/**
 * Segment values that will be rendered individually in the pie chart (after sorting and
 * aggregation). Excludes `OTHER_*` buckets — those labels are derived locally and never need
 * rule/language metadata lookups.
 */
export function getDisplayedPieChartSegmentValues(
  counts: Record<string, number>,
  metric: PieChartMetric,
  slice: PieChartSlice,
): string[] {
  const entries = Object.entries(counts).filter(([, count]) => count > 0);
  const sortedEntries = sortSegments(entries, slice, metric);
  const total = sortedEntries.reduce((sum, [, count]) => sum + count, 0);

  if (total === 0) {
    return [];
  }

  return aggregateSmallSegments(sortedEntries, total)
    .map(([value]) => value)
    .filter((value) => !value.startsWith('OTHER_'));
}

export function aggregateSmallSegments(
  entries: Array<[string, number]>,
  total: number,
  options: AggregateSmallSegmentsOptions = {},
): Array<[string, number]> {
  const { maxSegments = 8, minPercentage = 5 } = options;

  if (entries.length <= 5) {
    return entries;
  }

  let cutoff = entries.length;
  for (let i = 4; i < entries.length; i++) {
    const percentage = (entries[i][1] / total) * 100;
    if (percentage < minPercentage) {
      cutoff = i;
      break;
    }
  }

  if (entries.length > maxSegments) {
    const maxCutoff = Math.min(maxSegments - 1, entries.length - 2);
    cutoff = Math.min(cutoff, maxCutoff);
  }

  if (entries.length - cutoff < 2) {
    return entries;
  }

  const kept = entries.slice(0, cutoff);
  const aggregated = entries.slice(cutoff);
  kept.push([`OTHER_${aggregated.length}`, aggregated.reduce((sum, [, count]) => sum + count, 0)]);

  return kept;
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

export function sortSegments(
  entries: Array<[string, number]>,
  slice: PieChartSlice,
  metric: PieChartMetric,
): Array<[string, number]> {
  const inherentOrder = getInherentOrder(slice, metric);

  if (!inherentOrder) {
    return entries.sort((a, b) => b[1] - a[1]);
  }

  return entries.sort((a, b) => {
    const aIndex = inherentOrder.indexOf(a[0].toUpperCase());
    const bIndex = inherentOrder.indexOf(b[0].toUpperCase());

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    if (aIndex !== -1) {
      return -1;
    }

    if (bIndex !== -1) {
      return 1;
    }

    return b[1] - a[1];
  });
}

export function formatSegmentLabel(
  value: string,
  metric: PieChartMetric,
  slice: PieChartSlice,
  metadata?: PieChartSegmentLabelMetadata,
): string {
  if (value.startsWith('OTHER_')) {
    return `Other (${value.split('_')[1]})`;
  }

  if (
    metric === PieChartMetric.HotspotCount &&
    slice === PieChartHotspotSlice.SecurityCategory &&
    metadata?.securityCategories
  ) {
    const categoryTitle = metadata.securityCategories[value]?.title;
    if (categoryTitle) {
      return categoryTitle;
    }
  }

  if (
    slice === PieChartIssueSlice.Rules ||
    (metric === PieChartMetric.HotspotCount && slice === PieChartHotspotSlice.SecurityCategory)
  ) {
    const formattedRule = formatRuleLabel(value, metadata?.rules);
    if (formattedRule) {
      return formattedRule;
    }
  }

  if (slice === PieChartIssueSlice.Languages || slice === PieChartLineSlice.Language) {
    const formattedLanguage = formatLanguageLabel(value, metadata?.languages);
    if (formattedLanguage) {
      return formattedLanguage;
    }
  }

  if (metric === PieChartMetric.LineCount) {
    const formattedLineCountLabel = formatLineCountLabel(value, slice);
    if (formattedLineCountLabel) {
      return formattedLineCountLabel;
    }
  }

  return toTitleCase(value);
}

export function getSegmentColor(value: string, index: number, slice: PieChartSlice): string {
  if (value.startsWith('OTHER_')) {
    return PLACEHOLDER_COLOR;
  }

  const upperValue = value.toUpperCase();

  if (
    slice === PieChartIssueSlice.ImpactSeverities ||
    slice === PieChartHotspotSlice.ReviewPriority
  ) {
    return (
      SEVERITY_COLORS[upperValue] ||
      DEFAULT_PIE_CHART_COLORS[index % DEFAULT_PIE_CHART_COLORS.length]
    );
  }

  if (slice === PieChartIssueSlice.IssueStatuses || slice === PieChartProjectSlice.Status) {
    switch (upperValue) {
      case 'OPEN':
      case 'ERROR':
        return SENTIMENT_COLORS.NEGATIVE;
      case 'FIXED':
      case 'OK':
      case 'REVIEWED':
        return SENTIMENT_COLORS.POSITIVE;
      case 'ACCEPTED':
      case 'NOT_COMPUTED':
        return SENTIMENT_COLORS.ACKNOWLEDGED;
      case 'FALSE_POSITIVE':
      case 'NONE':
        return SENTIMENT_COLORS.NEUTRAL;
      default:
        return DEFAULT_PIE_CHART_COLORS[index % DEFAULT_PIE_CHART_COLORS.length];
    }
  }

  if (slice === PieChartHotspotSlice.ReviewStatus) {
    switch (upperValue) {
      case 'TO_REVIEW':
        return SENTIMENT_COLORS.NEGATIVE;
      case 'FIXED':
        return SENTIMENT_COLORS.POSITIVE;
      case 'SAFE':
        return SENTIMENT_COLORS.ACKNOWLEDGED;
      default:
        return DEFAULT_PIE_CHART_COLORS[index % DEFAULT_PIE_CHART_COLORS.length];
    }
  }

  if (slice === PieChartLineSlice.Coverage) {
    return value === 'uncovered' ? SENTIMENT_COLORS.NEGATIVE : SENTIMENT_COLORS.POSITIVE;
  }

  if (slice === PieChartLineSlice.Duplications) {
    return value === 'duplicated' ? SENTIMENT_COLORS.NEGATIVE : SENTIMENT_COLORS.POSITIVE;
  }

  return DEFAULT_PIE_CHART_COLORS[index % DEFAULT_PIE_CHART_COLORS.length];
}
