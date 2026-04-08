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
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { isDefined } from '~shared/helpers/types';
import {
  createInfiniteQueryHook,
  createQueryHook,
  getNextPageParam,
  getNextPagingParam,
  getPreviousPageParam,
  getPreviousPagingParam,
  StaleTime,
} from '~shared/queries/common';
import {
  Actions,
  activateRule,
  ActivateRuleParameters,
  addGroup,
  AddRemoveGroupParameters,
  AddRemoveUserParameters,
  addUser,
  associateProject,
  changeProfileParent,
  compareProfiles,
  copyProfile,
  createQualityProfile,
  deactivateRule,
  DeactivateRuleParameters,
  deleteProfile,
  dissociateProject,
  getExporters,
  getImporters,
  getProfileChangelog,
  getProfileInheritance,
  getProfileProjects,
  getQualityProfile,
  removeGroup,
  removeUser,
  renameProfile,
  restoreQualityProfile,
  searchGroups,
  searchQualityProfiles,
  searchUsers,
  SearchUsersGroupsParameters,
  setDefaultProfile,
} from '../api/quality-profiles';
import { CustomEvents } from '../helpers/constants';
import { CodingRulesQuery } from '../types/coding-rules';
import { BaseProfile, Profile, QualityProfileChangelogFilterMode } from '../types/quality-profiles';
import { filterModifiedCompareResultsByMode } from '../utils/quality-profiles-utils';
import { useStandardExperienceModeQuery } from './mode';

const qualityProfileQueryKeys = {
  all: () => ['quality-profiles'],
  exporters: () => [...qualityProfileQueryKeys.all(), 'exporters'],
  importers: () => [...qualityProfileQueryKeys.all(), 'importers'],
  inheritance: (language?: string, name?: string, parentKey?: string) => [
    ...qualityProfileQueryKeys.all(),
    'inheritance',
    language,
    name,
    parentKey,
  ],
  permissions: (language: string, name: string, selected: string) => [
    ...qualityProfileQueryKeys.all(),
    'permissions',
    language,
    name,
    selected,
  ],
  profile: (profile: BaseProfile, compareToSonarWay = false) => [
    ...qualityProfileQueryKeys.all(),
    'details',
    profile,
    compareToSonarWay,
  ],
  projects: (profileKey: string) => [...qualityProfileQueryKeys.all(), 'projects', profileKey],
  changelog: (
    language: string,
    name: string,
    since: string,
    to: string,
    filterMode: QualityProfileChangelogFilterMode,
  ) => [...qualityProfileQueryKeys.all(), 'changelog', language, name, since, to, filterMode],
  compare: (leftKey: string, rightKey: string) => [
    ...qualityProfileQueryKeys.all(),
    'compare',
    leftKey,
    rightKey,
  ],
};

type FacetKey = keyof CodingRulesQuery;

const invalidateFacets = () => {
  document.dispatchEvent(
    new CustomEvent<FacetKey[]>(CustomEvents.RefetchFacet, {
      detail: ['active_impactSeverities', 'active_severities'],
    }),
  );
};

export const useQualityProfilesSearchQuery = createQueryHook(
  (data: Parameters<typeof searchQualityProfiles>[0]) => {
    return queryOptions({
      queryKey: [...qualityProfileQueryKeys.all(), 'search', data],
      queryFn: () => searchQualityProfiles(data),
      staleTime: StaleTime.LONG,
    });
  },
);

export const useExportersQuery = createQueryHook(() => {
  return queryOptions({
    queryKey: qualityProfileQueryKeys.exporters(),
    queryFn: () => getExporters(),
    staleTime: StaleTime.NEVER,
  });
});

export const useImportersQuery = createQueryHook(() => {
  return queryOptions({
    queryKey: qualityProfileQueryKeys.importers(),
    queryFn: () => getImporters(),
    staleTime: StaleTime.NEVER,
  });
});

export function useCreateProfileMutation() {
  const { invalidateSearch } = useQualityProfilesInvalidation();

  return useMutation({
    mutationFn: (data: FormData | { language?: string; name: string }) =>
      createQualityProfile(data),
    onSuccess: invalidateSearch,
  });
}

export function useCopyProfileMutation() {
  const { invalidateSearch } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: (data: { fromKey: string; toName: string }) =>
      copyProfile(data.fromKey, data.toName),
    onSuccess: invalidateSearch,
  });
}

export function useExtendProfileMutation() {
  const { invalidateSearch } = useQualityProfilesInvalidation();

  return useMutation({
    mutationFn: async (data: { language: string; name: string; parentProfile: Profile }) => {
      const { profile: newProfile } = await createQualityProfile({
        language: data.language,
        name: data.name,
      });
      await changeProfileParent(newProfile as Profile, data.parentProfile);
      return newProfile as Profile;
    },
    onSuccess: invalidateSearch,
  });
}

