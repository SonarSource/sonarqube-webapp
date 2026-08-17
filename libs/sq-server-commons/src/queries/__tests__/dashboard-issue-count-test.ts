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
import { searchIssues } from '../../api/issues';
import { CodeScope } from '../../sq-server-adapters/helpers/dashboard-widget-data';
import { useIssueCountSearchQuery } from '../dashboard-issue-count';

jest.mock('../../api/issues', () => ({
  ...jest.requireActual<typeof import('../../api/issues')>('../../api/issues'),
  searchIssues: jest.fn(),
}));

describe('dashboard issue count queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the total from the Server issue search endpoint', async () => {
    jest.mocked(searchIssues).mockResolvedValue({ paging: { total: 7 } } as never);

    const { result } = renderHook(
      () =>
        useIssueCountSearchQuery({
          componentKey: 'project-1',
          scope: CodeScope.New,
        }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toBe(7);
    expect(searchIssues).toHaveBeenCalledWith(
      expect.objectContaining({ componentKeys: 'project-1', sinceLeakPeriod: true, ps: 1 }),
    );
  });
});
