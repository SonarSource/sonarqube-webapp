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

import { render } from '@testing-library/react';
import { useDashboardProjectContext } from '~adapters/context/dashboardContext';
import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import { DashboardMetricType } from '../../../data/widgets/shared';
import { CodeScope } from '../../../types/widget-common';
import { DashboardMeasureLineChart } from '../DashboardMeasureLineChart';
import { ProjectLineChartWidgetWrapper } from '../ProjectLineChartWidgetWrapper';

jest.mock('~adapters/context/dashboardContext');
jest.mock('../DashboardMeasureLineChart', () => ({
  DashboardMeasureLineChart: jest.fn(() => <div data-testid="line-chart" />),
}));

describe('ProjectLineChartWidgetWrapper', () => {
  it('converts persisted widget props for the unified chart', () => {
    const measure = {
      api: 'measures-history' as const,
      metricKey: MetricKey.coverage,
      scope: CodeScope.Overall,
    };
    jest.mocked(useDashboardProjectContext).mockReturnValue({
      componentKey: 'project',
      isLoading: false,
      organization: 'org',
      projectEntityId: 'branch',
    });

    render(
      <ProjectLineChartWidgetWrapper
        groupBy={LineChartGroupBy.None}
        historyRange={HistoryRange.Last6Months}
        metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
        scope={CodeScope.Overall}
        showLegend
      />,
    );

    expect(DashboardMeasureLineChart).toHaveBeenCalledWith(
      {
        entityId: 'branch',
        entityType: 'PROJECT_BRANCH',
        measure,
        metric: { metricKey: MetricKey.coverage, type: DashboardMetricType.Raw },
        months: 6,
        organization: 'org',
        showLegend: true,
      },
      undefined,
    );
  });
});
