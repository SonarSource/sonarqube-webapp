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

import { Text, ToggleTip } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Metric } from '~shared/types/measures';
import { MetricKey } from '~shared/types/metrics';
import withMetricsContext from '~sq-server-commons/context/metrics/withMetricsContext';
import {
  getCaycConditionMetadata,
  getLocalizedMetricNameNoDiffMetric,
} from '~sq-server-commons/helpers/quality-gates';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';
import { DecoratedCondition } from '../hooks/useConditions';
import { BuiltInStyledContentCell, BuiltInStyledItem } from './BuiltInConditionWrappers';

interface Props {
  condition: DecoratedCondition;
  metric: Metric;
  metrics: Record<string, Metric>;
}

function NewCodeBuiltInCondition({ condition, metric, metrics }: Readonly<Props>) {
  const { shouldRenderOperator } = getCaycConditionMetadata(condition);
  const { formatMessage } = useIntl();

  const renderOperator = () => {
    const { op = 'GT' } = condition;
    return formatMessage({ id: `quality_gates.operator.inverted.${op}` });
  };

  const conditionError = formatMeasure(
    condition.error,
    metric.type,
    undefined,
    metric.key as MetricKey,
  );

  const { suffix, isDisabled } = condition;
  const colorOverride = isDisabled ? 'echoes-color-text-disabled' : undefined;

  return (
    <BuiltInStyledItem>
      <span className="sw-flex sw-items-center sw-gap-2">
        <Text colorOverride={colorOverride}>
          {formatMessage(
            { id: `metric.${metric.key}.description.positive` },
            { value: conditionError },
          )}
        </Text>

        {suffix}
      </span>
      <div className="sw-flex sw-items-center sw-gap-1">
        {shouldRenderOperator && (
          <BuiltInStyledContentCell>
            <Text colorOverride={colorOverride}>
              <FormattedMessage
                id="quality_gates.conditions.builtin_new_code.metric"
                values={{
                  metric: getLocalizedMetricNameNoDiffMetric(metric, metrics),
                  operator: renderOperator(),
                  value: <Text colorOverride={colorOverride}>&nbsp;{conditionError}</Text>,
                }}
              />
            </Text>
            <ToggleTip
              ariaLabel={formatMessage({ id: 'toggle_tip.aria_label.threshold' })}
              className="sw-ml-2"
              description={formatMessage({ id: 'quality_gates.conditions.threshold.hint' })}
            />
          </BuiltInStyledContentCell>
        )}
      </div>
    </BuiltInStyledItem>
  );
}

export default withMetricsContext(NewCodeBuiltInCondition);
