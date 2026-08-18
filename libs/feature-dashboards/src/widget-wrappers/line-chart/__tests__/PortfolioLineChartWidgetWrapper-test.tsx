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

import { screen } from '@testing-library/react';
import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { useFlags } from '~adapters/helpers/feature-flags';
import { useOrgIssueDensityLineChartWidgetData } from '~adapters/queries/issue-density-widget-data';
import { useOrgIssueResolutionLineChartWidgetData } from '~adapters/queries/issue-resolution-widget-data';
import {
  organizationLineChartRequestKey,
  useOrganizationLineChartSeriesData,
} from '~adapters/queries/line-chart-widget-data';
import { useOrgScaResolutionLineChartWidgetData } from '~adapters/queries/sca-resolution-widget-data';
import { renderWithContext } from '~shared/helpers/test-utils';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import { DashboardMetricType } from '../../../data/widgets/shared';
import { useLineChartMetricCharacteristics } from '../../../hooks/useLineChartMetricCharacteristics';
import { PortfolioDashboardWidgetPropMap } from '../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { CodeScope } from '../../../types/widget-common';
import { PortfolioLineChartWidgetWrapper as PortfolioLineChartWidget } from '../PortfolioLineChartWidgetWrapper';

jest.mock('~feature-dashboards/components/visualizations/multi-line-chart/MultiLineChart', () => ({
  MultiLineChart: (props: {
    ariaLabel: string;
    formatDotValue?: (value: number) => React.ReactNode;
    formatTick?: (value: number) => React.ReactNode;
    series: Array<{ label: string }>;
    showLegend: boolean;
  }) => (
    <div>
      <div>{props.ariaLabel}</div>
      <div data-testid="multi-line-chart">{`series:${props.series.length}`}</div>
      <div>{`legend:${String(props.showLegend)}`}</div>
      {props.formatTick && <div data-testid="tick">{props.formatTick(2)}</div>}
      {props.formatDotValue && <div data-testid="dot">{props.formatDotValue(2)}</div>}
    </div>
  ),
}));

jest.mock('~feature-dashboards/components/visualizations/line-chart/LineChart', () => ({
  LineChart: (props: {
    ariaLabel: string;
    data: Array<{ x: Date | number; y: number }>;
    formatDotValue?: (value: number) => React.ReactNode;
    formatTick?: (value: number) => React.ReactNode;
    showLegend: boolean;
  }) => (
    <div>
      <div>{props.ariaLabel}</div>
      <div data-testid="legacy-line-chart">{`legacy:${props.data.length}`}</div>
      <div>{`legend:${String(props.showLegend)}`}</div>
      {props.formatTick && <div data-testid="tick">{props.formatTick(2)}</div>}
      {props.formatDotValue && <div data-testid="dot">{props.formatDotValue(2)}</div>}
    </div>
  ),
}));

jest.mock('~adapters/queries/line-chart-widget-data', () => ({
  organizationLineChartRequestKey: jest.fn(() => 'request-key'),
  useOrganizationLineChartSeriesData: jest.fn(),
}));

jest.mock('~adapters/helpers/feature-flags', () => ({
  useFlags: jest.fn(),
}));

jest.mock('~adapters/queries/widget-rule-metadata', () => ({
  useDashboardRuleLabels: jest.fn(() => ({
    isError: false,
    isPending: false,
    organization: undefined,
    rulesByKey: {},
  })),
}));

jest.mock('~adapters/queries/issue-resolution-widget-data', () => ({
  useOrgIssueResolutionLineChartWidgetData: jest.fn(),
}));

jest.mock('~adapters/queries/issue-density-widget-data', () => ({
  useOrgIssueDensityLineChartWidgetData: jest.fn(),
}));

jest.mock('~adapters/queries/sca-resolution-widget-data', () => ({
  useOrgScaResolutionLineChartWidgetData: jest.fn(),
}));

jest.mock('~adapters/queries/portfolio-widget-organization-data', () => ({
  usePortfolioRulesMetadataOrganization: jest.fn(() => ({
    isLoading: false,
    organization: undefined,
  })),
}));

