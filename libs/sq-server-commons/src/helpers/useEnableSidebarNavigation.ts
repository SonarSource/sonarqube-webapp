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

import useLocalStorage from '~shared/helpers/useLocalStorage';
import { useIsOldNavigationForced } from '../context/app-state/withAppStateContext';

export const SIDEBAR_NAVIGATION_USER_PREFERENCE = 'user.preferences.enable-sidebar-navigation';

/**
 * Returns whether the sidebar navigation should be enabled, taking into account both the user's
 * preference and whether the admin has forced the old navigation via app state settings.
 */
export function useEnableSidebarNavigation() {
  const [userPreference = true, setter] = useLocalStorage<boolean>(
    SIDEBAR_NAVIGATION_USER_PREFERENCE,
    true,
  );

  const isOldNavigationForced = useIsOldNavigationForced();

  // If admin forces old navigation, always use old navigation regardless of user preference
  const effectiveValue = isOldNavigationForced ? false : userPreference;

  return [effectiveValue, setter] as [boolean, (v: boolean) => void];
}
