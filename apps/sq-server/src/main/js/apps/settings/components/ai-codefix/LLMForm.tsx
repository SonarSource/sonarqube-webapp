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
import { LLMAzureOption, LLMOption } from '~sq-server-shared/api/fix-suggestions';
import { translate } from '~sq-server-shared/helpers/l10n';
import { AiFormValidation } from './AiCodeFixEnablementForm';

interface LLMFormProps {
  isFirstSetup: boolean;
  onChange: (values: Partial<LLMOption>) => void;
  options: Partial<LLMOption>;
  validation: AiFormValidation;
}

function isAzureLLMOption(option: Partial<LLMOption>): option is LLMAzureOption {
  return option.key === 'AZURE_OPENAI';
}

export function LLMForm(props: Readonly<LLMFormProps>) {
  const [focused, setFocused] = useState(false);
  const { options, validation } = props;

  if (!isAzureLLMOption(options)) {
    return null;
  }

  return (
    <>
      <TextInput
        helpText={translate('aicodefix.azure_open_ai.endpoint.help')}
        isRequired
        label={translate('aicodefix.azure_open_ai.endpoint.label')}
        messageInvalid={validation.error.endpoint}
        onChange={(event) => {
          props.onChange({ ...options, endpoint: event.target.value });
        }}
        type="url"
        validation={validation.error.endpoint ? 'invalid' : 'none'}
        value={options.endpoint ?? ''}
        width="large"
      />
      <TextInput
        helpText={translate('aicodefix.azure_open_ai.apiKey.help')}
        isRequired
        label={translate('aicodefix.azure_open_ai.apiKey.label')}
        messageInvalid={validation.error.apiKey}
        onBlur={() => {
          setFocused(false);
        }}
        onChange={(event) => {
          props.onChange({ ...options, apiKey: event.target.value });
        }}
        onFocus={() => {
          setFocused(true);
        }}
        placeholder={
          options.apiKey === undefined && !props.isFirstSetup
            ? translate('aicodefix.azure_open_ai.apiKey.update_placeholder')
            : undefined
        }
        prefix={
          options.apiKey === undefined && !focused && !props.isFirstSetup ? <IconLock /> : undefined
        }
        validation={validation.error.apiKey ? 'invalid' : 'none'}
        value={options.apiKey ?? ''}
        width="large"
      />
    </>
  );
}
