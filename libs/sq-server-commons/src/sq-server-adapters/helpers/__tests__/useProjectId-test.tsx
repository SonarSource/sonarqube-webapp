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
import { useGetProjectQuery } from '../../../queries/project-managements';
// Relative import so we exercise the real adapter, bypassing the global `~adapters/helpers/useProjectId` jest mock.
import { useProjectId } from '../useProjectId';

jest.mock('../../../context/componentContext/withComponentContext', () => ({
  useComponent: jest.fn(),
}));

jest.mock('../../../queries/project-managements', () => ({
  useGetProjectQuery: jest.fn(),
}));

const mockedUseComponent = jest.mocked(useComponent);
const mockedUseGetProjectQuery = jest.mocked(useGetProjectQuery);

function mockComponentKey(key: string | undefined) {
  mockedUseComponent.mockReturnValue({ component: key ? { key } : undefined } as ReturnType<
    typeof useComponent
  >);
}

function mockProjectQuery(projectUuid: string | undefined) {
  mockedUseGetProjectQuery.mockReturnValue({
    data: projectUuid ? { projectUuid } : undefined,
  } as ReturnType<typeof useGetProjectQuery>);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useProjectId', () => {
  it('returns the project uuid and enables the query when a component key is present', () => {
    mockComponentKey('my-project');
    mockProjectQuery('project-uuid-1');

    const { result } = renderHook(() => useProjectId());

    expect(result.current).toBe('project-uuid-1');
    expect(mockedUseGetProjectQuery).toHaveBeenCalledWith('my-project', { enabled: true });
  });

  it('disables the query and returns undefined when there is no component key', () => {
    mockComponentKey(undefined);
    mockProjectQuery(undefined);

    const { result } = renderHook(() => useProjectId());

    expect(result.current).toBeUndefined();
    expect(mockedUseGetProjectQuery).toHaveBeenCalledWith('', { enabled: false });
  });

  it('returns undefined when the query has no data yet', () => {
    mockComponentKey('my-project');
    mockProjectQuery(undefined);

    const { result } = renderHook(() => useProjectId());

    expect(result.current).toBeUndefined();
  });
});
