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

import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { useDashboardMeasureQuery } from '~adapters/queries/dashboard-measure';
import { usePortfolioWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { CountWidget } from '../../../components/visualizations/CountWidget';
import { useOptionalWidgetInstanceContext } from '../../../dashboard-layout/shared/WidgetInstanceContext';
import { DashboardMetricType } from '../../../data/widgets/shared';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { CodeScope } from '../../../types/widget-common';
import {
  computeDashboardMeasureTrendData,
  getDashboardMetricDirectionOverride,
} from '../../../utils/countWidgetTrend';
import { PortfolioCountWidgetWrapper } from '../PortfolioCountWidgetWrapper';

jest.mock('~adapters/context/dashboardContext');
jest.mock('~adapters/queries/dashboard-measure', () => ({
  useDashboardMeasureQuery: jest.fn(),
}));
jest.mock('~adapters/queries/widget-metric-metadata');
jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getPortfolioDashboardWidgetDrilldownUrl: (widgetKey: string) => `breakdown/${widgetKey}`,
}));
jest.mock('../../../components/common/WidgetLoadingSpinner', () => ({
  WidgetLoadingSpinner: () => <div>loading</div>,
}));
jest.mock('../../../components/common/WidgetNoData', () => ({
  WidgetNoData: ({ messageKey = 'dashboard.widget.no_data' }: { messageKey?: string }) => (
    <div>{messageKey}</div>
  ),
}));
jest.mock('../../../components/visualizations/CountWidget', () => ({
  CountWidget: jest.fn(() => <div data-testid="count-widget" />),
}));
jest.mock('../../../dashboard-layout/shared/WidgetInstanceContext');
jest.mock('../../../hooks/useMttrFormatters', () => ({
  useMttrFormatters: () => ({ formatMttr: (value: number) => `mttr:${value}` }),
}));
jest.mock('../../../utils/countWidgetTrend');

function renderWidget(widget: React.ReactElement) {
  return render(
    <IntlProvider locale="en" messages={{}}>
      {widget}
    </IntlProvider>,
  );
}

beforeEach(() => {
  jest.mocked(getDashboardMetricDirectionOverride).mockReset();
  jest.mocked(useDashboardPortfolioContext).mockReturnValue({
    getPortfolioMetric: jest.fn(),
    portfolioId: 'portfolio-1',
  });
  jest.mocked(useOptionalWidgetInstanceContext).mockReturnValue({
    dimensions: { height: 4, width: 3 },
    widgetKey: 'widget-1',
  });
  jest.mocked(usePortfolioWidgetMetricMetadataQuery).mockReturnValue({
    data: {
      metrics: [{ direction: '-1.0', key: MetricKey.coverage, type: 'percent' }],
    },
    isPending: false,
  } as unknown as ReturnType<typeof usePortfolioWidgetMetricMetadataQuery>);
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'measures-history',
      history: [
        {
          date: '2026-01-01',
          measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '70' }],
        },
        {
          date: '2026-02-01',
          measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '80' }],
        },
      ],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);
  jest.mocked(computeDashboardMeasureTrendData).mockReturnValue(null);
});

it('renders the latest value, trend, and supported portfolio drilldown', () => {
  renderWidget(
    <PortfolioCountWidgetWrapper
      metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
      scope={CodeScope.Overall}
      showTrendIndicator
    />,
  );

  expect(screen.getByTestId('count-widget')).toBeInTheDocument();
  expect(computeDashboardMeasureTrendData).toHaveBeenCalledWith(
    expect.objectContaining({ values: [70, 80] }),
  );
  expect(CountWidget).toHaveBeenCalledWith(
    expect.objectContaining({
      linkTo: 'breakdown/widget-1',
      metricType: MetricType.Percent,
      sparklineSeries: [70, 80],
      value: '80',
    }),
    undefined,
  );
});

