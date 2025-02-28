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

import { IconLock, TextInput } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { LLMOption } from '~sq-server-shared/api/fix-suggestions';
import { translate } from '~sq-server-shared/helpers/l10n';
import { AiFormValidation } from './AiCodeFixEnablementForm';

interface LLMFormProps {
  isFirstSetup: boolean;
  onChange: (values: Partial<LLMOption>) => void;
  options: Partial<LLMOption>;
  validation: AiFormValidation;
}

export function LLMForm(props: LLMFormProps) {
  const [focused, setFocused] = useState(false);

  switch (props.options.key) {
    case 'OPEN_AI':
      return null;
    case 'AZURE_OPEN_AI': {
      const { options, validation } = props;
      return (
        <>
          <TextInput
            label={translate('aicodefix.azure_open_ai.endpoint.label')}
            value={options.endpoint ?? ''}
            onChange={(event) => {
              props.onChange({ ...options, endpoint: event.target.value });
            }}
            type="url"
            isRequired
            validation={
              validation.error['endpoint']
                ? 'invalid'
                : validation.success['endpoint']
                  ? 'valid'
                  : 'none'
            }
            width="large"
            messageValid={validation.success['endpoint']}
            messageInvalid={validation.error['endpoint']}
            helpText={translate('aicodefix.azure_open_ai.endpoint.help')}
          />
          <TextInput
            label={translate('aicodefix.azure_open_ai.apiKey.label')}
            value={options.apiKey ?? ''}
            prefix={
              props.options.apiKey === undefined && !focused && !props.isFirstSetup ? (
                <IconLock />
              ) : undefined
            }
            placeholder={
              options.apiKey === undefined && !props.isFirstSetup
                ? translate('aicodefix.azure_open_ai.apiKey.update_placeholder')
                : undefined
            }
            onChange={(event) => {
              props.onChange({ ...options, apiKey: event.target.value });
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            isRequired
            validation={
              validation.error['apiKey']
                ? 'invalid'
                : validation.success['apiKey']
                  ? 'valid'
                  : 'none'
            }
            width="large"
            messageValid={validation.success['apiKey']}
            messageInvalid={validation.error['apiKey']}
            helpText={translate('aicodefix.azure_open_ai.apiKey.help')}
          />
        </>
      );
    }
  }
}
