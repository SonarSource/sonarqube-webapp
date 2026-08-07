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

import { Theme } from '@sonarsource/echoes-react';
import { useState } from 'react';
import useEffectOnce from './useEffectOnce';

export function useCurrentTheme() {
  const [theme, setTheme] = useState(getCurrentRootTheme());

  useEffectOnce(() => {
    const observer = observeThemeChanges(setTheme);
    return () => {
      observer.disconnect();
    };
  });

  return theme;
}

/**
 * Watches for theme changes (via the `data-echoes-theme` attribute on `<html>`)
 * and calls the provided callback with the new theme value.
 */
export function observeThemeChanges(callback: (theme: `${Theme}`) => void) {
  const observer = new MutationObserver(() => {
    callback(getCurrentRootTheme());
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-echoes-theme'],
  });

  return observer;
}

/**
 * Gets the current theme from the root element's `data-echoes-theme` attribute.
 * This is only safe to use if you know the theme can't be overridden in a parent node and you only care about the root node theme.
 * @returns The current theme of the root node
 */
export function getCurrentRootTheme(): `${Theme}` {
  return (document.documentElement.dataset.echoesTheme as `${Theme}`) || Theme.light;
}
