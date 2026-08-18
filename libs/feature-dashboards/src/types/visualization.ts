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

// ============================================================================
// Generic Visualization Types - Reusable across Project and Portfolio Dashboards
// ============================================================================

import type { TrendData } from '../components/visualizations/TrendIndicator';

/**
 * Represents a single segment in a pie or donut chart
 */
export interface PieChartSegment {
  color: string;
  count: number;
  label: string;
  percentage: string; // Formatted percentage string (e.g., "0.4" for 0.4%)
  value: string;
  visualCount?: number; // Used for rendering minimum-sized segments
}

/**
 * Props for the shared pie chart visualization renderer.
 */
export interface PieChartProps {
  ariaLabel?: string;
  /**
   * For donut charts only: extra pixels added to the inner radius so the hole is wider.
   * Use enough to exceed half the width of any centered overlay (e.g. ExtraLarge RatingBadge
   * is ~3.5rem); otherwise segments still sit under the badge and the gap is invisible.
   */
  donutInnerRadiusExtraPx?: number;
  height: number;
  hoveredIndex?: number | null;
  onHoverChange?: (index: number | null) => void;
  onSegmentClick?: (segment: PieChartSegment) => void;
  pastry?: PieChartPastry;
  segments: PieChartSegment[];
  showLabels?: boolean;
  tooltipCountMessageKey?: string;
  tooltipPercentageMessageKey?: string;
  width: number;
}

/**
 * Pie chart rendering style
 */
export enum PieChartPastry {
  Pie = 'pie',
  Donut = 'donut',
}

/**
 * Represents a single data point in a line chart
 */
export interface LineChartDataPoint {
  x: number | Date;
  y: number;
}

/**
 * A named time series rendered by {@link MultiLineChart}.
 */
export interface LineChartSeries {
  color: string;
  data: LineChartDataPoint[];
  id: string;
  label: string;
}

/**
 * A single row in the Top list ranked table.
 */
export interface TopListRow {
  count: number;
  /** Optional navigation target for the metric/count cell (e.g. the issues page). */
  countLinkTo?: string;
  label: string;
  /** Optional navigation target for the rank-by/label cell (e.g. the rule details page). */
  linkTo?: string;
  rank: number;
  trendData?: TrendData | null;
  /** Facet value key (e.g. rule key) used for navigation and data lookups. */
  value: string;
}

/** Column header labels for the Top list table (derived from rank-by and metric). */
export interface TopListColumnHeaders {
  metric: string;
  rankBy: string;
  trend: string;
}

/**
 * Props for the generic TopList visualization component.
 */
export interface TopListProps {
  ariaLabel: string;
  columnHeaders: TopListColumnHeaders;
  hasFetchError: boolean;
  isPending: boolean;
  onRowClick?: (row: TopListRow) => void;
  rows: TopListRow[];
  selectedRowLabel?: string;
  /**
   * Whether to render the Trend column. Defaults to `true`. Set to `false` where trend data is not
   * yet available (e.g. project Top List, pending migration to the issue-count-history API).
   */
  showTrendColumn?: boolean;
}
