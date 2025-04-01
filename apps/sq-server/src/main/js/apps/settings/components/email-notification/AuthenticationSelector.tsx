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

import { Divider } from '@sonarsource/echoes-react';
import { Note, SelectionCard } from '~design-system';
import { translate } from '~sq-server-shared/helpers/l10n';
import { AuthMethod } from '~sq-server-shared/types/system';
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

  const isOAuth = configuration?.authMethod === AuthMethod.OAuth;

  return (
    <div className="sw-pt-6">
      <div className="sw-pb-6 sw-flex sw-gap-4 sw-space-between">
        <SelectionCard
          className="sw-w-full"
          onClick={() => {
            onChange({ authMethod: AuthMethod.Basic });
          }}
          selected={!isOAuth}
          title={translate('email_notification.form.basic_auth.title')}
        >
          <Note>{translate('email_notification.form.basic_auth.description')}</Note>
        </SelectionCard>
        <SelectionCard
          className="sw-w-full"
          onClick={() => {
            onChange({ authMethod: AuthMethod.OAuth });
          }}
          recommended
          recommendedReason={translate('email_notification.form.oauth_auth.recommended_reason')}
          selected={isOAuth}
          title={translate('email_notification.form.oauth_auth.title')}
        >
          <Note>{translate('email_notification.form.oauth_auth.description')}</Note>
          <Note>{translate('email_notification.form.oauth_auth.supported')}</Note>
        </SelectionCard>
      </div>
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
