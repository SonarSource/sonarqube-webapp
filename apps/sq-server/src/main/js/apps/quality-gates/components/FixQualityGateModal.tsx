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

import { Heading, LinkHighlight, ModalForm, Select, Text, toast } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Metric } from '~shared/types/measures';
import { MetricKey } from '~shared/types/metrics';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import {
  getCorrectCaycCondition,
  getLocalizedMetricNameNoDiffMetric,
  getOperatorLabel,
  getWeakMissingAndNonCaycConditions,
} from '~sq-server-commons/helpers/quality-gates';
import { useFixQualityGateMutation } from '~sq-server-commons/queries/quality-gates';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';
import { Condition, QualityGate } from '~sq-server-commons/types/types';

const DUPLICATION_VALUES = [
  { label: '0%', value: '0' },
  { label: '1%', value: '1' },
  { label: '2%', value: '2' },
  { label: '3%', value: '3' },
  { label: '5%', value: '5' },
  { label: '10%', value: '10' },
  { label: '20%', value: '20' },
];

const COVERAGE_VALUES = [
  { label: '0%', value: '0' },
  { label: '10%', value: '10' },
  { label: '20%', value: '20' },
  { label: '30%', value: '30' },
  { label: '40%', value: '40' },
  { label: '50%', value: '50' },
  { label: '60%', value: '60' },
  { label: '70%', value: '70' },
  { label: '80%', value: '80' },
  { label: '90%', value: '90' },
  { label: '100%', value: '100' },
];

interface Props extends React.PropsWithChildren {
  conditions: Condition[];
  isOptimizing?: boolean;
  metrics: Record<string, Metric>;
  qualityGate: QualityGate;
  scope: 'new' | 'overall' | 'new-cayc';
}

interface ModifiedCondition {
  caycCondition: Condition;
  modifiedCondition: Condition;
}

function getModifiedConditions(weakConditions: Condition[]): ModifiedCondition[] {
  return weakConditions.map((modifiedCondition) => {
    const caycCondition = getCorrectCaycCondition(modifiedCondition);
    return {
      caycCondition,
      modifiedCondition,
    };
  });
}

