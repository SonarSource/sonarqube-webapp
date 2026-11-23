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

import {
  type DashboardMeasureHistory,
  IssueResolutionStatistic,
  CodeScope,
} from '~shared/types/dashboard-history';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import {
  useDashboardPortfolioContext,
  useDashboardProjectContext,
} from '~adapters/context/dashboardContext';
import { useDashboardMeasureQuery } from '~adapters/queries/dashboard-measure';
import { usePortfolioRulesMetadataOrganization } from '~adapters/queries/portfolio-widget-organization-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { useDashboardRuleLabels } from '~adapters/queries/widget-rule-metadata';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { MultiLineChart } from '../../../components/visualizations/multi-line-chart/MultiLineChart';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import {
  PortfolioLineChartWidgetWrapper,
  SeverityOrderedPortfolioLineChartWidgetWrapper,
} from '../PortfolioLineChartWidgetWrapper';
import { ProjectLineChartWidgetWrapper } from '../ProjectLineChartWidgetWrapper';
import { DashboardMetricType, RichMetricKey } from '../../../data/widgets/shared';

jest.mock('~adapters/context/dashboardContext');

jest.mock('~adapters/queries/dashboard-measure', () => ({
  useDashboardMeasureQuery: jest.fn(),
}));
jest.mock('~adapters/queries/portfolio-widget-organization-data');
jest.mock('~adapters/queries/widget-metric-metadata');
jest.mock('~adapters/queries/widget-rule-metadata');
jest.mock('../../../components/visualizations/multi-line-chart/MultiLineChart', () => ({
  MultiLineChart: jest.fn(() => <div data-testid="multi-line-chart" />),
}));
jest.mock('../../../hooks/useMttrFormatters', () => ({
  useMttrFormatters: () => ({
    formatMttrDotValue: (value: number) => `dot:${value}`,
    formatMttrTick: (value: number) => `tick:${value}`,
  }),
}));

const { DashboardMeasureLineChart } = jest.requireActual(
  '../DashboardMeasureLineChart',
) as typeof import('../DashboardMeasureLineChart');

function renderChart(chart: React.ReactElement) {
  return render(
    <IntlProvider locale="en" messages={{}}>
      {chart}
    </IntlProvider>,
  );
}

beforeEach(() => {
  jest.mocked(usePortfolioRulesMetadataOrganization).mockReturnValue({
    isLoading: false,
    organization: 'portfolio-org',
  });
  jest.mocked(useDashboardRuleLabels).mockReturnValue({
    isError: false,
    isPending: false,
    rulesByKey: { 'typescript:S1': { name: 'Prefer const' } },
  } as unknown as ReturnType<typeof useDashboardRuleLabels>);
  jest.mocked(useWidgetMetricMetadataQuery).mockReturnValue({
    data: {
      [MetricKey.coverage]: {
        key: MetricKey.coverage,
        name: 'Coverage',
        type: MetricType.Percent,
      },
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useWidgetMetricMetadataQuery>);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.mocked(MultiLineChart).mockImplementation(() => <div data-testid="multi-line-chart" />);
});

it('renders chronological measures history in the unified portfolio chart', () => {
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'measures-history',
      history: [
        {
          date: '2026-01-01',
          measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '81.2' }],
        },
        {
          date: '2026-02-01',
          measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: 'invalid' }],
        },
      ],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);

  renderChart(
    <DashboardMeasureLineChart
      entityId="portfolio-1"
      entityType="PORTFOLIO"
      measure={{ api: 'measures-history', metricKey: MetricKey.coverage, scope: CodeScope.Overall }}
      metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
      months={6}
    />,
  );

  expect(screen.getByTestId('multi-line-chart')).toBeInTheDocument();
  expect(MultiLineChart).toHaveBeenCalledWith(
    expect.objectContaining({
      ariaLabel:
        'portfolio_dashboard.widget.line_chart.aria_label.dashboard.widget.title.over_time.coverage',
      series: [expect.objectContaining({ data: [expect.objectContaining({ y: 81.2 })] })],
    }),
    undefined,
  );
});

