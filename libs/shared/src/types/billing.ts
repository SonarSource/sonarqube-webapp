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
}

/** Current billing window for a metered product. */
export interface EntitlementPeriod {
  /** Window start (ISO). */
  start: string;
  /** Window end (ISO). */
  end: string;
}

export interface EntitlementMetering {
  /** How much you've used this period. */
  used: number;
  /** Last time usage was updated (ISO). */
  updatedAt: string;
  period: EntitlementPeriod;
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

export function getEffectiveLimit(limit: EntitlementLimit): number {
  return limit.base + (limit.overageEnabled ? (limit.overage ?? 0) : 0);
}