export function useRenameProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { key: string; name: string }) => renameProfile(data.key, data.name),
    onSuccess: (_, { key, name }) => {
      // rename in list
      queryClient.setQueriesData<{ actions: Actions; profiles: Profile[] }>(
        { queryKey: [...qualityProfileQueryKeys.all(), 'search'] },
        (old) => {
          if (!old) {
            return old;
          }
          return {
            ...old,
            profiles: old.profiles.map((p) => (p.key === key ? { ...p, name } : p)),
          };
        },
      );
      // invalidate inheritance query
      queryClient.invalidateQueries({
        queryKey: [...qualityProfileQueryKeys.all(), 'inheritance'],
        refetchType: 'none',
      });
    },
  });
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient();
  const { invalidateSearch } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: (profile: Profile) => deleteProfile(profile),
    onSuccess: (_, profile) => {
      // Optimistically remove the deleted profile from the list immediately.
      queryClient.setQueriesData<{ actions: Actions; profiles: Profile[] }>(
        { queryKey: [...qualityProfileQueryKeys.all(), 'search'] },
        (old) => {
          if (!old) {
            return old;
          }
          return { ...old, profiles: old.profiles.filter((p) => p.key !== profile.key) };
        },
      );
      invalidateSearch();

      queryClient.invalidateQueries({
        queryKey: [...qualityProfileQueryKeys.all(), 'inheritance'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: [...qualityProfileQueryKeys.all(), 'projects'],
        refetchType: 'none',
      });
    },
  });
}

export function useSetDefaultProfileMutation() {
  const { invalidateSearch } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: (profile: Profile) => setDefaultProfile(profile),
    onSuccess: invalidateSearch,
  });
}

export function useRestoreProfileMutation() {
  const { invalidateSearch } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: (data: FormData) => restoreQualityProfile(data),
    onSuccess: invalidateSearch,
  });
}

export const useProfileInheritanceQuery = createQueryHook(
  (profile?: Pick<BaseProfile, 'language' | 'name' | 'parentKey'>) => {
    const { language, name, parentKey } = profile ?? {};
    return queryOptions({
      queryKey: qualityProfileQueryKeys.inheritance(language, name, parentKey),
      staleTime: StaleTime.LONG,
      queryFn: () => {
        if (!isDefined(language) || !isDefined(name)) {
          return { ancestors: [], children: [], profile: null };
        }
        return getProfileInheritance({ language, name });
      },
    });
  },
);

export const useGetQualityProfileQuery = createQueryHook(
  (data: Parameters<typeof getQualityProfile>[0]) => {
    return queryOptions({
      queryKey: qualityProfileQueryKeys.profile(data.profile, data.compareToSonarWay),
      staleTime: StaleTime.LONG,
      queryFn: () => {
        return getQualityProfile(data);
      },
    });
  },
);

export const useGetQualityProfileChangelogQuery = createInfiniteQueryHook(
  (data: Parameters<typeof getProfileChangelog>[0]) => {
    return infiniteQueryOptions({
      queryKey: qualityProfileQueryKeys.changelog(
        data.profile.language,
        data.profile.name,
        data.since,
        data.to,
        data.filterMode,
      ),
      queryFn: ({ pageParam }) => {
        return getProfileChangelog({ ...data, page: pageParam });
      },
      staleTime: StaleTime.LONG,
      getNextPageParam: (data) => getNextPageParam({ page: data.paging }),
      getPreviousPageParam: (data) => getPreviousPageParam({ page: data.paging }),
      initialPageParam: 1,
    });
  },
);

export function useProfilesCompareQuery(leftKey: string, rightKey: string) {
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  return useQuery({
    queryKey: qualityProfileQueryKeys.compare(leftKey, rightKey),
    queryFn: ({ queryKey: [_1, _2, leftKey, rightKey] }) => {
      return compareProfiles(leftKey, rightKey);
    },
    staleTime: StaleTime.LONG,
    enabled: isDefined(leftKey) && isDefined(rightKey) && isDefined(isStandardMode),
    select: (data) => {
      return {
        ...data,
        modified: filterModifiedCompareResultsByMode(data.modified, !!isStandardMode),
      };
    },
  });
}

