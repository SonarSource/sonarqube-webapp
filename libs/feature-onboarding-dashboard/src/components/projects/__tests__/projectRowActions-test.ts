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
  OnboardingProjectGateStatus,
  OnboardingProjectOnboarding,
  OnboardingProjectScanHealth,
  OnboardingProjectScanMethod,
} from '~shared/types/onboarding';
import { getProjectRowActions, ProjectRowAction } from '../projectRowActions';

function mockProject(overrides: Partial<OnboardingProject> = {}): OnboardingProject {
  return {
    alm: OnboardingDevopsPlatform.Github,
    gateStatus: OnboardingProjectGateStatus.Passed,
    isPrivate: false,
    key: 'web-core',
    name: 'web-core',
    onboarding: OnboardingProjectOnboarding.Analysed,
    scanHealth: OnboardingProjectScanHealth.Healthy,
    scanMethod: OnboardingProjectScanMethod.Ci,
    stale: false,
    ...overrides,
  };
}

it('offers only the import action for a repository that is not imported yet', () => {
  // The scan method the backend happens to report is irrelevant: nothing exists in SonarQube to
  // configure, re-run or view yet.
  expect(
    getProjectRowActions(
      mockProject({
        onboarding: OnboardingProjectOnboarding.NotImported,
        scanMethod: OnboardingProjectScanMethod.Ci,
      }),
    ),
  ).toEqual([ProjectRowAction.ImportRepository]);
});

it('offers the first-scan actions for a project that is imported but not scanned', () => {
  expect(
    getProjectRowActions(mockProject({ onboarding: OnboardingProjectOnboarding.ImportedEmpty })),
  ).toEqual([
    ProjectRowAction.ConfigureCi,
    ProjectRowAction.RestoreAccess,
    ProjectRowAction.ViewProject,
  ]);
});

it('offers the re-run and upgrade actions for a project scanned by automatic analysis', () => {
  expect(
    getProjectRowActions(mockProject({ scanMethod: OnboardingProjectScanMethod.Managed })),
  ).toEqual([
    ProjectRowAction.ConfigureCi,
    ProjectRowAction.RerunAutomaticAnalysis,
    ProjectRowAction.RestoreAccess,
    ProjectRowAction.ViewProject,
  ]);
});

it('offers only guidance and the project link for a project scanned by CI', () => {
  expect(getProjectRowActions(mockProject({ scanMethod: OnboardingProjectScanMethod.Ci }))).toEqual(
    [ProjectRowAction.HowToRunNewScan, ProjectRowAction.ViewProject],
  );
});

it.each([
  // A failed scan takes precedence over the scan method, mirroring the scan status badge: the CI
  // guidance would be misleading while the pipeline is broken.
  ['a failed scan', { scanHealth: OnboardingProjectScanHealth.Failed }],
  ['a local scan', { scanMethod: OnboardingProjectScanMethod.Local }],
  ['no scan method at all', { scanMethod: null }],
])('falls back to the project link only for %s', (_, overrides) => {
  expect(getProjectRowActions(mockProject(overrides))).toEqual([ProjectRowAction.ViewProject]);
});
