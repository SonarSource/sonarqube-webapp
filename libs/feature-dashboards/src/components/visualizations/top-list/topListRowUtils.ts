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

import type { TopListRow } from '../../../types/visualization';
import { DEFAULT_TOP_LIST_LIMIT, type TopListLimitValue } from '../../../types/widget-common';
import type { TrendData } from '../TrendIndicator';

export function buildTopListRows(
  counts: Record<string, number>,
  resolveLabel: (value: string) => string,
  resolveRowUrl?: (value: string) => string | undefined,
  resolveTrendData?: (value: string) => TrendData | null | undefined,
  limit: TopListLimitValue = DEFAULT_TOP_LIST_LIMIT,
  resolveCountUrl?: (value: string) => string | undefined,
): TopListRow[] {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, limit)
    .map(([value, count], index) => ({
      count,
      countLinkTo: resolveCountUrl?.(value),
      label: resolveLabel(value),
      linkTo: resolveRowUrl?.(value),
      rank: index + 1,
      trendData: resolveTrendData === undefined ? undefined : (resolveTrendData(value) ?? null),
      value,
    }));
}
