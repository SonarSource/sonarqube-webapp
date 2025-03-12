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

import {
  Form,
  FormFieldWidth,
  MessageCallout,
  ModalForm,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { addGlobalSuccessMessage } from '~design-system';
import { changePassword } from '~sq-server-shared/api/users';
import UserPasswordInput, {
  PasswordChangeHandlerParams,
} from '~sq-server-shared/components/common/UserPasswordInput';
import { CurrentUserContext } from '~sq-server-shared/context/current-user/CurrentUserContext';
import { translate } from '~sq-server-shared/helpers/l10n';
import { ChangePasswordResults, RestUserDetailed, isLoggedIn } from '~sq-server-shared/types/users';

interface Props {
  children: React.ReactNode;
  user: RestUserDetailed;
}

const PASSWORD_FORM_ID = 'user-password-form';

export default function PasswordForm(props: Readonly<Props>) {
  const { children, user } = props;

  const [errorTranslationKey, setErrorTranslationKey] = React.useState<string | undefined>(
    undefined,
  );
  const [newPassword, setNewPassword] = React.useState<PasswordChangeHandlerParams>({
    value: '',
    isValid: false,
  });

  const [oldPassword, setOldPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const userContext = React.useContext(CurrentUserContext);
  const currentUser = userContext?.currentUser;
  const isCurrentUser = isLoggedIn(currentUser) && currentUser.login === user.login;

  const handleError = (result: ChangePasswordResults) => {
    if (result === ChangePasswordResults.OldPasswordIncorrect) {
      setErrorTranslationKey('user.old_password_incorrect');
      setSubmitting(false);
    } else {
      setErrorTranslationKey('user.new_password_same_as_old');
      setSubmitting(false);
    }
    return Promise.reject(new Error(result));
  };

  const handleChangePassword = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);
    return changePassword({
      login: user.login,
      password: newPassword.value,
      previousPassword: oldPassword,
    }).then(() => {
      addGlobalSuccessMessage(translate('my_profile.password.changed'));
      setSubmitting(false);
      setNewPassword({ value: '', isValid: false });
    }, handleError);
  };

  const header = translate('my_profile.password.title');

  return (
    <ModalForm
      content={
        <Form.Section>
          {errorTranslationKey && (
            <MessageCallout text={translate(errorTranslationKey)} type="danger" />
          )}
          {isCurrentUser && (
            <TextInput
              autoFocus
              id="old-user-password"
              isRequired
              label={translate('my_profile.password.old')}
              name="old-password"
              onChange={(event) => setOldPassword(event.currentTarget.value)}
              type="password"
              value={oldPassword}
              width={FormFieldWidth.Large}
            />
          )}
          <UserPasswordInput
            onChange={setNewPassword}
            size={FormFieldWidth.Large}
            value={newPassword.value}
          />
        </Form.Section>
      }
      id={PASSWORD_FORM_ID}
      isSubmitDisabled={submitting || !newPassword.isValid}
      isSubmitting={submitting}
      onSubmit={handleChangePassword}
      secondaryButtonLabel={translate('cancel')}
      submitButtonLabel={translate('change_verb')}
      title={header}
    >
      {children}
    </ModalForm>
  );
}
