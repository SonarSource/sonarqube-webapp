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
import { getEffectiveLimit } from '~shared/helpers/billing';
import {
  Cadence,
  EntitlementCheck,
  EntitlementCheckFeatureKey,
  EntitlementConsumption,
  EntitlementLimit,
  EntitlementMetering,
  EntitlementPeriod,
} from '~shared/types/billing';
import { HttpStatus } from '~shared/types/request';
import { PurchaseableFeature } from '../../types/editions';

export interface BillingServiceData {
  entitlementChecks?: EntitlementCheck[];
  purchasableFeatures?: PurchaseableFeature[];
}

export function mockEntitlementPeriod(
  cadence: Cadence = Cadence.Monthly,
  anchor: string | null = null,
): EntitlementPeriod {
  return { cadence, anchor };
}

export function mockEntitlementMetering(
  overrides: Partial<EntitlementMetering> = {},
): EntitlementMetering {
  return {
    used: 72,
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

/** Metered product, sized to its license allowance. */
function mockMeteredCheck(
  featureKey: EntitlementCheckFeatureKey,
  base: number,
  used: number,
  period: Cadence = Cadence.Monthly,
) {
  return mockEntitlementCheck({
    featureKey,
    consumption: mockEntitlementConsumption({
      limit: mockEntitlementLimit({ base, overage: null }),
      metering: mockEntitlementMetering({ used, period: mockEntitlementPeriod(period) }),
    }),
  });
}

/** Covers every feature the mock license carries, since each one gets its own check call. */
export function mockEntitlementChecks(): EntitlementCheck[] {
  return [
    mockMeteredCheck(EntitlementCheckFeatureKey.LinesOfCode, 1_000_000, 650_000),
    mockMeteredCheck(EntitlementCheckFeatureKey.RemediationAgent, 5_000, 1_240),
    // Mirrored keys for one normalized Vortex product — same consumption on both.
    mockMeteredCheck(EntitlementCheckFeatureKey.AgenticAnalysis, 10_000, 1_806),
    mockMeteredCheck(EntitlementCheckFeatureKey.ContextAugmentation, 10_000, 1_806),
    // Hunter Agent's allowance is one pool for the life of the license, so it never resets.
    mockMeteredCheck(EntitlementCheckFeatureKey.HunterAgent, 1_000, 995, Cadence.Perpetual),
    // ENABLED product: entitled, but nothing metered.
    mockEntitlementCheck({
      featureKey: EntitlementCheckFeatureKey.AdvancedSecurity,
      consumption: null,
    }),
  ];
}

/** Default purchasable-features payload matching the mock license — every feature the mock
 * license carries reports as available and enabled. Tests can override via
 * `setPurchasableFeatures`. */
export function mockBillingPurchasableFeatures(): PurchaseableFeature[] {
  return [
    { featureKey: EntitlementCheckFeatureKey.RemediationAgent, isAvailable: true, isEnabled: true },
    { featureKey: EntitlementCheckFeatureKey.AdvancedSecurity, isAvailable: true, isEnabled: true },
    { featureKey: EntitlementCheckFeatureKey.AgenticAnalysis, isAvailable: true, isEnabled: true },
    {
      featureKey: EntitlementCheckFeatureKey.ContextAugmentation,
      isAvailable: true,
      isEnabled: true,
    },
    { featureKey: EntitlementCheckFeatureKey.HunterAgent, isAvailable: true, isEnabled: true },
  ];
}

export const BillingServiceDefaultDataset: BillingServiceData = {
  entitlementChecks: mockEntitlementChecks(),
  purchasableFeatures: mockBillingPurchasableFeatures(),
};

function isEntitlementCheckFeatureKey(value: string): value is EntitlementCheckFeatureKey {
  return Object.values(EntitlementCheckFeatureKey).includes(value as EntitlementCheckFeatureKey);
}

export class BillingServiceMock extends AbstractServiceMock<BillingServiceData> {
  setEntitlementChecks = (checks: EntitlementCheck[]) => {
    this.data.entitlementChecks = checks;
  };

  setPurchasableFeatures = (features: PurchaseableFeature[]) => {
    this.data.purchasableFeatures = features;
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

  purchasableFeaturesHandlers = [
    http.get('/api/v2/entitlements/purchasable-features', () => {
      this.data.purchasableFeatures ??= mockBillingPurchasableFeatures();
      return this.ok(this.data.purchasableFeatures);
    }),
  ];

  handlers = [...this.entitlementCheckHandlers, ...this.purchasableFeaturesHandlers];
}
