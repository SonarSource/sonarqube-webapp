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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addons } from '~sq-server-addons/index';
import { mockAppState, mockCurrentUser } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-commons/types/features';
import { GlobalNavMenu } from '../GlobalNavMenu';

const originalSecurityAlertsAddon = addons.securityAlerts;

afterEach(() => {
  addons.securityAlerts = originalSecurityAlertsAddon;
});

it('should work with extensions', () => {
  const appState = mockAppState({
    globalPages: [{ key: 'foo', name: 'Foo' }],
    qualifiers: ['TRK'],
  });

  const currentUser = mockCurrentUser({
    isLoggedIn: false,
    dismissedNotices: {},
  });
  renderGlobalNavMenu({ appState, currentUser });
  expect(screen.getByText('more')).toBeInTheDocument();
});

it('should show administration menu if the user has the rights', () => {
  const appState = mockAppState({
    canAdmin: true,
    globalPages: [],
    qualifiers: ['TRK'],
  });
  const currentUser = mockCurrentUser({
    isLoggedIn: false,
    dismissedNotices: {},
  });

  renderGlobalNavMenu({ appState, currentUser });
  expect(screen.getByText('layout.settings')).toBeInTheDocument();
});

it('should show the Security Alerts menu when SCA is enabled', async () => {
  const user = userEvent.setup();
  const appState = mockAppState({ globalPages: [] });
  addons.securityAlerts = {} as NonNullable<typeof addons.securityAlerts>;

  renderGlobalNavMenu({ appState, featureList: [Feature.Sca] });

  await user.click(screen.getByText('more'));

  expect(screen.getByRole('menuitem', { name: 'security_alerts.page' })).toHaveAttribute(
    'href',
    '/security_alerts?statuses=OPEN',
  );
});

it('should hide the Security Alerts menu when SCA is disabled', async () => {
  const user = userEvent.setup();
  const appState = mockAppState({ globalPages: [{ key: 'foo', name: 'Foo' }] });

  renderGlobalNavMenu({ appState });

  await user.click(screen.getByText('more'));

  expect(screen.queryByText('security_alerts.page')).not.toBeInTheDocument();
});

function renderGlobalNavMenu({
  appState = mockAppState(),
  currentUser = mockCurrentUser(),
  featureList = [],
}: {
  appState?: ReturnType<typeof mockAppState>;
  currentUser?: ReturnType<typeof mockCurrentUser>;
  featureList?: Feature[];
}) {
  renderApp('/', <GlobalNavMenu currentUser={currentUser} />, {
    appState,
    currentUser,
    featureList,
  });
}
