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
import type { BranchLikeBase } from '~shared/types/branch-like';
import { SoftwareImpactSeverity } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import {
  CodeScope,
  DashboardMetricType,
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartMetric,
} from '../../../helpers/dashboard-widget-data';
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
          impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Low],
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
    expectUrl(
      buildProjectRichCountWidgetLink(
        'project-key',
        {
          impactSeverities: [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Low],
          impactSoftwareQuality: 'SECURITY',
          issueStatus: 'ACCEPTED',
        },
        CodeScope.New,
        undefined,
        true,
      ),
      '/project/issues',
      {
        id: 'project-key',
        issueStatuses: 'ACCEPTED',
        severities: 'CRITICAL,MINOR',
        sinceLeakPeriod: 'true',
        types: 'VULNERABILITY',
      },
    );
  });

  it('defaults rich Issue Count links to all code issue statuses', () => {
    expect.hasAssertions();
    expectUrl(
      buildProjectRichCountWidgetLink('project-key', undefined, CodeScope.Overall),
      '/project/issues',
      { id: 'project-key', issueStatuses: 'OPEN,CONFIRMED,ACCEPTED,FALSE_POSITIVE' },
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
    expectUrl(getProjectDashboardSummaryUrl('project-key'), '/summary/new_code', {
      id: 'project-key',
    });
    expectUrl(getProjectDashboardSummaryUrl('project-key', true), '/summary/overall', {
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
        issueStatuses: 'OPEN,CONFIRMED,ACCEPTED,FALSE_POSITIVE',
        sinceLeakPeriod: 'true',
      },
    );
    expectUrl(
      getProjectDashboardPieChartSegmentUrl('project-key', 'HIGH', baseProps, undefined, true),
      '/project/issues',
      {
        id: 'project-key',
        issueStatuses: 'OPEN,CONFIRMED,ACCEPTED,FALSE_POSITIVE',
        severities: 'CRITICAL',
        sinceLeakPeriod: 'true',
        types: 'VULNERABILITY',
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
      '/project/overview',
      { id: 'project-key' },
    );
  });

  it('builds top-list links with rich metric filters', () => {
    expect.hasAssertions();
    expectUrl(
      getProjectDashboardTopListRowUrl('project-key', 'typescript:S1', {
        metric: {
          measureFilters: {
            impactSeverities: [SoftwareImpactSeverity.High],
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
    expectUrl(
      getProjectDashboardTopListRowUrl(
        'project-key',
        'typescript:S1',
        {
          metric: {
            measureFilters: {
              impactSeverities: [SoftwareImpactSeverity.High],
              impactSoftwareQuality: 'RELIABILITY',
              issueStatus: 'ACCEPTED',
            },
            type: DashboardMetricType.Rich,
          },
          rankBy: 'rule',
          scope: CodeScope.New,
        },
        undefined,
        true,
      ),
      '/project/issues',
      {
        id: 'project-key',
        issueStatuses: 'ACCEPTED',
        rules: 'typescript:S1',
        severities: 'CRITICAL',
        sinceLeakPeriod: 'true',
        types: 'BUG',
      },
    );
    expectUrl(
      getProjectDashboardTopListRowUrl('project-key', 'typescript:S1', {
        metric: { metricKey: MetricKey.violations, type: DashboardMetricType.Raw },
        rankBy: 'rule',
        scope: CodeScope.Overall,
      }),
      '/project/issues',
      {
        id: 'project-key',
        issueStatuses: 'OPEN,CONFIRMED,ACCEPTED,FALSE_POSITIVE',
        rules: 'typescript:S1',
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

  it('preserves the portfolio key when building a drilldown link', () => {
    window.history.pushState({}, '', '/portfolio/dashboards/built-in/health?id=portfolio%2Fkey');

    expect(getPortfolioDashboardWidgetDrilldownUrl('widget-key', 'java:S1')).toBe(
      'breakdown/widget-key?q=java%3AS1&id=portfolio%2Fkey',
    );
  });

  describe('branch and pull request context', () => {
    const NON_MAIN_BRANCH: BranchLikeBase = { isMain: false, name: 'feature/foo' };
    const PULL_REQUEST: BranchLikeBase = {
      base: 'main',
      branch: 'feature/foo',
      key: '42',
      target: 'main',
      title: 'PR title',
    };

    it('carries a non-main branch through every widget link', () => {
      expectUrl(
        buildProjectRawCountWidgetLink(
          'project-key',
          MetricKey.coverage,
          CodeScope.Overall,
          NON_MAIN_BRANCH,
        ),
        '/component_measures',
        { branch: 'feature/foo', id: 'project-key', metric: MetricKey.coverage },
      );
      expectUrl(
        buildProjectRichCountWidgetLink(
          'project-key',
          undefined,
          CodeScope.Overall,
          NON_MAIN_BRANCH,
        ),
        '/project/issues',
        {
          branch: 'feature/foo',
          id: 'project-key',
          issueStatuses: 'OPEN,CONFIRMED,ACCEPTED,FALSE_POSITIVE',
        },
      );
      expectUrl(
        getProjectDashboardMeasureHistoryUrl('project-key', MetricKey.coverage, NON_MAIN_BRANCH),
        '/project/activity',
        {
          branch: 'feature/foo',
          [CUSTOM_METRICS_PARAM]: MetricKey.coverage,
          graph: 'custom',
          id: 'project-key',
        },
      );
      expectUrl(
        getProjectDashboardMeasuresUrl({
          branchLike: NON_MAIN_BRANCH,
          component: 'project-key',
          metric: MetricKey.reliability_rating,
        }),
        '/component_measures',
        { branch: 'feature/foo', id: 'project-key', metric: MetricKey.reliability_rating },
      );
      expectUrl(
        getProjectDashboardSummaryUrl('project-key', false, NON_MAIN_BRANCH),
        '/summary/new_code',
        { branch: 'feature/foo', id: 'project-key' },
      );
      expectUrl(
        getProjectDashboardPieChartSegmentUrl(
          'project-key',
          'java',
          {
            filter: '',
            metric: PieChartMetric.LineCount,
            scope: CodeScope.Overall,
            slice: 'language',
          },
          NON_MAIN_BRANCH,
        ),
        '/code',
        { branch: 'feature/foo', id: 'project-key' },
      );
      expectUrl(
        getProjectDashboardTopListRowUrl(
          'project-key',
          'typescript:S1',
          {
            metric: { type: DashboardMetricType.Raw, metricKey: MetricKey.bugs },
            rankBy: 'rule',
            scope: CodeScope.Overall,
          },
          NON_MAIN_BRANCH,
        ),
        '/project/issues',
        {
          branch: 'feature/foo',
          id: 'project-key',
          issueStatuses: 'OPEN,CONFIRMED,ACCEPTED,FALSE_POSITIVE',
          rules: 'typescript:S1',
        },
      );
    });

    it('carries a pull request through every widget link', () => {
      expectUrl(
        buildProjectRawCountWidgetLink(
          'project-key',
          MetricKey.coverage,
          CodeScope.Overall,
          PULL_REQUEST,
        ),
        '/component_measures',
        { id: 'project-key', metric: MetricKey.coverage, pullRequest: '42' },
      );
      expectUrl(
        getProjectDashboardSummaryUrl('project-key', false, PULL_REQUEST),
        '/summary/new_code',
        { id: 'project-key', pullRequest: '42' },
      );
    });

    it('omits branch params for the main branch, matching getBranchLikeQuery', () => {
      const MAIN_BRANCH: BranchLikeBase = { isMain: true, name: 'main' };
      expectUrl(
        getProjectDashboardSummaryUrl('project-key', false, MAIN_BRANCH),
        '/summary/new_code',
        { id: 'project-key' },
      );
    });
  });
});
