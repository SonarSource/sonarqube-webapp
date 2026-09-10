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
import { NotificationGlobalType, NotificationsResponse } from '../../types/notifications';

const GROUP_SUBSCRIPTION_TYPES = [
  NotificationGlobalType.NewAlerts,
  NotificationGlobalType.ChangesOnMyIssue,
];

const DEFAULT_DATA: NotificationsResponse = {
  channels: ['EmailNotificationChannel'],
  globalTypes: Object.values(NotificationGlobalType),
  notifications: [],
  perProjectTypes: [],
};

/**
 * MSW-based mock for GET /api/notifications/list, covering only the subset of the notifications
 * API needed for group subscription flows.
 *
 * NotificationsMock.ts partially duplicates this: it intercepts the same endpoint via jest.mock
 * and also covers POST /api/notifications/add and POST /api/notifications/remove (used by the
 * Account page's per-user notification preferences). To fully migrate NotificationsMock.ts to MSW
 * and retire it, this mock would need:
 *
 * 1. Add POST /api/notifications/add — parses the body (sent via the legacy `post()` helper in
 *    request.ts using its own serialization, not URLSearchParams) and pushes to
 *    `this.data.notifications`.
 *
 * 2. Add POST /api/notifications/remove — same body format, filters from
 *    `this.data.notifications`.
 *
 * 3. Update Account-it.tsx and ProjectInformationApp-it.tsx to use registerServiceMocks /
 *    resetServiceMocks instead of instantiating NotificationsMock directly.
 *
 * The main risk is step 1/2: the legacy request.ts `setData` serialization format must be matched
 * exactly in the MSW handlers.
 */
export default class NotificationsServiceMock extends AbstractServiceMock<NotificationsResponse> {
  handlers = [
    http.get('/api/notifications/list', ({ request }) => {
      const filter = this.getQueryParams(request).get('filter');
      if (filter === 'groupSubscription') {
        return this.ok({ ...this.data, globalTypes: GROUP_SUBSCRIPTION_TYPES });
      }
      return this.ok(this.data);
    }),
  ];

  constructor(initialData?: Partial<NotificationsResponse>) {
    super({ ...DEFAULT_DATA, ...initialData });
  }
}
