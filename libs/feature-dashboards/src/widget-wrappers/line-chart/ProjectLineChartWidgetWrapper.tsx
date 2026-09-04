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

import { useDashboardProjectContext } from '~adapters/context/dashboardContext';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { dashboardMetricToMeasure } from '../../data/dashboard-measure';
import type { Props } from '../../data/widgets/line-chart';
import { historyRangeToMonths } from '../../utils/datetime';
import { DashboardMeasureLineChart } from './DashboardMeasureLineChart';

export function ProjectLineChartWidgetWrapper(props: Readonly<Props>) {
  const { isLoading, organization, projectEntityId } = useDashboardProjectContext();
  if (isLoading) {
    return <WidgetLoadingSpinner />;
  }
  if (!projectEntityId) {
    return <WidgetNoData />;
  }

  return (
    <DashboardMeasureLineChart
      entityId={projectEntityId}
      entityType="PROJECT_BRANCH"
      measure={dashboardMetricToMeasure(props.metric, props.scope, { groupBy: props.groupBy })}
      metric={props.metric}
      months={historyRangeToMonths(props.historyRange)}
      organization={organization}
      showLegend={props.showLegend}
    />
  );
}
