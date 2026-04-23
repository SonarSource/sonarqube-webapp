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

import { byText } from '~shared/helpers/testSelector';
import { mockCurrentUser, mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { CurrentUser, NoticeType } from '~sq-server-commons/types/users';
import { PromotionNotificationManager } from '../PromotionNotificationManager';

beforeEach(() => {
  jest.clearAllMocks();
});

it('should not render anything when user is anonymous', () => {
  renderPromotionNotificationManager(mockCurrentUser({ isLoggedIn: false }));

  expect(byText('promotion.sqide.title').query()).not.toBeInTheDocument();
});

it('should render SQIDE promotion for a logged in user', () => {
  renderPromotionNotificationManager();

  expect(byText('promotion.sqide.title').get()).toBeInTheDocument();
});

it('should not render SQIDE promotion if it was previously dismissed', () => {
  renderPromotionNotificationManager(
    mockLoggedInUser({ dismissedNotices: { [NoticeType.SONARLINT_AD]: true } }),
  );

  expect(byText('promotion.sqide.title').query()).not.toBeInTheDocument();
});

function renderPromotionNotificationManager(currentUser: CurrentUser = mockLoggedInUser()) {
  return renderComponent(<PromotionNotificationManager />, '', {
    currentUser,
  });
}
