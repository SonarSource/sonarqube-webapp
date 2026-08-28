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

import { cssVar } from '@sonarsource/echoes-react';
import { AlmIconKey, OnboardingAlm, OnboardingDevopsPlatform } from '~shared/types/onboarding';
import { ANY_PROJECTS_FILTER, ProjectFilterOption } from '../../types/types';

export interface PlatformConfig {
  /** Brand color applied to the platform name and its progress bar. */
  color: string;
  /** ALM image key under /images/alm(s)/{imageKey}.svg. Absent for the "not bound" row. */
  imageKey?: AlmIconKey;
  /** Localization key for the display name. */
  labelKey: string;
  /**
   * Disambiguating label, where {@link labelKey} is not unique: `alm.bitbucket` and
   * `alm.bitbucketcloud` both translate to plain "Bitbucket". Defaults to {@link labelKey}.
   */
  qualifiedLabelKey?: string;
}

/**
 * Maps the `devopsPlatforms.shares[].platform` enum to its icon, display name and brand color.
 * The repo has no brand-color tokens, so brand hex values are defined here. GitHub uses the
 * inverse-surface token instead: its near-black brand color disappears on a dark surface.
 */
export const PLATFORM_CONFIG: Record<OnboardingAlm, PlatformConfig> = {
  [OnboardingDevopsPlatform.Github]: {
    color: cssVar('color-surface-inverse-default'),
    imageKey: 'github',
    labelKey: 'alm.github',
  },
  [OnboardingDevopsPlatform.Bitbucket]: {
    color: '#2684FF',
    imageKey: 'bitbucket',
    labelKey: 'alm.bitbucket',
    qualifiedLabelKey: 'alm.bitbucket.long',
  },
  [OnboardingDevopsPlatform.BitbucketCloud]: {
    color: '#2684FF',
    imageKey: 'bitbucket',
    labelKey: 'alm.bitbucketcloud',
    qualifiedLabelKey: 'alm.bitbucketcloud.long',
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

/** Value of the DevOps platform dropdown: one platform, or no constraint at all. */
export type DevopsPlatformFilterValue = OnboardingAlm | typeof ANY_PROJECTS_FILTER;

// Derived from PLATFORM_CONFIG so the dropdown matches the donut's order and adding a platform
// needs no second edit. Deliberately the full set, not only the configured platforms: options that
// appear as data lands are worse than one that reports no match.
export const DEVOPS_PLATFORM_FILTER_OPTIONS: ReadonlyArray<
  ProjectFilterOption<DevopsPlatformFilterValue>
> = [
  { labelKey: 'onboarding_dashboard.projects.filter.all', value: ANY_PROJECTS_FILTER },
  ...Object.entries(PLATFORM_CONFIG).map(([platform, { labelKey, qualifiedLabelKey }]) => ({
    labelKey: qualifiedLabelKey ?? labelKey,
    value: platform as OnboardingAlm,
  })),
];
