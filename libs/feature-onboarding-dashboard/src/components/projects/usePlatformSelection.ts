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

import { useMemo, useState } from 'react';
import { useOnboardingDopSettingsQuery } from '~adapters/queries/onboarding';
import { OnboardingDevopsPlatform, OnboardingDopSetting } from '~shared/types/onboarding';

export interface PlatformSelectionResult {
  effectiveEntry: OnboardingDopSetting | undefined;
  isLoading: boolean;
  platformEntries: OnboardingDopSetting[];
  selectedDopSettingId: string | undefined;
  setSelectedDopSettingId: (value: string | undefined) => void;
  /** True once DOP settings have loaded and there is more than one entry to choose from. */
  showPlatformSelect: boolean;
}

/**
 * Fetches and manages the DOP setting selector state for the "Import repositories" modal.
 *
 * Returns `showPlatformSelect = false` on SQ-Cloud (where the adapter returns `null`) and whenever
 * only a single non-GitHub DOP setting is configured. GitHub DOP settings are not surfaced by this
 * selector — importing from GitHub requires per-organization discovery which is handled separately.
 */
export function usePlatformSelection(): PlatformSelectionResult {
  const [selectedDopSettingId, setSelectedDopSettingId] = useState<string | undefined>(undefined);

  const { data: dopSettings } = useOnboardingDopSettingsQuery();

  const platformEntries = useMemo(
    () => (dopSettings ?? []).filter((s) => s.type !== OnboardingDevopsPlatform.Github),
    [dopSettings],
  );

  const effectiveEntry =
    platformEntries.find((e) => e.id === selectedDopSettingId) ?? platformEntries[0];

  return {
    effectiveEntry,
    isLoading: dopSettings === undefined,
    platformEntries,
    selectedDopSettingId,
    setSelectedDopSettingId,
    showPlatformSelect: dopSettings != null && platformEntries.length > 1,
  };
}
