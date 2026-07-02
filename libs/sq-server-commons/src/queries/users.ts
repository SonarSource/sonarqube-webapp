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
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Semaphore } from '~shared/helpers/Semaphore';
import { isStringDefined } from '~shared/helpers/types';
import { isLoggedIn } from '~shared/helpers/users';
import {
  StaleTime,
  createQueryHook,
  getNextPageParam,
  getPreviousPageParam,
} from '~shared/queries/common';
import { generateToken, getTokens, revokeToken } from '../api/user-tokens';
import {
  deleteUser,
  dismissNotice,
  getIdentityProviders,
  getUserById,
  getUsers,
  postUser,
  updateUser,
} from '../api/users';
import { useCurrentUser } from '../context/current-user/CurrentUserContext';
import { UserToken } from '../types/token';
import { IdentityProvider } from '../types/types';
import { NoticeType, RestUserDetailed } from '../types/users';

export const userTokensQueryKey = (login: string) => ['user', login, 'tokens'] as const;

export const USERS_PAGE_SIZE = 25;

export function useUsersQueries(
  getParams: Omit<Parameters<typeof getUsers>[0], 'pageSize' | 'pageIndex'>,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ['user', 'list', getParams],
    queryFn: ({ pageParam }) =>
      getUsers({ ...getParams, pageIndex: pageParam, pageSize: USERS_PAGE_SIZE }),
    getNextPageParam,
    getPreviousPageParam,
    enabled,
    initialPageParam: 1,
  });
}

export const useCurrentUserDetailsQuery = createQueryHook(() => {
  const { currentUser } = useCurrentUser();
  const userLogin = isLoggedIn(currentUser) ? currentUser.login : '';

  return {
    queryKey: ['user', 'current', 'id'],
    queryFn: () => getUsers({ q: userLogin }),
    select: ({ users }: { users: RestUserDetailed[] }) => users.find((u) => u.login === userLogin),
    enabled: isStringDefined(userLogin),
  };
});

export function useUsersByIdsQuery(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['user', 'by-id', id] as const,
      queryFn: () => getUserById(id),
      staleTime: StaleTime.LONG,
    })),
    combine: (results) => {
      const data: Record<string, { avatar: string; name: string }> = {};
      results.forEach((result, index) => {
        if (result.data) {
          // Non-admin responses omit `id`, so key by the input UUID instead.
          data[ids[index]] = { avatar: result.data.avatar, name: result.data.name };
        }
      });
      return { data, isPending: results.some((r) => r.isPending) };
    },
  });
}

export function useUserTokensQuery(login: string, semaphore?: Semaphore) {
  return useQuery({
    queryKey: userTokensQueryKey(login),
    queryFn: semaphore ? () => semaphore.run(() => getTokens(login)) : () => getTokens(login),
    staleTime: StaleTime.LONG,
  });
}

export const useIdentityProvidersQuery = createQueryHook(() => {
  return {
    queryKey: ['identity-providers', 'list'],
    queryFn: () => getIdentityProviders(),
    select: (data: { identityProviders: IdentityProvider[] }) => data.identityProviders,
  };
});

export function usePostUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof postUser>[0]) => postUser(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      data: Parameters<typeof updateUser>[1];
      id: Parameters<typeof updateUser>[0];
    }) => updateUser(id, data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
    },
  });
}

export function useDeactivateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof deleteUser>[0]) => deleteUser(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
    },
  });
}

export function useGenerateTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof generateToken>[0] & { projectName?: string }) =>
      generateToken(data),
    onSuccess(data, variables) {
      queryClient.setQueryData<UserToken[]>(userTokensQueryKey(data.login), (oldData) => {
        const newData = {
          ...data,
          project:
            variables.projectKey && variables.projectName
              ? { key: variables.projectKey, name: variables.projectName }
              : undefined,
        };
        return oldData ? [...oldData, newData] : [newData];
      });
    },
  });
}

export function useRevokeTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof revokeToken>[0]) => revokeToken(data),
    onSuccess(_, data) {
      if (data.login) {
        queryClient.setQueryData<UserToken[]>(userTokensQueryKey(data.login), (oldData) =>
          oldData ? oldData.filter((token) => token.name !== data.name) : undefined,
        );
      }
    },
  });
}

export function useDismissNoticeMutation() {
  const { updateDismissedNotices } = useCurrentUser();

  return useMutation({
    mutationFn: (data: NoticeType) => dismissNotice(data),
    onSuccess(_, data) {
      updateDismissedNotices(data, true);
    },
  });
}