export const useProfilePermissionsQuery = createQueryHook(
  (params: { language: string; name: string; selected: 'deselected' | 'selected' }) => {
    const parameters: SearchUsersGroupsParameters = {
      language: params.language,
      qualityProfile: params.name,
      selected: params.selected,
    };
    return queryOptions({
      queryKey: qualityProfileQueryKeys.permissions(params.language, params.name, params.selected),
      queryFn: async () => {
        const [usersResponse, groupsResponse] = await Promise.all([
          searchUsers(parameters),
          searchGroups(parameters),
        ]);
        return {
          groups: groupsResponse.groups,
          users: usersResponse.users,
        };
      },
      staleTime: StaleTime.LONG,
    });
  },
);

export const useProfileProjectsInfiniteQuery = createInfiniteQueryHook((profileKey: string) => {
  return infiniteQueryOptions({
    queryKey: qualityProfileQueryKeys.projects(profileKey),
    queryFn: ({ pageParam }) => getProfileProjects({ key: profileKey, p: pageParam }),
    getNextPageParam: getNextPagingParam,
    getPreviousPageParam: getPreviousPagingParam,
    initialPageParam: 1,
    staleTime: StaleTime.LONG,
  });
});

export function useActivateRuleMutation(onSuccess: (data: ActivateRuleParameters) => unknown) {
  const { invalidateSearch, invalidateInheritance } = useQualityProfilesInvalidation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateRule,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ['rules', 'details', data.rule],
      });
      invalidateFacets();
      invalidateSearch();
      invalidateInheritance();
      onSuccess(data);
    },
  });
}

export function useDeactivateRuleMutation(onSuccess: (data: DeactivateRuleParameters) => unknown) {
  const { invalidateSearch, invalidateInheritance } = useQualityProfilesInvalidation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateRule,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ['rules', 'details', data.rule],
      });
      invalidateFacets();
      invalidateInheritance();
      invalidateSearch();
      onSuccess(data);
    },
  });
}

export function useAddUserMutation() {
  const { invalidatePermissions } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: (data: AddRemoveUserParameters) => addUser(data),
    onSuccess: (_, { language, qualityProfile }) => {
      invalidatePermissions(language, qualityProfile);
    },
  });
}

export function useAddGroupMutation() {
  const { invalidatePermissions } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: (data: AddRemoveGroupParameters) => addGroup(data),
    onSuccess: (_, { language, qualityProfile }) => {
      invalidatePermissions(language, qualityProfile);
    },
  });
}

export function useRemoveUserMutation() {
  const { invalidatePermissions } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: (data: AddRemoveUserParameters) => removeUser(data),
    onSuccess: (_, { language, qualityProfile }) => {
      invalidatePermissions(language, qualityProfile);
    },
  });
}

export function useRemoveGroupMutation() {
  const { invalidatePermissions } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: (data: AddRemoveGroupParameters) => removeGroup(data),
    onSuccess: (_, { language, qualityProfile }) => {
      invalidatePermissions(language, qualityProfile);
    },
  });
}

export function useChangeProfileParentMutation() {
  const { invalidateSearch, invalidateInheritance } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: ({ profile, parentProfile }: { parentProfile?: Profile; profile: Profile }) =>
      changeProfileParent(profile, parentProfile),
    onSuccess: () => {
      invalidateSearch();
      invalidateInheritance();
    },
  });
}

export function useAssociateProjectMutation() {
  const { invalidateProjects } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: ({ profile, projectKey }: { profile: Profile; projectKey: string }) =>
      associateProject(profile, projectKey),
    onSuccess: (_, { profile }) => invalidateProjects(profile.key),
  });
}

export function useDissociateProjectMutation() {
  const { invalidateProjects } = useQualityProfilesInvalidation();
  return useMutation({
    mutationFn: ({ profile, projectKey }: { profile: Profile; projectKey: string }) =>
      dissociateProject(profile, projectKey),
    onSuccess: (_, { profile }) => invalidateProjects(profile.key),
  });
}

export function useQualityProfilesInvalidation() {
  const queryClient = useQueryClient();
  return {
    invalidateSearch: () =>
      queryClient.invalidateQueries({ queryKey: [...qualityProfileQueryKeys.all(), 'search'] }),
    invalidateProjects: (profileKey?: string) =>
      queryClient.invalidateQueries({
        queryKey: profileKey
          ? qualityProfileQueryKeys.projects(profileKey)
          : [...qualityProfileQueryKeys.all(), 'projects'],
      }),
    invalidateInheritance: () =>
      queryClient.invalidateQueries({
        queryKey: [...qualityProfileQueryKeys.all(), 'inheritance'],
      }),
    invalidatePermissions: async (language: string, qualityProfile: string) => {
      await queryClient.invalidateQueries({
        queryKey: qualityProfileQueryKeys.permissions(language, qualityProfile, 'selected'),
      });
      await queryClient.invalidateQueries({
        queryKey: qualityProfileQueryKeys.permissions(language, qualityProfile, 'deselected'),
      });
    },
  };
}
