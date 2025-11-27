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

import styled from '@emotion/styled';
import {
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  cssVar,
  Form,
  IconVisibility,
  IconVisibilityOff,
  MessageCallout,
  MessageVariety,
  TextInput,
} from '@sonarsource/echoes-react';
import { ChangeEvent, FormEvent, MouseEvent, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import tw from 'twin.macro';
import { useLocation } from '~shared/components/hoc/withRouter';
import { getReturnUrl } from '~sq-server-commons/helpers/urls';
import { useLoginMutation } from '~sq-server-commons/queries/authentication';

interface Props {
  collapsed: boolean;
  onExpandClick: () => void;
}

export default function LoginForm({ collapsed, onExpandClick }: Readonly<Props>) {
  const location = useLocation();
  const { mutate, isPending } = useLoginMutation();
  const loginInputRef = useRef<HTMLInputElement>(null);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAuthenticationError, setShowAuthenticationError] = useState(false);
  const { formatMessage } = useIntl();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    mutate(
      { login, password },
      {
        onSuccess: () => {
          setShowAuthenticationError(false);
          globalThis.location.replace(getReturnUrl(location));
        },
        onError: () => {
          setShowAuthenticationError(true);
        },
      },
    );
  };

  const handleMoreOptionsClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onExpandClick();
    // To focus the login input after the collapse animation has finished
    if (loginInputRef.current) {
      loginInputRef.current.focus();
    }
  };

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLogin(event.currentTarget.value);
  };

  const handlePwdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  };

  return (
    <>
      {showAuthenticationError && (
        <MessageCallout className="sw-mt-6" variety={MessageVariety.Danger}>
          {formatMessage({ id: 'login.authentication_failed' })}
        </MessageCallout>
      )}
      <Form className="sw-w-full" onSubmit={handleSubmit}>
        <LoginFormCollapseContainer isCollapsed={collapsed}>
          <LoginFormCollapseUsername isCollapsed={collapsed}>
            <TextInput
              id="login-input"
              isRequired
              label={formatMessage({ id: 'username' })}
              maxLength={255}
              name="login"
              onChange={handleLoginChange}
              placeholder={formatMessage({ id: 'login.username.placeholder' })}
              ref={loginInputRef}
              type="text"
              validation={showAuthenticationError ? 'invalid' : 'none'}
              value={login}
              width="full"
            />
          </LoginFormCollapseUsername>

          <LoginFormCollapsePassword isCollapsed={collapsed}>
            <TextInput
              id="password-input"
              isDisabled={isPending}
              isRequired
              label={formatMessage({ id: 'password' })}
              name="password"
              onChange={handlePwdChange}
              placeholder={formatMessage({ id: 'login.password.placeholder' })}
              suffix={
                <ButtonIcon
                  Icon={showPassword ? IconVisibilityOff : IconVisibility}
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
              validation={showAuthenticationError ? 'invalid' : 'none'}
              value={password}
            />
          </LoginFormCollapsePassword>
        </LoginFormCollapseContainer>

        <Form.Footer className="sw-w-full">
          <LoginFormButton
            aria-expanded={!collapsed}
            isDisabled={
              isPending || (collapsed ? false : password.length === 0 || login.length === 0)
            }
            onClick={collapsed ? handleMoreOptionsClick : undefined}
            size="medium"
            type={collapsed ? 'button' : 'submit'}
            variety={collapsed ? ButtonVariety.Default : ButtonVariety.Primary}
          >
            {formatMessage({ id: collapsed ? 'login.more_options' : 'sessions.log_in' })}
          </LoginFormButton>
        </Form.Footer>
      </Form>
    </>
  );
}

const LoginFormCollapseContainer = styled.div<{ isCollapsed: boolean }>`
  margin-top: ${({ isCollapsed }) => (isCollapsed ? 0 : cssVar('dimension-space-200'))};
  max-height: ${({ isCollapsed }) => (isCollapsed ? 0 : '18.75rem')};
  overflow: ${({ isCollapsed }) => (isCollapsed ? 'hidden' : 'visible')};
  transition: max-height 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
`;

const LoginFormCollapseUsername = styled.div<{ isCollapsed: boolean }>`
  margin-top: ${({ isCollapsed }) => (isCollapsed ? 0 : cssVar('dimension-space-100'))};
  opacity: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)};
  transition: opacity 0.3s ease-in 0.1s;
`;

const LoginFormCollapsePassword = styled.div<{ isCollapsed: boolean }>`
  margin-top: ${({ isCollapsed }) => (isCollapsed ? 0 : cssVar('dimension-space-200'))};
  opacity: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)};
  transition: opacity 0.3s ease-in 0.1s;
`;

const LoginFormButton = styled(Button)`
  ${tw`sw-w-full sw-justify-center`}
  transition:
    background-color 0.3s ease-in-out,
    color 0.3s ease-in-out;
`;