it('renders loading, query error, and empty portfolio states', () => {
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    isPending: true,
  } as ReturnType<typeof useDashboardMeasureQuery>);
  const { rerender } = renderWidget(
    <PortfolioCountWidgetWrapper
      metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
      scope={CodeScope.Overall}
    />,
  );
  expect(screen.getByText('loading')).toBeInTheDocument();

  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    isError: true,
    isPending: false,
  } as ReturnType<typeof useDashboardMeasureQuery>);
  rerender(
    <IntlProvider locale="en" messages={{}}>
      <PortfolioCountWidgetWrapper
        metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
        scope={CodeScope.Overall}
      />
    </IntlProvider>,
  );
  expect(screen.getByText('dashboard.widget.error')).toBeInTheDocument();

  jest.mocked(useDashboardPortfolioContext).mockReturnValue({
    getPortfolioMetric: jest.fn(),
    portfolioId: '',
  });
  rerender(
    <IntlProvider locale="en" messages={{}}>
      <PortfolioCountWidgetWrapper
        metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
        scope={CodeScope.Overall}
      />
    </IntlProvider>,
  );
  expect(screen.getByText('dashboard.widget.no_data')).toBeInTheDocument();
});

it('formats MTTR and preserves its trend semantics', () => {
  jest.mocked(getDashboardMetricDirectionOverride).mockReturnValue(-1);
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'issue-resolution-history',
      history: [
        { date: '2026-01-01', distribution: [{ key: 'all', value: 60 }] },
        { date: '2026-02-01', distribution: [{ key: 'all', value: 120 }] },
      ],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);

  renderWidget(
    <PortfolioCountWidgetWrapper
      metric={{
        statistic: IssueResolutionStatistic.MTTR,
        type: DashboardMetricType.IssueResolution,
      }}
      scope={CodeScope.Overall}
      showTrendIndicator
      suppressPortfolioDrilldownLink
    />,
  );

  expect(CountWidget).toHaveBeenCalledWith(
    expect.objectContaining({
      linkTo: undefined,
      metricType: 'MTTR_CALENDAR',
      sparklineSeries: [60, 120],
      value: 'mttr:120',
    }),
    undefined,
  );
  expect(computeDashboardMeasureTrendData).toHaveBeenCalledWith(
    expect.objectContaining({
      isMttr: true,
      metricDirectionOverride: -1,
    }),
  );
  expect(
    typeof jest.mocked(computeDashboardMeasureTrendData).mock.calls.at(-1)?.[0].formatMttr,
  ).toBe('function');
});

it('uses higher-is-better trend direction for resolved issues', () => {
  jest.mocked(getDashboardMetricDirectionOverride).mockReturnValue(1);
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'issue-resolution-history',
      history: [
        { date: '2026-01-01', distribution: [{ key: 'all', value: 10 }] },
        { date: '2026-02-01', distribution: [{ key: 'all', value: 20 }] },
      ],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);

  renderWidget(
    <PortfolioCountWidgetWrapper
      metric={{
        statistic: IssueResolutionStatistic.ResolvedIssues,
        type: DashboardMetricType.IssueResolution,
      }}
      scope={CodeScope.Overall}
      showTrendIndicator
    />,
  );

  expect(computeDashboardMeasureTrendData).toHaveBeenCalledWith(
    expect.objectContaining({ metricDirectionOverride: 1 }),
  );
});

it('renders issue density with its unit and no data when history is empty', () => {
  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: {
      api: 'issue-density-history',
      history: [{ date: '2026-02-01', distribution: [{ key: 'all', value: 0.25 }] }],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);
  const { rerender } = renderWidget(
    <PortfolioCountWidgetWrapper
      metric={{ type: DashboardMetricType.IssueDensity }}
      scope={CodeScope.Overall}
    />,
  );
  expect(CountWidget).toHaveBeenCalledWith(
    expect.objectContaining({
      metricType: MetricType.Float,
      unitLabel: 'dashboard.widget.count.issue_density.unit',
    }),
    undefined,
  );

  jest.mocked(useDashboardMeasureQuery).mockReturnValue({
    data: { api: 'issue-density-history', history: [] },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useDashboardMeasureQuery>);
  rerender(
    <IntlProvider locale="en" messages={{}}>
      <PortfolioCountWidgetWrapper
        metric={{ type: DashboardMetricType.IssueDensity }}
        scope={CodeScope.Overall}
      />
    </IntlProvider>,
  );
  expect(screen.getByText('dashboard.widget.no_data')).toBeInTheDocument();
});
