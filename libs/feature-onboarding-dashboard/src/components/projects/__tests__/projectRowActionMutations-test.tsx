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

import { act, renderHook } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { useCurrentUser } from '~adapters/helpers/users';
import {
  useGrantProjectPermissionMutation,
  useTriggerAutomaticAnalysisMutation,
} from '~adapters/queries/onboarding';
import { mockLoggedInUser } from '~shared/helpers/mocks/users';
import { byText } from '~shared/helpers/testSelector';
import {
  useRerunAutomaticAnalysisMutation,
  useRestoreProjectAccessMutation,
} from '../projectRowActionMutations';

/**
 * Both products are stubbed at the adapter boundary: they call different APIs, and SQ-Server has no
 * automatic analysis to re-run at all. Only a stub lets this file assert what the shared hooks
 * report back to the user — the part that is the same on both — whichever product runs it.
 */
jest.mock('~adapters/queries/onboarding', () => ({
  useGrantProjectPermissionMutation: jest.fn(),
  useTriggerAutomaticAnalysisMutation: jest.fn(),
}));

jest.mock('~adapters/helpers/users', () => ({
  useCurrentUser: jest.fn(),
}));

const CURRENT_USER_LOGIN = 'luke';
const PROJECT_KEY = 'identity-lib';

const grantProjectPermission = jest.fn();
const triggerAutomaticAnalysis = jest.fn();

const ui = {
  restoreAccessSuccess: byText('onboarding_dashboard.projects.action.restore_access.success'),
  rerunError: byText('onboarding_dashboard.projects.action.rerun_automatic_analysis.error'),
  rerunNotEligible: byText(
    'onboarding_dashboard.projects.action.rerun_automatic_analysis.not_eligible',
  ),
  rerunSuccess: byText('onboarding_dashboard.projects.action.rerun_automatic_analysis.success'),
};

/** Signs the current user in or out, the way `~adapters/helpers/users` reports it. */
function mockSignedIn(isLoggedIn: boolean) {
  jest.mocked(useCurrentUser).mockReturnValue({
    currentUser: mockLoggedInUser({ login: CURRENT_USER_LOGIN }),
    isLoggedIn,
  } as ReturnType<typeof useCurrentUser>);
}

/** Stubs the adapter mutation, or drops it the way a product without automatic analysis does. */
function mockAutomaticAnalysisSupport(isSupported: boolean) {
  jest
    .mocked(useTriggerAutomaticAnalysisMutation)
    .mockReturnValue(
      isSupported
        ? ({ mutateAsync: triggerAutomaticAnalysis } as unknown as ReturnType<
            typeof useTriggerAutomaticAnalysisMutation
          >)
        : undefined,
    );
}

beforeEach(() => {
  jest.clearAllMocks();

  grantProjectPermission.mockResolvedValue(undefined);
  triggerAutomaticAnalysis.mockResolvedValue(true);

  mockSignedIn(true);
  mockAutomaticAnalysisSupport(true);

  jest.mocked(useGrantProjectPermissionMutation).mockReturnValue({
    mutateAsync: grantProjectPermission,
  } as unknown as ReturnType<typeof useGrantProjectPermissionMutation>);
});

describe('useRestoreProjectAccessMutation', () => {
  it('grants the current user browse and administer permission, then reports it', async () => {
    const { result } = renderHook(() => useRestoreProjectAccessMutation(), {
      wrapper: getContextWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(PROJECT_KEY);
    });

    expect(grantProjectPermission).toHaveBeenCalledWith({
      login: CURRENT_USER_LOGIN,
      permission: 'user',
      projectKey: PROJECT_KEY,
    });
    expect(grantProjectPermission).toHaveBeenCalledWith({
      login: CURRENT_USER_LOGIN,
      permission: 'admin',
      projectKey: PROJECT_KEY,
    });
    expect(await ui.restoreAccessSuccess.find()).toBeInTheDocument();
  });

  it('grants nothing and reports no success when the user is signed out', async () => {
    mockSignedIn(false);

    const { result } = renderHook(() => useRestoreProjectAccessMutation(), {
      wrapper: getContextWrapper(),
    });

    await act(async () => {
      await expect(result.current.mutateAsync(PROJECT_KEY)).rejects.toThrow();
    });

    expect(grantProjectPermission).not.toHaveBeenCalled();
    expect(ui.restoreAccessSuccess.query()).not.toBeInTheDocument();
  });
});

describe('useRerunAutomaticAnalysisMutation', () => {
  it('reports the analysis it triggered', async () => {
    const { result } = renderHook(() => useRerunAutomaticAnalysisMutation(), {
      wrapper: getContextWrapper(),
    });

    await act(async () => {
      await result.current?.mutateAsync(PROJECT_KEY);
    });

    expect(triggerAutomaticAnalysis).toHaveBeenCalledWith(PROJECT_KEY);
    expect(await ui.rerunSuccess.find()).toBeInTheDocument();
  });

  it('warns instead when the project is not eligible for automatic analysis', async () => {
    triggerAutomaticAnalysis.mockResolvedValue(false);

    const { result } = renderHook(() => useRerunAutomaticAnalysisMutation(), {
      wrapper: getContextWrapper(),
    });

    await act(async () => {
      await result.current?.mutateAsync(PROJECT_KEY);
    });

    // The request succeeded, so only the eligibility answer tells the two outcomes apart.
    expect(await ui.rerunNotEligible.find()).toBeInTheDocument();
    expect(ui.rerunSuccess.query()).not.toBeInTheDocument();
  });

  it('reports a failed trigger', async () => {
    triggerAutomaticAnalysis.mockRejectedValue(new Error('autoscan is down'));

    const { result } = renderHook(() => useRerunAutomaticAnalysisMutation(), {
      wrapper: getContextWrapper(),
    });

    await act(async () => {
      await expect(result.current?.mutateAsync(PROJECT_KEY)).rejects.toThrow();
    });

    expect(await ui.rerunError.find()).toBeInTheDocument();
    expect(ui.rerunSuccess.query()).not.toBeInTheDocument();
  });

  it('offers no mutation at all on products without automatic analysis', () => {
    mockAutomaticAnalysisSupport(false);

    const { result } = renderHook(() => useRerunAutomaticAnalysisMutation(), {
      wrapper: getContextWrapper(),
    });

    // The row menu reads this to drop the action rather than offer a dead entry.
    expect(result.current).toBeUndefined();
  });
});
