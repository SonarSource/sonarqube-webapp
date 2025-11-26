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
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  Form,
  IconX,
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

export default function LoginForm({ collapsed }: Readonly<Props>) {
  const location = useLocation();
  const { mutate, isPending } = useLoginMutation();

  const [isCollapsed, setIsCollapsed] = React.useState(Boolean(collapsed));
  const [login, setLogin] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
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
          id="login-input"
          isRequired
          label={formatMessage({ id: 'username' })}
          maxLength={255}
          name="login"
          onChange={handleLoginChange}
          placeholder={formatMessage({ id: 'login.username.placeholder' })}
          type="text"
          value={login}
          width="full"
        />

        <TextInput
          autoComplete="current-password"
          isDisabled={isPending}
          isRequired
          label={formatMessage({ id: 'password' })}
          name="password"
          onChange={handlePwdChange}
          placeholder={formatMessage({ id: 'login.password.placeholder' })}
          suffix={
            <ButtonIcon
              Icon={IconX}
              ariaLabel={
                showPassword
                  ? formatMessage({ id: 'login.hide_password' })
                  : formatMessage({ id: 'login.show_password' })
              }
              isDisabled={isPending}
              onClick={() => {
                setShowPassword(!showPassword);
              }}
              size={ButtonSize.Medium}
              variety={ButtonVariety.DefaultGhost}
            />
          }
          type={showPassword ? 'text' : 'password'}
          value={password}
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
