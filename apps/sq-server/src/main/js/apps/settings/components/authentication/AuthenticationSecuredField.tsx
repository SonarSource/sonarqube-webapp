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

import { Button } from '@sonarsource/echoes-react';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { InputField, InputTextArea } from '~design-system';
import { ExtendedSettingDefinition, SettingType } from '~shared/types/settings';
import { DefinitionV2 } from '~sq-server-commons/types/settings';
import { isSecuredDefinition } from '../../utils';

interface SamlToggleFieldProps {
  definition: ExtendedSettingDefinition | DefinitionV2;
  isClearable: boolean;
  isNotSet: boolean;
  onFieldChange: (key: string, value: string) => void;
  optional?: boolean;
  settingValue?: string;
}

export default function AuthenticationSecuredField(props: Readonly<SamlToggleFieldProps>) {
  const { isClearable, settingValue, definition, onFieldChange, optional = true, isNotSet } = props;
  const isSecured = isSecuredDefinition(definition);
  const [showSecretField, setShowSecretField] = React.useState(!isNotSet && isSecured);
  const { formatMessage } = useIntl();

  useEffect(() => {
    setShowSecretField(!isNotSet && isSecured);
  }, [isNotSet, isSecured]);

  const handleUpdateField = () => {
    if (isClearable) {
      onFieldChange(definition.key, '');
    }
    setShowSecretField(false);
  };

  return (
    <>
      {!showSecretField &&
        (definition.type === SettingType.TEXT ? (
          <InputTextArea
            id={definition.key}
            maxLength={4000}
            onChange={(e) => {
              props.onFieldChange(definition.key, e.currentTarget.value);
            }}
            required={!optional}
            rows={5}
            size="full"
            value={settingValue ?? ''}
          />
        ) : (
          <InputField
            id={definition.key}
            maxLength={4000}
            name={definition.key}
            onChange={(e) => {
              props.onFieldChange(definition.key, e.currentTarget.value);
            }}
            size="full"
            type="text"
            value={String(settingValue ?? '')}
          />
        ))}
      {showSecretField && (
        <div className="sw-flex sw-items-center">
          <p className="sw-mr-2">
            {formatMessage({ id: 'settings.almintegration.form.secret.field' })}
          </p>
          <Button onClick={handleUpdateField}>
            {isClearable
              ? formatMessage({ id: 'clear' })
              : formatMessage({ id: 'settings.almintegration.form.secret.update_field' })}
          </Button>
        </div>
      )}
    </>
  );
}
