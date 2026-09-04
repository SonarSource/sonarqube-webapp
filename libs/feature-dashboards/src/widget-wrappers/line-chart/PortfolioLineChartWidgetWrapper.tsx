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

import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { dashboardMetricToMeasure } from '../../data/dashboard-measure';
import type { Props } from '../../data/widgets/line-chart';
import { historyRangeToMonths } from '../../utils/datetime';
import { PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE } from '../../utils/portfolioMeasures';
import { DashboardMeasureLineChart } from './DashboardMeasureLineChart';

export function PortfolioLineChartWidgetWrapper(props: Readonly<Props>) {
  const { portfolioId } = useDashboardPortfolioContext();
  return (
    <DashboardMeasureLineChart
      entityId={portfolioId}
      entityType="PORTFOLIO"
      measure={dashboardMetricToMeasure(props.metric, props.scope, {
        groupBy: props.groupBy,
        supportedNewCodeMetrics: PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE,
      })}
      metric={props.metric}
      months={historyRangeToMonths(props.historyRange)}
      showLegend={props.showLegend}
    />
  );
}
