/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import CodingRulesServiceMock from '~sq-server-shared/api/mocks/CodingRulesServiceMock';
import FixSuggestionsServiceMock from '~sq-server-shared/api/mocks/FixSuggestionsServiceMock';
import MessagesServiceMock from '~sq-server-shared/api/mocks/MessagesServiceMock';
import { ModeServiceMock } from '~sq-server-shared/api/mocks/ModeServiceMock';
import SettingsServiceMock from '~sq-server-shared/api/mocks/SettingsServiceMock';
import SystemServiceMock from '~sq-server-shared/api/mocks/SystemServiceMock';
import {
  mockAppState,
  mockCurrentUser,
  mockLoggedInUser,
} from '~sq-server-shared/helpers/testMocks';
import { renderComponent } from '~sq-server-shared/helpers/testReactTestingUtils';
import { byText } from '~sq-server-shared/sonar-aligned/helpers/testSelector';
import { AppState } from '~sq-server-shared/types/appstate';
import { Feature } from '~sq-server-shared/types/features';
import { Permissions } from '~sq-server-shared/types/permissions';
import { CurrentUser } from '~sq-server-shared/types/users';
import GlobalContainer from '../GlobalContainer';

let settingServiceMock: SettingsServiceMock;
let rulesServiceMock: CodingRulesServiceMock;
let messagesServiceMock: MessagesServiceMock;
let systemServiceMock: SystemServiceMock;
let modeServiceMock: ModeServiceMock;

jest.mock(
  '~sq-server-shared/context/metrics/MetricsContextProvider',
  () =>
    ({ children }: any) =>
      children,
);
jest.mock(
  '~sq-server-shared/context/languages/LanguagesContextProvider',
  () =>
    ({ children }: any) =>
      children,
);
jest.mock(
  '~sq-server-shared/context/indexation/IndexationContextProvider',
  () =>
    ({ children }: any) =>
      children,
);

beforeAll(() => {
  settingServiceMock = new SettingsServiceMock();
  // eslint-disable-next-line no-new
  new FixSuggestionsServiceMock();
  rulesServiceMock = new CodingRulesServiceMock();
  messagesServiceMock = new MessagesServiceMock();
  systemServiceMock = new SystemServiceMock();
  modeServiceMock = new ModeServiceMock();
});

afterEach(() => {
  settingServiceMock.reset();
  rulesServiceMock.reset();
  messagesServiceMock.reset();
  systemServiceMock.reset();
  modeServiceMock.reset();
});

const ui = {
  autodetectBanner: byText('notification.autodetect.ai.message'),
  codefixBanner: byText(/notification.aicodefix/),
};

it('should render correctly both CodeFix and Autodetect banners', async () => {
  setup(
    mockCurrentUser({ permissions: { global: [Permissions.Admin] } }),
    [Feature.AiCodeAssurance, Feature.FixSuggestions],
    mockAppState({ canAdmin: true }),
  );
  expect(await ui.codefixBanner.find()).toBeInTheDocument();
  expect(ui.autodetectBanner.get()).toBeInTheDocument();
});

it('should not show Autodetect AI banner', async () => {
  setup(mockCurrentUser({ permissions: { global: [Permissions.Admin] } }), [
    Feature.FixSuggestions,
  ]);
  expect(await ui.codefixBanner.find()).toBeInTheDocument();
  expect(ui.autodetectBanner.query()).not.toBeInTheDocument();
});

it('should not show Codefix and Autodetect AI if not admin', async () => {
  setup(mockCurrentUser(), [Feature.AiCodeAssurance, Feature.FixSuggestions]);
  await waitFor(() => {
    expect(ui.autodetectBanner.query()).not.toBeInTheDocument();
  });
  expect(ui.codefixBanner.query()).not.toBeInTheDocument();
});

it('should not show Codefix and Autodetect AI if no feature admin', async () => {
  setup(mockCurrentUser({ permissions: { global: [Permissions.Admin] } }), [
    Feature.AiCodeAssurance,
  ]);
  await waitFor(() => {
    expect(ui.autodetectBanner.query()).not.toBeInTheDocument();
  });
  expect(ui.codefixBanner.query()).not.toBeInTheDocument();
});

function setup(
  currentUser: CurrentUser = mockLoggedInUser(),
  featureList: Feature[] = [],
  appState: AppState = mockAppState(),
) {
  return renderComponent(<GlobalContainer />, '/', {
    currentUser,
    featureList,
    appState,
  });
}
