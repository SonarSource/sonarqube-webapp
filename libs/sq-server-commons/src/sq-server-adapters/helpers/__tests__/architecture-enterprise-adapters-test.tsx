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
import { AvailableFeaturesContext } from '../../../context/available-features/AvailableFeaturesContext';
import { CurrentUserContext } from '../../../context/current-user/CurrentUserContext';
import { mockCurrentUser, mockLoggedInUser } from '../../../helpers/testMocks';
import { useGetValueQuery, useSaveSimpleValueMutation } from '../../../queries/settings';
import { Feature } from '../../../types/features';
import { Permissions } from '../../../types/permissions';
import { SettingsKey } from '../../../types/settings';
import { CurrentUser } from '../../../types/users';
import { useArchitectureEntitlement } from '../useArchitectureEntitlement';
import {
  useArchitectureFlags,
  useSetArchitectureEnterpriseEnabledMutation,
} from '../useArchitectureFlags';
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

    expect(renderWithUser(user).result.current).toBe(true);
  });

  it('denies access to an instance admin who lacks the permission', () => {
    const user = mockLoggedInUser({ permissions: { global: [Permissions.Admin] } });

    expect(renderWithUser(user).result.current).toBe(false);
  });

  it('denies access when the user carries no permissions payload', () => {
    expect(renderWithUser(mockLoggedInUser()).result.current).toBe(false);
  });

  it('denies access to anonymous users', () => {
    expect(renderWithUser(mockCurrentUser({ isLoggedIn: false })).result.current).toBe(false);
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
