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

type TagRenderer = (chunks?: ReactNode) => React.ReactElement | null;

const TAG_RENDERERS = {
  // Keep semantic emphasis for assistive tech while preserving <b> message syntax.
  b: (chunks) => createElement('strong', null, chunks),
  br: () => createElement('br'),
  li: (chunks) => createElement('li', null, chunks),
  p: (chunks) => createElement('p', null, chunks),
  ul: (chunks) => createElement('ul', null, chunks),
} satisfies Record<string, TagRenderer>;

export type ExecuteAnalysisScanTooltipHtmlTag = keyof typeof TAG_RENDERERS;

// Rich-text formatMessage values: pass only HTML tag renderers present in the message string.
export function executeAnalysisScanTooltipRichFormatValues<
  const T extends readonly ExecuteAnalysisScanTooltipHtmlTag[],
>(...tags: T): { [K in T[number]]: TagRenderer } {
  const result = {} as { [K in T[number]]: TagRenderer };
  for (const tag of new Set(tags) as Set<T[number]>) {
    result[tag] = TAG_RENDERERS[tag];
  }
  return result;
}
