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
  OnboardingDevopsPlatform,
  OnboardingProject,
  OnboardingProjectAnalysisMode,
  OnboardingProjectGateStatus,
  OnboardingProjectScanHealth,
  OnboardingProjectScanStatus,
} from '~shared/types/onboarding';
import { getAnalysisModeBadge } from '../projectBadges';

function mockProject(analysisMode: OnboardingProjectAnalysisMode): OnboardingProject {
  return {
    alm: OnboardingDevopsPlatform.Github,
    analysisMode,
    gateStatus: OnboardingProjectGateStatus.Passed,
    key: 'web-core',
    name: 'web-core',
    scanHealth: OnboardingProjectScanHealth.Healthy,
    scanStatus: OnboardingProjectScanStatus.Scanned,
  };
}

describe('getAnalysisModeBadge', () => {
  it.each([
    [OnboardingProjectAnalysisMode.Ci, 'onboarding_dashboard.projects.analysis.full_ci'],
    [OnboardingProjectAnalysisMode.Automatic, 'onboarding_dashboard.projects.analysis.autoscan'],
  ])('shows the %s analysis mode as a neutral badge', (analysisMode, labelKey) => {
    expect(getAnalysisModeBadge(mockProject(analysisMode))).toEqual({
      labelKey,
      variety: BadgeVariety.Neutral,
    });
  });

  it('shows no badge for a project without an analysis mode', () => {
    expect(getAnalysisModeBadge(mockProject(OnboardingProjectAnalysisMode.None))).toBeUndefined();
  });
});
