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
import { MetricKey } from '~shared/types/metrics';
import { OLD_TO_NEW_TAXONOMY_METRICS_MAP, SOFTWARE_QUALITY_RATING_METRICS_MAP } from './constants';

type IssueType = 'BUG' | 'CODE_SMELL' | 'VULNERABILITY';

interface IssueHistoryFilters {
  impacts?: string[];
  issueTypes?: string[];
  severities?: string[];
  statuses?: string[];
}

const CODE_ISSUE_TYPES: readonly IssueType[] = ['BUG', 'CODE_SMELL', 'VULNERABILITY'];

const ISSUE_TYPE_BY_SOFTWARE_QUALITY: Record<SoftwareQuality, IssueType> = {
  [SoftwareQuality.Maintainability]: 'CODE_SMELL',
  [SoftwareQuality.Reliability]: 'BUG',
  [SoftwareQuality.Security]: 'VULNERABILITY',
};

const SOFTWARE_QUALITY_BY_ISSUE_METRIC: Partial<Record<MetricKey, SoftwareQuality>> = {
  [MetricKey.bugs]: SoftwareQuality.Reliability,
  [MetricKey.code_smells]: SoftwareQuality.Maintainability,
  [MetricKey.maintainability_issues]: SoftwareQuality.Maintainability,
  [MetricKey.reliability_issues]: SoftwareQuality.Reliability,
  [MetricKey.security_issues]: SoftwareQuality.Security,
  [MetricKey.software_quality_maintainability_issues]: SoftwareQuality.Maintainability,
  [MetricKey.software_quality_reliability_issues]: SoftwareQuality.Reliability,
  [MetricKey.software_quality_security_issues]: SoftwareQuality.Security,
  [MetricKey.vulnerabilities]: SoftwareQuality.Security,
};

const STANDARD_SEVERITY_BY_IMPACT_SEVERITY: Record<SoftwareImpactSeverity, IssueSeverity> = {
  [SoftwareImpactSeverity.Blocker]: IssueSeverity.Blocker,
  [SoftwareImpactSeverity.High]: IssueSeverity.Critical,
  [SoftwareImpactSeverity.Medium]: IssueSeverity.Major,
  [SoftwareImpactSeverity.Low]: IssueSeverity.Minor,
  [SoftwareImpactSeverity.Info]: IssueSeverity.Info,
};

const SOFTWARE_QUALITY_BY_STANDARD_ISSUE_TYPE: Record<IssueType, SoftwareQuality> = {
  BUG: SoftwareQuality.Reliability,
  CODE_SMELL: SoftwareQuality.Maintainability,
  VULNERABILITY: SoftwareQuality.Security,
};

const IMPACT_SEVERITY_BY_STANDARD_SEVERITY: Record<IssueSeverity, SoftwareImpactSeverity> = {
  [IssueSeverity.Blocker]: SoftwareImpactSeverity.Blocker,
  [IssueSeverity.Critical]: SoftwareImpactSeverity.High,
  [IssueSeverity.Major]: SoftwareImpactSeverity.Medium,
  [IssueSeverity.Minor]: SoftwareImpactSeverity.Low,
  [IssueSeverity.Info]: SoftwareImpactSeverity.Info,
};

const STANDARD_METRIC_BY_MQR_METRIC: Readonly<Record<string, string>> = Object.fromEntries(
  [
    ...Object.entries(SOFTWARE_QUALITY_RATING_METRICS_MAP),
    ...Object.entries(OLD_TO_NEW_TAXONOMY_METRICS_MAP),
  ].map(([standardMetric, mqrMetric]) => [mqrMetric, standardMetric]),
);

export function resolvePortfolioDashboardMetricKey(
  metricKey: string,
  isStandardMode: boolean,
): string {
  const serverHistoryMetricKey =
    metricKey === MetricKey.releasability_status_distribution
      ? MetricKey.releasability_rating_distribution
      : metricKey;
  const canonicalStandardMetricKey =
    STANDARD_METRIC_BY_MQR_METRIC[serverHistoryMetricKey] ?? serverHistoryMetricKey;
  const standardMetricKey =
    canonicalStandardMetricKey === MetricKey.maintainability_rating
      ? MetricKey.sqale_rating
      : canonicalStandardMetricKey;

  return isStandardMode
    ? standardMetricKey
    : (SOFTWARE_QUALITY_RATING_METRICS_MAP[standardMetricKey] ??
        OLD_TO_NEW_TAXONOMY_METRICS_MAP[standardMetricKey as MetricKey] ??
        standardMetricKey);
}

export function resolvePortfolioDashboardMetricKeys(
  metricKeys: string[],
  isStandardMode: boolean,
): string[] {
  return metricKeys.map((metricKey) =>
    resolvePortfolioDashboardMetricKey(metricKey, isStandardMode),
  );
}

export function resolveIssueSoftwareQuality(
  softwareQuality: string | undefined,
  metricKey?: MetricKey,
): SoftwareQuality | undefined {
  if (
    softwareQuality &&
    Object.values(SoftwareQuality).includes(softwareQuality as SoftwareQuality)
  ) {
    return softwareQuality as SoftwareQuality;
  }
  return metricKey === undefined ? undefined : SOFTWARE_QUALITY_BY_ISSUE_METRIC[metricKey];
}

export function resolvePieChartFilterSoftwareQuality(filter: string): SoftwareQuality | undefined {
  switch (filter) {
    case 'maintainability':
      return SoftwareQuality.Maintainability;
    case 'reliability':
      return SoftwareQuality.Reliability;
    case 'security':
      return SoftwareQuality.Security;
    default:
      return undefined;
  }
}

export function resolveIssueHistoryFiltersForMode(
  mqrFilters: Readonly<IssueHistoryFilters>,
  options: Readonly<{
    isStandardMode: boolean;
    severities?: SoftwareImpactSeverity[];
    softwareQuality?: SoftwareQuality;
  }>,
): IssueHistoryFilters {
  if (!options.isStandardMode) {
    return { ...mqrFilters };
  }

  const { impacts: _impacts, ...sharedFilters } = mqrFilters;
  return {
    ...sharedFilters,
    issueTypes: options.softwareQuality
      ? [ISSUE_TYPE_BY_SOFTWARE_QUALITY[options.softwareQuality]]
      : [...CODE_ISSUE_TYPES],
    ...(options.severities?.length
      ? {
          severities: options.severities.map(
            (severity) => STANDARD_SEVERITY_BY_IMPACT_SEVERITY[severity],
          ),
        }
      : {}),
  };
}

export function resolveIssueHistorySliceForMode(
  sliceBy: string | undefined,
  isStandardMode: boolean,
): string | undefined {
  return isStandardMode && sliceBy === 'SOFTWARE_QUALITY' ? 'TYPE' : sliceBy;
}

export function resolveIssueHistoryDistributionKeyForMode(
  key: string,
  canonicalSliceBy: string | undefined,
  isStandardMode: boolean,
): string {
  if (!isStandardMode) {
    return key;
  }
  if (canonicalSliceBy === 'SOFTWARE_QUALITY' && key in SOFTWARE_QUALITY_BY_STANDARD_ISSUE_TYPE) {
    return SOFTWARE_QUALITY_BY_STANDARD_ISSUE_TYPE[key as IssueType];
  }
  if (canonicalSliceBy === 'SEVERITY' && key in IMPACT_SEVERITY_BY_STANDARD_SEVERITY) {
    return IMPACT_SEVERITY_BY_STANDARD_SEVERITY[key as IssueSeverity];
  }
  return key;
}
