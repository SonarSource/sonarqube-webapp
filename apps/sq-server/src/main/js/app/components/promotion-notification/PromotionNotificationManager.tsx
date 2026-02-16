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

import { useContext, useMemo } from 'react';
import { useFlags } from '~adapters/helpers/feature-flags';
import { get } from '~shared/helpers/storage';
import { CurrentUserContext } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { isLoggedIn, NoticeType } from '~sq-server-commons/types/users';
import {
  NEW_NAVIGATION_PROMOTION_DISMISSED_KEY,
  NewNavigationPromotionNotification,
} from './NewNavigationPromotionNotification';
import { SQIDEPromotionNotification } from './SQIDEPromotionNotification';

export function PromotionNotificationManager() {
  const { currentUser } = useContext(CurrentUserContext);
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();

  /**
   * We intentionally use useMemo with an empty dependency array instead of useLocalStorage
   * here. This prevents the SQIDE promotion from appearing immediately after the user
   * dismisses the New Navigation promotion within the same browser session.
   */
  const isNewUIPromotionDismissed = useMemo(() => {
    const stored = get(NEW_NAVIGATION_PROMOTION_DISMISSED_KEY);

    return stored ? (JSON.parse(stored) as boolean) : false;
  }, []);

  if (!isLoggedIn(currentUser)) {
    return undefined;
  }

  const hasNewUIPromotion =
    frontEndEngineeringEnableSidebarNavigation && !isNewUIPromotionDismissed;

  const hasSQIDEPromotion = !currentUser.dismissedNotices?.[NoticeType.SONARLINT_AD];

  if (hasNewUIPromotion) {
    return <NewNavigationPromotionNotification />;
  }

  if (hasSQIDEPromotion) {
    return <SQIDEPromotionNotification />;
  }

  return undefined;
}
