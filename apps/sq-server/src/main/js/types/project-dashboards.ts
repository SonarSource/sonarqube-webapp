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

import type { DashboardInstance } from '~feature-dashboards/dashboard-layout/logic/types';
import type { DashboardType } from '~feature-dashboards/types/dashboard-list';
import type { ProjectDashboardWidgetPropMap } from '~feature-dashboards/types/dashboard-widget';

export type ProjectDashboardData = {
  createdAt?: number;
  createdById?: string;
  description: string;
  id: string;
  layout: DashboardInstance<ProjectDashboardWidgetPropMap>;
  name: string;
  type: DashboardType;
  updatedAt: number;
  updatedById?: string;
};

export type ProjectDashboardListItem = Omit<ProjectDashboardData, 'layout'>;
