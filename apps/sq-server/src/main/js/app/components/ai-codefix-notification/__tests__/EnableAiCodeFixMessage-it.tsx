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

import { screen } from '@testing-library/react';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { definitions } from '~sq-server-commons/helpers/mocks/definitions-list';
import { mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-commons/types/features';
import EnableAiCodeFixMessage from '../EnableAiCodeFixMessage';

let settingServiceMock: SettingsServiceMock;

beforeAll(() => {
  settingServiceMock = new SettingsServiceMock();
  settingServiceMock.setDefinitions(definitions);
});

afterEach(() => {
  settingServiceMock.reset();
});

it('should display message when user is admin and feature is inactive but paid after early access mode', async () => {
  render(true);

  expect(
    await screen.findByText('notification.aicodefix.ga.paid.inactive.admin.message'),
  ).toBeInTheDocument();
});

it('should display message when user is admin and feature is active but not paid after early access mode', async () => {
  settingServiceMock.set('sonar.ai.suggestions.enabled', 'ENABLED_FOR_ALL_PROJECTS');
  render(true, [Feature.FixSuggestionsMarketing]);

  expect(
    await screen.findByText('notification.aicodefix.ga.unpaid.active.admin.message'),
  ).toBeInTheDocument();
});

it('should display message when user is not admin and feature is active but not paid after early access mode', async () => {
  settingServiceMock.set('sonar.ai.suggestions.enabled', 'ENABLED_FOR_ALL_PROJECTS');
  render(false, [Feature.FixSuggestionsMarketing]);

  expect(
    await screen.findByText('notification.aicodefix.ga.unpaid.active.user.message'),
  ).toBeInTheDocument();
});

function render(isAdmin: boolean, features?: Feature[]) {
  return renderComponent(
    <AvailableFeaturesContext.Provider value={features ?? [Feature.FixSuggestions]}>
      <EnableAiCodeFixMessage />
    </AvailableFeaturesContext.Provider>,
    '/?id=mycomponent',
    {
      currentUser: mockLoggedInUser(isAdmin ? { permissions: { global: ['admin'] } } : {}),
    },
  );
}
