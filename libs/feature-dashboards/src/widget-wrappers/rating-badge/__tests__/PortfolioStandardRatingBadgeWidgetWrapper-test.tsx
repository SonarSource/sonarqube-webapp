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
import * as DashboardContext from '~adapters/context/dashboardContext';
import * as PortfolioRatingQueries from '~adapters/queries/portfolio-rating-badge-widget-data';
import * as WidgetMetricMetadataQueries from '~adapters/queries/widget-metric-metadata';
import { renderWithContext } from '~shared/helpers/test-utils';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { CodeScope, WidgetMode } from '../../../types/widget-common';
import * as PortfolioWidgetDataUtils from '../../../utils/portfolioWidgetData';
import { PortfolioStandardRatingBadgeWidgetWrapper as PortfolioStandardRatingBadgeWidget } from '../PortfolioStandardRatingBadgeWidgetWrapper';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ enterpriseKey: 'enterprise-1' }),
  };
});

jest.mock('@sonarsource/echoes-react', () => ({
  ...jest.requireActual<typeof import('@sonarsource/echoes-react')>('@sonarsource/echoes-react'),
  LinkStandalone: ({
    children,
    to,
  }: {
    children: React.ReactNode;
    to: { pathname?: string; search?: string } | string;
  }) => {
    const href = typeof to === 'string' ? to : `${to.pathname ?? ''}${to.search ?? ''}`;
    return <a href={href}>{children}</a>;
  },
}));

jest.mock('~feature-dashboards/components/common/WidgetLoadingSpinner', () => ({
  WidgetLoadingSpinner: () => <div>loading-widget</div>,
}));

jest.mock('~feature-dashboards/components/common/WidgetNoData', () => ({
  WidgetNoData: () => <div>no-data-widget</div>,
}));

jest.mock('~adapters/components/measure/Measure', () => ({
  __esModule: true,
  default: ({ metricKey, value }: { metricKey: string; value: string }) => (
    <span>{`measure:${metricKey}:${value}`}</span>
  ),
}));

jest.mock('~adapters/components/ui/QualityGateIndicator', () => ({
  QualityGateIndicator: ({ size, status }: { size?: string; status: string }) => (
    <div aria-label={`quality-gate-indicator-${status}`} data-size={size} role="status" />
  ),
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getPortfolioDashboardMeasuresUrl: () => '#',
}));

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardPortfolioContext: jest.fn(),
}));

jest.mock('~adapters/queries/portfolio-rating-badge-widget-data', () => ({
  usePortfolioRatingBadgeComputedMeasuresQuery: jest.fn(),
  usePortfolioRatingBadgeMeasuresQuery: jest.fn(),
  usePortfolioRatingBadgeMetricKeysQuery: jest.fn(),
}));

jest.mock('~adapters/queries/widget-metric-metadata', () => ({
  useWidgetMetricMetadataQuery: jest.fn(),
}));

describe('PortfolioStandardRatingBadgeWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(DashboardContext.useDashboardPortfolioContext).mockReturnValue({
      getPortfolioMetric: jest.fn(),
      portfolioId: 'portfolio-1',
    });
    jest
      .mocked(PortfolioRatingQueries.usePortfolioRatingBadgeMetricKeysQuery)
      .mockImplementation((metricKeys) => ({
        error: null,
        isPending: false,
        metricKeys,
      }));

    jest
      .mocked(PortfolioRatingQueries.usePortfolioRatingBadgeComputedMeasuresQuery)
      .mockReturnValue({
        data: { projects: [] },
        isPending: false,
      } as unknown as ReturnType<
        typeof PortfolioRatingQueries.usePortfolioRatingBadgeComputedMeasuresQuery
      >);

    jest.mocked(PortfolioRatingQueries.usePortfolioRatingBadgeMeasuresQuery).mockReturnValue({
      data: undefined,
      isPending: false,
    } as unknown as ReturnType<typeof PortfolioRatingQueries.usePortfolioRatingBadgeMeasuresQuery>);

    jest.mocked(WidgetMetricMetadataQueries.useWidgetMetricMetadataQuery).mockReturnValue({
      data: {
        [MetricKey.releasability_rating_with_aica]: {
          key: MetricKey.releasability_rating_with_aica,
          name: 'Releasability with AICA',
          type: MetricType.Rating,
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof WidgetMetricMetadataQueries.useWidgetMetricMetadataQuery>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders non-linkable portfolio releasability rating without link and normalizes letter grades', () => {
    jest.mocked(PortfolioRatingQueries.usePortfolioRatingBadgeMeasuresQuery).mockReturnValue({
      data: {
        [MetricKey.releasability_rating]: 'B',
      },
      isPending: false,
    } as unknown as ReturnType<typeof PortfolioRatingQueries.usePortfolioRatingBadgeMeasuresQuery>);

    renderWithContext(
      <PortfolioStandardRatingBadgeWidget
        metricKey={MetricKey.releasability_rating_with_aica}
        scope={CodeScope.Overall}
      />,
    );

    expect(PortfolioRatingQueries.usePortfolioRatingBadgeMeasuresQuery).toHaveBeenCalledWith(
      'portfolio-1',
      {
        enabled: false,
        metricKeys: [MetricKey.releasability_rating],
      },
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('measure:releasability_rating_with_aica:2')).toBeInTheDocument();
  });

  it('renders linkable rating metrics without link in edit mode', () => {
    jest.mocked(WidgetMetricMetadataQueries.useWidgetMetricMetadataQuery).mockReturnValue({
      data: {
        [MetricKey.reliability_rating]: {
          key: MetricKey.reliability_rating,
          name: 'Reliability',
          type: MetricType.Rating,
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof WidgetMetricMetadataQueries.useWidgetMetricMetadataQuery>);

    jest.mocked(PortfolioRatingQueries.usePortfolioRatingBadgeMeasuresQuery).mockReturnValue({
      data: {
        [MetricKey.reliability_rating]: '1',
      },
      isPending: false,
    } as unknown as ReturnType<typeof PortfolioRatingQueries.usePortfolioRatingBadgeMeasuresQuery>);

    renderWithContext(
      <PortfolioStandardRatingBadgeWidget
        metricKey={MetricKey.reliability_rating}
        mode={WidgetMode.Edit}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('measure:reliability_rating:1')).toBeInTheDocument();
  });

  it('renders no data when mode resolution fails transiently', () => {
    jest.mocked(PortfolioRatingQueries.usePortfolioRatingBadgeMetricKeysQuery).mockReturnValue({
      error: new TypeError('Failed to fetch'),
      isPending: false,
      metricKeys: [MetricKey.reliability_rating, MetricKey.reliability_rating],
    });

    renderWithContext(
      <PortfolioStandardRatingBadgeWidget
        metricKey={MetricKey.reliability_rating}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.getByText('no-data-widget')).toBeInTheDocument();
  });

  describe('alert_status (quality gate)', () => {
    beforeEach(() => {
      jest.mocked(WidgetMetricMetadataQueries.useWidgetMetricMetadataQuery).mockReturnValue({
        data: {
          [MetricKey.alert_status]: {
            key: MetricKey.alert_status,
            name: 'Quality gate status',
            type: MetricType.Level,
          },
        },
        isLoading: false,
      } as unknown as ReturnType<typeof WidgetMetricMetadataQueries.useWidgetMetricMetadataQuery>);
    });

    it('renders QualityGateIndicator and formatted status text for a valid quality gate value', () => {
      jest
        .mocked(PortfolioRatingQueries.usePortfolioRatingBadgeComputedMeasuresQuery)
        .mockReturnValue({
          data: {
            projects: [
              {
                branchId: 'branch-1',
                measures: [{ name: MetricKey.alert_status, value: 'OK' }],
              },
            ],
          },
          isPending: false,
        } as unknown as ReturnType<
          typeof PortfolioRatingQueries.usePortfolioRatingBadgeComputedMeasuresQuery
        >);

      renderWithContext(
        <PortfolioStandardRatingBadgeWidget
          metricKey={MetricKey.alert_status}
          scope={CodeScope.Overall}
        />,
      );

      expect(screen.getByLabelText('quality-gate-indicator-OK')).toHaveAttribute('data-size', 'xl');
      expect(screen.getByText('OK')).toBeInTheDocument();
      expect(screen.queryByText('no-data-widget')).not.toBeInTheDocument();
      expect(screen.queryByText(/^measure:/)).not.toBeInTheDocument();
    });

    it('ignores aggregate-measures errors when that query is disabled', () => {
      jest
        .mocked(PortfolioRatingQueries.usePortfolioRatingBadgeComputedMeasuresQuery)
        .mockReturnValue({
          data: {
            projects: [
              {
                branchId: 'branch-1',
                measures: [{ name: MetricKey.alert_status, value: 'OK' }],
              },
            ],
          },
          isPending: false,
        } as unknown as ReturnType<
          typeof PortfolioRatingQueries.usePortfolioRatingBadgeComputedMeasuresQuery
        >);
      jest.mocked(PortfolioRatingQueries.usePortfolioRatingBadgeMeasuresQuery).mockReturnValue({
        error: new Error('cached aggregate request failed'),
        isPending: false,
      } as unknown as ReturnType<
        typeof PortfolioRatingQueries.usePortfolioRatingBadgeMeasuresQuery
      >);

      renderWithContext(
        <PortfolioStandardRatingBadgeWidget
          metricKey={MetricKey.alert_status}
          scope={CodeScope.Overall}
        />,
      );

      expect(PortfolioRatingQueries.usePortfolioRatingBadgeMeasuresQuery).toHaveBeenCalledWith(
        'portfolio-1',
        {
          enabled: false,
          metricKeys: [MetricKey.alert_status],
        },
      );
      expect(screen.getByLabelText('quality-gate-indicator-OK')).toBeInTheDocument();
    });

    it('renders WidgetNoData when the aggregated value is not a recognised quality gate status', () => {
      jest
        .spyOn(PortfolioWidgetDataUtils, 'aggregatePortfolioComputedMeasures')
        .mockReturnValue('INVALID_STATUS');

      renderWithContext(
        <PortfolioStandardRatingBadgeWidget
          metricKey={MetricKey.alert_status}
          scope={CodeScope.Overall}
        />,
      );

      expect(screen.getByText('no-data-widget')).toBeInTheDocument();
      expect(screen.queryByLabelText(/quality-gate-indicator-/)).not.toBeInTheDocument();
      expect(screen.queryByText('OK')).not.toBeInTheDocument();
    });
  });
});
