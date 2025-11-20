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
  Heading,
  HeadingSize,
  Text,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { NumberedList, NumberedListItem } from '~sq-server-commons/design-system';
import { useCreateIntegrationConfigurationMutation } from '~sq-server-commons/queries/integrations';
import { IntegrationType } from '~sq-server-commons/types/integrations';
import { SlackIntegrationConfigurationForm } from './SlackIntegrationConfigurationForm';
import { useSlackAppManifestUrl } from './hooks';

interface SlackIntegrationConfigurationCreationProps {
  onHideForm: () => void;
}

export function SlackIntegrationConfigurationCreation({
  onHideForm,
}: Readonly<SlackIntegrationConfigurationCreationProps>) {
  const [slackConfiguration, setSlackConfiguration] = useState<{
    clientId: string;
    clientSecret: string;
    signingSecret: string;
  }>({
    clientId: '',
    clientSecret: '',
    signingSecret: '',
  });

  const { isLoading: isLoadingSlackAppManifestUrl, slackAppManifestUrl } = useSlackAppManifestUrl();
  const { isPending: isCreatingSlackConfiguration, mutate: createSlackConfiguration } =
    useCreateIntegrationConfigurationMutation();

  const isSubmitDisabled =
    isCreatingSlackConfiguration ||
    slackConfiguration.clientId === '' ||
    slackConfiguration.clientSecret === '' ||
    slackConfiguration.signingSecret === '';

  const onCancel = () => {
    setSlackConfiguration({
      clientId: '',
      clientSecret: '',
      signingSecret: '',
    });
    onHideForm();
  };
  const onSubmit = () => {
    if (isSubmitDisabled) {
      return;
    }

    createSlackConfiguration({
      ...slackConfiguration,
      integrationType: IntegrationType.Slack,
    });
  };

  return (
    <NumberedList className="sw-flex sw-flex-col sw-gap-10 sw-w-1/2">
      <NumberedListItem className="sw-flex sw-gap-1">
        <div>
          <div className="sw-flex sw-flex-col sw-gap-4">
            <Heading as="h3" size={HeadingSize.Medium}>
              <FormattedMessage id="settings.slack.app_creation.step_title" />
            </Heading>
            <Text>
              <FormattedMessage id="settings.slack.app_creation.helper" />
            </Text>
          </div>
          <div className="sw-flex sw-items-center sw-mt-6 sw-gap-3">
            <Button
              enableOpenInNewTab
              isDisabled={isLoadingSlackAppManifestUrl || slackAppManifestUrl === undefined}
              isLoading={isLoadingSlackAppManifestUrl}
              to={slackAppManifestUrl ?? ''}
              variety={ButtonVariety.Default}
            >
              <FormattedMessage id="settings.slack.app_creation.button_label" />
            </Button>
            <Text isSubtle>
              <FormattedMessage id="settings.slack.app_creation.hint" />
            </Text>
          </div>
        </div>
      </NumberedListItem>
      <NumberedListItem className="sw-flex sw-gap-1">
        <div>
          <div className="sw-flex sw-flex-col sw-gap-4">
            <Heading as="h3" size={HeadingSize.Medium}>
              <FormattedMessage id="settings.slack.app_details.step_title" />
            </Heading>
            <SlackIntegrationConfigurationForm
              setSlackConfiguration={setSlackConfiguration}
              slackConfiguration={slackConfiguration}
            />
          </div>
          <ButtonGroup className="sw-flex sw-items-center sw-mt-6 sw-gap-2">
            <Button
              isDisabled={isSubmitDisabled}
              isLoading={isCreatingSlackConfiguration}
              onClick={onSubmit}
              variety={ButtonVariety.Primary}
            >
              <FormattedMessage id="settings.slack.app_details.submit_button_label" />
            </Button>
            <Button
              isDisabled={isCreatingSlackConfiguration}
              onClick={onCancel}
              variety={ButtonVariety.Default}
            >
              <FormattedMessage id="cancel" />
            </Button>
          </ButtonGroup>
        </div>
      </NumberedListItem>
    </NumberedList>
  );
}
