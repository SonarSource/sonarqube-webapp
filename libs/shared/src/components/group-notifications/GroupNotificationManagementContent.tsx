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
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconDelete,
  IconEdit,
  Link,
  Modal,
  Spinner,
  Table,
  TableVariety,
  ToggleTip,
} from '@sonarsource/echoes-react';
import { sortBy } from 'lodash';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { GroupNotificationChannelBadges } from './GroupNotificationChannelBadges';
import { GroupNotificationChannelsDialog } from './GroupNotificationChannelsDialog';
import type {
  GroupNotificationGroupOption,
  GroupNotificationSubscriptionView,
  GroupNotificationTypeOption,
} from './constants';

interface Props {
  availableTypes: GroupNotificationTypeOption[];
  basePath: string;
  detailDescriptionId?: string;
  deliveryDescriptionId?: string;
  groups: GroupNotificationGroupOption[];
  isLoading: boolean;
  loadMoreGroups?: () => void;
  hasMoreGroups?: boolean;
  isLoadingMoreGroups?: boolean;
  notificationType?: string;
  onAdd: (groupUuid: string, notificationType: string, channelKey: string) => Promise<unknown>;
  onRemove: (groupUuid: string, notificationType: string, channelKey: string) => Promise<unknown>;
  showBackLink?: boolean;
  subscriptions: GroupNotificationSubscriptionView[];
}

interface GroupSubscriptionRow {
  channels: string[];
  groupName: string;
  groupUuid: string;
}

export function GroupNotificationManagementContent(props: Readonly<Props>) {
  const { notificationType } = props;
  return notificationType ? (
    <NotificationTypeContent {...props} notificationType={notificationType} />
  ) : (
    <NotificationOverviewContent {...props} />
  );
}

