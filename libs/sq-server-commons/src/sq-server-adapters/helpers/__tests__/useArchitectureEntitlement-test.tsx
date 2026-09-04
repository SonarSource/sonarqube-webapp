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

import { renderHook } from '@testing-library/react';
import { mockCurrentUser, mockLoggedInUser } from '../../../helpers/testMocks';
import { useIsEnterpriseTier } from '../plan';
import { useCurrentUser } from '../users';
// Relative import so we exercise the real adapter, bypassing the global
// `~adapters/helpers/useArchitectureEntitlement` jest mock.
import { useArchitectureEntitlement } from '../useArchitectureEntitlement';

jest.mock('../users', () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock('../plan', () => ({
  useIsEnterpriseTier: jest.fn(),
}));

const mockedUseCurrentUser = jest.mocked(useCurrentUser);
const mockedUseIsEnterpriseTier = jest.mocked(useIsEnterpriseTier);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useArchitectureEntitlement', () => {
  it('grants access to logged-in users on an Enterprise instance', () => {
    mockedUseCurrentUser.mockReturnValue({
      currentUser: mockLoggedInUser(),
      isLoggedIn: true,
    });
    mockedUseIsEnterpriseTier.mockReturnValue(true);

    const { result } = renderHook(() => useArchitectureEntitlement());

    expect(result.current).toEqual({ allowed: true, isLoading: false });
  });

  it('denies access on a non-Enterprise instance', () => {
    mockedUseCurrentUser.mockReturnValue({
      currentUser: mockLoggedInUser(),
      isLoggedIn: true,
    });
    mockedUseIsEnterpriseTier.mockReturnValue(false);

    const { result } = renderHook(() => useArchitectureEntitlement());

    expect(result.current).toEqual({ allowed: false, isLoading: false });
  });

  it('denies access to logged-out users', () => {
    mockedUseCurrentUser.mockReturnValue({
      currentUser: mockCurrentUser(),
      isLoggedIn: false,
    });
    mockedUseIsEnterpriseTier.mockReturnValue(true);

    const { result } = renderHook(() => useArchitectureEntitlement());

    expect(result.current).toEqual({ allowed: false, isLoading: false });
  });
});
