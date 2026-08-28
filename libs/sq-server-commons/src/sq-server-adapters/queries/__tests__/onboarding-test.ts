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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { Visibility } from '~shared/types/component';
import {
  OnboardingDevopsPlatform,
  OnboardingRepositoriesVisibility,
} from '~shared/types/onboarding';
import { mockDopSetting } from '../../../api/mocks/data/dop-translation';
import { AlmKeys } from '../../../types/alm-settings';
import {
  useOnboardingBoundProjectCountsQuery,
  useOnboardingRepositoriesQuery,
} from '../onboarding';

const mockGetDopSettings = jest.fn();
const mockGetProjectBindings = jest.fn();
const mockGetGithubRepositories = jest.fn();
const mockGetGitlabProjects = jest.fn();
const mockGetBitbucketServerRepositories = jest.fn();
const mockSearchForBitbucketCloudRepositories = jest.fn();
const mockSearchAzureRepositories = jest.fn();

jest.mock('../../../api/dop-translation', () => ({
  getDopSettings: (...args: unknown[]) => mockGetDopSettings(...args) as unknown,
  getProjectBindings: (...args: unknown[]) => mockGetProjectBindings(...args) as unknown,
}));

jest.mock('../../../api/alm-integrations', () => ({
  getGithubRepositories: (...args: unknown[]) => mockGetGithubRepositories(...args) as unknown,
  getGitlabProjects: (...args: unknown[]) => mockGetGitlabProjects(...args) as unknown,
  getBitbucketServerRepositories: (...args: unknown[]) =>
    mockGetBitbucketServerRepositories(...args) as unknown,
  searchForBitbucketCloudRepositories: (...args: unknown[]) =>
    mockSearchForBitbucketCloudRepositories(...args) as unknown,
  searchAzureRepositories: (...args: unknown[]) => mockSearchAzureRepositories(...args) as unknown,
}));

const GITHUB_SETTING = mockDopSetting({ id: 'gh-setting', key: 'gh-key', type: AlmKeys.GitHub });
const GITLAB_SETTING = mockDopSetting({ id: 'gl-setting', key: 'gl-key', type: AlmKeys.GitLab });
const BBC_SETTING = mockDopSetting({
  id: 'bbc-setting',
  key: 'bbc-key',
  type: AlmKeys.BitbucketCloud,
});
const BBS_SETTING = mockDopSetting({
  id: 'bbs-setting',
  key: 'bbs-key',
  type: AlmKeys.BitbucketServer,
});
const AZURE_SETTING = mockDopSetting({ id: 'az-setting', key: 'az-key', type: AlmKeys.Azure });

const BASE_PARAMS = {
  dopSettingId: GITHUB_SETTING.id,
  pageIndex: 1,
  pageSize: 10,
  visibility: OnboardingRepositoriesVisibility.All,
};

