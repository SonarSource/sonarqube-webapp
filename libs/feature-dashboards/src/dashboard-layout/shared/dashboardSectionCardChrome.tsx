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

import type { CSSObject } from '@emotion/react';
import styled from '@emotion/styled';
import { cssVar } from '@sonarsource/echoes-react';
import { GRID_CONSTANTS } from '../ReadonlyDashboard/constants';

const dashboardSectionCardChromeStyles: CSSObject = {
  backgroundColor: cssVar('color-surface-default'),
  border: `1px solid ${cssVar('color-border-weak')}`,
  borderRadius: GRID_CONSTANTS.BORDER_RADIUS,
  boxShadow: cssVar('box-shadow-xsmall'),
  marginBottom: GRID_CONSTANTS.SECTION_MARGIN_BOTTOM,
};

/** Same values as {@link DashboardSectionCardChrome} — for tests and ad-hoc `style` merges. */
export function getDashboardSectionCardChromeStyle(): CSSObject {
  return { ...dashboardSectionCardChromeStyles };
}

/** Outer box shared by explicit dashboard sections (view + edit). */
export const DashboardSectionCardChrome = styled.div(dashboardSectionCardChromeStyles);

/** Implicit section shell: same card chrome plus containment for minimize fade / clipping. */
export const ImplicitDashboardSectionShell = styled.div({
  ...dashboardSectionCardChromeStyles,
  overflow: 'hidden',
  position: 'relative',
});
