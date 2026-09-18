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

import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { IssueSeverity } from '~shared/types/issues';

const STANDARD_ISSUE_TYPE_BY_SOFTWARE_QUALITY: Record<SoftwareQuality, string> = {
  [SoftwareQuality.Security]: 'VULNERABILITY',
  [SoftwareQuality.Reliability]: 'BUG',
  [SoftwareQuality.Maintainability]: 'CODE_SMELL',
};

const STANDARD_SEVERITY_BY_IMPACT_SEVERITY: Record<SoftwareImpactSeverity, IssueSeverity> = {
  [SoftwareImpactSeverity.Blocker]: IssueSeverity.Blocker,
  [SoftwareImpactSeverity.High]: IssueSeverity.Critical,
  [SoftwareImpactSeverity.Medium]: IssueSeverity.Major,
  [SoftwareImpactSeverity.Low]: IssueSeverity.Minor,
  [SoftwareImpactSeverity.Info]: IssueSeverity.Info,
};

export function getIssueFilterTypeLabelMessageId(isStandardMode: boolean): string {
  return isStandardMode
    ? 'issues.facet.types'
    : 'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label';
}

export function getIssueFilterTypeValueMessageId(
  softwareQuality: SoftwareQuality,
  isStandardMode: boolean,
): string {
  return isStandardMode
    ? `issue.type.${STANDARD_ISSUE_TYPE_BY_SOFTWARE_QUALITY[softwareQuality]}.plural`
    : `software_quality.${softwareQuality}`;
}

export function getIssueFilterSeverityValueMessageId(
  severity: SoftwareImpactSeverity,
  isStandardMode: boolean,
): string {
  return isStandardMode
    ? `severity.${STANDARD_SEVERITY_BY_IMPACT_SEVERITY[severity]}`
    : `severity.${severity}`;
}
