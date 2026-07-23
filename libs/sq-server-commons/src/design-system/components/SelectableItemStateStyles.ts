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

/*
 * Shared by legacy side panels, subnavigation rows, and branch-like dropdown rows.
 * Keep each visual state explicit so selected styling does not collapse back into
 * a single hover/selected background token.
 */
export const selectableItemState = {
  defaultBackground: cssVar('color-surface-default'),
  disabledBackground: cssVar('color-surface-disabled'),
  disabledText: cssVar('color-text-disabled'),
  hoverBackground: cssVar('color-background-neutral-bolder-default'),
  inactiveBorder: `${cssVar('dimension-width-50')} solid ${cssVar('color-border-none')}`,
  selectedBackground: cssVar('color-background-selected-weak-default'),
  selectedBorder: `${cssVar('dimension-width-50')} solid ${cssVar('color-border-accent-default')}`,
  selectedBorderColor: cssVar('color-border-accent-default'),
  selectedBorderWidth: cssVar('dimension-width-50'),
  selectedHoverBackground: cssVar('color-background-selected-weak-hover'),
  text: cssVar('color-text-default'),
};
