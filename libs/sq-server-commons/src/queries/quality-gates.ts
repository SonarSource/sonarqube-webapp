/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import { BranchParameters } from '~shared/types/branch-like';
import {
  associateGateWithProject,
  copyQualityGate,
  createCondition,
  createQualityGate,
  deleteCondition,
  deleteQualityGate,
  dissociateGateWithProject,
  fetchQualityGate,
  fetchQualityGates,
  getAllQualityGateProjects,
  getApplicationQualityGate,
  getGateForProject,
  getQualityGateProjectStatus,
  renameQualityGate,
  setQualityGateAiQualified,
  setQualityGateAsDefault,
  updateCondition,
} from '../api/quality-gates';
import { addGlobalSuccessMessage } from '../design-system';
import { translate } from '../helpers/l10n';
import { getCorrectCaycCondition } from '../helpers/quality-gates';
import { Condition, QualityGate } from '../types/types';
import { invalidateProjectsListQuery } from './projects';

const QUERY_STALE_TIME = 5 * 60 * 1000;

const qualityQuery = {
  all: () => ['quality-gate'] as const,
  list: () => [...qualityQuery.all(), 'list'] as const,
  details: () => [...qualityQuery.all(), 'details'] as const,
  detail: (name?: string) => [...qualityQuery.details(), name ?? ''] as const,
  projectsAssoc: () => [...qualityQuery.all(), 'project-assoc'] as const,
  projectAssoc: (project: string) => [...qualityQuery.projectsAssoc(), project] as const,
  allProjectsSearch: (qualityGate: string) =>
    [...qualityQuery.all(), 'all-project-search', qualityGate] as const,
};

// This is internal to "enable" query when searching from the project page
function useQualityGateQueryInner(name?: string) {
  return useQuery({
    queryKey: qualityQuery.detail(name),
    queryFn: ({ queryKey: [, , name] }) => {
      return fetchQualityGate({ name });
    },
    enabled: name !== undefined,
    staleTime: QUERY_STALE_TIME,
  });
}

export function useQualityGateQuery(name: string) {
  return useQualityGateQueryInner(name);
}

export function useQualityGateForProjectQuery(project: string) {
  return useQuery({
    queryKey: qualityQuery.projectAssoc(project),
    queryFn: async ({ queryKey: [, , project] }) => {
      const qualityGatePreview = await getGateForProject({ project });
      return qualityGatePreview.name;
    },
  });
}

export function useComponentQualityGateQuery(project: string) {
  const { data: name } = useQualityGateForProjectQuery(project);
  return useQualityGateQueryInner(name);
}

export const useQualityGatesQuery = createQueryHook(() => {
  return queryOptions({
    queryKey: qualityQuery.list(),
    queryFn: () => {
      return fetchQualityGates();
    },
    staleTime: StaleTime.LONG,
  });
});

export const useGetAllQualityGateProjectsQuery = createQueryHook(
  (data: Parameters<typeof getAllQualityGateProjects>[0]) => {
    return queryOptions({
      queryKey: qualityQuery.allProjectsSearch(data?.gateName ?? ''),
      queryFn: () => {
        return getAllQualityGateProjects(data);
      },
    });
  },
);

export function useCreateQualityGateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => {
      return createQualityGate({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.list() });
    },
  });
}

export function useSetQualityGateAsDefaultMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qualityGate: QualityGate) => {
      return setQualityGateAsDefault({ name: qualityGate.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.list() });
      queryClient.invalidateQueries({ queryKey: qualityQuery.details() });
    },
  });
}

export function useRenameQualityGateMutation(currentName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newName: string) => {
      return renameQualityGate({ currentName, name: newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.list() });
      queryClient.invalidateQueries({ queryKey: qualityQuery.projectsAssoc() });
      queryClient.removeQueries({ queryKey: qualityQuery.detail(currentName) });
    },
  });
}

export function useCopyQualityGateMutation(sourceName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newName: string) => {
      return copyQualityGate({ sourceName, name: newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.list() });
    },
  });
}

export function useDeleteQualityGateMutation(name: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return deleteQualityGate({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.list() });
      queryClient.invalidateQueries({ queryKey: qualityQuery.projectsAssoc() });
      queryClient.removeQueries({ queryKey: qualityQuery.detail(name) });
    },
  });
}

export function useSetAiSupportedQualityGateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      isQualityGateAiSupported,
    }: {
      isQualityGateAiSupported: boolean;
      name: string;
    }) => {
      return setQualityGateAiQualified(name, isQualityGateAiSupported);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.all() });
    },
  });
}