it('groups issue history, resolves rule labels, and shows the legend', () => {
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'issue-count-history',
      history: [
        {
          date: '2026-01-01',
          distribution: [
            { key: 'typescript:S1', value: 3 },
            { key: 'typescript:S2', value: 2 },
          ],
        },
      ],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);

  renderChart(
    <DashboardMeasureLineChart
      entityId="portfolio-1"
      entityType="PORTFOLIO"
      measure={{
        api: 'issue-count-history',
        metricKey: MetricKey.violations,
        sliceBy: 'RULE_KEY',
      }}
      metric={{ metricKey: MetricKey.violations, type: DashboardMetricType.Raw }}
      months={3}
      showLegend
    />,
  );

  expect(useDashboardRuleLabels).toHaveBeenCalledWith(
    expect.objectContaining({ ruleKeys: ['typescript:S1', 'typescript:S2'] }),
  );
  const props = jest.mocked(MultiLineChart).mock.calls.at(-1)?.[0];
  expect(props?.series.some(({ label }) => label === 'Prefer const')).toBe(true);
  expect(props?.showLegend).toBe(true);
});

it('caps rule series and folds the remainder into a trailing Other series', () => {
  const ruleValues = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'issue-count-history',
      history: [
        {
          date: '2026-01-01',
          distribution: ruleValues.map((value, index) => ({
            key: `typescript:S${index + 1}`,
            value,
          })),
        },
      ],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);

  renderChart(
    <DashboardMeasureLineChart
      entityId="portfolio-1"
      entityType="PORTFOLIO"
      measure={{
        api: 'issue-count-history',
        metricKey: MetricKey.violations,
        sliceBy: 'RULE_KEY',
      }}
      metric={{ metricKey: MetricKey.violations, type: DashboardMetricType.Raw }}
      months={3}
      sortSeveritySeries
    />,
  );

  const { calls } = jest.mocked(MultiLineChart).mock;
  const [props] = calls[calls.length - 1];
  const seriesIds = props.series.map((entry) => entry.id);
  expect(seriesIds).toEqual([
    'typescript:S1',
    'typescript:S2',
    'typescript:S3',
    'typescript:S4',
    'typescript:S5',
    'typescript:S6',
    'typescript:S7',
    'OTHER_3',
  ]);

  const otherSeries = props?.series.at(-1);
  expect(otherSeries?.data[0]?.y).toBe(60);

  expect(
    jest.mocked(useDashboardRuleLabels).mock.calls.flatMap(([args]) => args.ruleKeys),
  ).not.toContain('OTHER_3');
});

it('uses localized messages for grouped issue status legend labels', () => {
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'issue-count-history',
      history: [
        {
          date: '2026-01-01',
          distribution: [
            { key: 'OPEN', value: 3 },
            { key: 'FALSE_POSITIVE', value: 2 },
          ],
        },
      ],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);

  renderChart(
    <DashboardMeasureLineChart
      entityId="portfolio-1"
      entityType="PORTFOLIO"
      measure={{ api: 'issue-count-history', metricKey: MetricKey.violations, sliceBy: 'STATUS' }}
      metric={{ metricKey: MetricKey.violations, type: DashboardMetricType.Raw }}
      months={3}
      showLegend
      sortSeveritySeries
    />,
  );

  expect(jest.mocked(MultiLineChart).mock.calls.at(-1)?.[0].series).toEqual([
    expect.objectContaining({ id: 'OPEN', label: 'issue.status.OPEN' }),
    expect.objectContaining({
      id: 'FALSE_POSITIVE',
      label: 'issue.status.FALSE_POSITIVE',
    }),
  ]);
});

