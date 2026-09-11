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

import userEvent from '@testing-library/user-event';
import { byRole, byText } from '~shared/helpers/testSelector';
import { addons } from '~sq-server-addons/index';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AppState } from '~sq-server-commons/types/appstate';
import { Feature } from '~sq-server-commons/types/features';
import GlobalNavMore from '../GlobalNavMore';

jest.mock('~sq-server-addons/index', () => ({
  addons: {},
}));

const VORTEX_ADDON = {
  VORTEX_DASHBOARD_PATH: '/vortex_dashboard',
  VORTEX_NEW_BADGE_EXPIRATION_DATE: '2099-01-01T00:00:00.000Z',
};

beforeEach(() => {
  jest.mocked(addons).vortexDashboard = undefined;
  jest.mocked(addons).securityAlerts = undefined;
});

function installVortexAddon() {
  (jest.mocked(addons).vortexDashboard as unknown) = VORTEX_ADDON;
}

it('renders nothing when there is no plugin page and no Vortex dashboard', () => {
  renderGlobalNavMore();

  expect(byText('more').query()).not.toBeInTheDocument();
});

it('renders plugin global pages', async () => {
  renderGlobalNavMore(mockAppState({ globalPages: [{ key: 'foo', name: 'Foo' }] }));

  await userEvent.setup().click(await byText('more').find());

  expect(byRole('menuitem', { name: 'Foo' }).get()).toHaveAttribute('href', '/extension/foo');
  expect(byText('vortex_dashboard.nav_item').query()).not.toBeInTheDocument();
});

it('renders the Vortex item and badges both it and the trigger', async () => {
  installVortexAddon();

  renderGlobalNavMore();

  const trigger = await byText('more').find();

  // the trigger is badged before the menu is even opened
  expect(byText('new').get()).toBeInTheDocument();

  await userEvent.setup().click(trigger);

  const item = byRole('menuitem', { name: /vortex_dashboard\.nav_item/ }).get();
  expect(item).toHaveAttribute('href', '/vortex_dashboard');
  // one badge on the trigger, one on the item
  expect(byText('new').getAll()).toHaveLength(2);
});

it('still renders "More" for the Vortex item alone when there is no plugin page', async () => {
  installVortexAddon();

  renderGlobalNavMore();

  await userEvent.setup().click(await byText('more').find());

  expect(byRole('menuitem', { name: /vortex_dashboard\.nav_item/ }).get()).toBeInTheDocument();
});

it('still renders the Vortex item when other plugin pages are present', async () => {
  installVortexAddon();

  renderGlobalNavMore(mockAppState({ globalPages: [{ key: 'foo', name: 'Foo' }] }));

  await userEvent.setup().click(await byText('more').find());

  expect(byRole('menuitem', { name: 'Foo' }).get()).toHaveAttribute('href', '/extension/foo');
  expect(byRole('menuitem', { name: /vortex_dashboard\.nav_item/ }).get()).toHaveAttribute(
    'href',
    '/vortex_dashboard',
  );
});

function renderGlobalNavMore(
  appState: AppState = mockAppState({ globalPages: [] }),
  featureList: Feature[] = [],
) {
  renderApp('/', <GlobalNavMore />, { appState, featureList });
}
