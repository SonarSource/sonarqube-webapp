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

import { EntitlementConsumption } from '../../types/billing';
import { getBaseUsage, getEffectiveLimit } from '../billing';

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

function mockConsumption({ base, used }: { base: number; used: number }): EntitlementConsumption {
  return {
    allowed: true,
    limit: { base, overage: null, overageEnabled: false },
    metering: {
      period: { end: '2026-08-01T00:00:00Z', start: '2026-07-01T00:00:00Z' },
      updatedAt: '2026-07-20T00:00:00Z',
      used,
    },
  };
}
