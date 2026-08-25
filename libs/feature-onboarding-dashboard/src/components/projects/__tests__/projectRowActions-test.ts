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

import {
  OnboardingDevopsPlatform,
  OnboardingProject,
  OnboardingProjectAnalysisMode,
  OnboardingProjectGateStatus,
  OnboardingProjectScanHealth,
  OnboardingProjectScanStatus,
} from '~shared/types/onboarding';
import { getProjectRowActions, ProjectRowAction } from '../projectRowActions';

function mockProject(overrides: Partial<OnboardingProject> = {}): OnboardingProject {
  return {
    alm: OnboardingDevopsPlatform.Github,
    analysisMode: OnboardingProjectAnalysisMode.Ci,
    gateStatus: OnboardingProjectGateStatus.Passed,
    key: 'web-core',
    name: 'web-core',
    scanHealth: OnboardingProjectScanHealth.Healthy,
    scanStatus: OnboardingProjectScanStatus.Scanned,
    ...overrides,
  };
}

it('offers the first-scan actions for a project that has not been scanned yet', () => {
  expect(
    getProjectRowActions(mockProject({ scanStatus: OnboardingProjectScanStatus.NotScanned })),
  ).toEqual([
    ProjectRowAction.ConfigureCi,
    ProjectRowAction.RestoreAccess,
    ProjectRowAction.ViewProject,
  ]);
});

it('offers the re-run and upgrade actions for a project scanned by automatic analysis', () => {
  expect(
    getProjectRowActions(mockProject({ analysisMode: OnboardingProjectAnalysisMode.Automatic })),
  ).toEqual([
    ProjectRowAction.ConfigureCi,
    ProjectRowAction.RerunAutomaticAnalysis,
    ProjectRowAction.RestoreAccess,
    ProjectRowAction.ViewProject,
  ]);
});

it('offers only guidance and the project link for a project scanned by CI', () => {
  expect(
    getProjectRowActions(mockProject({ analysisMode: OnboardingProjectAnalysisMode.Ci })),
  ).toEqual([ProjectRowAction.HowToRunNewScan, ProjectRowAction.ViewProject]);
});

it('falls back to the project link only for a scanned project with no CI/automatic analysis mode', () => {
  expect(
    getProjectRowActions(mockProject({ analysisMode: OnboardingProjectAnalysisMode.None })),
  ).toEqual([ProjectRowAction.ViewProject]);
});

it('ignores scan health while PROJECT_HEALTH_FEATURE_ENABLED is off — the backend does not send it yet', () => {
  // Once the flag flips on, a failed scan is meant to override with the view-only fallback; today
  // it must not change the outcome at all.
  expect(
    getProjectRowActions(mockProject({ scanHealth: OnboardingProjectScanHealth.Failed })),
  ).toEqual([ProjectRowAction.HowToRunNewScan, ProjectRowAction.ViewProject]);
});
