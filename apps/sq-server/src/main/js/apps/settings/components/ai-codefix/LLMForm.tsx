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

import { IconLock, TextInput } from '@sonarsource/echoes-react';
import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';
import { MASKED_SECRET } from '~sq-server-commons/queries/fix-suggestions';
import { AiFormValidation } from './AiCodeFixEnablementForm';

interface LLMFormProps {
  config: Record<string, string>;
  onChange: (configKey: string, value: string) => void;
  validation: AiFormValidation;
}

const WELL_KNOWN_ABBREVIATIONS = new Set(['api', 'id', 'url']);

function humanizeConfigKey(key: string): string {
  const words = key.replaceAll(/([a-z])([A-Z])/g, '$1 $2').split(/[\s_-]+/);

  return words
    .map((word) =>
      WELL_KNOWN_ABBREVIATIONS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');
}

function isSecretField(configKey: string): boolean {
  return configKey.toLowerCase().includes('key');
}

function isMaskedValue(value: string): boolean {
  return value === MASKED_SECRET;
}

export function LLMForm({ config, onChange, validation }: Readonly<LLMFormProps>) {
  const { formatMessage } = useIntl();

  const keys = Object.keys(config);

  if (keys.length === 0) {
    return null;
  }

  return (
    <>
      {keys.map((configKey) => {
        const isSecret = isSecretField(configKey);
        const rawValue = config[configKey];
        const displayValue = isSecret && isMaskedValue(rawValue) ? '' : rawValue;
        const hasSavedSecret = isSecret && isMaskedValue(rawValue);

        return (
          <TextInput
            isRequired
            key={configKey}
            label={humanizeConfigKey(configKey)}
            messageInvalid={validation.error[configKey]}
            onChange={(event) => {
              onChange(configKey, event.target.value);
            }}
            placeholder={
              hasSavedSecret
                ? formatMessage({ id: 'aicodefix.admin.provider.secret.placeholder' })
                : undefined
            }
            prefix={hasSavedSecret && isEmpty(displayValue) ? <IconLock /> : undefined}
            type={isSecret ? 'password' : 'text'}
            validation={validation.error[configKey] ? 'invalid' : 'none'}
            value={displayValue}
            width="large"
          />
        );
      })}
    </>
  );
}
