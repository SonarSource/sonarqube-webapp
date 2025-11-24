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
  TextInput,
  toast,
  ToastDuration,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from '~shared/components/hoc/withRouter';
import { getReturnUrl } from '~sq-server-commons/helpers/urls';
import { useLoginMutation } from '~sq-server-commons/queries/authentication';

interface Props {
  collapsed: boolean;
}

const LOGIN_INPUT_ID = 'login-input';
const PASSWORD_INPUT_ID = 'password-input';

export default function LoginForm({ collapsed }: Readonly<Props>) {
  const location = useLocation();
  const { mutate, isPending } = useLoginMutation();

  const [isCollapsed, setIsCollapsed] = React.useState(Boolean(collapsed));
  const [login, setLogin] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { formatMessage } = useIntl();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    mutate(
      { login, password },
      {
        onSuccess: () => {
          globalThis.location.replace(getReturnUrl(location));
        },
        onError: () => {
          toast.error({
            description: formatMessage({ id: 'login.authentication_failed' }),
            duration: ToastDuration.Short,
          });
        },
      },
    );
  };

  const handleMoreOptionsClick = () => {
    setIsCollapsed(false);
  };

  const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogin(event.currentTarget.value);
  };

  const handlePwdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  };

  if (isCollapsed) {
    return (
      <Button
        aria-expanded={false}
        className="sw-w-full sw-justify-center"
        onClick={handleMoreOptionsClick}
      >
        {formatMessage({ id: 'login.more_options' })}
      </Button>
    );
  }

  return (
    <Form className="sw-w-full" onSubmit={handleSubmit}>
      <Form.Section>
        <TextInput
          autoFocus
          id={LOGIN_INPUT_ID}
          isRequired
          label={formatMessage({ id: 'login' })}
          maxLength={255}
          name="login"
          onChange={handleLoginChange}
          type="text"
          value={login}
          width="full"
        />

        <TextInput
          id={PASSWORD_INPUT_ID}
          isRequired
          label={formatMessage({ id: 'password' })}
          name="password"
          onChange={handlePwdChange}
          type="password"
          value={password}
          width="full"
        />
      </Form.Section>
      <Form.Footer side="right">
        <Button isDisabled={isPending} size="medium" type="submit" variety={ButtonVariety.Primary}>
          {formatMessage({ id: 'sessions.log_in' })}
        </Button>
      </Form.Footer>
    </Form>
  );
}
