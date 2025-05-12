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

import { Text } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { queryToSearchString } from '~shared/helpers/query';
import { PullRequest } from '~shared/types/branch-like';
import { MetricKey } from '~shared/types/metrics';
import { StyleMeasuresCard } from '../components/overview/BranchSummaryStyles';
import MeasuresCardNumber from '../components/overview/MeasuresCardNumber';
import { useAvailableFeatures } from '../context/available-features/withAvailableFeatures';
import { getBranchLikeQuery } from '../sonar-aligned/helpers/branch-like';
import { Branch } from '../types/branch-like';
import { Feature } from '../types/features';
import { QualityGateStatusConditionEnhanced } from '../types/quality-gates';
import { L10nMessageType, ReleaseRiskSeverity, ReleaseRiskType } from '../types/sca';
import { Component } from '../types/types';
import { getRisksUrl } from './sca-urls';

/** From most to least severe */
export const RISK_SEVERITY_ORDER = [
  ReleaseRiskSeverity.Blocker,
  ReleaseRiskSeverity.High,
  ReleaseRiskSeverity.Medium,
  ReleaseRiskSeverity.Low,
  ReleaseRiskSeverity.Info,
];

/**
 * TODO: Backend tech debt:
 * These levels are modeled in the DB as 5, 10, 15, 20, 25
 * In order to get the GreaterThanOrEqual operator, we need to subtract 1
 */
export const SCA_RISK_METRIC_THRESHOLDS = {
  '4': ReleaseRiskSeverity.Info,
  '9': ReleaseRiskSeverity.Low,
  '14': ReleaseRiskSeverity.Medium,
  '19': ReleaseRiskSeverity.High,
  '24': ReleaseRiskSeverity.Blocker,
};

/** HIGH risk is the only risk level for license related options. */
export const SCA_RISK_LICENSE_METRIC_THRESHOLDS = {
  '19': ReleaseRiskSeverity.High,
};

export const SCA_RISK_METRIC_VALUES = {
  '5': ReleaseRiskSeverity.Info,
  '10': ReleaseRiskSeverity.Low,
  '15': ReleaseRiskSeverity.Medium,
  '20': ReleaseRiskSeverity.High,
  '25': ReleaseRiskSeverity.Blocker,
};

export const RISK_SEVERITY_LABELS: Record<ReleaseRiskSeverity, string> = {
  [ReleaseRiskSeverity.Low]: 'dependencies.risks.severity.LOW',
  [ReleaseRiskSeverity.Info]: 'dependencies.risks.severity.INFO',
  [ReleaseRiskSeverity.Medium]: 'dependencies.risks.severity.MEDIUM',
  [ReleaseRiskSeverity.High]: 'dependencies.risks.severity.HIGH',
  [ReleaseRiskSeverity.Blocker]: 'dependencies.risks.severity.BLOCKER',
};

export const RISK_TYPE_LABEL: Record<ReleaseRiskType, L10nMessageType> = {
  [ReleaseRiskType.Vulnerability]: 'dependencies.risks.type.vulnerability',
  [ReleaseRiskType.ProhibitedLicense]: 'dependencies.risks.type.license',
};

export function getScaRiskMetricThresholds(metricKey: string) {
  if (
    ([MetricKey.sca_severity_licensing, MetricKey.new_sca_severity_licensing] as string[]).includes(
      metricKey,
    )
  ) {
    return SCA_RISK_LICENSE_METRIC_THRESHOLDS;
  }
  return SCA_RISK_METRIC_THRESHOLDS;
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

export const SCA_RISK_ALL_METRICS = [
  ...SCA_ISSUE_RISK_SEVERITY_METRICS,
  MetricKey.sca_count_any_issue,
  MetricKey.new_sca_count_any_issue,
] as string[];

export const SCA_METRIC_TYPE_MAP: Partial<Record<MetricKey, ReleaseRiskType>> = {
  [MetricKey.sca_severity_licensing]: ReleaseRiskType.ProhibitedLicense,
  [MetricKey.sca_severity_vulnerability]: ReleaseRiskType.Vulnerability,
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
  return Object.entries(SCA_RISK_METRIC_VALUES)
    .filter(([value]) => {
      return parseInt(value, 10) >= intThreshold;
    })
    .map(([_, severity]) => severity);
}

export function makeRiskMetricOptionsFormatter(translate: (key: string) => string) {
  const scaRiskMetrics: Record<string, ReleaseRiskSeverity> = {
    ...SCA_RISK_METRIC_THRESHOLDS,
    ...SCA_RISK_METRIC_VALUES,
  };

  return (value: string | number): string => {
    const valueStr = value.toString();
    if (scaRiskMetrics[valueStr]) {
      return translate(RISK_SEVERITY_LABELS[scaRiskMetrics[valueStr]]);
    }
    return translate('unknown');
  };
}

export function useScaOverviewMetrics() {
  const { hasFeature } = useAvailableFeatures();
  return useMemo(() => {
    if (hasFeature(Feature.Sca)) {
      return [MetricKey.sca_count_any_issue, MetricKey.new_sca_count_any_issue];
    }
    return [];
  }, [hasFeature]);
}

export function DependencyRiskMeasuresCard(
  props: Readonly<{
    branchLike?: Branch | PullRequest;
    className?: string;
    component: Component;
    conditions: QualityGateStatusConditionEnhanced[];
    dependencyRisks?: string;
    metricKey: MetricKey.new_sca_count_any_issue | MetricKey.sca_count_any_issue;
  }>,
) {
  const { branchLike, className, component, conditions, dependencyRisks, metricKey } = props;
  const { hasFeature } = useAvailableFeatures();
  if (dependencyRisks !== undefined && hasFeature(Feature.Sca)) {
    return (
      <StyleMeasuresCard className={className}>
        <MeasuresCardNumber
          conditionMetric={metricKey}
          conditions={conditions}
          label="dependencies.risks"
          metric={metricKey}
          url={getRisksUrl(
            queryToSearchString({
              ...getBranchLikeQuery(branchLike),
              id: component.key,
              newlyIntroduced: metricKey === MetricKey.new_sca_count_any_issue,
            }),
          )}
          value={dependencyRisks}
        >
          <Text isSubdued>
            <FormattedMessage id="metric.sca_count_any_issue.description" />
          </Text>
        </MeasuresCardNumber>
      </StyleMeasuresCard>
    );
  }
  return null;
}
