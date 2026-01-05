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
import { BEAMER_NOTIFICATIONS_SETTING } from '~shared/helpers/beamer';
import useLocalStorage from '~shared/helpers/useLocalStorage';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useNotificationsQuery } from '~sq-server-commons/queries/notifications';
import { AccountPageTemplate } from '../components/AccountPageTemplate';
import GlobalNotifications from './GlobalNotifications';
import Projects from './Projects';

const NEWS_NOTIFICATION_FIELD_ID = 'news-notification-field';

export default function Notifications() {
  const { formatMessage } = useIntl();
  const { data: notificationResponse, isLoading } = useNotificationsQuery();
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
      <Text isSubtle>{translate('notification.dispatcher.information')}</Text>

      <Spinner isLoading={isLoading}>
        {notifications && (
          <>
            <Divider className="sw-my-4" />

            <GlobalNotifications />

            <Divider className="sw-my-4" />

            <Heading as="h2" hasMarginBottom>
              <FormattedMessage id="my_profile.news_notifications.title" />
            </Heading>

            <div className="sw-flex sw-items-center sw-gap-2">
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

            <Divider className="sw-my-4" />

            <Projects notifications={projectNotifications} />
          </>
        )}
      </Spinner>
    </AccountPageTemplate>
  );
}
