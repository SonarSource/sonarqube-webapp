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

import { axiosClient } from '~shared/helpers/axios-clients';
import type { Paging } from '~shared/types/paging';
import { serializeStringArray } from '../helpers/query';

const ISSUE_COUNT_HISTORY_ENDPOINT = '/api/v2/history/issue-count-history';
const MEASURES_HISTORY_ENDPOINT = '/api/v2/history/measures-history';
const PROJECT_ISSUE_COUNTS_ENDPOINT = '/api/v2/history/project-issue-counts';
const PROJECT_MEASURES_ENDPOINT = '/api/v2/history/project-measures';

type DashboardEntityType = 'PORTFOLIO' | 'PROJECT_BRANCH';
type DashboardProjectCollectionEntityType = 'APPLICATION' | 'PORTFOLIO';

interface DashboardProjectCollectionSelector {
  entityId: string;
  entityType: DashboardProjectCollectionEntityType;
}

interface DashboardIssueHistoryDistribution {
  key?: string | null;
  value?: number | null;
}

export interface DashboardIssueHistoryDay {
  date?: string | null;
  distribution?: DashboardIssueHistoryDistribution[];
}

export interface DashboardIssueCountHistoryResponse {
  issueCountHistory?: DashboardIssueHistoryDay[];
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

function serializeIssueHistoryParams(params: DashboardIssueHistoryParams) {
  return {
    ...params,
    impacts: serializeStringArray(params.impacts ?? []),
    issueTypes: serializeStringArray(params.issueTypes ?? []),
    ruleKeys: serializeStringArray(params.ruleKeys ?? []),
    severities: serializeStringArray(params.severities ?? []),
    statuses: serializeStringArray(params.statuses ?? []),
  };
}

export function getDashboardIssueCountHistory(
  params: DashboardIssueHistoryParams,
): Promise<DashboardIssueCountHistoryResponse> {
  return axiosClient.get<DashboardIssueCountHistoryResponse>(ISSUE_COUNT_HISTORY_ENDPOINT, {
    params: serializeIssueHistoryParams(params),
  });
}

export function getDashboardMeasuresHistory(
  params: DashboardMeasuresHistoryParams,
): Promise<DashboardMeasuresHistoryResponse> {
  return axiosClient.get<DashboardMeasuresHistoryResponse>(MEASURES_HISTORY_ENDPOINT, {
    params: {
      ...params,
      metricKeys: serializeStringArray(params.metricKeys),
    },
  });
}

export function getDashboardProjectIssueCounts(
  params: DashboardProjectIssueCountsParams,
): Promise<DashboardProjectIssueCountsResponse> {
  return axiosClient.get<DashboardProjectIssueCountsResponse>(PROJECT_ISSUE_COUNTS_ENDPOINT, {
    params: {
      ...params,
      impacts: serializeStringArray(params.impacts ?? []),
      issueTypes: serializeStringArray(params.issueTypes ?? []),
      ruleKeys: serializeStringArray(params.ruleKeys ?? []),
      severities: serializeStringArray(params.severities ?? []),
      sort: serializeStringArray(params.sort ?? []),
      statuses: serializeStringArray(params.statuses ?? []),
    },
  });
}

export function getDashboardProjectMeasures(
  params: DashboardProjectMeasuresParams,
): Promise<DashboardProjectMeasuresResponse> {
  return axiosClient.get<DashboardProjectMeasuresResponse>(PROJECT_MEASURES_ENDPOINT, {
    params: {
      ...params,
      sort: serializeStringArray(params.sort ?? []),
    },
  });
}
