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
import { useProjectRatingBadgeMeasuresQuery } from '~adapters/queries/project-rating-badge-widget-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { CodeScope } from '../../../types/widget-common';
import { ProjectRatingBadgeWidgetWrapper } from '../ProjectRatingBadgeWidgetWrapper';

jest.mock('~adapters/components/measure/Measure', () => ({
  __esModule: true,
  default: ({ value }: { value: string }) => <div data-testid="measure">{value}</div>,
}));

jest.mock('~adapters/helpers/dashboard-measures', () => ({
  extractDashboardMeasureValue: (measure: { value?: string } | undefined) => measure?.value,
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getProjectDashboardMeasuresUrl: () => '#',
}));

jest.mock('~adapters/queries/project-rating-badge-widget-data', () => ({
  useProjectRatingBadgeMeasuresQuery: jest.fn(),
}));

jest.mock('~adapters/queries/widget-metric-metadata', () => ({
  useWidgetMetricMetadataQuery: jest.fn(),
}));

jest.mock('../ProjectQualityGateStatusBadge', () => ({
  ProjectQualityGateStatusBadge: ({ status }: { status: string }) => (
    <div data-testid="quality-gate-status">{status}</div>
  ),
}));

beforeEach(() => {
  jest.mocked(useProjectRatingBadgeMeasuresQuery).mockReturnValue({
    data: [{ metric: MetricKey.reliability_rating, value: '2' }],
    isLoading: false,
  } as unknown as ReturnType<typeof useProjectRatingBadgeMeasuresQuery>);
  jest.mocked(useWidgetMetricMetadataQuery).mockReturnValue({
    data: {
      [MetricKey.reliability_rating]: {
        key: MetricKey.reliability_rating,
        name: 'Reliability',
        type: MetricType.Rating,
      },
      [MetricKey.alert_status]: {
        key: MetricKey.alert_status,
        name: 'Quality gate',
        type: MetricType.Level,
      },
    },
    isLoading: false,
  } as unknown as ReturnType<typeof useWidgetMetricMetadataQuery>);
});

describe('ProjectRatingBadgeWidgetWrapper integration', () => {
  it('renders a rating returned by the project adapter', () => {
    renderWidget(MetricKey.reliability_rating);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(useProjectRatingBadgeMeasuresQuery).toHaveBeenCalledWith(
      expect.objectContaining({ component: 'project-key' }),
      { enabled: true },
    );
  });

  it('delegates quality-gate status rendering', () => {
    jest.mocked(useProjectRatingBadgeMeasuresQuery).mockReturnValue({
      data: [{ metric: MetricKey.alert_status, value: 'ERROR' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useProjectRatingBadgeMeasuresQuery>);

    renderWidget(MetricKey.alert_status);

    expect(screen.getByTestId('quality-gate-status')).toHaveTextContent('ERROR');
  });
});

function renderWidget(metricKey: MetricKey) {
  return renderWithRouter(
    <ProjectRatingBadgeWidgetWrapper metricKey={metricKey} scope={CodeScope.Overall} />,
    { initialEntries: ['/?id=project-key'] },
  );
}
