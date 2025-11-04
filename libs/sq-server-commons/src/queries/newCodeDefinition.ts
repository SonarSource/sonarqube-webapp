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

// React-query component for new code definition

import { toast } from '@sonarsource/echoes-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { createQueryHook } from '~shared/queries/common';
import {
  getNewCodeDefinition,
  resetNewCodeDefinition,
  setNewCodeDefinition,
} from '../api/newCodeDefinition';
import { NewCodeDefinitionType } from '../types/new-code-definition';

function getNewCodeDefinitionQueryKey(projectKey?: string, branchName?: string) {
  return ['new-code-definition', { projectKey, branchName }];
}

export const useNewCodeDefinitionQuery = createQueryHook(
  (params?: { branchName?: string; enabled?: boolean; projectKey?: string }) => {
    return {
      queryKey: getNewCodeDefinitionQueryKey(params?.projectKey, params?.branchName),
      queryFn: () =>
        getNewCodeDefinition({
          branch: params?.branchName,
          project: params?.projectKey,
        }),
      enabled: params?.enabled ?? true,
      refetchOnWindowFocus: false,
    };
  },
);

export function useNewCodeDefinitionMutation() {
  const intl = useIntl();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newCodeDefinition: {
      branch?: string;
      project?: string;
      type?: NewCodeDefinitionType;
      value?: string;
    }) => {
      const { branch, project, type, value } = newCodeDefinition;

      if (type === undefined) {
        return resetNewCodeDefinition({
          branch,
          project,
        });
      }

      return setNewCodeDefinition({ branch, project, type, value });
    },
    onSuccess(_, { branch, project }) {
      toast.success({
        description: intl.formatMessage({ id: 'project_baseline.update_success' }),
      });
      queryClient.invalidateQueries({
        queryKey: getNewCodeDefinitionQueryKey(project, branch),
      });
    },
  });
}
