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

import { Button, ButtonVariety, Form, LinkStandalone, TextInput } from '@sonarsource/echoes-react';
import * as React from 'react';
import { translate } from '~sq-server-commons/helpers/l10n';

interface Props {
  collapsed?: boolean;
  onSubmit: (login: string, password: string) => Promise<void>;
}

interface State {
  collapsed: boolean;
  loading: boolean;
  login: string;
  password: string;
}

const LOGIN_INPUT_ID = 'login-input';
const PASSWORD_INPUT_ID = 'password-input';

export default class LoginForm extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      collapsed: Boolean(props.collapsed),
      loading: false,
      login: '',
      password: '',
    };
  }

  stopLoading = () => {
    this.setState({ loading: false });
  };

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.setState({ loading: true });
    this.props
      .onSubmit(this.state.login, this.state.password)
      .then(this.stopLoading, this.stopLoading);
  };

  handleMoreOptionsClick = () => {
    this.setState({ collapsed: false });
  };

  handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ login: event.currentTarget.value });
  };

  handlePwdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: event.currentTarget.value });
  };

  render() {
    if (this.state.collapsed) {
      return (
        <Button
          aria-expanded={false}
          className="sw-w-full sw-justify-center"
          onClick={this.handleMoreOptionsClick}
        >
          {translate('login.more_options')}
        </Button>
      );
    }
    return (
      <Form className="sw-w-full" onSubmit={this.handleSubmit}>
        <Form.Section>
          <TextInput
            autoFocus
            id={LOGIN_INPUT_ID}
            isRequired
            label={translate('login')}
            maxLength={255}
            name="login"
            onChange={this.handleLoginChange}
            type="text"
            value={this.state.login}
            width="full"
          />

          <TextInput
            id={PASSWORD_INPUT_ID}
            isRequired
            label={translate('password')}
            name="password"
            onChange={this.handlePwdChange}
            type="password"
            value={this.state.password}
            width="full"
          />
        </Form.Section>
        <Form.Footer side="right">
          <LinkStandalone to="/">{translate('go_back')}</LinkStandalone>
          <Button
            isDisabled={this.state.loading}
            size="medium"
            type="submit"
            variety={ButtonVariety.Primary}
          >
            {translate('sessions.log_in')}
          </Button>
        </Form.Footer>
      </Form>
    );
  }
}
