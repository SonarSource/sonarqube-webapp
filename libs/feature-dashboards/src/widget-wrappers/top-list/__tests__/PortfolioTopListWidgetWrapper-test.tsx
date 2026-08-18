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
import { usePortfolioTopListData } from '~adapters/queries/portfolio-top-list-widget-data';
import { renderWithContext } from '~shared/helpers/test-utils';
import { WidgetInstanceProvider } from '../../../dashboard-layout/shared/WidgetInstanceContext';
import { TopListProps } from '../../../types/visualization';
import { CodeScope, TopListLimit, TopListRankBy } from '../../../types/widget-common';
import { buildDashboardMetricForTopList } from '../../../widget-creation-modal/utils/topListCompleteConfig';
import { PortfolioTopListWidgetWrapper as PortfolioTopListWidget } from '../PortfolioTopListWidgetWrapper';

const mockTopList = jest.fn((props: TopListProps) => (
  <div
    data-has-fetch-error={String(props.hasFetchError)}
    data-is-pending={String(props.isPending)}
    data-row-count={props.rows.length}
    data-testid="top-list"
  />
));

jest.mock('~feature-dashboards/components/visualizations/top-list/TopList', () => ({
  TopList: (props: TopListProps) => mockTopList(props),
}));

jest.mock('~adapters/queries/portfolio-top-list-widget-data', () => ({
  usePortfolioTopListData: jest.fn(),
}));

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardPortfolioContext: jest.fn(),
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getPortfolioDashboardWidgetDrilldownUrl: (widgetKey: string) => `breakdown/${widgetKey}`,
}));

const defaultProps = {
  limit: TopListLimit.Five,
  metric: buildDashboardMetricForTopList(undefined),
  rankBy: TopListRankBy.Rule,
  scope: CodeScope.Overall,
};

function getLastTopListProps(): TopListProps {
  return mockTopList.mock.calls.at(-1)![0];
}

beforeEach(() => {
  mockTopList.mockClear();

  jest.mocked(useDashboardPortfolioContext).mockReturnValue({
    getPortfolioMetric: jest.fn(),
    portfolioId: 'portfolio-1',
  });

  jest.mocked(usePortfolioTopListData).mockReturnValue({
    counts: { 'java:S1': 4 },
    getRuleTrendData: () => ({
      activityUrl: { pathname: '#' },
      change: 1,
      formattedChange: '25%',
      metricDirection: -1,
      past: 3,
      roundedChange: 1,
    }),
    isError: false,
    isPending: false,
    rulesByKey: {},
    rulesOrganization: 'my-org',
  });
});

describe('PortfolioTopListWidget', () => {
  it('passes built rows and column headers to TopList', () => {
    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 6, width: 6 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioTopListWidget {...defaultProps} />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('top-list')).toHaveAttribute('data-row-count', '1');
    const topListProps = getLastTopListProps();
    expect(topListProps.columnHeaders.metric).toBe('dashboard.top_list.column.metric.issue_count');
    expect(topListProps.hasFetchError).toBe(false);
    expect(topListProps.isPending).toBe(false);
    expect(usePortfolioTopListData).toHaveBeenCalledWith(
      defaultProps,
      'portfolio-1',
      expect.objectContaining({ fetchTrendHistory: true }),
    );
  });

  it('labels rows with the resolved rule name (without the language prefix)', () => {
    jest.mocked(usePortfolioTopListData).mockReturnValue({
      counts: { 'java:S1': 4 },
      getRuleTrendData: () => null,
      isError: false,
      isPending: false,
      rulesByKey: { 'java:S1': { langName: 'Java', name: 'Cognitive Complexity' } },
      rulesOrganization: 'my-org',
    });

    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 6, width: 6 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioTopListWidget {...defaultProps} />
      </WidgetInstanceProvider>,
    );

    const topListProps = getLastTopListProps();
    expect(topListProps.rows[0]?.label).toBe('Cognitive Complexity');
  });

  it('falls back to the raw rule key when no name is resolved', () => {
    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 6, width: 6 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioTopListWidget {...defaultProps} />
      </WidgetInstanceProvider>,
    );

    const topListProps = getLastTopListProps();
    expect(topListProps.rows[0]?.label).toBe('java:S1');
  });

  it('disables trend history for new code scope', () => {
    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 6, width: 6 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioTopListWidget {...defaultProps} scope={CodeScope.New} />
      </WidgetInstanceProvider>,
    );

    expect(usePortfolioTopListData).toHaveBeenCalledWith(
      expect.objectContaining({ scope: CodeScope.New }),
      'portfolio-1',
      expect.objectContaining({ fetchTrendHistory: false }),
    );
  });

  it('adds drilldown links for portfolio widgets', () => {
    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 6, width: 6 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioTopListWidget {...defaultProps} />
      </WidgetInstanceProvider>,
    );

    const topListProps = getLastTopListProps();
    expect(topListProps.rows[0].linkTo).toContain('breakdown/223e4567-e89b-42d3-a456-426614174000');
    expect(topListProps.rows[0].countLinkTo).toBe(topListProps.rows[0].linkTo);
  });

  it('forwards loading and error state from the data hook', () => {
    jest.mocked(usePortfolioTopListData).mockReturnValue({
      counts: {},
      getRuleTrendData: () => null,
      isError: true,
      isPending: true,
      rulesByKey: {},
      rulesOrganization: undefined,
    });

    renderWithContext(
      <WidgetInstanceProvider
        dimensions={{ height: 6, width: 6 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioTopListWidget {...defaultProps} />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('top-list')).toHaveAttribute('data-has-fetch-error', 'true');
    expect(screen.getByTestId('top-list')).toHaveAttribute('data-is-pending', 'true');
  });
});
