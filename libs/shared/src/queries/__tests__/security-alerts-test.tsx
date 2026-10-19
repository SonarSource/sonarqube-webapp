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
import { getNewestSecurityAlert } from '../../api/security-alerts';
import { SecurityAlertSearchResponse } from '../../types/security-alert';
import { useNewestSecurityAlertQuery } from '../security-alerts';

jest.mock('../../api/security-alerts', () => ({
  getNewestSecurityAlert: jest.fn(),
}));

const ALERT_RESPONSE: SecurityAlertSearchResponse = {
  page: { pageIndex: 1, pageSize: 1, total: 0 },
  securityAlerts: [],
};

let queryClient: QueryClient;

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  // eslint-disable-next-line local-rules/no-query-client-imports
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  jest.clearAllMocks();
  jest.mocked(getNewestSecurityAlert).mockResolvedValue(ALERT_RESPONSE);
});

it('fetches the newest alert using an organization-specific query key', async () => {
  const { result } = renderHook(() => useNewestSecurityAlertQuery('org-1'), { wrapper: Wrapper });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(getNewestSecurityAlert).toHaveBeenCalled();
  expect(
    queryClient
      .getQueryCache()
      .getAll()
      .map(({ queryKey }) => queryKey),
  ).toContainEqual(['security-alerts', 'banner', 'org-1']);
  expect(result.current.data).toEqual(ALERT_RESPONSE);
});

it('fetches the newest alert using the default query key without an organization key', async () => {
  const { result } = renderHook(() => useNewestSecurityAlertQuery(undefined), { wrapper: Wrapper });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(getNewestSecurityAlert).toHaveBeenCalled();
  expect(
    queryClient
      .getQueryCache()
      .getAll()
      .map(({ queryKey }) => queryKey),
  ).toContainEqual(['security-alerts', 'banner']);
  expect(result.current.data).toEqual(ALERT_RESPONSE);
});
