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

import type { IntlShape } from 'react-intl';
import {
  PieChartHotspotFilter,
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartMetric,
  PieChartProjectSlice,
} from '../../../types/dashboard-widget';
import { getPieChartMetricLabel, getPieChartTitle } from '../pieChartHeaderText';

/** Minimal formatMessage stub: returns the id unchanged (no values). */
const formatMessage = ((descriptor: { id: string }): string =>
  descriptor.id) as IntlShape['formatMessage'];

describe('getPieChartTitle', () => {
  it('builds open+filter title for issue count with security filter and severity slice', () => {
    const title = getPieChartTitle(formatMessage, {
      filter: PieChartIssueFilter.Security,
      isPortfolioDashboard: false,
      metric: PieChartMetric.IssueCount,
      slice: PieChartIssueSlice.ImpactSeverities,
    });

    expect(title).toBe(
      'dashboard.pie_chart.header.open_prefix software_quality.SECURITY dashboard.pie_chart.header.metric.issue_count dashboard.pie_chart.header.join_by dashboard.pie_chart.header.slice.impact_severities',
    );
  });

  it('returns portfolio quality gate title for project count by status', () => {
    const title = getPieChartTitle(formatMessage, {
      filter: '' as const,
      isPortfolioDashboard: true,
      metric: PieChartMetric.ProjectCount,
      slice: PieChartProjectSlice.Status,
    });

    expect(title).toBe('dashboard.pie_chart.header.title.portfolio_projects_by_quality_gate');
  });

  it('builds plain (no open prefix) title for issue count by status on portfolio dashboards', () => {
    const title = getPieChartTitle(formatMessage, {
      filter: '' as const,
      isPortfolioDashboard: true,
      metric: PieChartMetric.IssueCount,
      slice: PieChartIssueSlice.IssueStatuses,
    });

    expect(title).toBe(
      'dashboard.pie_chart.header.metric.issue_count dashboard.pie_chart.header.join_by dashboard.pie_chart.header.slice.issue_statuses',
    );
  });

  it('uses the rule slice label for portfolio hotspot security categories', () => {
    const title = getPieChartTitle(formatMessage, {
      filter: '' as const,
      isPortfolioDashboard: true,
      metric: PieChartMetric.HotspotCount,
      slice: PieChartHotspotSlice.SecurityCategory,
    });

    expect(title).toBe(
      'dashboard.pie_chart.header.metric.hotspot_count dashboard.pie_chart.header.join_by dashboard.pie_chart.header.slice.rules',
    );
  });

  it('prepends a hotspot status filter', () => {
    const title = getPieChartTitle(formatMessage, {
      filter: PieChartHotspotFilter.Fixed,
      isPortfolioDashboard: false,
      metric: PieChartMetric.HotspotCount,
      slice: PieChartHotspotSlice.ReviewStatus,
    });

    expect(title).toBe(
      'hotspot.filters.status.FIXED dashboard.pie_chart.header.metric.hotspot_count dashboard.pie_chart.header.join_by dashboard.pie_chart.header.slice.review_status',
    );
  });
});

describe('getPieChartMetricLabel', () => {
  it('returns quality gate label for portfolio project count by status', () => {
    const label = getPieChartMetricLabel(formatMessage, {
      filter: '' as const,
      isPortfolioDashboard: true,
      metric: PieChartMetric.ProjectCount,
      slice: PieChartProjectSlice.Status,
    });

    expect(label).toBe('dashboard.pie_chart.header.metric.quality_gate');
  });

  it('returns plain metric label when no filter is set', () => {
    const label = getPieChartMetricLabel(formatMessage, {
      filter: '' as const,
      isPortfolioDashboard: true,
      metric: PieChartMetric.IssueCount,
      slice: PieChartIssueSlice.IssueStatuses,
    });

    expect(label).toBe('dashboard.pie_chart.header.metric.issue_count');
  });

  it('includes an issue filter in the metric label', () => {
    const label = getPieChartMetricLabel(formatMessage, {
      filter: PieChartIssueFilter.Security,
      isPortfolioDashboard: false,
      metric: PieChartMetric.IssueCount,
      slice: PieChartIssueSlice.ImpactSeverities,
    });

    expect(label).toBe('software_quality.SECURITY dashboard.pie_chart.header.metric.issue_count');
  });
});
