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
import { getDashboardLocalizedMetricName } from '~adapters/helpers/l10n';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import { DashboardMetricType, RichMetricKey } from '../../../types/dashboard-widget';
import { CodeScope, TopListLimit, TopListRankBy } from '../../../types/widget-common';
import { TopListWidgetHeader, WidgetHeader } from '../WidgetHeader';

describe('WidgetHeader', () => {
  it('renders a metric title override and its code scope', () => {
    renderWithRouter(
      <WidgetHeader
        metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
        scope={CodeScope.Overall}
        titleOverride="Custom widget title"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Custom widget title' })).toBeInTheDocument();
    expect(screen.getByTestId('widget-filter-line')).toHaveTextContent(
      'dashboard_widget.codescope.overall',
    );
  });

  it('renders an over-time metric title and group-by filter', () => {
    renderWithRouter(
      <WidgetHeader
        groupBy={LineChartGroupBy.Severity}
        historyRange={HistoryRange.Last3Months}
        metric={{ metricKey: MetricKey.violations, type: DashboardMetricType.Raw }}
        scope={CodeScope.New}
      />,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('dashboard.widget.title.over_time');
    expect(screen.getByTestId('widget-filter-line')).toHaveTextContent(
      'dashboard_widget.codescope.new · dashboard.line_chart.group_by.label: dashboard.line_chart.group_by.severity',
    );
  });

  it('renders the product-specific title for a rich issue count', () => {
    renderWithRouter(
      <WidgetHeader
        metric={{ metricKey: RichMetricKey.Issues, type: DashboardMetricType.Rich }}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.getByRole('heading')).toHaveTextContent(
      getDashboardLocalizedMetricName({ key: MetricKey.issues }),
    );
  });

  it('renders rating and top-list titles', () => {
    const { rerender } = renderWithRouter(
      <WidgetHeader metricKey={MetricKey.reliability_rating} scope={CodeScope.New} />,
    );

    expect(screen.getByRole('heading')).toHaveTextContent(MetricKey.reliability_rating);
    expect(screen.getByTestId('widget-filter-line')).toHaveTextContent(
      'dashboard_widget.codescope.new',
    );

    rerender(
      <TopListWidgetHeader
        limit={TopListLimit.Five}
        metric={{ metricKey: MetricKey.violations, type: DashboardMetricType.Raw }}
        rankBy={TopListRankBy.Rule}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('dashboard.top_list.widget_title');
  });
});
