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

import { AlmKeys, AlmSettingsInstance } from '../types/alm-settings';
import { IMPORT_COMPATIBLE_ALMS } from './constants';

const ALM_SETTINGS_VALIDATORS: Record<AlmKeys, (settings: AlmSettingsInstance) => boolean> = {
  [AlmKeys.Azure]: (settings) => Boolean(settings.url),
  [AlmKeys.BitbucketCloud]: () => true,
  [AlmKeys.BitbucketServer]: () => true,
  [AlmKeys.GitHub]: () => true,
  [AlmKeys.GitLab]: (settings) => Boolean(settings.url),
};

export function getBoundAlmKeys(almSettings: AlmSettingsInstance[]): AlmKeys[] {
  return IMPORT_COMPATIBLE_ALMS.filter((key) => {
    const current = almSettings.filter((s) => s.alm === key);
    return current.length > 0 && ALM_SETTINGS_VALIDATORS[key](current[0]);
  });
}
