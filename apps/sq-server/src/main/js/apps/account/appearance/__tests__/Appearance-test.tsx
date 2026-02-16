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
import userEvent from '@testing-library/user-event';
import { mockLoggedInUser } from '~shared/helpers/mocks/users';
import { get, save } from '~shared/helpers/storage';
import { byLabelText } from '~shared/helpers/testSelector';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { SIDEBAR_NAVIGATION_USER_PREFERENCE } from '~sq-server-commons/helpers/useEnableSidebarNavigation';
import { GlobalSettingKeys } from '~sq-server-commons/types/settings';
import { NEW_NAVIGATION_PROMOTION_DISMISSED_KEY } from '../../../../app/components/promotion-notification/NewNavigationPromotionNotification';
import { Appearance } from '../Appearance';

jest.mock('~shared/helpers/storage', () => ({
  get: jest.fn(),
  remove: jest.fn(),
  save: jest.fn(),
}));

describe('AppearanceLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be the new by default, and should allow switching', async () => {
    jest.mocked(get).mockReturnValue(null);
    const user = userEvent.setup();
    renderComponent(<Appearance />, '/', { currentUser: mockLoggedInUser() });

    const switchInput = byLabelText('my_account.appearance.new_ui.switch_label').get();
    expect(switchInput).toBeChecked();

    await user.click(switchInput);

    expect(save).toHaveBeenCalledWith(SIDEBAR_NAVIGATION_USER_PREFERENCE, 'false');
    expect(save).toHaveBeenCalledWith(NEW_NAVIGATION_PROMOTION_DISMISSED_KEY, 'true');
  });

  it('should be initialized to the saved value, and should allow switching', async () => {
    jest.mocked(get).mockReturnValue('false');

    const user = userEvent.setup();
    renderComponent(<Appearance />, '/', { currentUser: mockLoggedInUser() });

    const switchInput = byLabelText('my_account.appearance.new_ui.switch_label').get();
    expect(switchInput).not.toBeChecked();

    await user.click(switchInput);

    expect(save).toHaveBeenCalledWith(SIDEBAR_NAVIGATION_USER_PREFERENCE, 'true');
    expect(save).toHaveBeenCalledWith(NEW_NAVIGATION_PROMOTION_DISMISSED_KEY, 'true');
  });

  it('should render NotFound when old navigation is forced by admin', () => {
    renderComponent(<Appearance />, '/', {
      appState: mockAppState({
        settings: { [GlobalSettingKeys.ForceOldNavigation]: 'true' },
      }),

      currentUser: mockLoggedInUser(),
    });

    expect(screen.getByText('page_not_found')).toBeInTheDocument();
  });
});
