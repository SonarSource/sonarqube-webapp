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

import { byRole, byText } from '~shared/helpers/testSelector';
import { Extension } from '~shared/types/common';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AppState } from '~sq-server-commons/types/appstate';
import { PurchaseableFeature } from '~sq-server-commons/types/editions';
import { Feature } from '~sq-server-commons/types/features';
import { AdministrationSidebar } from '../AdministrationSidebar';

jest.mock('~sq-server-addons/index', () => ({
  addons: {
    entitlements: {
      usePurchasableFeature: jest.fn(),
    },
  },
}));

beforeEach(() => {
  jest.mocked(addons).license = undefined;
  jest.mocked(addons).remediationAgent = undefined;
  mockRemediationAgentQuery({ data: undefined, isSuccess: true });
});

it('render correctly', () => {
  renderAdminSidebar();

  expect(byRole('link', { hidden: true }).getAll()).toHaveLength(12);
  // The sidebar nav is aria-hidden, so its links have no accessible name to query by.
  expect(byText('onboarding_dashboard.sidebar').get().closest('a')).toHaveAttribute(
    'href',
    '/admin/onboarding-dashboard',
  );

  expect(byText('audit_logs.page').query()).not.toBeInTheDocument();
  expect(byText('support').query()).not.toBeInTheDocument();
  expect(byText('license.feature_name').query()).not.toBeInTheDocument();
});

it('render correctly with license', () => {
  (jest.mocked(addons).license as unknown) = true;
  renderAdminSidebar();

  expect(byRole('link', { hidden: true }).getAll()).toHaveLength(14);
  expect(byText('support').get()).toBeInTheDocument();
  expect(byText('license.feature_name').get()).toBeInTheDocument();
});

it('render correctly with extensions', () => {
  const extensions = [
    { key: 'e1', name: 'Extension 1' },
    { key: 'e2', name: 'Extension 2' },
  ];
  renderAdminSidebar(extensions);

  expect(byRole('link', { hidden: true }).getAll()).toHaveLength(14);
  expect(byText(extensions[0].name).get()).toBeInTheDocument();
  expect(byText(extensions[1].name).get()).toBeInTheDocument();
});

it('render correctly with governance extension', () => {
  renderAdminSidebar([], mockAppState({ qualifiers: [ComponentQualifier.Portfolio] }));

  expect(byRole('link', { hidden: true }).getAll()).toHaveLength(14);
  expect(byText('audit_logs.page').get()).toBeInTheDocument();
  expect(byText('portfolios.page').get()).toBeInTheDocument();
});


function renderAdminSidebar(
  extensions: Extension[] = [],
  appState?: AppState,
  featureList?: Feature[],
) {
  renderApp('/', <AdministrationSidebar extensions={extensions} />, { appState, featureList });
}

function mockRemediationAgentQuery({
  data,
  isError = false,
  isPending = false,
  isSuccess,
}: {
  data: PurchaseableFeature | undefined;
  isError?: boolean;
  isPending?: boolean;
  isSuccess: boolean;
}) {
  jest.mocked(addons.entitlements.usePurchasableFeature).mockReturnValue({
    data,
    isError,
    isPending,
    isSuccess,
  } as ReturnType<typeof addons.entitlements.usePurchasableFeature>);
}
