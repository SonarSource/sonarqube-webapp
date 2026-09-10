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
  FilterTag,
  FormFieldWidth,
  Modal,
  Select,
  Spinner,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  useAddGroupNotificationSubscriptionMutation,
  useGroupNotificationSubscriptionsQuery,
  useRemoveGroupNotificationSubscriptionMutation,
} from '~sq-server-commons/queries/group-notifications';
import { useNotificationsQuery } from '~sq-server-commons/queries/notifications';
import { Group } from '~sq-server-commons/types/types';

interface Props {
  group: Group;
  onClose: () => void;
}

export function GroupNotificationSubscriptionsModal({ group, onClose }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const { data: subscriptionsData, isLoading } = useGroupNotificationSubscriptionsQuery();
  const { data: notificationsData, isLoading: isLoadingTypes } =
    useNotificationsQuery('groupSubscription');
  const groupSubscriptions = (subscriptionsData?.subscriptions ?? []).filter(
    (s) => s.groupUuid === group.id,
  );

  const subscribedTypes = new Set(groupSubscriptions.map((s) => s.notificationType));
  const groupSubscriptionNotificationTypes = [...subscribedTypes];
  const availableOptions = (notificationsData?.globalTypes ?? [])
    .filter((t) => !subscribedTypes.has(t))
    .map((t) => ({
      label: formatMessage({ id: `notification.dispatcher.${t}` }),
      value: t,
    }));

  const [selectedTypeValue, setSelectedTypeValue] = useState<string | null>(null);

  const effectiveSelectedType =
    selectedTypeValue !== null && availableOptions.some((o) => o.value === selectedTypeValue)
      ? selectedTypeValue
      : (availableOptions[0]?.value ?? null);

  const { mutate: addSubscription, isPending: isAdding } =
    useAddGroupNotificationSubscriptionMutation();
  const { mutate: removeSubscription } = useRemoveGroupNotificationSubscriptionMutation();

  const handleAdd = () => {
    const typeValue = effectiveSelectedType;
    if (!typeValue) {
      return;
    }
    addSubscription(
      { groupUuid: group.id, type: typeValue },
      {
        onSuccess: () => {
          setSelectedTypeValue(null);
        },
      },
    );
  };

  const handleRemove = (groupUuid: string, type: string) => {
    removeSubscription({ groupUuid, type });
  };

  const body = (
    <Spinner isLoading={isLoading || isLoadingTypes}>
      {groupSubscriptionNotificationTypes.length === 0 && availableOptions.length === 0 && (
        <FormattedMessage id="group_notifications.empty" />
      )}
      {groupSubscriptionNotificationTypes.length > 0 && (
        <>
          <div className="sw-mb-3">
            <FormattedMessage
              id="group_notifications.subscriptions_count"
              values={{ count: groupSubscriptionNotificationTypes.length }}
            />
          </div>
          <div className="sw-flex sw-flex-wrap sw-gap-2 sw-mb-4">
            {groupSubscriptionNotificationTypes.map((notificationType) => {
              const typeLabel = formatMessage({
                id: `notification.dispatcher.${notificationType}`,
              });
              return (
                <FilterTag
                  key={notificationType}
                  labelDismiss={formatMessage(
                    { id: 'group_notifications.remove_subscription' },
                    { type: typeLabel },
                  )}
                  onDismiss={() => {
                    handleRemove(group.id, notificationType);
                  }}
                >
                  {typeLabel}
                </FilterTag>
              );
            })}
          </div>
        </>
      )}

      {availableOptions.length > 0 && (
        <div className="sw-flex sw-gap-2 sw-items-center">
          <Select
            ariaLabel={formatMessage({ id: 'group_notifications.notification_type' })}
            data={availableOptions}
            isNotClearable
            onChange={(value) => {
              setSelectedTypeValue(value);
            }}
            value={effectiveSelectedType}
            width={FormFieldWidth.Large}
          />
          <Button className="sw-shrink-0" isDisabled={isAdding} onClick={handleAdd}>
            <FormattedMessage id="group_notifications.add" />
          </Button>
        </div>
      )}
    </Spinner>
  );

  return (
    <Modal
      content={body}
      description={<FormattedMessage id="group_notifications.subscriptions" />}
      isOpen
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      secondaryButton={
        <Button onClick={onClose}>
          <FormattedMessage id="close" />
        </Button>
      }
      title={group.name}
    />
  );
}
