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
import { CodeScope } from '../../types/widget-common';
import {
  createDashboardWidgetSpec,
  RichMetricKey,
  type DashboardWidgetSpec,
  type WidgetEditBehavior,
} from './shared';

const PIE_CHART_METRICS = [
  RichMetricKey.Issues,
  RichMetricKey.Hotspots,
  RichMetricKey.Lines,
  RichMetricKey.Projects,
] as const;

export type Metric = (typeof PIE_CHART_METRICS)[number];

/** Same string values as {@link RichMetricKey} — keeps existing `PieChartMetric.IssueCount` call sites. */
export const Metric = {
  IssueCount: RichMetricKey.Issues,
  HotspotCount: RichMetricKey.Hotspots,
  LineCount: RichMetricKey.Lines,
  ProjectCount: RichMetricKey.Projects,
} as const satisfies Record<string, Metric>;

const metricSchema = v.union([
  v.literal(RichMetricKey.Issues),
  v.literal(RichMetricKey.Hotspots),
  v.literal(RichMetricKey.Lines),
  v.literal(RichMetricKey.Projects),
]) satisfies GenericSchema<unknown, Metric>;

export enum IssueSlice {
  ImpactSoftwareQualities = 'impactSoftwareQualities',
  ImpactSeverities = 'impactSeverities',
  CleanCodeAttributeCategories = 'cleanCodeAttributeCategories',
  IssueStatuses = 'issueStatuses',
  Languages = 'languages',
  Rules = 'rules',
}

export enum IssueFilter {
  Security = 'security',
  Reliability = 'reliability',
  Maintainability = 'maintainability',
}

export enum HotspotSlice {
  ReviewPriority = 'reviewPriority',
  ReviewStatus = 'reviewStatus',
  SecurityCategory = 'securityCategory',
}

export enum HotspotFilter {
  Fixed = 'fixed',
  Safe = 'safe',
  ToReview = 'toReview',
}

export enum LineSlice {
  Language = 'language',
  Coverage = 'coverage',
  Duplications = 'duplications',
}

/** Slices for project-count pie/donut charts (portfolio quality gate distribution). */
export enum ProjectSlice {
  Status = 'status',
}

export type Slice = IssueSlice | HotspotSlice | LineSlice | ProjectSlice;

export type Filter = IssueFilter | HotspotFilter | '';

const filterSchema = v.union([
  v.literal(''),
  v.enum(IssueFilter),
  v.enum(HotspotFilter),
]) satisfies GenericSchema<unknown, Filter>;

const sliceSchema = v.union([
  v.enum(IssueSlice),
  v.enum(HotspotSlice),
  v.enum(LineSlice),
  v.enum(ProjectSlice),
]) satisfies GenericSchema<unknown, Slice>;

const key = 'pieChart' as const;

export const pieChartPropsSchema = {
  filter: filterSchema,
  metric: metricSchema,
  scope: v.enum(CodeScope),
  showLegend: v.boolean(),
  slice: sliceSchema,
};

export type Props = {
  filter: Filter;
  metric: Metric;
  pastry?: PieChartPastry;
  scope: CodeScope;
  showLegend: boolean;
  slice: Slice;
};

const propsSchema = v.object({
  ...pieChartPropsSchema,
  pastry: v.optional(v.enum(PieChartPastry)),
}) satisfies GenericSchema<unknown, Props>;

export const pieChartEditBehavior: WidgetEditBehavior<Pick<Props, 'scope' | 'showLegend'>> = {
  defaultProps: { scope: CodeScope.Overall, showLegend: true },
  defaultSize: { width: 6, height: 6 },
  minSize: { width: 4, height: 6 },
  maxSize: { width: 12, height: 8 },
};

export const spec: DashboardWidgetSpec<typeof key, Props> = createDashboardWidgetSpec<
  typeof key,
  Props
>(key, propsSchema, pieChartEditBehavior);
