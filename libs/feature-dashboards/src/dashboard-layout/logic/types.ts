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

import { createElement } from 'react';
import type { GenericSchema } from 'valibot';
import * as v from 'valibot';
import {
  createDashboardWidgetInstanceSchema,
  type Dimensions,
  type Position,
} from '../../data/widgets';
import {
  LATEST_DASHBOARD_SPEC_VERSION,
  type DashboardSpecVersion,
} from '../../data/widgets/shared';
import type { ProjectDashboardWidgetPropMap } from '../../types/dashboard-widget';

export type { Dimensions, Position };

/**
 * Widgets are the building blocks of a dashboard.
 * They know their type, size/position, and props.
 */
export type WidgetInstance<WidgetPropMap> = {
  [K in keyof WidgetPropMap]: {
    dimensions: Dimensions;
    key: string; // UUIDV4
    position: Position;
    props: WidgetPropMap[K];
    type: K;
  };
}[keyof WidgetPropMap];

export type ImplicitSectionInstance<WidgetPropMap> = {
  children: WidgetInstance<WidgetPropMap>[];
  type: 'implicit';
};

export type ExplicitSectionInstance<WidgetPropMap> = {
  children: WidgetInstance<WidgetPropMap>[];
  description: string;
  key: string; // UUIDV4
  name: string;
  type: 'explicit';
};

/**
 * Sections can be anonymous/implicit or named/explicit.
 * Only explicit sections can be manipulated directly, implicit sections are generated automatically and may be split/merged dynamically.
 *
 * Every section contains a list of widgets.
 */
export type SectionInstance<WidgetPropMap> =
  ImplicitSectionInstance<WidgetPropMap> | ExplicitSectionInstance<WidgetPropMap>;

function createDashboardSectionInstanceSchema(version: DashboardSpecVersion) {
  const widgetInstanceSchema = createDashboardWidgetInstanceSchema(version);
  const implicitSectionInstanceSchema = v.object({
    children: v.array(widgetInstanceSchema),
    type: v.literal('implicit'),
  }) satisfies GenericSchema<unknown, ImplicitSectionInstance<ProjectDashboardWidgetPropMap>>;
  const explicitSectionInstanceSchema = v.object({
    children: v.array(widgetInstanceSchema),
    description: v.string(),
    key: v.string(),
    name: v.string(),
    type: v.literal('explicit'),
  }) satisfies GenericSchema<unknown, ExplicitSectionInstance<ProjectDashboardWidgetPropMap>>;

  return v.variant('type', [
    implicitSectionInstanceSchema,
    explicitSectionInstanceSchema,
  ]) satisfies GenericSchema<unknown, SectionInstance<ProjectDashboardWidgetPropMap>>;
}

/**
 * Every dashboard contains a list of sections
 */
export type DashboardInstance<WidgetPropMap extends {}> = {
  version?: DashboardSpecVersion;
  children: SectionInstance<WidgetPropMap>[];
};

const dashboardVersionSchema = v.optional(v.literal(0), 0) satisfies GenericSchema<
  unknown,
  DashboardSpecVersion
>;
const dashboardVersionOnlySchema = v.object({ version: dashboardVersionSchema });

export function getDashboardSpecVersion(input: unknown): DashboardSpecVersion {
  const result = v.safeParse(dashboardVersionOnlySchema, input);
  return result.success ? result.output.version : 0;
}

/** Valibot schema for the dashboard root object in the layout JSON. */
export const dashboardInstanceSchema = v.lazy((input) => {
  const version = getDashboardSpecVersion(input);

  return v.pipe(
    v.object({
      version: dashboardVersionSchema,
      children: v.array(createDashboardSectionInstanceSchema(version)),
    }),
    v.transform((dashboard) => ({
      ...dashboard,
      version: LATEST_DASHBOARD_SPEC_VERSION,
    })),
  ) satisfies GenericSchema<unknown, DashboardInstance<ProjectDashboardWidgetPropMap>>;
});

export type WidgetComponentMap<WidgetPropMap extends {}> = {
  [K in keyof WidgetPropMap]: React.FC<WidgetPropMap[K]>;
};

export type WidgetHeaderMap<WidgetPropMap extends {}> = WidgetComponentMap<WidgetPropMap>;
export type WidgetBodyMap<WidgetPropMap extends {}> = WidgetComponentMap<WidgetPropMap>;

/**
 * Create a React element from a widget component map entry.
 *
 * TypeScript cannot track that `map[widget.type]` and `widget.props` refer to
 * the same variant of a discriminated union (the "correlated record" problem).
 * By binding `K` as a standalone type parameter, the compiler keeps both sides
 * unified, avoiding the need for `any`.
 */
export function createWidgetElement<WPM extends Record<string, {}>, K extends keyof WPM>(
  componentMap: WidgetComponentMap<WPM>,
  type: K,
  props: WPM[K],
) {
  return createElement(componentMap[type], props);
}

export type { WidgetEditBehaviorMap } from '../../data/widgets';
