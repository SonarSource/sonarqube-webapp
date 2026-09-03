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

import { act, renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { getFixSuggestionsIssues } from '../../api/fix-suggestions';
import { mockIssue, mockLoggedInUser } from '../../helpers/testMocks';
import { Feature } from '../../types/features';
import { useComponentDataQuery } from '../component';
import { useGetFixSuggestionsIssuesQuery } from '../fix-suggestions';

jest.mock('../../api/fix-suggestions', () => ({
  ...jest.requireActual<typeof import('../../api/fix-suggestions')>('../../api/fix-suggestions'),
  getFixSuggestionsIssues: jest.fn(),
}));

jest.mock('../component', () => ({
  ...jest.requireActual<typeof import('../component')>('../component'),
  useComponentDataQuery: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useComponentDataQuery).mockReturnValue({
    data: { component: { isAiCodeFixEnabled: true } },
  } as ReturnType<typeof useComponentDataQuery>);
  jest.mocked(getFixSuggestionsIssues).mockResolvedValue({ aiSuggestion: 'AVAILABLE', id: 'id1' });
});

const wrapper = getContextWrapper({
  availableFeatures: [Feature.FixSuggestions],
  initialCurrentUser: mockLoggedInUser(),
});

describe('useGetFixSuggestionsIssuesQuery', () => {
  it('fetches the fix suggestion for a regular issue', async () => {
    const issue = mockIssue();

    const { result } = renderHook(() => useGetFixSuggestionsIssuesQuery(issue), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getFixSuggestionsIssues).toHaveBeenCalledWith({ issueId: issue.key });
    expect(result.current.data?.aiSuggestion).toBe('AVAILABLE');
  });

  it('does not fetch for a Hunter Agent issue', async () => {
    const issue = mockIssue(false, { externalRuleEngine: 'hunter-agent' });

    const { result } = renderHook(() => useGetFixSuggestionsIssuesQuery(issue), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.isPending).toBe(true);

    // flush any pending microtasks so a wrongly-enabled query would have started
    await act(async () => {
      await Promise.resolve();
    });

    expect(getFixSuggestionsIssues).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});
