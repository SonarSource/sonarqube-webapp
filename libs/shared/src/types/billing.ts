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

// These types are not yet used and matching SQ-Cloud api endpoint but they represent the target for both SQS and SQC.

/** Scope an entitlement check applies to. Unused on SQS, kept aligned with SQC. */
export enum ResourceType {
  Organization = 'organization',
  Enterprise = 'enterprise',
}

export enum EntitlementCheckFeatureKey {
  AdvancedSecurity = 'advancedSecurity',
  RemediationAgent = 'remediationAgent',
  AgenticAnalysis = 'agenticAnalysis',
  ContextAugmentation = 'contextAugmentation',
  HunterAgent = 'hunterAgent',
  LinesOfCode = 'linesOfCode',
  Architecture = 'architecture',
  Vortex = 'vortex',
  SQAS = 'sqas', // For SQS backend compatibility, advancedSecurity features return sqas as parent key
}

/**
 * How often a metered product's consumption resets. Sent as `PeriodKey` by the SQS
 * billing endpoints; boundaries are calendar-aligned in UTC, not license anniversaries.
 */
export enum Cadence {
  Daily = 'DAILY',
  Weekly = 'WEEKLY',
  Monthly = 'MONTHLY',
  Annual = 'ANNUAL',
  /** Never resets: the allowance is one pool that runs until the license expires. */
  Perpetual = 'PERPETUAL',
}

export interface EntitlementPeriod {
  cadence: Cadence;
  /**
   * Which window the cadence refers to, e.g. `2026-07` for MONTHLY. Always null here:
   * per SQRP-509 the metering read is cadence-only, built with `PeriodKey.of(Cadence)`.
   */
  anchor: string | null;
}

export interface EntitlementMetering {
  /** How much you've used this period. */
  used: number;
  /** Reset period; null when the backend does not report one (SQC today). */
  period: EntitlementPeriod | null;
}

export interface EntitlementLimit {
  /** Monthly allowance from the license. */
  base: number;
  /** Extra allowance when overage is on; null if unset. */
  overage: number | null;
  /** Customer opted into overage. */
  overageEnabled: boolean;
}

export interface EntitlementConsumption {
  /**
   * Whether usage is still under the effective limit (quota headroom only).
   * Does not imply entitlement — "can consume" is `entitled && allowed`.
   * Only present on metered (CONSUMABLE) products.
   */
  allowed: boolean;
  limit: EntitlementLimit;
  metering: EntitlementMetering;
}

export interface EntitlementCheck {
  featureKey: EntitlementCheckFeatureKey;
  /** License includes this feature. */
  entitled: boolean;
  /** Metering block for CONSUMABLE products; null for on/off (ENABLED) ones. */
  consumption: EntitlementConsumption | null;
  /** Scalar cap for ENABLED features (e.g. max users); null otherwise. */
  value: number | null;
  /** Exclusion list for ENABLED features; empty (never null) otherwise. */
  excludedValues: string[];
}
