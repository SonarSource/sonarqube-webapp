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
import userEvent from '@testing-library/user-event';
import { mockCurrentUser, mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { CurrentUser } from '~sq-server-commons/types/users';
import { GlobalNavUser } from '../GlobalNavUser';

it('should render the right interface for anonymous user', () => {
  renderGlobalNavUser({ currentUser: mockCurrentUser() });
  expect(screen.getByText('layout.login')).toBeInTheDocument();
});

it('should render the right interface for logged in user', async () => {
  const user = userEvent.setup();
  renderGlobalNavUser();
  await user.click(screen.getByRole('button'));

  expect(screen.getAllByRole('menuitem')).toHaveLength(2);
});

function renderGlobalNavUser(overrides: { currentUser?: CurrentUser } = {}) {
  return renderApp('/', <GlobalNavUser />, { currentUser: mockLoggedInUser(), ...overrides });
}
