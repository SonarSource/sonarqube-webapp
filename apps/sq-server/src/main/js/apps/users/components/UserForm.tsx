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
  Button,
  Form,
  FormFieldWidth,
  MessageCallout,
  ModalForm,
  TextInput,
} from '@sonarsource/echoes-react';
import { debounce } from 'lodash';
import * as React from 'react';
import { EmailChangeHandlerParams } from '~sq-server-shared/components/common/EmailInput';
import UserPasswordInput, {
  PasswordChangeHandlerParams,
} from '~sq-server-shared/components/common/UserPasswordInput';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import {
  usePostUserMutation,
  useUpdateUserMutation,
  useUsersQueries,
} from '~sq-server-shared/queries/users';
import { RestUserDetailed } from '~sq-server-shared/types/users';
import { DEBOUNCE_DELAY } from '../../background-tasks/constants';
import UserScmAccountInput from './UserScmAccountInput';

export interface Props {
  children: React.ReactNode;
  isInstanceManaged: boolean;
  onClose?: () => void;
  user?: RestUserDetailed;
}

const MINIMUM_LOGIN_LENGTH = 3;
const MAXIMUM_LOGIN_LENGTH = 255;
const MINIMUM_NAME_LENGTH = 1;
const MAXIMUM_NAME_LENGTH = 200;

