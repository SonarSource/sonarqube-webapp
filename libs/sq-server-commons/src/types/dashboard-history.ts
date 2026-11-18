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

import type {
  DashboardEntityType,
  IssueResolutionStatistic,
} from '~shared/types/dashboard-history';
import type { ProjectCollectionEntityType } from '~shared/types/dashboard-context';
import type { Paging } from '~shared/types/paging';

interface DashboardProjectCollectionSelector {
  entityId: string;
  entityType: ProjectCollectionEntityType;
}

interface DashboardIssueHistoryDistribution {
  key?: string | null;
  value?: number | null;
}

export interface DashboardIssueHistoryDay {
  date?: string | null;
  distribution?: DashboardIssueHistoryDistribution[];
}

interface DashboardScaResolutionDistribution {
  key: string;
  value: number;
}

interface DashboardScaResolutionHistoryDay {
  date: string | null;
  distribution: DashboardScaResolutionDistribution[];
}

export interface DashboardIssueCountHistoryResponse {
  issueCountHistory?: DashboardIssueHistoryDay[];
}

export interface DashboardIssueDensityHistoryResponse {
  issueDensityHistory?: DashboardIssueHistoryDay[];
}

export interface DashboardIssueResolutionHistoryResponse {
  issueResolutionHistory: DashboardIssueHistoryDay[];
  statistic: 'MTTR' | 'RECENT_MTTR' | 'RESOLVED_ISSUES';
}

export interface DashboardScaResolutionHistoryResponse {
  scaResolutionHistory: DashboardScaResolutionHistoryDay[];
  statistic: 'SCA_MTTR';
}

interface DashboardMeasureHistoryEntry {
  metric?: string | null;
  type?: string | null;
  value?: string | null;
}

export interface DashboardMeasureHistoryDay {
  date?: string | null;
  measures?: DashboardMeasureHistoryEntry[];
}

export interface DashboardMeasuresHistoryResponse {
  measuresHistory?: DashboardMeasureHistoryDay[];
}

export interface DashboardIssueHistoryParams {
  endDate?: string;
  entityId: string;
  entityType: DashboardEntityType;
  impacts?: string[];
  issueTypes?: string[];
  ruleKeys?: string[];
  severities?: string[];
  sliceBy?: string;
  startDate: string;
  statuses?: string[];
  typeSeverities?: string[];
}

export interface DashboardIssueResolutionHistoryParams extends DashboardIssueHistoryParams {
  statistic: `${IssueResolutionStatistic}`;
}

export interface DashboardScaResolutionHistoryParams {
  endDate?: string | null;
  entityId: string;
  entityType: DashboardEntityType;
  severities?: string[];
  sliceBy?: 'SEVERITY' | null;
  startDate: string;
  statistic: 'SCA_MTTR';
}

export interface DashboardMeasuresHistoryParams {
  endDate?: string;
  entityId: string;
  entityType: DashboardEntityType;
  metricKeys: string[];
  startDate: string;
}

interface DashboardProjectIssueCount {
  branchId: string;
  branchName?: string | null;
  issueCount: number;
  projectKey: string;
  projectName: string;
  referenceIssueCount?: number | null;
}

export interface DashboardProjectIssueCountsResponse {
  hiddenProjectCount: number;
  page: Paging;
  projectIssueCounts: DashboardProjectIssueCount[];
}

export type DashboardProjectIssueCountsParams = DashboardProjectCollectionSelector & {
  impacts?: string[];
  issueTypes?: string[];
  nameContains?: string;
  pageIndex?: number;
  pageSize?: number;
  referenceDate?: string;
  requireIssues?: boolean;
  ruleKeys?: string[];
  severities?: string[];
  sort?: string[];
  statuses?: string[];
  typeSeverities?: string[];
};

interface DashboardProjectMeasure {
  branchId: string;
  branchName?: string | null;
  measure: {
    currentValue?: string | null;
    metric: string;
    referenceValue?: string | null;
    type: string;
  };
  projectKey: string;
  projectName: string;
}

export interface DashboardProjectMeasuresResponse {
  hiddenProjectCount: number;
  page: Paging;
  projectMeasures: DashboardProjectMeasure[];
}

export type DashboardProjectMeasuresParams = DashboardProjectCollectionSelector & {
  metricKey: string;
  metricValue?: string;
  nameContains?: string;
  pageIndex?: number;
  pageSize?: number;
  referenceDate?: string;
  requireValue?: boolean;
  sort?: string[];
};

export interface NormalizedDashboardIssueHistoryDay {
  date: string;
  distribution: { key: string; value: number }[];
}

export interface NormalizedDashboardMeasuresHistoryDay {
  date: string;
  measures: { metric: string; type: string; value: string }[];
}

export interface NormalizedDashboardIssueCountHistoryResponse {
  issueCountHistory: NormalizedDashboardIssueHistoryDay[];
}

export interface NormalizedDashboardIssueDensityHistoryResponse {
  issueDensityHistory: NormalizedDashboardIssueHistoryDay[];
}

export interface NormalizedDashboardIssueResolutionHistoryResponse {
  issueResolutionHistory: NormalizedDashboardIssueHistoryDay[];
}

export interface NormalizedDashboardScaResolutionHistoryResponse {
  scaResolutionHistory: NormalizedDashboardIssueHistoryDay[];
}

export interface NormalizedDashboardMeasuresHistoryResponse {
  measuresHistory: NormalizedDashboardMeasuresHistoryDay[];
}