jest.mock('~feature-dashboards/hooks/useLineChartMetricCharacteristics', () => ({
  useLineChartMetricCharacteristics: jest.fn(),
}));

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardPortfolioContext: jest.fn(),
}));

const widgetProps: PortfolioDashboardWidgetPropMap['lineChart'] = {
  groupBy: LineChartGroupBy.None,
  historyRange: HistoryRange.LastMonth,
  metric: { metricKey: MetricKey.bugs, type: DashboardMetricType.Raw },
  scope: CodeScope.Overall,
};

beforeEach(() => {
  jest.mocked(organizationLineChartRequestKey).mockReturnValue('request-key');
  mockDashboardWidgetFlag(true);
  jest.mocked(useDashboardPortfolioContext).mockReturnValue({
    getPortfolioMetric: jest.fn(),
    portfolioId: 'portfolio-1',
  });

  jest.mocked(useLineChartMetricCharacteristics).mockReturnValue({
    actualMetricKey: MetricKey.bugs,
    isMetricRating: false,
    measureFilters: undefined,
    metricMetadata: { key: MetricKey.bugs, name: 'Bugs', type: MetricType.Integer },
  } as unknown as ReturnType<typeof useLineChartMetricCharacteristics>);

  jest.mocked(useOrganizationLineChartSeriesData).mockReturnValue({
    isMeasuresHistoryPending: false,
    lineChartHasFetchError: false,
    series: [
      {
        color: 'rgba(74, 144, 226, 1)',
        data: [{ x: new Date('2026-03-15T00:00:00.000Z'), y: 7 }],
        id: 'total',
        label: 'Bugs',
      },
    ],
  } as unknown as ReturnType<typeof useOrganizationLineChartSeriesData>);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('PortfolioLineChartWidget renderer branch', () => {
  it('renders MultiLineChart when organizationReportingEnableNewDashboardWidgets is on', () => {
    mockDashboardWidgetFlag(true);

    renderWithContext(<PortfolioLineChartWidget {...widgetProps} />);

    expect(screen.getByTestId('multi-line-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('legacy-line-chart')).not.toBeInTheDocument();
  });

  it('renders the legacy LineChart when organizationReportingEnableNewDashboardWidgets is off', () => {
    mockDashboardWidgetFlag(false);

    renderWithContext(<PortfolioLineChartWidget {...widgetProps} />);

    expect(screen.getByTestId('legacy-line-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('multi-line-chart')).not.toBeInTheDocument();
  });

  it('renders WidgetNoData when portfolioId is falsy', () => {
    jest.mocked(useDashboardPortfolioContext).mockReturnValue({
      getPortfolioMetric: jest.fn(),
      portfolioId: undefined,
    } as unknown as ReturnType<typeof useDashboardPortfolioContext>);

    renderWithContext(<PortfolioLineChartWidget {...widgetProps} />);

    expect(screen.getByText('dashboard.widget.no_data')).toBeInTheDocument();
  });
});

describe('PortfolioLineChartWidget IssueResolution branch', () => {
  const issueResolutionWidgetProps = {
    groupBy: LineChartGroupBy.None,
    historyRange: HistoryRange.LastMonth,
    metric: {
      measureFilters: undefined,
      statistic: IssueResolutionStatistic.ResolvedIssues,
      type: DashboardMetricType.IssueResolution,
    },
    scope: CodeScope.Overall,
    showLegend: true,
  } as PortfolioDashboardWidgetPropMap['lineChart'];

  beforeEach(() => {
    jest.mocked(useOrgIssueResolutionLineChartWidgetData).mockReturnValue({
      data: [],
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueResolutionLineChartWidgetData>);
  });

  it('renders MultiLineChart for IssueResolution metric when the flag is on', () => {
    mockDashboardWidgetFlag(true);

    renderWithContext(<PortfolioLineChartWidget {...issueResolutionWidgetProps} />);

    expect(screen.getByTestId('multi-line-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('legacy-line-chart')).not.toBeInTheDocument();
    expect(screen.getByText('legend:true')).toBeInTheDocument();
    expect(useOrgIssueResolutionLineChartWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({
        metricName: 'dashboard.add_widget_modal.define_widget.metric.resolved_issues',
      }),
    );
  });

  it('renders the legacy LineChart for IssueResolution metric when the flag is off', () => {
    mockDashboardWidgetFlag(false);

    renderWithContext(<PortfolioLineChartWidget {...issueResolutionWidgetProps} />);

    expect(screen.getByTestId('legacy-line-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('multi-line-chart')).not.toBeInTheDocument();
    expect(screen.getByText('legend:true')).toBeInTheDocument();
  });
});

describe('PortfolioLineChartWidget IssueDensity branch', () => {
  const issueDensityWidgetProps = {
    groupBy: LineChartGroupBy.None,
    historyRange: HistoryRange.LastMonth,
    metric: {
      measureFilters: undefined,
      type: DashboardMetricType.IssueDensity,
    },
    scope: CodeScope.Overall,
    showLegend: true,
  } satisfies PortfolioDashboardWidgetPropMap['lineChart'];

  beforeEach(() => {
    jest.mocked(useOrgIssueDensityLineChartWidgetData).mockReturnValue({
      data: [
        {
          color: 'rgba(74, 144, 226, 1)',
          data: [{ x: new Date('2026-03-15T00:00:00.000Z'), y: 2 }],
          id: 'issue-density',
          label: 'Issue density',
        },
      ],
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueDensityLineChartWidgetData>);
  });

  it('renders issue density with the organizations reporting data', () => {
    mockDashboardWidgetFlag(true);

    renderWithContext(<PortfolioLineChartWidget {...issueDensityWidgetProps} />);

    expect(screen.getByTestId('multi-line-chart')).toHaveTextContent('series:1');
    expect(screen.getByTestId('tick')).toBeInTheDocument();
    expect(screen.getByTestId('dot')).toBeInTheDocument();
    expect(useOrgIssueDensityLineChartWidgetData).toHaveBeenCalledWith({
      entityId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      historyRange: HistoryRange.LastMonth,
      measureFilters: undefined,
      metricName: 'dashboard.add_widget_modal.define_widget.metric.issue_density',
    });
  });

  it('renders issue density with the legacy chart while the feature is disabled', () => {
    mockDashboardWidgetFlag(false);

    renderWithContext(<PortfolioLineChartWidget {...issueDensityWidgetProps} />);

    expect(screen.getByTestId('legacy-line-chart')).toHaveTextContent('legacy:1');
    expect(screen.queryByTestId('multi-line-chart')).not.toBeInTheDocument();
  });
});

describe('PortfolioLineChartWidget SCA resolution branch', () => {
  const scaResolutionWidgetProps = {
    groupBy: LineChartGroupBy.None,
    historyRange: HistoryRange.LastMonth,
    metric: {
      type: DashboardMetricType.ScaResolution,
    },
    scope: CodeScope.Overall,
    showLegend: true,
  } satisfies PortfolioDashboardWidgetPropMap['lineChart'];

  beforeEach(() => {
    jest.mocked(useOrgScaResolutionLineChartWidgetData).mockReturnValue({
      data: [
        {
          color: 'rgba(74, 144, 226, 1)',
          data: [{ x: new Date('2026-03-15T00:00:00.000Z'), y: 120 }],
          id: 'total',
          label: 'SCA MTTR',
        },
      ],
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useOrgScaResolutionLineChartWidgetData>);
  });

  it('renders a calendar MTTR series for the portfolio', () => {
    mockDashboardWidgetFlag(true);

    renderWithContext(<PortfolioLineChartWidget {...scaResolutionWidgetProps} />);

    expect(screen.getByTestId('multi-line-chart')).toHaveTextContent('series:1');
    expect(screen.getByTestId('tick')).toBeInTheDocument();
    expect(screen.getByTestId('dot')).toBeInTheDocument();
    expect(useOrgScaResolutionLineChartWidgetData).toHaveBeenCalledWith({
      entityId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      historyRange: HistoryRange.LastMonth,
      measureFilters: undefined,
      metricName: 'dashboard.add_widget_modal.define_widget.metric.sca_mttr',
    });
  });
});

function mockDashboardWidgetFlag(enabled: boolean) {
  jest.mocked(useFlags).mockReturnValue({
    organizationReportingEnableNewDashboardWidgets: enabled,
  } as unknown as ReturnType<typeof useFlags>);
}
