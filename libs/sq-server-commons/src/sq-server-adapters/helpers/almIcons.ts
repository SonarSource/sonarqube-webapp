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

import { useCurrentTheme } from '~shared/helpers/css';
import { AlmIconKey } from '~shared/types/onboarding';
import { almIconUrl } from '../../helpers/almIcons';

/**
 * Resolves the theme-aware ALM provider icon URL. The active theme's `images` map
 * swaps to the `-white` icon variants in dark mode (SQC); on SQS, which is light
 * only, it always returns the light variant. Returns `undefined` when no icon key
 * is provided so callers can render their own placeholder.
 */
export function useAlmIconSrc(imageKey: AlmIconKey): string;
export function useAlmIconSrc(imageKey?: AlmIconKey): string | undefined;
export function useAlmIconSrc(imageKey?: AlmIconKey): string | undefined {
  const theme = useCurrentTheme();

  if (imageKey === undefined) {
    return undefined;
  }

  return almIconUrl(theme, imageKey);
}
