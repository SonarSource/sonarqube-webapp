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
import { useDashboardProjectContext } from '~adapters/context/dashboardContext';
import {
  useOrgIssueCountWidgetData,
  useOrgMeasuresCountWidgetData,
} from '~adapters/queries/count-widget-data';
import { useProjectLegacyIssueCountWidgetQuery } from '~adapters/queries/project-count-widget-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { DashboardMetricType, RichMetricKey } from '../../../data/widgets/shared';
import { CodeScope } from '../../../types/widget-common';
import { ProjectCountWidgetWrapper } from '../ProjectCountWidgetWrapper';

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardProjectContext: jest.fn(),
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  buildProjectRawCountWidgetLink: () => '#',
  buildProjectRichCountWidgetLink: () => '#',
  getProjectDashboardMeasureHistoryUrl: () => ({ pathname: '#' }),
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

jest.mock('~feature-dashboards/components/visualizations/CountWidget', () => ({
  CountWidget: ({ value }: { value: string }) => <div data-testid="count-widget">{value}</div>,
}));

beforeEach(() => {
  jest.mocked(useDashboardProjectContext).mockReturnValue({
    componentKey: 'project-key',
    isLoading: false,
    organization: 'my-org',
    projectEntityId: 'branch-id',
  });
  jest.mocked(useWidgetMetricMetadataQuery).mockReturnValue({
    data: {
      [MetricKey.ncloc]: { key: MetricKey.ncloc, name: 'Lines', type: MetricType.Integer },
    },
    isLoading: false,
  } as unknown as ReturnType<typeof useWidgetMetricMetadataQuery>);
  jest.mocked(useOrgMeasuresCountWidgetData).mockReturnValue({
    data: { latestValue: '42', sparklineSeries: [], trend: { current: null, past: null } },
    isPending: false,
  } as unknown as ReturnType<typeof useOrgMeasuresCountWidgetData>);
  jest.mocked(useOrgIssueCountWidgetData).mockReturnValue({
    data: { historicalValues: { current: null, past: null }, latestTotal: 7, sparklineSeries: [] },
    isPending: false,
  } as unknown as ReturnType<typeof useOrgIssueCountWidgetData>);
  jest.mocked(useProjectLegacyIssueCountWidgetQuery).mockReturnValue({
    data: 3,
    isLoading: false,
  });
});

describe('ProjectCountWidgetWrapper integration', () => {
  it('renders raw values returned by the organization adapter', () => {
    renderWithRouter(
      <ProjectCountWidgetWrapper
        metric={{ metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw }}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.getByTestId('count-widget')).toHaveTextContent('42');
    expect(useOrgMeasuresCountWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({ entityId: 'branch-id', entityType: 'PROJECT_BRANCH' }),
    );
  });

  it('renders rich issue totals returned by the organization adapter', () => {
    renderWithRouter(
      <ProjectCountWidgetWrapper
        metric={{ metricKey: RichMetricKey.Issues, type: DashboardMetricType.Rich }}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.getByTestId('count-widget')).toHaveTextContent('7');
    expect(useOrgIssueCountWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({ entityId: 'branch-id', entityType: 'PROJECT_BRANCH' }),
    );
  });
});
