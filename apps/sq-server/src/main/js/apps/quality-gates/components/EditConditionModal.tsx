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
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  Form,
  IconEdit,
  ModalForm,
} from '@sonarsource/echoes-react';
import { isArray } from 'lodash';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { Note } from '~design-system';
import { isStringDefined } from '~shared/helpers/types';
import { getLocalizedMetricName, translate } from '~sq-server-commons/helpers/l10n';
import { getPossibleOperators } from '~sq-server-commons/helpers/quality-gates';
import { useUpdateConditionMutation } from '~sq-server-commons/queries/quality-gates';
import { Condition, Metric, QualityGate } from '~sq-server-commons/types/types';
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
  const [touched, setTouched] = React.useState(false);

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

  const intl = useIntl();

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
    } catch (_) {
      /* Error already handled */
    }

    setSubmitting(false);
    setTouched(false);
  };

  const handleErrorChange = (error: string) => {
    setTouched(true);
    setErrorThreshold(error);
  };

  const handleOperatorChange = (op: string) => {
    setTouched(true);
    setSelectedOperator(op);
  };

  const handleReset = () => {
    setErrorThreshold(condition.error);
    setSelectedOperator(condition.op);
    setTouched(false);
  };

  const isSubmitDisabled =
    !touched ||
    submitting ||
    !isStringDefined(selectedOperator) ||
    !isStringDefined(errorThreshold) ||
    (selectedOperator === condition.op && errorThreshold === condition.error);

  const renderBody = () => {
    return (
      <Form.Section
        description={<Note>{getLocalizedMetricName(metric)}</Note>}
        title={translate('quality_gates.conditions.fails_when')}
      >
        <div className="sw-flex sw-justify-between sw-w-3/4">
          <ConditionOperator
            metric={metric}
            onOperatorChange={handleOperatorChange}
            op={selectedOperator}
          />
          <ThresholdInput
            metric={metric}
            name="error"
            onChange={handleErrorChange}
            value={errorThreshold}
          />
        </div>
      </Form.Section>
    );
  };

  return (
    <ModalForm
      content={renderBody()}
      id={EDIT_CONDITION_MODAL_ID}
      isSubmitDisabled={isSubmitDisabled}
      isSubmitting={submitting}
      onReset={handleReset}
      onSubmit={handleFormSubmit}
      secondaryButtonLabel={translate('close')}
      submitButtonLabel={translate('quality_gates.update_condition')}
      title={translate('quality_gates.update_condition')}
    >
      <ButtonIcon
        Icon={IconEdit}
        ariaLabel={intl.formatMessage(
          { id: 'quality_gates.condition.edit' },
          { metric: metric.name },
        )}
        className="sw-mr-4"
        data-test="quality-gates__condition-update"
        size={ButtonSize.Medium}
        variety={ButtonVariety.PrimaryGhost}
      />
    </ModalForm>
  );
}
