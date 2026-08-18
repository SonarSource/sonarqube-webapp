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
import * as ProjectRatingBadgeData from '~adapters/queries/project-rating-badge-widget-data';
import * as WidgetMetricMetadata from '~adapters/queries/widget-metric-metadata';
import { renderWithContext } from '~shared/helpers/test-utils';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { CodeScope, WidgetMode } from '../../../types/widget-common';
import { ProjectRatingBadgeWidgetWrapper as RatingBadgeWidget } from '../ProjectRatingBadgeWidgetWrapper';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams('id=my-project')],
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

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getProjectDashboardMeasuresUrl: ({ metric }: { metric: string }) => `#metric=${metric}`,
}));

jest.mock('~adapters/queries/project-rating-badge-widget-data', () => ({
  useProjectRatingBadgeMeasuresQuery: jest.fn(),
}));

jest.mock('~adapters/queries/widget-metric-metadata', () => ({
  useWidgetMetricMetadataQuery: jest.fn(),
}));

describe('RatingBadgeWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery).mockReturnValue({
      data: [{ metric: MetricKey.reliability_rating, value: '1' }],
      isLoading: false,
    } as unknown as ReturnType<typeof ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery>);

    jest.mocked(WidgetMetricMetadata.useWidgetMetricMetadataQuery).mockReturnValue({
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
        [MetricKey.releasability_rating_with_aica]: {
          key: MetricKey.releasability_rating_with_aica,
          name: 'Releasability with AICA',
          type: MetricType.Rating,
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof WidgetMetricMetadata.useWidgetMetricMetadataQuery>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the loading state when measure query is loading', () => {
    jest.mocked(ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery>);

    renderRatingBadgeWidget(MetricKey.reliability_rating);
    expect(screen.getByText('loading-widget')).toBeInTheDocument();
  });

  it('renders a link for linkable rating metrics', () => {
    renderRatingBadgeWidget(MetricKey.reliability_rating);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('metric=reliability_rating'));
    expect(screen.getByText('measure:reliability_rating:1')).toBeInTheDocument();
  });

  it('renders linkable rating metrics without link in edit mode', () => {
    renderRatingBadgeWidget(MetricKey.reliability_rating, CodeScope.Overall, WidgetMode.Edit);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('measure:reliability_rating:1')).toBeInTheDocument();
  });
});

function renderRatingBadgeWidget(
  metricKey: MetricKey,
  scope: CodeScope = CodeScope.Overall,
  mode?: WidgetMode,
) {
  return renderWithContext(<RatingBadgeWidget metricKey={metricKey} mode={mode} scope={scope} />);
}
