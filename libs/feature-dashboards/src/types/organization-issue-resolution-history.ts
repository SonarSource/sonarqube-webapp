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

import {
  IssueResolutionStatistic,
  type IssueSeverity,
  type IssueType,
  type OrganizationIssueImpactQueryValue,
  type IssueHistoryDay,
  type DashboardEntityType,
} from '~shared/types/dashboard-history';

/** Dimension axes supported by the issue-resolution-history slice API. */
type IssueResolutionSliceBy = 'SEVERITY' | 'SOFTWARE_QUALITY' | 'TYPE';

/** Response shape for `GET /organizations/issue-resolution-history`. */
export interface IssueResolutionHistoryResponse {
  issueResolutionHistory: IssueHistoryDay[];
  statistic: IssueResolutionStatistic;
}

export interface GetIssueResolutionHistoryParams {
  /** Inclusive end of range. Omit to default to now (recommended — avoids SONARCLOUD-ZJ3). */
  endDate?: string;
  entityId: string;
  entityType: DashboardEntityType;
  impacts?: OrganizationIssueImpactQueryValue[];
  issueTypes?: IssueType[];
  severities?: IssueSeverity[];
  /** Dimension to slice results by. Omit for a single aggregated series. */
  sliceBy?: IssueResolutionSliceBy;
  /** ISO 8601 datetime. May not be more than 1 year in the past. */
  startDate: string;
  statistic: IssueResolutionStatistic;
}
