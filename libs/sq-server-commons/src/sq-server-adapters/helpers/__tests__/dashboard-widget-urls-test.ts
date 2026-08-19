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

import type { To } from 'react-router-dom';
import { MetricKey } from '~shared/types/metrics';
import {
  CodeScope,
  DashboardMetricType,
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartMetric,
} from '../dashboard-widget-data';
import {
  buildProjectRawCountWidgetLink,
  buildProjectRichCountWidgetLink,
  getDashboardDocumentationUrl,
  getPortfolioDashboardMeasuresUrl,
  getPortfolioDashboardWidgetDrilldownUrl,
  getProjectDashboardMeasureHistoryUrl,
  getProjectDashboardMeasuresUrl,
  getProjectDashboardPieChartSegmentUrl,
  getProjectDashboardRuleUrl,
  getProjectDashboardSummaryUrl,
  getProjectDashboardTopListRowUrl,
  serializeDashboardWidgetUrl,
} from '../dashboard-widget-urls';

const CUSTOM_METRICS_PARAM = 'custom_metrics';

function expectUrl(to: To, pathname: string, params: Record<string, string>) {
  const url = new URL(serializeDashboardWidgetUrl(to), 'http://localhost');
  expect(url.pathname).toBe(pathname);
  expect(Object.fromEntries(url.searchParams)).toEqual(params);
}

