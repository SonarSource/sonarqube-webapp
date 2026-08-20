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
import { useAppState } from '../../../context/app-state/withAppStateContext';
// Relative imports so we exercise the real adapters, bypassing jest moduleNameMapper mocks.
import { DEFAULT_ORGANIZATION_ID } from '../../../constants/organizations';
import { useCanAdministrateEnterpriseArchitecture } from '../useCanAdministrateEnterpriseArchitecture';
import { useOrganizationId } from '../useOrganizationId';
import { useShowArchitectureOrgPagesInProjectNav } from '../useShowArchitectureOrgPagesInProjectNav';

jest.mock('../../../context/app-state/withAppStateContext', () => ({
  useAppState: jest.fn(),
}));

const mockedUseAppState = jest.mocked(useAppState);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCanAdministrateEnterpriseArchitecture', () => {
  it('returns true for global admins', () => {
    mockedUseAppState.mockReturnValue({ canAdmin: true } as ReturnType<typeof useAppState>);

    const { result } = renderHook(() => useCanAdministrateEnterpriseArchitecture());

    expect(result.current).toBe(true);
  });

  it('returns false when canAdmin is false or absent', () => {
    mockedUseAppState.mockReturnValue({ canAdmin: false } as ReturnType<typeof useAppState>);
    expect(renderHook(() => useCanAdministrateEnterpriseArchitecture()).result.current).toBe(false);

    mockedUseAppState.mockReturnValue({} as ReturnType<typeof useAppState>);
    expect(renderHook(() => useCanAdministrateEnterpriseArchitecture()).result.current).toBe(false);
  });
});

describe('useOrganizationId', () => {
  it('always returns the default organization UUID used by the Server backend', () => {
    const { result } = renderHook(() => useOrganizationId());

    expect(result.current).toBe(DEFAULT_ORGANIZATION_ID);
  });
});

describe('useShowArchitectureOrgPagesInProjectNav', () => {
  it('is always enabled on Server (no organization sidebar)', () => {
    const { result } = renderHook(() => useShowArchitectureOrgPagesInProjectNav());

    expect(result.current).toBe(true);
  });
});
