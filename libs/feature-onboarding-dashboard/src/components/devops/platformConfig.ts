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

import { AlmIconKey, OnboardingAlm, OnboardingDevopsPlatform } from '~shared/types/onboarding';

export interface PlatformConfig {
  /** Brand color applied to the platform name and its progress bar. */
  color: string;
  /** ALM image key under /images/alm(s)/{imageKey}.svg. Absent for the "not bound" row. */
  imageKey?: AlmIconKey;
  /** Localization key for the display name. */
  labelKey: string;
}

/**
 * Maps the `devopsPlatforms.shares[].platform` enum to its icon, display name and brand color.
 * The repo has no brand-color tokens, so brand hex values are defined here.
 */
export const PLATFORM_CONFIG: Record<OnboardingAlm, PlatformConfig> = {
  [OnboardingDevopsPlatform.Github]: {
    color: '#1F2328',
    imageKey: 'github',
    labelKey: 'alm.github',
  },
  [OnboardingDevopsPlatform.Bitbucket]: {
    color: '#2684FF',
    imageKey: 'bitbucket',
    labelKey: 'alm.bitbucket',
  },
  [OnboardingDevopsPlatform.BitbucketCloud]: {
    color: '#2684FF',
    imageKey: 'bitbucket',
    labelKey: 'alm.bitbucketcloud',
  },
  [OnboardingDevopsPlatform.AzureDevops]: {
    color: '#0078D4',
    imageKey: 'azure',
    labelKey: 'alm.azure',
  },
  [OnboardingDevopsPlatform.Gitlab]: {
    color: '#E24329',
    imageKey: 'gitlab',
    labelKey: 'alm.gitlab',
  },
};
