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
import {
  useOrgIssueCountWidgetData,
  useOrgMeasuresCountWidgetData,
} from '~adapters/queries/count-widget-data';
import { usePortfolioWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { renderWithContext } from '~shared/helpers/test-utils';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { CountWidgetProps } from '../../../components/visualizations/CountWidget';
import { WidgetInstanceProvider } from '../../../dashboard-layout/shared/WidgetInstanceContext';
import { DashboardMetricType, RichMetricKey } from '../../../data/widgets/shared';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { CodeScope } from '../../../types/widget-common';
import { PortfolioCountWidgetWrapper as PortfolioCountWidget } from '../PortfolioCountWidgetWrapper';

const mockCountWidget = jest.fn((props: CountWidgetProps) => (
  <div data-link-to={props.linkTo} data-testid="count-widget" />
));

jest.mock('~feature-dashboards/components/visualizations/CountWidget', () => ({
  ...(jest.requireActual('~feature-dashboards/components/visualizations/CountWidget') as object),
  CountWidget: (props: CountWidgetProps) => mockCountWidget(props),
}));

jest.mock('~feature-dashboards/components/common/WidgetNoData', () => ({
  WidgetNoData: function WidgetNoData({
    messageKey = 'dashboard.widget.no_data',
  }: Readonly<{ messageKey?: string }>) {
    return <div>{messageKey}</div>;
  },
}));

jest.mock('../../common/IssueResolutionCountWidgetWrapper', () => ({
  IssueResolutionCountWidgetWrapper: (props: {
    entityId: string;
    entityType: string;
    linkTo?: string;
  }) => (
    <div
      data-entity-id={props.entityId}
      data-entity-type={props.entityType}
      data-link-to={props.linkTo}
      data-testid="issue-resolution-count-widget"
    />
  ),
}));

jest.mock('../../common/IssueDensityCountWidgetWrapper', () => ({
  IssueDensityCountWidgetWrapper: (props: {
    entityId: string;
    entityType: string;
    linkTo?: string;
  }) => (
    <div
      data-entity-id={props.entityId}
      data-entity-type={props.entityType}
      data-link-to={props.linkTo}
      data-testid="issue-density-count-widget"
    />
  ),
}));

jest.mock('../../common/ScaResolutionCountWidgetWrapper', () => ({
  ScaResolutionCountWidgetWrapper: (props: {
    entityId: string;
    entityType: string;
    linkTo?: string;
  }) => (
    <div
      data-entity-id={props.entityId}
      data-entity-type={props.entityType}
      data-link-to={props.linkTo}
      data-testid="sca-resolution-count-widget"
    />
  ),
}));

jest.mock('~adapters/queries/count-widget-data', () => ({
  useOrgIssueCountWidgetData: jest.fn(),
  useOrgMeasuresCountWidgetData: jest.fn(),
}));

jest.mock('~adapters/queries/widget-metric-metadata', () => ({
  usePortfolioWidgetMetricMetadataQuery: jest.fn(),
}));

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardPortfolioContext: jest.fn(),
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getPortfolioDashboardWidgetDrilldownUrl: (widgetKey: string) => `breakdown/${widgetKey}`,
}));

