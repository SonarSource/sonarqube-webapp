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

import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Button,
  ButtonIcon,
  ButtonVariety,
  FormFieldWidth,
  IconCheckCircle,
  IconDelete,
  Link,
  Select,
  Spinner,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { generateToken, getTokens, revokeToken } from '../../../api/user-tokens';
import { Note, ToggleButton, ToggleButtonsOption } from '../../../design-system';
import { DocLink } from '../../../helpers/doc-links';
import { translate } from '../../../helpers/l10n';
import {
  EXPIRATION_OPTIONS,
  computeTokenExpirationDate,
  getAvailableExpirationOptions,
} from '../../../helpers/tokens';
import { TokenExpiration, TokenType, UserToken } from '../../../types/token';
import { LoggedInUser } from '../../../types/users';
import DocumentationLink from '../../common/DocumentationLink';
import ProjectTokenScopeInfo from '../components/ProjectTokenScopeInfo';
import Step from '../components/Step';
import { getUniqueTokenName } from '../utils';

interface Props {
  currentUser: Pick<LoggedInUser, 'login'>;
  finished: boolean;
  initialTokenName?: string;
  onContinue: (token: string) => void;
  onOpen: VoidFunction;
  open: boolean;
  projectKey: string;
  stepNumber: number;
}

interface State {
  existingToken: string;
  loading: boolean;
  selection: string;
  token?: string;
  tokenExpiration: string;
  tokenExpirationOptions: { label: string; value: string }[];
  tokenName?: string;
  tokens?: UserToken[];
}

const TOKEN_FORMAT_REGEX = /^[_a-z0-9]+$/;

enum TokenUse {
  GENERATE = 'generate',
  EXISTING = 'use-existing',
}

