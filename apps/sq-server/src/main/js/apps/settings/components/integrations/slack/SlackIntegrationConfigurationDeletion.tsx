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

import { Button, ButtonVariety, IconDelete, Modal, Text } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDeleteIntegrationConfigurationMutation } from '~sq-server-commons/queries/integrations';

interface SlackIntegrationConfigurationDeletionProps {
  slackConfigurationId: string;
}

export function SlackIntegrationConfigurationDeletion({
  slackConfigurationId,
}: Readonly<SlackIntegrationConfigurationDeletionProps>) {
  const { formatMessage } = useIntl();

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const { mutate: deleteSlackConfiguration, isPending: isDeletingSlackConfiguration } =
    useDeleteIntegrationConfigurationMutation();

  const onConfirmDeletion = () => {
    deleteSlackConfiguration(slackConfigurationId, {
      onSuccess: () => {
        closeConfirmationModal();
      },
    });
  };

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };
  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  return (
    <Modal
      content={
        <Text>
          <FormattedMessage
            id="settings.slack.remove_configuration_modal.description"
            values={{
              li: (text) => <li>{text}</li>,
              ul: (text) => <ul className="sw-list-disc">{text}</ul>,
              p: (text) => (
                <Text as="p" className="sw-mb-2">
                  {text}
                </Text>
              ),
            }}
          />
        </Text>
      }
      isOpen={isConfirmationModalOpen}
      onOpenChange={setIsConfirmationModalOpen}
      primaryButton={
        <Button
          isDisabled={isDeletingSlackConfiguration}
          isLoading={isDeletingSlackConfiguration}
          onClick={onConfirmDeletion}
          variety={ButtonVariety.Danger}
        >
          <FormattedMessage id="delete" />
        </Button>
      }
      secondaryButton={
        <Button isDisabled={isDeletingSlackConfiguration} onClick={closeConfirmationModal}>
          {formatMessage({ id: 'cancel' })}
        </Button>
      }
      title={formatMessage({ id: 'settings.slack.remove_configuration_modal.title' })}
    >
      <Button
        ariaLabel={formatMessage({ id: 'settings.slack.remove_configuration' })}
        isDisabled={isDeletingSlackConfiguration}
        isLoading={isDeletingSlackConfiguration}
        name="delete"
        onClick={openConfirmationModal}
        type="reset"
        variety={ButtonVariety.Default}
      >
        <IconDelete />
      </Button>
    </Modal>
  );
}
