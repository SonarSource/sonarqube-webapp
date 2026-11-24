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

import { Divider, Heading, Label, Spinner, Text } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Switch } from '~adapters/components/common/Switch';
import { GroupNotificationSubscriptionsSection } from '~shared/components/group-notifications/GroupNotificationSubscriptionsSection';
import { BEAMER_NOTIFICATIONS_SETTING } from '~shared/helpers/beamer';
import useLocalStorage from '~shared/helpers/useLocalStorage';
import { useMyGroupSubscriptionsQuery } from '~sq-server-commons/queries/group-notifications';
import { useNotificationsQuery } from '~sq-server-commons/queries/notifications';
import { useFlag } from '~sq-server-commons/sq-server-adapters/helpers/feature-flags';
import type { MyGroupNotificationSubscription } from '~sq-server-commons/types/notifications';
import { AccountPageTemplate } from '../components/AccountPageTemplate';
import GlobalNotifications from './GlobalNotifications';
import Projects from './Projects';

const NEWS_NOTIFICATION_FIELD_ID = 'news-notification-field';

export default function Notifications() {
  const { formatMessage } = useIntl();
  const scaEnableGroupNotificationSubscriptions = useFlag(
    'scaEnableGroupNotificationSubscriptions',
  );
  const { data: notificationResponse, isLoading } = useNotificationsQuery('user');
  const {
    data: groupSubscriptionsResponse,
    isError: isGroupSubscriptionsError,
    isLoading: isLoadingGroupSubscriptions,
  } = useMyGroupSubscriptionsQuery({ enabled: scaEnableGroupNotificationSubscriptions });
  const groupSubscriptions = Array.isArray(groupSubscriptionsResponse?.groupSubscriptions)
    ? groupSubscriptionsResponse.groupSubscriptions.filter(isMyGroupNotificationSubscription)
    : [];
  const hasInvalidGroupSubscriptions =
    groupSubscriptionsResponse !== undefined &&
    (!Array.isArray(groupSubscriptionsResponse?.groupSubscriptions) ||
      groupSubscriptions.length !== groupSubscriptionsResponse.groupSubscriptions.length);
  const hasGroupSubscriptionsError =
    isGroupSubscriptionsError ||
    hasInvalidGroupSubscriptions ||
    (!isLoadingGroupSubscriptions && groupSubscriptionsResponse === undefined);
  const { notifications } = notificationResponse || {
    channels: [],
    globalTypes: [],
    perProjectTypes: [],
    notifications: [],
  };

  const projectNotifications = notifications.filter((n) => n.project !== undefined);

  const [beamerNotifications, setBeamerNotifications] = useLocalStorage<boolean>(
    BEAMER_NOTIFICATIONS_SETTING,
  );

  return (
    <AccountPageTemplate
      pageClassName="it__account-body"
      title={formatMessage({ id: 'my_account.notifications' })}
    >
      <Text isSubtle>
        <FormattedMessage id="notification.dispatcher.information" />
      </Text>
      <Spinner isLoading={isLoading}>
        {notifications && (
          <>
            <Divider className="sw:my-4" />

            <GlobalNotifications />

            {scaEnableGroupNotificationSubscriptions && (
              <>
                <Divider className="sw:my-4" />

                {hasGroupSubscriptionsError ? (
                  <p role="alert">
                    <FormattedMessage id="group_notifications.load_error" />
                  </p>
                ) : (
                  <GroupNotificationSubscriptionsSection
                    descriptionId="group_notifications.account_description.server"
                    isLoading={isLoadingGroupSubscriptions}
                    subscriptions={groupSubscriptions}
                  />
                )}

                <Divider className="sw:my-4" />
              </>
            )}

            <Heading as="h2" hasMarginBottom>
              <FormattedMessage id="my_profile.news_notifications.title" />
            </Heading>

            <div className="sw:flex sw:items-center sw:gap-2">
              <Switch
                id={NEWS_NOTIFICATION_FIELD_ID}
                name={BEAMER_NOTIFICATIONS_SETTING}
                onChange={setBeamerNotifications}
                value={beamerNotifications ?? true}
              />
              <Label htmlFor={NEWS_NOTIFICATION_FIELD_ID}>
                <FormattedMessage id="my_profile.news_notifications.label" />
              </Label>
            </div>

            <Divider className="sw:my-4" />

            <Projects notifications={projectNotifications} />
          </>
        )}
      </Spinner>
    </AccountPageTemplate>
  );
}

function isMyGroupNotificationSubscription(
  value: unknown,
): value is MyGroupNotificationSubscription {
  return (
    typeof value === 'object' &&
    value !== null &&
    'channelKey' in value &&
    typeof value.channelKey === 'string' &&
    'groupName' in value &&
    typeof value.groupName === 'string' &&
    'groupUuid' in value &&
    typeof value.groupUuid === 'string' &&
    'notificationType' in value &&
    typeof value.notificationType === 'string'
  );
}
