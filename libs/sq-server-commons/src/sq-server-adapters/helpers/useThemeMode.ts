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
import { THEME_MODE_LOCAL_STORAGE_KEY, ThemeMode } from '~shared/types/themes';

export function useThemeMode(): [
  ThemeMode,
  (value: ThemeMode | ((prev: ThemeMode) => ThemeMode)) => void,
] {
  /*
   * We only use local storage on SQS because there is no backend capability for user preferences.
   */
  return useLocalStorage<ThemeMode>(THEME_MODE_LOCAL_STORAGE_KEY, ThemeMode.System);
}
