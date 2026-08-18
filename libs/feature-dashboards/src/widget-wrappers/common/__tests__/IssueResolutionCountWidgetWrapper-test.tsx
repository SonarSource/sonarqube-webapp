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
import { useOrgIssueResolutionCountWidgetData } from '~adapters/queries/issue-resolution-widget-data';
import { renderWithContext } from '~shared/helpers/test-utils';
import { CountWidgetProps } from '../../../components/visualizations/CountWidget';
import { DashboardMetricType } from '../../../data/widgets/shared';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { IssueResolutionCountWidgetWrapper as OrgIssueResolutionCountWidget } from '../IssueResolutionCountWidgetWrapper';

const mockCountWidget = jest.fn((props: CountWidgetProps) => (
  <div
    data-link-to={props.linkTo}
    data-metric-type={props.metricType}
    data-show-trend={String(props.showTrendIndicator)}
    data-testid="count-widget"
  >
    {props.value}
  </div>
));

jest.mock('~feature-dashboards/components/visualizations/CountWidget', () => ({
  ...(jest.requireActual('~feature-dashboards/components/visualizations/CountWidget') as object),
  CountWidget: (props: CountWidgetProps) => mockCountWidget(props),
}));

jest.mock('~feature-dashboards/components/common/WidgetLoadingSpinner', () => ({
  WidgetLoadingSpinner: function WidgetLoadingSpinner() {
    return <div data-testid="loading-spinner" />;
  },
}));

jest.mock('~feature-dashboards/components/common/WidgetNoData', () => ({
  WidgetNoData: function WidgetNoData() {
    return <div data-testid="no-data" />;
  },
}));

jest.mock('~adapters/queries/issue-resolution-widget-data', () => ({
  ...(jest.requireActual('~adapters/queries/issue-resolution-widget-data') as object),
  useOrgIssueResolutionCountWidgetData: jest.fn(),
}));

const resolvedIssuesMetric = {
  measureFilters: undefined,
  statistic: IssueResolutionStatistic.ResolvedIssues,
  type: DashboardMetricType.IssueResolution,
} as const;

const mttrMetric = {
  measureFilters: undefined,
  statistic: IssueResolutionStatistic.MTTR,
  type: DashboardMetricType.IssueResolution,
} as const;

const noTrend = { current: null, past: null };
const withTrend = { current: '10', past: '8' };

beforeEach(() => {
  mockCountWidget.mockClear();

  jest.mocked(useOrgIssueResolutionCountWidgetData).mockReturnValue({
    data: {
      latestValue: 42,
      sparklineSeries: [1, 2, 3],
      trend: noTrend,
    },
    isPending: false,
  } as unknown as ReturnType<typeof useOrgIssueResolutionCountWidgetData>);
});

