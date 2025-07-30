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

import { RatingBadgeSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { getRisksUrl } from '~shared/helpers/sca-urls';
import { PullRequest } from '~shared/types/branch-like';
import { MetricKey } from '~shared/types/metrics';
import { useAvailableFeatures } from '../../context/available-features/withAvailableFeatures';
import RatingComponent from '../../context/metrics/RatingComponent';
import { NoDataIcon } from '../../design-system';
import { Branch } from '../../types/branch-like';
import { Feature } from '../../types/features';
import { QualityGateStatusConditionEnhanced } from '../../types/quality-gates';
import { Component } from '../../types/types';
import { StyleMeasuresCardRightBorder } from './BranchSummaryStyles';
import MeasuresCardNumber from './MeasuresCardNumber';

export function MeasuresCardDependencyRisk(
  props: Readonly<{
    branchLike?: Branch | PullRequest;
    className?: string;
    component: Component;
    conditions: QualityGateStatusConditionEnhanced[];
    countMetricKey: MetricKey.new_sca_count_any_issue | MetricKey.sca_count_any_issue;
    dependencyRiskCount?: string;
    dependencyRiskRating?: string;
    ratingMetricKey: MetricKey.new_sca_rating_any_issue | MetricKey.sca_rating_any_issue;
  }>,
) {
  const {
    branchLike,
    className,
    component,
    conditions,
    countMetricKey,
    dependencyRiskCount,
    dependencyRiskRating,
    ratingMetricKey,
  } = props;
  const { hasFeature } = useAvailableFeatures();
  const intl = useIntl();
  if (dependencyRiskCount !== undefined && hasFeature(Feature.Sca)) {
    return (
      <StyleMeasuresCardRightBorder className={className}>
        <MeasuresCardNumber
          conditionMetric={countMetricKey}
          conditions={conditions}
          icon={
            dependencyRiskRating ? (
              <RatingComponent
                branchLike={branchLike}
                componentKey={component.key}
                getLabel={(rating) =>
                  intl.formatMessage({ id: 'metric.has_rating_X' }, { 0: rating })
                }
                getTooltip={(rating) =>
                  intl.formatMessage({ id: `metric.sca_rating.tooltip.${rating}` })
                }
                ratingMetric={ratingMetricKey}
                size={RatingBadgeSize.Medium}
              />
            ) : (
              <NoDataIcon size="md" />
            )
          }
          label="dependencies.risks"
          metric={countMetricKey}
          url={getRisksUrl({
            newParams: {
              ...getBranchLikeQuery(branchLike),
              id: component.key,
              newlyIntroduced: countMetricKey === MetricKey.new_sca_count_any_issue,
            },
          })}
          value={dependencyRiskCount}
        />
      </StyleMeasuresCardRightBorder>
    );
  }
  return null;
}
