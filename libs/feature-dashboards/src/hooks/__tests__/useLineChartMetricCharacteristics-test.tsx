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
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { DashboardMetricType, IssueStatus, RichMetricKey } from '../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import { useLineChartMetricCharacteristics } from '../useLineChartMetricCharacteristics';

jest.mock('~adapters/queries/widget-metric-metadata', () => ({
  useWidgetMetricMetadataQuery: jest.fn(),
}));

const mockUseWidgetMetricMetadataQuery = jest.mocked(useWidgetMetricMetadataQuery);

describe('useLineChartMetricCharacteristics', () => {
  const wrapper = getContextWrapper();

  afterEach(() => {
    mockUseWidgetMetricMetadataQuery.mockReset();
  });

  it('resolves raw metric key and flags from metrics metadata', () => {
    mockUseWidgetMetricMetadataQuery.mockReturnValue({
      data: {
        [MetricKey.bugs]: { key: MetricKey.bugs, name: 'Bugs', type: MetricType.Integer },
      },
      isPending: false,
    } as unknown as ReturnType<typeof useWidgetMetricMetadataQuery>);

    const { result } = renderHook(
      () =>
        useLineChartMetricCharacteristics({
          metricKey: MetricKey.bugs,
          type: DashboardMetricType.Raw,
        }),
      { wrapper },
    );

    expect(result.current.actualMetricKey).toBe(MetricKey.bugs);
    expect(result.current.measureFilters).toBeUndefined();
    expect(result.current.metricMetadata?.type).toBe(MetricType.Integer);
    expect(result.current.isMetricData).toBe(false);
    expect(result.current.isMetricNumeric).toBe(true);
    expect(result.current.isMetricRating).toBe(false);
  });

  it('exposes measure filters for rich metrics', () => {
    mockUseWidgetMetricMetadataQuery.mockReturnValue({
      data: {
        [MetricKey.open_issues]: {
          key: MetricKey.open_issues,
          name: 'Open issues',
          type: MetricType.Integer,
        },
      },
      isPending: false,
    } as unknown as ReturnType<typeof useWidgetMetricMetadataQuery>);

    const measureFilters = { issueStatus: IssueStatus.Open };
    const { result } = renderHook(
      () =>
        useLineChartMetricCharacteristics({
          measureFilters,
          metricKey: RichMetricKey.Issues,
          type: DashboardMetricType.Rich,
        }),
      { wrapper },
    );

    expect(result.current.actualMetricKey).toBe(MetricKey.open_issues);
    expect(result.current.measureFilters).toEqual(measureFilters);
    expect(result.current.metricMetadata?.key).toBe(MetricKey.open_issues);
  });

  it('returns neutral characteristics when an issue-resolution metric has no raw metric key', () => {
    mockUseWidgetMetricMetadataQuery.mockReturnValue({
      data: {},
      isPending: false,
    } as unknown as ReturnType<typeof useWidgetMetricMetadataQuery>);

    const { result } = renderHook(
      () =>
        useLineChartMetricCharacteristics({
          statistic: IssueResolutionStatistic.MTTR,
          type: DashboardMetricType.IssueResolution,
        }),
      { wrapper },
    );

    expect(result.current).toEqual({
      actualMetricKey: undefined,
      isMetricData: false,
      isMetricNumeric: false,
      isMetricRating: false,
      measureFilters: undefined,
      metricMetadata: undefined,
    });
  });
});
