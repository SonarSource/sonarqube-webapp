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

import { Badge, Divider, SelectionCards } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { translate } from '~sq-server-commons/helpers/l10n';
import { AuthMethod } from '~sq-server-commons/types/system';
import { EmailNotificationFormField } from './EmailNotificationFormField';
import {
  BASIC_PASSWORD,
  EmailNotificationGroupProps,
  OAUTH_AUTHENTICATION_HOST,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_TENANT,
  USERNAME,
} from './utils';

export function AuthenticationSelector(props: Readonly<EmailNotificationGroupProps>) {
  const { configuration, onChange } = props;

  const intl = useIntl();

  const isOAuth = configuration?.authMethod === AuthMethod.OAuth;

  return (
    <div className="sw-pt-6">
      <SelectionCards
        alignment="horizontal"
        ariaLabel={intl.formatMessage({ id: 'email_notification.form.auth_type' })}
        className="sw-mb-8"
        onChange={(v: AuthMethod) => {
          onChange({ authMethod: v });
        }}
        options={[
          {
            value: AuthMethod.Basic,
            label: intl.formatMessage({ id: 'email_notification.form.basic_auth.title' }),
            helpText: intl.formatMessage({ id: 'email_notification.form.basic_auth.description' }),
          },
          {
            value: AuthMethod.OAuth,
            label: intl.formatMessage({ id: 'email_notification.form.oauth_auth.title' }),
            helpText: (
              <p>
                <FormattedMessage id="email_notification.form.oauth_auth.description" />
                <br />
                <FormattedMessage id="email_notification.form.oauth_auth.supported" />
                <br />

                <Badge className="sw-mt-4 sw-mr-1" variety="info">
                  <FormattedMessage id="recommended" />
                </Badge>

                <FormattedMessage id="email_notification.form.oauth_auth.recommended_reason" />
              </p>
            ),
          },
        ]}
        value={isOAuth ? AuthMethod.OAuth : AuthMethod.Basic}
      />

      <Divider className="sw-my-1" />
      <EmailNotificationFormField
        description={translate('email_notification.form.username.description')}
        id={USERNAME}
        name={translate('email_notification.form.username')}
        onChange={(value) => {
          onChange({ username: value });
        }}
        required
        value={configuration.username}
      />
      <Divider className="sw-my-1" />
      {isOAuth ? (
        <>
          <EmailNotificationFormField
            description={translate('email_notification.form.oauth_authentication_host.description')}
            id={OAUTH_AUTHENTICATION_HOST}
            name={translate('email_notification.form.oauth_authentication_host')}
            onChange={(value) => {
              onChange({ oauthAuthenticationHost: value });
            }}
            required
            value={configuration.oauthAuthenticationHost ?? ''}
          />
          <Divider className="sw-my-1" />
          <EmailNotificationFormField
            description={translate('email_notification.form.oauth_client_id.description')}
            hasValue={configuration.isOauthClientIdSet}
            id={OAUTH_CLIENT_ID}
            name={translate('email_notification.form.oauth_client_id')}
            onChange={(value) => {
              onChange({ oauthClientId: value });
            }}
            required
            type="password"
            value={configuration.oauthClientId ?? ''}
          />
          <Divider className="sw-my-1" />
          <EmailNotificationFormField
            description={translate('email_notification.form.oauth_client_secret.description')}
            hasValue={configuration.isOauthClientSecretSet}
            id={OAUTH_CLIENT_SECRET}
            name={translate('email_notification.form.oauth_client_secret')}
            onChange={(value) => {
              onChange({ oauthClientSecret: value });
            }}
            required
            requiresRevaluation
            type="password"
            value={configuration.oauthClientSecret ?? ''}
          />
          <Divider className="sw-my-1" />
          <EmailNotificationFormField
            description={translate('email_notification.form.oauth_tenant.description')}
            id={OAUTH_TENANT}
            name={translate('email_notification.form.oauth_tenant')}
            onChange={(value) => {
              onChange({ oauthTenant: value });
            }}
            required
            value={configuration.oauthTenant ?? ''}
          />
        </>
      ) : (
        <EmailNotificationFormField
          description={translate('email_notification.form.basic_password.description')}
          hasValue={configuration.isBasicPasswordSet}
          id={BASIC_PASSWORD}
          name={translate('email_notification.form.basic_password')}
          onChange={(value) => {
            onChange({ basicPassword: value });
          }}
          required
          requiresRevaluation
          type="password"
          value={configuration.basicPassword ?? ''}
        />
      )}
      <Divider className="sw-my-1" />
    </div>
  );
}
