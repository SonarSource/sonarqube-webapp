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

import { FormFieldWidth, IconCheck, IconX, Text, TextInput } from '@sonarsource/echoes-react';
import * as React from 'react';
import { translate } from '../../helpers/l10n';
import FocusOutHandler from '../controls/FocusOutHandler';

const MIN_PASSWORD_LENGTH = 12;

export type PasswordChangeHandlerParams = { isValid: boolean; value: string };

export interface Props {
  onChange: (password: PasswordChangeHandlerParams) => void;
  size?: FormFieldWidth;
  value: string;
}

export default function UserPasswordInput(props: Readonly<Props>) {
  const { onChange, size = FormFieldWidth.Full, value } = props;

  const [isFocused, setIsFocused] = React.useState(false);
  const [confirmValue, setConfirmValue] = React.useState('');

  const validation = () => {
    if (!isFocused && value !== '') {
      return isPasswordValid(value) ? 'valid' : 'invalid';
    }

    return undefined;
  };
  const passwordMatch = () => {
    if (confirmValue !== '') {
      return isPasswordConfirmed(value, confirmValue) ? 'valid' : 'invalid';
    }

    return undefined;
  };

  React.useEffect(() => {
    if (value === '') {
      setConfirmValue('');
    }
  }, [value]);

  return (
    <>
      <FocusOutHandler onFocusOut={() => setIsFocused(false)}>
        <div className="sw-flex sw-flex-col">
          <TextInput
            id="create-password"
            isRequired
            label={translate('password')}
            messageInvalid={translate('user.password.invalid')}
            onChange={({ currentTarget }) => {
              onChange({
                value: currentTarget.value,
                isValid:
                  isPasswordValid(currentTarget.value) &&
                  isPasswordConfirmed(currentTarget.value, confirmValue),
              });
            }}
            onFocus={() => setIsFocused(true)}
            type="password"
            validation={validation()}
            value={value}
            width={size}
          />
          {isFocused && <PasswordConstraint value={value} />}
        </div>
      </FocusOutHandler>

      <TextInput
        id="confirm-password"
        isRequired
        label={translate('confirm_password')}
        messageInvalid={translate('user.password.do_not_match')}
        onChange={({ currentTarget }) => {
          setConfirmValue(currentTarget.value);
          onChange({
            value,
            isValid:
              isPasswordValid(currentTarget.value) &&
              isPasswordConfirmed(value, currentTarget.value),
          });
        }}
        onFocus={() => setIsFocused(true)}
        type="password"
        validation={passwordMatch()}
        value={confirmValue}
        width={size}
      />
    </>
  );
}

function PasswordConstraint({ value }: Readonly<{ value: string }>) {
  return (
    <div className="sw-mt-2">
      <Text isSubdued>{translate('user.password.conditions')}</Text>
      <ul className="sw-list-none sw-p-0 sw-mt-1">
        <Condition
          condition={contains12Characters(value)}
          label={translate('user.password.condition.12_characters')}
        />
        <Condition
          condition={containsUppercase(value)}
          label={translate('user.password.condition.1_upper_case')}
        />
        <Condition
          condition={containsLowercase(value)}
          label={translate('user.password.condition.1_lower_case')}
        />
        <Condition
          condition={containsDigit(value)}
          label={translate('user.password.condition.1_number')}
        />
        <Condition
          condition={containsSpecialCharacter(value)}
          label={translate('user.password.condition.1_special_character')}
        />
      </ul>
    </div>
  );
}

function Condition({ condition, label }: Readonly<{ condition: boolean; label: string }>) {
  return (
    <li className="sw-mb-1">
      {condition ? (
        <Text colorOverride="echoes-color-text-success" data-testid="valid-condition">
          <IconCheck className="sw-mr-1" />
          {label}
        </Text>
      ) : (
        <Text data-testid="failed-condition" isSubdued>
          <IconX className="sw-mr-1" />
          {label}
        </Text>
      )}
    </li>
  );
}

const contains12Characters = (password: string) => password.length >= MIN_PASSWORD_LENGTH;
const containsUppercase = (password: string) => /[A-Z]/.test(password);
const containsLowercase = (password: string) => /[a-z]/.test(password);
const containsDigit = (password: string) => /\d/.test(password);
const containsSpecialCharacter = (password: string) => /[^a-zA-Z0-9]/.test(password);

const isPasswordValid = (password: string) =>
  contains12Characters(password) &&
  containsUppercase(password) &&
  containsLowercase(password) &&
  containsDigit(password) &&
  containsSpecialCharacter(password);

const isPasswordConfirmed = (password: string, confirm: string) =>
  password === confirm && password !== '';
