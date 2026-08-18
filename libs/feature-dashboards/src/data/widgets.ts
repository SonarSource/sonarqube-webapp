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

import type { GenericSchema } from 'valibot';
import * as v from 'valibot';
import { spec as badgeWidgetSpec, type Props as BadgeWidgetProps } from './widgets/badge';
import { spec as countWidgetSpec, type Props as CountWidgetProps } from './widgets/count';
import {
  spec as donutChartWidgetSpec,
  type Props as DonutChartWidgetProps,
} from './widgets/donut-chart';
import {
  spec as lineChartWidgetSpec,
  type Props as LineChartWidgetProps,
} from './widgets/line-chart';
import { spec as pieChartWidgetSpec, type Props as PieChartWidgetProps } from './widgets/pie-chart';
import {
  dimensionsSchema,
  LATEST_DASHBOARD_SPEC_VERSION,
  positionSchema,
  WidgetEditBehavior,
  type DashboardSpecVersion,
  type DashboardWidgetSpec,
  type Dimensions,
  type Position,
} from './widgets/shared';
import { spec as topListWidgetSpec, type Props as TopListWidgetProps } from './widgets/top-list';

export { type Dimensions, type Position } from './widgets/shared';

export type WidgetEditBehaviorMap<WidgetPropMap extends {}> = {
  [K in keyof WidgetPropMap]: WidgetEditBehavior<WidgetPropMap[K]>;
};

export type DashboardWidgetPropMap = {
  [badgeWidgetSpec.key]: BadgeWidgetProps;
  [countWidgetSpec.key]: CountWidgetProps;
  [donutChartWidgetSpec.key]: DonutChartWidgetProps;
  [lineChartWidgetSpec.key]: LineChartWidgetProps;
  [pieChartWidgetSpec.key]: PieChartWidgetProps;
  [topListWidgetSpec.key]: TopListWidgetProps;
};

export const projectDashboardWidgetPropsSchemaByType = {
  [countWidgetSpec.key]: countWidgetSpec.fromVersion[LATEST_DASHBOARD_SPEC_VERSION],
  [donutChartWidgetSpec.key]: donutChartWidgetSpec.fromVersion[LATEST_DASHBOARD_SPEC_VERSION],
  [lineChartWidgetSpec.key]: lineChartWidgetSpec.fromVersion[LATEST_DASHBOARD_SPEC_VERSION],
  [pieChartWidgetSpec.key]: pieChartWidgetSpec.fromVersion[LATEST_DASHBOARD_SPEC_VERSION],
  [badgeWidgetSpec.key]: badgeWidgetSpec.fromVersion[LATEST_DASHBOARD_SPEC_VERSION],
  [topListWidgetSpec.key]: topListWidgetSpec.fromVersion[LATEST_DASHBOARD_SPEC_VERSION],
} as const satisfies {
  [K in keyof DashboardWidgetPropMap]: GenericSchema<unknown, DashboardWidgetPropMap[K]>;
};

export const widgetEditBehaviorMap = {
  [countWidgetSpec.key]: countWidgetSpec.editBehavior,
  [donutChartWidgetSpec.key]: donutChartWidgetSpec.editBehavior,
  [lineChartWidgetSpec.key]: lineChartWidgetSpec.editBehavior,
  [pieChartWidgetSpec.key]: pieChartWidgetSpec.editBehavior,
  [badgeWidgetSpec.key]: badgeWidgetSpec.editBehavior,
  [topListWidgetSpec.key]: topListWidgetSpec.editBehavior,
} as const satisfies WidgetEditBehaviorMap<DashboardWidgetPropMap>;

/** Fully specified widget props produced by the configure-widget modal; aligns with project/portfolio widget prop maps. */
export type CompleteWidgetConfig = {
  [K in keyof DashboardWidgetPropMap]: DashboardWidgetPropMap[K] & {
    widgetType: K;
  };
}[keyof DashboardWidgetPropMap];

type DashboardWidgetInstance = {
  [K in keyof DashboardWidgetPropMap]: {
    dimensions: Dimensions;
    key: string;
    position: Position;
    props: DashboardWidgetPropMap[K];
    type: K;
  };
}[keyof DashboardWidgetPropMap];

type DashboardWidgetInstanceForSpec<Key extends string, Props> = {
  dimensions: Dimensions;
  key: string;
  position: Position;
  props: Props;
  type: Key;
};

function createWidgetInstanceSchema<Key extends string, Props>(
  spec: DashboardWidgetSpec<Key, Props>,
  version: DashboardSpecVersion,
) {
  return v.object({
    dimensions: dimensionsSchema,
    key: v.string(),
    position: positionSchema,
    props: spec.fromVersion[version],
    type: v.literal(spec.key),
  }) satisfies GenericSchema<unknown, DashboardWidgetInstanceForSpec<Key, Props>>;
}

export function createDashboardWidgetInstanceSchema(version: DashboardSpecVersion) {
  return v.variant('type', [
    createWidgetInstanceSchema(countWidgetSpec, version),
    createWidgetInstanceSchema(donutChartWidgetSpec, version),
    createWidgetInstanceSchema(pieChartWidgetSpec, version),
    createWidgetInstanceSchema(lineChartWidgetSpec, version),
    createWidgetInstanceSchema(badgeWidgetSpec, version),
    createWidgetInstanceSchema(topListWidgetSpec, version),
  ]) satisfies GenericSchema<unknown, DashboardWidgetInstance>;
}
