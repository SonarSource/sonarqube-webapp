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

import { TextInput } from '@sonarsource/echoes-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface SlackIntegrationConfigurationFormProps {
  isUpdate?: boolean;
  setSlackConfiguration: (slackConfiguration: {
    clientId: string;
    clientSecret: string;
    signingSecret: string;
  }) => void;
  slackConfiguration: {
    clientId: string;
    clientSecret: string;
    signingSecret: string;
  };
}

export function SlackIntegrationConfigurationForm({
  isUpdate = false,
  slackConfiguration,
  setSlackConfiguration,
}: Readonly<SlackIntegrationConfigurationFormProps>) {
  const { formatMessage } = useIntl();

  const [clientId, setClientId] = useState(slackConfiguration.clientId);
  const [clientSecret, setClientSecret] = useState(slackConfiguration.clientSecret);
  const [signingSecret, setSigningSecret] = useState(slackConfiguration.signingSecret);

  const slackConfigurationForm = useMemo(
    () => ({
      clientId,
      clientSecret,
      signingSecret,
    }),
    [clientId, clientSecret, signingSecret],
  );

  const deferredSlackConfigurationForm = useDeferredValue(slackConfigurationForm);

  const onChangeClientId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientId(e.target.value);
  };
  const onChangeClientSecret = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientSecret(e.target.value);
  };
  const onChangeSigningSecret = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSigningSecret(e.target.value);
  };

  useEffect(() => {
    setSlackConfiguration(deferredSlackConfigurationForm);
  }, [deferredSlackConfigurationForm, setSlackConfiguration]);

  return (
    <div className="sw-flex sw-flex-col sw-gap-4">
      <TextInput
        isRequired
        label={<FormattedMessage id="settings.slack.configuration.client_id" />}
        name="clientId"
        onChange={onChangeClientId}
        value={slackConfiguration.clientId}
      />
      <TextInput
        isRequired={!isUpdate}
        label={<FormattedMessage id="settings.slack.configuration.client_secret" />}
        name="clientSecret"
        onChange={onChangeClientSecret}
        placeholder={
          isUpdate
            ? formatMessage({ id: 'settings.slack.configuration.secret_placeholder' })
            : undefined
        }
        type="password"
        value={slackConfiguration.clientSecret}
      />
      <TextInput
        isRequired={!isUpdate}
        label={<FormattedMessage id="settings.slack.configuration.signing_secret" />}
        name="signingSecret"
        onChange={onChangeSigningSecret}
        placeholder={
          isUpdate
            ? formatMessage({ id: 'settings.slack.configuration.secret_placeholder' })
            : undefined
        }
        type="password"
        value={slackConfiguration.signingSecret}
      />
    </div>
  );
}