it('uses Standard issue type labels for software quality legend entries', () => {
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'issue-count-history',
      history: [
        {
          date: '2026-01-01',
          distribution: [
            { key: 'RELIABILITY', value: 3 },
            { key: 'SECURITY', value: 2 },
            { key: 'MAINTAINABILITY', value: 1 },
          ],
        },
      ],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);

  renderChart(
    <DashboardMeasureLineChart
      entityId="portfolio-1"
      entityType="PORTFOLIO"
      isStandardMode
      measure={{
        api: 'issue-count-history',
        metricKey: MetricKey.violations,
        sliceBy: 'SOFTWARE_QUALITY',
      }}
      metric={{ metricKey: MetricKey.violations, type: DashboardMetricType.Raw }}
      months={3}
      showLegend
    />,
  );

  expect(jest.mocked(MultiLineChart).mock.calls.at(-1)?.[0].series).toEqual([
    expect.objectContaining({ id: 'RELIABILITY', label: 'issue.type.BUG.plural' }),
    expect.objectContaining({ id: 'SECURITY', label: 'issue.type.VULNERABILITY.plural' }),
    expect.objectContaining({ id: 'MAINTAINABILITY', label: 'issue.type.CODE_SMELL.plural' }),
  ]);
});

it('uses MTTR formatters and forwards loading errors to the chart', () => {
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: undefined,
    isError: true,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);

  renderChart(
    <DashboardMeasureLineChart
      entityId="portfolio-1"
      entityType="PORTFOLIO"
      measure={{
        api: 'issue-resolution-history',
        statistic: IssueResolutionStatistic.MTTR,
      }}
      metric={{
        statistic: IssueResolutionStatistic.MTTR,
        type: DashboardMetricType.IssueResolution,
      }}
      months={3}
    />,
  );

  const props = jest.mocked(MultiLineChart).mock.calls.at(-1)?.[0];
  expect(props?.hasFetchError).toBe(true);
  expect(props?.series).toEqual([]);
  expect(typeof props?.formatDotValue).toBe('function');
  expect(typeof props?.formatTick).toBe('function');
  expect(props?.formatDotValue?.(2)).toBe('dot:2');
  expect(props?.formatTick?.(2)).toBe('tick:2');
});

it('passes the requested date to the high-resolution limited-history warning', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-08-30T12:00:00.000Z'));
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'issue-density-history',
      history: [{ date: '2026-04-15', distribution: [{ key: 'all', value: 0.5 }] }],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);

  renderChart(
    <DashboardMeasureLineChart
      entityId="branch-1"
      entityType="PROJECT_BRANCH"
      measure={{ api: 'issue-density-history' }}
      metric={{ type: DashboardMetricType.IssueDensity }}
      months={6}
      organization="org"
    />,
  );

  expect(screen.getByTestId('multi-line-chart')).toBeInTheDocument();
  expect(
    screen.getByText(
      'dashboard.line_chart.single_data · dashboard.line_chart.limited_history_warning.Apr 15, 2026',
    ),
  ).toBeInTheDocument();
});

it('renders density history with missing values', () => {
  jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
  jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
  jest
    .mocked(MultiLineChart)
    .mockImplementation(
      jest.requireActual<
        typeof import('../../../components/visualizations/multi-line-chart/MultiLineChart')
      >('../../../components/visualizations/multi-line-chart/MultiLineChart').MultiLineChart,
    );
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'issue-density-history',
      history: [
        {
          date: '2026-06-17T00:00:00Z',
          distribution: [{ key: 'all', value: 2.5944423284132183 }],
        },
        {
          date: '2026-06-16T00:00:00Z',
          distribution: [{ key: 'all', value: 2.6007455128027708 }],
        },
        { date: '2026-06-15T00:00:00Z', distribution: [{ key: 'all', value: 0 }] },
        { date: '2026-03-22T00:00:00Z', distribution: [{ key: 'all' }] },
      ],
    } satisfies DashboardMeasureHistory,
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);
  renderChart(
    <DashboardMeasureLineChart
      entityId="branch-1"
      entityType="PROJECT_BRANCH"
      measure={{ api: 'issue-density-history' }}
      metric={{ type: DashboardMetricType.IssueDensity }}
      months={3}
      organization="org"
    />,
  );
  const svg = screen.getByLabelText(
    'project_dashboard.widget.line_chart.aria_label.dashboard.widget.title.over_time.dashboard.add_widget_modal.define_widget.metric.issue_density',
  );
  // eslint-disable-next-line testing-library/no-node-access -- SVG paths have no accessible role
  const path = svg.querySelector('path[stroke-linecap="round"]');
  expect(path).toBeInTheDocument();
  expect(path?.getAttribute('d')).toMatch(/^M[\d.,]+L[\d.,]+L[\d.,]+$/);
});

