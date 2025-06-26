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

import { Button, Form, ModalForm, RadioButtonGroup } from '@sonarsource/echoes-react';
import { differenceWith, map } from 'lodash';
import * as React from 'react';
import { isValidPercentageMetric } from '~shared/helpers/metrics';
import { isStringDefined } from '~shared/helpers/types';
import { Metric } from '~shared/types/measures';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { useMetrics } from '~sq-server-commons/context/metrics/withMetricsContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { isDiffMetric } from '~sq-server-commons/helpers/measures';
import {
  getPossibleOperators,
  isNonEditableMetric,
  MQR_CONDITIONS_MAP,
  STANDARD_CONDITIONS_MAP,
} from '~sq-server-commons/helpers/quality-gates';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { useCreateConditionMutation } from '~sq-server-commons/queries/quality-gates';
import { Feature } from '~sq-server-commons/types/features';
import { Condition, QualityGate } from '~sq-server-commons/types/types';
import ConditionOperator from './ConditionOperator';
import MetricSelect from './MetricSelect';
import ThresholdInput from './ThresholdInput';

interface Props {
  qualityGate: QualityGate;
}

const FORBIDDEN_METRIC_TYPES = [MetricType.Data, MetricType.Distribution, 'STRING', 'BOOL'];
const FORBIDDEN_METRICS: string[] = [
  MetricKey.alert_status,
  MetricKey.releasability_rating,
  MetricKey.security_hotspots,
  MetricKey.new_security_hotspots,
  MetricKey.high_impact_accepted_issues,
];

const ADD_CONDITION_MODAL_ID = 'add-condition-modal';
const QUALITY_GATES_ADD_CONDITION = 'quality_gates.add_condition';

