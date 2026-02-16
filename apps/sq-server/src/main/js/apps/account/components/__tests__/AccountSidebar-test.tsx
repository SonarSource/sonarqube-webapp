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
import { mockLoggedInUser } from '~shared/helpers/mocks/users';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { GlobalSettingKeys } from '~sq-server-commons/types/settings';
import { AccountSidebar } from '../AccountSidebar';

describe('AccountSidebar', () => {
  it('should show Appearance menu item when old navigation is not forced', () => {
    renderComponent(<AccountSidebar />, '/', {
      currentUser: mockLoggedInUser(),
    });

    expect(screen.getByText('my_account.appearance')).toBeInTheDocument();
  });

  it('should hide Appearance menu item when old navigation is forced by admin', () => {
    renderComponent(<AccountSidebar />, '/', {
      appState: mockAppState({
        settings: { [GlobalSettingKeys.ForceOldNavigation]: 'true' },
      }),

      currentUser: mockLoggedInUser(),
    });

    expect(screen.queryByText('my_account.appearance')).not.toBeInTheDocument();
  });
});
