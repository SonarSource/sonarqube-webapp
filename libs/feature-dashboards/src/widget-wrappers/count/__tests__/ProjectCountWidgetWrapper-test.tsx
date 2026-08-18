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
import * as CountWidgetData from '~adapters/queries/count-widget-data';
import * as ProjectCountWidgetData from '~adapters/queries/project-count-widget-data';
import * as WidgetMetricMetadata from '~adapters/queries/widget-metric-metadata';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { DashboardMetricType, RichMetricKey } from '../../../data/widgets/shared';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { CodeScope } from '../../../types/widget-common';
import { ProjectCountWidgetWrapper as ProjectCountWidget } from '../ProjectCountWidgetWrapper';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams('id=my-project')],
  };
});

jest.mock('~feature-dashboards/components/visualizations/CountWidget', () => ({
  ...(jest.requireActual('~feature-dashboards/components/visualizations/CountWidget') as object),
  CountWidget: function CountWidget() {
    return <div data-testid="project-count-widget" />;
  },
}));

jest.mock('~feature-dashboards/components/common/WidgetLoadingSpinner', () => ({
  WidgetLoadingSpinner: function WidgetLoadingSpinner() {
    return <div data-testid="project-count-loading" />;
  },
}));

jest.mock('~feature-dashboards/components/common/WidgetNoData', () => ({
  WidgetNoData: function WidgetNoData() {
    return <div data-testid="project-count-no-data" />;
  },
}));

jest.mock('../../common/IssueResolutionCountWidgetWrapper', () => ({
  IssueResolutionCountWidgetWrapper: (props: { entityId: string; entityType: string }) => (
    <div
      data-entity-id={props.entityId}
      data-entity-type={props.entityType}
      data-testid="issue-resolution-count-widget"
    />
  ),
}));

jest.mock('../../common/IssueDensityCountWidgetWrapper', () => ({
  IssueDensityCountWidgetWrapper: (props: { entityId: string; entityType: string }) => (
    <div
      data-entity-id={props.entityId}
      data-entity-type={props.entityType}
      data-testid="issue-density-count-widget"
    />
  ),
}));

jest.mock('../../common/ScaResolutionCountWidgetWrapper', () => ({
  ScaResolutionCountWidgetWrapper: (props: { entityId: string; entityType: string }) => (
    <div
      data-entity-id={props.entityId}
      data-entity-type={props.entityType}
      data-testid="sca-resolution-count-widget"
    />
  ),
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  buildProjectRawCountWidgetLink: () => '#',
  buildProjectRichCountWidgetLink: () => '#',
  getProjectDashboardMeasureHistoryUrl: () => ({ pathname: '#' }),
}));

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardProjectContext: jest.fn(),
}));

jest.mock('~adapters/queries/count-widget-data', () => ({
  useOrgIssueCountWidgetData: jest.fn(),
  useOrgMeasuresCountWidgetData: jest.fn(),
}));

jest.mock('~adapters/queries/project-count-widget-data', () => ({
  useProjectLegacyIssueCountWidgetQuery: jest.fn(),
}));

jest.mock('~adapters/queries/widget-metric-metadata', () => ({
  useWidgetMetricMetadataQuery: jest.fn(),
}));

const mockBranchId = '00000000-0000-4000-8000-000000000099';

const rawMetric = {
  type: DashboardMetricType.Raw,
  metricKey: MetricKey.ncloc,
} as const;

const richMetric = {
  type: DashboardMetricType.Rich,
  metricKey: RichMetricKey.Issues,
} as const;

