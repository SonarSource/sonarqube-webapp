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

import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import {
  ORGANIZATION_ISSUE_COUNT_SEVERITIES,
  type IssueSeverity,
  type OrganizationIssueImpactQueryValue,
} from '../types/organization-issue-count-history';

/**
 * Builds `impacts` values for the organizations API from software qualities (OR semantics: any
 * listed quality:severity pair may match).
 */
export function organizationIssueImpactQueryValuesForSoftwareQualities(
  qualities: readonly SoftwareQuality[],
  severities: readonly IssueSeverity[] = ORGANIZATION_ISSUE_COUNT_SEVERITIES,
): OrganizationIssueImpactQueryValue[] {
  const out: OrganizationIssueImpactQueryValue[] = [];
  for (const quality of qualities) {
    for (const severity of severities) {
      out.push(`${quality}:${severity}`);
    }
  }
  return out;
}

export const PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS: readonly OrganizationIssueImpactQueryValue[] =
  organizationIssueImpactQueryValuesForSoftwareQualities([
    SoftwareQuality.Security,
    SoftwareQuality.Reliability,
    SoftwareQuality.Maintainability,
  ]);
