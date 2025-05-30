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

import styled from '@emotion/styled';
import { Heading, LogoSize, LogoSonar, MessageCallout, Spinner } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import {
  Card,
  HtmlFormatter,
  PageContentFontWrapper,
  themeBorder,
  themeColor,
} from '~design-system';
import { SafeHTMLInjection, SanitizeLevel } from '~shared/helpers/sanitize';
import { Location } from '~shared/types/router';
import { SonarQubeProductLogo } from '~sq-server-commons/components/branding/SonarQubeProductLogo';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getReturnUrl } from '~sq-server-commons/helpers/urls';
import { IdentityProvider } from '~sq-server-commons/types/types';
import LoginForm from './LoginForm';
import OAuthProviders from './OAuthProviders';

export interface LoginProps {
  identityProviders: IdentityProvider[];
  loading: boolean;
  location: Location;
  message?: string;
  onSubmit: (login: string, password: string) => Promise<void>;
}

export default function Login(props: Readonly<LoginProps>) {
  const { identityProviders, loading, location, message } = props;
  const returnTo = getReturnUrl(location);
  const displayError = Boolean(location.query.authorizationError);

  return (
    <div className="sw-flex sw-flex-col sw-items-center sw-pt-32" id="login_form">
      <Helmet defer={false} title={translate('login.page')} />
      <LogoSonar hasText size={LogoSize.Large} />
      <Card className="sw-my-14 sw-p-0 sw-w-abs-350">
        <PageContentFontWrapper className="sw-typo-lg sw-flex sw-flex-col sw-items-center sw-py-8 sw-px-4">
          <SonarQubeProductLogo size={LogoSize.Small} />
          <Heading as="h1" className="sw-my-6 sw-text-center">
            <FormattedMessage id="login.login_to_sonarqube" />
          </Heading>
          <Spinner isLoading={loading}>
            <>
              {displayError && (
                <MessageCallout
                  className="sw-mb-6"
                  text={translate('login.unauthorized_access_alert')}
                  type="danger"
                />
              )}

              {message !== undefined && message.length > 0 && (
                <HtmlFormatter>
                  <SafeHTMLInjection
                    htmlAsString={message}
                    sanitizeLevel={SanitizeLevel.USER_INPUT}
                  >
                    <StyledMessage className="markdown sw-rounded-2 sw-p-4 sw-mb-6" />
                  </SafeHTMLInjection>
                </HtmlFormatter>
              )}

              {identityProviders.length > 0 && (
                <OAuthProviders identityProviders={identityProviders} returnTo={returnTo} />
              )}

              <LoginForm collapsed={identityProviders.length > 0} onSubmit={props.onSubmit} />
            </>
          </Spinner>
        </PageContentFontWrapper>
      </Card>
    </div>
  );
}

const StyledMessage = styled.div`
  background: ${themeColor('highlightedSection')};
  border: ${themeBorder('default', 'highlightedSectionBorder')};
`;
