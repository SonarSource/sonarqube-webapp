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

import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import * as groupNotificationsQueries from '~sq-server-commons/queries/group-notifications';
import { byRole } from '~shared/helpers/testSelector';
import Notifications from '../Notifications';

jest.mock('../GlobalNotifications', () => () => null);
jest.mock('../Projects', () => () => null);
jest.mock('../../components/AccountPageTemplate', () => ({
  AccountPageTemplate: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
jest.mock('~adapters/components/common/Switch', () => ({ Switch: () => null }));
jest.mock('~shared/helpers/useLocalStorage', () => ({
  __esModule: true,
  default: () => [true, jest.fn()],
}));
jest.mock('~sq-server-commons/queries/group-notifications', () => ({
  useMyGroupSubscriptionsQuery: jest.fn(() => ({
    data: {
      groupSubscriptions: [
        {
          channelKey: 'EmailNotificationChannel',
          groupName: 'developers',
          groupUuid: 'group-1',
          notificationType: 'NewAlerts',
        },
      ],
    },
    isError: false,
    isLoading: false,
  })),
}));
jest.mock('~sq-server-commons/queries/notifications', () => ({
  useNotificationsQuery: () => ({ data: { notifications: [] }, isLoading: false }),
}));
jest.mock('~sq-server-commons/sq-server-adapters/helpers/feature-flags', () => ({
  useFlag: () => true,
}));

describe('Server account group notification subscriptions', () => {
  it('shows notification types advertised by the Server API', () => {
    render(
      <IntlProvider
        locale="en"
        messages={{
          'my_account.notifications': 'Notifications',
          'my_profile.news_notifications.title': 'News',
          'my_profile.news_notifications.label': 'News notifications',
          'notification.dispatcher.information': 'Notification settings',
          'notification.dispatcher.NewAlerts': 'New alerts',
          'group_notifications.title': 'Group notifications',
          'group_notifications.account_description.server': 'Server group notifications',
          'group_notifications.no_memberships': 'No group memberships',
          'group_notifications.load_error': 'Could not load group notifications',
        }}
      >
        <Notifications />
      </IntlProvider>,
    );

    expect(
      byRole('region', { name: 'group_notifications.title' })
        .byText('notification.dispatcher.NewAlerts')
        .get(),
    ).toBeInTheDocument();
  });

  it('shows a load error when the group subscriptions response is malformed', () => {
    jest.mocked(groupNotificationsQueries.useMyGroupSubscriptionsQuery).mockReturnValueOnce({
      data: { groupSubscriptions: null },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof groupNotificationsQueries.useMyGroupSubscriptionsQuery>);

    render(
      <IntlProvider
        locale="en"
        messages={{
          'my_account.notifications': 'Notifications',
          'my_profile.news_notifications.title': 'News',
          'my_profile.news_notifications.label': 'News notifications',
          'notification.dispatcher.information': 'Notification settings',
          'group_notifications.title': 'Group notifications',
          'group_notifications.load_error': 'Could not load group notifications',
        }}
      >
        <Notifications />
      </IntlProvider>,
    );

    expect(byRole('alert').get()).toHaveTextContent('group_notifications.load_error');
  });

  it('shows a load error when the group subscriptions request fails', () => {
    jest.mocked(groupNotificationsQueries.useMyGroupSubscriptionsQuery).mockReturnValueOnce({
      data: undefined,
      isError: true,
      isLoading: false,
    } as unknown as ReturnType<typeof groupNotificationsQueries.useMyGroupSubscriptionsQuery>);

    render(
      <IntlProvider
        locale="en"
        messages={{
          'my_account.notifications': 'Notifications',
          'my_profile.news_notifications.title': 'News',
          'my_profile.news_notifications.label': 'News notifications',
          'notification.dispatcher.information': 'Notification settings',
          'group_notifications.title': 'Group notifications',
          'group_notifications.load_error': 'Could not load group notifications',
        }}
      >
        <Notifications />
      </IntlProvider>,
    );

    expect(byRole('alert').get()).toHaveTextContent('group_notifications.load_error');
  });
});
