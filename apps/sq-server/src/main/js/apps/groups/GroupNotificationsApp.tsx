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

import { toast, type BreadcrumbsProps } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Navigate, useParams } from 'react-router';
import { GroupNotificationManagementContent } from '~shared/components/group-notifications/GroupNotificationManagementContent';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';
import {
  useAddGroupNotificationSubscriptionMutation,
  useGroupNotificationSubscriptionsQuery,
  useRemoveGroupNotificationSubscriptionMutation,
} from '~sq-server-commons/queries/group-notifications';
import { useGroupsQueries } from '~sq-server-commons/queries/groups';
import { useFlag } from '~sq-server-commons/sq-server-adapters/helpers/feature-flags';
import {
  normalizeGroupNotificationTypes,
  type GroupNotificationGroupOption,
  type GroupNotificationSubscriptionView,
  type GroupNotificationTypeOption,
} from '~shared/components/group-notifications/constants';
import { GROUP_NOTIFICATIONS_BASE_PATH } from './constants';

export default function GroupNotificationsApp() {
  const scaEnableGroupNotificationSubscriptions = useFlag(
    'scaEnableGroupNotificationSubscriptions',
  );
  const { notificationType } = useParams();

  if (!scaEnableGroupNotificationSubscriptions) {
    return <Navigate replace to="/admin/groups" />;
  }
  return <GroupNotificationManagementPage notificationType={notificationType} />;
}

interface GroupNotificationManagementPageProps {
  notificationType?: string;
}

function GroupNotificationManagementPage({
  notificationType,
}: Readonly<GroupNotificationManagementPageProps>) {
  const { formatMessage } = useIntl();
  const {
    data: subscriptionsData,
    isLoading: isLoadingSubscriptions,
    isLoadingError: isSubscriptionsLoadingError,
  } = useGroupNotificationSubscriptionsQuery();
  const {
    data: groupsData,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isLoadingGroups,
    isLoadingError: isGroupsLoadingError,
  } = useGroupsQueries({ q: '', managed: undefined });
  const { mutateAsync: addSubscription } = useAddGroupNotificationSubscriptionMutation();
  const { mutateAsync: removeSubscription } = useRemoveGroupNotificationSubscriptionMutation();
  const groupPages = groupsData?.pages;
  const hasInvalidGroupsPage =
    groupsData !== undefined &&
    (groupsData === null ||
      !Array.isArray(groupPages) ||
      groupPages.some(
        (page) =>
          !isRecord(page) ||
          !Array.isArray(page.groups) ||
          !page.groups.every(isGroupNotificationGroupOption) ||
          !isRecord(page.page) ||
          typeof page.page.total !== 'number',
      ));
  const responseAvailableTypes = isRecord(subscriptionsData)
    ? subscriptionsData.availableTypes
    : undefined;
  const hasInvalidAvailableTypes =
    subscriptionsData !== undefined &&
    (!isRecord(subscriptionsData) ||
      (responseAvailableTypes !== undefined &&
        (!Array.isArray(responseAvailableTypes) ||
          !responseAvailableTypes.every(isGroupNotificationTypeOption))));
  const hasInvalidSubscriptions =
    subscriptionsData !== undefined &&
    (!isRecord(subscriptionsData) ||
      !Array.isArray(subscriptionsData.subscriptions) ||
      !subscriptionsData.subscriptions.every(isGroupNotificationSubscription));
  const groups = useMemo(
    () =>
      (Array.isArray(groupPages) ? groupPages : []).flatMap((page) =>
        isRecord(page) && Array.isArray(page.groups)
          ? page.groups.filter(isGroupNotificationGroupOption).map(({ id, name }) => ({ id, name }))
          : [],
      ),
    [groupPages],
  );
  const lastPage = Array.isArray(groupPages) ? groupPages.at(-1) : undefined;
  const hasMoreGroups =
    isRecord(lastPage) &&
    isRecord(lastPage.page) &&
    typeof lastPage.page.total === 'number' &&
    lastPage.page.total > groups.length;
  const pageTitle = notificationType
    ? formatMessage({ id: `notification.dispatcher.${notificationType}` })
    : formatMessage({ id: 'group_notifications.page' });
  const breadcrumbs: BreadcrumbsProps['items'] | undefined = notificationType
    ? [
        {
          linkElement: formatMessage({ id: 'group_notifications.page' }),
          to: GROUP_NOTIFICATIONS_BASE_PATH,
        },
        { linkElement: pageTitle },
      ]
    : undefined;
  const availableTypes = normalizeGroupNotificationTypes(
    Array.isArray(responseAvailableTypes)
      ? responseAvailableTypes.filter(isGroupNotificationTypeOption)
      : undefined,
  );
  const subscriptions =
    isRecord(subscriptionsData) && Array.isArray(subscriptionsData.subscriptions)
      ? subscriptionsData.subscriptions.filter(isGroupNotificationSubscription)
      : [];

  if (
    isGroupsLoadingError ||
    isSubscriptionsLoadingError ||
    hasInvalidGroupsPage ||
    hasInvalidAvailableTypes ||
    hasInvalidSubscriptions
  ) {
    return (
      <AdminPageTemplate breadcrumbs={breadcrumbs} title={pageTitle} width="fluid">
        <p role="alert">
          <FormattedMessage id="group_notifications.load_error" />
        </p>
      </AdminPageTemplate>
    );
  }

  if (
    notificationType &&
    !isLoadingSubscriptions &&
    !availableTypes.some((type) => type.notificationType === notificationType)
  ) {
    return <Navigate replace to={GROUP_NOTIFICATIONS_BASE_PATH} />;
  }

  return (
    <AdminPageTemplate breadcrumbs={breadcrumbs} title={pageTitle} width="fluid">
      <GroupNotificationManagementContent
        availableTypes={availableTypes}
        basePath={GROUP_NOTIFICATIONS_BASE_PATH}
        deliveryDescriptionId="group_notifications.delivery_description.server"
        detailDescriptionId="group_notifications.detail_description.server"
        groups={groups}
        hasMoreGroups={hasMoreGroups}
        isLoading={isLoadingSubscriptions || isLoadingGroups}
        isLoadingMoreGroups={isFetchingNextPage}
        loadMoreGroups={() => {
          fetchNextPage({ throwOnError: true }).catch(() => {
            toast.error({
              description: formatMessage({ id: 'group_notifications.load_more_error' }),
            });
          });
        }}
        notificationType={notificationType}
        onAdd={(groupUuid, type, channel) => addSubscription({ channel, groupUuid, type })}
        onRemove={(groupUuid, type, channel) => removeSubscription({ channel, groupUuid, type })}
        showBackLink={false}
        subscriptions={subscriptions}
      />
    </AdminPageTemplate>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGroupNotificationGroupOption(value: unknown): value is GroupNotificationGroupOption {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string';
}

function isGroupNotificationTypeOption(
  value: unknown,
): value is GroupNotificationTypeOption | string {
  return (
    typeof value === 'string' ||
    (isRecord(value) &&
      typeof value.notificationType === 'string' &&
      typeof value.channelKey === 'string')
  );
}

function isGroupNotificationSubscription(
  value: unknown,
): value is GroupNotificationSubscriptionView {
  return (
    isRecord(value) &&
    typeof value.groupUuid === 'string' &&
    typeof value.groupName === 'string' &&
    typeof value.notificationType === 'string' &&
    typeof value.channelKey === 'string'
  );
}
