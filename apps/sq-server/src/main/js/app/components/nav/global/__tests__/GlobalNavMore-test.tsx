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
import { http, HttpResponse } from 'msw';
import { registerServiceMocks, resetServiceMocks, server } from '~shared/api/mocks/server';
import { byRole, byText } from '~shared/helpers/testSelector';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { addons } from '~sq-server-addons/index';
import {
  BillingServiceDefaultDataset,
  BillingServiceMock,
} from '~sq-server-commons/api/mocks/BillingServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AppState } from '~sq-server-commons/types/appstate';
import { SettingsKey } from '~sq-server-commons/types/settings';
import GlobalNavMore from '../GlobalNavMore';

jest.mock('~sq-server-addons/index', () => ({
  addons: {},
}));

const VORTEX_ADDON = {
  VORTEX_DASHBOARD_PATH: '/vortex_dashboard',
  VORTEX_NEW_BADGE_EXPIRATION_DATE: '2099-01-01T00:00:00.000Z',
};

const billingHandler = new BillingServiceMock(BillingServiceDefaultDataset);
const settingsHandler = new SettingsServiceMock();

beforeEach(() => {
  jest.mocked(addons).vortexDashboard = undefined;
  billingHandler.reset();
  settingsHandler.reset();
  registerServiceMocks(billingHandler);
});

afterEach(() => {
  resetServiceMocks();
});

function installVortexAddon({ isAvailable = true, isSettingEnabled = true } = {}) {
  (jest.mocked(addons).vortexDashboard as unknown) = VORTEX_ADDON;
  settingsHandler.set(SettingsKey.VortexEnabled, isSettingEnabled);
  server.use(
    http.get('/api/v2/entitlements/purchasable-features', () =>
      HttpResponse.json([
        {
          featureKey: EntitlementCheckFeatureKey.AgenticAnalysis,
          isAvailable,
          isEnabled: isAvailable,
        },
      ]),
    ),
  );
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

it('renders the Vortex item and badges both it and the trigger when entitled', async () => {
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

it('hides the Vortex item when the instance is not entitled', async () => {
  installVortexAddon({ isAvailable: false });

  renderGlobalNavMore(mockAppState({ globalPages: [{ key: 'foo', name: 'Foo' }] }));

  await userEvent.setup().click(await byText('more').find());

  expect(await byRole('menuitem', { name: 'Foo' }).find()).toBeInTheDocument();
  expect(byText('vortex_dashboard.nav_item').query()).not.toBeInTheDocument();
  expect(byText('new').query()).not.toBeInTheDocument();
});

it('hides the Vortex item when the setting is disabled', async () => {
  installVortexAddon({ isSettingEnabled: false });

  renderGlobalNavMore(mockAppState({ globalPages: [{ key: 'foo', name: 'Foo' }] }));

  await userEvent.setup().click(await byText('more').find());

  expect(await byRole('menuitem', { name: 'Foo' }).find()).toBeInTheDocument();
  expect(byText('vortex_dashboard.nav_item').query()).not.toBeInTheDocument();
});

function renderGlobalNavMore(appState: AppState = mockAppState({ globalPages: [] })) {
  renderApp('/', <GlobalNavMore />, { appState });
}