describe('Server dashboard widget URL seams', () => {
  it('builds raw Issue Count measure links for overall and new code', () => {
    expect.hasAssertions();
    expectUrl(
      buildProjectRawCountWidgetLink('project-key', MetricKey.coverage, CodeScope.Overall),
      '/component_measures',
      { id: 'project-key', metric: MetricKey.coverage },
    );
    expectUrl(
      buildProjectRawCountWidgetLink('project-key', MetricKey.coverage, CodeScope.New),
      '/component_measures',
      { id: 'project-key', metric: MetricKey.new_coverage },
    );
    expectUrl(
      buildProjectRawCountWidgetLink('project-key', MetricKey.sqale_rating, CodeScope.New),
      '/component_measures',
      { id: 'project-key', metric: MetricKey.new_maintainability_rating },
    );
  });

  it('builds rich Issue Count links with configured filters', () => {
    expect.hasAssertions();
    expectUrl(
      buildProjectRichCountWidgetLink(
        'project-key',
        {
          impactSeverities: ['HIGH', 'LOW'],
          impactSoftwareQuality: 'SECURITY',
          issueStatus: 'ACCEPTED',
        },
        CodeScope.New,
      ),
      '/project/issues',
      {
        id: 'project-key',
        impactSeverities: 'HIGH,LOW',
        impactSoftwareQualities: 'SECURITY',
        issueStatuses: 'ACCEPTED',
        sinceLeakPeriod: 'true',
      },
    );
  });

  it('defaults rich Issue Count links to open issues', () => {
    expect.hasAssertions();
    expectUrl(
      buildProjectRichCountWidgetLink('project-key', undefined, CodeScope.Overall),
      '/project/issues',
      { id: 'project-key', issueStatuses: 'OPEN,CONFIRMED' },
    );
  });

  it('builds activity, measure, summary, and rule links', () => {
    expectUrl(
      getProjectDashboardMeasureHistoryUrl('project-key', MetricKey.coverage),
      '/project/activity',
      {
        [CUSTOM_METRICS_PARAM]: MetricKey.coverage,
        graph: 'custom',
        id: 'project-key',
      },
    );
    expectUrl(
      getProjectDashboardMeasuresUrl({
        component: 'project-key',
        metric: MetricKey.reliability_rating,
        sinceLeakPeriod: true,
      }),
      '/component_measures',
      { id: 'project-key', metric: MetricKey.new_reliability_rating },
    );
    expectUrl(getProjectDashboardSummaryUrl('project-key'), '/dashboard', {
      codeScope: CodeScope.New,
      id: 'project-key',
    });
    expectUrl(getProjectDashboardSummaryUrl('project-key', true), '/dashboard', {
      codeScope: CodeScope.Overall,
      id: 'project-key',
    });
    expect(getProjectDashboardRuleUrl('typescript:S1')).toContain('rule_key=typescript%3AS1');
  });

  it('builds project Issue Count pie-chart segment links', () => {
    expect.hasAssertions();
    const baseProps = {
      filter: PieChartIssueFilter.Security,
      metric: PieChartMetric.IssueCount,
      scope: CodeScope.New,
      slice: PieChartIssueSlice.ImpactSeverities,
    };

    expectUrl(
      getProjectDashboardPieChartSegmentUrl('project-key', 'HIGH', baseProps),
      '/project/issues',
      {
        id: 'project-key',
        impactSeverities: 'HIGH',
        impactSoftwareQualities: 'SECURITY',
        issueStatuses: 'OPEN,CONFIRMED',
        sinceLeakPeriod: 'true',
      },
    );
    expectUrl(
      getProjectDashboardPieChartSegmentUrl('project-key', 'ACCEPTED', {
        ...baseProps,
        filter: '',
        scope: CodeScope.Overall,
        slice: PieChartIssueSlice.IssueStatuses,
      }),
      '/project/issues',
      { id: 'project-key', issueStatuses: 'ACCEPTED' },
    );
  });

  it('builds hotspot, line-count, and project-count pie-chart links', () => {
    expect.hasAssertions();
    expectUrl(
      getProjectDashboardPieChartSegmentUrl('project-key', 'SAFE', {
        filter: '',
        metric: PieChartMetric.HotspotCount,
        scope: CodeScope.New,
        slice: PieChartHotspotSlice.ReviewStatus,
      }),
      '/security_hotspots',
      { id: 'project-key', inNewCodePeriod: 'true', status: 'SAFE' },
    );
    expectUrl(
      getProjectDashboardPieChartSegmentUrl('project-key', 'java', {
        filter: '',
        metric: PieChartMetric.LineCount,
        scope: CodeScope.Overall,
        slice: 'language',
      }),
      '/code',
      { id: 'project-key' },
    );
    expectUrl(
      getProjectDashboardPieChartSegmentUrl('project-key', 'ERROR', {
        filter: '',
        metric: PieChartMetric.ProjectCount,
        scope: CodeScope.Overall,
        slice: 'status',
      }),
      '/dashboard',
      { id: 'project-key' },
    );
  });

  it('builds top-list links with rich metric filters', () => {
    expect.hasAssertions();
    expectUrl(
      getProjectDashboardTopListRowUrl('project-key', 'typescript:S1', {
        metric: {
          measureFilters: {
            impactSeverities: ['HIGH'],
            impactSoftwareQuality: 'RELIABILITY',
            issueStatus: 'ACCEPTED',
          },
          type: DashboardMetricType.Rich,
        },
        rankBy: 'rule',
        scope: CodeScope.New,
      }),
      '/project/issues',
      {
        id: 'project-key',
        impactSeverities: 'HIGH',
        impactSoftwareQualities: 'RELIABILITY',
        issueStatuses: 'ACCEPTED',
        rules: 'typescript:S1',
        sinceLeakPeriod: 'true',
      },
    );
  });

  it('builds safe portfolio links', () => {
    expectUrl(
      getPortfolioDashboardMeasuresUrl('portfolio-key', '', MetricKey.coverage),
      '/portfolio',
      { id: 'portfolio-key' },
    );
    expect(getPortfolioDashboardWidgetDrilldownUrl(undefined)).toBeUndefined();
    expect(getPortfolioDashboardWidgetDrilldownUrl('widget-key')).toBe('breakdown/widget-key');
    expect(getPortfolioDashboardWidgetDrilldownUrl('widget-key', 'java:S1')).toBe(
      'breakdown/widget-key?q=java%3AS1',
    );
  });

  it('passes through documentation and string URLs', () => {
    expect(getDashboardDocumentationUrl('/docs/dashboard')).toBe('/docs/dashboard');
    expect(serializeDashboardWidgetUrl('/project/issues?id=project-key')).toBe(
      '/project/issues?id=project-key',
    );
  });
});
