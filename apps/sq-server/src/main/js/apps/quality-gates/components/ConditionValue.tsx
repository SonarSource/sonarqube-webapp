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

import styled from '@emotion/styled';
import classNames from 'classnames';
import { themeColor } from '~design-system';
import SoftwareImpactSeverityIcon from '~shared/components/icon-mappers/SoftwareImpactSeverityIcon';
import { isIssueSeverityMetric } from '~shared/helpers/metrics';
import { ISSUE_SEVERITY_CONDITION_MAPPING } from '~shared/helpers/quality-gates';
import { Metric } from '~shared/types/measures';
import { MetricKey } from '~shared/types/metrics';
import { getCorrectCaycCondition } from '~sq-server-commons/helpers/quality-gates';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';
import { Condition } from '~sq-server-commons/types/types';
import ConditionValueDescription from './ConditionValueDescription';

interface Props {
  condition: Condition;
  isCaycCompliantAndOverCompliant?: boolean;
  isCaycModal?: boolean;
  metric: Metric;
}

function ConditionValue({
  condition,
  isCaycModal,
  metric,
  isCaycCompliantAndOverCompliant,
}: Props) {
  const conditionError = formatMeasure(
    condition.error,
    metric.type,
    undefined,
    metric.key as MetricKey,
  );

  if (isCaycModal) {
    const isToBeModified = condition.error !== getCorrectCaycCondition(condition).error;

    return (
      <>
        {isToBeModified && (
          <RedColorText className="sw-line-through sw-mr-2">{conditionError}</RedColorText>
        )}
        <GreenColorText className={classNames('sw-mr-2')} isToBeModified={isToBeModified}>
          {formatMeasure(
            getCorrectCaycCondition(condition).error,
            metric.type,
            undefined,
            metric.key as MetricKey,
          )}
        </GreenColorText>
        <ConditionValueDescription
          condition={getCorrectCaycCondition(condition)}
          isToBeModified={isToBeModified}
          metric={metric}
        />
      </>
    );
  }

  return (
    <>
      <span className="sw-mr-2 sw-flex sw-items-center sw-gap-1">
        {isIssueSeverityMetric(metric.key) && (
          <SoftwareImpactSeverityIcon
            severity={ISSUE_SEVERITY_CONDITION_MAPPING[condition.error]}
          />
        )}
        {conditionError}
      </span>
      {isCaycCompliantAndOverCompliant && condition.isCaycCondition && (
        <ConditionValueDescription condition={condition} metric={metric} />
      )}
    </>
  );
}

export default ConditionValue;

const RedColorText = styled.span`
  color: ${themeColor('qgConditionNotCayc')};
`;

export const GreenColorText = styled.span<{ isToBeModified: boolean }>`
  color: ${(props) => (props.isToBeModified ? themeColor('qgConditionCayc') : 'inherit')};
`;
