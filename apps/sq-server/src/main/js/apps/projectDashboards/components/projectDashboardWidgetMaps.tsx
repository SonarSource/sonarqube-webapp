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

import { PieChartHeader } from '~feature-dashboards/components/pie-chart/PieChartHeader';
import {
  TopListWidgetHeader,
  WidgetHeader,
} from '~feature-dashboards/components/widget-header/WidgetHeader';
import { createModeAwareWidget } from '~feature-dashboards/dashboard-layout/logic/modeAwareWidget';
import type {
  WidgetBodyMap,
  WidgetHeaderMap,
} from '~feature-dashboards/dashboard-layout/logic/types';
import type { ProjectDashboardWidgetPropMap } from '~feature-dashboards/types/dashboard-widget';
import { ProjectCountWidgetWrapper } from '~feature-dashboards/widget-wrappers/count/ProjectCountWidgetWrapper';
import { ProjectLineChartWidgetWrapper } from '~feature-dashboards/widget-wrappers/line-chart/ProjectLineChartWidgetWrapper';
import { ProjectPieChartWidgetWrapper } from '~feature-dashboards/widget-wrappers/pie-chart/ProjectPieChartWidgetWrapper';
import { ProjectRatingBadgeWidgetWrapper } from '~feature-dashboards/widget-wrappers/rating-badge/ProjectRatingBadgeWidgetWrapper';
import { ProjectTopListWidgetWrapper } from '~feature-dashboards/widget-wrappers/top-list/ProjectTopListWidgetWrapper';

function createModeAwareBodyMap(
  isStandardMode: boolean,
): WidgetBodyMap<ProjectDashboardWidgetPropMap> {
  const modeAwarePieChart = createModeAwareWidget(ProjectPieChartWidgetWrapper, isStandardMode);
  const modeAwareLineChart = createModeAwareWidget(ProjectLineChartWidgetWrapper, isStandardMode);

  return {
    count: ProjectCountWidgetWrapper,
    donutChart: modeAwarePieChart,
    lineChart: modeAwareLineChart,
    pieChart: modeAwarePieChart,
    ratingBadge: ProjectRatingBadgeWidgetWrapper,
    topList: ProjectTopListWidgetWrapper,
  };
}

export const projectDashboardWidgetBodyMap = createModeAwareBodyMap(false);
export const standardProjectDashboardWidgetBodyMap = createModeAwareBodyMap(true);

function createModeAwareHeaderMap(
  isStandardMode: boolean,
): WidgetHeaderMap<ProjectDashboardWidgetPropMap> {
  const modeAwareWidgetHeader = createModeAwareWidget(WidgetHeader, isStandardMode);
  const modeAwarePieChartHeader = createModeAwareWidget(PieChartHeader, isStandardMode);
  const modeAwareTopListHeader = createModeAwareWidget(TopListWidgetHeader, isStandardMode);

  return {
    count: modeAwareWidgetHeader,
    donutChart: modeAwarePieChartHeader,
    lineChart: modeAwareWidgetHeader,
    pieChart: modeAwarePieChartHeader,
    ratingBadge: modeAwareWidgetHeader,
    topList: modeAwareTopListHeader,
  };
}

export const projectDashboardWidgetHeaderMap = createModeAwareHeaderMap(false);
export const standardProjectDashboardWidgetHeaderMap = createModeAwareHeaderMap(true);

export const projectDashboardWidgetMapsByMode = [
  {
    bodyMap: projectDashboardWidgetBodyMap,
    headerMap: projectDashboardWidgetHeaderMap,
  },
  {
    bodyMap: standardProjectDashboardWidgetBodyMap,
    headerMap: standardProjectDashboardWidgetHeaderMap,
  },
] as const;
