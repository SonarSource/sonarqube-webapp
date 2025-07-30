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

import { FormFieldWidth, Select, Text, TextInput, TextSize } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getScaRiskMetricThresholds, RISK_SEVERITY_LABELS } from '~shared/helpers/sca';
import { isStringDefined } from '~shared/helpers/types';
import { Metric } from '~shared/types/measures';
import { MetricType } from '~shared/types/metrics';

interface Props {
  disabled?: boolean;
  isInvalid?: boolean;
  metric: Metric;
  name: string;
  onChange: (value: string) => void;
  value: string;
}

export default function ThresholdInput({
  disabled,
  metric,
  name,
  onChange,
  isInvalid,
  value,
}: Readonly<Props>) {
  const intl = useIntl();

  const commonInputProps = {
    label: intl.formatMessage({ id: 'quality_gates.conditions.value' }),
    isDisabled: disabled,
    isRequired: true,
    id: 'condition-threshold',
    name,
    value,
    width: FormFieldWidth.Medium,
    messageInvalid: intl.formatMessage({
      id: `quality_gates.conditions.error_message.${metric.type === MetricType.Percent ? 'percent' : 'default'}`,
    }),
  };

  const handleChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  };

  const handleSelectChange = (option: string) => {
    if (isStringDefined(option)) {
      onChange(option);
    } else {
      onChange('');
    }
  };

  if (metric.type === MetricType.Rating) {
    const options = [
      { label: 'A', value: '1' },
      { label: 'B', value: '2' },
      { label: 'C', value: '3' },
      { label: 'D', value: '4' },
    ];

    return (
      <Select
        {...commonInputProps}
        className="sw-w-abs-150"
        data={options}
        onChange={handleSelectChange}
      />
    );
  }

  if (metric.type === MetricType.ScaRisk) {
    const options = Object.entries(getScaRiskMetricThresholds(metric.key)).map(
      ([value, option]) => ({
        value,
        label: intl.formatMessage({ id: RISK_SEVERITY_LABELS[option] }),
      }),
    );

    return (
      <div>
        <Select
          {...commonInputProps}
          className="sw-w-abs-150"
          data={options}
          onChange={handleSelectChange}
        />
        {options.length === 1 && (
          <Text as="p" className="sw-mt-3" size={TextSize.Small}>
            <FormattedMessage id="quality_gates.metric.sca_severity_licensing.description" />
          </Text>
        )}
      </div>
    );
  }

  return (
    <TextInput
      {...commonInputProps}
      data-type={metric.type}
      onChange={handleChange}
      type="text"
      validation={isInvalid ? 'invalid' : 'none'}
    />
  );
}
