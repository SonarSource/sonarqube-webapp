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
 * Server-resolved overage state for one licence feature.
 *
 * The raw LicenseSpring flags behind it are deliberately not exposed, so consumers read this
 * rather than re-deriving it: the contact-Sales versus can-enable distinction *is* `Eligible`
 * versus `NotEnabled`. `OfflineBlocked` overlays `Enabled` only, since a feature nobody enabled
 * has no overage to block.
 */
export enum OverageState {
  /** Licence never permits overage here, e.g. any consumption feature on a Developer Edition. */
  NotEligible = 'NOT_ELIGIBLE',
  /** Licensed, but LicenseSpring does not permit overage. Contact Sales, and no Enable button. */
  Eligible = 'ELIGIBLE',
  /** Permitted and priced, but no admin has turned it on yet. */
  NotEnabled = 'NOT_ENABLED',
  /** An admin has enabled overage for this feature. */
  Enabled = 'ENABLED',
  /**
   * Overage was enabled, but the instance stayed offline past `overageGraceDays`, so overage
   * is blocked until it reconnects. Analysis is unaffected.
   */
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
  /** Purchased base volume for the period. */
  maxConsumption?: number | null;
  /** What is being counted, e.g. `scans` or `suggestions`; null means render a bare number. */
  maxConsumptionUnit?: string | null;
  /** Hard ceiling on what an admin may ever set, bounding `overageLimit`. */
  maxOverage?: number | null;
  name: string;
  /** Days the instance may stay out of contact before overage blocks. Already resolved server-side. */
  overageGraceDays?: number | null;
  /**
   * The admin's chosen allowance, sitting on top of `maxConsumption` rather than being a total.
   * Null only when no record was ever written, since disabling overage keeps the stored number.
   */
  overageLimit?: number | null;
  /** The allowance must be a whole multiple of this. */
  overagesStep?: number | null;
  /**
   * Null for non-consumption features, which have no overage concept at all. That is a different
   * fact from `NotEligible`, and only one of the two can change with a licence edit.
   */
  overageState?: OverageState | null;
  /** ISO 4217 currency for `overageUnitPrice`. */
  overageUnitCurrency?: string | null;
  /** Price of one consumed unit. May be a fraction of a cent. */
  overageUnitPrice?: number | null;
  /** Key of the parent product this feature rolls up into, if any. */
  parent?: EntitlementCheckFeatureKey | null;
  /** When the feature entitlement started. */
  startDate: string | null;
}>;

/**
 * One entry of {@link LicenseV2Features}, which `POST /api/v2/billing/overage` returns for the
 * feature it changed. Aliased rather than extracted so the array type stays the single definition.
 */
export type LicenseV2Feature = LicenseV2Features[number];

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
