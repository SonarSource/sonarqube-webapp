/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import React from 'react';
import ValidationInput, {
  ValidationInputErrorPlacement,
} from '../../../../components/controls/ValidationInput';
import MandatoryFieldMarker from '../../../../components/ui/MandatoryFieldMarker';
import { ExtendedSettingDefinition, SettingType } from '../../../../types/settings';
import { isSecuredDefinition } from '../../utils';
import AuthenticationMultiValueField from './AuthenticationMultiValuesField';
import AuthenticationSecuredField from './AuthenticationSecuredField';
import AuthenticationToggleField from './AuthenticationToggleField';

interface SamlToggleFieldProps {
  settingValue?: string | boolean | string[];
  definition: ExtendedSettingDefinition;
  mandatory?: boolean;
  onFieldChange: (key: string, value: string | boolean | string[]) => void;
  isNotSet: boolean;
  error?: string;
}

export default function AuthenticationFormField(props: SamlToggleFieldProps) {
  const { mandatory = false, definition, settingValue, isNotSet, error } = props;

  return (
    <div className="settings-definition">
      <div className="settings-definition-left">
        <label className="h3" htmlFor={definition.key}>
          {definition.name}
        </label>
        {mandatory && <MandatoryFieldMarker />}
        {definition.description && (
          <div className="markdown small spacer-top">{definition.description}</div>
        )}
      </div>
      <div className="settings-definition-right big-padded-top display-flex-column">
        {definition.multiValues && (
          <AuthenticationMultiValueField
            definition={definition}
            settingValue={settingValue as string[]}
            onFieldChange={(value) => props.onFieldChange(definition.key, value)}
          />
        )}
        {isSecuredDefinition(definition) && (
          <AuthenticationSecuredField
            definition={definition}
            settingValue={String(settingValue ?? '')}
            onFieldChange={props.onFieldChange}
            isNotSet={isNotSet}
          />
        )}
        {!isSecuredDefinition(definition) && definition.type === SettingType.BOOLEAN && (
          <AuthenticationToggleField
            definition={definition}
            settingValue={settingValue as string | boolean}
            onChange={(value) => props.onFieldChange(definition.key, value)}
          />
        )}
        {!isSecuredDefinition(definition) &&
          definition.type === undefined &&
          !definition.multiValues && (
            <ValidationInput
              error={error}
              errorPlacement={ValidationInputErrorPlacement.Bottom}
              isValid={false}
              isInvalid={Boolean(error)}
            >
              <input
                className="width-100"
                id={definition.key}
                maxLength={4000}
                name={definition.key}
                onChange={(e) => props.onFieldChange(definition.key, e.currentTarget.value)}
                type="text"
                value={String(settingValue ?? '')}
              />
            </ValidationInput>
          )}
      </div>
    </div>
  );
}
