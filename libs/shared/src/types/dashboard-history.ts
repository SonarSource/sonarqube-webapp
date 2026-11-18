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

import type { SoftwareImpactSeverity, SoftwareQuality } from './clean-code-taxonomy';
import type { IssueSeverity as StandardIssueSeverity } from './issues';
import type { MetricKey } from './metrics';

// 'APPLICATION' is only accepted by the SQS /api/v2/history/* endpoints.
// The SQC adapter must not forward it to /organizations/*-history until
// sonarcloud-organizations' EntityType enum gains an APPLICATION member.
export type DashboardEntityType = 'APPLICATION' | 'PORTFOLIO' | 'PROJECT_BRANCH';

export enum CodeScope {
  Overall = 'overall',
  New = 'new',
}

/**
 * Statistics available from the `/organizations/issue-resolution-history` API.
 * - `RESOLVED_ISSUES`: count of issues resolved in the period
 * - `MTTR`: mean time to resolve all issues (calendar minutes)
 * - `RECENT_MTTR`: mean time to resolve newly introduced issues (calendar minutes)
 */
export enum IssueResolutionStatistic {
  ResolvedIssues = 'RESOLVED_ISSUES',
  MTTR = 'MTTR',
  RecentMTTR = 'RECENT_MTTR',
}

export enum ScaResolutionStatistic {
  ScaMTTR = 'SCA_MTTR',
}

export type IssueCountSliceBy = 'RULE_KEY' | 'SEVERITY' | 'SOFTWARE_QUALITY' | 'STATUS' | 'TYPE';

export type IssueType = 'BUG' | 'CODE_SMELL' | 'SECURITY_HOTSPOT' | 'VULNERABILITY';

export type IssueSeverity = `${SoftwareImpactSeverity}`;

/**
 * Organizations issue-count APIs `statuses` query param (`IssueCountStatus` on the backend).
 * For security hotspots, reviewed outcomes are `FIXED` and `SAFE`
 */
export type IssueCountStatus =
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'FALSE_POSITIVE'
  | 'FIXED'
  | 'OPEN'
  | 'SAFE'
  | 'TO_REVIEW';

/**
 * Organizations API `impacts` query param: `{SoftwareQuality}:{Severity}` (see
 * `SoftwareQualityImpact.parse` in sonarcloud-organizations). Used by
 * `/organizations/issue-count-history` and `/organizations/project-issue-counts`.
 *
 * @example "MAINTAINABILITY:LOW", "SECURITY:HIGH"
 */
export type OrganizationIssueImpactQueryValue = `${SoftwareQuality}:${IssueSeverity}`;

interface IssueHistoryDistribution {
  /** Dimension value or `"all"` when no slice is applied. */
  key: string;
  value?: number;
}

export interface IssueHistoryDay {
  /** ISO-8601 date string. */
  date: string;
  distribution: IssueHistoryDistribution[];
}

export interface OrganizationsMeasuresHistoryDay {
  date: string;
  measures: {
    metric: string;
    /** Metric type as returned by the API (e.g. "percent", "rating") */
    type: string;
    value: string;
  }[];
}

export interface OrganizationsIssueCountHistoryDay {
  date: string;
  distribution: {
    key: string;
    value: number;
  }[];
}

export interface DashboardIssueFilters {
  impacts?: OrganizationIssueImpactQueryValue[];
  issueTypes?: IssueType[];
  ruleKeys?: string[];
  severities?: StandardIssueSeverity[];
  statuses?: IssueCountStatus[];
}

export type DashboardMeasure =
  | {
      api: 'measures-history';
      metricKey: MetricKey;
      scope: CodeScope;
    }
  | (DashboardIssueFilters & {
      api: 'issue-count-history';
      metricKey: MetricKey;
      sliceBy?: IssueCountSliceBy;
    })
  | (DashboardIssueFilters & {
      api: 'issue-resolution-history';
      statistic: IssueResolutionStatistic;
    })
  | (DashboardIssueFilters & {
      api: 'issue-density-history';
    })
  | {
      api: 'sca-resolution-history';
      severities?: SoftwareImpactSeverity[];
      statistic: ScaResolutionStatistic;
    };

export type DashboardMeasureHistory =
  | { api: 'issue-count-history'; history: IssueHistoryDay[] }
  | { api: 'issue-density-history'; history: IssueHistoryDay[] }
  | { api: 'issue-resolution-history'; history: IssueHistoryDay[] }
  | { api: 'measures-history'; history: OrganizationsMeasuresHistoryDay[] }
  | { api: 'sca-resolution-history'; history: IssueHistoryDay[] };

export interface DashboardMeasureQueryInput {
  entityId: string;
  entityType: DashboardEntityType;
  measure: DashboardMeasure;
  months?: number;
}

export interface DashboardMeasureQueryDefinition {
  queryFn: () => Promise<DashboardMeasureHistory>;
  queryKey: readonly ['dashboard-measure', DashboardEntityType, string, DashboardMeasure, number];
}