export default function UserForm(props: Readonly<Props>) {
  const { children, user, isInstanceManaged, onClose } = props;
  const isCreateUserForm = !user;
  const [email, setEmail] = React.useState<EmailChangeHandlerParams>({
    value: user?.email ?? '',
    isValid: true,
  });
  const [login, setLogin] = React.useState<string>(user?.login ?? '');
  const [invalidMessage, setInvalidMessage] = React.useState<string>('');
  const [name, setName] = React.useState<string | undefined>(user?.name);
  const [password, setPassword] = React.useState<PasswordChangeHandlerParams>({
    value: '',
    isValid: false,
  });
  const [scmAccounts, setScmAccounts] = React.useState<string[]>(user?.scmAccounts ?? []);

  const { mutate: createUser, isPending: isLoadingCreate } = usePostUserMutation();
  const { mutate: updateUser, isPending: isLoadingUserUpdate } = useUpdateUserMutation();

  const { data: usersList } = useUsersQueries<RestUserDetailed>(
    {
      q: login,
    },
    Boolean(login !== '' && isCreateUserForm),
  );

  const isLoginTooShort = login.length < MINIMUM_LOGIN_LENGTH && login !== '';
  const doesLoginHaveValidCharacter = login !== '' ? /^[a-zA-Z0-9._@-]+$/.test(login) : true;
  const doesLoginStartWithLetterOrNumber = login !== '' ? /^\w.*/.test(login) : true;
  const fieldsdMissing = user ? false : name === '' || login === '' || !password.isValid;
  const isEmailInvalid =
    (user && !user.local) || isInstanceManaged || email.value === '' ? false : !email.isValid;

  const handleCreateUser = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    createUser(
      {
        email: email.value !== '' ? email.value : undefined,
        login,
        name: name ?? '',
        password: password.value,
        scmAccounts,
      },
      { onSuccess: onClose },
    );
  };

  const handleUpdateUser = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { user } = props;

    updateUser(
      {
        id: user?.id!,
        data:
          isInstanceManaged || !user?.local
            ? { scmAccounts }
            : {
                email: email.value !== '' ? email.value : null,
                name,
                scmAccounts,
              },
      },
      { onSuccess: onClose },
    );
  };

  const handleAddScmAccount = () => {
    setScmAccounts((scmAccounts) => scmAccounts.concat(''));
  };

  const handleUpdateScmAccount = (idx: number, scmAccount: string) => {
    setScmAccounts((scmAccounts) => {
      const newScmAccounts = scmAccounts.slice();
      newScmAccounts[idx] = scmAccount;
      return newScmAccounts;
    });
  };

  const handleRemoveScmAccount = (idx: number) => {
    setScmAccounts((scmAccounts) => scmAccounts.slice(0, idx).concat(scmAccounts.slice(idx + 1)));
  };

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogin(event.target.value);
  };

  const debouncedChangeHandler = React.useMemo(() => debounce(changeHandler, DEBOUNCE_DELAY), []);

  React.useEffect(() => {
    const users =
      isCreateUserForm && usersList !== undefined
        ? usersList.pages.flatMap((page) => page.users)
        : [];
    const isLoginAlreadyUsed = users.some((u) => u.login === login);

    if (login !== '') {
      let invalidMessage = '';
      if (!doesLoginHaveValidCharacter) {
        invalidMessage = translate('users.login_invalid_characters');
      } else if (isLoginAlreadyUsed) {
        invalidMessage = translate('users.login_already_used');
      } else if (!doesLoginStartWithLetterOrNumber) {
        invalidMessage = translate('users.login_start_with_letter_or_number');
      } else if (isLoginTooShort) {
        invalidMessage = translateWithParameters(
          'users.minimum_x_characters',
          MINIMUM_LOGIN_LENGTH,
        );
      }

      setInvalidMessage(invalidMessage);
    }
  }, [login, usersList]);

  const validationName = () => {
    if (name !== undefined) {
      return name.trim() === '' ? 'invalid' : 'valid';
    }
    return undefined;
  };

  return (
    <ModalForm
      content={
        <>
          <Form.Section>
            {user && !user.local && (
              <MessageCallout
                className="sw-mb-4"
                text={translate('users.cannot_update_delegated_user')}
                type="warning"
              />
            )}

            {isCreateUserForm && (
              <TextInput
                autoComplete="off"
                autoFocus
                id="create-user-login"
                isRequired={!isInstanceManaged}
                label={translate('login')}
                maxLength={MAXIMUM_LOGIN_LENGTH}
                messageInvalid={invalidMessage ?? ''}
                minLength={MINIMUM_LOGIN_LENGTH}
                name="login"
                onChange={debouncedChangeHandler}
                type="text"
                validation={invalidMessage ? 'invalid' : undefined}
                width={FormFieldWidth.Full}
              />
            )}

            {isCreateUserForm && (
              <UserPasswordInput
                onChange={(password) => setPassword(password)}
                size={FormFieldWidth.Full}
                value={password.value}
              />
            )}

            <TextInput
              autoComplete="off"
              autoFocus={!!user}
              id="create-user-name"
              isDisabled={(user && !user.local) || isInstanceManaged}
              isRequired={!isInstanceManaged}
              label={translate('name')}
              maxLength={MAXIMUM_NAME_LENGTH}
              messageInvalid={translateWithParameters(
                'users.minimum_x_characters',
                MINIMUM_NAME_LENGTH,
              )}
              name="name"
              onChange={(e) => setName(e.currentTarget.value)}
              type="text"
              validation={validationName()}
              value={name ?? ''}
              width={FormFieldWidth.Full}
            />
            <TextInput
              id="create-user-email"
              isDisabled={(user && !user.local) || isInstanceManaged}
              label={translate('users.email')}
              messageInvalid={translate('users.email.invalid')}
              onChange={(e) =>
                setEmail({ value: e.target.value, isValid: e.target.validity.valid })
              }
              type="email"
              validation={!email.isValid ? 'invalid' : undefined}
              value={email.value}
            />
          </Form.Section>
          <Form.Section
            description={translate('user.login_or_email_used_as_scm_account')}
            title={translate('my_profile.scm_accounts')}
          >
            {scmAccounts.map((scm, idx) => (
              <UserScmAccountInput
                idx={idx}
                key={'my_profile.scm_accounts_' + idx}
                onChange={handleUpdateScmAccount}
                onRemove={handleRemoveScmAccount}
                scmAccount={scm}
              />
            ))}

            <div>
              <Button className="it__scm-account-add" onClick={handleAddScmAccount}>
                {translate('add_verb')}
              </Button>
            </div>
          </Form.Section>
        </>
      }
      isSubmitDisabled={
        isLoadingCreate ||
        isLoadingUserUpdate ||
        fieldsdMissing ||
        isEmailInvalid ||
        Boolean(invalidMessage)
      }
      onSubmit={user ? handleUpdateUser : handleCreateUser}
      secondaryButtonLabel={translate('cancel')}
      submitButtonLabel={user ? translate('update_verb') : translate('create')}
      title={user ? translate('users.update_user') : translate('users.create_user')}
    >
      {children}
    </ModalForm>
  );
}
