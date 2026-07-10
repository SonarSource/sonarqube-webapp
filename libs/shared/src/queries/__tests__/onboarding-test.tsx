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
import { ReactNode } from 'react';
import {
  mockOnboardingOverview,
  mockOnboardingProjects,
} from '../../api/mocks/OnboardingServiceMock';
import { getOnboardingOverview, getOnboardingProjects } from '../../api/onboarding';
import { OnboardingProjectsResponse } from '../../types/onboarding';
import { useOnboardingOverviewQuery, useOnboardingProjectsQuery } from '../onboarding';

jest.mock('../../api/onboarding', () => ({
  getOnboardingOverview: jest.fn(),
  getOnboardingProjects: jest.fn(),
}));

const OVERVIEW = mockOnboardingOverview();

function mockProjectsResponse(
  overrides: Partial<OnboardingProjectsResponse> = {},
): OnboardingProjectsResponse {
  const projects = mockOnboardingProjects();
  return {
    filterCounts: {
      all: projects.length,
      // eslint-disable-next-line camelcase
      fully_onboarded: 0,
      // eslint-disable-next-line camelcase
      needs_attention: 0,
      // eslint-disable-next-line camelcase
      not_onboarded: 0,
      // eslint-disable-next-line camelcase
      failed_scans: 0,
      autoscan: 0,
      stale: 0,
      local: 0,
    },
    page: { pageIndex: 1, pageSize: 50, total: projects.length },
    projects,
    ...overrides,
  };
}

let queryClient: QueryClient;

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  // eslint-disable-next-line local-rules/no-query-client-imports
  queryClient = new QueryClient({
    // The onboarding hooks set `retry: 2` themselves, which overrides any client
    // default. `retryDelay: 0` keeps those retries instant so the tests stay fast.
    defaultOptions: { queries: { retryDelay: 0 } },
  });
  jest.clearAllMocks();
});

describe('useOnboardingOverviewQuery', () => {
  it('fetches the overview and returns the data', async () => {
    jest.mocked(getOnboardingOverview).mockResolvedValue(OVERVIEW);

    const { result } = renderHook(() => useOnboardingOverviewQuery({}), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getOnboardingOverview).toHaveBeenCalledWith({});
    expect(result.current.data).toEqual(OVERVIEW);
  });

  it('forwards the organizationKey to the API', async () => {
    jest.mocked(getOnboardingOverview).mockResolvedValue(OVERVIEW);

    const { result } = renderHook(() => useOnboardingOverviewQuery({ organizationKey: 'my-org' }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getOnboardingOverview).toHaveBeenCalledWith({ organizationKey: 'my-org' });
  });

  it('surfaces API errors', async () => {
    jest.mocked(getOnboardingOverview).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useOnboardingOverviewQuery({}), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error('boom'));
  });

  it('retries the request twice before surfacing the error', async () => {
    jest.mocked(getOnboardingOverview).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useOnboardingOverviewQuery({}), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // 1 initial attempt + 2 retries
    expect(getOnboardingOverview).toHaveBeenCalledTimes(3);
  });
});

describe('useOnboardingProjectsQuery', () => {
  it('fetches projects with the given params and returns the data', async () => {
    const response = mockProjectsResponse();
    jest.mocked(getOnboardingProjects).mockResolvedValue(response);

    const params = { filter: 'all' as const, pageIndex: 1, pageSize: 50, q: 'web' };
    const { result } = renderHook(() => useOnboardingProjectsQuery(params), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getOnboardingProjects).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(response);
  });

  it('keeps the previous page visible while the next one loads', async () => {
    const firstPage = mockProjectsResponse({ page: { pageIndex: 1, pageSize: 2, total: 5 } });
    const secondPage = mockProjectsResponse({ page: { pageIndex: 2, pageSize: 2, total: 5 } });
    jest.mocked(getOnboardingProjects).mockResolvedValueOnce(firstPage);

    const { result, rerender } = renderHook((props) => useOnboardingProjectsQuery(props), {
      wrapper: Wrapper,
      initialProps: { pageIndex: 1, pageSize: 2 },
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(firstPage);
    });

    // Make the next page resolve only when we choose, so we can observe the in-between state.
    let resolveSecond: (value: OnboardingProjectsResponse) => void = jest.fn();
    jest.mocked(getOnboardingProjects).mockReturnValueOnce(
      new Promise<OnboardingProjectsResponse>((resolve) => {
        resolveSecond = resolve;
      }) as ReturnType<typeof getOnboardingProjects>,
    );

    rerender({ pageIndex: 2, pageSize: 2 });

    // While the second page is loading, the previous data is still exposed as placeholder data.
    await waitFor(() => {
      expect(result.current.isPlaceholderData).toBe(true);
    });
    expect(result.current.data).toEqual(firstPage);

    resolveSecond(secondPage);

    await waitFor(() => {
      expect(result.current.data).toEqual(secondPage);
    });
    expect(result.current.isPlaceholderData).toBe(false);
  });

  it('retries the request twice before surfacing the error', async () => {
    jest.mocked(getOnboardingProjects).mockRejectedValue(new Error('boom'));

    const params = { filter: 'all' as const, pageIndex: 1, pageSize: 50 };
    const { result } = renderHook(() => useOnboardingProjectsQuery(params), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // 1 initial attempt + 2 retries
    expect(getOnboardingProjects).toHaveBeenCalledTimes(3);
  });
});
