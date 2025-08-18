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
import * as React from 'react';
import { useIntl } from 'react-intl';
import { To } from 'react-router-dom';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { formatMeasure } from '../../sonar-aligned/helpers/measures';
import { QualityGateStatusConditionEnhanced } from '../../types/quality-gates';
import { QGStatusEnum, getConditionRequiredLabel } from '../../utils/overview-utils';
import MeasuresCard, { MeasuresCardProps } from './MeasuresCard';

interface Props extends MeasuresCardProps {
  conditionMetric: MetricKey;
  conditions: QualityGateStatusConditionEnhanced[];
  label: string;
  showRequired?: boolean;
  url: To;
  value?: string;
}

export default function MeasuresCardNumber(
  props: React.PropsWithChildren<Props & React.HTMLAttributes<HTMLDivElement>>,
) {
  const { label, value, conditions, url, conditionMetric, showRequired = false, ...rest } = props;

  const intl = useIntl();

  const condition = conditions.find((condition) => condition.metric === conditionMetric);
  const conditionFailed = condition?.level === QGStatusEnum.ERROR;

  return (
    <MeasuresCard
      failed={conditionFailed}
      label={label}
      url={url}
      value={formatMeasure(value, MetricType.ShortInteger)}
      {...rest}
    >
      <span className="sw-mt-3">
        {showRequired &&
          condition &&
          (conditionFailed ? (
            <Text colorOverride="echoes-color-text-danger" size="small">
              {getConditionRequiredLabel(condition, intl, true)}
            </Text>
          ) : (
            <Text isSubtle size="small">
              {getConditionRequiredLabel(condition, intl)}
            </Text>
          ))}
      </span>
    </MeasuresCard>
  );
}
