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

import { cssVar } from '@sonarsource/echoes-react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

export const sizeMap: Record<AvatarSize, number> = {
  xs: 16,
  sm: 24,
  md: 40,
  lg: 64,
};

export const iconSizeMap: Record<AvatarSize, number> = {
  xs: 12,
  sm: 18,
  md: 24,
  lg: 24,
};

export const avatarColorPalette = [
  cssVar('color-charts-categorical-4'),
  cssVar('color-charts-categorical-1'),
  cssVar('color-charts-categorical-7'),
  cssVar('color-charts-categorical-3'),
  cssVar('color-charts-categorical-8'),
  cssVar('color-charts-categorical-2'),
  cssVar('color-charts-categorical-5'),
  cssVar('color-charts-categorical-6'),
];

export const avatarContrastPalette = avatarColorPalette.map(() => cssVar('color-text-on-color'));
