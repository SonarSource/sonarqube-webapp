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
import { renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { getDopPermissionChecks } from '../../api/dop-translation';
import { mockPermissionCheckResource } from '../../helpers/mocks/dop-translation';
import { AlmKeys } from '../../types/alm-settings';
import { PermissionCheckStatus } from '../../types/dop-translation';
import {
  dopPermissionChecksQueryOptions,
  useDopPermissionCheckForConfiguration,
  useRefreshDopPermissionCheckMutation,
} from '../dop-translation';

jest.mock('../../api/dop-translation', () => ({
  ...jest.requireActual<typeof import('../../api/dop-translation')>('../../api/dop-translation'),
  getDopPermissionChecks: jest.fn(),
}));

const mockGetDopPermissionChecks = jest.mocked(getDopPermissionChecks);

const GITHUB_CHECK = mockPermissionCheckResource({
  key: 'github-config',
  status: PermissionCheckStatus.Insufficient,
});

const GITLAB_CHECK = mockPermissionCheckResource({
  key: 'gitlab-config',
  status: PermissionCheckStatus.Sufficient,
  type: AlmKeys.GitLab,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetDopPermissionChecks.mockResolvedValue({
    permissionChecks: [GITHUB_CHECK, GITLAB_CHECK],
  });
});

describe('useDopPermissionCheckForConfiguration', () => {
  it("selects the requested connection's entry out of the shared all-connections response", async () => {
    const { result } = renderHook(() => useDopPermissionCheckForConfiguration('gitlab-config'), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(GITLAB_CHECK);
    });
  });

  it('fetches the all-connections response, not a project- or configuration-scoped one', async () => {
    renderHook(() => useDopPermissionCheckForConfiguration('gitlab-config'), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(mockGetDopPermissionChecks).toHaveBeenCalledTimes(1);
    });
    expect(mockGetDopPermissionChecks).toHaveBeenCalledWith({ projectKey: undefined });
  });

  it('resolves to undefined for a connection absent from the response', async () => {
    const { result } = renderHook(() => useDopPermissionCheckForConfiguration('unknown-config'), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });
    expect(result.current.data).toBeUndefined();
  });

  it('does not fetch when disabled', () => {
    renderHook(() => useDopPermissionCheckForConfiguration('github-config', { enabled: false }), {
      wrapper: getContextWrapper(),
    });

    expect(mockGetDopPermissionChecks).not.toHaveBeenCalled();
  });

  it('shares one request across several hooks selecting different connections', async () => {
    const { result } = renderHook(
      () => ({
        client: useQueryClient(),
        github: useDopPermissionCheckForConfiguration('github-config'),
        gitlab: useDopPermissionCheckForConfiguration('gitlab-config'),
      }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.github.data).toEqual(GITHUB_CHECK);
    });
    expect(result.current.gitlab.data).toEqual(GITLAB_CHECK);
    expect(mockGetDopPermissionChecks).toHaveBeenCalledTimes(1);
    expect(result.current.client.getQueryData(dopPermissionChecksQueryOptions().queryKey)).toEqual({
      permissionChecks: [GITHUB_CHECK, GITLAB_CHECK],
    });
  });
});

