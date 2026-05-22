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

import { useMemo } from 'react';
import { Metric } from '../types/measures';
import { MetricKey, MetricType } from '../types/metrics';
import {
  L10nMessageType,
  ReleaseRiskQuality,
  ReleaseRiskSeverity,
  ReleaseRiskType,
} from '../types/sca';

/**
 * TODO: Backend tech debt:
 * These levels are modeled in the DB as 5, 10, 15, 20, 25
 * In order to get the GreaterThanOrEqual operator, we need to subtract 1
 */
export const SCA_RISK_SEVERITY_METRIC_THRESHOLDS = {
  '4': ReleaseRiskSeverity.Info,
  '9': ReleaseRiskSeverity.Low,
  '14': ReleaseRiskSeverity.Medium,
  '19': ReleaseRiskSeverity.High,
  '24': ReleaseRiskSeverity.Blocker,
};

export type SCA_RISK_SEVERITY_METRIC_THRESHOLD_KEYS =
  keyof typeof SCA_RISK_SEVERITY_METRIC_THRESHOLDS;

/** HIGH risk is the only risk level for license related options. */
const SCA_LICENSE_RISK_SEVERITY_METRIC_THRESHOLDS = {
  '19': ReleaseRiskSeverity.High,
};

/** BLOCKER risk is the only risk level for malware related options. */
const SCA_MALWARE_RISK_SEVERITY_METRIC_THRESHOLDS = {
  '24': ReleaseRiskSeverity.Blocker,
};

export const SCA_RISK_SEVERITY_METRIC_VALUES = {
  '5': ReleaseRiskSeverity.Info,
  '10': ReleaseRiskSeverity.Low,
  '15': ReleaseRiskSeverity.Medium,
  '20': ReleaseRiskSeverity.High,
  '25': ReleaseRiskSeverity.Blocker,
};

export const RISK_SEVERITY_LABELS: Record<ReleaseRiskSeverity, L10nMessageType> = {
  [ReleaseRiskSeverity.Low]: 'severity_impact.LOW',
  [ReleaseRiskSeverity.Info]: 'severity_impact.INFO',
  [ReleaseRiskSeverity.Medium]: 'severity_impact.MEDIUM',
  [ReleaseRiskSeverity.High]: 'severity_impact.HIGH',
  [ReleaseRiskSeverity.Blocker]: 'severity_impact.BLOCKER',
};

export const RISK_TYPE_QUALITY_GATE_LABEL: Record<
  ReleaseRiskType | 'Any' | 'AnySecurity',
  L10nMessageType
> = {
  Any: 'sca.quality_gates.metric.sca_severity_any_issue',
  AnySecurity: 'sca.quality_gates.metric.sca_severity_any_security',
  [ReleaseRiskType.Vulnerability]: 'sca.quality_gates.metric.sca_severity_vulnerability',
  [ReleaseRiskType.ProhibitedLicense]: 'sca.quality_gates.metric.sca_severity_licensing',
  [ReleaseRiskType.Malware]: 'sca.quality_gates.metric.sca_severity_malware',
};

export const SCA_LICENSE_SEVERITY_RISK_METRIC_KEYS = [
  MetricKey.sca_severity_licensing,
  MetricKey.new_sca_severity_licensing,
] as string[];

export const SCA_MALWARE_SEVERITY_RISK_METRIC_KEYS = [
  MetricKey.sca_severity_malware,
  MetricKey.new_sca_severity_malware,
] as string[];

export function getScaRiskMetricThresholds(metricKey: string) {
  if (SCA_LICENSE_SEVERITY_RISK_METRIC_KEYS.includes(metricKey)) {
    return SCA_LICENSE_RISK_SEVERITY_METRIC_THRESHOLDS;
  }
  if (SCA_MALWARE_SEVERITY_RISK_METRIC_KEYS.includes(metricKey)) {
    return SCA_MALWARE_RISK_SEVERITY_METRIC_THRESHOLDS;
  }
  return SCA_RISK_SEVERITY_METRIC_THRESHOLDS;
}

