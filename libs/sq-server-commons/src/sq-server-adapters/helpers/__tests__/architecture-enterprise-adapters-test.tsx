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
import { renderHook } from '@testing-library/react';
import { useFlags } from '~adapters/helpers/feature-flags';
import { ensure } from '~shared/helpers/types';
import { AvailableFeaturesContext } from '../../../context/available-features/AvailableFeaturesContext';
import { CurrentUserContext } from '../../../context/current-user/CurrentUserContext';
import { mockCurrentUser, mockLoggedInUser } from '../../../helpers/testMocks';
import { useGetValueQuery, useSaveSimpleValueMutation } from '../../../queries/settings';
import { Feature } from '../../../types/features';
import { Permissions } from '../../../types/permissions';
import { SettingsKey } from '../../../types/settings';
import { CurrentUser } from '../../../types/users';
import { getContextWrapper } from '../test-utils';
import {
  useAllowIssueAdminToEditArchitecture,
  useSetAllowIssueAdminToEditArchitectureMutation,
} from '../useAllowIssueAdminToEditArchitecture';
import { useArchitectureEntitlement } from '../useArchitectureEntitlement';
import {
  useArchitectureFlags,
  useSetArchitectureEnterpriseEnabledMutation,
} from '../useArchitectureFlags';
import { useArchitectureModelLocation } from '../useArchitectureModelLocation';
import { useCanAdministrateArchitectureGlobally } from '../useCanAdministrateArchitectureGlobally';
import { useIsArchitectureFeatureAdvertised } from '../useIsArchitectureFeatureAdvertised';

jest.mock('../../../queries/settings', () => ({
  useGetValueQuery: jest.fn(),
  useSaveSimpleValueMutation: jest.fn(),
}));

jest.mock('~adapters/helpers/feature-flags', () => ({
  useFlags: jest.fn(),
}));

jest.mock('../useArchitectureEntitlement', () => ({
  useArchitectureEntitlement: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useGetValueQuery)
    .mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useGetValueQuery>);
  jest
    .mocked(useFlags)
    .mockReturnValue({ designArchitectureSquadExtensionPack: true } as unknown as ReturnType<
      typeof useFlags
    >);
  jest
    .mocked(useArchitectureEntitlement)
    .mockReturnValue({ isEntitledToArchitecture: true, isLoading: false });
});

describe('useCanAdministrateArchitectureGlobally', () => {
  function renderWithUser(currentUser: CurrentUser) {
    return renderHook(() => useCanAdministrateArchitectureGlobally(), {
      wrapper: ({ children }) => (
        <CurrentUserContext.Provider value={{ currentUser, updateCurrentUserHomepage: jest.fn() }}>
          {children}
        </CurrentUserContext.Provider>
      ),
    });
  }

  it('grants access to holders of the instance-scoped architectureadmin permission', () => {
    const user = mockLoggedInUser({
      permissions: { global: [Permissions.ArchitectureAdmin] },
    });

    expect(renderWithUser(user).result.current.canAdministrate).toBe(true);
  });

  it('denies access to an instance admin who lacks the permission', () => {
    const user = mockLoggedInUser({ permissions: { global: [Permissions.Admin] } });

    expect(renderWithUser(user).result.current.canAdministrate).toBe(false);
  });

  it('denies access when the user carries no permissions payload', () => {
    expect(renderWithUser(mockLoggedInUser()).result.current.canAdministrate).toBe(false);
  });

  it('denies access to anonymous users', () => {
    expect(
      renderWithUser(mockCurrentUser({ isLoggedIn: false })).result.current.canAdministrate,
    ).toBe(false);
  });
});

describe('useIsArchitectureFeatureAdvertised', () => {
  it('returns true when the backend advertises the Architecture feature', () => {
    const { result } = renderHook(() => useIsArchitectureFeatureAdvertised(), {
      wrapper: ({ children }) => (
        <AvailableFeaturesContext.Provider value={[Feature.Architecture]}>
          {children}
        </AvailableFeaturesContext.Provider>
      ),
    });

    expect(result.current).toBe(true);
  });

  it('returns false when the backend does not advertise the Architecture feature', () => {
    const { result } = renderHook(() => useIsArchitectureFeatureAdvertised(), {
      wrapper: ({ children }) => (
        <AvailableFeaturesContext.Provider value={[]}>{children}</AvailableFeaturesContext.Provider>
      ),
    });

    expect(result.current).toBe(false);
  });
});

