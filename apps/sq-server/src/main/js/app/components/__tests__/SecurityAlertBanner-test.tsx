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
import { SecurityAlertBanner } from '../SecurityAlertBanner';

const EMPTY_RESPONSE = {
  page: { pageIndex: 1, pageSize: 1, total: 0 },
  securityAlerts: [],
};

const ALERT_RESPONSE = {
  page: { pageIndex: 1, pageSize: 1, total: 1 },
  securityAlerts: [{ id: 'alert-1', status: 'OPEN' }],
};

beforeEach(() => {
  server.use(http.get('/api/v2/security-alerts/alerts', () => HttpResponse.json(EMPTY_RESPONSE)));
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
