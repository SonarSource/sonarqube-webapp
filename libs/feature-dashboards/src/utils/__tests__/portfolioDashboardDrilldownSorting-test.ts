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
import type { WidgetInstance } from '../../dashboard-layout/logic/types';
import {
  DashboardMetricType,
  PieChartMetric,
  PieChartProjectSlice,
  type PortfolioDashboardWidgetPropMap,
} from '../../types/dashboard-widget';
import { CodeScope } from '../../types/widget-common';
import {
  getPortfolioDashboardDrilldownDefaultSortOrder,
  getPortfolioDashboardDrilldownWidgetDefaultSortOrder,
  PortfolioDashboardDrilldownSortOrder,
  toPortfolioDashboardProjectIssueCountsSort,
  toPortfolioDashboardProjectMeasuresSort,
} from '../portfolioDashboardDrilldownSorting';

type PortfolioDashboardWidget = WidgetInstance<PortfolioDashboardWidgetPropMap>;

describe('portfolioDashboardDrilldownSorting', () => {
  it.each([
    MetricKey.coverage,
    MetricKey.branch_coverage,
    MetricKey.line_coverage,
    MetricKey.security_hotspots_reviewed,
    MetricKey.alert_status,
  ])('sorts %s ascending by default', (metricKey) => {
    expect(getPortfolioDashboardDrilldownDefaultSortOrder(metricKey)).toBe(
      PortfolioDashboardDrilldownSortOrder.Asc,
    );
  });

  it.each([
    MetricKey.violations,
    MetricKey.lines_to_cover,
    MetricKey.conditions_to_cover,
    MetricKey.uncovered_lines,
    MetricKey.duplicated_lines_density,
    MetricKey.sqale_debt_ratio,
    MetricKey.sqale_index,
  ])('sorts %s descending by default', (metricKey) => {
    expect(getPortfolioDashboardDrilldownDefaultSortOrder(metricKey)).toBe(
      PortfolioDashboardDrilldownSortOrder.Desc,
    );
  });

  it.each([
    MetricKey.security_rating,
    MetricKey.reliability_rating,
    MetricKey.maintainability_rating,
    MetricKey.releasability_rating,
    MetricKey.security_review_rating,
    MetricKey.sca_rating_vulnerability,
  ])('sorts rating %s E to A by default', (metricKey) => {
    expect(getPortfolioDashboardDrilldownDefaultSortOrder(metricKey)).toBe(
      PortfolioDashboardDrilldownSortOrder.Desc,
    );
  });

  it('falls back to descending for issue and future metrics', () => {
    expect(getPortfolioDashboardDrilldownDefaultSortOrder(undefined)).toBe(
      PortfolioDashboardDrilldownSortOrder.Desc,
    );
    expect(getPortfolioDashboardDrilldownDefaultSortOrder(MetricKey.violations)).toBe(
      PortfolioDashboardDrilldownSortOrder.Desc,
    );
  });

  it('derives defaults from count, rating, and quality-gate widgets', () => {
    const coverageWidget: PortfolioDashboardWidget = {
      dimensions: { height: 2, width: 2 },
      key: 'coverage-widget',
      position: { x: 0, y: 0 },
      props: {
        metric: { metricKey: MetricKey.coverage, type: DashboardMetricType.Raw },
        scope: CodeScope.Overall,
      },
      type: 'count',
    };
    const ratingWidget: PortfolioDashboardWidget = {
      dimensions: { height: 2, width: 2 },
      key: 'rating',
      position: { x: 0, y: 0 },
      props: { metricKey: MetricKey.security_rating, scope: CodeScope.Overall },
      type: 'ratingBadge',
    };
    const qualityGateWidget: PortfolioDashboardWidget = {
      dimensions: { height: 2, width: 2 },
      key: 'quality-gate',
      position: { x: 0, y: 0 },
      props: {
        filter: '',
        metric: PieChartMetric.ProjectCount,
        scope: CodeScope.Overall,
        showLegend: true,
        slice: PieChartProjectSlice.Status,
      },
      type: 'pieChart',
    };

    expect(getPortfolioDashboardDrilldownWidgetDefaultSortOrder(coverageWidget)).toBe(
      PortfolioDashboardDrilldownSortOrder.Asc,
    );
    expect(getPortfolioDashboardDrilldownWidgetDefaultSortOrder(ratingWidget)).toBe(
      PortfolioDashboardDrilldownSortOrder.Desc,
    );
    expect(getPortfolioDashboardDrilldownWidgetDefaultSortOrder(qualityGateWidget)).toBe(
      PortfolioDashboardDrilldownSortOrder.Asc,
    );
    expect(getPortfolioDashboardDrilldownWidgetDefaultSortOrder(undefined)).toBe(
      PortfolioDashboardDrilldownSortOrder.Desc,
    );
  });

  it.each([
    [
      PortfolioDashboardDrilldownSortOrder.Asc,
      '+issueCount,+projectName',
      '+measure.currentValue,+projectName',
    ],
    [
      PortfolioDashboardDrilldownSortOrder.Desc,
      '-issueCount,+projectName',
      '-measure.currentValue,+projectName',
    ],
  ])(
    'builds shared %s API sorts with an alphabetical tie-break',
    (order, issueSort, measureSort) => {
      expect(toPortfolioDashboardProjectIssueCountsSort(order)).toBe(issueSort);
      expect(toPortfolioDashboardProjectMeasuresSort(order)).toBe(measureSort);
    },
  );
});