describe('useArchitectureFlags', () => {
  function renderArchitectureFlags(availableFeatures: Feature[] = [Feature.Architecture]) {
    return renderHook(() => useArchitectureFlags(), {
      wrapper: ({ children }) => (
        <AvailableFeaturesContext.Provider value={availableFeatures}>
          {children}
        </AvailableFeaturesContext.Provider>
      ),
    });
  }

  it('defaults architectureEnterpriseEnabled to true when the setting has no value', () => {
    jest
      .mocked(useGetValueQuery)
      .mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useGetValueQuery>);

    const { result } = renderArchitectureFlags();

    expect(result.current.architectureEnterpriseEnabled).toBe(true);
  });

  it('sets architectureEnterpriseEnabled to false only when explicitly set to false', () => {
    jest.mocked(useGetValueQuery).mockReturnValue({
      data: { key: 'sonar.architecture.enterprise.enabled', value: 'false' },
    } as unknown as ReturnType<typeof useGetValueQuery>);

    const { result } = renderArchitectureFlags();

    expect(result.current.architectureEnterpriseEnabled).toBe(false);
  });

  it('does not fetch the setting when the extension-pack flag is off', () => {
    jest
      .mocked(useFlags)
      .mockReturnValue({ designArchitectureSquadExtensionPack: false } as unknown as ReturnType<
        typeof useFlags
      >);

    const { result } = renderArchitectureFlags();

    expect(useGetValueQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ enabled: false }),
    );
    expect(result.current.architectureEnterpriseEnabled).toBe(false);
  });

  it('does not fetch the setting when the user lacks the architecture entitlement', () => {
    jest
      .mocked(useArchitectureEntitlement)
      .mockReturnValue({ isEntitledToArchitecture: false, isLoading: false });

    const { result } = renderArchitectureFlags();

    expect(useGetValueQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ enabled: false }),
    );
    expect(result.current.architectureEnterpriseEnabled).toBe(false);
  });

  it('does not fetch the setting when the backend does not advertise the feature', () => {
    const { result } = renderArchitectureFlags([]);

    expect(useGetValueQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ enabled: false }),
    );
    expect(result.current.architectureEnterpriseEnabled).toBe(false);
  });
});

describe('useSetArchitectureEnterpriseEnabledMutation', () => {
  it('saves the setting through the shared simple-value mutation', async () => {
    const mutateAsync = jest.fn().mockResolvedValue(undefined);
    jest.mocked(useSaveSimpleValueMutation).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useSaveSimpleValueMutation>);

    const queryClient = new QueryClient();
    const { result } = renderHook(() => useSetArchitectureEnterpriseEnabledMutation(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });
    await result.current.mutateAsync(false);

    expect(mutateAsync).toHaveBeenCalledWith({
      key: SettingsKey.ArchitectureEnterpriseEnabled,
      value: 'false',
    });
  });
});

describe('useAllowIssueAdminToEditArchitecture', () => {
  const setting = (value: string) => ({
    key: SettingsKey.ArchitectureAllowIssueAdminToEdit,
    value,
  });

  it.each([
    ['false', setting('false'), false],
    ['true', setting('true'), true],
    ['no value', undefined, true],
  ])('maps the setting (%s) to allowIssueAdminToEdit=%s', (_label, data, expected) => {
    jest.mocked(useGetValueQuery).mockReturnValue({
      data,
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useGetValueQuery>);

    const { result } = renderHook(() => useAllowIssueAdminToEditArchitecture());

    expect(result.current).toEqual({
      allowIssueAdminToEdit: expected,
      isError: false,
      isLoading: false,
    });
    expect(useGetValueQuery).toHaveBeenCalledWith({
      key: SettingsKey.ArchitectureAllowIssueAdminToEdit,
    });
  });

  it('passes the loading state through', () => {
    jest.mocked(useGetValueQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useGetValueQuery>);

    expect(renderHook(() => useAllowIssueAdminToEditArchitecture()).result.current.isLoading).toBe(
      true,
    );
  });

  it('passes the error state through', () => {
    jest.mocked(useGetValueQuery).mockReturnValue({
      data: undefined,
      isError: true,
    } as unknown as ReturnType<typeof useGetValueQuery>);

    expect(renderHook(() => useAllowIssueAdminToEditArchitecture()).result.current.isError).toBe(
      true,
    );
  });
});

describe('useSetAllowIssueAdminToEditArchitectureMutation', () => {
  it('saves the setting through the shared simple-value mutation', async () => {
    const mutateAsync = jest.fn().mockResolvedValue(undefined);
    jest.mocked(useSaveSimpleValueMutation).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useSaveSimpleValueMutation>);

    const { result } = renderHook(() => useSetAllowIssueAdminToEditArchitectureMutation(), {
      wrapper: getContextWrapper(),
    });
    await result.current.mutateAsync(false);

    expect(mutateAsync).toHaveBeenCalledWith({
      key: SettingsKey.ArchitectureAllowIssueAdminToEdit,
      value: 'false',
    });
  });
});

describe('useArchitectureModelLocation', () => {
  function getSelect() {
    const [, options] = ensure(
      jest.mocked(useGetValueQuery).mock.lastCall,
      'useGetValueQuery was not called',
    );
    return options?.select as (setting: { key: string; value?: string } | null) => unknown;
  }

  it('reads the project setting', () => {
    renderHook(() => useArchitectureModelLocation('project-key'));

    expect(useGetValueQuery).toHaveBeenCalledWith(
      { component: 'project-key', key: 'sonar.architecture.model.location' },
      expect.objectContaining({ enabled: true }),
    );
  });

  it.each([
    ['SERVER', 'server'],
    ['FILE', 'file'],
    ['DYNAMIC', 'dynamic'],
    ['server', 'server'],
    ['unexpected', 'dynamic'],
    [undefined, 'dynamic'],
  ])('maps the setting value %s to %s', (value, expected) => {
    renderHook(() => useArchitectureModelLocation('project-key'));

    expect(getSelect()({ key: 'sonar.architecture.model.location', value })).toBe(expected);
  });

  it('falls back to dynamic when the setting has no value', () => {
    renderHook(() => useArchitectureModelLocation('project-key'));

    expect(getSelect()(null)).toBe('dynamic');
  });
});