beforeEach(() => {
  mockCountWidget.mockClear();

  jest.mocked(useDashboardPortfolioContext).mockReturnValue({
    getPortfolioMetric: jest.fn(),
    portfolioId: 'portfolio-1',
  });

  jest.mocked(usePortfolioWidgetMetricMetadataQuery).mockReturnValue({
    data: {
      metrics: [{ direction: '-1.0', key: MetricKey.coverage, type: 'percent' }],
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof usePortfolioWidgetMetricMetadataQuery>);

  jest.mocked(useOrgMeasuresCountWidgetData).mockReturnValue({
    data: {
      latestValue: '80.0',
      sparklineSeries: [],
      trend: { current: null, past: null },
    },
    isError: false,
    isPending: false,
  } as unknown as ReturnType<typeof useOrgMeasuresCountWidgetData>);
});

describe('PortfolioCountWidget', () => {
  it('does not pass a drilldown link for project_branch_count when drilldown is enabled', () => {
    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 2, width: 2 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioCountWidget
          metric={{ metricKey: MetricKey.project_branch_count, type: DashboardMetricType.Raw }}
          scope={CodeScope.Overall}
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('count-widget')).not.toHaveAttribute('data-link-to');
  });

  it('passes the portfolio drilldown route to CountWidget when the flag is enabled', () => {
    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 2, width: 2 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioCountWidget
          metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
          scope={CodeScope.Overall}
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('count-widget')).toHaveAttribute(
      'data-link-to',
      'breakdown/223e4567-e89b-42d3-a456-426614174000',
    );
    expect(mockCountWidget).toHaveBeenCalledWith(
      expect.objectContaining({ metricType: MetricType.Percent }),
    );
  });

  it('does not pass a drilldown link when suppressPortfolioDrilldownLink is set', () => {
    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 2, width: 2 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioCountWidget
          metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
          scope={CodeScope.Overall}
          suppressPortfolioDrilldownLink
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('count-widget')).not.toHaveAttribute('data-link-to');
    expect(mockCountWidget).toHaveBeenCalledWith(expect.objectContaining({ linkTo: undefined }));
  });

  it('shows an error state when rich count loading fails', () => {
    jest.mocked(useOrgIssueCountWidgetData).mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueCountWidgetData>);

    renderWithContext(
      <PortfolioCountWidget
        metric={{
          measureFilters: undefined,
          metricKey: RichMetricKey.Issues,
          type: DashboardMetricType.Rich,
        }}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.getByText('dashboard.widget.error')).toBeInTheDocument();
    expect(mockCountWidget).not.toHaveBeenCalled();
  });

  it('shows an error state when raw count loading fails', () => {
    jest.mocked(useOrgMeasuresCountWidgetData).mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
    } as unknown as ReturnType<typeof useOrgMeasuresCountWidgetData>);

    renderWithContext(
      <PortfolioCountWidget
        metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.getByText('dashboard.widget.error')).toBeInTheDocument();
    expect(mockCountWidget).not.toHaveBeenCalled();
  });

  it('renders the shared issue-resolution count widget for MTTR', () => {
    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 2, width: 2 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioCountWidget
          metric={{
            statistic: IssueResolutionStatistic.MTTR,
            type: DashboardMetricType.IssueResolution,
          }}
          scope={CodeScope.Overall}
          showTrendIndicator
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('issue-resolution-count-widget')).toHaveAttribute(
      'data-entity-id',
      'portfolio-1',
    );
    expect(screen.getByTestId('issue-resolution-count-widget')).toHaveAttribute(
      'data-entity-type',
      'PORTFOLIO',
    );
    expect(screen.getByTestId('issue-resolution-count-widget')).not.toHaveAttribute('data-link-to');
  });

  it('renders issue density without a portfolio drilldown link', () => {
    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 2, width: 2 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioCountWidget
          metric={{ type: DashboardMetricType.IssueDensity }}
          scope={CodeScope.Overall}
          showTrendIndicator
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('issue-density-count-widget')).toHaveAttribute(
      'data-entity-id',
      'portfolio-1',
    );
    expect(screen.getByTestId('issue-density-count-widget')).toHaveAttribute(
      'data-entity-type',
      'PORTFOLIO',
    );
    expect(screen.getByTestId('issue-density-count-widget')).not.toHaveAttribute('data-link-to');
  });

  it('renders SCA MTTR without a portfolio drilldown link', () => {
    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 2, width: 2 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioCountWidget
          metric={{
            type: DashboardMetricType.ScaResolution,
          }}
          scope={CodeScope.Overall}
          showTrendIndicator
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('sca-resolution-count-widget')).toHaveAttribute(
      'data-entity-id',
      'portfolio-1',
    );
    expect(screen.getByTestId('sca-resolution-count-widget')).toHaveAttribute(
      'data-entity-type',
      'PORTFOLIO',
    );
    expect(screen.getByTestId('sca-resolution-count-widget')).not.toHaveAttribute('data-link-to');
  });
});
