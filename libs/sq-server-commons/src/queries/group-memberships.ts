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

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNextPageParam, getPreviousPageParam } from '~shared/queries/common';
import {
  addGroupMembership,
  getGroupMemberships,
  removeGroupMembership,
} from '../api/group-memberships';
import { getUsersGroups } from '../api/user_groups';
import { getUsers } from '../api/users';
import { SelectListFilter } from '../components/controls/SelectList';
import { translateWithParameters } from '../helpers/l10n';

const DOMAIN = 'group-memberships';
const GROUP_SUB_DOMAIN = 'users-of-group';
const USER_SUB_DOMAIN = 'groups-of-user';

async function isUserAMember(userId: string, groupId: string) {
  const memberships = await getGroupMemberships({
    userId,
    groupId,
    pageSize: 0,
  });
  return memberships.page.total > 0;
}

export function useGroupMembersQuery(params: {
  filter?: SelectListFilter;
  groupId: string;
  pageIndex?: number;
  q?: string;
}) {
  return useInfiniteQuery({
    queryKey: [DOMAIN, GROUP_SUB_DOMAIN, 'list', params],
    queryFn: async ({ pageParam }) => {
      if (params.filter === SelectListFilter.All) {
        const result = await getUsers({
          q: params.q ?? '',
          pageIndex: pageParam,
        });
        return {
          users: await Promise.all(
            result.users.map(async (u) => ({
              ...u,
              selected: await isUserAMember(u.id, params.groupId),
            })),
          ),
          page: result.page,
        };
      }
      const isSelected = params.filter === SelectListFilter.Selected || params.filter === undefined;
      return getUsers({
        q: params.q ?? '',
        [isSelected ? 'groupId' : 'groupId!']: params.groupId,
        pageIndex: pageParam,
      }).then((res) => ({
        users: res.users.map((u) => ({
          ...u,
          selected: isSelected,
        })),
        page: res.page,
      }));
    },
    getNextPageParam,
    getPreviousPageParam,
    initialPageParam: 1,
  });
}

export function useRemoveGroupMembersQueryFromCache() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.removeQueries({ queryKey: [DOMAIN, GROUP_SUB_DOMAIN, 'list'] });
  };
}

export function useUserGroupsQuery(params: {
  filter?: SelectListFilter;
  pageIndex?: number;
  q?: string;
  userId: string;
}) {
  return useInfiniteQuery({
    queryKey: [DOMAIN, USER_SUB_DOMAIN, 'list', params],
    queryFn: async ({ pageParam }) => {
      if (params.filter === SelectListFilter.All) {
        const result = await getUsersGroups({
          q: params.q ?? '',
          pageIndex: pageParam,
        });
        return {
          groups: await Promise.all(
            result.groups.map(async (g) => ({
              ...g,
              selected: await isUserAMember(params.userId, g.id),
            })),
          ),
          page: result.page,
        };
      }
      const isSelected = params.filter === SelectListFilter.Selected || params.filter === undefined;
      return getUsersGroups({
        q: params.q ?? '',
        [isSelected ? 'userId' : 'userId!']: params.userId,
        pageIndex: pageParam,
      }).then((res) => ({
        groups: res.groups.map((g) => ({
          ...g,
          selected: isSelected,
        })),
        page: res.page,
      }));
    },
    getNextPageParam,
    getPreviousPageParam,
    initialPageParam: 1,
  });
}

export function useGroupMembersCountQuery(groupId: string) {
  return useQuery({
    queryKey: [DOMAIN, GROUP_SUB_DOMAIN, 'count', groupId],
    queryFn: () => getGroupMemberships({ groupId, pageSize: 0 }).then((r) => r.page.total),
  });
}

export function useUserGroupsCountQuery(userId: string) {
  return useQuery({
    queryKey: [DOMAIN, USER_SUB_DOMAIN, 'count', userId],
    queryFn: () => getGroupMemberships({ userId, pageSize: 0 }).then((r) => r.page.total),
  });
}

export function useAddGroupMembershipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof addGroupMembership>[0]) => addGroupMembership(data),
    onSuccess(_, data) {
      queryClient.setQueryData<number>(
        [DOMAIN, GROUP_SUB_DOMAIN, 'count', data.groupId],
        (oldData) => (oldData !== undefined ? oldData + 1 : undefined),
      );
      queryClient.setQueryData<number>(
        [DOMAIN, USER_SUB_DOMAIN, 'count', data.userId],
        (oldData) => (oldData !== undefined ? oldData + 1 : undefined),
      );
      queryClient.invalidateQueries({
        queryKey: [DOMAIN, USER_SUB_DOMAIN, 'memberships', data.userId],
      });
    },
  });
}

export function useRemoveGroupMembershipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, groupId }: { groupId: string; userId: string }) => {
      const memberships = await getGroupMemberships({
        userId,
        groupId,
        pageSize: 1,
      });
      if (!memberships.page.total) {
        throw new Error(
          translateWithParameters('group_membership.remove_user.error', userId, groupId),
        );
      }
      return removeGroupMembership(memberships.groupMemberships[0].id);
    },
    onSuccess(_, data) {
      queryClient.setQueryData<number>(
        [DOMAIN, GROUP_SUB_DOMAIN, 'count', data.groupId],
        (oldData) => (oldData !== undefined ? oldData - 1 : undefined),
      );
      queryClient.setQueryData<number>(
        [DOMAIN, USER_SUB_DOMAIN, 'count', data.userId],
        (oldData) => (oldData !== undefined ? oldData - 1 : undefined),
      );
      queryClient.invalidateQueries({
        queryKey: [DOMAIN, USER_SUB_DOMAIN, 'memberships', data.userId],
      });
    },
  });
}
