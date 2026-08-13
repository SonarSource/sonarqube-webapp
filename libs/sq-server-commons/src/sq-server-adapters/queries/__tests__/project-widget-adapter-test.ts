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
import { MetricKey } from '~shared/types/metrics';
import { useProjectLegacyIssueCountWidgetQuery } from '../project-count-widget-data';
import {
  useProjectQualityGateStatusWidgetQuery,
  useProjectRatingBadgeMeasuresQuery,
} from '../project-rating-badge-widget-data';

const mockUseComponent = jest.fn();
const mockUseCurrentBranchQuery = jest.fn();
const mockUseIssueCountSearchQuery = jest.fn();
const mockUseMeasuresComponentQuery = jest.fn();
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

jest.mock('../measures', () => ({
  useMeasuresComponentQuery: (...args: unknown[]) => mockUseMeasuresComponentQuery(...args),
}));

jest.mock('../../../queries/quality-gates', () => ({
  useProjectQualityGateStatus: (...args: unknown[]) => mockUseProjectQualityGateStatus(...args),
}));

jest.mock('../../../helpers/quality-gates', () => ({
  extractStatusConditionsFromProjectStatus: (...args: unknown[]) =>
    mockExtractStatusConditionsFromProjectStatus(...args),
}));

describe('project dashboard adapter queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseComponent.mockReturnValue({ component: 'component-key' });
    mockUseCurrentBranchQuery.mockReturnValue({ data: { branch: 'main' }, isPending: false });
    mockUseIssueCountSearchQuery.mockReturnValue({ data: 4, isLoading: false });
    mockUseMeasuresComponentQuery.mockReturnValue({
      data: { component: { measures: [{ metric: MetricKey.coverage, value: '80' }] } },
      isLoading: false,
    });
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
      expect.objectContaining({ branchLike: { branch: 'main' }, componentKey: 'project-1' }),
      { enabled: true },
    );
  });

  it('maps project measures to the rating badge interface', () => {
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
