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

import { act, renderHook } from '@testing-library/react';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { IssueStatus } from '../../../types/dashboard-widget';
import {
  CodeScope,
  TopListLimit,
  TopListMetric,
  TopListRankBy,
} from '../../../types/widget-common';
import type { TopListConfig } from '../../state/widgetConfigTypes';
import { useTopListApplyFiltersViewModel } from '../useTopListApplyFiltersViewModel';

jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => id,
  }),
}));

describe('useTopListApplyFiltersViewModel', () => {
  const topListConfig: TopListConfig = {
    complete: true,
    limit: TopListLimit.Five,
    measureFilters: {},
    metric: TopListMetric.IssueCount,
    rankBy: TopListRankBy.Rule,
    scope: CodeScope.Overall,
  };

  const metricPickerOptions = {
    countMetrics: [],
    ratingBadgeMetrics: [],
    supportsNewCodeScopeForMetric: () => true,
  };

  it('dispatches scope and measure filter updates', () => {
    const dispatch = jest.fn();

    const { result } = renderHook(() =>
      useTopListApplyFiltersViewModel({
        dispatch,
        metricPickerOptions,
        topListConfig,
      }),
    );

    expect(result.current.hasMetric).toBe(true);

    act(() => {
      result.current.scope.setScope(CodeScope.New);
    });
    expect(dispatch).toHaveBeenCalledWith({ scope: CodeScope.New, type: 'SET_SCOPE' });

    act(() => {
      result.current.richMeasureFilters.setIssueStatusFilter(IssueStatus.Open);
    });
    expect(dispatch).toHaveBeenCalledWith({
      measureFilters: { issueStatus: IssueStatus.Open },
      type: 'SET_TOP_LIST_MEASURE_FILTERS',
    });

    act(() => {
      result.current.richMeasureFilters.setSoftwareQualityFilter(SoftwareQuality.Security);
    });
    expect(dispatch).toHaveBeenCalledWith({
      measureFilters: { impactSoftwareQuality: SoftwareQuality.Security },
      type: 'SET_TOP_LIST_MEASURE_FILTERS',
    });

    act(() => {
      result.current.richMeasureFilters.setSeverityFilter('BLOCKER');
    });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_TOP_LIST_MEASURE_FILTERS',
      }),
    );
  });

  it('keeps issue status filter enabled when scope is New', () => {
    const { result } = renderHook(() =>
      useTopListApplyFiltersViewModel({
        dispatch: jest.fn(),
        metricPickerOptions,
        topListConfig: { ...topListConfig, scope: CodeScope.New },
      }),
    );

    expect(result.current.richMeasureFilters.statusFilterHelpText).toBeUndefined();
    expect(result.current.richMeasureFilters.isIssueStatusFilterDisabled).toBe(false);
  });

  it('returns hasMetric false when top list config is incomplete', () => {
    const { result } = renderHook(() =>
      useTopListApplyFiltersViewModel({
        dispatch: jest.fn(),
        metricPickerOptions,
        topListConfig: { ...topListConfig, complete: false },
      }),
    );

    expect(result.current.hasMetric).toBe(false);
  });

  it('includes false positive status options for portfolio dashboards', () => {
    const { result } = renderHook(() =>
      useTopListApplyFiltersViewModel({
        dispatch: jest.fn(),
        metricPickerOptions,
        topListConfig,
      }),
    );

    expect(
      result.current.richMeasureFilters.issueStatusSelectOptions.map((option) => option.value),
    ).toEqual(['', IssueStatus.Open, IssueStatus.Accepted, IssueStatus.FalsePositive]);
  });

  it('disables new code scope when metric picker does not support it', () => {
    const { result } = renderHook(() =>
      useTopListApplyFiltersViewModel({
        dispatch: jest.fn(),
        metricPickerOptions: {
          ...metricPickerOptions,
          supportsNewCodeScopeForMetric: () => false,
        },
        topListConfig,
      }),
    );

    expect(result.current.scope.isScopeSelectDisabled).toBe(true);
  });
});
