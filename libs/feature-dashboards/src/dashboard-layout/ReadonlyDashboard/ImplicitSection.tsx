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
import { cssVar } from '@sonarsource/echoes-react';
import { getSectionHeight } from '../logic/positioning';
import { ImplicitSectionInstance } from '../logic/types';
import {
  getDashboardSectionCardChromeStyle,
  ImplicitDashboardSectionShell,
} from '../shared/dashboardSectionCardChrome';
import { WidgetGrid } from './WidgetGrid';

/**
 * Implicit section shell: same card chrome as explicit sections, plus containment for
 * minimize fade / clipping during edit.
 */
export function getImplicitSectionContainerStyle(): CSSObject {
  return {
    ...getDashboardSectionCardChromeStyle(),
    overflow: 'hidden',
    position: 'relative',
  };
}

/**
 * Gradient for the implicit section height clamp during section drag. The opaque end must
 * match {@link getImplicitSectionContainerStyle} background so the fade blends into the
 * filled container instead of a mismatched page tone.
 */
export function getImplicitSectionMinimizeFadeGradient(): string {
  return `linear-gradient(to bottom, transparent 0%, ${cssVar('color-surface-default')} 100%)`;
}

interface Props<WidgetPropMap extends {}> {
  gridWidth: number;
  section: ImplicitSectionInstance<WidgetPropMap>;
}

export function ImplicitSection<WidgetPropMap extends {}>(props: Readonly<Props<WidgetPropMap>>) {
  const { gridWidth, section } = props;
  if (section.children.length === 0) {
    return null;
  }
  const maxRow = getSectionHeight(section);
  return (
    <ImplicitDashboardSectionShell data-testid="dashboard-implicit-section-shell">
      <WidgetGrid gridWidth={gridWidth} maxRows={maxRow} section={section} />
    </ImplicitDashboardSectionShell>
  );
}
