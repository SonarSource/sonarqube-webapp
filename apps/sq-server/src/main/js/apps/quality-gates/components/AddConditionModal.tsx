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

import { Button, ButtonVariety, Modal, RadioButtonGroup } from '@sonarsource/echoes-react';
import { differenceWith, map } from 'lodash';
import * as React from 'react';
import { FormField } from '~design-system';
import { useAvailableFeatures } from '~sq-server-shared/context/available-features/withAvailableFeatures';
import { useMetrics } from '~sq-server-shared/context/metrics/withMetricsContext';
import { translate } from '~sq-server-shared/helpers/l10n';
import { isDiffMetric } from '~sq-server-shared/helpers/measures';
import {
  getPossibleOperators,
  isNonEditableMetric,
  MQR_CONDITIONS_MAP,
  STANDARD_CONDITIONS_MAP,
} from '~sq-server-shared/helpers/quality-gates';
import { useStandardExperienceModeQuery } from '~sq-server-shared/queries/mode';
import { useCreateConditionMutation } from '~sq-server-shared/queries/quality-gates';
import { MetricKey, MetricType } from '~sq-server-shared/sonar-aligned/types/metrics';
import { Feature } from '~sq-server-shared/types/features';
import { Condition, Metric, QualityGate } from '~sq-server-shared/types/types';
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

export default function AddConditionModal({ qualityGate }: Readonly<Props>) {
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const [open, setOpen] = React.useState(false);
  const closeModal = React.useCallback(() => setOpen(false), []);
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
        closeModal();
      }
    },
    [closeModal, createCondition, errorThreshold, selectedMetric, selectedOperator],
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

  const renderBody = () => {
    return (
      <form id={ADD_CONDITION_MODAL_ID} onSubmit={handleFormSubmit}>
        <FormField
          htmlFor="quality_gates-add-condition-scope-radio"
          label={translate('quality_gates.conditions.where')}
        >
          <RadioButtonGroup
            id="quality_gates-add-condition-scope-radio"
            onChange={handleScopeChange}
            options={[
              { label: translate('quality_gates.conditions.new_code'), value: 'new' },
              { label: translate('quality_gates.conditions.overall_code'), value: 'overall' },
            ]}
            value={scope}
          />
        </FormField>

        <FormField
          htmlFor="condition-metric"
          label={translate('quality_gates.conditions.fails_when')}
        >
          <MetricSelect
            metricsArray={availableMetrics.filter((m) =>
              scope === 'new' ? isDiffMetric(m.key) : !isDiffMetric(m.key),
            )}
            onMetricChange={handleMetricChange}
            selectedMetric={selectedMetric}
            similarMetricFromAnotherMode={similarMetricFromAnotherMode}
          />
        </FormField>

        {selectedMetric && (
          <div className="sw-flex sw-gap-2">
            <FormField
              className="sw-mb-0"
              htmlFor="condition-operator"
              label={translate('quality_gates.conditions.operator')}
            >
              <ConditionOperator
                isDisabled={Boolean(similarMetricFromAnotherMode)}
                metric={selectedMetric}
                onOperatorChange={handleOperatorChange}
                op={selectedOperator}
              />
            </FormField>
            <FormField
              htmlFor="condition-threshold"
              label={translate('quality_gates.conditions.value')}
            >
              <ThresholdInput
                disabled={
                  isNonEditableMetric(selectedMetric.key as MetricKey) ||
                  Boolean(similarMetricFromAnotherMode)
                }
                metric={selectedMetric}
                name="error"
                onChange={handleErrorChange}
                value={errorThreshold}
              />
            </FormField>
          </div>
        )}
      </form>
    );
  };

  return (
    <Modal
      content={renderBody()}
      isOpen={open}
      onOpenChange={setOpen}
      primaryButton={
        <Button
          form={ADD_CONDITION_MODAL_ID}
          id="add-condition-button"
          isDisabled={selectedMetric === undefined || Boolean(similarMetricFromAnotherMode)}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {translate('quality_gates.add_condition')}
        </Button>
      }
      secondaryButton={<Button onClick={closeModal}>{translate('close')}</Button>}
      title={translate('quality_gates.add_condition')}
    >
      <Button data-test="quality-gates__add-condition">
        {translate('quality_gates.add_condition')}
      </Button>
    </Modal>
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
