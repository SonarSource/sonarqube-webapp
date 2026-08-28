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

import { OnboardingAlm, OnboardingDevopsConfigurations } from '~shared/types/onboarding';
import { useOnboardingDopSettingsQuery } from '../queries/onboarding';

/**
 * DevOps platform configurations per platform, derived from the DOP settings the "Import
 * repositories" modal already fetches, so this costs no extra request.
 *
 * Never answers `undefined`, not even while loading or on failure: that value means "binds to a
 * single platform", which SQ-Server never does. An unresolved lookup is an empty split.
 */
export function useOnboardingDevopsConfigurations(): OnboardingDevopsConfigurations {
  const { data } = useOnboardingDopSettingsQuery();

  const counts = new Map<OnboardingAlm, number>();
  for (const setting of data ?? []) {
    counts.set(setting.type, (counts.get(setting.type) ?? 0) + 1);
  }

  return { byPlatform: [...counts].map(([platform, count]) => ({ count, platform })) };
}
