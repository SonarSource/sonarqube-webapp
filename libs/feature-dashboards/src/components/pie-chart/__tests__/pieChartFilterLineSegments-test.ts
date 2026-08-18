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
} from '../../../types/dashboard-widget';
import { CodeScope } from '../../../types/widget-common';
import {
  getPieChartFilterLineSegments,
  isPieChartHotspotFilter,
  isPieChartIssueFilter,
  mapPieChartHotspotFilterToIssueCountStatuses,
} from '../pieChartFilterLineSegments';

/** Minimal formatMessage stub: returns the id unchanged. */
const formatMessage = ((descriptor: { id: string }): string =>
  descriptor.id) as IntlShape['formatMessage'];

describe('getPieChartFilterLineSegments', () => {
  it('returns scope, software quality label, and slice label when an issue pie filter is set', () => {
    const segments = getPieChartFilterLineSegments(formatMessage, {
      filter: PieChartIssueFilter.Reliability,
      isPortfolioDashboard: false,
      metric: PieChartMetric.IssueCount,
      scope: CodeScope.Overall,
      slice: PieChartIssueSlice.ImpactSeverities,
    });

    expect(segments).toEqual([
      'dashboard_widget.codescope.overall',
      'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label: software_quality.RELIABILITY',
      'dashboard.add_widget_modal.define_widget.slice_by: dashboard.pie_chart.header.slice.impact_severities',
    ]);
  });

  it('returns scope, hotspot status, and slice labels when a hotspot filter is set', () => {
    expect(
      getPieChartFilterLineSegments(formatMessage, {
        filter: PieChartHotspotFilter.Fixed,
        isPortfolioDashboard: false,
        metric: PieChartMetric.HotspotCount,
        scope: CodeScope.New,
        slice: PieChartHotspotSlice.ReviewStatus,
      }),
    ).toEqual([
      'dashboard_widget.codescope.new',
      'dashboard.add_widget_modal.apply_filters_section.pie_filter.label: hotspot.filters.status.FIXED',
      'dashboard.add_widget_modal.define_widget.slice_by: dashboard.pie_chart.header.slice.review_status',
    ]);
  });

  it('omits the filter segment when no filter is set', () => {
    expect(
      getPieChartFilterLineSegments(formatMessage, {
        filter: '',
        isPortfolioDashboard: false,
        metric: PieChartMetric.IssueCount,
        scope: CodeScope.Overall,
        slice: PieChartIssueSlice.IssueStatuses,
      }),
    ).toEqual([
      'dashboard_widget.codescope.overall',
      'dashboard.add_widget_modal.define_widget.slice_by: dashboard.pie_chart.header.slice.issue_statuses',
    ]);
  });
});

describe('pie chart filter guards', () => {
  it.each(Object.values(PieChartIssueFilter))('recognizes the %s issue filter', (filter) => {
    expect(isPieChartIssueFilter(filter)).toBe(true);
    expect(isPieChartHotspotFilter(filter)).toBe(false);
  });

  it.each(Object.values(PieChartHotspotFilter))('recognizes the %s hotspot filter', (filter) => {
    expect(isPieChartHotspotFilter(filter)).toBe(true);
    expect(isPieChartIssueFilter(filter)).toBe(false);
  });

  it('rejects an empty filter', () => {
    expect(isPieChartIssueFilter('')).toBe(false);
    expect(isPieChartHotspotFilter('')).toBe(false);
  });
});

describe('mapPieChartHotspotFilterToIssueCountStatuses', () => {
  it.each([
    [PieChartHotspotFilter.ToReview, ['TO_REVIEW']],
    [PieChartHotspotFilter.Fixed, ['FIXED']],
    [PieChartHotspotFilter.Safe, ['SAFE']],
  ] as const)('maps %s to its issue-count status', (filter, expected) => {
    expect(mapPieChartHotspotFilterToIssueCountStatuses(filter)).toEqual(expected);
  });

  it('returns undefined for a non-hotspot filter', () => {
    expect(
      mapPieChartHotspotFilterToIssueCountStatuses(PieChartIssueFilter.Security),
    ).toBeUndefined();
  });
});
