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

import { Text, ToggleTip } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import withMetricsContext from '~sq-server-shared/context/metrics/withMetricsContext';
import { translate } from '~sq-server-shared/helpers/l10n';
import {
  getCaycConditionMetadata,
  getLocalizedMetricNameNoDiffMetric,
} from '~sq-server-shared/helpers/quality-gates';
import { formatMeasure } from '~sq-server-shared/sonar-aligned/helpers/measures';
import { MetricKey } from '~sq-server-shared/sonar-aligned/types/metrics';
import { Condition, Dict, Metric } from '~sq-server-shared/types/types';
import { BuiltInStyledContentCell, BuiltInStyledItem } from './BuiltInConditionWrappers';

interface Props {
  condition: Condition;
  metric: Metric;
  metrics: Dict<Metric>;
}

function NewCodeBuiltInCondition({ condition, metric, metrics }: Readonly<Props>) {
  const { shouldRenderOperator } = getCaycConditionMetadata(condition);

  const renderOperator = () => {
    const { op = 'GT' } = condition;
    return translate('quality_gates.operator.inverted', op);
  };

  return (
    <BuiltInStyledItem
      data-guiding-id={
        condition.metric === MetricKey.new_violations ? 'caycConditionsSimplification' : undefined
      }
    >
      <span>
        <Text isHighlighted>{translate(`metric.${metric.key}.description.positive`)}</Text>
      </span>

      {shouldRenderOperator && (
        <BuiltInStyledContentCell>
          <FormattedMessage
            id="quality_gates.conditions.builtin_new_code.metric"
            values={{
              metric: getLocalizedMetricNameNoDiffMetric(metric, metrics),
              operator: renderOperator(),
              value: <Text isHighlighted>&nbsp;{formatMeasure(condition.error, metric.type)}</Text>,
            }}
          />
          <ToggleTip
            className="sw-ml-2"
            description={translate('quality_gates.conditions.cayc.threshold.hint')}
          />
        </BuiltInStyledContentCell>
      )}
    </BuiltInStyledItem>
  );
}

export default withMetricsContext(NewCodeBuiltInCondition);
