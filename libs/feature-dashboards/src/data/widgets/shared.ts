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
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';

export type Position = {
  x: number;
  y: number;
};

export type Dimensions = {
  height: number;
  width: number;
};

export type DashboardSpecVersion = 0;

export const LATEST_DASHBOARD_SPEC_VERSION: DashboardSpecVersion = 0;

export type DashboardWidgetSpec<Key extends string, Props> = {
  key: Key;
  fromVersion: Record<DashboardSpecVersion, GenericSchema<unknown, Props>>;
  editBehavior: WidgetEditBehavior<Props>;
};

export type WidgetEditBehavior<WidgetProps> = {
  defaultProps: Partial<WidgetProps>;
  defaultSize: Dimensions;
  maxSize: Dimensions;
  minSize: Dimensions;
};

export function createDashboardWidgetSpec<Key extends string, Props>(
  key: Key,
  propsSchema: GenericSchema<unknown, Props>,
  editBehavior: WidgetEditBehavior<Props>,
): DashboardWidgetSpec<Key, Props> {
  return {
    key,
    fromVersion: { 0: propsSchema },
    editBehavior,
  };
}

export const positionSchema = v.object({
  x: v.number(),
  y: v.number(),
}) satisfies GenericSchema<unknown, Position>;

export const dimensionsSchema = v.object({
  height: v.number(),
  width: v.number(),
}) satisfies GenericSchema<unknown, Dimensions>;

export enum IssueStatus {
  Open = 'OPEN',
  Accepted = 'ACCEPTED',
  FalsePositive = 'FALSE_POSITIVE',
}

export interface MeasureFilters {
  impactSeverities?: SoftwareImpactSeverity[];
  impactSoftwareQuality?: SoftwareQuality;
  issueStatus?: IssueStatus;
}

const measureFiltersSchema = v.object({
  impactSeverities: v.optional(v.array(v.enum(SoftwareImpactSeverity))),
  impactSoftwareQuality: v.optional(v.enum(SoftwareQuality)),
  issueStatus: v.optional(v.enum(IssueStatus)),
}) satisfies GenericSchema<unknown, MeasureFilters>;

export enum DashboardMetricType {
  Raw = 'raw', // Traditional metrics, directly reflected in backend (e.g. violations, coverage, etc.)
  Rich = 'rich', // "Enriched" metrics, supporting advanced filtering
  IssueResolution = 'issueResolution', // Issue resolution metrics (MTTR, RECENT_MTTR, RESOLVED_ISSUES)
  IssueDensity = 'issueDensity', // Issue density metric (issues per 1K LOC), backed by issue-density-history API
  ScaResolution = 'scaResolution', // SCA resolution metric backed by the SCA resolution history API
}

export enum RichMetricKey {
  Hotspots = 'hotspotCount',
  Issues = 'issueCount',
  Lines = 'lineCount',
  Projects = 'projectCount',
}

type RawMetric = {
  metricKey: MetricKey;
  type: DashboardMetricType.Raw;
};

type RichMetric = {
  measureFilters?: MeasureFilters;
  metricKey: RichMetricKey;
  type: DashboardMetricType.Rich;
};

type IssueResolutionMetric = {
  measureFilters?: Pick<MeasureFilters, 'impactSeverities' | 'impactSoftwareQuality'>;
  statistic: IssueResolutionStatistic;
  type: DashboardMetricType.IssueResolution;
};

type IssueDensityMetric = {
  measureFilters?: Pick<MeasureFilters, 'impactSeverities' | 'impactSoftwareQuality'>;
  type: DashboardMetricType.IssueDensity;
};

type ScaResolutionMetric = {
  measureFilters?: Pick<MeasureFilters, 'impactSeverities'>;
  type: DashboardMetricType.ScaResolution;
};

export type DashboardMetric =
  RawMetric | RichMetric | IssueResolutionMetric | IssueDensityMetric | ScaResolutionMetric;

const rawMetricSchema = v.object({
  metricKey: v.enum(MetricKey),
  type: v.literal(DashboardMetricType.Raw),
}) satisfies GenericSchema<unknown, RawMetric>;

const richMetricSchema = v.object({
  measureFilters: v.optional(measureFiltersSchema),
  metricKey: v.enum(RichMetricKey),
  type: v.literal(DashboardMetricType.Rich),
}) satisfies GenericSchema<unknown, RichMetric>;

const issueResolutionMeasureFiltersSchema = v.optional(
  v.object({
    impactSeverities: v.optional(v.array(v.enum(SoftwareImpactSeverity))),
    impactSoftwareQuality: v.optional(v.enum(SoftwareQuality)),
  }),
);

const issueResolutionMetricSchema = v.object({
  measureFilters: issueResolutionMeasureFiltersSchema,
  statistic: v.enum(IssueResolutionStatistic),
  type: v.literal(DashboardMetricType.IssueResolution),
}) satisfies GenericSchema<unknown, IssueResolutionMetric>;

const issueDensityMetricSchema = v.object({
  measureFilters: v.optional(
    v.object({
      impactSeverities: v.optional(v.array(v.enum(SoftwareImpactSeverity))),
      impactSoftwareQuality: v.optional(v.enum(SoftwareQuality)),
    }),
  ),
  type: v.literal(DashboardMetricType.IssueDensity),
}) satisfies GenericSchema<unknown, IssueDensityMetric>;

const scaResolutionMetricSchema = v.object({
  measureFilters: v.optional(
    v.object({
      impactSeverities: v.optional(v.array(v.enum(SoftwareImpactSeverity))),
    }),
  ),
  type: v.literal(DashboardMetricType.ScaResolution),
}) satisfies GenericSchema<unknown, ScaResolutionMetric>;

export const dashboardMetricSchema = v.variant('type', [
  rawMetricSchema,
  richMetricSchema,
  issueResolutionMetricSchema,
  issueDensityMetricSchema,
  scaResolutionMetricSchema,
]) satisfies GenericSchema<unknown, DashboardMetric>;