describe('useOnboardingRepositoriesQuery (SQS adapter)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDopSettings.mockResolvedValue({ dopSettings: [GITHUB_SETTING] });
    mockGetGithubRepositories.mockResolvedValue({
      paging: { pageIndex: 1, pageSize: 10, total: 0 },
      repositories: [],
    });
  });

  it('stays pending while DOP settings are not yet loaded', () => {
    mockGetDopSettings.mockReturnValue(
      new Promise(() => {
        /* empty */
      }),
    );

    const { result } = renderHook(() => useOnboardingRepositoriesQuery(BASE_PARAMS), {
      wrapper: getContextWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('stays disabled when the dopSettingId is not found in DOP settings', async () => {
    mockGetDopSettings.mockResolvedValue({ dopSettings: [] });

    const { result } = renderHook(
      () => useOnboardingRepositoriesQuery({ ...BASE_PARAMS, dopSettingId: 'unknown-id' }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
    expect(mockGetGithubRepositories).not.toHaveBeenCalled();
  });

  it('respects the caller-supplied enabled=false option', async () => {
    const { result } = renderHook(
      () => useOnboardingRepositoriesQuery(BASE_PARAMS, { enabled: false }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
    expect(mockGetGithubRepositories).not.toHaveBeenCalled();
  });

  describe('GitHub', () => {
    it('returns empty repositories when no githubOrganization is provided', async () => {
      const { result } = renderHook(
        () => useOnboardingRepositoriesQuery({ ...BASE_PARAMS, githubOrganization: undefined }),
        { wrapper: getContextWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data).toEqual({
        page: { pageIndex: 1, pageSize: 10, total: 0 },
        repositories: [],
      });
      expect(mockGetGithubRepositories).not.toHaveBeenCalled();
    });

    it('fetches and normalises GitHub repositories', async () => {
      mockGetGithubRepositories.mockResolvedValue({
        paging: { pageIndex: 1, pageSize: 10, total: 1 },
        repositories: [
          {
            id: 'gh-id',
            key: 'gh-key',
            name: 'gh-repo',
            sqProjectKey: 'sqk',
            visibility: Visibility.Public,
          },
        ],
      });

      const { result } = renderHook(
        () => useOnboardingRepositoriesQuery({ ...BASE_PARAMS, githubOrganization: 'my-org' }),
        { wrapper: getContextWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data?.repositories).toEqual([
        {
          alm: OnboardingDevopsPlatform.Github,
          id: 'gh-id',
          isImported: true,
          isPrivate: false,
          name: 'gh-repo',
          slug: 'gh-key',
        },
      ]);
    });
  });

  describe('GitLab', () => {
    beforeEach(() => {
      mockGetDopSettings.mockResolvedValue({ dopSettings: [GITLAB_SETTING] });
      mockGetGitlabProjects.mockResolvedValue({
        projects: [{ id: 'gl-id', name: 'gl-project', slug: 'gl-slug', sqProjectKey: null }],
        projectsPaging: { pageIndex: 1, pageSize: 10, total: 1 },
      });
    });

    it('fetches and normalises GitLab projects', async () => {
      const { result } = renderHook(
        () => useOnboardingRepositoriesQuery({ ...BASE_PARAMS, dopSettingId: GITLAB_SETTING.id }),
        { wrapper: getContextWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data?.repositories).toEqual([
        {
          alm: OnboardingDevopsPlatform.Gitlab,
          id: 'gl-id',
          isImported: false,
          isPrivate: false,
          name: 'gl-project',
          slug: 'gl-slug',
        },
      ]);
    });
  });

  describe('BitbucketServer', () => {
    beforeEach(() => {
      mockGetDopSettings.mockResolvedValue({ dopSettings: [BBS_SETTING] });
      mockGetBitbucketServerRepositories.mockResolvedValue({
        repositories: [{ id: 10, name: 'bbs-repo', slug: 'bbs-slug', sqProjectKey: 'sqk' }],
        isLastPage: true,
        nextPageStart: 0,
      });
    });

    it('fetches and normalises BitbucketServer repositories', async () => {
      const { result } = renderHook(
        () => useOnboardingRepositoriesQuery({ ...BASE_PARAMS, dopSettingId: BBS_SETTING.id }),
        { wrapper: getContextWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data?.repositories).toEqual([
        {
          alm: OnboardingDevopsPlatform.Bitbucket,
          id: '10',
          isImported: true,
          isPrivate: false,
          name: 'bbs-repo',
          slug: 'bbs-slug',
        },
      ]);
    });
  });

  describe('BitbucketCloud', () => {
    beforeEach(() => {
      mockGetDopSettings.mockResolvedValue({ dopSettings: [BBC_SETTING] });
      mockSearchForBitbucketCloudRepositories.mockResolvedValue({
        repositories: [
          { uuid: 'bbc-uuid', name: 'bbc-repo', slug: 'bbc-slug', sqProjectKey: null },
        ],
        isLastPage: true,
      });
    });

    it('fetches and normalises BitbucketCloud repositories', async () => {
      const { result } = renderHook(
        () => useOnboardingRepositoriesQuery({ ...BASE_PARAMS, dopSettingId: BBC_SETTING.id }),
        { wrapper: getContextWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data?.repositories).toEqual([
        {
          alm: OnboardingDevopsPlatform.BitbucketCloud,
          id: 'bbc-uuid',
          isImported: false,
          isPrivate: false,
          name: 'bbc-repo',
          slug: 'bbc-slug',
        },
      ]);
    });
  });

  describe('Azure', () => {
    beforeEach(() => {
      mockGetDopSettings.mockResolvedValue({ dopSettings: [AZURE_SETTING] });
      mockSearchAzureRepositories.mockResolvedValue({
        repositories: [
          { name: 'az-repo', projectName: 'az-project', sqProjectKey: 'sqk' },
          { name: 'az-repo-2', projectName: 'az-project', sqProjectKey: null },
        ],
      });
    });

    it('fetches all Azure repositories and slices client-side', async () => {
      const { result } = renderHook(
        () =>
          useOnboardingRepositoriesQuery({
            ...BASE_PARAMS,
            dopSettingId: AZURE_SETTING.id,
            pageSize: 1,
          }),
        { wrapper: getContextWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data?.page.total).toBe(2);
      expect(result.current.data?.repositories).toHaveLength(1);
      expect(result.current.data?.repositories[0]).toEqual({
        alm: OnboardingDevopsPlatform.AzureDevops,
        id: 'az-project/az-repo',
        isImported: true,
        isPrivate: false,
        name: 'az-repo',
        slug: 'az-project',
      });
    });
  });
});

describe('useOnboardingBoundProjectCountsQuery (SQS adapter)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderCounts(dopSettingIds: string[]) {
    return renderHook(() => useOnboardingBoundProjectCountsQuery(dopSettingIds), {
      wrapper: getContextWrapper(),
    });
  }

  it('reports one count per configuration, keyed by its id', async () => {
    mockGetProjectBindings.mockImplementation(({ dopSettingId }: { dopSettingId: string }) =>
      Promise.resolve({
        page: { pageIndex: 1, pageSize: 1, total: dopSettingId === 'gh' ? 12 : 3 },
      }),
    );

    const { result } = renderCounts(['gh', 'gl']);

    await waitFor(() => {
      expect(result.current.data).toEqual({ gh: 12, gl: 3 });
    });

    // Only the count is wanted, so a single-item page is asked for rather than every binding.
    expect(mockGetProjectBindings).toHaveBeenCalledWith({
      dopSettingId: 'gh',
      pageIndex: 1,
      pageSize: 1,
    });
  });

  it('leaves out a configuration whose count could not be fetched', async () => {
    mockGetProjectBindings.mockImplementation(({ dopSettingId }: { dopSettingId: string }) =>
      dopSettingId === 'gh'
        ? Promise.resolve({ page: { pageIndex: 1, pageSize: 1, total: 12 } })
        : Promise.reject(new Error('configuration is unreachable')),
    );

    const { result } = renderCounts(['gh', 'broken']);

    // The healthy configuration still reports its count: a failing neighbour must neither take the
    // whole column down nor be reported as zero.
    await waitFor(() => {
      expect(result.current.data).toEqual({ gh: 12 });
    });
  });

  it('asks for nothing when the page holds no configuration', () => {
    const { result } = renderCounts([]);

    expect(result.current).toEqual({ data: {}, isPending: false });
    expect(mockGetProjectBindings).not.toHaveBeenCalled();
  });

  it('reuses a cached count instead of refetching when the page is shown again', async () => {
    mockGetProjectBindings.mockResolvedValue({ page: { pageIndex: 1, pageSize: 1, total: 12 } });

    // A shared client, unlike `getContextWrapper`'s per-mount one: the modal only asks for the ids of
    // the current page, so turning the page and coming back remounts these observers against the same
    // cache. Without a stale time — neither query client sets a default — that would refetch every
    // row on every page turn.
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const first = renderHook(() => useOnboardingBoundProjectCountsQuery(['gh']), { wrapper });
    await waitFor(() => {
      expect(first.result.current.data).toEqual({ gh: 12 });
    });
    first.unmount();

    const second = renderHook(() => useOnboardingBoundProjectCountsQuery(['gh']), { wrapper });

    expect(second.result.current.data).toEqual({ gh: 12 });
    expect(mockGetProjectBindings).toHaveBeenCalledTimes(1);
  });
});
