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

import { formatMeasure } from '../../sonar-aligned/helpers/measures';

export interface DashboardMeasureValue {
  period?: { value?: string };
  periods?: ReadonlyArray<{ index: number; value?: string }>;
  value?: string;
}

export function extractDashboardMeasureValue(
  measure: DashboardMeasureValue | undefined,
  isScopeNew: boolean,
): string | undefined {
  if (!measure) {
    return undefined;
  }

  return isScopeNew
    ? (measure.period?.value ?? measure.periods?.find(({ index }) => index === 1)?.value)
    : measure.value;
}

export function formatDashboardMeasure(
  value: string | number | undefined,
  type: string,
  options?: { decimals?: number; omitExtraDecimalZeros?: boolean },
): string {
  return formatMeasure(value, type, options);
}
