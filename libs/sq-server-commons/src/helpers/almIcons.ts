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

import { ALM_ICONS_BASE_URL } from '~adapters/helpers/urls';
import { AlmIconKey } from '~shared/types/onboarding';
import { AlmKeys } from '../types/alm-settings';
import { getBaseUrl } from './system';

export function almIconUrl(theme: string, imageKey: AlmIconKey) {
  return `${getBaseUrl()}/${ALM_ICONS_BASE_URL}/${theme}/${imageKey}.svg`;
}

export function almIconUrlUnthemed(imageKey: string) {
  return `${getBaseUrl()}/${ALM_ICONS_BASE_URL}/${imageKey}.svg`;
}

export function almKeyToIconKey(almKey: AlmKeys): AlmIconKey {
  // Both bitbuckets get the same icon. Map `bitbucketcloud` to `bitbucket`
  return almKey === AlmKeys.BitbucketCloud ? AlmKeys.BitbucketServer : almKey;
}
