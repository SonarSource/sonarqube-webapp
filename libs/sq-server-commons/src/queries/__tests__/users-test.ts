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

import { useQueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { generateToken, getTokens, revokeToken } from '../../api/user-tokens';
import {
  deleteUser,
  dismissNotice,
  getIdentityProviders,
  getUserById,
  getUsers,
  postUser,
  updateUser,
} from '../../api/users';
import { mockIdentityProvider, mockLoggedInUser, mockRestUser } from '../../helpers/testMocks';
import { TokenType } from '../../types/token';
import { NoticeType } from '../../types/users';
import {
  useCurrentUserDetailsQuery,
  useDeactivateUserMutation,
  useDismissNoticeMutation,
  useGenerateTokenMutation,
  useIdentityProvidersQuery,
  usePostUserMutation,
  useRevokeTokenMutation,
  userTokensQueryKey,
  useUpdateUserMutation,
  useUsersByIdsQuery,
  useUsersQueries,
  useUserTokensQuery,
} from '../users';

jest.mock('../../api/users', () => ({
  ...jest.requireActual<typeof import('../../api/users')>('../../api/users'),
  deleteUser: jest.fn(),
  dismissNotice: jest.fn(),
  getIdentityProviders: jest.fn(),
  getUserById: jest.fn(),
  getUsers: jest.fn(),
  postUser: jest.fn(),
  updateUser: jest.fn(),
}));

jest.mock('../../api/user-tokens', () => ({
  ...jest.requireActual<typeof import('../../api/user-tokens')>('../../api/user-tokens'),
  generateToken: jest.fn(),
  getTokens: jest.fn(),
  revokeToken: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useUsersByIdsQuery', () => {
  it('returns empty data when given an empty ids array', async () => {
    const { result } = renderHook(() => useUsersByIdsQuery([]), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual({});
    expect(getUserById).not.toHaveBeenCalled();
  });

  it('returns a map keyed by input id when users are found', async () => {
    const user = mockRestUser({ id: 'user-uuid-1', name: 'Alice', avatar: 'alice-hash' });
    jest.mocked(getUserById).mockResolvedValue(user);

    const { result } = renderHook(() => useUsersByIdsQuery(['user-uuid-1']), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual({
      'user-uuid-1': { avatar: 'alice-hash', name: 'Alice' },
    });
  });

  it('fetches each id in parallel and merges results', async () => {
    const userA = mockRestUser({ id: 'a', name: 'Alice', avatar: 'hash-a' });
    const userB = mockRestUser({ id: 'b', name: 'Bob', avatar: 'hash-b' });
    jest.mocked(getUserById).mockResolvedValueOnce(userA).mockResolvedValueOnce(userB);

    const { result } = renderHook(() => useUsersByIdsQuery(['a', 'b']), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual({
      a: { avatar: 'hash-a', name: 'Alice' },
      b: { avatar: 'hash-b', name: 'Bob' },
    });
  });

  it('gracefully excludes ids whose query fails (e.g. 404)', async () => {
    const user = mockRestUser({ id: 'found', name: 'Found User', avatar: 'found-hash' });
    jest
      .mocked(getUserById)
      .mockResolvedValueOnce(user)
      .mockRejectedValueOnce(new Error('Not Found'));

    const { result } = renderHook(() => useUsersByIdsQuery(['found', 'missing']), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual({
      found: { avatar: 'found-hash', name: 'Found User' },
    });
    expect(result.current.data).not.toHaveProperty('missing');
  });
});

describe('useUsersQueries', () => {
  it('calls getUsers with the initial page params and returns data', async () => {
    const user = mockRestUser({ login: 'user-1' });
    jest.mocked(getUsers).mockResolvedValue({
      users: [user],
      page: { pageIndex: 1, pageSize: 25, total: 1 },
    } as never);

    const { result } = renderHook(() => useUsersQueries({ q: '' }), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getUsers).toHaveBeenCalledWith(expect.objectContaining({ q: '', pageIndex: 1 }));
    expect(result.current.data?.pages[0]).toBeDefined();
  });

  it('does not fetch when enabled is false', () => {
    renderHook(() => useUsersQueries({ q: '' }, false), {
      wrapper: getContextWrapper(),
    });

    expect(getUsers).not.toHaveBeenCalled();
  });
});

describe('useCurrentUserDetailsQuery', () => {
  it('fetches and returns the current user details', async () => {
    const user = mockRestUser({ login: 'current-user', name: 'Current User' });
    jest.mocked(getUsers).mockResolvedValue({ users: [user] } as never);

    const { result } = renderHook(() => useCurrentUserDetailsQuery(), {
      wrapper: getContextWrapper({
        initialCurrentUser: mockLoggedInUser({ login: 'current-user' }),
      }),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getUsers).toHaveBeenCalledWith(expect.objectContaining({ q: 'current-user' }));
    expect(result.current.data?.login).toBe('current-user');
  });

  it('does not fetch when user is not logged in', () => {
    renderHook(() => useCurrentUserDetailsQuery(), {
      wrapper: getContextWrapper({
        initialCurrentUser: { isLoggedIn: false, dismissedNotices: {} },
      }),
    });

    expect(getUsers).not.toHaveBeenCalled();
  });
});

describe('useUserTokensQuery', () => {
  it('fetches tokens for a given login', async () => {
    const tokens = [
      {
        createdAt: '2024-01-01',
        isExpired: false,
        name: 'my-token',
        type: TokenType.User,
      },
    ];
    jest.mocked(getTokens).mockResolvedValue(tokens as never);

    const { result } = renderHook(() => useUserTokensQuery('alice'), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getTokens).toHaveBeenCalledWith('alice');
    expect(result.current.data).toEqual(tokens);
  });
});

describe('useIdentityProvidersQuery', () => {
  it('fetches and returns the list of identity providers', async () => {
    const provider = mockIdentityProvider({ key: 'github', name: 'GitHub' });
    jest.mocked(getIdentityProviders).mockResolvedValue({ identityProviders: [provider] });

    const { result } = renderHook(() => useIdentityProvidersQuery(), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getIdentityProviders).toHaveBeenCalled();
    expect(result.current.data).toEqual([provider]);
  });
});

describe('usePostUserMutation', () => {
  it('calls postUser and invalidates user list on success', async () => {
    const newUser = mockRestUser({ login: 'new-user' });
    jest.mocked(postUser).mockResolvedValue(newUser as never);

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: usePostUserMutation() }),
      { wrapper: getContextWrapper() },
    );

    const invalidateSpy = jest.spyOn(result.current.client, 'invalidateQueries');

    await result.current.mutation.mutateAsync({
      login: 'new-user',
      name: 'New User',
      scmAccounts: [],
    });

    expect(postUser).toHaveBeenCalledWith(
      expect.objectContaining({ login: 'new-user', name: 'New User' }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'list'] });

    invalidateSpy.mockRestore();
  });
});

describe('useUpdateUserMutation', () => {
  it('calls updateUser and invalidates user list on success', async () => {
    const updatedUser = mockRestUser({ id: 'user-1', name: 'Updated Name' });
    jest.mocked(updateUser).mockResolvedValue(updatedUser as never);

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useUpdateUserMutation() }),
      { wrapper: getContextWrapper() },
    );

    const invalidateSpy = jest.spyOn(result.current.client, 'invalidateQueries');

    await result.current.mutation.mutateAsync({ id: 'user-1', data: { name: 'Updated Name' } });

    expect(updateUser).toHaveBeenCalledWith('user-1', { name: 'Updated Name' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'list'] });

    invalidateSpy.mockRestore();
  });
});

