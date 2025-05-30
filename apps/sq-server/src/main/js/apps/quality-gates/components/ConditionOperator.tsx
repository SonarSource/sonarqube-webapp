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

import { Heading, Select } from '@sonarsource/echoes-react';
import { Note } from '~design-system';
import { Metric } from '~shared/types/measures';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getOperatorLabel, getPossibleOperators } from '~sq-server-commons/helpers/quality-gates';

interface Props {
  isDisabled?: boolean;
  metric: Metric;
  onOperatorChange: (op: string) => void;
  op?: string;
}

export default function ConditionOperator(props: Readonly<Props>) {
  const operators = getPossibleOperators(props.metric);

  if (!Array.isArray(operators)) {
    return (
      <div>
        <Heading as="h4" hasMarginBottom>
          {translate('quality_gates.conditions.operator')}
        </Heading>
        <Note className="sw-w-abs-150">{getOperatorLabel(operators, props.metric)}</Note>
      </div>
    );
  }
  const operatorOptions = operators.map((op) => {
    const label = getOperatorLabel(op, props.metric);
    return { label, value: op };
  });

  return (
    <Select
      data={operatorOptions}
      id="condition-operator"
      isDisabled={props.isDisabled}
      isNotClearable
      label={translate('quality_gates.conditions.operator')}
      onChange={props.onOperatorChange}
      value={operatorOptions.find((o) => o.value === props.op)?.value}
      width="small"
    />
  );
}
