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

import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { grantPermissionToUser } from '../../api/permissions';

/**
 * The onboarding dashboard is not organization-scoped on SQ-Server, so no
 * `organizationKey` is sent. The SQ-Cloud adapter returns the current
 * organization key instead. Feature code passes the result into the shared
 * `~shared/queries/onboarding` hooks.
 */
export function useOnboardingOrganizationKey(): string | undefined {
  return undefined;
}

/**
 * Grants a project permission to a user. SQ-Cloud additionally scopes the call to the current
 * organization, which is the only reason this goes through the adapter.
 */
export function useGrantProjectPermissionMutation() {
  return useMutation({
    mutationFn: async (data: { login: string; permission: string; projectKey: string }) => {
      await grantPermissionToUser(data);
    },
  });
}

/**
 * Triggers a new automatic analysis of a project, or `undefined` on products without automatic
 * analysis — which makes the row menu drop the action instead of offering a dead entry. Automatic
 * analysis is a SQ-Cloud feature, so SQ-Server has nothing to re-run.
 */
export function useTriggerAutomaticAnalysisMutation():
  UseMutationResult<boolean, Error, string> | undefined {
  return undefined;
}
