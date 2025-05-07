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

import { MetricKey } from '~shared/types/metrics';
import { ReleaseRiskSeverity } from '../types/sca';

/** From most to least severe */
export const RISK_SEVERITY_ORDER = [
  ReleaseRiskSeverity.Blocker,
  ReleaseRiskSeverity.High,
  ReleaseRiskSeverity.Medium,
  ReleaseRiskSeverity.Low,
  ReleaseRiskSeverity.Info,
];

export const RISK_SEVERITY_LABELS: Record<ReleaseRiskSeverity, string> = {
  [ReleaseRiskSeverity.Low]: 'dependencies.risks.severity.LOW',
  [ReleaseRiskSeverity.Info]: 'dependencies.risks.severity.INFO',
  [ReleaseRiskSeverity.Medium]: 'dependencies.risks.severity.MEDIUM',
  [ReleaseRiskSeverity.High]: 'dependencies.risks.severity.HIGH',
  [ReleaseRiskSeverity.Blocker]: 'dependencies.risks.severity.BLOCKER',
};

/**
 * TODO: Backend tech debt:
 * These levels are modeled in the DB as 5, 10, 15, 20, 25
 * In order to get the GreaterThanOrEqual operator, we need to subtract 1
 */
export const SCA_RISK_METRIC_OPTIONS = {
  '4': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.Info],
  '9': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.Low],
  '14': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.Medium],
  '19': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.High],
  '24': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.Blocker],
};

/** HIGH risk is the only risk level for license related options. */
export const SCA_RISK_LICENSE_METRIC_OPTIONS = {
  '19': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.High],
};

export function getScaRiskMetricOptions(metricKey: string) {
  if (
    ([MetricKey.sca_severity_licensing, MetricKey.new_sca_severity_licensing] as string[]).includes(
      metricKey,
    )
  ) {
    return SCA_RISK_LICENSE_METRIC_OPTIONS;
  }
  return SCA_RISK_METRIC_OPTIONS;
}

export const SCA_RISK_METRIC_VALUES = {
  '5': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.Info],
  '10': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.Low],
  '15': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.Medium],
  '20': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.High],
  '25': RISK_SEVERITY_LABELS[ReleaseRiskSeverity.Blocker],
};

const SCA_RISK_METRICS: Record<string, string> = {
  ...SCA_RISK_METRIC_OPTIONS,
  ...SCA_RISK_METRIC_VALUES,
};

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

export const SCA_RISK_ALL_METRICS = [
  ...SCA_ISSUE_RISK_SEVERITY_METRICS,
  MetricKey.sca_count_any_issue,
  MetricKey.new_sca_count_any_issue,
] as string[];

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

export function makeRiskMetricOptionsFormatter(translate: (key: string) => string) {
  return (value: string | number): string => {
    const valueStr = value.toString();
    if (SCA_RISK_METRICS[valueStr]) {
      return translate(SCA_RISK_METRICS[valueStr]);
    }
    return translate('unknown');
  };
}
