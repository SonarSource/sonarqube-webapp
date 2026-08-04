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

import { toast } from '@sonarsource/echoes-react';
import { useMutation } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { useCurrentUser } from '~adapters/helpers/users';
import {
  useGrantProjectPermissionMutation,
  useTriggerAutomaticAnalysisMutation,
} from '~adapters/queries/onboarding';
import { useInvalidateOnboardingQueries } from '~shared/queries/onboarding';

/** Permissions "Restore access" grants back, same pair as the project management modals. */
const RESTORED_PERMISSIONS = ['user', 'admin'];

/**
 * Grants the current user browse and administer permission on a project they lost access to.
 *
 * Failures are not reported here: the permission API surfaces them globally.
 */
export function useRestoreProjectAccessMutation() {
  const { formatMessage } = useIntl();
  const { currentUser, isLoggedIn } = useCurrentUser();
  const { mutateAsync: grantProjectPermission } = useGrantProjectPermissionMutation();
  const invalidateOnboardingQueries = useInvalidateOnboardingQueries();

  return useMutation({
    mutationFn: async (projectKey: string) => {
      if (!isLoggedIn) {
        // Unreachable — the dashboard is behind authentication. Narrows `currentUser`, and fails
        // the mutation so that no success is reported for permissions that were never granted.
        throw new Error('Cannot restore project access while logged out');
      }

      await Promise.all(
        RESTORED_PERMISSIONS.map(async (permission) =>
          grantProjectPermission({ login: currentUser.login, permission, projectKey }),
        ),
      );
    },
    onSuccess: async () => {
      toast.success({
        description: formatMessage({
          id: 'onboarding_dashboard.projects.action.restore_access.success',
        }),
        duration: 'short',
      });
      await invalidateOnboardingQueries();
    },
  });
}

/**
 * Triggers a new automatic analysis of a project, or `undefined` on products that have no automatic
 * analysis — which is how the row menu knows to drop the action.
 *
 * The underlying eligibility check is silent by design, so all three outcomes are reported here: a
 * triggered analysis, a project the product refuses to analyse, and a failed request.
 */
export function useRerunAutomaticAnalysisMutation() {
  const { formatMessage } = useIntl();
  const triggerAutomaticAnalysis = useTriggerAutomaticAnalysisMutation();
  const invalidateOnboardingQueries = useInvalidateOnboardingQueries();

  const mutation = useMutation({
    mutationFn: async (projectKey: string) =>
      (await triggerAutomaticAnalysis?.mutateAsync(projectKey)) ?? false,
    onError: () => {
      toast.error({
        description: formatMessage({
          id: 'onboarding_dashboard.projects.action.rerun_automatic_analysis.error',
        }),
        duration: 'short',
      });
    },
    onSuccess: async (isAnalysisTriggered) => {
      if (isAnalysisTriggered) {
        toast.success({
          description: formatMessage({
            id: 'onboarding_dashboard.projects.action.rerun_automatic_analysis.success',
          }),
          duration: 'short',
        });
      } else {
        // The request succeeded, but the project is not eligible: nothing is being analysed.
        toast.warning({
          description: formatMessage({
            id: 'onboarding_dashboard.projects.action.rerun_automatic_analysis.not_eligible',
          }),
          duration: 'short',
        });
      }

      await invalidateOnboardingQueries();
    },
  });

  return triggerAutomaticAnalysis === undefined ? undefined : mutation;
}
