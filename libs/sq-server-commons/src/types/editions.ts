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

import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { SystemUpgradeDownloadUrls } from './system';

export enum EditionKey {
  community = 'community',
  developer = 'developer',
  enterprise = 'enterprise',
  datacenter = 'datacenter',
}

export interface Edition {
  downloadProperty: keyof SystemUpgradeDownloadUrls;
  homeUrl: string;
  key: EditionKey;
  name: string;
}

export interface License {
  canActivateGracePeriod: boolean;
  contactEmail: string;
  edition: string;
  expiresAt: string;
  gracePeriodEndDate?: string;
  gracePeriodExpired?: boolean;
  isExpired: boolean;
  isOfficialDistribution: boolean;
  isSupported: boolean;
  isValidEdition: boolean;
  isValidServerId: boolean;
  loc: number;
  maxLoc: number;
  plugins: string[];
  remainingLocThreshold: number;
  serverId: string;
  type: string;
}

/**
 * Overage lifecycle for a consumable feature, resolved server-side (see BE SQRP-559).
 * `null` on activation-only features (SQAS, SQARCH) — they have no overage concept.
 *
 * - `NOT_ELIGIBLE` — the feature can never have overage.
 * - `ELIGIBLE` — could be enabled, but isn't (no price, or `allow_overages` false).
 * - `NOT_ENABLED` — commercially available; admin has not created an overage record.
 * - `ENABLED` — fully active.
 * - `OFFLINE_BLOCKED` — was enabled; offline grace exceeded; consumption beyond base cap
 *   is currently blocked.
 */
export enum OverageState {
  NotEligible = 'NOT_ELIGIBLE',
  Eligible = 'ELIGIBLE',
  NotEnabled = 'NOT_ENABLED',
  Enabled = 'ENABLED',
  OfflineBlocked = 'OFFLINE_BLOCKED',
}

export type LicenseV2Features = Array<{
  /** When the feature entitlement ends; null if open-ended. */
  endDate: string | null;
  /**
   * Stable product key (matches entitlement-check `featureKey`).
   * Null when this license row has no unified counterpart.
   */
  featureKey?: EntitlementCheckFeatureKey | null;
  /** Purchased monthly allowance for metered products. */
  maxConsumption?: number | null;
  /** Extra monthly allowance when overage is on; null if unset. */
  maxOverage?: number | null;
  name: string;
  /** Customer opted into overage for this feature. */
  overageEnabled?: boolean;
  /**
   * Overage lifecycle for this feature. Null when the concept does not apply (activation-only
   * features) or the field is not yet populated by the backend. See {@link OverageState}.
   */
  overageState?: OverageState | null;
  /** Key of the parent product this feature rolls up into, if any. */
  parent?: EntitlementCheckFeatureKey | null;
  /** When the feature entitlement started. */
  startDate: string | null;
}>;

export interface LicenseV2 {
  activatedOnline?: boolean;
  disabled: boolean;
  edition: string;
  expirationDate: string;
  expired: boolean;
  extraDays: number;
  features: LicenseV2Features;
  lastRefreshDate: string;
  legacy: boolean;
  licenseKey: string | null;
  loc: number;
  maxLoc: number;
  officialDistribution: boolean;
  remainingLocThreshold: number;
  serverId: string;
  startDate: string | null;
  supported: boolean;
  type: string;
  validEdition: boolean;
}

/**
 * Row from `GET /api/v2/entitlements/purchasable-features`.
 *
 * `isAvailable` / `isEnabled` matter for admin-toggle products (Advanced Security).
 * Metered products don't need an admin toggle — once entitled they're on; use
 * entitlement-check for that, not these flags.
 */
export interface PurchaseableFeature {
  featureKey: string;
  /** On the license — you're allowed to use it. */
  isAvailable?: boolean;
  /** Admin turned it on in settings. Always false when not available. */
  isEnabled?: boolean;
  /** Parent product when this is a sub-feature (e.g. sca → advancedSecurity). */
  parent?: string;
  /** Marketing / docs link for the feature. */
  url?: string;
}