function NotificationOverviewContent({
  availableTypes,
  basePath,
  subscriptions,
  isLoading,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const notificationTypes = [...new Set(availableTypes.map((type) => type.notificationType))];

  return (
    <Spinner isLoading={isLoading}>
      <section aria-labelledby="group-subscriptions-heading">
        <h2 className="sw:sr-only" id="group-subscriptions-heading">
          <FormattedMessage id="group_notifications.group_subscriptions" />
        </h2>
        <Table
          ariaLabelledBy="group-subscriptions-heading"
          className="sw:w-full"
          gridTemplate="2fr 1fr 1fr auto"
          variety={TableVariety.Surface}
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell
                label={formatMessage({ id: 'group_notifications.notification_type' })}
              />
              <Table.ColumnHeaderCell
                label={formatMessage({ id: 'group_notifications.subscriptions' })}
              />
              <Table.ColumnHeaderCell
                justify="start"
                label={formatMessage({ id: 'group_notifications.delivery_methods' })}
              />
              <Table.ColumnHeaderCell
                justify="end"
                label={formatMessage({ id: 'group_notifications.actions' })}
              />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {notificationTypes.map((type) => {
              const typeSubscriptions = subscriptions.filter(
                (subscription) => subscription.notificationType === type,
              );
              const subscribedGroupCount = new Set(
                typeSubscriptions.map((subscription) => subscription.groupUuid),
              ).size;
              const channels = [
                ...new Set(typeSubscriptions.map((subscription) => subscription.channelKey)),
              ];
              return (
                <Table.Row key={type}>
                  <Table.CellText
                    content={
                      <Link to={`${basePath}/${encodeURIComponent(type)}`}>
                        {formatMessage({ id: `notification.dispatcher.${type}` })}
                      </Link>
                    }
                  />
                  <Table.CellText
                    content={
                      <FormattedMessage
                        id="group_notifications.subscribed_groups_count"
                        values={{ count: subscribedGroupCount }}
                      />
                    }
                  />
                  <Table.Cell className="sw:justify-start">
                    <GroupNotificationChannelBadges channelKeys={channels} />
                  </Table.Cell>
                  <Table.Cell className="sw:justify-end">
                    <Link to={`${basePath}/${encodeURIComponent(type)}`}>
                      <FormattedMessage id="group_notifications.manage" />
                    </Link>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </section>
    </Spinner>
  );
}

function NotificationTypeContent({
  availableTypes,
  basePath,
  detailDescriptionId = 'group_notifications.detail_description',
  deliveryDescriptionId = 'group_notifications.delivery_description',
  groups,
  hasMoreGroups,
  isLoading,
  isLoadingMoreGroups,
  loadMoreGroups,
  notificationType,
  onAdd,
  onRemove,
  showBackLink = true,
  subscriptions,
}: Readonly<Props> & { notificationType: string }) {
  const { formatMessage } = useIntl();
  const [dialog, setDialog] = useState<
    { group?: GroupNotificationGroupOption; channels: string[] } | undefined
  >();
  const [groupToRemove, setGroupToRemove] = useState<GroupSubscriptionRow>();
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState(false);
  const supportedChannels = [
    ...new Set(
      availableTypes
        .filter((type) => type.notificationType === notificationType)
        .map((type) => type.channelKey),
    ),
  ];
  const groupRows = useMemo(() => {
    const rows = new Map<string, GroupSubscriptionRow>();
    subscriptions
      .filter((subscription) => subscription.notificationType === notificationType)
      .forEach((subscription) => {
        const row = rows.get(subscription.groupUuid) ?? {
          groupUuid: subscription.groupUuid,
          groupName: subscription.groupName,
          channels: [],
        };
        row.channels = [...new Set([...row.channels, subscription.channelKey])];
        rows.set(subscription.groupUuid, row);
      });
    return sortBy([...rows.values()], (row) => row.groupName.toLowerCase());
  }, [notificationType, subscriptions]);
  const subscribedGroupUuids = new Set(groupRows.map((row) => row.groupUuid));
  const unsubscribedGroups = groups.filter((group) => !subscribedGroupUuids.has(group.id));
  const allGroupsSubscribed =
    !isLoading && !hasMoreGroups && groups.length > 0 && unsubscribedGroups.length === 0;
  const noGroupsAvailable = !isLoading && !hasMoreGroups && groups.length === 0;
  const subscribeDisabled = allGroupsSubscribed || noGroupsAvailable;
  const subscribeDisabledMessageId = allGroupsSubscribed
    ? 'group_notifications.all_groups_subscribed'
    : 'group_notifications.no_groups_available';

  const saveChannels = async (
    groupUuid: string,
    selectedChannels: string[],
    previousChannels: string[],
  ) => {
    setIsSaving(true);
    try {
      await Promise.all([
        ...previousChannels
          .filter((channel) => !selectedChannels.includes(channel))
          .map((channel) => onRemove(groupUuid, notificationType, channel)),
        ...selectedChannels
          .filter((channel) => !previousChannels.includes(channel))
          .map((channel) => onAdd(groupUuid, notificationType, channel)),
      ]);
      setDialog(undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const removeGroup = async (row: GroupSubscriptionRow) => {
    setRemoveError(false);
    setIsRemoving(true);
    try {
      await Promise.all(
        row.channels.map((channel) => onRemove(row.groupUuid, notificationType, channel)),
      );
      setGroupToRemove(undefined);
    } catch {
      setRemoveError(true);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Spinner isLoading={isLoading}>
      {showBackLink && (
        <Link className="sw:mb-4" to={basePath}>
          <FormattedMessage id="group_notifications.page" />
        </Link>
      )}
      <section aria-labelledby="subscribed-groups-heading">
        <div className="sw:mb-4 sw:flex sw:items-start sw:justify-between sw:gap-4">
          <div>
            <h2 className="sw:heading-md" id="subscribed-groups-heading">
              <FormattedMessage id="group_notifications.subscribed_groups" />
              <span
                aria-label={formatMessage(
                  { id: 'group_notifications.subscription_count' },
                  { count: groupRows.length },
                )}
                className="sw:ml-2"
              >
                ({groupRows.length})
              </span>
            </h2>
            <p className="sw:mt-1 sw:text-muted">
              <FormattedMessage id={detailDescriptionId} />
            </p>
          </div>
          <div className="sw:flex sw:items-center sw:gap-2">
            <Button
              isDisabled={subscribeDisabled}
              onClick={() => {
                setDialog({ channels: [] });
              }}
            >
              <FormattedMessage id="group_notifications.subscribe_groups" />
            </Button>
            {subscribeDisabled && (
              <ToggleTip
                ariaLabel={formatMessage({ id: subscribeDisabledMessageId })}
                description={<FormattedMessage id={subscribeDisabledMessageId} />}
              />
            )}
          </div>
        </div>
        <Table
          ariaLabelledBy="subscribed-groups-heading"
          className="sw:w-full"
          gridTemplate={groupRows.length > 0 ? '2fr 1fr auto' : '1fr'}
          variety={TableVariety.Surface}
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell label={formatMessage({ id: 'group_notifications.group' })} />
              {groupRows.length > 0 && (
                <>
                  <Table.ColumnHeaderCell
                    justify="start"
                    label={formatMessage({ id: 'group_notifications.delivery_methods' })}
                  />
                  <Table.ColumnHeaderCell
                    justify="end"
                    label={formatMessage({ id: 'group_notifications.actions' })}
                  />
                </>
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {groupRows.map((row) => (
              <Table.Row key={row.groupUuid}>
                <Table.CellText content={row.groupName} />
                <Table.Cell className="sw:justify-start">
                  <GroupNotificationChannelBadges channelKeys={row.channels} />
                </Table.Cell>
                <Table.Cell className="sw:justify-end sw:gap-2">
                  <ButtonIcon
                    Icon={IconEdit}
                    ariaLabel={formatMessage({ id: 'group_notifications.edit_delivery_methods' })}
                    onClick={() => {
                      setDialog({
                        group: { id: row.groupUuid, name: row.groupName },
                        channels: row.channels,
                      });
                    }}
                    size={ButtonSize.Medium}
                    variety={ButtonVariety.DefaultGhost}
                  />
                  <ButtonIcon
                    Icon={IconDelete}
                    ariaLabel={formatMessage({ id: 'group_notifications.remove' })}
                    onClick={() => {
                      setRemoveError(false);
                      setGroupToRemove(row);
                    }}
                    size={ButtonSize.Medium}
                    variety={ButtonVariety.DangerGhost}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
            {groupRows.length === 0 && (
              <Table.Row>
                <Table.CellText
                  className="sw:col-span-full"
                  content={<FormattedMessage id="group_notifications.none_subscribed" />}
                />
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </section>
      {dialog && (
        <GroupNotificationChannelsDialog
          availableChannels={supportedChannels}
          deliveryDescriptionId={deliveryDescriptionId}
          groups={unsubscribedGroups}
          hasMoreGroups={hasMoreGroups}
          isLoadingMoreGroups={isLoadingMoreGroups}
          isSaving={isSaving}
          loadMoreGroups={loadMoreGroups}
          notificationType={notificationType}
          onClose={() => {
            setDialog(undefined);
          }}
          onSave={(groupUuid, channels) => saveChannels(groupUuid, channels, dialog.channels)}
          selectedChannels={dialog.channels}
          selectedGroup={dialog.group}
        />
      )}
      {groupToRemove && (
        <Modal
          content={
            <>
              <p>
                <FormattedMessage id="group_notifications.remove_subscription.confirmation" />
              </p>
              {removeError && (
                <p role="alert">
                  <FormattedMessage id="group_notifications.remove_error" />
                </p>
              )}
            </>
          }
          isOpen
          onOpenChange={(open) => {
            if (!open && !isRemoving) {
              setGroupToRemove(undefined);
              setRemoveError(false);
            }
          }}
          primaryButton={
            <Button
              isDisabled={isRemoving}
              isLoading={isRemoving}
              onClick={() => {
                removeGroup(groupToRemove).catch(() => undefined);
              }}
              variety={ButtonVariety.Danger}
            >
              <FormattedMessage id="group_notifications.remove" />
            </Button>
          }
          secondaryButton={
            <Button
              isDisabled={isRemoving}
              onClick={() => {
                setGroupToRemove(undefined);
                setRemoveError(false);
              }}
            >
              <FormattedMessage id="cancel" />
            </Button>
          }
          title={formatMessage(
            { id: 'group_notifications.remove_subscription' },
            { type: formatMessage({ id: `notification.dispatcher.${notificationType}` }) },
          )}
        />
      )}
    </Spinner>
  );
}
