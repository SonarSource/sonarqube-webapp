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
  ButtonIcon,
  ButtonVariety,
  IconDelete,
  Link,
  MessageCallout,
  Modal,
  Select,
  Spinner,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { generateToken, getTokens, revokeToken } from '../../../api/user-tokens';
import { ClipboardIconButton } from '../../../design-system';
import { translate, translateWithParameters } from '../../../helpers/l10n';
import {
  EXPIRATION_OPTIONS,
  computeTokenExpirationDate,
  getAvailableExpirationOptions,
} from '../../../helpers/tokens';
import { hasGlobalPermission } from '../../../helpers/users';
import { Permissions } from '../../../types/permissions';
import { TokenExpiration, TokenType } from '../../../types/token';
import { Component } from '../../../types/types';
import { LoggedInUser } from '../../../types/users';
import { getUniqueTokenName } from '../utils';
import { InlineSnippet } from './InlineSnippet';
import ProjectTokenScopeInfo from './ProjectTokenScopeInfo';

interface State {
  loading: boolean;
  token?: string;
  tokenExpiration: string;
  tokenExpirationOptions: { label: string; value: string }[];
  tokenName: string;
}

interface Props {
  component: Component;
  currentUser: LoggedInUser;
  preferredTokenType?: TokenType.Global | TokenType.Project;
}

export default class EditTokenModal extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = {
    loading: true,
    tokenName: '',
    tokenExpiration: TokenExpiration.OneMonth,
    tokenExpirationOptions: EXPIRATION_OPTIONS,
  };

  componentDidMount() {
    this.mounted = true;
    this.getTokensAndName();
    this.getTokenExpirationOptions();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getTokensAndName = async () => {
    const { component, currentUser } = this.props;

    const tokens = await getTokens(currentUser.login);

    if (this.mounted) {
      this.setState({
        loading: false,
        tokenName: getUniqueTokenName(tokens, `Analyze "${component.name}"`),
      });
    }
  };

  getTokenExpirationOptions = async () => {
    const tokenExpirationOptions = await getAvailableExpirationOptions();
    if (tokenExpirationOptions && this.mounted) {
      this.setState({ tokenExpirationOptions });
    }
  };

  getNewToken = async () => {
    const {
      component: { key },
    } = this.props;
    const { tokenName, tokenExpiration } = this.state;

    const type = this.getTokenType();

    const { token } = await generateToken({
      name: tokenName,
      type,
      projectKey: key,
      ...(tokenExpiration !== TokenExpiration.NoExpiration && {
        expirationDate: computeTokenExpirationDate(Number(tokenExpiration)),
      }),
    });

    if (this.mounted) {
      this.setState({
        token,
        tokenName,
      });
    }
  };

  getTokenType = () => {
    const { currentUser, preferredTokenType } = this.props;

    return preferredTokenType === TokenType.Global &&
      hasGlobalPermission(currentUser, Permissions.Scan)
      ? TokenType.Global
      : TokenType.Project;
  };

  handleTokenNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ tokenName: event.currentTarget.value });
  };

  handleTokenRevoke = async () => {
    const { tokenName } = this.state;

    if (tokenName) {
      await revokeToken({ name: tokenName });

      if (this.mounted) {
        this.setState({
          token: '',
          tokenName: '',
        });
      }
    }
  };

  renderForm(type: TokenType) {
    const { loading, token, tokenName, tokenExpiration, tokenExpirationOptions } = this.state;

    return (
      <div className="sw-typo-default">
        {token ? (
          <>
            <span>
              {tokenName}
              {': '}
            </span>
            <div>
              <InlineSnippet snippet={token} />
              <ClipboardIconButton
                copyLabel={translate('copy_to_clipboard')}
                className="sw-ml-2"
                copyValue={token}
              />
              <ButtonIcon
                variety={ButtonVariety.DangerGhost}
                className="sw-ml-1"
                ariaLabel={translate('onboarding.token.delete')}
                onClick={this.handleTokenRevoke}
                Icon={IconDelete}
              />
            </div>
            <MessageCallout
              className="sw-mt-2"
              type="warning"
              text={translateWithParameters('users.tokens.new_token_created', token)}
            />
          </>
        ) : (
          <>
            <div className="sw-flex sw-pt-4">
              <Spinner isLoading={loading}>
                <div className="sw-flex-col sw-mr-2">
                  <TextInput
                    label={translate('onboarding.token.name.label')}
                    id="generate-token-input"
                    placeholder={translate('onboarding.token.name.placeholder')}
                    autoFocus
                    onChange={this.handleTokenNameChange}
                    isRequired
                    type="text"
                    width="medium"
                    value={tokenName ?? ''}
                  />
                </div>
                <div className="sw-flex-col">
                  <div className="sw-flex sw-items-end">
                    <Select
                      label={translate('users.tokens.expires_in')}
                      id="token-select-expiration"
                      className="sw-w-abs-150 sw-mr-2"
                      isSearchable={false}
                      isNotClearable
                      onChange={(value) => this.setState({ tokenExpiration: value ?? '' })}
                      data={tokenExpirationOptions}
                      value={tokenExpiration}
                    />
                    <div>
                      <Button isDisabled={!tokenName} onClick={this.getNewToken}>
                        {translate('onboarding.token.generate')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Spinner>
            </div>
            {type === TokenType.Project && <ProjectTokenScopeInfo />}
          </>
        )}
      </div>
    );
  }

  render() {
    const { loading } = this.state;
    const type = this.getTokenType();
    const header = translate('onboarding.token.generate', type);
    const intro = translate('onboarding.token.text', type);
    return (
      <Modal
        content={this.renderForm(type)}
        description={
          <FormattedMessage
            defaultMessage={intro}
            id={intro}
            values={{
              link: (
                <Link shouldOpenInNewTab to="/account/security">
                  {translate('onboarding.token.text.user_account')}
                </Link>
              ),
            }}
          />
        }
        secondaryButton={<Button isDisabled={loading}>{translate('continue')}</Button>}
        title={header}
      >
        <Button className="sw-ml-2">{translate('onboarding.token.generate.long')}</Button>
      </Modal>
    );
  }
}
