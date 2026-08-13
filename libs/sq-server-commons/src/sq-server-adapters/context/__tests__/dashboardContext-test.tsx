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

import { renderHook } from '@testing-library/react';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { useComponent } from '../../../context/componentContext/withComponentContext';
import { mockComponent } from '../../../helpers/mocks/component';
import { useCurrentBranchQuery } from '../../queries/branch';
import { useWidgetMetricMetadataQuery } from '../../queries/widget-metric-metadata';
import { useDashboardPortfolioContext, useDashboardProjectContext } from '../dashboardContext';

jest.mock('../../../context/componentContext/withComponentContext', () => ({
  useComponent: jest.fn(),
}));

jest.mock('../../queries/branch', () => ({
  useCurrentBranchQuery: jest.fn(),
}));

jest.mock('../../queries/widget-metric-metadata', () => ({
  useWidgetMetricMetadataQuery: jest.fn(),
}));

describe('dashboard context adapter', () => {
  beforeEach(() => {
    jest.mocked(useComponent).mockReturnValue({
      component: mockComponent({ key: 'component-key' }),
      isPending: false,
    } as ReturnType<typeof useComponent>);
    jest.mocked(useCurrentBranchQuery).mockReturnValue({
      data: { branchId: 'branch-id', isMain: true, name: 'main' },
      isPending: false,
    } as ReturnType<typeof useCurrentBranchQuery>);
    jest.mocked(useWidgetMetricMetadataQuery).mockReturnValue({
      data: {
        [MetricKey.coverage]: {
          direction: -1,
          key: MetricKey.coverage,
          type: MetricType.Percent,
        },
      },
    } as ReturnType<typeof useWidgetMetricMetadataQuery>);
  });

  it('uses the active component as the dashboard project resource', () => {
    const { result } = renderHook(() => useDashboardProjectContext());

    expect(result.current).toEqual({
      componentKey: 'component-key',
      isLoading: false,
      organization: 'component-key',
      projectEntityId: 'branch-id',
    });
  });

  it('uses the active pull request as the dashboard project resource', () => {
    jest.mocked(useCurrentBranchQuery).mockReturnValue({
      data: {
        base: 'main',
        branch: 'feature',
        key: 'pull-request-key',
        pullRequestId: 'pull-request-id',
        target: 'main',
        title: 'Feature',
      },
      isPending: false,
    } as ReturnType<typeof useCurrentBranchQuery>);

    const { result } = renderHook(() => useDashboardProjectContext());

    expect(result.current.projectEntityId).toBe('pull-request-id');
  });

  it('uses the active component and metric metadata for portfolio widgets', () => {
    const { result } = renderHook(() => useDashboardPortfolioContext());

    expect(result.current.portfolioId).toBe('component-key');
    expect(result.current.getPortfolioMetric(MetricKey.coverage)).toEqual({
      direction: -1,
      key: MetricKey.coverage,
      type: MetricType.Percent,
    });
  });
});
