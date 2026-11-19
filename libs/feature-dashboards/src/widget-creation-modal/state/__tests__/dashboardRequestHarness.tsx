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

import { writeFileSync } from 'node:fs';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { waitFor, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import {
  useDashboardPortfolioContext,
  useDashboardProjectContext,
} from '~adapters/context/dashboardContext';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import {
  usePortfolioWidgetMetricMetadataQuery,
  useWidgetMetricMetadataQuery,
} from '~adapters/queries/widget-metric-metadata';
import { useDashboardRuleLabels } from '~adapters/queries/widget-rule-metadata';
import { type CompleteWidgetConfig } from '../../../data/widgets';
import { WidgetInstanceProvider } from '../../../dashboard-layout/shared/WidgetInstanceContext';
import { PortfolioCountWidgetWrapper } from '../../../widget-wrappers/count/PortfolioCountWidgetWrapper';
import { ProjectCountWidgetWrapper } from '../../../widget-wrappers/count/ProjectCountWidgetWrapper';
import { PortfolioLineChartWidgetWrapper } from '../../../widget-wrappers/line-chart/PortfolioLineChartWidgetWrapper';
import { ProjectLineChartWidgetWrapper } from '../../../widget-wrappers/line-chart/ProjectLineChartWidgetWrapper';
import { PortfolioPieChartWidgetWrapper } from '../../../widget-wrappers/pie-chart/PortfolioPieChartWidgetWrapper';
import { ProjectPieChartWidgetWrapper } from '../../../widget-wrappers/pie-chart/ProjectPieChartWidgetWrapper';
import { PortfolioRatingBadgeWidgetWrapper } from '../../../widget-wrappers/rating-badge/PortfolioRatingBadgeWidgetWrapper';
import { ProjectRatingBadgeWidgetWrapper } from '../../../widget-wrappers/rating-badge/ProjectRatingBadgeWidgetWrapper';
import { PortfolioTopListWidgetWrapper } from '../../../widget-wrappers/top-list/PortfolioTopListWidgetWrapper';
import { ProjectTopListWidgetWrapper } from '../../../widget-wrappers/top-list/ProjectTopListWidgetWrapper';
import { server } from '~shared/api/mocks/server';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey, MetricType } from '~shared/types/metrics';

// Request construction and HTTP clients stay real; only context, metadata and painting are replaced.
jest.mock('~adapters/context/dashboardContext');
jest.mock('~adapters/queries/branch');
jest.mock('~adapters/queries/widget-metric-metadata');
jest.mock('~adapters/queries/widget-rule-metadata');
jest.mock('~feature-dashboards/components/common/WidgetLoadingSpinner', () => ({
  WidgetLoadingSpinner: () => <div aria-label="audit-pending" />,
}));
jest.mock('~feature-dashboards/components/common/WidgetNoData', () => ({
  WidgetNoData: () => <div aria-label="audit-ready" />,
}));
jest.mock('~feature-dashboards/components/visualizations/CountWidget', () => ({
  CountWidget: () => <div aria-label="audit-ready" />,
}));
jest.mock('~feature-dashboards/components/visualizations/RatingBadgeDisplay', () => ({
  RatingBadgeDisplay: () => <div aria-label="audit-ready" />,
}));
jest.mock('~feature-dashboards/components/visualizations/pie-chart/InteractivePieChart', () => ({
  InteractivePieChart: () => <div aria-label="audit-ready" />,
}));
jest.mock('~feature-dashboards/components/visualizations/pie-chart/PieChart', () => ({
  PieChart: () => <div aria-label="audit-ready" />,
}));
jest.mock('~feature-dashboards/widget-wrappers/line-chart/LineChartWidgetShell', () => ({
  LineChartWidgetShell: ({ isPending }: { isPending: boolean }) => (
    <div aria-label={isPending ? 'audit-pending' : 'audit-ready'} />
  ),
}));
jest.mock('~feature-dashboards/components/visualizations/top-list/TopList', () => ({
  TopList: ({ isPending }: { isPending: boolean }) => (
    <div aria-label={isPending ? 'audit-pending' : 'audit-ready'} />
  ),
}));

type Entity = 'project' | 'portfolio' | 'application';
interface CapturedRequest {
  method: string;
  path: string;
  rawQuery: string;
  query: [string, string][];
  body: string;
}
interface RecordedCase {
  id: string;
  entity: Entity;
  isStandardMode: boolean;
  config: CompleteWidgetConfig;
  requests: CapturedRequest[];
}

