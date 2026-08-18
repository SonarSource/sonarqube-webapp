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

import * as v from 'valibot';
import { GenericSchema } from 'valibot';
import { PieChartPastry } from '../../types/visualization';
import {
  pieChartEditBehavior,
  pieChartPropsSchema,
  type Props as PieChartProps,
} from './pie-chart';
import {
  createDashboardWidgetSpec,
  type DashboardWidgetSpec,
  type WidgetEditBehavior,
} from './shared';

const key = 'donutChart' as const;

export type Props = PieChartProps & {
  pastry: PieChartPastry.Donut;
};

const propsSchema = v.object({
  ...pieChartPropsSchema,
  pastry: v.literal(PieChartPastry.Donut),
}) satisfies GenericSchema<unknown, Props>;

const editBehavior: WidgetEditBehavior<Props> = pieChartEditBehavior;

export const spec: DashboardWidgetSpec<typeof key, Props> = createDashboardWidgetSpec(
  key,
  propsSchema,
  editBehavior,
);
