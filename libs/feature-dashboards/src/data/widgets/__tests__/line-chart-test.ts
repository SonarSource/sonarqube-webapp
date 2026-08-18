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

import { parse } from 'valibot';
import { MetricKey } from '~shared/types/metrics';
import { DashboardMetricType } from '../../../types/dashboard-widget';
import { CodeScope } from '../../../types/widget-common';
import { DEFAULT_LINE_CHART_GROUP_BY, HistoryRange, LineChartGroupBy, spec } from '../line-chart';
import { LATEST_DASHBOARD_SPEC_VERSION } from '../shared';

describe('lineChart schema', () => {
  const baseProps = {
    historyRange: HistoryRange.LastMonth,
    metric: { metricKey: MetricKey.bugs, type: DashboardMetricType.Raw },
    scope: CodeScope.Overall,
  };

  it('fills in the default groupBy when omitted from input', () => {
    const output = parse(spec.fromVersion[LATEST_DASHBOARD_SPEC_VERSION], baseProps);

    expect(output.groupBy).toBe(DEFAULT_LINE_CHART_GROUP_BY);
  });

  it('preserves an explicit groupBy value', () => {
    const output = parse(spec.fromVersion[LATEST_DASHBOARD_SPEC_VERSION], {
      ...baseProps,
      groupBy: LineChartGroupBy.Severity,
    });

    expect(output.groupBy).toBe(LineChartGroupBy.Severity);
  });
});