const fixedDate = new Date('2026-08-30T12:00:00.000Z');
const branch = { branchId: 'branch-uuid', isMain: true, name: 'main' };
const recordedCases: RecordedCase[] = [];

function metricType(key: string): MetricType {
  if (key.endsWith('_distribution')) return MetricType.Distribution;
  if (key.endsWith('_rating')) return MetricType.Rating;
  if (key === MetricKey.alert_status) return MetricType.Level;
  if (key.includes(MetricKey.coverage) || key.includes('density')) return MetricType.Percent;
  return MetricType.Integer;
}

const metrics = Object.fromEntries(
  Object.values(MetricKey).map((key) => [
    key,
    { key, name: key, type: metricType(key), direction: -1 },
  ]),
);
const measureRows = Object.values(MetricKey).map((metric) => ({
  metric,
  type: metricType(metric),
  value: metric.endsWith('_distribution')
    ? '{"1":4,"5":2,"java":3}'
    : metric === MetricKey.alert_status
      ? 'OK'
      : '2',
}));
const distribution = Array.from({ length: 17 }, (_, index) => ({
  key: `java:S${index + 1}`,
  value: 17 - index,
}));
const fixture = {
  measuresHistory: ['2026-07-30', '2026-08-30'].map((date) => ({ date, measures: measureRows })),
  issueCountHistory: ['2026-07-30', '2026-08-30'].map((date) => ({ date, distribution })),
  issueDensityHistory: [{ date: '2026-08-30', distribution: [{ key: 'all', value: 2 }] }],
  issueResolutionHistory: [{ date: '2026-08-30', distribution: [{ key: 'all', value: 5 }] }],
  scaResolutionHistory: [{ date: '2026-08-30', distribution: [{ key: 'all', value: 5 }] }],
  statistic: 'MTTR',
  projectMeasures: [],
  projectIssueCounts: [],
  hiddenProjectCount: 0,
  page: { pageIndex: 1, pageSize: 500, total: 0 },
  paging: { pageIndex: 1, pageSize: 100, total: 4 },
  issues: [],
  components: [],
  rules: [],
  facets: [{ property: 'languages', values: [{ val: 'java', count: 4 }] }],
  languages: [{ key: 'java', name: 'Java' }],
  projectStatus: { status: 'OK', ignoredConditions: false, conditions: [] },
};

function widget(config: CompleteWidgetConfig, entity: Entity, isStandardMode: boolean) {
  const isProject = entity === 'project';
  switch (config.widgetType) {
    case 'count':
      return isProject ? (
        <ProjectCountWidgetWrapper {...config} isStandardMode={isStandardMode} />
      ) : (
        <PortfolioCountWidgetWrapper {...config} />
      );
    case 'lineChart':
      return isProject ? (
        <ProjectLineChartWidgetWrapper {...config} isStandardMode={isStandardMode} />
      ) : (
        <PortfolioLineChartWidgetWrapper {...config} isStandardMode={isStandardMode} />
      );
    case 'pieChart':
    case 'donutChart':
      return isProject ? (
        <ProjectPieChartWidgetWrapper {...config} isStandardMode={isStandardMode} />
      ) : (
        <PortfolioPieChartWidgetWrapper {...config} isStandardMode={isStandardMode} />
      );
    case 'ratingBadge':
      return isProject ? (
        <ProjectRatingBadgeWidgetWrapper {...config} />
      ) : (
        <PortfolioRatingBadgeWidgetWrapper {...config} />
      );
    case 'topList':
      return isProject ? (
        <ProjectTopListWidgetWrapper {...config} isStandardMode={isStandardMode} />
      ) : (
        <PortfolioTopListWidgetWrapper {...config} />
      );
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .useFakeTimers({
      doNotFake: [
        'hrtime',
        'nextTick',
        'performance',
        'queueMicrotask',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
      ],
    })
    .setSystemTime(fixedDate);
  jest
    .mocked(useCurrentBranchQuery)
    .mockReturnValue({ data: branch, isPending: false } as ReturnType<
      typeof useCurrentBranchQuery
    >);
  jest.mocked(useDashboardProjectContext).mockReturnValue({
    componentKey: 'project-key',
    projectEntityId: 'branch-uuid',
    organization: 'project-key',
    isLoading: false,
    branchLike: branch,
  });
  jest.mocked(useWidgetMetricMetadataQuery).mockReturnValue({
    data: metrics,
    isError: false,
    isPending: false,
    isLoading: false,
  } as ReturnType<typeof useWidgetMetricMetadataQuery>);
  const portfolioMetadataFixture = {
    metrics: Object.values(metrics).map((metric) => ({ ...metric, direction: '-1' })),
    page: { pageIndex: 1, pageSize: 500, total: Object.keys(metrics).length },
  };
  const portfolioMetadata: NonNullable<
    ReturnType<typeof usePortfolioWidgetMetricMetadataQuery>['data']
  > = portfolioMetadataFixture;
  jest.mocked(usePortfolioWidgetMetricMetadataQuery).mockReturnValue({
    data: portfolioMetadata,
    isError: false,
    isPending: false,
  } as ReturnType<typeof usePortfolioWidgetMetricMetadataQuery>);
  jest.mocked(useDashboardRuleLabels).mockReturnValue({
    isError: false,
    isPending: false,
    organization: undefined,
    rulesByKey: Object.fromEntries(
      distribution.map(({ key }, index) => [key, { name: `Rule ${index + 1}`, langName: 'Java' }]),
    ),
  });
});