/**
 * TODO: Backend tech debt:
 * These are the metrics keys for which the SCA_RISK_METRIC_OPTIONS apply
 * and that should have the MetricType.ScaRisk type.
 */
export const SCA_ISSUE_RISK_SEVERITY_METRICS: string[] = Object.values(MetricKey).filter(
  (k) => k.startsWith('sca_severity_') || k.startsWith('new_sca_severity_'),
);

export const SCA_ISSUE_RISK_RATING_METRICS: string[] = Object.values(MetricKey).filter(
  (k) => k.startsWith('sca_rating_') || k.startsWith('new_sca_rating_'),
);

export const SCA_ISSUE_RISK_COUNT_METRICS: string[] = Object.values(MetricKey).filter(
  (k) => k.startsWith('sca_count_') || k.startsWith('new_sca_count_'),
);

export const SCA_RISK_ALL_METRICS = [
  ...SCA_ISSUE_RISK_SEVERITY_METRICS,
  ...SCA_ISSUE_RISK_RATING_METRICS,
  ...SCA_ISSUE_RISK_COUNT_METRICS,
];

/**
 * Returns the dependency-risks URL filter params appropriate for a given SCA metric key,
 * derived from the metric key suffix. New metric keys are handled automatically without
 * needing to update a hardcoded map.
 */
export function getScaMetricUrlParams(metricKey: MetricKey): {
  qualities?: ReleaseRiskQuality;
  types?: ReleaseRiskType;
} {
  if (metricKey.endsWith('_any_security')) {
    return { qualities: ReleaseRiskQuality.Security };
  }
  if (metricKey.endsWith('_vulnerability')) {
    return { types: ReleaseRiskType.Vulnerability };
  }
  if (metricKey.endsWith('_licensing')) {
    return { types: ReleaseRiskType.ProhibitedLicense };
  }
  if (metricKey.endsWith('_malware')) {
    return { types: ReleaseRiskType.Malware };
  }
  return {};
}

/**
 * TODO: Backend tech debt:
 * Transform the condition operator `GT` to `GTE`
 * because backend does not support `GTE` natively.
 */
export function scaConditionOperator(metricKey: string) {
  if (SCA_ISSUE_RISK_SEVERITY_METRICS.includes(metricKey)) {
    return 'GTE';
  }
  return null;
}

/** Get severity enum values that are greater than or equal to a given value */
export function scaFilterConditionsBySeverity(threshold: string): ReleaseRiskSeverity[] {
  const intThreshold = parseInt(threshold, 10);
  return Object.entries(SCA_RISK_SEVERITY_METRIC_VALUES)
    .filter(([value]) => {
      return parseInt(value, 10) >= intThreshold;
    })
    .map(([_, severity]) => severity);
}

export function useScaOverviewMetrics(hasSca: boolean) {
  return useMemo(() => {
    if (hasSca) {
      return [
        MetricKey.sca_count_any_issue,
        MetricKey.sca_rating_any_issue,
        MetricKey.new_sca_count_any_issue,
        MetricKey.new_sca_rating_any_issue,
      ];
    }
    return [];
  }, [hasSca]);
}

/**
 * TODO: Backend tech debt:
 * SQ Server SCA Risk severity metrics are not typed correctly in the API.
 * They are currently typed as 'INT' but should be a new custom type 'SCA_RISK'.
 */
export function augmentMetrics(metrics: Metric[]): Metric[] {
  return metrics.map((metric) => {
    if (SCA_ISSUE_RISK_SEVERITY_METRICS.includes(metric.key)) {
      metric.type = MetricType.ScaRisk;
    }
    return metric;
  });
}

export function isScaMeasure(metricKey: string) {
  return (
    SCA_ISSUE_RISK_COUNT_METRICS.includes(metricKey) ||
    SCA_ISSUE_RISK_RATING_METRICS.includes(metricKey) ||
    SCA_ISSUE_RISK_SEVERITY_METRICS.includes(metricKey)
  );
}
