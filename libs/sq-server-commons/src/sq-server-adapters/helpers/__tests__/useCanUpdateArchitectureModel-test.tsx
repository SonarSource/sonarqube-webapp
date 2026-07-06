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
import { useComponent } from '../../../context/componentContext/withComponentContext';
// Relative import so we exercise the real adapter, bypassing the global
// `~adapters/helpers/useCanUpdateArchitectureModel` jest mock.
import { useCanUpdateArchitectureModel } from '../useCanUpdateArchitectureModel';

jest.mock('../../../context/componentContext/withComponentContext', () => ({
  useComponent: jest.fn(),
}));

const mockedUseComponent = jest.mocked(useComponent);

function mockCanAdminArchitecture(canAdminArchitecture: boolean | undefined) {
  mockedUseComponent.mockReturnValue({
    component: { configuration: { canAdminArchitecture } },
  } as ReturnType<typeof useComponent>);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCanUpdateArchitectureModel', () => {
  it('returns true when the user has the architectureadmin permission', () => {
    mockCanAdminArchitecture(true);

    const { result } = renderHook(() => useCanUpdateArchitectureModel());

    expect(result.current).toBe(true);
  });

  it('returns false when the user does not have the architectureadmin permission', () => {
    mockCanAdminArchitecture(false);

    const { result } = renderHook(() => useCanUpdateArchitectureModel());

    expect(result.current).toBe(false);
  });

  it('returns false when the flag is absent from the configuration', () => {
    mockCanAdminArchitecture(undefined);

    const { result } = renderHook(() => useCanUpdateArchitectureModel());

    expect(result.current).toBe(false);
  });

  it('returns false when there is no component', () => {
    mockedUseComponent.mockReturnValue({ component: undefined } as ReturnType<typeof useComponent>);

    const { result } = renderHook(() => useCanUpdateArchitectureModel());

    expect(result.current).toBe(false);
  });
});
