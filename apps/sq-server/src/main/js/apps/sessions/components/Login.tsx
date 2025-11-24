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
  Heading,
  LogoSize,
  MessageCallout,
  MessageVariety,
  Spinner,
} from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { HtmlFormatter } from '~design-system';
import { useLocation } from '~shared/components/hoc/withRouter';
import { SafeHTMLInjection, SanitizeLevel } from '~shared/helpers/sanitize';
import { SonarQubeProductLogo } from '~sq-server-commons/components/branding/SonarQubeProductLogo';
import { getReturnUrl } from '~sq-server-commons/helpers/urls';
import { useIdentityProvidersQuery } from '~sq-server-commons/queries/users';
import LoginForm from './LoginForm';
import OAuthProviders from './OAuthProviders';

export interface LoginProps {
  message?: string;
}

export default function Login(props: Readonly<LoginProps>) {
  const { message } = props;
  const { data: identityProviders = [], isFetching } = useIdentityProvidersQuery();

  const location = useLocation();
  const { formatMessage } = useIntl();

  const displayError = Boolean(location.query.authorizationError);

  return (
    <div className="sw-flex sw-flex-col sw-w-abs-400 sw-min-w-abs-400" id="login_form">
      <Helmet defer={false} title={formatMessage({ id: 'login.page' })} />
      <div className="sw-typo-lg sw-flex-col">
        <SonarQubeProductLogo className="sw-mb-6" hasText size={LogoSize.Large} />
        <Heading as="h1" className="sw-mb-16">
          <FormattedMessage id="login.login_to_sonarqube" />
        </Heading>

        <Spinner isLoading={isFetching}>
          <>
            {displayError && (
              <MessageCallout className="sw-mb-6" variety={MessageVariety.Danger}>
                {formatMessage({ id: 'login.unauthorized_access_alert' })}
              </MessageCallout>
            )}

            {message !== undefined && message.length > 0 && (
              <HtmlFormatter>
                <SafeHTMLInjection htmlAsString={message} sanitizeLevel={SanitizeLevel.USER_INPUT}>
                  <div className="markdown sw-rounded-2 sw-p-4 sw-mb-6" />
                </SafeHTMLInjection>
              </HtmlFormatter>
            )}

            {identityProviders.length > 0 && (
              <OAuthProviders
                identityProviders={identityProviders}
                returnTo={getReturnUrl(location)}
              />
            )}

            <LoginForm collapsed={identityProviders.length > 0} />
          </>
        </Spinner>
      </div>
    </div>
  );
}
