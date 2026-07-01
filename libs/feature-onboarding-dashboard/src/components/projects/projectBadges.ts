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

import { BadgeVariety } from '@sonarsource/echoes-react';
import {
  OnboardingProject,
  OnboardingProjectOnboarding,
  OnboardingProjectScanHealth,
  OnboardingProjectScanMethod,
} from '~shared/types/onboarding';

export interface BadgeConfig {
  labelKey: string;
  variety: BadgeVariety;
}

export function getOnboardingBadge(project: OnboardingProject): BadgeConfig {
  if (project.onboarding === OnboardingProjectOnboarding.NotImported) {
    return {
      variety: BadgeVariety.Neutral,
      labelKey: 'onboarding_dashboard.projects.onboarding.not_onboarded',
    };
  }
  if (project.scanHealth === OnboardingProjectScanHealth.Failed) {
    return {
      variety: BadgeVariety.Danger,
      labelKey: 'onboarding_dashboard.projects.onboarding.scan_failed',
    };
  }
  if (project.onboarding === OnboardingProjectOnboarding.Analysed) {
    return {
      variety: BadgeVariety.Success,
      labelKey: 'onboarding_dashboard.projects.onboarding.scanned',
    };
  }
  return {
    variety: BadgeVariety.Warning,
    labelKey: 'onboarding_dashboard.projects.onboarding.imported_empty',
  };
}

export function getAnalysisModeBadge(project: OnboardingProject): BadgeConfig | undefined {
  if (project.onboarding === OnboardingProjectOnboarding.NotImported) {
    return undefined;
  }
  switch (project.scanMethod) {
    case OnboardingProjectScanMethod.Ci:
      return {
        variety: BadgeVariety.Info,
        labelKey: 'onboarding_dashboard.projects.analysis.full_ci',
      };
    case OnboardingProjectScanMethod.Managed:
      return {
        variety: BadgeVariety.Warning,
        labelKey: 'onboarding_dashboard.projects.analysis.autoscan',
      };
    case OnboardingProjectScanMethod.Local:
      return {
        variety: BadgeVariety.Highlight,
        labelKey: 'onboarding_dashboard.projects.analysis.local',
      };
    case null:
    default:
      return undefined;
  }
}
