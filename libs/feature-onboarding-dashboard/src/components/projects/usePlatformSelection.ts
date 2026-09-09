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

export function usePlatformSelection(): PlatformSelectionResult {
  const [selectedDopSettingId, setSelectedDopSettingId] = useState<string | undefined>(undefined);

  const { data: dopSettings, isLoading } = useOnboardingDopSettingsQuery();

  const platformEntries = useMemo(
    () => (dopSettings ?? []).filter((s) => s.type !== OnboardingDevopsPlatform.Github),
    [dopSettings],
  );

  const effectiveEntry =
    platformEntries.find((e) => e.id === selectedDopSettingId) ?? platformEntries[0];

  return {
    effectiveEntry,
    isLoading,
    platformEntries,
    selectedDopSettingId,
    setSelectedDopSettingId,
    showPlatformSelect: dopSettings != null && platformEntries.length > 1,
  };
}