export default function AddConditionModal({ qualityGate }: Readonly<Props>) {
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const [errorThreshold, setErrorThreshold] = React.useState('');
  const [scope, setScope] = React.useState<'new' | 'overall'>('new');
  const [selectedMetric, setSelectedMetric] = React.useState<Metric | undefined>();
  const [selectedOperator, setSelectedOperator] = React.useState<string | undefined>();
  const { mutateAsync: createCondition } = useCreateConditionMutation(qualityGate.name);
  const { hasFeature } = useAvailableFeatures();
  const metrics = useMetrics();

  const getSinglePossibleOperator = (metric: Metric) => {
    const operators = getPossibleOperators(metric);
    return Array.isArray(operators) ? undefined : operators;
  };

  const { conditions = [] } = qualityGate;

  const similarMetricFromAnotherMode = findSimilarConditionMetricFromAnotherMode(
    qualityGate.conditions,
    selectedMetric,
  );

  const availableMetrics = React.useMemo(() => {
    return differenceWith(
      map(metrics, (metric) => metric).filter(
        (metric) =>
          !metric.hidden &&
          !FORBIDDEN_METRIC_TYPES.includes(metric.type) &&
          !FORBIDDEN_METRICS.includes(metric.key) &&
          !(
            isStandardMode
              ? Object.values(STANDARD_CONDITIONS_MAP)
              : Object.values(MQR_CONDITIONS_MAP)
          ).includes(metric.key as MetricKey) &&
          !(
            metric.key === MetricKey.prioritized_rule_issues &&
            !hasFeature(Feature.PrioritizedRules)
          ),
      ),
      conditions,
      (metric, condition) => metric.key === condition.metric,
    );
  }, [conditions, hasFeature, metrics, isStandardMode]);

  const handleFormSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (selectedMetric) {
        const newCondition: Omit<Condition, 'id'> = {
          metric: selectedMetric.key,
          op: getSinglePossibleOperator(selectedMetric) ?? selectedOperator,
          error: errorThreshold,
        };
        await createCondition(newCondition);
      }
    },
    [createCondition, errorThreshold, selectedMetric, selectedOperator],
  );

  const handleScopeChange = (scope: 'new' | 'overall') => {
    let correspondingMetric;

    if (selectedMetric) {
      const correspondingMetricKey =
        scope === 'new' ? `new_${selectedMetric.key}` : selectedMetric.key.replace(/^new_/, '');
      correspondingMetric = availableMetrics.find((m) => m.key === correspondingMetricKey);
    }

    setScope(scope);
    setSelectedMetric(correspondingMetric);
  };

  const handleMetricChange = (metric: Metric) => {
    setSelectedMetric(metric);
    setSelectedOperator(undefined);
    setErrorThreshold(metric.key === MetricKey.prioritized_rule_issues ? '0' : '');
  };

  const handleOperatorChange = (op: string) => {
    setSelectedOperator(op);
  };

  const handleErrorChange = (error: string) => {
    setErrorThreshold(error);
  };

  const handleFormReset = () => {
    // Reset form state
    setSelectedMetric(undefined);
    setSelectedOperator(undefined);
    setErrorThreshold('');
    setScope('new');
  };

  const isValid =
    selectedMetric &&
    (selectedMetric.type !== MetricType.Percent ||
      isValidPercentageMetric(selectedMetric, errorThreshold));

  const isSubmitDisabled =
    !isValid ||
    Boolean(similarMetricFromAnotherMode) ||
    (!isStringDefined(selectedOperator) && !isStringDefined(errorThreshold));

  const renderBody = () => {
    return (
      <>
        <Form.Section title={translate('quality_gates.conditions.where')}>
          <RadioButtonGroup
            id="quality_gates-add-condition-scope-radio"
            onChange={handleScopeChange}
            options={[
              { label: translate('quality_gates.conditions.new_code'), value: 'new' },
              { label: translate('quality_gates.conditions.overall_code'), value: 'overall' },
            ]}
            value={scope}
          />
        </Form.Section>

        <Form.Section title={translate('quality_gates.conditions.fails_when')}>
          <MetricSelect
            metricsArray={availableMetrics.filter((m) =>
              scope === 'new' ? isDiffMetric(m.key) : !isDiffMetric(m.key),
            )}
            onMetricChange={handleMetricChange}
            selectedMetric={selectedMetric}
            similarMetricFromAnotherMode={similarMetricFromAnotherMode}
          />
        </Form.Section>

        {selectedMetric && (
          <Form.Section>
            <div className="sw-flex sw-justify-between sw-w-3/4">
              <ConditionOperator
                isDisabled={Boolean(similarMetricFromAnotherMode)}
                metric={selectedMetric}
                onOperatorChange={handleOperatorChange}
                op={selectedOperator}
              />
              <ThresholdInput
                disabled={
                  isNonEditableMetric(selectedMetric.key as MetricKey) ||
                  Boolean(similarMetricFromAnotherMode)
                }
                isInvalid={!isValid}
                metric={selectedMetric}
                name="error"
                onChange={handleErrorChange}
                value={errorThreshold}
              />
            </div>
          </Form.Section>
        )}
      </>
    );
  };

  return (
    <ModalForm
      content={renderBody()}
      id={ADD_CONDITION_MODAL_ID}
      isSubmitDisabled={isSubmitDisabled}
      onReset={handleFormReset}
      onSubmit={handleFormSubmit}
      secondaryButtonLabel={translate('close')}
      submitButtonLabel={translate(QUALITY_GATES_ADD_CONDITION)}
      title={translate(QUALITY_GATES_ADD_CONDITION)}
    >
      <Button data-test="quality-gates__add-condition">
        {translate(QUALITY_GATES_ADD_CONDITION)}
      </Button>
    </ModalForm>
  );
}

function findSimilarConditionMetricFromAnotherMode(
  conditions: Condition[] = [],
  selectedMetric?: Metric,
) {
  if (!selectedMetric) {
    return undefined;
  }

  const selectedMetricFromAnotherMode =
    STANDARD_CONDITIONS_MAP[selectedMetric.key as MetricKey] ??
    MQR_CONDITIONS_MAP[selectedMetric.key as MetricKey];

  if (!selectedMetricFromAnotherMode) {
    return undefined;
  }

  const qgMetrics = conditions.map((condition) => condition.metric);
  return qgMetrics.find((metric) => metric === selectedMetricFromAnotherMode);
}
