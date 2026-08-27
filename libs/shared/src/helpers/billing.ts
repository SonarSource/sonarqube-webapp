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

import { Cadence, EntitlementConsumption, EntitlementLimit } from '../types/billing';

/** Value the reset-date ICU messages branch on when there is no upcoming reset. */
export const NO_RESET_DATE = 'none';

export function getEffectiveLimit(limit: EntitlementLimit): number {
  return limit.base + (limit.overageEnabled ? (limit.overage ?? 0) : 0);
}

export function getBaseUsage(consumption: EntitlementConsumption): number {
  return Math.max(0, Math.min(consumption.metering.used, consumption.limit.base));
}

/**
 * When consumption next resets, as an ISO instant, or null when it never does.
 *
 * The payload carries no dates, only a cadence, so every consumer must derive the
 * boundary here rather than rolling its own. Boundaries are calendar-aligned in UTC:
 * MMF-5716 puts every customer's monthly reset at 00:00 UTC on the 1st, regardless of
 * when their license started. Only MONTHLY and PERPETUAL are in use today.
 */
export function getNextResetDate(cadence: Cadence | null, now = Date.now()): string | null {
  const date = new Date(now);
  const [year, month, day] = [date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()];

  switch (cadence) {
    case Cadence.Daily:
      return new Date(Date.UTC(year, month, day + 1)).toISOString();
    case Cadence.Weekly:
      // ISO weeks start on Monday, so 1..7 days ahead depending on today.
      return new Date(
        Date.UTC(year, month, day + ((8 - (date.getUTCDay() || 7)) % 7 || 7)),
      ).toISOString();
    case Cadence.Monthly:
      return new Date(Date.UTC(year, month + 1, 1)).toISOString();
    case Cadence.Annual:
      return new Date(Date.UTC(year + 1, 0, 1)).toISOString();
    case null:
    case Cadence.Perpetual:
    default:
      // Perpetual never resets. Kept as `default` so an unrecognised value still yields a
      // usable null rather than an undefined that would later format as an invalid date.
      return null;
  }
}
