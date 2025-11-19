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

import { Button, ButtonVariety, Modal } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isStringDefined } from '~shared/helpers/types';
import { useUpdateIntegrationConfigurationMutation } from '~sq-server-commons/queries/integrations';
import {
  IntegrationConfiguration,
  IntegrationConfigurationPatchPayload,
} from '~sq-server-commons/types/integrations';
import { SlackIntegrationConfigurationForm } from './SlackIntegrationConfigurationForm';

interface SlackIntegrationConfigurationUpdateProps {
  slackConfiguration: IntegrationConfiguration;
}

export function SlackIntegrationConfigurationUpdate({
  slackConfiguration,
}: Readonly<SlackIntegrationConfigurationUpdateProps>) {
  const { formatMessage } = useIntl();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [slackConfigurationForm, setSlackConfigurationForm] = useState<{
    clientId: string;
    clientSecret: string;
    signingSecret: string;
  }>({
    clientId: slackConfiguration.clientId,
    clientSecret: '',
    signingSecret: '',
  });

  const { mutate: updateSlackConfiguration, isPending: isUpdatingSlackConfiguration } =
    useUpdateIntegrationConfigurationMutation();

  const onUpdateSlackConfiguration = () => {
    const data: IntegrationConfigurationPatchPayload = {
      clientId: slackConfigurationForm.clientId,
    };

    if (isStringDefined(slackConfigurationForm.clientSecret)) {
      data.clientSecret = slackConfigurationForm.clientSecret;
    }
    if (isStringDefined(slackConfigurationForm.signingSecret)) {
      data.signingSecret = slackConfigurationForm.signingSecret;
    }

    updateSlackConfiguration(
      {
        data,
        id: slackConfiguration.id,
      },
      { onSuccess: closeUpdateModal },
    );
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSlackConfigurationForm({
      clientId: slackConfiguration.clientId,
      clientSecret: '',
      signingSecret: '',
    });
  };

  const openUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const isUpdateButtonDisabled =
    isUpdatingSlackConfiguration ||
    ((slackConfigurationForm.clientId === '' ||
      slackConfigurationForm.clientId === slackConfiguration.clientId) &&
      slackConfigurationForm.clientSecret === '' &&
      slackConfigurationForm.signingSecret === '');

  return (
    <div>
      <Button
        aria-label={formatMessage({ id: 'edit' })}
        name="edit"
        onClick={openUpdateModal}
        variety={ButtonVariety.Default}
      >
        <FormattedMessage id="edit" />
      </Button>

      <Modal
        content={
          <SlackIntegrationConfigurationForm
            isUpdate
            setSlackConfiguration={setSlackConfigurationForm}
            slackConfiguration={slackConfigurationForm}
          />
        }
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        primaryButton={
          <Button
            isDisabled={isUpdateButtonDisabled}
            isLoading={isUpdatingSlackConfiguration}
            onClick={onUpdateSlackConfiguration}
            variety={ButtonVariety.Primary}
          >
            <FormattedMessage id="settings.slack.update_configuration_modal.update_button" />
          </Button>
        }
        secondaryButton={
          <Button isDisabled={isUpdatingSlackConfiguration} onClick={closeUpdateModal}>
            {formatMessage({ id: 'cancel' })}
          </Button>
        }
        title={formatMessage({ id: 'settings.slack.update_configuration_modal.title' })}
      />
    </div>
  );
}