afterEach(() => {
  server.resetHandlers();
  jest.useRealTimers();
});

export function writeServerDashboardRequestTrace(name: string) {
  const tracePath = process.env.DASHBOARD_REQUEST_TRACE;
  if (tracePath) writeFileSync(`${tracePath}.${name}.json`, JSON.stringify(recordedCases, null, 2));
}

function AuditWidget({
  config,
  entity,
  isStandardMode,
  captureClient,
}: {
  config: CompleteWidgetConfig;
  entity: Entity;
  isStandardMode: boolean;
  captureClient: (client: QueryClient) => void;
}) {
  captureClient(useQueryClient());
  return (
    <WidgetInstanceProvider dimensions={{ width: 6, height: 6 }} widgetKey="audit-widget">
      {widget(config, entity, isStandardMode)}
    </WidgetInstanceProvider>
  );
}

export async function auditServerDashboardRequest({
  id,
  config,
  entity,
  isStandardMode,
}: {
  id: string;
  config: CompleteWidgetConfig;
  entity: Entity;
  isStandardMode: boolean;
}) {
  const requests: CapturedRequest[] = [];
  const capturedClient: { current?: QueryClient } = {};
  jest.mocked(useDashboardPortfolioContext).mockReturnValue({
    entityType: entity === 'application' ? 'APPLICATION' : 'PORTFOLIO',
    getPortfolioMetric: () => undefined,
    isEntityTypePending: false,
    portfolioId: entity === 'application' ? 'application-uuid' : 'portfolio-uuid',
  });
  server.use(
    http.all('*', async ({ request }) => {
      const url = new URL(request.url);
      const captured: CapturedRequest = {
        method: request.method,
        path: url.pathname,
        rawQuery: url.search,
        query: Array.from(url.searchParams.entries()),
        body: '',
      };
      requests.push(captured);
      captured.body = await request.clone().text();
      return HttpResponse.json(
        url.pathname.endsWith('/clean-code-policy/mode')
          ? { mode: isStandardMode ? 'STANDARD_EXPERIENCE' : 'MQR', modified: false }
          : fixture,
      );
    }),
  );
  const rendered = renderWithRouter(
    <AuditWidget
      captureClient={(client) => {
        capturedClient.current = client;
      }}
      config={config}
      entity={entity}
      isStandardMode={isStandardMode}
    />,
  );
  const client = capturedClient.current;
  if (!client) throw new Error('The widget did not mount a fresh query client');
  recordedCases.push({ id, entity, isStandardMode, config, requests });
  try {
    await waitFor(() => {
      const activeQueriesSucceeded = client
        .getQueryCache()
        .getAll()
        .filter((query) => query.isActive())
        .every((query) => query.state.status === 'success');
      expect({
        fetching: client.isFetching(),
        activeQueriesSucceeded,
        pendingWidget: screen.queryByLabelText('audit-pending'),
      }).toEqual({ fetching: 0, activeQueriesSucceeded: true, pendingWidget: null });
    });
    expect(requests.length).toBeGreaterThan(0);
    // Preserve request sequence, duplicate requests and repeated parameter values. Only
    // query-key ordering and equivalent percent encoding are normalized before snapshotting.
    return {
      config,
      requests: requests.map(({ method, path, query, body }) => ({
        method,
        path,
        query: [...query].sort(([left], [right]) => left.localeCompare(right)),
        body,
      })),
    };
  } finally {
    rendered.unmount();
    client.clear();
  }
}
