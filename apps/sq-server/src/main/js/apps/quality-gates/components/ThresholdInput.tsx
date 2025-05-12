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
import { FormattedMessage } from 'react-intl';
import { isStringDefined } from '~shared/helpers/types';
import { MetricType } from '~shared/types/metrics';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getScaRiskMetricThresholds, RISK_SEVERITY_LABELS } from '~sq-server-commons/helpers/sca';
import { Metric } from '~sq-server-commons/types/types';

interface Props {
  disabled?: boolean;
  metric: Metric;
  name: string;
  onChange: (value: string) => void;
  value: string;
}

export default class ThresholdInput extends React.PureComponent<Props> {
  inputLabel = translate('quality_gates.conditions.value');

  handleChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange(e.currentTarget.value);
  };

  handleSelectChange = (option: string) => {
    if (isStringDefined(option)) {
      this.props.onChange(option);
    } else {
      this.props.onChange('');
    }
  };

  renderScaSeverityInput() {
    const options = Object.entries(getScaRiskMetricThresholds(this.props.metric.key)).map(
      ([value, option]) => ({
        value,
        label: translate(RISK_SEVERITY_LABELS[option]),
      }),
    );

    return (
      <div className="sw-max-w-[50%]">
        <Select
          className="sw-w-abs-150"
          data={options}
          id="condition-threshold"
          isDisabled={this.props.disabled}
          isRequired
          label={this.inputLabel}
          name={this.props.name}
          onChange={this.handleSelectChange}
          value={this.props.value}
          width={FormFieldWidth.Small}
        />
        {options.length === 1 && (
          <Text as="p" className="sw-mt-3" size={TextSize.Small}>
            <FormattedMessage id="quality_gates.metric.sca_severity_licensing.description" />
          </Text>
        )}
      </div>
    );
  }

  renderRatingInput() {
    const { name, value, disabled } = this.props;

    const options = [
      { label: 'A', value: '1' },
      { label: 'B', value: '2' },
      { label: 'C', value: '3' },
      { label: 'D', value: '4' },
    ];

    return (
      <Select
        className="sw-w-abs-150"
        data={options}
        id="condition-threshold"
        isDisabled={disabled}
        isRequired
        label={this.inputLabel}
        name={name}
        onChange={this.handleSelectChange}
        value={value}
        width={FormFieldWidth.Small}
      />
    );
  }

  render() {
    const { name, value, disabled, metric } = this.props;

    if (metric.type === MetricType.Rating) {
      return this.renderRatingInput();
    }

    if (metric.type === MetricType.ScaRisk) {
      return this.renderScaSeverityInput();
    }

    return (
      <TextInput
        data-type={metric.type}
        id="condition-threshold"
        isDisabled={disabled}
        isRequired
        label={this.inputLabel}
        name={name}
        onChange={this.handleChange}
        type="text"
        value={value}
        width={FormFieldWidth.Small}
      />
    );
  }
}
