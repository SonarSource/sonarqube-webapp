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

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isStringDefined } from '~shared/helpers/types';
import { isLoggedIn } from '~shared/helpers/users';
import { createQueryHook, getNextPageParam, getPreviousPageParam } from '~shared/queries/common';
import { generateToken, getTokens, revokeToken } from '../api/user-tokens';
import {
  deleteUser,
  dismissNotice,
  getIdentityProviders,
  getUsers,
  postUser,
  updateUser,
} from '../api/users';
import { useCurrentUser } from '../context/current-user/CurrentUserContext';
import { UserToken } from '../types/token';
import { IdentityProvider } from '../types/types';
import { NoticeType, RestUserDetailed } from '../types/users';

const STALE_TIME = 4 * 60 * 1000;

export function useUsersQueries(
  getParams: Omit<Parameters<typeof getUsers>[0], 'pageSize' | 'pageIndex'>,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ['user', 'list', getParams],
    queryFn: ({ pageParam }) => getUsers({ ...getParams, pageIndex: pageParam }),
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

export function useUserTokensQuery(login: string) {
  return useQuery({
    queryKey: ['user', login, 'tokens'],
    queryFn: () => getTokens(login),
    staleTime: STALE_TIME,
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
      queryClient.setQueryData<UserToken[]>(['user', data.login, 'tokens'], (oldData) => {
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
      queryClient.setQueryData<UserToken[]>(['user', data.login, 'tokens'], (oldData) =>
        oldData ? oldData.filter((token) => token.name !== data.name) : undefined,
      );
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
