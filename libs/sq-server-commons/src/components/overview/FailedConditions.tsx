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

import { Text } from '@sonarsource/echoes-react';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { MeasureEnhanced } from '~shared/types/measures';
import { CardSeparator } from '../../design-system';
import { isDiffMetric } from '../../helpers/measures';
import { BranchLike } from '../../types/branch-like';
import { QualityGateStatusConditionEnhanced } from '../../types/quality-gates';
import { Component, QualityGate } from '../../types/types';
import QualityGateConditions from './QualityGateConditions';
import ZeroNewIssuesSimplificationGuide from './ZeroNewIssuesSimplificationGuide';

export interface FailedConditionsProps {
  branchLike?: BranchLike;
  component: Pick<Component, 'key'>;
  failedConditions: QualityGateStatusConditionEnhanced[];
  isApplication?: boolean;
  isNewCode: boolean;
  measures?: MeasureEnhanced[];
  qualityGate?: QualityGate;
}

export default function FailedConditions({
  isApplication,
  isNewCode,
  qualityGate,
  failedConditions,
  component,
  branchLike,
  measures,
}: Readonly<FailedConditionsProps>) {
  const [newCodeFailedConditions, overallFailedConditions] = _.partition(
    failedConditions,
    (condition) => isDiffMetric(condition.metric),
  );

  return (
    <>
      {!isApplication && (
        <>
          <Text className="sw-mb-3" colorOverride="echoes-color-text-danger">
            <FormattedMessage
              id="quality_gates.conditions.x_conditions_failed"
              values={{
                conditions: isNewCode
                  ? newCodeFailedConditions.length
                  : overallFailedConditions.length,
              }}
            />
          </Text>
          <CardSeparator />
        </>
      )}
      {qualityGate && isNewCode && <ZeroNewIssuesSimplificationGuide qualityGate={qualityGate} />}
      <QualityGateConditions
        branchLike={branchLike}
        component={component}
        failedConditions={isNewCode ? newCodeFailedConditions : overallFailedConditions}
        isBuiltInQualityGate={isNewCode && qualityGate?.isBuiltIn}
        measures={measures}
      />
    </>
  );
}
