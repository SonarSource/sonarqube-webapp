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
  ButtonVariety,
  Checkbox,
  FormFieldWidth,
  Label,
  MessageInline,
  MessageInlineSize,
  MessageVariety,
  Modal,
  Select,
  toast,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { GROUP_NOTIFICATION_CHANNEL, type GroupNotificationGroupOption } from './constants';

interface Props {
  availableChannels: string[];
  deliveryDescriptionId: string;
  groups: GroupNotificationGroupOption[];
  hasMoreGroups?: boolean;
  isLoadingMoreGroups?: boolean;
  isSaving: boolean;
  loadMoreGroups?: () => void;
  notificationType: string;
  onClose: () => void;
  onSave: (groupUuid: string, channels: string[]) => Promise<void>;
  selectedChannels: string[];
  selectedGroup?: GroupNotificationGroupOption;
}

function getChannelDescriptionId(channelKey: string) {
  switch (channelKey) {
    case GROUP_NOTIFICATION_CHANNEL.Email:
      return 'group_notifications.delivery_method.email_description';
    case GROUP_NOTIFICATION_CHANNEL.Banner:
      return 'group_notifications.delivery_method.banner_description';
    default:
      return undefined;
  }
}

export function GroupNotificationChannelsDialog({
  availableChannels,
  deliveryDescriptionId,
  groups,
  hasMoreGroups,
  isLoadingMoreGroups,
  isSaving,
  loadMoreGroups,
  notificationType,
  onClose,
  onSave,
  selectedChannels,
  selectedGroup,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const [selectedGroupId, setSelectedGroupId] = useState(selectedGroup?.id ?? '');
  const [channels, setChannels] = useState(selectedChannels);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const groupOptions = groups.map((group) => ({ label: group.name, value: group.id }));
  const groupUuid = (selectedGroup?.id ?? selectedGroupId) || '';
  const hasGroupError = hasAttemptedSave && !groupUuid;
  const hasDeliveryMethodsError = hasAttemptedSave && !selectedGroup && channels.length === 0;
  const shouldShowUnsubscribeInfo =
    Boolean(selectedGroup) && selectedChannels.length > 0 && channels.length === 0;

  const toggleChannel = (channelKey: string, checked: boolean) => {
    setChannels((current) =>
      checked
        ? [...new Set([...current, channelKey])]
        : current.filter((channel) => channel !== channelKey),
    );
  };

  const save = async () => {
    setHasAttemptedSave(true);
    if (!groupUuid || (!selectedGroup && channels.length === 0)) {
      return;
    }

    try {
      await onSave(groupUuid, channels);
    } catch {
      toast.error({ description: formatMessage({ id: 'group_notifications.save_error' }) });
    }
  };

  return (
    <Modal
      content={
        <>
          <div className="sw:mb-4">
            <Label as="span">
              <FormattedMessage id="group_notifications.group" />
            </Label>
            {!selectedGroup && (
              <p className="sw:mt-1 sw:text-muted">
                <FormattedMessage id="group_notifications.group_description" />
              </p>
            )}
            {selectedGroup ? (
              <p className="sw:mt-2">{selectedGroup.name}</p>
            ) : (
              <>
                {groupOptions.length > 0 ? (
                  <Select
                    ariaLabel={formatMessage({ id: 'group_notifications.select_group' })}
                    data={groupOptions}
                    isDisabled={isSaving}
                    isSearchable
                    onChange={(value) => {
                      setSelectedGroupId(value ?? '');
                    }}
                    placeholder={formatMessage({ id: 'group_notifications.select_group' })}
                    value={groupUuid}
                    width={FormFieldWidth.Large}
                  />
                ) : (
                  <p>
                    <FormattedMessage id="group_notifications.no_groups_available" />
                  </p>
                )}
                {hasMoreGroups && loadMoreGroups && (
                  <Button
                    className="sw:mt-2"
                    isDisabled={isLoadingMoreGroups || isSaving}
                    onClick={loadMoreGroups}
                  >
                    <FormattedMessage id="group_notifications.load_more_groups" />
                  </Button>
                )}
              </>
            )}
          </div>
          <section>
            <Label as="span">
              <FormattedMessage id="group_notifications.delivery_methods" />
            </Label>
            <p className="sw:mt-1 sw:text-muted">
              <FormattedMessage id={deliveryDescriptionId} />
            </p>
            <fieldset className="sw:mt-3 sw:flex sw:flex-col sw:gap-3">
              <legend className="sw:sr-only">
                <FormattedMessage id="group_notifications.delivery_methods" />
              </legend>
              {availableChannels.map((channelKey) => {
                const checkboxId = `group-notification-channel-${channelKey}`;
                const channelDescriptionId = getChannelDescriptionId(channelKey);
                return (
                  <div className="sw:flex sw:items-start sw:gap-2" key={channelKey}>
                    <Checkbox
                      ariaLabel={formatMessage({ id: `notification.channel.${channelKey}` })}
                      checked={channels.includes(channelKey)}
                      id={checkboxId}
                      isDisabled={isSaving}
                      onCheck={(checked) => {
                        toggleChannel(channelKey, checked as boolean);
                      }}
                    />
                    <div>
                      <Label as="label" className="sw:cursor-pointer" htmlFor={checkboxId}>
                        <FormattedMessage id={`notification.channel.${channelKey}`} />
                      </Label>
                      {channelDescriptionId && (
                        <p className="sw:mt-1 sw:text-muted">
                          <FormattedMessage id={channelDescriptionId} />
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </fieldset>
            {hasDeliveryMethodsError && (
              <MessageInline
                announcementMode="alert"
                as="div"
                className="sw:mt-2 sw:block"
                size={MessageInlineSize.Small}
                variety={MessageVariety.Danger}
              >
                <FormattedMessage id="group_notifications.validation.delivery_method_required" />
              </MessageInline>
            )}
            {hasGroupError && (
              <MessageInline
                announcementMode="alert"
                as="div"
                className="sw:mt-2 sw:block"
                size={MessageInlineSize.Small}
                variety={MessageVariety.Danger}
              >
                <FormattedMessage id="group_notifications.validation.group_required" />
              </MessageInline>
            )}
            {shouldShowUnsubscribeInfo && (
              <MessageInline
                as="div"
                className="sw:mt-3"
                size={MessageInlineSize.Small}
                variety={MessageVariety.Info}
              >
                <FormattedMessage id="group_notifications.unsubscribe_info" />
              </MessageInline>
            )}
          </section>
        </>
      }
      isOpen
      onOpenChange={(open) => {
        if (!open && !isSaving) {
          onClose();
        }
      }}
      primaryButton={
        <Button
          isDisabled={isSaving}
          isLoading={isSaving}
          onClick={() => {
            save().catch(() => undefined);
          }}
          variety={ButtonVariety.Primary}
        >
          <FormattedMessage id="save" />
        </Button>
      }
      secondaryButton={
        <Button isDisabled={isSaving} onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
      }
      title={formatMessage(
        {
          id: selectedGroup
            ? 'group_notifications.edit_delivery_methods'
            : 'group_notifications.subscribe_groups',
        },
        {
          type: formatMessage({ id: `notification.dispatcher.${notificationType}` }),
        },
      )}
    />
  );
}
