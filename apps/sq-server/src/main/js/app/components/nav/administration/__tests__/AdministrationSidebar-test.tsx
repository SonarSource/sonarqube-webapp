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
import { registerServiceMocks, resetServiceMocks, server } from '~shared/api/mocks/server';
import { byRole, byText } from '~shared/helpers/testSelector';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { Extension } from '~shared/types/common';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import * as sqsFeatureFlags from '~sq-server-commons/sq-server-adapters/helpers/feature-flags';
import {
  BillingServiceDefaultDataset,
  BillingServiceMock,
} from '~sq-server-commons/api/mocks/BillingServiceMock';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AppState } from '~sq-server-commons/types/appstate';
import { GROUP_NOTIFICATIONS_BASE_PATH } from '../../../../../apps/groups/constants';
import { AdministrationSidebar } from '../AdministrationSidebar';

jest.mock('~sq-server-addons/index', () => ({
  addons: {},
}));

const billingHandler = new BillingServiceMock(BillingServiceDefaultDataset);
const getDefaultSqsFlag = sqsFeatureFlags.useFlag;
const DEFAULT_NAVIGATION_LINK_COUNT = 13;
const NAVIGATION_LINK_COUNT_WITH_OPTIONAL_ITEMS = 15;

function mockGroupNotificationFlag(enabled: boolean) {
  jest
    .spyOn(sqsFeatureFlags, 'useFlag')
    .mockImplementation((name) =>
      name === 'scaEnableGroupNotificationSubscriptions' ? enabled : getDefaultSqsFlag(name),
    );
}

beforeEach(() => {
  jest.mocked(addons).license = undefined;
  jest.mocked(addons).remediationAgent = undefined;
  jest.mocked(addons).architecture = undefined;
  billingHandler.reset();
  registerServiceMocks(billingHandler);
});

afterEach(() => {
  jest.restoreAllMocks();
  resetServiceMocks();
});

it('renders default administration navigation without optional links', () => {
  renderAdminSidebar();

  expect(byRole('link', { hidden: true }).getAll()).toHaveLength(DEFAULT_NAVIGATION_LINK_COUNT);
  expect(byText('layout.onboarding_dashboard').get()).toBeInTheDocument();
  expect(
    byRole('link', { hidden: true })
      .getAll()
      .map((link) => link.getAttribute('href')),
  ).toContain('/admin/project-coverage');
  expect(byText('group_notifications.page').get()).toBeInTheDocument();

  expect(byText('audit_logs.page').query()).not.toBeInTheDocument();
  expect(byText('support').query()).not.toBeInTheDocument();
  expect(byText('license.feature_name').query()).not.toBeInTheDocument();
});

it('shows group notifications in the Security menu when the feature is enabled', () => {
  mockGroupNotificationFlag(true);
  renderAdminSidebar();

  expect(byText('group_notifications.page').get()).toBeInTheDocument();
  expect(
    byRole('link', { hidden: true })
      .getAll()
      .map((link) => link.getAttribute('href')),
  ).toContain(GROUP_NOTIFICATIONS_BASE_PATH);
});

it('hides group notifications from the Security menu when the feature is disabled', () => {
  mockGroupNotificationFlag(false);
  renderAdminSidebar();

  expect(byText('group_notifications.page').query()).not.toBeInTheDocument();
});

it('renders support and license navigation when the license addon is enabled', () => {
  (jest.mocked(addons).license as unknown) = true;
  renderAdminSidebar();

  expect(byRole('link', { hidden: true }).getAll()).toHaveLength(
    NAVIGATION_LINK_COUNT_WITH_OPTIONAL_ITEMS,
  );
  expect(byText('support').get()).toBeInTheDocument();
  expect(byText('license.feature_name').get()).toBeInTheDocument();
});

it('renders extension navigation when extension pages are provided', () => {
  const extensions = [
    { key: 'e1', name: 'Extension 1' },
    { key: 'e2', name: 'Extension 2' },
  ];
  renderAdminSidebar(extensions);

  expect(byRole('link', { hidden: true }).getAll()).toHaveLength(
    NAVIGATION_LINK_COUNT_WITH_OPTIONAL_ITEMS,
  );
  expect(byText(extensions[0].name).get()).toBeInTheDocument();
  expect(byText(extensions[1].name).get()).toBeInTheDocument();
});

it('renders governance navigation for portfolio components', () => {
  renderAdminSidebar([], mockAppState({ qualifiers: [ComponentQualifier.Portfolio] }));

  expect(byRole('link', { hidden: true }).getAll()).toHaveLength(
    NAVIGATION_LINK_COUNT_WITH_OPTIONAL_ITEMS,
  );
  expect(byText('audit_logs.page').get()).toBeInTheDocument();
  expect(byText('portfolios.page').get()).toBeInTheDocument();
});


function renderAdminSidebar(extensions: Extension[] = [], appState?: AppState) {
  renderApp('/', <AdministrationSidebar extensions={extensions} />, { appState });
}
