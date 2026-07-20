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

import { MetricKey, MetricType } from '../types/metrics';

export interface MeasureDescriptor {
  labelKey: string;
  metricKey: MetricKey;
  metricRatingKey?: MetricKey;
  metricType: MetricType;
}

export interface MQRMetricKeys {
  security: MetricKey;
  reliability: MetricKey;
  maintainability: MetricKey;
  newSecurity: MetricKey;
  newReliability: MetricKey;
  newMaintainability: MetricKey;
}

const DEFAULT_MQR_KEYS: MQRMetricKeys = {
  security: MetricKey.software_quality_security_issues,
  reliability: MetricKey.software_quality_reliability_issues,
  maintainability: MetricKey.software_quality_maintainability_issues,
  newSecurity: MetricKey.new_software_quality_security_issues,
  newReliability: MetricKey.new_software_quality_reliability_issues,
  newMaintainability: MetricKey.new_software_quality_maintainability_issues,
};

const CLOUD_MQR_KEYS: MQRMetricKeys = {
  security: MetricKey.security_issues,
  reliability: MetricKey.reliability_issues,
  maintainability: MetricKey.maintainability_issues,
  newSecurity: MetricKey.new_security_issues,
  newReliability: MetricKey.new_reliability_issues,
  newMaintainability: MetricKey.new_maintainability_issues,
};

// Label map for server (uses "description" for new violations, standard l10n keys for hotspots/SCA)
const SERVER_LABEL_KEY_MAP: Partial<Record<MetricKey, string>> = {
  [MetricKey.vulnerabilities]: 'metric.vulnerabilities.short_name',
  [MetricKey.software_quality_security_issues]:
    'metric.software_quality_security_issues.short_name',
  [MetricKey.bugs]: 'metric.bugs.short_name',
  [MetricKey.software_quality_reliability_issues]:
    'metric.software_quality_reliability_issues.short_name',
  [MetricKey.code_smells]: 'metric.code_smells.short_name',
  [MetricKey.software_quality_maintainability_issues]:
    'metric.software_quality_maintainability_issues.short_name',
  [MetricKey.new_violations]: 'metric.new_violations.description',
  [MetricKey.security_hotspots_reviewed]: 'projects.security_hotspots_reviewed',
  [MetricKey.new_security_hotspots_reviewed]: 'projects.security_hotspots_reviewed',
  [MetricKey.sca_count_any_issue]: 'dependencies.risks',
  [MetricKey.new_sca_count_any_issue]: 'dependencies.risks',
} as const;

// Label map for cloud (uses "short_name" for all labels, preserving original cloud behavior)
// standard metrics should default to their corresponding MQR metrics
const CLOUD_LABEL_KEY_MAP: Partial<Record<MetricKey, string>> = {
  [MetricKey.vulnerabilities]: 'metric.security_issues.short_name',
  [MetricKey.security_issues]: 'metric.security_issues.short_name',
  [MetricKey.bugs]: 'metric.reliability_issues.short_name',
  [MetricKey.reliability_issues]: 'metric.reliability_issues.short_name',
  [MetricKey.code_smells]: 'metric.maintainability_issues.short_name',
  [MetricKey.maintainability_issues]: 'metric.maintainability_issues.short_name',
  [MetricKey.new_violations]: 'metric.new_violations.short_name',
  [MetricKey.security_hotspots_reviewed]: 'metric.security_hotspots_reviewed.short_name',
  [MetricKey.new_security_hotspots_reviewed]: 'metric.new_security_hotspots_reviewed.short_name',
  [MetricKey.sca_count_any_issue]: 'metric.sca_count_any_issue.short_name',
  [MetricKey.new_sca_count_any_issue]: 'metric.new_sca_count_any_issue.short_name',
} as const;

/**
 * Returns an ordered list of measure descriptors for a project card.
 * Coverage and duplication are excluded — they use different visual
 * components in cloud vs. server and are rendered separately by each caller.
 */
