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
import { LicenseV2, PurchaseableFeature } from '../../types/editions';

const DOMAIN = '/api/v2/entitlements';

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

export const EntitlementsServiceDefaultDataset: EntitlementsServiceData = {
  license: mockLicenseV2(),
  purchasableFeatures: mockPurchaseableFeatures(),
};

export class EntitlementsServiceMock extends AbstractServiceMock<EntitlementsServiceData> {
  setLicenseSupported = (supported: boolean) => {
    this.data.license = mockLicenseV2({ ...this.data.license, supported });
  };

  setPurchasableFeatures = (features: PurchaseableFeature[]) => {
    this.data.purchasableFeatures = features;
  };

  handlers = [
    http.get(`${DOMAIN}/license`, () => {
      return this.ok(this.data.license ?? null);
    }),
    http.get(`${DOMAIN}/purchasable-features`, () => {
      this.data.purchasableFeatures ??= mockPurchaseableFeatures();

      return this.ok(this.data.purchasableFeatures);
    }),
  ];
}
