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

import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '~shared/api/mocks/server';
import { byRole } from '~shared/helpers/testSelector';
import { mockCurrentUser, mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { NotificationGroupType } from '~sq-server-commons/types/notifications';
import { SecurityAlertBanner } from '../SecurityAlertBanner';

const EMPTY_RESPONSE = {
  page: { pageIndex: 1, pageSize: 1, total: 0 },
  securityAlerts: [],
};

const ALERT_RESPONSE = {
  page: { pageIndex: 1, pageSize: 1, total: 1 },
  securityAlerts: [{ id: 'alert-1', status: 'OPEN' }],
};

const SUBSCRIBED_RESPONSE = {
  groupSubscriptions: [
    { groupName: 'security-team', notificationType: NotificationGroupType.SecurityAlertRaised },
  ],
};

const UNSUBSCRIBED_RESPONSE = {
  groupSubscriptions: [{ groupName: 'other-group', notificationType: 'some-other-type' }],
};

const EMPTY_SUBSCRIPTIONS_RESPONSE = {
  groupSubscriptions: [],
};

beforeEach(() => {
  server.use(
    http.get('/api/v2/security-alerts/alerts', () => HttpResponse.json(EMPTY_RESPONSE)),
    http.get('/api/notifications/list_group_subscriptions', () =>
      HttpResponse.json(SUBSCRIBED_RESPONSE),
    ),
  );
});

afterEach(() => {
  server.resetHandlers();
});

const ui = {
  banner: byRole('alert'),
  listLink: byRole('link', { name: /security_alerts.security_alert_banner.message/ }),
};

it('renders nothing when user is not logged in', () => {
  renderComponent(<SecurityAlertBanner />, '/', {
    currentUser: mockCurrentUser({ isLoggedIn: false }),
  });
  expect(ui.banner.query()).not.toBeInTheDocument();
});

it('renders nothing when there are no open alerts', async () => {
  renderComponent(<SecurityAlertBanner />, '/', {
    currentUser: mockLoggedInUser(),
  });
  await waitFor(() => expect(ui.banner.query()).not.toBeInTheDocument());
});

it('renders banner with list link when an open alert exists', async () => {
  server.use(http.get('/api/v2/security-alerts/alerts', () => HttpResponse.json(ALERT_RESPONSE)));

  renderComponent(<SecurityAlertBanner />, '/', {
    currentUser: mockLoggedInUser(),
  });

  expect(await ui.banner.find()).toBeInTheDocument();
  expect(await ui.listLink.find()).toHaveAttribute('href', '/security_alerts?statuses=OPEN');
});

it('renders nothing when subscriptions contain no security-alert-raised entry', async () => {
  server.use(
    http.get('/api/v2/security-alerts/alerts', () => HttpResponse.json(ALERT_RESPONSE)),
    http.get('/api/notifications/list_group_subscriptions', () =>
      HttpResponse.json(UNSUBSCRIBED_RESPONSE),
    ),
  );

  renderComponent(<SecurityAlertBanner />, '/', {
    currentUser: mockLoggedInUser(),
  });

  await expect(ui.banner.find()).rejects.toThrow();
});

it('renders nothing when subscriptions list is empty', async () => {
  server.use(
    http.get('/api/v2/security-alerts/alerts', () => HttpResponse.json(ALERT_RESPONSE)),
    http.get('/api/notifications/list_group_subscriptions', () =>
      HttpResponse.json(EMPTY_SUBSCRIPTIONS_RESPONSE),
    ),
  );

  renderComponent(<SecurityAlertBanner />, '/', {
    currentUser: mockLoggedInUser(),
  });

  await expect(ui.banner.find()).rejects.toThrow();
});
