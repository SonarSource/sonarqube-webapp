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

import {
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconEdit,
  Modal,
} from '@sonarsource/echoes-react';
import { isArray } from 'lodash';
import * as React from 'react';
import { FormField, Highlight, Note } from '~design-system';
import {
  getLocalizedMetricName,
  translate,
  translateWithParameters,
} from '~sq-server-shared/helpers/l10n';
import { getPossibleOperators } from '~sq-server-shared/helpers/quality-gates';
import { useUpdateConditionMutation } from '~sq-server-shared/queries/quality-gates';
import { Condition, Metric, QualityGate } from '~sq-server-shared/types/types';
import ConditionOperator from './ConditionOperator';
import ThresholdInput from './ThresholdInput';

interface Props {
  condition: Condition;
  header: string;
  metric: Metric;
  qualityGate: QualityGate;
}

const EDIT_CONDITION_MODAL_ID = 'edit-condition-modal';

export default function EditConditionModal({ condition, metric, qualityGate }: Readonly<Props>) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [errorThreshold, setErrorThreshold] = React.useState(condition ? condition.error : '');

  const [selectedOperator, setSelectedOperator] = React.useState<string | undefined>(
    condition ? condition.op : undefined,
  );
  const { mutateAsync: updateCondition } = useUpdateConditionMutation(qualityGate.name);

  const getSinglePossibleOperator = (metric: Metric) => {
    const operators = getPossibleOperators(metric);
    return isArray(operators) ? selectedOperator : operators;
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);

    const newCondition: Omit<Condition, 'id'> = {
      metric: metric.key,
      op: getSinglePossibleOperator(metric),
      error: errorThreshold,
    };
    try {
      await updateCondition({ id: condition.id, ...newCondition });
      setOpen(false);
    } catch (_) {
      /* Error already handled */
    }

    setSubmitting(false);
  };

  const handleErrorChange = (error: string) => {
    setErrorThreshold(error);
  };

  const handleOperatorChange = (op: string) => {
    setSelectedOperator(op);
  };

  const renderBody = () => {
    return (
      <form id={EDIT_CONDITION_MODAL_ID} onSubmit={handleFormSubmit}>
        <span aria-hidden="true" className="sw-flex sw-flex-col sw-w-full sw-mb-6">
          <Highlight className="sw-mb-2 sw-flex sw-items-center sw-gap-2">
            <span>{translate('quality_gates.conditions.fails_when')}</span>
          </Highlight>
          <Note className="sw-mt-2">{getLocalizedMetricName(metric)}</Note>
        </span>

        <div className="sw-flex sw-gap-2">
          <FormField
            className="sw-mb-0"
            htmlFor="condition-operator"
            label={translate('quality_gates.conditions.operator')}
          >
            <ConditionOperator
              metric={metric}
              onOperatorChange={handleOperatorChange}
              op={selectedOperator}
            />
          </FormField>
          <FormField
            htmlFor="condition-threshold"
            label={translate('quality_gates.conditions.value')}
          >
            <ThresholdInput
              metric={metric}
              name="error"
              onChange={handleErrorChange}
              value={errorThreshold}
            />
          </FormField>
        </div>
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
          form={EDIT_CONDITION_MODAL_ID}
          isLoading={submitting}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {translate('quality_gates.update_condition')}
        </Button>
      }
      secondaryButton={
        <Button onClick={() => setOpen(false)} variety={ButtonVariety.Default}>
          {translate('close')}
        </Button>
      }
      title={translate('quality_gates.update_condition')}
    >
      <ButtonIcon
        Icon={IconEdit}
        ariaLabel={translateWithParameters('quality_gates.condition.edit', metric.name)}
        className="sw-mr-4"
        data-test="quality-gates__condition-update"
        size={ButtonSize.Medium}
        variety={ButtonVariety.PrimaryGhost}
      />
    </Modal>
  );
}
