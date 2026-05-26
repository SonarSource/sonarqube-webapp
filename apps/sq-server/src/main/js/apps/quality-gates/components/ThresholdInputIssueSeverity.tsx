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

import { Select } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import SoftwareImpactSeverityIcon from '~shared/components/icon-mappers/SoftwareImpactSeverityIcon';
import { ISSUE_SEVERITY_CONDITION_MAPPING } from '~shared/helpers/quality-gates';
import { isStringDefined } from '~shared/helpers/types';
import { Metric } from '~shared/types/measures';
import { MetricKey } from '~shared/types/metrics';
import { getModeForMetric } from '~sq-server-commons/helpers/quality-gates';
import {
  getIssueSeverityFormatter,
  ISSUE_SEVERITY_MQR_MAPPING,
} from '~sq-server-commons/sonar-aligned/helpers/measures';
import { Mode } from '~sq-server-commons/types/mode';

interface Props {
  disabled?: boolean;
  isInvalid?: boolean;
  metric: Metric;
  name: string;
  onChange: (value: string) => void;
  value: string;
}

export function ThresholdInputIssueSeverity({
  disabled,
  metric,
  name,
  onChange,
  value,
  isInvalid,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const mode = getModeForMetric(metric.key as MetricKey);
  const values =
    mode === Mode.Standard ? ISSUE_SEVERITY_CONDITION_MAPPING : ISSUE_SEVERITY_MQR_MAPPING;

  const formatter = getIssueSeverityFormatter(metric.key as MetricKey);
  const options = Object.entries(values).map(([k, v]) => ({
    value: k,
    label: formatter(k),
    prefix: <SoftwareImpactSeverityIcon severity={v as string} />,
  }));

  const handleSelectChange = (option: string | null) => {
    if (isStringDefined(option)) {
      onChange(option);
    } else {
      onChange('');
    }
  };

  return (
    <div>
      <Select
        ariaLabel={formatMessage({ id: 'quality_gates.conditions.threshold' })}
        data={options}
        data-type={metric.type}
        id="condition-threshold"
        isDisabled={disabled}
        isRequired
        label={formatMessage({ id: 'quality_gates.conditions.value' })}
        messageInvalid={formatMessage({
          id: 'quality_gates.conditions.error_message.default',
        })}
        name={name}
        onChange={handleSelectChange}
        validation={isInvalid ? 'invalid' : 'none'}
        value={value}
        valueIcon={<SoftwareImpactSeverityIcon severity={values[value]} />}
        width="small"
      />
    </div>
  );
}
