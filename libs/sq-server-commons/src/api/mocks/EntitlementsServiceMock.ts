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
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import {
  LicenseV2,
  LicenseV2Features,
  OverageState,
  PurchaseableFeature,
} from '../../types/editions';

/** Provisional product values shared by every consumption feature (SQRP-561). */
const PRICED_OVERAGE = {
  overageGraceDays: 3,
  overagesStep: 25,
  overageUnitCurrency: 'USD',
  overageUnitPrice: 0.75,
};

export interface EntitlementsServiceData {
  license?: LicenseV2 | null;
  purchasableFeatures?: PurchaseableFeature[];
}

export function mockLicenseV2(overrides: Partial<LicenseV2> = {}): LicenseV2 {
  return {
    disabled: false,
    edition: 'Developer Edition',
    expirationDate: new Date(Date.now() + 86400000).toISOString(),
    expired: false,
    extraDays: 0,
    features: [],
    lastRefreshDate: '2024-06-01',
    legacy: false,
    licenseKey: 'mock-license-key',
    loc: 229000,
    maxLoc: 500000,
    officialDistribution: true,
    remainingLocThreshold: 100000,
    serverId: 'mock-server-id',
    startDate: '2023-06-01',
    supported: true,
    type: 'TEST',
    validEdition: true,
    ...overrides,
  };
}

export function mockPurchaseableFeature(
  overrides: Partial<PurchaseableFeature> = {},
): PurchaseableFeature {
  return {
    featureKey: 'sca',
    isAvailable: false,
    isEnabled: false,
    ...overrides,
  };
}

export function mockPurchaseableFeatures(): PurchaseableFeature[] {
  return [mockPurchaseableFeature({ featureKey: 'fictional' }), mockPurchaseableFeature()];
}

/**
 * One licence row. Every overage key is present and null by default, matching the endpoint, which
 * always ships the full key set so consumers never have to branch on key presence.
 */
export function mockLicenseV2Feature(
  overrides: Partial<LicenseV2Features[number]> = {},
): LicenseV2Features[number] {
  return {
    endDate: null,
    maxConsumption: null,
    maxConsumptionUnit: null,
    maxOverage: null,
    name: 'SCA',
    overageGraceDays: null,
    overageLimit: null,
    overagesStep: null,
    overageState: null,
    overageUnitCurrency: null,
    overageUnitPrice: null,
    startDate: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Shaped like SQRP-481: `name` stays the LicenseSpring code, `featureKey` carries the unified key,
 * and `maxConsumption` is set only on metered products. The Active Products table intentionally
 * skips `LOC`; the existing license-usage section reads LOC from the top-level `loc` / `maxLoc`
 * fields instead.
 *
 * Overage states follow the LTA matrix in SQRP-561: activation features carry none at all, the two
 * Vortex capabilities are eligible but not permitted, and the agents are permitted but unenabled.
 */
export function mockLicenseV2Features(): LicenseV2Features {
  return [
    mockLicenseV2Feature({
      name: 'SCA',
      featureKey: EntitlementCheckFeatureKey.AdvancedSecurity,
      parent: EntitlementCheckFeatureKey.SQAS,
    }),
    mockLicenseV2Feature({
      ...PRICED_OVERAGE,
      name: 'SQRA',
      featureKey: EntitlementCheckFeatureKey.RemediationAgent,
      maxConsumption: 5_000,
      overageState: OverageState.NotEnabled,
    }),
    mockLicenseV2Feature({
      ...PRICED_OVERAGE,
      name: 'SQAA',
      featureKey: EntitlementCheckFeatureKey.AgenticAnalysis,
      maxConsumption: 10_000,
      // Vortex is sold without an overage entitlement for the LTA, so it is priced at zero.
      overageState: OverageState.Eligible,
      overageUnitPrice: 0,
      parent: EntitlementCheckFeatureKey.Vortex,
    }),
    mockLicenseV2Feature({
      ...PRICED_OVERAGE,
      name: 'CAG',
      featureKey: EntitlementCheckFeatureKey.ContextAugmentation,
      maxConsumption: 10_000,
      overageState: OverageState.Eligible,
      overageUnitPrice: 0,
      parent: EntitlementCheckFeatureKey.Vortex,
    }),
    mockLicenseV2Feature({
      ...PRICED_OVERAGE,
      name: 'SQHA',
      featureKey: EntitlementCheckFeatureKey.HunterAgent,
      maxConsumption: 1_000,
      overageState: OverageState.NotEnabled,
    }),
    mockLicenseV2Feature({
      ...PRICED_OVERAGE,
      name: 'LOC',
      featureKey: null,
      overagesStep: 100_000,
      overageState: OverageState.NotEnabled,
    }),
  ];
}

export const EntitlementsServiceDefaultDataset: EntitlementsServiceData = {
  license: mockLicenseV2({ features: mockLicenseV2Features() }),
  purchasableFeatures: mockPurchaseableFeatures(),
};

export class EntitlementsServiceMock<
  T extends EntitlementsServiceData = EntitlementsServiceData,
> extends AbstractServiceMock<T> {
  setLicenseSupported = (supported: boolean) => {
    this.data.license = mockLicenseV2({ ...this.data.license, supported });
  };

  setPurchasableFeatures = (features: PurchaseableFeature[]) => {
    this.data.purchasableFeatures = features;
  };

  /**
   * Handler groups are exposed separately so subclasses can replace `handlers`
   * and re-compose only the groups they want. SQS substitutes its own licence
   * handlers, so changes here do not reach the private license feature.
   */
  licenseHandlers = [
    http.get('/api/v2/entitlements/license', () => {
      return this.ok(this.data.license ?? null);
    }),
  ];

  purchasableFeaturesHandlers = [
    http.get('/api/v2/entitlements/purchasable-features', () => {
      this.data.purchasableFeatures ??= mockPurchaseableFeatures();

      return this.ok(this.data.purchasableFeatures);
    }),
  ];

  handlers = [...this.licenseHandlers, ...this.purchasableFeaturesHandlers];
}
