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

import { Cadence, EntitlementConsumption } from '../../types/billing';
import { getBaseUsage, getEffectiveLimit, getNextResetDate, getOverageUsage } from '../billing';

describe('getEffectiveLimit', () => {
  it('returns the base limit when overage is disabled', () => {
    expect(
      getEffectiveLimit({
        base: 100,
        overage: 50,
        overageEnabled: false,
      }),
    ).toBe(100);
  });

  it('adds overage when enabled', () => {
    expect(
      getEffectiveLimit({
        base: 100,
        overage: 50,
        overageEnabled: true,
      }),
    ).toBe(150);
  });

  it('treats a null overage as zero when enabled', () => {
    expect(
      getEffectiveLimit({
        base: 100,
        overage: null,
        overageEnabled: true,
      }),
    ).toBe(100);
  });
});

describe('getBaseUsage', () => {
  it('returns usage that is within the base limit', () => {
    expect(getBaseUsage(mockConsumption({ base: 100, used: 40 }))).toBe(40);
  });

  it('clamps usage beyond the base limit down to the base', () => {
    expect(getBaseUsage(mockConsumption({ base: 100, used: 140 }))).toBe(100);
  });

  it('clamps negative usage up to zero', () => {
    expect(getBaseUsage(mockConsumption({ base: 100, used: -10 }))).toBe(0);
  });
});

describe('getOverageUsage', () => {
  it('is zero while consumption is still inside the base limit', () => {
    expect(getOverageUsage(mockConsumption({ base: 100, used: 40 }))).toBe(0);
  });

  it('counts only what sits above the base limit', () => {
    expect(getOverageUsage(mockConsumption({ base: 100, used: 161 }))).toBe(61);
  });

  it('still reports accrued units once overage has been switched back off', () => {
    const consumption = mockConsumption({ base: 100, used: 161 });
    consumption.limit.overageEnabled = false;

    expect(getOverageUsage(consumption)).toBe(61);
  });
});

describe('getNextResetDate', () => {
  // A Wednesday, so the weekly boundary is five days out.
  const NOW = Date.parse('2026-08-19T10:30:00Z');

  it.each([
    [Cadence.Daily, '2026-08-20T00:00:00.000Z'],
    [Cadence.Weekly, '2026-08-24T00:00:00.000Z'],
    [Cadence.Monthly, '2026-09-01T00:00:00.000Z'],
    [Cadence.Annual, '2027-01-01T00:00:00.000Z'],
  ])('returns the next calendar boundary in UTC for %s', (cadence, expected) => {
    expect(getNextResetDate(cadence, NOW)).toBe(expected);
  });

  it('rolls a December monthly reset into the next year', () => {
    expect(getNextResetDate(Cadence.Monthly, Date.parse('2026-12-31T23:59:00Z'))).toBe(
      '2027-01-01T00:00:00.000Z',
    );
  });

  it('returns null when the allowance never resets', () => {
    expect(getNextResetDate(Cadence.Perpetual, NOW)).toBeNull();
  });

  it('returns null when no cadence is reported', () => {
    expect(getNextResetDate(null, NOW)).toBeNull();
  });
});

function mockConsumption({ base, used }: { base: number; used: number }): EntitlementConsumption {
  return {
    allowed: true,
    limit: { base, overage: null, overageEnabled: false },
    metering: {
      period: { cadence: Cadence.Monthly, anchor: null },
      used,
    },
  };
}