describe('severity legend order', () => {
  const keys = ['BLOCKER', 'HIGH', 'INFO', 'LOW', 'MEDIUM'];
  const widget = {
    groupBy: LineChartGroupBy.Severity,
    historyRange: HistoryRange.LastMonth,
    metric: { metricKey: RichMetricKey.Issues, type: DashboardMetricType.Rich, measureFilters: {} },
    scope: CodeScope.Overall,
    showLegend: true,
  } as const;

  beforeEach(() => {
    jest.mocked(useDashboardPortfolioContext).mockReturnValue({
      portfolioId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      isEntityTypePending: false,
      getPortfolioMetric: jest.fn(),
    });
    jest.mocked(useDashboardMeasureQuery).mockReturnValue({
      data: {
        api: 'issue-count-history',
        history: [
          { date: '2026-01-02', distribution: keys.map((key, i) => ({ key, value: i + 10 })) },
          { date: '2026-01-01', distribution: keys.map((key, i) => ({ key, value: i + 1 })) },
        ],
      },
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useDashboardMeasureQuery>);
  });

  it.each([false, true])(
    'orders severity series while preserving labels, colors and data (Standard=%s)',
    (isStandardMode) => {
      renderChart(<PortfolioLineChartWidgetWrapper {...widget} isStandardMode={isStandardMode} />);
      const original = jest.mocked(MultiLineChart).mock.calls.at(-1)?.[0].series;
      expect(original?.map(({ id }) => id)).toEqual(keys);
      renderChart(
        <SeverityOrderedPortfolioLineChartWidgetWrapper
          {...widget}
          isStandardMode={isStandardMode}
        />,
      );
      expect(jest.mocked(MultiLineChart).mock.calls.at(-1)?.[0].series).toEqual([
        original?.[0],
        original?.[1],
        original?.[4],
        original?.[3],
        original?.[2],
      ]);
    },
  );

  it('orders severities first appearing on later dates and retains unknown series last', () => {
    jest.mocked(useDashboardMeasureQuery).mockReturnValue({
      data: {
        api: 'issue-count-history',
        history: [
          {
            date: '2026-01-01',
            distribution: [
              { key: 'LOW', value: 1 },
              { key: 'FUTURE', value: 7 },
            ],
          },
          {
            date: '2026-01-02',
            distribution: [
              { key: 'HIGH', value: 2 },
              { key: 'BLOCKER', value: 3 },
              { key: 'NEW', value: 8 },
            ],
          },
        ],
      },
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useDashboardMeasureQuery>);
    renderChart(<SeverityOrderedPortfolioLineChartWidgetWrapper {...widget} />);
    const series = jest.mocked(MultiLineChart).mock.calls.at(-1)?.[0].series;
    expect(series?.map(({ id }) => id)).toEqual(['BLOCKER', 'HIGH', 'LOW', 'FUTURE', 'NEW']);
    expect(series?.[0].data.map(({ y }) => y)).toEqual([0, 3]);
    expect(series?.[3].data.map(({ y }) => y)).toEqual([7, 0]);
  });

  it('keeps project dashboard ordering unchanged', () => {
    jest.mocked(useDashboardProjectContext).mockReturnValue({
      isLoading: false,
      organization: 'project-org',
      projectEntityId: 'project-branch-1',
    } as ReturnType<typeof useDashboardProjectContext>);
    renderChart(<ProjectLineChartWidgetWrapper {...widget} />);
    expect(
      jest
        .mocked(MultiLineChart)
        .mock.calls.at(-1)?.[0]
        .series.map(({ id }) => id),
    ).toEqual(keys);
  });

  it.each([undefined, false])(
    'preserves original severity ordering with activation %s',
    (sortSeveritySeries) => {
      renderChart(
        <PortfolioLineChartWidgetWrapper {...widget} sortSeveritySeries={sortSeveritySeries} />,
      );
      expect(
        jest
          .mocked(MultiLineChart)
          .mock.calls.at(-1)?.[0]
          .series.map(({ id }) => id),
      ).toEqual(keys);
    },
  );
});
