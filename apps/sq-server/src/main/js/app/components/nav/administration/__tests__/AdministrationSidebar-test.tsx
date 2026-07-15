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
import { Feature } from '~sq-server-commons/types/features';
import { AdministrationSidebar } from '../AdministrationSidebar';

jest.mock('~sq-server-addons/index', () => ({
  addons: {},
}));

beforeEach(() => {
  jest.mocked(addons).license = undefined;
  jest.mocked(addons).remediationAgent = undefined;
});

it('render correctly', () => {
  renderAdminSidebar();

  expect(byRole('link').getAll()).toHaveLength(11);

  expect(byText('audit_logs.page').query()).not.toBeInTheDocument();
  expect(byText('support').query()).not.toBeInTheDocument();
  expect(byText('license.feature_name').query()).not.toBeInTheDocument();
});

it('render correctly with license', () => {
  (jest.mocked(addons).license as unknown) = true;
  renderAdminSidebar();

  expect(byRole('link').getAll()).toHaveLength(13);
  expect(byText('support').get()).toBeInTheDocument();
  expect(byText('license.feature_name').get()).toBeInTheDocument();
});

it('render correctly with extensions', () => {
  const extensions = [
    { key: 'e1', name: 'Extension 1' },
    { key: 'e2', name: 'Extension 2' },
  ];
  renderAdminSidebar(extensions);

  expect(byRole('link').getAll()).toHaveLength(13);
  expect(byRole('link', { name: extensions[0].name }).get()).toBeInTheDocument();
  expect(byRole('link', { name: extensions[1].name }).get()).toBeInTheDocument();
});

it('render correctly with governance extension', () => {
  renderAdminSidebar([], mockAppState({ qualifiers: [ComponentQualifier.Portfolio] }));

  expect(byRole('link').getAll()).toHaveLength(13);
  expect(byText('audit_logs.page').get()).toBeInTheDocument();
  expect(byText('portfolios.page').get()).toBeInTheDocument();
});

it('renders AI Capabilities item when the RemediationAgent feature is available', () => {
  (jest.mocked(addons).remediationAgent as unknown) = true;
  renderAdminSidebar([], undefined, [Feature.RemediationAgent]);

  expect(byText('sidebar.ai_capabilities').get()).toBeInTheDocument();
});

it('hides the AI Capabilities item when the RemediationAgent feature is missing', () => {
  (jest.mocked(addons).remediationAgent as unknown) = true;
  renderAdminSidebar();

  expect(byText('sidebar.ai_capabilities').query()).not.toBeInTheDocument();
});

it('hides the AI Capabilities item when the addon is not installed', () => {
  renderAdminSidebar([], undefined, [Feature.RemediationAgent]);

  expect(byText('sidebar.ai_capabilities').query()).not.toBeInTheDocument();
});

function renderAdminSidebar(
  extensions: Extension[] = [],
  appState?: AppState,
  featureList?: Feature[],
) {
  renderApp('/', <AdministrationSidebar extensions={extensions} />, { appState, featureList });
}
