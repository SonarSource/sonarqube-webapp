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
  usePortfolioRatingBadgeMeasuresQuery,
  usePortfolioRatingBadgeMetricKeysQuery,
} from '~adapters/queries/portfolio-rating-badge-widget-data';
import { renderWithContext, renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { WidgetInstanceProvider } from '../../../dashboard-layout/shared/WidgetInstanceContext';
import { CodeScope, WidgetMode } from '../../../types/widget-common';
import { PortfolioRatingBadgeWidgetWrapper as PortfolioRatingBadgeWidget } from '../PortfolioRatingBadgeWidgetWrapper';

const mockPortfolioStandardRatingBadgeWidget = jest.fn((_props: unknown) => (
  <div>portfolio-standard-rating-badge</div>
));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ enterpriseKey: 'enterprise-1' }),
}));

jest.mock('~adapters/queries/portfolio-rating-badge-widget-data', () => ({
  usePortfolioRatingBadgeMeasuresQuery: jest.fn(),
  usePortfolioRatingBadgeMetricKeysQuery: jest.fn(),
}));

jest.mock('../PortfolioStandardRatingBadgeWidgetWrapper', () => ({
  PortfolioStandardRatingBadgeWidgetWrapper: (props: unknown) =>
    mockPortfolioStandardRatingBadgeWidget(props),
}));

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardPortfolioContext: jest.fn(),
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getPortfolioDashboardWidgetDrilldownUrl: (widgetKey: string, segment?: string) =>
    segment === undefined ? `breakdown/${widgetKey}` : `breakdown/${widgetKey}?segment=${segment}`,
}));

beforeEach(() => {
  mockPortfolioStandardRatingBadgeWidget.mockClear();

  jest.mocked(useDashboardPortfolioContext).mockReturnValue({
    getPortfolioMetric: jest.fn(),
    portfolioId: 'portfolio-1',
  });
  jest.mocked(usePortfolioRatingBadgeMetricKeysQuery).mockImplementation((metricKeys) => ({
    error: null,
    isPending: false,
    metricKeys,
  }));

  jest.mocked(usePortfolioRatingBadgeMeasuresQuery).mockReturnValue({
    data: {
      [MetricKey.security_rating]: 'A',
      [MetricKey.security_rating_distribution]: { A: 5 },
    },
    isLoading: false,
    isPending: false,
  } as unknown as ReturnType<typeof usePortfolioRatingBadgeMeasuresQuery>);
});

describe('PortfolioRatingBadgeWidget', () => {
  it('only mounts breakdown data hooks for supported breakdown metrics', () => {
    const { rerender } = renderWithContext(
      <PortfolioRatingBadgeWidget metricKey={MetricKey.coverage} scope={CodeScope.Overall} />,
    );

    expect(screen.getByText('portfolio-standard-rating-badge')).toBeInTheDocument();
    expect(usePortfolioRatingBadgeMeasuresQuery).not.toHaveBeenCalled();
    expect(usePortfolioRatingBadgeMetricKeysQuery).not.toHaveBeenCalled();

    expect(() => {
      rerender(
        <PortfolioRatingBadgeWidget
          metricKey={MetricKey.security_rating}
          scope={CodeScope.Overall}
        />,
      );
    }).not.toThrow();
    expect(usePortfolioRatingBadgeMetricKeysQuery).toHaveBeenLastCalledWith([
      MetricKey.security_rating,
      MetricKey.security_rating_distribution,
    ]);
    expect(usePortfolioRatingBadgeMeasuresQuery).toHaveBeenLastCalledWith('portfolio-1', {
      enabled: true,
      metricKeys: [MetricKey.security_rating, MetricKey.security_rating_distribution],
    });
  });

  it('forwards edit mode to standard portfolio rating badge widgets', () => {
    renderWithContext(
      <PortfolioRatingBadgeWidget
        metricKey={MetricKey.coverage}
        mode={WidgetMode.Edit}
        scope={CodeScope.Overall}
      />,
    );

    expect(mockPortfolioStandardRatingBadgeWidget).toHaveBeenCalledWith(
      expect.objectContaining({ mode: WidgetMode.Edit }),
    );
  });

  it('renders a breakdown link for SCA rating metrics when rating is present but no distribution', () => {
    jest.mocked(usePortfolioRatingBadgeMeasuresQuery).mockReturnValue({
      data: {
        [MetricKey.sca_rating_any_issue]: 'A',
      },
      isLoading: false,
      isPending: false,
    } as unknown as ReturnType<typeof usePortfolioRatingBadgeMeasuresQuery>);

    renderWithRouter(
      <WidgetInstanceProvider dimensions={{ height: 2, width: 2 }} widgetKey="sca-rating-widget">
        <PortfolioRatingBadgeWidget
          metricKey={MetricKey.sca_rating_any_issue}
          scope={CodeScope.Overall}
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.queryByText('project-rating-badge')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders the center rating badge without a link in edit mode', () => {
    renderWithContext(
      <WidgetInstanceProvider dimensions={{ height: 2, width: 2 }} widgetKey="rating-widget-1">
        <PortfolioRatingBadgeWidget
          metricKey={MetricKey.security_rating}
          mode={WidgetMode.Edit}
          scope={CodeScope.Overall}
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('uses the shared status distribution after resolving the Server history metric', () => {
    jest.mocked(usePortfolioRatingBadgeMetricKeysQuery).mockReturnValue({
      error: null,
      isPending: false,
      metricKeys: [MetricKey.releasability_rating, MetricKey.releasability_rating_distribution],
    });
    jest.mocked(usePortfolioRatingBadgeMeasuresQuery).mockReturnValue({
      data: {
        [MetricKey.releasability_rating]: 'A',
        [MetricKey.releasability_rating_distribution]: { A: 4, E: 2 },
        [MetricKey.releasability_status_distribution]: { ERROR: 2, OK: 4 },
      },
      isPending: false,
    } as unknown as ReturnType<typeof usePortfolioRatingBadgeMeasuresQuery>);

    renderWithContext(
      <PortfolioRatingBadgeWidget
        metricKey={MetricKey.releasability_rating}
        scope={CodeScope.Overall}
        showBreakdown
      />,
    );

    expect(usePortfolioRatingBadgeMeasuresQuery).toHaveBeenCalledWith('portfolio-1', {
      enabled: true,
      metricKeys: [MetricKey.releasability_rating, MetricKey.releasability_rating_distribution],
    });
    expect(screen.getAllByText('metric.level.ERROR')).not.toHaveLength(0);
    expect(screen.getAllByText('metric.level.OK')).not.toHaveLength(0);
  });
});
