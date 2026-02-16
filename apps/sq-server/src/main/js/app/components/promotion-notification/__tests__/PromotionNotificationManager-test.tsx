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

import { useFlags } from '~adapters/helpers/feature-flags';
import { byText } from '~shared/helpers/testSelector';
import { mockCurrentUser, mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { CurrentUser, NoticeType } from '~sq-server-commons/types/users';
import { NEW_NAVIGATION_PROMOTION_DISMISSED_KEY } from '../NewNavigationPromotionNotification';
import { PromotionNotificationManager } from '../PromotionNotificationManager';

jest.mock(
  '~adapters/helpers/feature-flags',
  () =>
    ({
      ...jest.requireActual('~adapters/helpers/feature-flags'),
      useFlags: jest.fn(),
    }) as typeof import('~adapters/helpers/feature-flags'),
);

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();

  jest.mocked(useFlags).mockReturnValue({
    frontEndEngineeringEnableSidebarNavigation: true,
  } as unknown as ReturnType<typeof useFlags>);
});

it('should not render anything when user is anonymous', () => {
  renderPromotionNotificationManager(mockCurrentUser({ isLoggedIn: false }));

  expect(byText('promotion.new_navigation.title').query()).not.toBeInTheDocument();
  expect(byText('promotion.sqide.title').query()).not.toBeInTheDocument();
});

it('should render new navigation promotion when feature flag is enabled and not dismissed', () => {
  renderPromotionNotificationManager();

  expect(byText('promotion.new_navigation.title').get()).toBeInTheDocument();
  expect(byText('promotion.sqide.title').query()).not.toBeInTheDocument();
});

it('should render SQIDE promotion when feature flag is disabled', () => {
  jest.mocked(useFlags).mockReturnValue({
    frontEndEngineeringEnableSidebarNavigation: false,
  } as unknown as ReturnType<typeof useFlags>);

  renderPromotionNotificationManager();

  expect(byText('promotion.new_navigation.title').query()).not.toBeInTheDocument();
  expect(byText('promotion.sqide.title').get()).toBeInTheDocument();
});

it('should render SQIDE promotion when new navigation promotion was dismissed', () => {
  localStorage.setItem(NEW_NAVIGATION_PROMOTION_DISMISSED_KEY, JSON.stringify(true));

  renderPromotionNotificationManager();

  expect(byText('promotion.new_navigation.title').query()).not.toBeInTheDocument();
  expect(byText('promotion.sqide.title').get()).toBeInTheDocument();
});

it('should not render SQIDE promotion if it was previously dismissed', () => {
  localStorage.setItem(NEW_NAVIGATION_PROMOTION_DISMISSED_KEY, JSON.stringify(true));

  renderPromotionNotificationManager(
    mockLoggedInUser({ dismissedNotices: { [NoticeType.SONARLINT_AD]: true } }),
  );

  expect(byText('promotion.new_navigation.title').query()).not.toBeInTheDocument();
  expect(byText('promotion.sqide.title').query()).not.toBeInTheDocument();
});

it('should not render SQIDE promotion when new navigation promotion is showing', () => {
  renderPromotionNotificationManager();

  expect(byText('promotion.new_navigation.title').get()).toBeInTheDocument();
  expect(byText('promotion.sqide.title').query()).not.toBeInTheDocument();
});

function renderPromotionNotificationManager(currentUser: CurrentUser = mockLoggedInUser()) {
  return renderComponent(<PromotionNotificationManager />, '', {
    currentUser,
  });
}