describe('ProjectCountWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(DashboardContext.useDashboardProjectContext).mockReturnValue({
      componentKey: 'my-project',
      isLoading: false,
      organization: 'my-org',
      projectEntityId: mockBranchId,
    });
    jest.mocked(CountWidgetData.useOrgMeasuresCountWidgetData).mockReturnValue({
      data: {
        latestValue: '42',
        sparklineSeries: [],
        trend: { current: null, past: null },
      },
      isPending: false,
    } as unknown as ReturnType<typeof CountWidgetData.useOrgMeasuresCountWidgetData>);
    jest.mocked(CountWidgetData.useOrgIssueCountWidgetData).mockReturnValue({
      data: {
        historicalValues: { current: null, past: null },
        latestTotal: 5,
        sparklineSeries: [],
      },
      isPending: false,
    } as unknown as ReturnType<typeof CountWidgetData.useOrgIssueCountWidgetData>);
    jest.mocked(ProjectCountWidgetData.useProjectLegacyIssueCountWidgetQuery).mockReturnValue({
      data: 3,
      isLoading: false,
    } as ReturnType<typeof ProjectCountWidgetData.useProjectLegacyIssueCountWidgetQuery>);
    jest.mocked(WidgetMetricMetadata.useWidgetMetricMetadataQuery).mockReturnValue({
      data: {},
      isLoading: false,
    } as unknown as ReturnType<typeof WidgetMetricMetadata.useWidgetMetricMetadataQuery>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses organizations measures-history for raw metrics', () => {
    const orgSpy = jest.mocked(CountWidgetData.useOrgMeasuresCountWidgetData).mockReturnValue({
      data: { latestValue: '42', sparklineSeries: [], trend: { current: '42', past: '40' } },
      isPending: false,
    } as unknown as ReturnType<typeof CountWidgetData.useOrgMeasuresCountWidgetData>);

    renderWithRouter(<ProjectCountWidget metric={rawMetric} scope={CodeScope.Overall} />);

    expect(orgSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: mockBranchId,
        entityType: 'PROJECT_BRANCH',
        metricKeyForRequest: MetricKey.ncloc,
      }),
    );
  });

  it('renders count widget when raw org history returns data', () => {
    jest.mocked(CountWidgetData.useOrgMeasuresCountWidgetData).mockReturnValue({
      data: {
        latestValue: '42',
        sparklineSeries: [40, 41, 42],
        trend: { current: null, past: null },
      },
      isPending: false,
    } as unknown as ReturnType<typeof CountWidgetData.useOrgMeasuresCountWidgetData>);
    jest
      .mocked(WidgetMetricMetadata.useWidgetMetricMetadataQuery)
      .mockReturnValue({ isLoading: false, data: {} } as ReturnType<
        typeof WidgetMetricMetadata.useWidgetMetricMetadataQuery
      >);

    renderWithRouter(<ProjectCountWidget metric={rawMetric} scope={CodeScope.Overall} />);

    expect(screen.getByTestId('project-count-widget')).toBeInTheDocument();
  });

  it('uses pull request entity id when branchLike is a PR', () => {
    const mockPrId = 'pr-uuid-v4-id';
    jest.mocked(DashboardContext.useDashboardProjectContext).mockReturnValue({
      componentKey: 'my-project',
      isLoading: false,
      organization: 'my-org',
      projectEntityId: mockPrId,
    });
    const orgSpy = jest.mocked(CountWidgetData.useOrgIssueCountWidgetData).mockReturnValue({
      data: {
        historicalValues: { current: null, past: null },
        latestTotal: 5,
        sparklineSeries: [],
      },
      isPending: false,
    } as unknown as ReturnType<typeof CountWidgetData.useOrgIssueCountWidgetData>);

    renderWithRouter(<ProjectCountWidget metric={richMetric} scope={CodeScope.Overall} />);

    expect(orgSpy).toHaveBeenCalledWith(expect.objectContaining({ entityId: mockPrId }));
  });

  it('uses organizations issue-count-history for rich metrics', () => {
    const orgSpy = jest.mocked(CountWidgetData.useOrgIssueCountWidgetData).mockReturnValue({
      data: {
        historicalValues: { current: '10', past: '8' },
        latestTotal: 10,
        sparklineSeries: [8, 9, 10],
      },
      isPending: false,
    } as unknown as ReturnType<typeof CountWidgetData.useOrgIssueCountWidgetData>);

    renderWithRouter(<ProjectCountWidget metric={richMetric} scope={CodeScope.Overall} />);

    expect(orgSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: mockBranchId,
        entityType: 'PROJECT_BRANCH',
      }),
    );
    expect(screen.getByTestId('project-count-widget')).toBeInTheDocument();
  });

  it('renders the shared issue-resolution count widget for MTTR', () => {
    renderWithRouter(
      <ProjectCountWidget
        metric={{
          statistic: IssueResolutionStatistic.MTTR,
          type: DashboardMetricType.IssueResolution,
        }}
        scope={CodeScope.Overall}
        showTrendIndicator
      />,
    );

    expect(screen.getByTestId('issue-resolution-count-widget')).toHaveAttribute(
      'data-entity-id',
      mockBranchId,
    );
    expect(screen.getByTestId('issue-resolution-count-widget')).toHaveAttribute(
      'data-entity-type',
      'PROJECT_BRANCH',
    );
  });

  it('renders issue density for the current project branch', () => {
    renderWithRouter(
      <ProjectCountWidget
        metric={{ type: DashboardMetricType.IssueDensity }}
        scope={CodeScope.Overall}
        showTrendIndicator
      />,
    );

    expect(screen.getByTestId('issue-density-count-widget')).toHaveAttribute(
      'data-entity-id',
      mockBranchId,
    );
    expect(screen.getByTestId('issue-density-count-widget')).toHaveAttribute(
      'data-entity-type',
      'PROJECT_BRANCH',
    );
  });

  it('renders SCA MTTR for the current project branch', () => {
    renderWithRouter(
      <ProjectCountWidget
        metric={{
          type: DashboardMetricType.ScaResolution,
        }}
        scope={CodeScope.Overall}
        showTrendIndicator
      />,
    );

    expect(screen.getByTestId('sca-resolution-count-widget')).toHaveAttribute(
      'data-entity-id',
      mockBranchId,
    );
    expect(screen.getByTestId('sca-resolution-count-widget')).toHaveAttribute(
      'data-entity-type',
      'PROJECT_BRANCH',
    );
  });

  it('uses legacy issue count search for new-code rich metrics', () => {
    const legacySpy = jest.mocked(ProjectCountWidgetData.useProjectLegacyIssueCountWidgetQuery);
    const orgSpy = jest.mocked(CountWidgetData.useOrgIssueCountWidgetData);

    renderWithRouter(<ProjectCountWidget metric={richMetric} scope={CodeScope.New} />);

    expect(legacySpy).toHaveBeenCalled();
    expect(orgSpy).not.toHaveBeenCalled();
  });

  it('shows loading spinner while branches are loading', () => {
    jest.mocked(DashboardContext.useDashboardProjectContext).mockReturnValue({
      componentKey: 'my-project',
      isLoading: true,
      organization: 'my-org',
      projectEntityId: mockBranchId,
    });

    renderWithRouter(<ProjectCountWidget metric={rawMetric} scope={CodeScope.Overall} />);

    expect(screen.getByTestId('project-count-loading')).toBeInTheDocument();
  });

  it('shows no-data widget when branch entity id is unavailable', () => {
    jest.mocked(DashboardContext.useDashboardProjectContext).mockReturnValue({
      componentKey: 'my-project',
      isLoading: false,
      organization: 'my-org',
      projectEntityId: undefined,
    });

    renderWithRouter(<ProjectCountWidget metric={rawMetric} scope={CodeScope.Overall} />);

    expect(screen.getByTestId('project-count-no-data')).toBeInTheDocument();
  });

  it('shows loading spinner while raw org history query is pending', () => {
    jest.mocked(CountWidgetData.useOrgMeasuresCountWidgetData).mockReturnValue({
      isPending: true,
      data: undefined,
    } as unknown as ReturnType<typeof CountWidgetData.useOrgMeasuresCountWidgetData>);

    renderWithRouter(<ProjectCountWidget metric={rawMetric} scope={CodeScope.Overall} />);

    expect(screen.getByTestId('project-count-loading')).toBeInTheDocument();
  });

  it('shows no-data widget when raw org history query returns no value', () => {
    jest.mocked(CountWidgetData.useOrgMeasuresCountWidgetData).mockReturnValue({
      isPending: false,
      data: {
        latestValue: undefined,
        sparklineSeries: [],
        trend: { current: null, past: null },
      },
    } as unknown as ReturnType<typeof CountWidgetData.useOrgMeasuresCountWidgetData>);
    jest
      .mocked(WidgetMetricMetadata.useWidgetMetricMetadataQuery)
      .mockReturnValue({ isLoading: false, data: {} } as ReturnType<
        typeof WidgetMetricMetadata.useWidgetMetricMetadataQuery
      >);

    renderWithRouter(<ProjectCountWidget metric={rawMetric} scope={CodeScope.Overall} />);

    expect(screen.getByTestId('project-count-no-data')).toBeInTheDocument();
  });

  it('shows loading spinner while rich org history query is pending', () => {
    jest.mocked(CountWidgetData.useOrgIssueCountWidgetData).mockReturnValue({
      isPending: true,
      data: undefined,
    } as unknown as ReturnType<typeof CountWidgetData.useOrgIssueCountWidgetData>);

    renderWithRouter(<ProjectCountWidget metric={richMetric} scope={CodeScope.Overall} />);

    expect(screen.getByTestId('project-count-loading')).toBeInTheDocument();
  });

  it('shows no-data widget when rich org history query returns null total', () => {
    jest.mocked(CountWidgetData.useOrgIssueCountWidgetData).mockReturnValue({
      isPending: false,
      data: {
        historicalValues: { current: null, past: null },
        latestTotal: null,
        sparklineSeries: [],
      },
    } as unknown as ReturnType<typeof CountWidgetData.useOrgIssueCountWidgetData>);

    renderWithRouter(<ProjectCountWidget metric={richMetric} scope={CodeScope.Overall} />);

    expect(screen.getByTestId('project-count-no-data')).toBeInTheDocument();
  });
});
