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
import { PropsWithChildren } from 'react';
import CodingRulesServiceMock from '~sq-server-commons/api/mocks/CodingRulesServiceMock';
import FixSuggestionsServiceMock from '~sq-server-commons/api/mocks/FixSuggestionsServiceMock';
import MessagesServiceMock from '~sq-server-commons/api/mocks/MessagesServiceMock';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import SystemServiceMock from '~sq-server-commons/api/mocks/SystemServiceMock';
import {
  mockAppState,
  mockCurrentUser,
  mockLoggedInUser,
} from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';
import { AppState } from '~sq-server-commons/types/appstate';
import { Feature } from '~sq-server-commons/types/features';
import { Permissions } from '~sq-server-commons/types/permissions';
import { CurrentUser } from '~sq-server-commons/types/users';
import GlobalContainer from '../GlobalContainer';

let settingServiceMock: SettingsServiceMock;
let rulesServiceMock: CodingRulesServiceMock;
let messagesServiceMock: MessagesServiceMock;
let systemServiceMock: SystemServiceMock;
let modeServiceMock: ModeServiceMock;

jest.mock(
  '~sq-server-commons/context/metrics/MetricsContextProvider',
  () =>
    ({ children }: PropsWithChildren) =>
      children,
);
jest.mock(
  '~sq-server-commons/context/indexation/IndexationContextProvider',
  () =>
    ({ children }: PropsWithChildren) =>
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
  codefixBanner: byText(/notification.aicodefix/),
};

it('should render correctly the CodeFix banner', async () => {
  setup(
    mockCurrentUser({ permissions: { global: [Permissions.Admin] } }),
    [Feature.FixSuggestions],
    mockAppState({ canAdmin: true }),
  );
  expect(await ui.codefixBanner.find()).toBeInTheDocument();
});

it('should not show Codefix if not admin', async () => {
  setup(mockCurrentUser(), [Feature.AiCodeAssurance, Feature.FixSuggestions]);
  await waitFor(() => {
    expect(ui.codefixBanner.query()).not.toBeInTheDocument();
  });
});

it('should not show Codefix if no feature admin', async () => {
  setup(mockCurrentUser({ permissions: { global: [Permissions.Admin] } }));
  await waitFor(() => {
    expect(ui.codefixBanner.query()).not.toBeInTheDocument();
  });
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
