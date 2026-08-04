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

import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import {
  OnboardingDevopsPlatform,
  OnboardingProject,
  OnboardingProjectGateStatus,
  OnboardingProjectOnboarding,
  OnboardingProjectScanHealth,
  OnboardingProjectScanMethod,
} from '~shared/types/onboarding';
import { useRerunAutomaticAnalysisMutation } from '../projectRowActionMutations';
import { ProjectRowAction } from '../projectRowActions';
import { ProjectRowActionItem, useProjectRowActionItems } from '../useProjectRowActionItems';

/**
 * Automatic analysis only exists on SQ-Cloud, so its mutation is stubbed here: that is what lets
 * this file assert both what an offered entry does and that a product without one drops it, no
 * matter which product runs the test.
 */
jest.mock('../projectRowActionMutations', () => ({
  useRerunAutomaticAnalysisMutation: jest.fn(),
}));

const PROJECT_KEY = 'identity-lib';

/** Analysed by automatic analysis: the state whose menu offers the most actions. */
const AUTOSCANNED_PROJECT: OnboardingProject = {
  alm: OnboardingDevopsPlatform.Github,
  gateStatus: OnboardingProjectGateStatus.Passed,
  key: PROJECT_KEY,
  name: PROJECT_KEY,
  onboarding: OnboardingProjectOnboarding.Analysed,
  scanHealth: OnboardingProjectScanHealth.Healthy,
  scanMethod: OnboardingProjectScanMethod.Managed,
  stale: false,
};

const rerunAutomaticAnalysis = jest.fn();
const onRestoreAccess = jest.fn();

/** Offers the re-run mutation the way SQ-Cloud does, or drops it the way SQ-Server does. */
function mockAutomaticAnalysisSupport(isSupported: boolean) {
  jest
    .mocked(useRerunAutomaticAnalysisMutation)
    .mockReturnValue(
      isSupported
        ? ({ mutate: rerunAutomaticAnalysis } as unknown as ReturnType<
            typeof useRerunAutomaticAnalysisMutation
          >)
        : undefined,
    );
}

function Wrapper({ children }: Readonly<PropsWithChildren>) {
  const ContextWrapper = getContextWrapper();

  return (
    <MemoryRouter>
      <ContextWrapper>{children}</ContextWrapper>
    </MemoryRouter>
  );
}

function renderProjectRowActionItems(project = AUTOSCANNED_PROJECT): ProjectRowActionItem[] {
  const { result } = renderHook(() => useProjectRowActionItems(project, { onRestoreAccess }), {
    wrapper: Wrapper,
  });

  return result.current;
}

/**
 * Activates the entry of an action that runs something rather than navigating. Missing entries
 * throw, so a test asking for one that the menu dropped fails here instead of silently passing.
 */
function activate(items: ProjectRowActionItem[], action: ProjectRowAction) {
  const item = items.find((candidate) => candidate.action === action);

  if (item?.kind !== 'button') {
    throw new Error(`The menu offers no button entry for ${action}`);
  }

  item.onClick();
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAutomaticAnalysisSupport(true);
});

it('runs the automatic analysis of the project when its entry is activated', () => {
  const items = renderProjectRowActionItems();

  activate(items, ProjectRowAction.RerunAutomaticAnalysis);

  expect(rerunAutomaticAnalysis).toHaveBeenCalledWith(PROJECT_KEY);
});

it('drops the re-run entry on the products without automatic analysis', () => {
  mockAutomaticAnalysisSupport(false);

  const actions = renderProjectRowActionItems().map(({ action }) => action);

  // Dropped rather than shown disabled, so the menu never offers a dead end.
  expect(actions).not.toContain(ProjectRowAction.RerunAutomaticAnalysis);
  expect(actions).toContain(ProjectRowAction.ViewProject);
});

it('opens the confirmation modal instead of restoring access straight away', () => {
  const items = renderProjectRowActionItems();

  activate(items, ProjectRowAction.RestoreAccess);

  expect(onRestoreAccess).toHaveBeenCalled();
});

it('keeps only the import entry for a repository that has no project yet', () => {
  const items = renderProjectRowActionItems({
    ...AUTOSCANNED_PROJECT,
    key: null,
    onboarding: OnboardingProjectOnboarding.NotImported,
    scanMethod: null,
  });

  // Every other entry needs a project key, so the import page is all this row can lead to.
  expect(items.map(({ action }) => action)).toEqual([ProjectRowAction.ImportRepository]);
});

it('offers nothing at all when an analysed project comes back without a key', () => {
  const items = renderProjectRowActionItems({ ...AUTOSCANNED_PROJECT, key: null });

  // Not a state the backend reports, but every entry of this menu addresses a project by key, so
  // each one is dropped rather than rendered as a broken link.
  expect(items).toEqual([]);
});