export default class TokenStep extends React.PureComponent<Props, State> {
  mounted = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      existingToken: '',
      loading: false,
      selection: TokenUse.GENERATE,
      tokenName: props.initialTokenName,
      tokenExpiration: TokenExpiration.OneMonth,
      tokenExpirationOptions: EXPIRATION_OPTIONS,
    };
  }

  async componentDidMount() {
    this.mounted = true;
    const { currentUser, initialTokenName } = this.props;
    const { tokenName } = this.state;

    const tokenExpirationOptions = await getAvailableExpirationOptions();
    if (tokenExpirationOptions && this.mounted) {
      this.setState({ tokenExpirationOptions });
    }

    const tokens = await getTokens(currentUser.login).catch(() => {
      /* noop */
    });

    if (tokens && this.mounted) {
      this.setState({ tokens });
      if (initialTokenName !== undefined && initialTokenName === tokenName) {
        this.setState({
          tokenName: getUniqueTokenName(tokens, initialTokenName),
        });
      }
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getToken = () =>
    this.state.selection === TokenUse.GENERATE ? this.state.token : this.state.existingToken;

  canContinue = () => {
    const { existingToken, selection, token } = this.state;
    const validExistingToken = TOKEN_FORMAT_REGEX.exec(existingToken) != null;
    return (
      (selection === TokenUse.GENERATE && token != null) ||
      (selection === TokenUse.EXISTING && existingToken && validExistingToken)
    );
  };

  handleTokenNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ tokenName: event.target.value });
  };

  handleTokenGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { tokenName, tokenExpiration } = this.state;
    const { projectKey } = this.props;

    if (tokenName) {
      this.setState({ loading: true });
      try {
        const { token } = await generateToken({
          name: tokenName,
          type: TokenType.Project,
          projectKey,
          ...(tokenExpiration !== TokenExpiration.NoExpiration && {
            expirationDate: computeTokenExpirationDate(Number(tokenExpiration)),
          }),
        });
        if (this.mounted) {
          this.setState({ loading: false, token });
        }
      } catch (e) {
        this.stopLoading();
      }
    }
  };

  handleTokenRevoke = () => {
    const { tokenName } = this.state;
    if (tokenName) {
      this.setState({ loading: true });
      revokeToken({ name: tokenName }).then(() => {
        if (this.mounted) {
          this.setState({
            loading: false,
            token: undefined,
            tokenName: undefined,
          });
        }
      }, this.stopLoading);
    }
  };

  handleContinueClick = () => {
    const token = this.getToken();
    if (token) {
      this.props.onContinue(token);
    }
  };

  handleModeChange = (mode: string) => {
    this.setState({ selection: mode });
  };

  handleExisingTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ existingToken: event.currentTarget.value });
  };

  stopLoading = () => {
    if (this.mounted) {
      this.setState({ loading: false });
    }
  };

  renderGenerateOption = () => {
    const { loading, tokenName, tokenExpiration, tokenExpirationOptions } = this.state;
    const toggleTipContent = (
      <>
        <div>{translate('onboarding.token.name.help')}</div>
        <DocumentationLink to={DocLink.AccountTokens}>{translate('learn_more')}</DocumentationLink>
      </>
    );
    return (
      <DivAnimated className="sw-mt-4">
        <form className="sw-flex" onSubmit={this.handleTokenGenerate}>
          <div className="sw-flex">
            <TextInput
              autoFocus
              helpToggletipProps={{
                description: toggleTipContent,
              }}
              id="generate-token-input"
              isRequired
              label={translate('onboarding.token.name.label')}
              onChange={this.handleTokenNameChange}
              type="text"
              value={tokenName ?? ''}
              width={FormFieldWidth.Large}
            />
          </div>
          <div className="sw-ml-4">
            <div className="sw-flex sw-items-end">
              <Select
                className="sw-w-abs-150 sw-mr-4"
                data={tokenExpirationOptions}
                id="token-select-expiration"
                isNotClearable
                isSearchable={false}
                label={translate('users.tokens.expires_in')}
                onChange={(value) => {
                  this.setState({ tokenExpiration: value ?? '' });
                }}
                value={tokenExpiration}
              />
              <div>
                <Button isDisabled={!tokenName || loading} isLoading={loading} type="submit">
                  {translate('onboarding.token.generate')}
                </Button>
              </div>
            </div>
          </div>
        </form>
        <ProjectTokenScopeInfo className="sw-mt-6 sw-w-1/2" />
      </DivAnimated>
    );
  };

  renderUseExistingOption = () => {
    const { existingToken } = this.state;
    const validInput = !existingToken || TOKEN_FORMAT_REGEX.exec(existingToken) != null;

    const toggleTipContent = (
      <>
        <div>{translate('onboarding.token.name.help')}</div>
        <DocumentationLink to={DocLink.AccountTokens}>{translate('learn_more')}</DocumentationLink>
      </>
    );

    return (
      <DivAnimated className="sw-mt-4">
        {this.state.selection === TokenUse.EXISTING && (
          <div className="sw-flex sw-flex-col sw-mt-4">
            <TextInput
              autoFocus
              helpToggletipProps={{
                description: toggleTipContent,
              }}
              id="existing-token-input"
              isRequired
              label={translate('onboarding.token.use_existing_token.label')}
              messageInvalid={translate('onboarding.token.invalid_format')}
              onChange={this.handleExisingTokenChange}
              type="text"
              validation={!validInput ? 'invalid' : 'none'}
              value={this.state.existingToken}
              width={FormFieldWidth.Large}
            />
          </div>
        )}
      </DivAnimated>
    );
  };

  renderForm = () => {
    const { loading, selection, token, tokenName, tokens } = this.state;
    const canUseExisting = tokens !== undefined && tokens.length > 0;

    const modeOptions: Array<ToggleButtonsOption<string>> = [
      {
        label: translate('onboarding.token.generate', TokenType.Project),
        value: TokenUse.GENERATE,
      },
      {
        label: translate('onboarding.token.use_existing_token'),
        value: TokenUse.EXISTING,
        disabled: !canUseExisting,
      },
    ];

    return (
      <div className="sw-p-4">
        {token != null ? (
          <form className="sw-flex sw-items-center" onSubmit={this.handleTokenRevoke}>
            <span>
              {tokenName}
              {': '}
              <strong className="sw-font-semibold">{token}</strong>
            </span>

            <Spinner className="sw-ml-3 sw-my-2" isLoading={loading}>
              <ButtonIcon
                Icon={IconDelete}
                ariaLabel={translate('onboarding.token.delete')}
                className="sw-ml-1"
                onClick={this.handleTokenRevoke}
                variety={ButtonVariety.DangerGhost}
              />
            </Spinner>
          </form>
        ) : (
          <div>
            <ToggleButton
              onChange={this.handleModeChange}
              options={modeOptions}
              value={selection}
            />

            <div className="sw-ml-4">
              {selection === TokenUse.GENERATE && this.renderGenerateOption()}
              {selection === TokenUse.EXISTING && this.renderUseExistingOption()}
            </div>
          </div>
        )}

        <Note as="div" className="sw-mt-6 sw-w-1/2">
          <FormattedMessage
            id="onboarding.token.text"
            values={{
              link: (
                <Link shouldOpenInNewTab to="/account/security">
                  {translate('onboarding.token.text.user_account')}
                </Link>
              ),
            }}
          />
        </Note>

        {this.canContinue() && (
          <div className="sw-mt-4">
            <Button onClick={this.handleContinueClick}>{translate('continue')}</Button>
          </div>
        )}
      </div>
    );
  };

  renderResult = () => {
    const { selection, tokenName } = this.state;
    const token = this.getToken();

    if (!token) {
      return null;
    }

    return (
      <div className="sw-flex sw-items-center">
        <IconCheckCircle className="sw-mr-2" color="echoes-color-icon-success" />
        <span>
          {selection === TokenUse.GENERATE && tokenName && `${tokenName}: `}
          <strong className="sw-ml-1">{token}</strong>
        </span>
      </div>
    );
  };

  render() {
    return (
      <Step
        finished={this.props.finished}
        onOpen={this.props.onOpen}
        open={this.props.open}
        renderForm={this.renderForm}
        renderResult={this.renderResult}
        stepNumber={this.props.stepNumber}
        stepTitle={translate('onboarding.token.header')}
      />
    );
  }
}

const appearAnimation = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const DivAnimated = styled.div`
  animation: 0.3s ease-out ${appearAnimation};
`;