describe('useDeactivateUserMutation', () => {
  it('calls deleteUser and invalidates user list on success', async () => {
    jest.mocked(deleteUser).mockResolvedValue(undefined as never);

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useDeactivateUserMutation() }),
      { wrapper: getContextWrapper() },
    );

    const invalidateSpy = jest.spyOn(result.current.client, 'invalidateQueries');

    await result.current.mutation.mutateAsync({ id: 'user-1' });

    expect(deleteUser).toHaveBeenCalledWith({ id: 'user-1' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'list'] });

    invalidateSpy.mockRestore();
  });
});

describe('useGenerateTokenMutation', () => {
  const LOGIN = 'alice';
  const newToken = {
    createdAt: '2024-01-01',
    isExpired: false,
    login: LOGIN,
    name: 'ci-token',
    token: 'secret-token-value',
    type: TokenType.User,
  };

  it('adds the generated token to the cached token list', async () => {
    jest.mocked(generateToken).mockResolvedValue(newToken);

    const existingToken = {
      createdAt: '2023-01-01',
      isExpired: false,
      name: 'old-token',
      type: TokenType.User,
    };

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useGenerateTokenMutation() }),
      { wrapper: getContextWrapper() },
    );

    act(() => {
      result.current.client.setQueryData(userTokensQueryKey(LOGIN), [existingToken]);
    });

    await result.current.mutation.mutateAsync({ login: LOGIN, name: 'ci-token' });

    const cached = result.current.client.getQueryData(userTokensQueryKey(LOGIN));
    expect(cached).toHaveLength(2);
    expect((cached as (typeof newToken)[])[1]).toMatchObject({ name: 'ci-token', login: LOGIN });
  });

  it('initialises cache with the new token when no existing cache entry', async () => {
    jest.mocked(generateToken).mockResolvedValue(newToken);

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useGenerateTokenMutation() }),
      { wrapper: getContextWrapper() },
    );

    await result.current.mutation.mutateAsync({ login: LOGIN, name: 'ci-token' });

    const cached = result.current.client.getQueryData(userTokensQueryKey(LOGIN));
    expect(cached).toHaveLength(1);
  });

  it('attaches project info when projectKey and projectName are provided', async () => {
    jest.mocked(generateToken).mockResolvedValue(newToken);

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useGenerateTokenMutation() }),
      { wrapper: getContextWrapper() },
    );

    await result.current.mutation.mutateAsync({
      login: LOGIN,
      name: 'ci-token',
      projectKey: 'my-project',
      projectName: 'My Project',
    });

    const cached = result.current.client.getQueryData(userTokensQueryKey(LOGIN));
    expect((cached as (typeof newToken)[])[0]).toMatchObject({
      project: { key: 'my-project', name: 'My Project' },
    });
  });
});