export function getProjectCardMeasureList({
  isNewCode,
  measures,
  isStandardMode = false,
  isScaEnabled = false,
  mqrKeys = DEFAULT_MQR_KEYS,
  labelKeyMap = SERVER_LABEL_KEY_MAP,
}: {
  isNewCode: boolean;
  isScaEnabled?: boolean;
  isStandardMode?: boolean;
  measures: Record<string, string | undefined>;
  mqrKeys?: MQRMetricKeys;
  labelKeyMap?: Partial<Record<MetricKey, string>>;
}): MeasureDescriptor[] {
  const result: MeasureDescriptor[] = [];

  if (isNewCode) {
    const newViolationsMetricKey = MetricKey.new_violations;
    result.push({
      labelKey: getLabelKey(newViolationsMetricKey, labelKeyMap),
      metricKey: newViolationsMetricKey,
      metricType: MetricType.ShortInteger,
    });
  } else {
    result.push(...buildOverallMeasures(isStandardMode, measures, mqrKeys, labelKeyMap));
  }

  // Security hotspots reviewed
  const securityHotspotsMetricKey = isNewCode
    ? MetricKey.new_security_hotspots_reviewed
    : MetricKey.security_hotspots_reviewed;
  result.push({
    labelKey: getLabelKey(securityHotspotsMetricKey, labelKeyMap),
    metricKey: securityHotspotsMetricKey,
    metricRatingKey: isNewCode
      ? MetricKey.new_security_review_rating
      : MetricKey.security_review_rating,
    metricType: MetricType.Percent,
  });

  // SCA dependency risks
  if (isScaEnabled) {
    const scaMetricKey = isNewCode
      ? MetricKey.new_sca_count_any_issue
      : MetricKey.sca_count_any_issue;
    result.push({
      labelKey: getLabelKey(scaMetricKey, labelKeyMap),
      metricKey: scaMetricKey,
      metricRatingKey: isNewCode
        ? MetricKey.new_sca_rating_any_issue
        : MetricKey.sca_rating_any_issue,
      metricType: MetricType.ShortInteger,
    });
  }

  return result;
}

/**
 * Safely retrieves a label key from the label map.
 * Falls back to the raw metric key string if not found in the map.
 */
function getLabelKey(
  metricKey: MetricKey,
  labelKeyMap: Partial<Record<MetricKey, string>>,
): string {
  return labelKeyMap[metricKey] ?? metricKey;
}

/**
 * Builds measure descriptors for overall code measures (non-new-code mode).
 */
function buildOverallMeasures(
  isStandardMode: boolean,
  measures: Record<string, string | undefined>,
  mqrKeys: MQRMetricKeys,
  labelKeyMap: Partial<Record<MetricKey, string>>,
): MeasureDescriptor[] {
  const result: MeasureDescriptor[] = [];
  const useMqr = !isStandardMode;

  // Security
  const securityMqrKey = mqrKeys.security;
  const securityMetricKey =
    useMqr && measures[securityMqrKey] !== undefined ? securityMqrKey : MetricKey.vulnerabilities;
  result.push({
    labelKey: getLabelKey(securityMetricKey, labelKeyMap),
    metricKey: securityMetricKey,
    metricRatingKey: MetricKey.security_rating,
    metricType: MetricType.ShortInteger,
  });

  // Reliability
  const reliabilityMqrKey = mqrKeys.reliability;
  const reliabilityMetricKey =
    useMqr && measures[reliabilityMqrKey] !== undefined ? reliabilityMqrKey : MetricKey.bugs;
  result.push({
    labelKey: getLabelKey(reliabilityMetricKey, labelKeyMap),
    metricKey: reliabilityMetricKey,
    metricRatingKey: MetricKey.reliability_rating,
    metricType: MetricType.ShortInteger,
  });

  // Maintainability
  const maintainabilityMqrKey = mqrKeys.maintainability;
  const maintainabilityMetricKey =
    useMqr && measures[maintainabilityMqrKey] !== undefined
      ? maintainabilityMqrKey
      : MetricKey.code_smells;
  result.push({
    labelKey: getLabelKey(maintainabilityMetricKey, labelKeyMap),
    metricKey: maintainabilityMetricKey,
    metricRatingKey: MetricKey.sqale_rating,
    metricType: MetricType.ShortInteger,
  });

  return result;
}

// Export for cloud component convenience
export { CLOUD_LABEL_KEY_MAP, CLOUD_MQR_KEYS };
