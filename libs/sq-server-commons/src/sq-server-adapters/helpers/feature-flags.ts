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

import { sharedFeatureFlagDefaults, SharedFlagSet } from '~shared/helpers/feature-flags';
import { FlagSet } from '~shared/types/feature-flags';

// SQS doesn't use LaunchDarkly for feature flags, so we just pass a default hardcoded flag set for
// compatibility with SQC in shared code.
// Add feature flags here as needed in shared code, especially when SQS needs a truthy default.
const sharedFlags: SharedFlagSet = {
  ...sharedFeatureFlagDefaults,
  designArchitectureSquadExtensionPack: true,
};

/**
 * @deprecated Preserve these defaults for existing `useFlags()` callers. Do not add new flags here
 *   or automatically include all shared flags. Register new shared flags in
 *   `sharedFeatureFlagDefaults` and access them through `useFlag()`.
 */
const defaultFlags = {
  designArchitectureSquadExtensionPack: sharedFlags.designArchitectureSquadExtensionPack,
  designArchitectureSquadPerformanceLimits: sharedFlags.designArchitectureSquadPerformanceLimits,
  scaKeyChangesPrView: false,
  scaEnableFixLevelsFilter: false,
  scaEnableProhibitedLicenseExistingApprovalFixGuidance: true,
  scaShowRiskCopyAiPromptButton: false,
};

type LegacyFlagSet = typeof defaultFlags & FlagSet; // NOSONAR - Frozen legacy defaults

export function useFlag<Name extends keyof SharedFlagSet>(name: Name): SharedFlagSet[Name] {
  return sharedFlags[name];
}

/**
 * @deprecated Prefer `useFlag('someFlag')` for new code so components subscribe only
 *   to the flag they read.
 */
export function useFlags(): LegacyFlagSet {
  return defaultFlags;
}
