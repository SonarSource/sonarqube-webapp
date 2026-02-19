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

export const SIDEBAR_NAVIGATION_SETTING = 'sidebar_navigation_setting';
export const SIDEBAR_NAVIGATION_OPT_IN_DATE = 'sidebar_navigation_opt_in_date';
export const SIDEBAR_NAVIGATION_FORCE_OPT_IN_PROMOTION_DISMISSED_KEY =
  'sidebar_navigation_force_opt_in_promotion_dismissed';

export enum FEEShowSidebarNavigationSetting {
  ForceOptIn = 'forceoptin',
  Hide = 'hide',
  OptIn = 'optin',
  OptOut = 'optout',
}

export function getDefaultValueForSidebarNavigationUserSetting(
  frontEndEngineeringShowSidebarNavigationSetting: FEEShowSidebarNavigationSetting,
) {
  switch (frontEndEngineeringShowSidebarNavigationSetting) {
    case FEEShowSidebarNavigationSetting.ForceOptIn:
      return true;
    case FEEShowSidebarNavigationSetting.Hide:
      return true;
    case FEEShowSidebarNavigationSetting.OptIn:
      return false;
    case FEEShowSidebarNavigationSetting.OptOut:
      return true;
    default:
      return true;
  }
}
