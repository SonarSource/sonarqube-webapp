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

// NOTE: These tests should be kept in sync with the cloud adapter tests in
// private/apps/sq-cloud/src/sq-cloud-adapters/helpers/__tests__/notices-test.tsx
// to ensure both adapters maintain feature parity.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import * as React from 'react';
import {
  CurrentUserContext,
  DismissNoticesUpdaterContext,
} from '../../../context/current-user/CurrentUserContext';
import { NoticeType } from '../../../types/users';
import { useDismissNotice, useIsNoticeDismissed } from '../notices';

jest.mock('../../../api/users', () => ({
  dismissNotice: jest.fn().mockResolvedValue(undefined),
}));

describe('SQS Notice Adapter Hooks', () => {
  describe('useIsNoticeDismissed', () => {
    it('should return false when notice is not dismissed', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          CurrentUserContext.Provider,
          {
            value: {
              currentUser: {
                isLoggedIn: true,
                dismissedNotices: {},
              },
              updateCurrentUserHomepage: jest.fn(),
            },
          },
          React.createElement(
            DismissNoticesUpdaterContext.Provider,
            {
              value: {
                updateDismissedNotices: jest.fn(),
              },
            },
            children,
          ),
        );

      const { result } = renderHook(() => useIsNoticeDismissed(NoticeType.SONARLINT_AD), {
        wrapper,
      });

      expect(result.current).toBe(false);
    });

    it('should return true when notice is dismissed', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          CurrentUserContext.Provider,
          {
            value: {
              currentUser: {
                isLoggedIn: true,
                dismissedNotices: { [NoticeType.SONARLINT_AD]: true },
              },
              updateCurrentUserHomepage: jest.fn(),
            },
          },
          React.createElement(
            DismissNoticesUpdaterContext.Provider,
            {
              value: {
                updateDismissedNotices: jest.fn(),
              },
            },
            children,
          ),
        );

      const { result } = renderHook(() => useIsNoticeDismissed(NoticeType.SONARLINT_AD), {
        wrapper,
      });

      expect(result.current).toBe(true);
    });
  });

  describe('useDismissNotice', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
      // eslint-disable-next-line local-rules/no-query-client-imports
      queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
    });

    afterEach(() => {
      queryClient.clear();
    });

    it('should return a dismissNotice function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useDismissNotice(), { wrapper });

      expect(result.current).toHaveProperty('dismissNotice');
      expect(typeof result.current.dismissNotice).toBe('function');
    });

    it('should successfully dismiss a notice when mutation succeeds', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useDismissNotice(), { wrapper });

      await expect(result.current.dismissNotice(NoticeType.SONARLINT_AD)).resolves.toBeUndefined();
    });

    it('should reject when the mutation fails', async () => {
      const dismissNoticeApi = jest.requireMock('../../../api/users').dismissNotice as jest.Mock;
      dismissNoticeApi.mockRejectedValueOnce(new Error('API error'));

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useDismissNotice(), { wrapper });

      await expect(result.current.dismissNotice(NoticeType.SONARLINT_AD)).rejects.toThrow(
        'API error',
      );
    });
  });
});
