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
  ButtonGroup,
  ButtonVariety,
  Card,
  HelperText,
  Text,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { IntegrationConfiguration } from '~sq-server-commons/types/integrations';
import { SlackIntegrationConfigurationDeletion } from './SlackIntegrationConfigurationDeletion';
import { SlackIntegrationConfigurationUpdate } from './SlackIntegrationConfigurationUpdate';
import { useSlackAppDirectInstallUrl } from './hooks';

interface SlackIntegrationConfiguredProps {
  className?: string;
  slackConfiguration: IntegrationConfiguration;
}

export function SlackIntegrationConfigured({
  className,
  slackConfiguration,
}: Readonly<SlackIntegrationConfiguredProps>) {
  const { slackAppDirectInstallUrl, isLoading: isLoadingSlackAppDirectInstallUrl } =
    useSlackAppDirectInstallUrl();

  return (
    <div className={classNames('sw-flex sw-flex-col sw-gap-6', className)}>
      <Card>
        <Card.Header
          hasDivider
          rightContent={
            <ButtonGroup>
              <SlackIntegrationConfigurationUpdate slackConfiguration={slackConfiguration} />
              <SlackIntegrationConfigurationDeletion slackConfigurationId={slackConfiguration.id} />
            </ButtonGroup>
          }
          title={<FormattedMessage id="settings.slack.configuration.header" />}
        />

        <Card.Body>
          <div className="sw-flex sw-gap-9">
            <div className="sw-flex sw-flex-col sw-gap-3">
              <Text isHighlighted>
                <FormattedMessage id="settings.slack.configuration.client_id" />
              </Text>
              <Text isHighlighted>
                <FormattedMessage id="settings.slack.configuration.client_secret" />
              </Text>
              <Text isHighlighted>
                <FormattedMessage id="settings.slack.configuration.signing_secret" />
              </Text>
            </div>
            <div className="sw-flex sw-flex-col sw-gap-3">
              <Text>{slackConfiguration.clientId}</Text>
              <SecretFieldValuePlaceholder />
              <SecretFieldValuePlaceholder />
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="sw-flex sw-items-center sw-gap-2">
        <Button
          enableOpenInNewTab
          isDisabled={isLoadingSlackAppDirectInstallUrl || slackAppDirectInstallUrl === undefined}
          isLoading={isLoadingSlackAppDirectInstallUrl}
          to={slackAppDirectInstallUrl ?? ''}
          variety={ButtonVariety.Default}
        >
          <FormattedMessage id="settings.slack.install_app.label" />
        </Button>
        <HelperText>
          <FormattedMessage id="settings.slack.install_app.hint" />
        </HelperText>
      </div>
    </div>
  );
}

function SecretFieldValuePlaceholder() {
  return (
    <Text isSubtle>
      <FormattedMessage id="hidden_for_security" />
    </Text>
  );
}