export default function FixQualityGateModal(props: Readonly<Props>) {
  const { conditions, qualityGate, metrics, children } = props;
  const { mutateAsync: fixQualityGate, isPending: isSubmitting } = useFixQualityGateMutation(
    qualityGate.name,
  );

  const [duplicationThreshold, setDuplicationThreshold] = useState(DUPLICATION_VALUES[3].value);
  const [coverageThreshold, setCoverageThreshold] = useState(COVERAGE_VALUES[8].value);

  const [missingConditions, modifiedConditions] = useMemo(() => {
    const { missingConditions, weakConditions } = getWeakMissingAndNonCaycConditions(conditions);
    const modifiedConditions = getModifiedConditions(weakConditions);
    return [missingConditions, modifiedConditions];
  }, [conditions]);

  const getConditionValue = useCallback(
    (metricKey: string, threshold: string) => {
      if (metricKey === MetricKey.new_coverage) {
        return coverageThreshold;
      }

      if (metricKey === MetricKey.new_duplicated_lines_density) {
        return duplicationThreshold;
      }

      return threshold;
    },
    [coverageThreshold, duplicationThreshold],
  );

  const handleFixQualityGate = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const missingConditionsWithThresholds = missingConditions.map((condition) => ({
        ...condition,
        error: getConditionValue(condition.metric, condition.error),
      }));

      await fixQualityGate({
        weakConditions: modifiedConditions.map(({ modifiedCondition }) => modifiedCondition),
        missingConditions: missingConditionsWithThresholds,
      });

      toast.success({
        description: <FormattedMessage id="quality_gates.fix_modal.success" />,
        duration: 'short',
      });
    },
    [fixQualityGate, missingConditions, modifiedConditions, getConditionValue],
  );

  const body = (
    <>
      {missingConditions.length >= 1 && metrics && (
        <div>
          <Heading as="h3" hasMarginBottom id="missing-conditions">
            <FormattedMessage
              id="quality_gates.fix_modal.to_add.title.x_conditions"
              values={{ count: missingConditions.length }}
            />
          </Heading>

          <Text aria-labelledby="missing-conditions" as="ul" className="sw-list-decimal sw-mt-0">
            {missingConditions.map((condition) => (
              <li key={condition.metric}>
                <span id={`missing-${condition.metric}`}>
                  {getLocalizedMetricNameNoDiffMetric(metrics[condition.metric] || {}, metrics)}{' '}
                  {getOperatorLabel(condition.op || '', metrics[condition.metric] || {})}{' '}
                </span>

                {condition.metric === MetricKey.new_coverage && (
                  <Select
                    ariaLabelledBy={`missing-${condition.metric}`}
                    className="sw-mt-1 -sw-ml-4"
                    data={COVERAGE_VALUES}
                    isNotClearable
                    onChange={(value) => {
                      if (value) {
                        setCoverageThreshold(value);
                      }
                    }}
                    value={coverageThreshold}
                    width="medium"
                  />
                )}

                {condition.metric === MetricKey.new_duplicated_lines_density && (
                  <Select
                    ariaLabelledBy={`missing-${condition.metric}`}
                    className="sw-mt-1 -sw-ml-4"
                    data={DUPLICATION_VALUES}
                    isNotClearable
                    onChange={(value) => {
                      if (value) {
                        setDuplicationThreshold(value);
                      }
                    }}
                    value={duplicationThreshold}
                    width="medium"
                  />
                )}

                {condition.metric !== MetricKey.new_coverage &&
                  condition.metric !== MetricKey.new_duplicated_lines_density &&
                  formatMeasure(condition.error, metrics[condition.metric]?.type)}
              </li>
            ))}
          </Text>
        </div>
      )}

      {modifiedConditions.length >= 1 && metrics && (
        <div>
          <Heading as="h3" hasMarginBottom id="modified-conditions">
            <FormattedMessage
              id="quality_gates.fix_modal.to_modify.title.x_conditions"
              values={{ count: modifiedConditions.length }}
            />
          </Heading>

          <Text aria-labelledby="modified-conditions" as="ul" className="sw-list-decimal sw-mt-0">
            {modifiedConditions.map(({ caycCondition, modifiedCondition }) => (
              <li key={modifiedCondition.id}>
                <span className="sw-sr-only">
                  <FormattedMessage
                    id="quality_gates.fix_modal.to_modify.accessible_item"
                    values={{
                      metric: getLocalizedMetricNameNoDiffMetric(
                        metrics[caycCondition.metric],
                        metrics,
                      ),
                      op: getOperatorLabel(
                        caycCondition.op || '',
                        metrics[caycCondition.metric] || {},
                      ),
                      oldValue: formatMeasure(
                        modifiedCondition.error,
                        metrics[modifiedCondition.metric]?.type,
                      ),
                      newValue: formatMeasure(
                        caycCondition.error,
                        metrics[caycCondition.metric]?.type,
                      ),
                    }}
                  />
                </span>

                <span aria-hidden>
                  {getLocalizedMetricNameNoDiffMetric(metrics[caycCondition.metric] || {}, metrics)}{' '}
                  {getOperatorLabel(caycCondition.op || '', metrics[caycCondition.metric] || {})}{' '}
                  <Text colorOverride="echoes-color-text-success" isHighlighted>
                    {formatMeasure(caycCondition.error, metrics[caycCondition.metric]?.type)}
                  </Text>{' '}
                  <Text className="sw-line-through" colorOverride="echoes-color-text-danger">
                    {formatMeasure(
                      modifiedCondition.error,
                      metrics[modifiedCondition.metric]?.type,
                    )}
                  </Text>
                </span>
              </li>
            ))}
          </Text>
        </div>
      )}
    </>
  );

  return (
    <ModalForm
      content={body}
      description={
        <FormattedMessage
          id="quality_gates.fix_modal.description"
          values={{
            link: (text) => (
              <DocumentationLink
                enableOpenInNewTab
                highlight={LinkHighlight.CurrentColor}
                to={DocLink.QualityGatesRecommendedConditions}
              >
                {text}
              </DocumentationLink>
            ),
          }}
        />
      }
      isSubmitting={isSubmitting}
      onSubmit={handleFixQualityGate}
      submitButtonLabel={<FormattedMessage id="update_verb" />}
      title={<FormattedMessage id="quality_gates.fix_modal.title" />}
    >
      {children}
    </ModalForm>
  );
}
