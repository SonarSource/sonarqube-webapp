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
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { mockPullRequest } from '~shared/helpers/mocks/branches';
import { MetricKey } from '~shared/types/metrics';
import { useProjectLegacyIssueCountWidgetQuery } from '../project-count-widget-data';
import {
  useProjectQualityGateStatusWidgetQuery,
  useProjectRatingBadgeMeasuresQuery,
} from '../project-rating-badge-widget-data';

const mockUseComponent = jest.fn();
const mockUseCurrentBranchQuery = jest.fn();
const mockUseDashboardMeasuresHistoryQuery = jest.fn();
const mockUseIssueCountSearchQuery = jest.fn();
const mockUseProjectQualityGateStatus = jest.fn();
const mockExtractStatusConditionsFromProjectStatus = jest.fn();

jest.mock('../../../context/componentContext/withComponentContext', () => ({
  useComponent: (...args: unknown[]) => mockUseComponent(...args),
}));

jest.mock('../branch', () => ({
  useCurrentBranchQuery: (...args: unknown[]) => mockUseCurrentBranchQuery(...args),
}));

jest.mock('../../../queries/dashboard-issue-count', () => ({
  useIssueCountSearchQuery: (...args: unknown[]) => mockUseIssueCountSearchQuery(...args),
}));

jest.mock('../../../queries/dashboard-history', () => ({
  useDashboardMeasuresHistoryQuery: (...args: unknown[]) =>
    mockUseDashboardMeasuresHistoryQuery(...args),
}));

jest.mock('../../../queries/quality-gates', () => ({
  useProjectQualityGateStatus: (...args: unknown[]) => mockUseProjectQualityGateStatus(...args),
}));

jest.mock('../../../helpers/quality-gates', () => ({
  extractStatusConditionsFromProjectStatus: (...args: unknown[]) =>
    mockExtractStatusConditionsFromProjectStatus(...args),
}));

function selectFrom(call: unknown[]): (value: unknown) => unknown {
  return (call[1] as { select: (value: unknown) => unknown }).select;
}

describe('project dashboard adapter queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseComponent.mockReturnValue({ component: 'component-key' });
    mockUseCurrentBranchQuery.mockReturnValue({
      data: { branchId: 'branch-id', isMain: true, name: 'main' },
      isPending: false,
    });
    mockUseIssueCountSearchQuery.mockReturnValue({ data: 4, isLoading: false });
    mockUseDashboardMeasuresHistoryQuery.mockReturnValue({ data: undefined, isLoading: false });
    mockUseProjectQualityGateStatus.mockReturnValue({
      data: { ignoredConditions: false, status: 'OK' },
      isLoading: false,
    });
    mockExtractStatusConditionsFromProjectStatus.mockReturnValue([
      { level: 'OK', metric: MetricKey.coverage },
    ]);
  });

  it('passes branch context to the legacy project count query', () => {
    const { result } = renderHook(
      () =>
        useProjectLegacyIssueCountWidgetQuery({
          componentKey: 'project-1',
          measureFilters: undefined,
          scope: 'overall',
        }),
      { wrapper: getContextWrapper() },
    );

    expect(result.current).toEqual({ data: 4, isLoading: false });
    expect(mockUseIssueCountSearchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        branchLike: { branchId: 'branch-id', isMain: true, name: 'main' },
        componentKey: 'project-1',
      }),
      { enabled: true },
    );
  });

  it('maps project measures to the rating badge interface', () => {
    mockUseDashboardMeasuresHistoryQuery.mockImplementation((...args: unknown[]) => ({
      data: selectFrom(args)({
        measuresHistory: [
          {
            date: '2026-08-20',
            measures: [{ metric: MetricKey.coverage, type: 'PERCENT', value: '80' }],
          },
        ],
      }),
      isLoading: false,
    }));

    const { result } = renderHook(
      () =>
        useProjectRatingBadgeMeasuresQuery(
          { component: 'project-1', metricKeys: MetricKey.coverage },
          { enabled: true },
        ),
      { wrapper: getContextWrapper() },
    );

    expect(result.current).toEqual({
      data: [{ metric: MetricKey.coverage, value: '80' }],
      isLoading: false,
    });
    expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: 'branch-id',
        entityType: 'PROJECT_BRANCH',
        metricKeys: [MetricKey.coverage],
      }),
      expect.objectContaining({ enabled: true }),
    );
  });

  it('queries rating badge history using the pull request branch UUID', () => {
    mockUseCurrentBranchQuery.mockReturnValue({
      data: mockPullRequest({ pullRequestId: 'pull-request-branch-id' }),
      isPending: false,
    });

    renderHook(
      () =>
        useProjectRatingBadgeMeasuresQuery(
          { component: 'project-1', metricKeys: MetricKey.coverage },
          { enabled: true },
        ),
      { wrapper: getContextWrapper() },
    );

    expect(mockUseDashboardMeasuresHistoryQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: 'pull-request-branch-id',
        entityType: 'PROJECT_BRANCH',
        metricKeys: [MetricKey.coverage],
      }),
      expect.objectContaining({ enabled: true }),
    );
  });

  it('maps new-code history values to the rating badge period interface', () => {
    mockUseDashboardMeasuresHistoryQuery.mockImplementation((...args: unknown[]) => ({
      data: selectFrom(args)({
        measuresHistory: [
          {
            date: '2026-08-20',
            measures: [{ metric: MetricKey.new_reliability_rating, type: 'RATING', value: '2' }],
          },
        ],
      }),
      isLoading: false,
    }));

    const { result } = renderHook(
      () =>
        useProjectRatingBadgeMeasuresQuery(
          { component: 'project-1', metricKeys: MetricKey.new_reliability_rating },
          { enabled: true },
        ),
      { wrapper: getContextWrapper() },
    );

    expect(result.current.data).toEqual([
      {
        metric: MetricKey.new_reliability_rating,
        period: { index: 1, value: '2' },
      },
    ]);
  });

  it('maps project quality-gate status and conditions', () => {
    const { result } = renderHook(() => useProjectQualityGateStatusWidgetQuery('project-1'), {
      wrapper: getContextWrapper(),
    });

    expect(result.current).toEqual({
      data: {
        conditions: [{ level: 'OK', metric: MetricKey.coverage }],
        ignoredConditions: false,
        status: 'OK',
      },
      isLoading: false,
    });
    expect(mockExtractStatusConditionsFromProjectStatus).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'OK' }),
    );
  });

  it('keeps loading until the current branch is available', () => {
    mockUseCurrentBranchQuery.mockReturnValue({ data: undefined, isPending: true });
    mockUseProjectQualityGateStatus.mockReturnValue({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useProjectQualityGateStatusWidgetQuery('project-1'), {
      wrapper: getContextWrapper(),
    });

    expect(result.current).toEqual({ data: undefined, isLoading: true });
    expect(mockUseProjectQualityGateStatus).toHaveBeenCalledWith(
      expect.objectContaining({ projectKey: 'project-1' }),
      { enabled: false },
    );
  });
});
