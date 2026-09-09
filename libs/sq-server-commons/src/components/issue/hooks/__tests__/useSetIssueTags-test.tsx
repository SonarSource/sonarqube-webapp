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
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { setIssueTags } from '../../../../api/issues';
import { ComponentContext } from '../../../../context/componentContext/ComponentContext';
import { mockComponent } from '../../../../helpers/mocks/component';
import { mockIssue } from '../../../../helpers/testMocks';
import { IssueActions, IssueResponse } from '../../../../types/issues';
import { Component } from '../../../../types/types';
import { useSetIssueTags } from '../useSetIssueTags';

jest.mock('../../../../api/issues', () => ({
  setIssueTags: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function wrapper(component?: Component) {
  return function Wrapper({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return (
      <QueryClientProvider client={queryClient}>
        <ComponentContext.Provider
          value={{
            component,
            onComponentChange: jest.fn(),
            fetchComponent: jest.fn(),
          }}
        >
          {children}
        </ComponentContext.Provider>
      </QueryClientProvider>
    );
  };
}

describe('useSetIssueTags', () => {
  describe('canSetTags', () => {
    it('is false when the issue actions do not include set_tags', () => {
      const issue = mockIssue(false, { actions: [IssueActions.Assign] });

      const { result } = renderHook(() => useSetIssueTags(issue, jest.fn()), {
        wrapper: wrapper(mockComponent()),
      });

      expect(result.current.canSetTags).toBe(false);
    });

    it('is true when the issue actions include set_tags and needIssueSync is false', () => {
      const issue = mockIssue(false, { actions: [IssueActions.SetTags] });

      const { result } = renderHook(() => useSetIssueTags(issue, jest.fn()), {
        wrapper: wrapper(mockComponent({ needIssueSync: false })),
      });

      expect(result.current.canSetTags).toBe(true);
    });

    it('is false when needIssueSync is true even if set_tags action is present', () => {
      const issue = mockIssue(false, { actions: [IssueActions.SetTags] });

      const { result } = renderHook(() => useSetIssueTags(issue, jest.fn()), {
        wrapper: wrapper(mockComponent({ needIssueSync: true })),
      });

      expect(result.current.canSetTags).toBe(false);
    });

    it('is true when component is undefined and set_tags action is present', () => {
      const issue = mockIssue(false, { actions: [IssueActions.SetTags] });

      const { result } = renderHook(() => useSetIssueTags(issue, jest.fn()), {
        wrapper: wrapper(undefined),
      });

      expect(result.current.canSetTags).toBe(true);
    });
  });

  describe('setTags', () => {
    it('calls setIssueTags with the issue key and comma-joined tags', async () => {
      const issue = mockIssue(false, { key: 'my-issue-key', tags: ['old-tag'] });
      const onChange = jest.fn();
      jest.mocked(setIssueTags).mockResolvedValue({} as IssueResponse);

      const { result } = renderHook(() => useSetIssueTags(issue, onChange), {
        wrapper: wrapper(mockComponent()),
      });

      act(() => {
        result.current.setTags(['tag-a', 'tag-b']);
      });

      await waitFor(() => {
        expect(setIssueTags).toHaveBeenCalledWith({
          issue: 'my-issue-key',
          tags: 'tag-a,tag-b',
        });
      });
    });

    it('passes an empty string when the tags array is empty', async () => {
      const issue = mockIssue();
      jest.mocked(setIssueTags).mockResolvedValue({} as IssueResponse);

      const { result } = renderHook(() => useSetIssueTags(issue, jest.fn()), {
        wrapper: wrapper(mockComponent()),
      });

      act(() => {
        result.current.setTags([]);
      });

      await waitFor(() => {
        expect(setIssueTags).toHaveBeenCalledWith(expect.objectContaining({ tags: '' }));
      });
    });

    it('optimistically applies the new tags before the request resolves', () => {
      const issue = mockIssue(false, { tags: ['old-tag'] });
      const onChange = jest.fn();
      jest.mocked(setIssueTags).mockReturnValue(new Promise<IssueResponse>(() => {}));

      const { result } = renderHook(() => useSetIssueTags(issue, onChange), {
        wrapper: wrapper(mockComponent()),
      });

      act(() => {
        result.current.setTags(['new-tag']);
      });

      expect(onChange).toHaveBeenCalledWith({ ...issue, tags: ['new-tag'] });
    });

    it('rolls back to the original issue when the request fails', async () => {
      const issue = mockIssue(false, { tags: ['old-tag'] });
      const onChange = jest.fn();
      jest.mocked(setIssueTags).mockRejectedValue(new Error('boom'));

      const { result } = renderHook(() => useSetIssueTags(issue, onChange), {
        wrapper: wrapper(mockComponent()),
      });

      act(() => {
        result.current.setTags(['new-tag']);
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenLastCalledWith(issue);
      });
    });
  });
});
