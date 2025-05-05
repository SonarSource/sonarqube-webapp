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

import userEvent from '@testing-library/user-event';
import { dismissNotice } from '~sq-server-commons/api/users';
import { mockCurrentUser, mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';
import { CurrentUser, NoticeType } from '~sq-server-commons/types/users';
import PromotionNotification from '../PromotionNotification';

jest.mock('~sq-server-commons/api/users', () => ({
  dismissNotice: jest.fn().mockResolvedValue(undefined),
}));

it('should not render when anonymous', () => {
  renderPromotionNotification(mockCurrentUser({ isLoggedIn: false }));

  expect(byText('promotion.sonarlint.title').query()).not.toBeInTheDocument();
});

it('should not render if previously dismissed', () => {
  renderPromotionNotification(
    mockLoggedInUser({ dismissedNotices: { [NoticeType.SONARLINT_AD]: true } }),
  );

  expect(byText('promotion.sonarlint.title').query()).not.toBeInTheDocument();
});

it('should be dismissable', async () => {
  const user = userEvent.setup();

  renderPromotionNotification();

  expect(byText('promotion.sonarlint.title').get()).toBeInTheDocument();
  const dismissButton = byRole('button', { name: 'dismiss' }).get();

  expect(dismissButton).toBeInTheDocument();
  await user.click(dismissButton);

  expect(dismissNotice).toHaveBeenCalledWith(NoticeType.SONARLINT_AD);
});

function renderPromotionNotification(currentUser: CurrentUser = mockLoggedInUser()) {
  return renderComponent(<PromotionNotification />, '', {
    currentUser,
  });
}
