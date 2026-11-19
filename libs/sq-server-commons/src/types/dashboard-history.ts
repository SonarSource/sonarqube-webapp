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
  GetMeasuresHistoryData,
  GetProjectMeasuresData,
  IssueResolutionHistoryResponse,
} from '~sq-server-openapi-community';
import type { DashboardEntityType } from '~shared/types/dashboard-history';
import type { ProjectCollectionEntityType } from '~shared/types/dashboard-context';

interface DashboardProjectCollectionSelector {
  entityId: string;
  entityType: ProjectCollectionEntityType;
}

interface DashboardScaResolutionDistribution {
  key: string;
  value: number;
}

interface DashboardScaResolutionHistoryDay {
  date: string | null;
  distribution: DashboardScaResolutionDistribution[];
}

export interface DashboardScaResolutionHistoryResponse {
  scaResolutionHistory: DashboardScaResolutionHistoryDay[];
  statistic: 'SCA_MTTR';
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
  statistic: IssueResolutionHistoryResponse['statistic'];
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

export type DashboardMeasuresHistoryParams = GetMeasuresHistoryData['query'];

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

export type DashboardProjectMeasuresParams = GetProjectMeasuresData['query'];
