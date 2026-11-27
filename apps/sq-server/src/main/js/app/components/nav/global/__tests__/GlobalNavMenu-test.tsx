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
const originalScaAddon = addons.sca;
const originalVortexDashboardAddon = addons.vortexDashboard;
const originalArchitectureAddon = addons.architecture;

afterEach(() => {
  addons.securityAlerts = originalSecurityAlertsAddon;
  addons.sca = originalScaAddon;
  addons.vortexDashboard = originalVortexDashboardAddon;
  addons.architecture = originalArchitectureAddon;
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

it.each(['/admin', '/admin/settings', '/admin/users'])(
  'should keep administration menu active on %s',
  (navigateTo) => {
    const appState = mockAppState({
      canAdmin: true,
      globalPages: [],
      qualifiers: ['TRK'],
    });

    renderGlobalNavMenu({ appState, navigateTo });

    expect(screen.getByRole('link', { name: 'layout.settings' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
);

it('should not keep administration menu active outside admin routes', () => {
  const appState = mockAppState({
    canAdmin: true,
    globalPages: [],
    qualifiers: ['TRK'],
  });

  renderGlobalNavMenu({ appState, navigateTo: '/projects' });

  expect(screen.getByRole('link', { name: 'layout.settings' })).not.toHaveAttribute('aria-current');
});

it.each([
  '/coding_rules',
  '/coding_rules/show',
  '/profiles',
  '/profiles/show',
  '/quality_gates',
  '/quality_gates/show',
  '/license_profiles/show',
])('highlights policies menu on %s', (navigateTo) => {
  addons.sca = { LICENSE_ROUTE_NAME: 'license_profiles' } as NonNullable<typeof addons.sca>;
  renderGlobalNavMenu({ featureList: [Feature.Sca], navigateTo });

  const policiesItem = screen
    .getAllByRole('listitem')
    .find((item) => item.textContent?.includes('layout.policies'));
  expect(policiesItem).toHaveAttribute('data-selected', 'true');
});

it('does not highlight policies outside policy routes', () => {
  renderGlobalNavMenu({ navigateTo: '/projects' });

  const policiesItem = screen
    .getAllByRole('listitem')
    .find((item) => item.textContent?.includes('layout.policies'));
  expect(policiesItem).toHaveAttribute('data-selected', 'false');
});

it('shows policy destinations in dropdown', async () => {
  const user = userEvent.setup();
  renderGlobalNavMenu({});

  await user.click(screen.getByRole('button', { name: 'layout.policies' }));

  expect(screen.getByRole('menuitem', { name: 'coding_rules.page' })).toHaveAttribute(
    'href',
    '/coding_rules',
  );
  expect(screen.getByRole('menuitem', { name: 'quality_profiles.page' })).toHaveAttribute(
    'href',
    '/profiles',
  );
  expect(screen.getByRole('menuitem', { name: 'quality_gates.page' })).toHaveAttribute(
    'href',
    '/quality_gates',
  );
  expect(screen.queryByRole('menuitem', { name: 'sca.licenses.page' })).not.toBeInTheDocument();
});

it('shows license profiles in policies when SCA is available', async () => {
  const user = userEvent.setup();
  addons.sca = { LICENSE_ROUTE_NAME: 'license_profiles' } as NonNullable<typeof addons.sca>;
  renderGlobalNavMenu({ featureList: [Feature.Sca] });

  await user.click(screen.getByRole('button', { name: 'layout.policies' }));

  expect(screen.getByRole('menuitem', { name: 'sca.licenses.page' })).toHaveAttribute(
    'href',
    '/license_profiles',
  );
});

it('should show Security Alerts in global nav when SCA is enabled', () => {
  const appState = mockAppState({ globalPages: [] });
  addons.securityAlerts = {
    SECURITY_ALERTS_NEW_BADGE_EXPIRATION_DATE: '2099-01-01T00:00:00.000Z',
  } as unknown as NonNullable<typeof addons.securityAlerts>;

  renderGlobalNavMenu({ appState, featureList: [Feature.Sca] });

  expect(screen.getByRole('link', { name: /security_alerts\.page/ })).toHaveAttribute(
    'href',
    '/security_alerts?statuses=OPEN',
  );
  expect(screen.queryByText('more')).not.toBeInTheDocument();
});

it('should hide Security Alerts when SCA is disabled', () => {
  const appState = mockAppState({ globalPages: [] });

  renderGlobalNavMenu({ appState });

  expect(screen.queryByRole('link', { name: /security_alerts\.page/ })).not.toBeInTheDocument();
});

it('should show Vortex in global nav when the addon is available', () => {
  const appState = mockAppState({ globalPages: [] });
  addons.vortexDashboard = {
    VORTEX_DASHBOARD_PATH: '/vortex_dashboard',
    VORTEX_NEW_BADGE_EXPIRATION_DATE: '2099-01-01T00:00:00.000Z',
  } as unknown as NonNullable<typeof addons.vortexDashboard>;

  renderGlobalNavMenu({ appState });

  expect(screen.getByRole('link', { name: /vortex_dashboard\.nav_item/ })).toHaveAttribute(
    'href',
    '/vortex_dashboard',
  );
  expect(screen.queryByText('more')).not.toBeInTheDocument();
});

it('should hide Vortex when the addon is unavailable', () => {
  addons.vortexDashboard = undefined;

  renderGlobalNavMenu({ appState: mockAppState({ globalPages: [] }) });

  expect(
    screen.queryByRole('link', { name: /vortex_dashboard\.nav_item/ }),
  ).not.toBeInTheDocument();
});


function renderGlobalNavMenu({
  appState = mockAppState(),
  currentUser = mockCurrentUser(),
  featureList = [],
  navigateTo = '/',
}: {
  appState?: ReturnType<typeof mockAppState>;
  currentUser?: ReturnType<typeof mockCurrentUser>;
  featureList?: Feature[];
  navigateTo?: string;
}) {
  renderApp('*', <GlobalNavMenu currentUser={currentUser} />, {
    appState,
    currentUser,
    featureList,
    navigateTo,
  });
}
