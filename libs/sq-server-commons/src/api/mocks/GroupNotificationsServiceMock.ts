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

import { http } from 'msw';
import { AbstractServiceMock } from '~shared/api/mocks/AbstractServiceMock';
import type {
  GroupNotificationSubscription,
  GroupNotificationType,
} from '~shared/types/group-notifications';

const NOTIFICATIONS_ENDPOINT = '/api/notifications';

interface GroupNotificationsServiceMockData {
  availableTypes: GroupNotificationType[];
  subscriptions: GroupNotificationSubscription[];
}

export default class GroupNotificationsServiceMock extends AbstractServiceMock<GroupNotificationsServiceMockData> {
  handlers = [
    http.get(`${NOTIFICATIONS_ENDPOINT}/list_groups`, () => {
      return this.ok({
        availableTypes: this.data.availableTypes,
        subscriptions: this.data.subscriptions,
      });
    }),

    http.get(`${NOTIFICATIONS_ENDPOINT}/list_group_subscriptions`, () => {
      return this.ok({ groupSubscriptions: this.data.subscriptions });
    }),

    http.post(`${NOTIFICATIONS_ENDPOINT}/add_group`, async ({ request }) => {
      const params = new URLSearchParams(await request.text());
      this.data.subscriptions.push({
        groupUuid: params.get('groupUuid') ?? '',
        notificationType: params.get('type') ?? '',
        groupName: '',
        channelKey: params.get('channel') ?? 'EmailNotificationChannel',
      });
      return this.ok({});
    }),

    http.post(`${NOTIFICATIONS_ENDPOINT}/remove_group`, async ({ request }) => {
      const params = new URLSearchParams(await request.text());
      const groupUuid = params.get('groupUuid') ?? '';
      const type = params.get('type') ?? '';
      const channel = params.get('channel') ?? 'EmailNotificationChannel';
      this.data.subscriptions = this.data.subscriptions.filter(
        (s) =>
          !(s.groupUuid === groupUuid && s.notificationType === type && s.channelKey === channel),
      );
      return this.ok({});
    }),
  ];

  constructor(
    initialSubscriptions: GroupNotificationSubscription[] = [],
    availableTypes: GroupNotificationType[] = [
      { notificationType: 'security-alert-raised', channelKey: 'EmailNotificationChannel' },
      { notificationType: 'security-alert-raised', channelKey: 'BannerChannel' },
    ],
  ) {
    super({ availableTypes, subscriptions: initialSubscriptions });
  }
}
