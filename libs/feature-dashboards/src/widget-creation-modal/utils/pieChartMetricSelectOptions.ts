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

import type { IntlShape } from 'react-intl';
import { PieChartMetric } from '../../types/dashboard-widget';
import type { PieChartMetricSelectOption } from '../../types/widget-common';

type FormatMessage = IntlShape['formatMessage'];

/** Pie/donut "metric" select (issue / hotspot / line count) — shared by project and portfolio pickers. */
export function buildPieChartMetricSelectOptions(
  formatMessage: FormatMessage,
): PieChartMetricSelectOption[] {
  return [
    {
      value: PieChartMetric.IssueCount,
      label: formatMessage({
        id: 'dashboard.add_widget_modal.define_widget.metric.issue_count',
      }),
    },
    {
      value: PieChartMetric.HotspotCount,
      label: formatMessage({
        id: 'dashboard.add_widget_modal.define_widget.metric.security_hotspot_count',
      }),
    },
    {
      value: PieChartMetric.LineCount,
      label: formatMessage({
        id: 'dashboard.add_widget_modal.define_widget.metric.line_count',
      }),
    },
  ];
}

/** Portfolio pie/donut metrics: base options plus project count (quality gate distribution). */
export function buildPortfolioPieChartMetricSelectOptions(
  formatMessage: FormatMessage,
): PieChartMetricSelectOption[] {
  return [
    ...buildPieChartMetricSelectOptions(formatMessage),
    {
      value: PieChartMetric.ProjectCount,
      label: formatMessage({
        id: 'dashboard.add_widget_modal.define_widget.metric.project_count',
      }),
    },
  ];
}
