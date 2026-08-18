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
import { MetricKey } from '~shared/types/metrics';
import { MeasureFilters, RichMetricKey } from '../types/dashboard-widget';
import {
  GetIssueCountHistoryParams,
  IssueCountStatus,
  IssueSeverity,
  ORGANIZATION_ISSUE_COUNT_SEVERITIES,
  ORGANIZATION_ISSUE_COUNT_STATUSES,
  PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES,
} from '../types/organization-issue-count-history';
import { buildMeasureFilterParams } from './measureFilters';
import {
  organizationIssueImpactQueryValuesForSoftwareQualities,
  PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS,
} from './organizationIssueCountHistoryUtils';

function parseCsvValues(value: string | undefined): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

function normalizeSoftwareQualityToken(quality: string): string {
  return quality.trim().toUpperCase();
}

// Software-quality issue metrics: history uses `impacts` only; adding legacy `issueTypes` diverges from issues search.
const ISSUE_HISTORY_SOFTWARE_QUALITY_BY_METRIC_KEY: Partial<Record<MetricKey, SoftwareQuality>> = {
  [MetricKey.security_issues]: SoftwareQuality.Security,
  [MetricKey.software_quality_security_issues]: SoftwareQuality.Security,
  [MetricKey.new_security_issues]: SoftwareQuality.Security,
  [MetricKey.new_software_quality_security_issues]: SoftwareQuality.Security,
  [MetricKey.reliability_issues]: SoftwareQuality.Reliability,
  [MetricKey.software_quality_reliability_issues]: SoftwareQuality.Reliability,
  [MetricKey.new_reliability_issues]: SoftwareQuality.Reliability,
  [MetricKey.new_software_quality_reliability_issues]: SoftwareQuality.Reliability,
  [MetricKey.maintainability_issues]: SoftwareQuality.Maintainability,
  [MetricKey.software_quality_maintainability_issues]: SoftwareQuality.Maintainability,
  [MetricKey.new_maintainability_issues]: SoftwareQuality.Maintainability,
  [MetricKey.new_software_quality_maintainability_issues]: SoftwareQuality.Maintainability,
};

function issueHistoryImpactsForSoftwareQualityMetricKey(
  metricKey: MetricKey,
): Pick<GetIssueCountHistoryParams, 'impacts'> | null {
  const softwareQuality = ISSUE_HISTORY_SOFTWARE_QUALITY_BY_METRIC_KEY[metricKey];
  if (softwareQuality === undefined) {
    return null;
  }

  return {
    impacts: organizationIssueImpactQueryValuesForSoftwareQualities([softwareQuality]),
  };
}

function getIssueHistoryStatusExtra(
  issueStatuses: string | undefined,
): Pick<GetIssueCountHistoryParams, 'statuses'> {
  if (!issueStatuses || issueStatuses.includes(',')) {
    return {};
  }

  const normalizedStatus = issueStatuses.trim().toUpperCase();
  if (!ORGANIZATION_ISSUE_COUNT_STATUSES.includes(normalizedStatus as IssueCountStatus)) {
    return {};
  }

  return { statuses: [normalizedStatus as IssueCountStatus] };
}

/** Build `impacts` from filter CSVs (`impactSoftwareQualities`, optional `impactSeverities`). */
function getIssueHistoryImpactsFromSoftwareQualityFilter(
  impactSoftwareQualities: string | undefined,
  severities: IssueSeverity[],
): Pick<GetIssueCountHistoryParams, 'impacts'> {
  if (!impactSoftwareQualities) {
    return {};
  }

  const qualities = parseCsvValues(impactSoftwareQualities).map(normalizeSoftwareQualityToken);
  if (qualities.length === 0) {
    return {};
  }

  return {
    impacts: organizationIssueImpactQueryValuesForSoftwareQualities(
      qualities as SoftwareQuality[],
      severities.length > 0 ? severities : ORGANIZATION_ISSUE_COUNT_SEVERITIES,
    ),
  };
}

export function issueHistoryQueryExtras(
  measureFilters: MeasureFilters | undefined,
  richMetricKey?: RichMetricKey,
  resolvedIssueMetricKey?: MetricKey,
): Pick<GetIssueCountHistoryParams, 'impacts' | 'issueTypes' | 'severities' | 'statuses'> {
  const fp = buildMeasureFilterParams(measureFilters);
  const severities = parseCsvValues(fp.impactSeverities) as IssueSeverity[];
  const extras: Pick<
    GetIssueCountHistoryParams,
    'impacts' | 'issueTypes' | 'severities' | 'statuses'
  > = {
    ...getIssueHistoryImpactsFromSoftwareQualityFilter(fp.impactSoftwareQualities, severities),
    ...getIssueHistoryStatusExtra(fp.issueStatuses),
  };

  if (extras.impacts === undefined && !fp.impactSoftwareQualities && severities.length > 0) {
    extras.impacts = organizationIssueImpactQueryValuesForSoftwareQualities(
      [SoftwareQuality.Security, SoftwareQuality.Reliability, SoftwareQuality.Maintainability],
      severities,
    );
  }

  if (richMetricKey === RichMetricKey.Hotspots) {
    extras.issueTypes = [...PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES];
  }

  if (extras.impacts === undefined && resolvedIssueMetricKey !== undefined) {
    const inferred = issueHistoryImpactsForSoftwareQualityMetricKey(resolvedIssueMetricKey);
    if (inferred !== null) {
      Object.assign(extras, inferred);
    }
  }

  if (
    richMetricKey !== RichMetricKey.Hotspots &&
    extras.impacts === undefined &&
    (extras.issueTypes === undefined || extras.issueTypes.length === 0)
  ) {
    extras.impacts = [...PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS];
  }

  // No explicit status: OPEN only so history matches dashboard totals (not multi-status STATUS slices).
  if (
    richMetricKey !== RichMetricKey.Hotspots &&
    (extras.statuses === undefined || extras.statuses.length === 0)
  ) {
    extras.statuses = ['OPEN'];
  }

  return extras;
}
