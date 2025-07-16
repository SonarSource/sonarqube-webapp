/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import { MetricKey } from '~shared/types/metrics';
import { useAvailableFeatures } from '../context/available-features/withAvailableFeatures';
import { Feature } from '../types/features';
import {
  L10nMessageType,
  ReleaseRiskSeverity,
  ReleaseRiskType,
  RiskStatus,
  RiskTransitions,
} from '../types/sca';
import { getIntl } from './l10nBundle';

/** From most to least severe */
export const RISK_SEVERITY_ORDER = [
  ReleaseRiskSeverity.Blocker,
  ReleaseRiskSeverity.High,
  ReleaseRiskSeverity.Medium,
  ReleaseRiskSeverity.Low,
  ReleaseRiskSeverity.Info,
] as const;

export const RISK_TRANSITION_ORDER = [
  RiskTransitions.Reopen,
  RiskStatus.Open,
  RiskTransitions.Confirm,
  RiskStatus.Confirm,
  RiskTransitions.Accept,
  RiskStatus.Accept,
  RiskTransitions.Safe,
  RiskStatus.Safe,
  RiskTransitions.Fixed,
  RiskStatus.Fixed,
] as const;

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

/** HIGH risk is the only risk level for license related options. */
export const SCA_LICENSE_RISK_SEVERITY_METRIC_THRESHOLDS = {
  '19': ReleaseRiskSeverity.High,
};

export const SCA_RISK_SEVERITY_METRIC_VALUES = {
  '5': ReleaseRiskSeverity.Info,
  '10': ReleaseRiskSeverity.Low,
  '15': ReleaseRiskSeverity.Medium,
  '20': ReleaseRiskSeverity.High,
  '25': ReleaseRiskSeverity.Blocker,
};

export const RISK_SEVERITY_LABELS: Record<ReleaseRiskSeverity, string> = {
  [ReleaseRiskSeverity.Low]: 'severity_impact.LOW',
  [ReleaseRiskSeverity.Info]: 'severity_impact.INFO',
  [ReleaseRiskSeverity.Medium]: 'severity_impact.MEDIUM',
  [ReleaseRiskSeverity.High]: 'severity_impact.HIGH',
  [ReleaseRiskSeverity.Blocker]: 'severity_impact.BLOCKER',
};

export const RISK_TYPE_LABEL: Record<ReleaseRiskType, L10nMessageType> = {
  [ReleaseRiskType.Vulnerability]: 'dependencies.risks.type.vulnerability',
  [ReleaseRiskType.ProhibitedLicense]: 'dependencies.risks.type.license',
};

export const RISK_TYPE_QUALITY_GATE_LABEL: Record<ReleaseRiskType | 'Any', string> = {
  Any: 'quality_gates.metric.sca_severity_any_issue',
  [ReleaseRiskType.Vulnerability]: 'quality_gates.metric.sca_severity_vulnerability',
  [ReleaseRiskType.ProhibitedLicense]: 'quality_gates.metric.sca_severity_licensing',
};

export const SCA_LICENSE_RISK_METRIC_KEYS = [
  MetricKey.sca_severity_licensing,
  MetricKey.new_sca_severity_licensing,
] as string[];

export function getScaRiskMetricThresholds(metricKey: string) {
  if (SCA_LICENSE_RISK_METRIC_KEYS.includes(metricKey)) {
    return SCA_LICENSE_RISK_SEVERITY_METRIC_THRESHOLDS;
  }
  return SCA_RISK_SEVERITY_METRIC_THRESHOLDS;
}

/**
 * TODO: Backend tech debt:
 * These are the metrics keys for which the SCA_RISK_METRIC_OPTIONS apply
 * and that should have the MetricType.ScaRisk type.
 */
export const SCA_ISSUE_RISK_SEVERITY_METRICS = [
  MetricKey.sca_severity_any_issue,
  MetricKey.sca_severity_licensing,
  MetricKey.sca_severity_vulnerability,
  MetricKey.new_sca_severity_any_issue,
  MetricKey.new_sca_severity_licensing,
  MetricKey.new_sca_severity_vulnerability,
] as string[];

export const SCA_ISSUE_RISK_RATING_METRICS = [
  MetricKey.sca_rating_any_issue,
  MetricKey.sca_rating_licensing,
  MetricKey.sca_rating_vulnerability,
  MetricKey.new_sca_rating_any_issue,
  MetricKey.new_sca_rating_licensing,
  MetricKey.new_sca_rating_vulnerability,
] as string[];

export const SCA_ISSUE_RISK_COUNT_METRICS = [
  MetricKey.sca_count_any_issue,
  MetricKey.new_sca_count_any_issue,
] as string[];

export const SCA_RISK_ALL_METRICS = [
  ...SCA_ISSUE_RISK_SEVERITY_METRICS,
  ...SCA_ISSUE_RISK_RATING_METRICS,
  ...SCA_ISSUE_RISK_COUNT_METRICS,
] as string[];

export const SCA_METRIC_TYPE_MAP: Partial<Record<MetricKey, ReleaseRiskType>> = {
  [MetricKey.sca_rating_licensing]: ReleaseRiskType.ProhibitedLicense,
  [MetricKey.sca_rating_vulnerability]: ReleaseRiskType.Vulnerability,
  [MetricKey.sca_severity_licensing]: ReleaseRiskType.ProhibitedLicense,
  [MetricKey.sca_severity_vulnerability]: ReleaseRiskType.Vulnerability,
  [MetricKey.new_sca_rating_licensing]: ReleaseRiskType.ProhibitedLicense,
  [MetricKey.new_sca_rating_vulnerability]: ReleaseRiskType.Vulnerability,
  [MetricKey.new_sca_severity_licensing]: ReleaseRiskType.ProhibitedLicense,
  [MetricKey.new_sca_severity_vulnerability]: ReleaseRiskType.Vulnerability,
};

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

export function makeRiskMetricOptionsFormatter() {
  const { formatMessage } = getIntl();
  const scaRiskMetrics: Record<string, ReleaseRiskSeverity> = {
    ...SCA_RISK_SEVERITY_METRIC_THRESHOLDS,
    ...SCA_RISK_SEVERITY_METRIC_VALUES,
  };

  return (value: string | number): string => {
    const valueStr = value.toString();
    if (scaRiskMetrics[valueStr]) {
      return formatMessage({ id: RISK_SEVERITY_LABELS[scaRiskMetrics[valueStr]] });
    }
    return formatMessage({ id: 'unknown' });
  };
}

export function useScaOverviewMetrics() {
  const { hasFeature } = useAvailableFeatures();
  return useMemo(() => {
    if (hasFeature(Feature.Sca)) {
      return [
        MetricKey.sca_count_any_issue,
        MetricKey.sca_rating_any_issue,
        MetricKey.new_sca_count_any_issue,
        MetricKey.new_sca_rating_any_issue,
      ];
    }
    return [];
  }, [hasFeature]);
}