describe('OrgIssueResolutionCountWidget', () => {
  it('shows a loading spinner while data is pending', () => {
    jest.mocked(useOrgIssueResolutionCountWidgetData).mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof useOrgIssueResolutionCountWidgetData>);

    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PORTFOLIO"
        metric={resolvedIssuesMetric}
        showTrendIndicator={false}
      />,
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(mockCountWidget).not.toHaveBeenCalled();
  });

  it('shows no-data when latestValue is null', () => {
    jest.mocked(useOrgIssueResolutionCountWidgetData).mockReturnValue({
      data: { latestValue: null, sparklineSeries: [], trend: noTrend },
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueResolutionCountWidgetData>);

    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PORTFOLIO"
        metric={resolvedIssuesMetric}
        showTrendIndicator={false}
      />,
    );

    expect(screen.getByTestId('no-data')).toBeInTheDocument();
    expect(mockCountWidget).not.toHaveBeenCalled();
  });

  it('shows no-data when latestValue is undefined', () => {
    jest.mocked(useOrgIssueResolutionCountWidgetData).mockReturnValue({
      data: { latestValue: undefined, sparklineSeries: [], trend: noTrend },
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueResolutionCountWidgetData>);

    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PORTFOLIO"
        metric={resolvedIssuesMetric}
        showTrendIndicator={false}
      />,
    );

    expect(screen.getByTestId('no-data')).toBeInTheDocument();
    expect(mockCountWidget).not.toHaveBeenCalled();
  });

  it('formats resolved issues count as a rounded integer string', () => {
    jest.mocked(useOrgIssueResolutionCountWidgetData).mockReturnValue({
      data: { latestValue: 42.7, sparklineSeries: [], trend: noTrend },
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueResolutionCountWidgetData>);

    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PROJECT_BRANCH"
        metric={resolvedIssuesMetric}
        showTrendIndicator={false}
      />,
    );

    expect(mockCountWidget).toHaveBeenCalledWith(expect.objectContaining({ value: '43' }));
  });

  it('uses MTTR_CALENDAR metric type for MTTR statistics', () => {
    jest.mocked(useOrgIssueResolutionCountWidgetData).mockReturnValue({
      data: { latestValue: 30, sparklineSeries: [], trend: noTrend },
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueResolutionCountWidgetData>);

    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PROJECT_BRANCH"
        metric={mttrMetric}
        showTrendIndicator={false}
      />,
    );

    expect(mockCountWidget).toHaveBeenCalledWith(
      expect.objectContaining({ metricType: 'MTTR_CALENDAR' }),
    );
  });

  it('passes sparkline series to CountWidget when showTrendIndicator is true', () => {
    const sparkline = [10, 20, 30];
    jest.mocked(useOrgIssueResolutionCountWidgetData).mockReturnValue({
      data: { latestValue: 5, sparklineSeries: sparkline, trend: noTrend },
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueResolutionCountWidgetData>);

    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PORTFOLIO"
        metric={resolvedIssuesMetric}
        showTrendIndicator
      />,
    );

    expect(mockCountWidget).toHaveBeenCalledWith(
      expect.objectContaining({ sparklineSeries: sparkline }),
    );
  });

  it('omits sparkline series from CountWidget when showTrendIndicator is false', () => {
    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PORTFOLIO"
        metric={resolvedIssuesMetric}
        showTrendIndicator={false}
      />,
    );

    expect(mockCountWidget).toHaveBeenCalledWith(
      expect.objectContaining({ sparklineSeries: undefined }),
    );
  });

  it('forwards linkTo to CountWidget', () => {
    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PORTFOLIO"
        linkTo="breakdown/widget-key"
        metric={resolvedIssuesMetric}
        showTrendIndicator={false}
      />,
    );

    expect(screen.getByTestId('count-widget')).toHaveAttribute(
      'data-link-to',
      'breakdown/widget-key',
    );
  });

  it('computes trend data when both current and past trend values are available', () => {
    jest.mocked(useOrgIssueResolutionCountWidgetData).mockReturnValue({
      data: { latestValue: 10, sparklineSeries: [], trend: withTrend },
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueResolutionCountWidgetData>);

    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PROJECT_BRANCH"
        metric={resolvedIssuesMetric}
        showTrendIndicator
      />,
    );

    const lastCall = mockCountWidget.mock.calls.at(-1)?.[0];
    expect(lastCall?.trendIndicatorData?.trendData).not.toBeNull();
  });

  it('formats an absolute MTTR trend change as a calendar duration', () => {
    jest.mocked(useOrgIssueResolutionCountWidgetData).mockReturnValue({
      data: {
        latestValue: 4_146_501,
        sparklineSeries: [],
        trend: { current: '4146501', past: '0' },
      },
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueResolutionCountWidgetData>);

    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PROJECT_BRANCH"
        metric={mttrMetric}
        showTrendIndicator
      />,
    );

    const lastCall = mockCountWidget.mock.calls.at(-1)?.[0];
    expect(lastCall?.trendIndicatorData?.trendData?.formattedChange).toBe('mttr.x_years.7.9');
  });

  it('passes null trend data when trend values are absent', () => {
    renderWithContext(
      <OrgIssueResolutionCountWidget
        entityId="entity-1"
        entityType="PROJECT_BRANCH"
        metric={resolvedIssuesMetric}
        showTrendIndicator
      />,
    );

    const lastCall = mockCountWidget.mock.calls.at(-1)?.[0];
    expect(lastCall?.trendIndicatorData?.trendData).toBeNull();
  });
});
