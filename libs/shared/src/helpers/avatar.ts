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

import { cssVar, EchoesCSSVarString } from '@sonarsource/echoes-react';

export const avatarColorPalette: EchoesCSSVarString[] = [
  cssVar('color-charts-categorical-4'),
  cssVar('color-charts-categorical-1'),
  cssVar('color-charts-categorical-7'),
  cssVar('color-charts-categorical-3'),
  cssVar('color-charts-categorical-8'),
  cssVar('color-charts-categorical-2'),
  cssVar('color-charts-categorical-5'),
  cssVar('color-charts-categorical-6'),
];

export const avatarContrastPalette: EchoesCSSVarString[] = avatarColorPalette.map(() =>
  cssVar('color-text-on-color'),
);

export function themeAvatarColor(name: string, contrast = false) {
  return function () {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Reduces number length to avoid modulo's limit.
    hash = Number.parseInt(hash.toString().slice(-5), 10);
    const palette = contrast ? avatarContrastPalette : avatarColorPalette;
    return palette[hash % palette.length];
  };
}
