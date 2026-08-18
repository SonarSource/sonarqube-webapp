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
import {
  organizationLineChartRequestKey,
  useOrganizationLineChartSeriesData,
} from '~adapters/queries/line-chart-widget-data';
import { useDashboardRuleLabels } from '~adapters/queries/widget-rule-metadata';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import { DashboardMetricType } from '../../../data/widgets/shared';
import { useLineChartMetricCharacteristics } from '../../../hooks/useLineChartMetricCharacteristics';
import { CodeScope } from '../../../types/widget-common';
import { useProjectLineChartModelOrganizations } from '../projectLineChartOrganizationsModel';

jest.mock('~adapters/queries/line-chart-widget-data', () => ({
  organizationLineChartRequestKey: jest.fn(() => 'request-key'),
  useOrganizationLineChartSeriesData: jest.fn(),
}));

jest.mock('~adapters/queries/widget-rule-metadata', () => ({
  useDashboardRuleLabels: jest.fn(),
}));

jest.mock('~feature-dashboards/hooks/useLineChartMetricCharacteristics', () => ({
  useLineChartMetricCharacteristics: jest.fn(),
}));

const contextWrapper = getContextWrapper();
const metric = { metricKey: MetricKey.bugs, type: DashboardMetricType.Raw } as const;
const widgetProps = {
  groupBy: LineChartGroupBy.None,
  historyRange: HistoryRange.LastMonth,
  metric,
  scope: CodeScope.Overall,
};

beforeEach(() => {
  jest.mocked(useLineChartMetricCharacteristics).mockReturnValue({
    actualMetricKey: MetricKey.bugs,
    isMetricRating: false,
    measureFilters: undefined,
    metricMetadata: { key: MetricKey.bugs, name: 'Bugs', type: MetricType.Integer },
  } as ReturnType<typeof useLineChartMetricCharacteristics>);
  jest.mocked(useOrganizationLineChartSeriesData).mockReturnValue({
    isMeasuresHistoryPending: false,
    lineChartHasFetchError: false,
    series: [{ color: '#000', data: [{ x: 1, y: 7 }], id: 'total', label: 'Bugs' }],
  });
  jest.mocked(useDashboardRuleLabels).mockReturnValue({
    isError: false,
    isPending: false,
    organization: 'my-org',
    rulesByKey: {},
  });
});

describe('useProjectLineChartModelOrganizations', () => {
  it('requests project-branch series through the adapter', () => {
    const { result } = renderHook(
      () => useProjectLineChartModelOrganizations('branch-id', 'my-org', widgetProps),
      { wrapper: contextWrapper },
    );

    expect(organizationLineChartRequestKey).toHaveBeenCalledWith(
      metric,
      CodeScope.Overall,
      MetricKey.bugs,
    );
    expect(useOrganizationLineChartSeriesData).toHaveBeenCalledWith(
      expect.objectContaining({
        actualMetricKey: MetricKey.bugs,
        entityId: 'branch-id',
        entityType: 'PROJECT_BRANCH',
        measuresHistoryKey: 'request-key',
        queriesEnabled: true,
      }),
    );
    expect(result.current.series[0]?.data[0]?.y).toBe(7);
    expect(result.current.metricName).toBe('Bugs');
  });

  it('combines adapter loading and error states with rule metadata', () => {
    jest.mocked(useOrganizationLineChartSeriesData).mockReturnValue({
      isMeasuresHistoryPending: true,
      lineChartHasFetchError: false,
      series: [],
    });
    jest.mocked(useDashboardRuleLabels).mockReturnValue({
      isError: true,
      isPending: false,
      organization: 'my-org',
      rulesByKey: {},
    });

    const { result } = renderHook(
      () => useProjectLineChartModelOrganizations('branch-id', 'my-org', widgetProps),
      { wrapper: contextWrapper },
    );

    expect(result.current.hasFetchError).toBe(true);
    expect(result.current.isPending).toBe(true);
  });
});
