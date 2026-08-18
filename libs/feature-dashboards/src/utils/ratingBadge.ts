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

import type { QGStatusExtended } from '~shared/types/common';
import { MetricKey } from '~shared/types/metrics';

/** Rating badge metrics that must not link to the measures drilldown. */
export const NON_LINKABLE_RATING_METRICS = new Set<MetricKey>([
  MetricKey.releasability_rating,
  MetricKey.releasability_rating_with_aica,
  MetricKey.releasability_rating_without_aica,
]);

/** Type guard for measure values of {@link MetricKey.alert_status}. */
export function isQualityGateStatus(
  value: string | undefined,
): value is QGStatusExtended | undefined {
  return (
    value === 'ERROR' ||
    value === 'NONE' ||
    value === 'NOT_COMPUTED' ||
    value === 'OK' ||
    value === undefined
  );
}

/** Normalizes rating measure values to the string form expected by rating UI. */
export function normalizeRatingValue(value: unknown): string | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 1) {
    const upper = trimmed.toUpperCase();
    if (upper >= 'A' && upper <= 'E') {
      const upperCodePoint = upper.codePointAt(0);
      const baseCodePoint = 'A'.codePointAt(0);
      if (upperCodePoint !== undefined && baseCodePoint !== undefined) {
        return String(upperCodePoint - baseCodePoint + 1);
      }
    }
  }

  const numeric = Number.parseFloat(trimmed);
  return Number.isFinite(numeric) ? String(numeric) : undefined;
}
