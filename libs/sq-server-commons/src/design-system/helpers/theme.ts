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

import { CSSColor, Theme, ThemeColors, ThemedProps } from '../types/theme';
import { getRGBAString } from './colors';

export function getProp<T>(name: keyof Omit<T, keyof ThemedProps>) {
  return (props: T) => props[name];
}

/**
 * @deprecated MIUI theme is deprecated, use Echoes css variables instead, for example
 * `background-color: ${cssVar('color-surface-default')}`.
 */
export function themeColor(name: ThemeColors | CSSColor, opacity?: number) {
  return function ({ theme }: ThemedProps) {
    return getColor(theme, [], name, opacity);
  };
}

/**
 * @deprecated MIUI theme is deprecated, use Echoes css variables instead, for example
 * `box-shadow: ${cssVar('box-shadow-small')}`.
 */
export function themeShadow(
  name: keyof Theme['shadows'],
  color?: ThemeColors | CSSColor,
  opacity?: number,
) {
  return function ({ theme }: ThemedProps) {
    const shadows = theme.shadows[name];
    return shadows
      .map((item) => {
        const [x, y, blur, spread, ...rgba] = item;
        return `${x}px ${y}px ${blur}px ${spread}px ${getColor(theme, rgba, color, opacity)}`;
      })
      .join(',');
  };
}

export function themeAvatarColor(name: string, contrast = false) {
  return function ({ theme }: ThemedProps) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Reduces number length to avoid modulo's limit.
    hash = parseInt(hash.toString().slice(-5), 10);
    if (contrast) {
      return getColor(theme, theme.avatar.contrast[hash % theme.avatar.contrast.length]);
    }
    return getColor(theme, theme.avatar.color[hash % theme.avatar.color.length]);
  };
}

export function themeImage(imageKey: keyof Theme['images']) {
  return function ({ theme }: ThemedProps) {
    return theme.images[imageKey];
  };
}

function getColor(
  theme: Theme,
  [r, g, b, a]: number[],
  colorOverride?: ThemeColors | CSSColor,
  opacityOverride?: number,
) {
  // Custom CSS property or rgb(a) color, return it directly
  if (
    colorOverride?.startsWith('var(--') ||
    colorOverride?.startsWith('rgb(') ||
    colorOverride?.startsWith('rgba(')
  ) {
    return colorOverride as CSSColor;
  }
  // Is theme color overridden by a color name ?
  const color = colorOverride ? theme.colors[colorOverride as ThemeColors] : [r, g, b];

  if (typeof color === 'string') {
    return color as CSSColor;
  }

  return getRGBAString(color, opacityOverride ?? (color[3] as number | string | undefined) ?? a);
}
