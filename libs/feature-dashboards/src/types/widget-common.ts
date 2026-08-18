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

import type { ReactNode } from 'react';
import type { MetricKey } from '~shared/types/metrics';
import { IssueResolutionStatistic } from './organization-issue-resolution-history';
import { ScaResolutionStatistic } from './organization-sca-resolution-history';

// ============================================================================
// Common Widget Types - Reusable across Project and Portfolio Dashboards
// ============================================================================

/**
 * Stable names for dashboard widget type keys.
 * Defined here (not in data/widgets) to avoid circular imports with widget modules.
 */
export const VisualizationType = {
  Count: 'count',
  DonutChart: 'donutChart',
  LineChart: 'lineChart',
  PieChart: 'pieChart',
  RatingBadge: 'ratingBadge',
  TopList: 'topList',
} as const;

/** Top list metric (issue count only for now; more values may be added later). */
export const TopListMetric = {
  IssueCount: 'issueCount',
} as const;

export type TopListMetricValue = (typeof TopListMetric)[keyof typeof TopListMetric];

/** How the Top list orders its rows (more values may be added later). */
export const TopListRankBy = {
  Rule: 'rule',
} as const;

export type TopListRankByValue = (typeof TopListRankBy)[keyof typeof TopListRankBy];

/** Supported row counts for the Top list widget (persisted on each widget). */
export const TopListLimit = {
  Five: 5,
  Ten: 10,
  Fifteen: 15,
} as const;

export type TopListLimitValue = (typeof TopListLimit)[keyof typeof TopListLimit];

/** Default row count for newly created Top list widgets. */
export const DEFAULT_TOP_LIST_LIMIT: TopListLimitValue = TopListLimit.Five;

/** Row counts offered in the define-widget limit select (expand when 10/15 are product-ready). */
export const TOP_LIST_UI_LIMIT_OPTIONS = [
  TopListLimit.Five,
] as const satisfies readonly TopListLimitValue[];

export type DashboardWidgetType = (typeof VisualizationType)[keyof typeof VisualizationType];

/**
 * Widget rendering modes
 */
export enum WidgetMode {
  Edit = 'edit',
  View = 'view',
  Preview = 'preview',
}

/**
 * Code scope for metrics (Overall vs New Code)
 */
export enum CodeScope {
  Overall = 'overall',
  New = 'new',
}

/**
 * Metric direction for issue-resolution statistics.
 * 1 = higher is better (green up, red down); -1 = lower is better (red up, green down).
 * Used by the trend indicator to invert color logic for MTTR statistics.
 */
export const ISSUE_RESOLUTION_METRIC_DIRECTION: Record<IssueResolutionStatistic, number> = {
  [IssueResolutionStatistic.ResolvedIssues]: 1,
  [IssueResolutionStatistic.MTTR]: -1,
  [IssueResolutionStatistic.RecentMTTR]: -1,
};

/** Metric direction for SCA resolution statistics. See {@link ISSUE_RESOLUTION_METRIC_DIRECTION}. */
export const SCA_RESOLUTION_METRIC_DIRECTION: Record<ScaResolutionStatistic, number> = {
  [ScaResolutionStatistic.ScaMTTR]: -1,
};

/**
 * Sentinel value for the Issue density metric option in the widget picker.
 * Not a MetricKey since issue density is backed by a dedicated history endpoint.
 */
export const ISSUE_DENSITY_METRIC_OPTION_VALUE = 'issueDensity' as const;
export type IssueDensityMetricOptionValue = typeof ISSUE_DENSITY_METRIC_OPTION_VALUE;

/** Sentinel value for the SCA MTTR metric backed by the SCA resolution history endpoint. */
export const SCA_MTTR_METRIC_OPTION_VALUE = 'scaMttr' as const;
export type ScaMttrMetricOptionValue = typeof SCA_MTTR_METRIC_OPTION_VALUE;

export type MetricOptionValue =
  MetricKey | IssueResolutionStatistic | IssueDensityMetricOptionValue | ScaMttrMetricOptionValue;

export interface MetricOption {
  label: string;
  suffix?: ReactNode;
  value: MetricOptionValue;
}

export interface MetricGroup {
  group: string;
  items: MetricOption[];
}

/** Options for the pie/donut visualization "metric" select (counts / line count), not portfolio line-chart MetricKey measures. */
export interface PieChartMetricSelectOption {
  label: string;
  suffix?: ReactNode;
  value: string;
}

export interface WidgetMetricPickerOptions {
  countMetrics: MetricGroup[];
  /** Override blurb above the define-widget form (must accept a `link` rich-text value like the project default). */
  defineWidgetDescriptionMessageId?: string;
  /** Override doc URL for the define-widget description link (e.g. portfolio metrics docs). */
  defineWidgetDocumentationUrl?: string;
  /**
   * When true, new visualization types (Top list & Multi-line chart) are available in the add-widget modal.
   */
  enableNewDashboardWidgets?: boolean;
  /**
   * Portfolio add-widget flow: store `security_hotspots` as a rich metric for issue APIs, and apply portfolio pie rules.
   */
  isPortfolioWidgetConfigurator?: boolean;
  /** When set, line chart metric select uses these groups instead of `countMetrics`. */
  lineChartMetrics?: MetricGroup[];
  /** When set, pie/donut uses these instead of the default project message ids (same values supported today). */
  pieChartMetricOptions?: PieChartMetricSelectOption[];
  /** Grouped options for the rating-badge metric select (same shape as `countMetrics`). */
  ratingBadgeMetrics: MetricGroup[];
  /**
   * When set, "New code" is only valid for metrics where this returns true.
   */
  supportsNewCodeScopeForMetric?: (
    metricKey: MetricKey,
    visualizationType: DashboardWidgetType,
  ) => boolean;
}

/** Rule display metadata keyed by rule key, e.g. `{ 'java:S1234': { name, langName } }`. */
export type RuleMetadataByKey = Record<string, { langName?: string; name: string }>;