describe('useRevokeTokenMutation', () => {
  const LOGIN = 'alice';
  const tokenToRevoke = {
    createdAt: '2024-01-01',
    isExpired: false,
    name: 'ci-token',
    type: TokenType.User,
  };
  const otherToken = {
    createdAt: '2023-06-01',
    isExpired: false,
    name: 'other-token',
    type: TokenType.User,
  };

  it('removes the revoked token from the cached token list', async () => {
    jest.mocked(revokeToken).mockResolvedValue(undefined as never);

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useRevokeTokenMutation() }),
      { wrapper: getContextWrapper() },
    );

    act(() => {
      result.current.client.setQueryData(userTokensQueryKey(LOGIN), [tokenToRevoke, otherToken]);
    });

    await result.current.mutation.mutateAsync({ login: LOGIN, name: 'ci-token' });

    const cached = result.current.client.getQueryData(userTokensQueryKey(LOGIN));
    expect(cached).toHaveLength(1);
    expect((cached as (typeof otherToken)[])[0].name).toBe('other-token');
  });

  it('does not update the cache when login is not provided', async () => {
    jest.mocked(revokeToken).mockResolvedValue(undefined as never);

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useRevokeTokenMutation() }),
      { wrapper: getContextWrapper() },
    );

    act(() => {
      result.current.client.setQueryData(userTokensQueryKey(LOGIN), [tokenToRevoke]);
    });

    await result.current.mutation.mutateAsync({ name: 'ci-token' });

    const cached = result.current.client.getQueryData(userTokensQueryKey(LOGIN));
    expect(cached).toHaveLength(1);
  });
});

describe('useDismissNoticeMutation', () => {
  it('calls dismissNotice with the given notice type', async () => {
    jest.mocked(dismissNotice).mockResolvedValue(undefined as never);

    const { result } = renderHook(() => useDismissNoticeMutation(), {
      wrapper: getContextWrapper({ initialCurrentUser: mockLoggedInUser() }),
    });

    await act(async () => {
      await result.current.mutateAsync(NoticeType.EDUCATION_PRINCIPLES);
    });

    expect(dismissNotice).toHaveBeenCalledWith(NoticeType.EDUCATION_PRINCIPLES);
  });
});
