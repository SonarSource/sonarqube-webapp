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

import { createElement, type ReactNode } from 'react';

/** Product name shown in Execute Analysis permission tooltips on SonarQube Server. */
export const SONARQUBE_SERVER_INSTANCE_DISPLAY_NAME = 'SonarQube Server';

/**
 * Rich-text `values` for `global_permissions.scan.desc` and `projects_role.scan.desc`
 * (intl pseudo-tags → React). Callers must pass `instance` alongside this spread.
 */
export function executeAnalysisScanTooltipRichFormatValues() {
  return {
    b: (chunks: ReactNode) => createElement('strong', null, chunks),
    br: () => createElement('br'),
    intro: (chunks: ReactNode) => createElement('p', null, chunks),
    li: (chunks: ReactNode) => createElement('li', null, chunks),
    list: (chunks: ReactNode) => createElement('ul', { className: 'sw-mb-2' }, chunks),
    note: (chunks: ReactNode) => createElement('p', null, chunks),
    notetitle: (chunks: ReactNode) => createElement('strong', null, chunks),
  };
}