describe('useRefreshDopPermissionCheckMutation', () => {
  it('runs a scoped, cache-bypassing refresh for the given connection', async () => {
    const refreshed = mockPermissionCheckResource({
      key: 'github-config',
      status: PermissionCheckStatus.Sufficient,
    });
    mockGetDopPermissionChecks.mockImplementation((params) =>
      Promise.resolve({
        permissionChecks: params.refresh ? [refreshed] : [GITHUB_CHECK, GITLAB_CHECK],
      }),
    );
    const { result } = renderHook(() => useRefreshDopPermissionCheckMutation(), {
      wrapper: getContextWrapper(),
    });

    result.current.mutate({ almKey: AlmKeys.GitHub, configurationKey: 'github-config' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(mockGetDopPermissionChecks).toHaveBeenCalledWith({
      configurationKey: 'github-config',
      refresh: true,
    });
  });

  it("replaces only the refreshed connection's entry in the shared all-connections cache", async () => {
    const refreshed = mockPermissionCheckResource({
      key: 'github-config',
      status: PermissionCheckStatus.Sufficient,
    });
    mockGetDopPermissionChecks.mockResolvedValue({ permissionChecks: [refreshed] });

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useRefreshDopPermissionCheckMutation() }),
      { wrapper: getContextWrapper() },
    );
    // Seed the shared cache the way the widget's own query would.
    result.current.client.setQueryData(dopPermissionChecksQueryOptions().queryKey, {
      permissionChecks: [GITHUB_CHECK, GITLAB_CHECK],
    });

    result.current.mutation.mutate({ almKey: AlmKeys.GitHub, configurationKey: 'github-config' });

    await waitFor(() => {
      expect(result.current.mutation.isSuccess).toBe(true);
    });
    expect(result.current.client.getQueryData(dopPermissionChecksQueryOptions().queryKey)).toEqual({
      permissionChecks: [refreshed, GITLAB_CHECK],
    });
  });

  it('upserts a synthetic CHECK_FAILED entry when a successful response omits the connection', async () => {
    mockGetDopPermissionChecks.mockResolvedValue({ permissionChecks: [] });

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useRefreshDopPermissionCheckMutation() }),
      { wrapper: getContextWrapper() },
    );
    result.current.client.setQueryData(dopPermissionChecksQueryOptions().queryKey, {
      permissionChecks: [GITHUB_CHECK, GITLAB_CHECK],
    });

    result.current.mutation.mutate({ almKey: AlmKeys.GitHub, configurationKey: 'github-config' });

    await waitFor(() => {
      expect(result.current.mutation.isSuccess).toBe(true);
    });
    const data = result.current.client.getQueryData<{
      permissionChecks: { key: string; status: PermissionCheckStatus }[];
    }>(dopPermissionChecksQueryOptions().queryKey);
    expect(data?.permissionChecks.find((check) => check.key === 'github-config')?.status).toBe(
      PermissionCheckStatus.CheckFailed,
    );
  });

  it('upserts a synthetic CHECK_FAILED entry when the refresh request itself fails', async () => {
    mockGetDopPermissionChecks.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useRefreshDopPermissionCheckMutation() }),
      { wrapper: getContextWrapper() },
    );
    result.current.client.setQueryData(dopPermissionChecksQueryOptions().queryKey, {
      permissionChecks: [GITHUB_CHECK, GITLAB_CHECK],
    });

    result.current.mutation.mutate({ almKey: AlmKeys.GitHub, configurationKey: 'github-config' });

    await waitFor(() => {
      expect(result.current.mutation.isError).toBe(true);
    });
    const data = result.current.client.getQueryData<{
      permissionChecks: { key: string; status: PermissionCheckStatus }[];
    }>(dopPermissionChecksQueryOptions().queryKey);
    expect(data?.permissionChecks.find((check) => check.key === 'github-config')?.status).toBe(
      PermissionCheckStatus.CheckFailed,
    );
    // The unrelated connection's cached result is untouched.
    expect(data?.permissionChecks.find((check) => check.key === 'gitlab-config')).toEqual(
      GITLAB_CHECK,
    );
  });

  it('invalidates project-scoped permission-check queries but not the all-connections one', async () => {
    mockGetDopPermissionChecks.mockResolvedValue({
      permissionChecks: [mockPermissionCheckResource({ key: 'github-config' })],
    });

    const { result } = renderHook(
      () => ({ client: useQueryClient(), mutation: useRefreshDopPermissionCheckMutation() }),
      { wrapper: getContextWrapper() },
    );
    result.current.client.setQueryData(dopPermissionChecksQueryOptions().queryKey, {
      permissionChecks: [GITHUB_CHECK],
    });
    result.current.client.setQueryData(
      dopPermissionChecksQueryOptions({ projectKey: 'my-project' }).queryKey,
      { permissionChecks: [GITHUB_CHECK] },
    );

    result.current.mutation.mutate({ almKey: AlmKeys.GitHub, configurationKey: 'github-config' });

    await waitFor(() => {
      expect(result.current.mutation.isSuccess).toBe(true);
    });
    expect(
      result.current.client.getQueryState(dopPermissionChecksQueryOptions().queryKey)
        ?.isInvalidated,
    ).toBe(false);
    expect(
      result.current.client.getQueryState(
        dopPermissionChecksQueryOptions({ projectKey: 'my-project' }).queryKey,
      )?.isInvalidated,
    ).toBe(true);
  });
});
