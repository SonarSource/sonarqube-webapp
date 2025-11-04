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

import {
  Button,
  ButtonVariety,
  Form,
  FormFieldWidth,
  MessageInline,
  MessageVariety,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { changePassword } from '../../api/users';
import { translate } from '../../helpers/l10n';
import { ChangePasswordResults, LoggedInUser } from '../../types/users';
import UserPasswordInput, { PasswordChangeHandlerParams } from './UserPasswordInput';

interface Props {
  className?: string;
  onPasswordChange?: () => void;
  user: LoggedInUser;
}

export default function ResetPasswordForm({
  className,
  onPasswordChange,
  user: { login },
}: Readonly<Props>) {
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [oldPassword, setOldPassword] = React.useState('');
  const [password, setPassword] = React.useState<PasswordChangeHandlerParams>({
    value: '',
    isValid: false,
  });
  const [success, setSuccess] = React.useState(false);

  const handleSuccessfulChange = () => {
    setOldPassword('');
    setPassword({
      value: '',
      isValid: false,
    });
    setSuccess(true);

    onPasswordChange?.();
  };

  const handleChangePassword = (event: React.FormEvent) => {
    event.preventDefault();

    setError(undefined);
    setSuccess(false);

    changePassword({
      login,
      password: password.value,
      previousPassword: oldPassword,
    })
      .then(handleSuccessfulChange)
      .catch((result: ChangePasswordResults) => {
        if (result === ChangePasswordResults.OldPasswordIncorrect) {
          setError(translate('user.old_password_incorrect'));
        } else if (result === ChangePasswordResults.NewPasswordSameAsOld) {
          setError(translate('user.new_password_same_as_old'));
        }
      });
  };

  return (
    <Form className={className} onSubmit={handleChangePassword}>
      <Form.Section>
        {success && (
          <div className="sw-pb-4">
            <MessageInline variety={MessageVariety.Success}>
              {translate('my_profile.password.changed')}
            </MessageInline>
          </div>
        )}

        {error !== undefined && (
          <div className="sw-pb-4">
            <MessageInline variety={MessageVariety.Danger}>{error}</MessageInline>
          </div>
        )}

        <TextInput
          autoComplete="off"
          id="old_password"
          isRequired
          label={translate('my_profile.password.old')}
          name="old_password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setOldPassword(e.target.value);
          }}
          type="password"
          value={oldPassword}
          width={FormFieldWidth.Large}
        />
      </Form.Section>
      <Form.Section>
        <UserPasswordInput
          onChange={setPassword}
          size={FormFieldWidth.Large}
          value={password.value}
        />
      </Form.Section>
      <Form.Footer>
        <Button
          id="change-password"
          isDisabled={oldPassword === '' || !password.isValid}
          size="medium"
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {translate('update_verb')}
        </Button>
      </Form.Footer>
    </Form>
  );
}
