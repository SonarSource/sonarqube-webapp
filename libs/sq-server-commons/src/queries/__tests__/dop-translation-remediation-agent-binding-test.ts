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

import { renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { getDopPermissionChecks } from '../../api/dop-translation';
import { AlmKeys } from '../../types/alm-settings';
import { InstallationCheckStatus, PermissionCheckStatus } from '../../types/dop-translation';
import { useRemediationAgentBindingSupport } from '../dop-translation';

jest.mock('../../api/dop-translation', () => ({
  ...jest.requireActual<typeof import('../../api/dop-translation')>('../../api/dop-translation'),
  getDopPermissionChecks: jest.fn(),
}));

const mockGetDopPermissionChecks = jest.mocked(getDopPermissionChecks);

beforeEach(() => {
  jest.clearAllMocks();
});

function renderBindingSupport(enabled = true) {
  return renderHook(
    () => useRemediationAgentBindingSupport({ projectKey: 'my-project', enabled }),
    { wrapper: getContextWrapper() },
  );
}

it('reports supported when the binding has a check', async () => {
  mockGetDopPermissionChecks.mockResolvedValue({
    permissionChecks: [
      {
        checkedAt: 1_700_000_000_000,
        key: 'github-config',
        type: AlmKeys.GitHub,
        status: PermissionCheckStatus.Sufficient,
      },
    ],
  });

  const { result } = renderBindingSupport();

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  expect(result.current.isSupported).toBe(true);
});

it('reports unsupported when the binding has no check (unbound or an unsupported ALM)', async () => {
  mockGetDopPermissionChecks.mockResolvedValue({ permissionChecks: [] });

  const { result } = renderBindingSupport();

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  expect(result.current.isSupported).toBe(false);
});

it('reports unsupported when the only check is NOT_RUN (project has no bound repository)', async () => {
  // NOT_RUN can still carry status: SUFFICIENT — that combination means the check never
  // actually ran, not that the project has a real, working binding.
  mockGetDopPermissionChecks.mockResolvedValue({
    permissionChecks: [
      {
        checkedAt: 1_700_000_000_000,
        key: 'github-config',
        type: AlmKeys.GitHub,
        status: PermissionCheckStatus.Sufficient,
        installationCheckStatus: InstallationCheckStatus.NotRun,
      },
    ],
  });

  const { result } = renderBindingSupport();

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  expect(result.current.isSupported).toBe(false);
});

it('fails open while the request is still loading, rather than hiding Remediation Agent', async () => {
  let resolveRequest: (value: { permissionChecks: [] }) => void = () => {};
  mockGetDopPermissionChecks.mockReturnValue(
    new Promise((resolve) => {
      resolveRequest = resolve;
    }),
  );

  const { result } = renderBindingSupport();

  expect(result.current.isLoading).toBe(true);
  expect(result.current.isSupported).toBe(true);

  // Settle the request so the hook doesn't leave a pending promise dangling past the test.
  resolveRequest({ permissionChecks: [] });
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});

it('fails open when the request itself errors, rather than hiding Remediation Agent', async () => {
  mockGetDopPermissionChecks.mockRejectedValue(new Error('network error'));

  const { result } = renderBindingSupport();

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  expect(result.current.isSupported).toBe(true);
});

it('does not fetch when disabled', () => {
  renderBindingSupport(false);

  expect(mockGetDopPermissionChecks).not.toHaveBeenCalled();
});
