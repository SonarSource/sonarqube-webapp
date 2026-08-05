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

import { http } from 'msw';
import { AbstractServiceMock } from '~shared/api/mocks/AbstractServiceMock';
import {
  EntitlementCheck,
  EntitlementCheckFeatureKey,
  EntitlementConsumption,
  EntitlementLimit,
  EntitlementMetering,
  EntitlementPeriod,
  getEffectiveLimit,
} from '~shared/types/billing';
import { HttpStatus } from '~shared/types/request';

export interface BillingServiceData {
  entitlementChecks?: EntitlementCheck[];
}

export function mockEntitlementPeriod(
  overrides: Partial<EntitlementPeriod> = {},
): EntitlementPeriod {
  return {
    start: '2026-07-01T00:00:00.000Z',
    end: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

export function mockEntitlementMetering(
  overrides: Partial<EntitlementMetering> = {},
): EntitlementMetering {
  return {
    used: 72,
    updatedAt: '2026-07-20T12:00:00.000Z',
    period: mockEntitlementPeriod(),
    ...overrides,
  };
}

export function mockEntitlementLimit(overrides: Partial<EntitlementLimit> = {}): EntitlementLimit {
  return {
    base: 100,
    overage: 50,
    overageEnabled: false,
    ...overrides,
  };
}

export function mockEntitlementConsumption(
  overrides: Partial<EntitlementConsumption> = {},
): EntitlementConsumption {
  const limit = overrides.limit ?? mockEntitlementLimit();
  const metering = overrides.metering ?? mockEntitlementMetering();

  return {
    limit,
    metering,
    allowed: overrides.allowed ?? metering.used < getEffectiveLimit(limit),
  };
}

export function mockEntitlementCheck(overrides: Partial<EntitlementCheck> = {}): EntitlementCheck {
  return {
    featureKey: EntitlementCheckFeatureKey.RemediationAgent,
    entitled: true,
    consumption: mockEntitlementConsumption(),
    value: null,
    excludedValues: [],
    ...overrides,
  };
}

export function mockEntitlementChecks(): EntitlementCheck[] {
  return [
    mockEntitlementCheck({
      featureKey: EntitlementCheckFeatureKey.LinesOfCode,
      consumption: mockEntitlementConsumption({
        limit: mockEntitlementLimit({
          base: 1_000_000,
          overage: null,
        }),
        metering: mockEntitlementMetering({ used: 650_000 }),
      }),
    }),
    mockEntitlementCheck(),
  ];
}

export const BillingServiceDefaultDataset: BillingServiceData = {
  entitlementChecks: mockEntitlementChecks(),
};

function isEntitlementCheckFeatureKey(value: string): value is EntitlementCheckFeatureKey {
  return Object.values(EntitlementCheckFeatureKey).includes(value as EntitlementCheckFeatureKey);
}

export class BillingServiceMock extends AbstractServiceMock<BillingServiceData> {
  setEntitlementChecks = (checks: EntitlementCheck[]) => {
    this.data.entitlementChecks = checks;
  };

  entitlementCheckHandlers = [
    http.get('/api/v2/billing/entitlement-checks', ({ request }) => {
      const featureKey = new URL(request.url).searchParams.get('featureKey');

      if (!featureKey || !isEntitlementCheckFeatureKey(featureKey)) {
        return this.errorsWithStatus(HttpStatus.NotFound, 'Unknown featureKey');
      }

      this.data.entitlementChecks ??= mockEntitlementChecks();
      const check = this.data.entitlementChecks.find((item) => item.featureKey === featureKey);

      if (!check) {
        return this.errorsWithStatus(HttpStatus.NotFound, 'Entitlement check not found');
      }

      return this.ok(check);
    }),
  ];

  handlers = [...this.entitlementCheckHandlers];
}
