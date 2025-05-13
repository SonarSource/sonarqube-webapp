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

import { queryToSearchString } from '~shared/helpers/query';
import { PullRequest } from '~shared/types/branch-like';
import { MetricKey } from '~shared/types/metrics';
import { useAvailableFeatures } from '../../context/available-features/withAvailableFeatures';
import { getRisksUrl } from '../../helpers/sca-urls';
import { getBranchLikeQuery } from '../../sonar-aligned/helpers/branch-like';
import { Branch } from '../../types/branch-like';
import { Feature } from '../../types/features';
import { QualityGateStatusConditionEnhanced } from '../../types/quality-gates';
import { Component } from '../../types/types';
import { StyleMeasuresCard } from './BranchSummaryStyles';
import MeasuresCardNumber from './MeasuresCardNumber';

export function MeasuresCardDependencyRisk(
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
        />
      </StyleMeasuresCard>
    );
  }
  return null;
}
