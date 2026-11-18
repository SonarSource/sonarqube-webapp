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
import { serializeStringArray } from '../helpers/query';
import type {
  DashboardIssueHistoryDay,
  DashboardIssueCountHistoryResponse,
  DashboardIssueDensityHistoryResponse,
  DashboardIssueResolutionHistoryResponse,
  DashboardScaResolutionHistoryResponse,
  DashboardMeasureHistoryDay,
  DashboardMeasuresHistoryResponse,
  DashboardIssueHistoryParams,
  DashboardIssueResolutionHistoryParams,
  DashboardScaResolutionHistoryParams,
  DashboardMeasuresHistoryParams,
  DashboardProjectIssueCountsResponse,
  DashboardProjectIssueCountsParams,
  DashboardProjectMeasuresResponse,
  DashboardProjectMeasuresParams,
} from '../types/dashboard-history';

const ISSUE_COUNT_HISTORY_ENDPOINT = '/api/v2/history/issue-count-history';
const ISSUE_DENSITY_HISTORY_ENDPOINT = '/api/v2/history/issue-density-history';
const ISSUE_RESOLUTION_HISTORY_ENDPOINT = '/api/v2/history/issue-resolution-history';
const SCA_RESOLUTION_HISTORY_ENDPOINT = '/api/v2/history/sca-resolution-history';
const MEASURES_HISTORY_ENDPOINT = '/api/v2/history/measures-history';
const PROJECT_ISSUE_COUNTS_ENDPOINT = '/api/v2/history/project-issue-counts';
const PROJECT_MEASURES_ENDPOINT = '/api/v2/history/project-measures';

function serializeIssueHistoryParams(params: DashboardIssueHistoryParams) {
  return {
    ...params,
    impacts: serializeStringArray(params.impacts ?? []),
    issueTypes: serializeStringArray(params.issueTypes ?? []),
    ruleKeys: serializeStringArray(params.ruleKeys ?? []),
    severities: serializeStringArray(params.severities ?? []),
    statuses: serializeStringArray(params.statuses ?? []),
    typeSeverities: serializeStringArray(params.typeSeverities ?? []),
  };
}

function normalizeIssueHistory(history: DashboardIssueHistoryDay[] | undefined) {
  return (history ?? []).flatMap((day) =>
    day.date
      ? [
          {
            date: day.date,
            distribution: (day.distribution ?? []).flatMap((entry) =>
              entry.key != null && entry.value != null
                ? [{ key: entry.key, value: entry.value }]
                : [],
            ),
          },
        ]
      : [],
  );
}

function normalizeMeasuresHistory(history: DashboardMeasureHistoryDay[] | undefined) {
  return (history ?? []).flatMap((day) =>
    day.date
      ? [
          {
            date: day.date,
            measures: (day.measures ?? []).flatMap((entry) =>
              entry.metric != null && entry.value != null
                ? [{ metric: entry.metric, type: entry.type ?? '', value: entry.value }]
                : [],
            ),
          },
        ]
      : [],
  );
}

export function getDashboardIssueCountHistory(
  params: DashboardIssueHistoryParams,
): Promise<DashboardIssueCountHistoryResponse> {
  return axiosClient.get<DashboardIssueCountHistoryResponse>(ISSUE_COUNT_HISTORY_ENDPOINT, {
    params: serializeIssueHistoryParams(params),
  });
}

export function getDashboardIssueDensityHistory(
  params: DashboardIssueHistoryParams,
): Promise<DashboardIssueDensityHistoryResponse> {
  return axiosClient.get<DashboardIssueDensityHistoryResponse>(ISSUE_DENSITY_HISTORY_ENDPOINT, {
    params: serializeIssueHistoryParams(params),
  });
}

export function getDashboardIssueResolutionHistory(
  params: DashboardIssueResolutionHistoryParams,
): Promise<DashboardIssueResolutionHistoryResponse> {
  return axiosClient.get<DashboardIssueResolutionHistoryResponse>(
    ISSUE_RESOLUTION_HISTORY_ENDPOINT,
    { params: serializeIssueHistoryParams(params) },
  );
}

export function getDashboardScaResolutionHistory(
  params: DashboardScaResolutionHistoryParams,
): Promise<DashboardScaResolutionHistoryResponse> {
  return axiosClient.get<DashboardScaResolutionHistoryResponse>(SCA_RESOLUTION_HISTORY_ENDPOINT, {
    params: {
      ...params,
      severities: serializeStringArray(params.severities ?? []),
    },
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

export async function getDashboardIssueCountHistoryData(params: DashboardIssueHistoryParams) {
  return normalizeIssueHistory((await getDashboardIssueCountHistory(params)).issueCountHistory);
}

export async function getDashboardIssueDensityHistoryData(params: DashboardIssueHistoryParams) {
  return normalizeIssueHistory((await getDashboardIssueDensityHistory(params)).issueDensityHistory);
}

export async function getDashboardIssueResolutionHistoryData(
  params: DashboardIssueResolutionHistoryParams,
) {
  return normalizeIssueHistory(
    (await getDashboardIssueResolutionHistory(params)).issueResolutionHistory,
  );
}

export async function getDashboardScaResolutionHistoryData(
  params: DashboardScaResolutionHistoryParams,
) {
  return normalizeIssueHistory(
    (await getDashboardScaResolutionHistory(params)).scaResolutionHistory,
  );
}

export async function getDashboardMeasuresHistoryData(params: DashboardMeasuresHistoryParams) {
  return normalizeMeasuresHistory((await getDashboardMeasuresHistory(params)).measuresHistory);
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
      typeSeverities: serializeStringArray(params.typeSeverities ?? []),
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
