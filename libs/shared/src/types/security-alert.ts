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

import { SoftwareImpactSeverity } from './clean-code-taxonomy';

export enum SecurityAlertStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}

export enum SecurityAlertType {
  DEPENDENCY_RISK = 'DEPENDENCY_RISK',
}

export enum SecurityAlertSortField {
  FIRST_DETECTED_AT = 'FIRST_DETECTED_AT',
  LAST_DETECTED_AT = 'LAST_DETECTED_AT',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface SecurityAlertBranchScaRisk {
  packageEcosystem: string;
  packageName: string;
  packageVersion: string;
  riskId: string;
}

export interface SecurityAlertBranch {
  branchId: string;
  branchKey: string | null;
  isMain: boolean;
  firstDetectedAt: string;
  lastDetectedAt: string;
  projectId: string;
  projectKey: string;
  projectName: string;
  reachabilityAnalyzed: boolean | null;
  scaRisks: SecurityAlertBranchScaRisk[];
  severity: SoftwareImpactSeverity | null;
  status: SecurityAlertStatus;
}

export interface SecurityAlertCweInfo {
  code: string;
  name: string | null;
}

interface SecurityAlertScaIssue {
  cwes: SecurityAlertCweInfo[];
  issueType: string;
  packageUrl: string | null;
  riskId: string | null;
  scaIssueUuid: string;
  vulnerabilityId: string | null;
}

export interface SecurityAlert {
  affectedBranches: SecurityAlertBranch[];
  affectedAuthorizedBranchesTotal: number;
  alertType: SecurityAlertType;
  firstDetectedAt: string;
  id: string;
  lastDetectedAt: string;
  scaIssue: SecurityAlertScaIssue | null;
  severity: SoftwareImpactSeverity | null;
  status: SecurityAlertStatus;
}

interface SecurityAlertPage {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface SecurityAlertSearchResponse {
  page: SecurityAlertPage;
  securityAlerts: SecurityAlert[];
}

export interface SecurityAlertSearchParams {
  alertTypes?: SecurityAlertType[];
  direction?: SortDirection;
  pageIndex?: number;
  pageSize?: number;
  sort?: SecurityAlertSortField;
  statuses?: SecurityAlertStatus[];
}