export function useAssociateGateWithProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { gateName: string; projectKey: string }) => {
      return associateGateWithProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.projectsAssoc() });
      invalidateProjectsListQuery(queryClient);
    },
  });
}

export function useDissociateGateWithProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectKey: string }) => {
      return dissociateGateWithProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.projectsAssoc() });
      invalidateProjectsListQuery(queryClient);
    },
  });
}

export function useFixQualityGateMutation(gateName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      weakConditions,
      missingConditions,
    }: {
      missingConditions: Condition[];
      weakConditions: Condition[];
    }) => {
      const promiseArr = weakConditions
        .map((condition) => {
          return updateCondition({
            ...getCorrectCaycCondition(condition),
            id: condition.id,
          });
        })
        .concat(
          missingConditions.map((condition) => {
            return createCondition({
              ...getCorrectCaycCondition(condition),
              gateName,
            });
          }),
        );

      return Promise.all(promiseArr);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: qualityQuery.detail(gateName),
      });
      queryClient.invalidateQueries({ queryKey: qualityQuery.list() });
      addGlobalSuccessMessage(translate('quality_gates.conditions_updated'));
    },
  });
}

export function useCreateConditionMutation(gateName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (condition: Omit<Condition, 'id'>) => {
      return createCondition({ ...condition, gateName });
    },
    onSuccess: (_, condition) => {
      queryClient.setQueryData(qualityQuery.detail(gateName), (oldData?: QualityGate) => {
        return oldData?.conditions
          ? {
              ...oldData,
              conditions: [...oldData.conditions, condition],
            }
          : undefined;
      });
      queryClient.invalidateQueries({
        queryKey: qualityQuery.detail(gateName),
      });
      queryClient.invalidateQueries({ queryKey: qualityQuery.list() });
      addGlobalSuccessMessage(translate('quality_gates.condition_added'));
    },
  });
}

export function useUpdateConditionMutation(gateName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (condition: Condition) => {
      return updateCondition(condition);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.list() });
      queryClient.invalidateQueries({
        queryKey: qualityQuery.detail(gateName),
      });
      addGlobalSuccessMessage(translate('quality_gates.condition_updated'));
    },
  });
}

export function useUpdateOrDeleteConditionsMutation(gateName: string, isSingleMetric = false) {
  const queryClient = useQueryClient();
  const intl = useIntl();

  return useMutation({
    mutationFn: (
      conditions: (Omit<Condition, 'metric'> & {
        metric: string | null | undefined;
      })[],
    ) => {
      const promiseArr = conditions.map((condition) =>
        condition.metric
          ? updateCondition(condition as Condition)
          : deleteCondition({ id: condition.id }),
      );

      return Promise.all(promiseArr);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.list() });
      queryClient.invalidateQueries({
        queryKey: qualityQuery.detail(gateName),
      });
      addGlobalSuccessMessage(
        intl.formatMessage(
          {
            id: isSingleMetric
              ? 'quality_gates.condition_updated'
              : 'quality_gates.conditions_updated_to_the_mode',
          },
          { qualityGateName: gateName },
        ),
      );
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: qualityQuery.detail(gateName),
      });
    },
  });
}

export function useDeleteConditionMutation(gateName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (condition: Condition) => {
      return deleteCondition({
        id: condition.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQuery.list() });
      queryClient.invalidateQueries({
        queryKey: qualityQuery.detail(gateName),
      });
      addGlobalSuccessMessage(translate('quality_gates.condition_deleted'));
    },
  });
}

export const useProjectQualityGateStatus = createQueryHook(
  ({
    projectId,
    projectKey,
    branchParameters,
  }: {
    branchParameters?: BranchParameters;
    projectId?: string;
    projectKey?: string;
  }) => {
    return queryOptions({
      queryKey: ['quality-gate', 'status', 'project', projectId, projectKey, branchParameters],
      queryFn: () =>
        getQualityGateProjectStatus({
          projectId,
          projectKey,
          ...branchParameters,
        }),
    });
  },
);

export const useApplicationQualityGateStatus = createQueryHook(
  ({ application, branch }: { application: string; branch?: string }) => {
    return queryOptions({
      queryKey: ['quality-gate', 'status', 'application', application, branch],
      queryFn: () => getApplicationQualityGate({ application, branch }),
    });
  },
);

/**
 * @deprecated This is only for component that has not been migrated to react-query
 */
export function useInvalidateQualityGateQuery() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: qualityQuery.all() });
  };
}
