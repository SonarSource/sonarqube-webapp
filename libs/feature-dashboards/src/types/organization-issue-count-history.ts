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

import { type SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';

/**
 * Request-side shapes for the organizations issue-count-history endpoint
 * (`GET /organizations/issue-count-history`) and shared enums used by both portfolio and project
 * line charts. Kept here (rather than in `~api/portfolio-dashboard`) so dashboard helpers can
 * consume them without depending on the API module.
 */

export type EntityType = 'PORTFOLIO' | 'PROJECT_BRANCH';

export type IssueCountSliceBy = 'RULE_KEY' | 'SEVERITY' | 'SOFTWARE_QUALITY' | 'STATUS' | 'TYPE';

export type IssueType = 'BUG' | 'CODE_SMELL' | 'SECURITY_HOTSPOT' | 'VULNERABILITY';

export type IssueSeverity = `${SoftwareImpactSeverity}`;

/**
 * Organizations issue-count APIs `statuses` query param (`IssueCountStatus` on the backend).
 * For security hotspots, reviewed outcomes are `FIXED` and `SAFE`
 */
export type IssueCountStatus =
  'ACCEPTED' | 'CONFIRMED' | 'FALSE_POSITIVE' | 'FIXED' | 'OPEN' | 'SAFE' | 'TO_REVIEW';

/** Code-issue statuses for organization issue-count-history when slicing by STATUS (excludes hotspot-only values). */
export const ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE: readonly IssueCountStatus[] =
  ['OPEN', 'CONFIRMED', 'ACCEPTED', 'FALSE_POSITIVE', 'FIXED'];

/**
 * Organizations API `impacts` query param: `{SoftwareQuality}:{Severity}` (see
 * `SoftwareQualityImpact.parse` in sonarcloud-organizations). Used by
 * `/organizations/issue-count-history` and `/organizations/project-issue-counts`.
 *
 * @example "MAINTAINABILITY:LOW", "SECURITY:HIGH"
 */
export type OrganizationIssueImpactQueryValue = `${SoftwareQuality}:${IssueSeverity}`;

/** Security hotspots only — same filter as portfolio hotspot pie charts and their drilldowns. */
export const PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES: readonly IssueType[] = ['SECURITY_HOTSPOT'];

export const ORGANIZATION_ISSUE_COUNT_STATUSES: readonly IssueCountStatus[] = [
  'ACCEPTED',
  'CONFIRMED',
  'FALSE_POSITIVE',
  'FIXED',
  'OPEN',
  'SAFE',
  'TO_REVIEW',
];

/** Severities stored on organizations issue-count dimensions (matches `IssueCountSeverity` in sonarcloud-organizations). */
export const ORGANIZATION_ISSUE_COUNT_SEVERITIES: readonly IssueSeverity[] = [
  'BLOCKER',
  'HIGH',
  'MEDIUM',
  'LOW',
  'INFO',
];

export interface GetIssueCountHistoryParams {
  /** Inclusive end of range. Omit for full history from startDate; set equal to a narrow window (e.g. same UTC day as startDate) to fetch a single snapshot. */
  endDate?: string;
  entityId: string;
  entityType: EntityType;
  impacts?: OrganizationIssueImpactQueryValue[];
  /**
   * Organizations API `issueTypes` query param (Micronaut list). Serialized as a comma-separated
   * list (e.g. `BUG,CODE_SMELL,VULNERABILITY`) for API gateway compatibility.
   */
  issueTypes?: IssueType[];
  ruleKeys?: string[];
  /**
   * Organizations API `severities` query param (comma-separated list: BLOCKER, HIGH, MEDIUM, LOW,
   * INFO). Use when filtering by severity alone without `impacts` (e.g. severity-only measure
   * filters).
   */
  severities?: IssueSeverity[];
  sliceBy?: IssueCountSliceBy;
  /** ISO 8601 datetime, e.g. "2026-01-01T00:00:00Z". May not be more than 1 year in the past. */
  startDate: string;
  /** Serialized as the organizations API `statuses` query param (comma-separated). */
  statuses?: IssueCountStatus[];
}

/** Logical issue-count-history params without date fields; snapshot dates are applied by query hooks. */
export type IssueCountSnapshotParams = Omit<GetIssueCountHistoryParams, 'startDate' | 'endDate'>;
