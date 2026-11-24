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

import { Spinner } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import type { GroupNotificationSubscriptionView } from './constants';

interface Props {
  descriptionId?: string;
  isLoading: boolean;
  subscriptions: GroupNotificationSubscriptionView[];
}

export function GroupNotificationSubscriptionsSection({
  descriptionId = 'group_notifications.account_description',
  subscriptions,
  isLoading,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const notificationTypes = useMemo(() => {
    return [...new Set(subscriptions.map((subscription) => subscription.notificationType))].sort(
      (left, right) => left.localeCompare(right),
    );
  }, [subscriptions]);

  return (
    <section aria-labelledby="group-notifications-heading" className="sw:mt-6">
      <h2 className="sw:heading-md" id="group-notifications-heading">
        <FormattedMessage id="group_notifications.title" />
      </h2>
      <p className="sw:mt-3 sw:text-muted">
        <FormattedMessage id={descriptionId} />
      </p>
      <Spinner isLoading={isLoading}>
        {!isLoading &&
          (notificationTypes.length === 0 ? (
            <p className="sw:mt-3 sw:text-muted">
              <FormattedMessage id="group_notifications.no_memberships" />
            </p>
          ) : (
            <ul
              aria-label={formatMessage({ id: 'group_notifications.account_aria' })}
              className="sw:mt-3 sw:list-disc sw:pl-6"
            >
              {notificationTypes.map((notificationType) => (
                <li key={notificationType}>
                  <FormattedMessage id={`notification.dispatcher.${notificationType}`} />
                </li>
              ))}
            </ul>
          ))}
      </Spinner>
    </section>
  );
}
