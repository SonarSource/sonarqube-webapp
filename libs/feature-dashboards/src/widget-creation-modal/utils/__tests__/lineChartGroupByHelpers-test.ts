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
import { LineChartGroupBy } from '../../../data/widgets/line-chart';
import {
  DashboardMetricType,
  PieChartIssueSlice,
  RichMetricKey,
} from '../../../types/dashboard-widget';
import {
  buildLineChartGroupBySelectOptions,
  getLineChartGroupByLabelMessageId,
  isLineChartGroupByActive,
  isLineChartGroupByEligibleForMetric,
  lineChartGroupByConflictsWithMeasureFilter,
  mapLineChartGroupByToPieChartSlice,
} from '../lineChartGroupByHelpers';

describe('isLineChartGroupByActive', () => {
  it('returns false for None', () => {
    expect(isLineChartGroupByActive(LineChartGroupBy.None)).toBe(false);
  });

  it('returns true for any non-None value', () => {
    expect(isLineChartGroupByActive(LineChartGroupBy.Severity)).toBe(true);
    expect(isLineChartGroupByActive(LineChartGroupBy.SoftwareQuality)).toBe(true);
    expect(isLineChartGroupByActive(LineChartGroupBy.Status)).toBe(true);
    expect(isLineChartGroupByActive(LineChartGroupBy.Rule)).toBe(true);
  });
});

describe('isLineChartGroupByEligibleForMetric', () => {
  it('returns false for null', () => {
    expect(isLineChartGroupByEligibleForMetric(null)).toBe(false);
  });

  it('returns true for the Rich Issues metric', () => {
    expect(
      isLineChartGroupByEligibleForMetric({
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      }),
    ).toBe(true);
  });

  it('returns true for the Raw violations metric', () => {
    expect(
      isLineChartGroupByEligibleForMetric({
        metricKey: MetricKey.violations,
        type: DashboardMetricType.Raw,
      }),
    ).toBe(true);
  });

  it('returns false for Raw metrics other than violations', () => {
    expect(
      isLineChartGroupByEligibleForMetric({
        metricKey: MetricKey.ncloc,
        type: DashboardMetricType.Raw,
      }),
    ).toBe(false);
  });
});

describe('buildLineChartGroupBySelectOptions', () => {
  it('returns the five group-by options in deterministic order with localized labels', () => {
    const formatMessage = jest.fn(({ id }: { id: string }) => `t:${id}`);
    const options = buildLineChartGroupBySelectOptions(formatMessage as never);

    expect(options.map((option) => option.value)).toEqual([
      LineChartGroupBy.None,
      LineChartGroupBy.Severity,
      LineChartGroupBy.SoftwareQuality,
      LineChartGroupBy.Status,
      LineChartGroupBy.Rule,
    ]);
    expect(options[0].label).toBe('t:dashboard.line_chart.group_by.none');
    expect(options[1].label).toBe('t:dashboard.line_chart.group_by.severity');
    expect(options[2].label).toBe('t:dashboard.line_chart.group_by.software_quality');
    expect(options[3].label).toBe('t:dashboard.line_chart.group_by.status');
    expect(options[4].label).toBe('t:dashboard.line_chart.group_by.rule');
  });
});

describe('getLineChartGroupByLabelMessageId', () => {
  it.each([
    [LineChartGroupBy.None, 'dashboard.line_chart.group_by.none'],
    [LineChartGroupBy.Severity, 'dashboard.line_chart.group_by.severity'],
    [LineChartGroupBy.SoftwareQuality, 'dashboard.line_chart.group_by.software_quality'],
    [LineChartGroupBy.Status, 'dashboard.line_chart.group_by.status'],
    [LineChartGroupBy.Rule, 'dashboard.line_chart.group_by.rule'],
  ])('maps %s to %s', (groupBy, expected) => {
    expect(getLineChartGroupByLabelMessageId(groupBy)).toBe(expected);
  });
});

describe('mapLineChartGroupByToPieChartSlice', () => {
  it('returns null for None', () => {
    expect(mapLineChartGroupByToPieChartSlice(LineChartGroupBy.None)).toBeNull();
  });

  it.each([
    [LineChartGroupBy.Severity, PieChartIssueSlice.ImpactSeverities],
    [LineChartGroupBy.SoftwareQuality, PieChartIssueSlice.ImpactSoftwareQualities],
    [LineChartGroupBy.Status, PieChartIssueSlice.IssueStatuses],
    [LineChartGroupBy.Rule, PieChartIssueSlice.Rules],
  ])('maps %s to the corresponding pie chart slice', (groupBy, slice) => {
    expect(mapLineChartGroupByToPieChartSlice(groupBy)).toBe(slice);
  });
});

describe('lineChartGroupByConflictsWithMeasureFilter', () => {
  it.each([
    [LineChartGroupBy.Status, 'issueStatus' as const],
    [LineChartGroupBy.SoftwareQuality, 'impactSoftwareQuality' as const],
    [LineChartGroupBy.Severity, 'impactSeverities' as const],
  ])('maps %s to its conflicting measure filter %s', (groupBy, conflict) => {
    expect(lineChartGroupByConflictsWithMeasureFilter(groupBy)).toBe(conflict);
  });

  it.each([[LineChartGroupBy.None], [LineChartGroupBy.Rule]])('returns null for %s', (groupBy) => {
    expect(lineChartGroupByConflictsWithMeasureFilter(groupBy)).toBeNull();
  });
});
