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
import { MetricKey } from '~shared/types/metrics';
import {
  getDashboardIssueCountHistory,
  getDashboardMeasuresHistory,
} from '../../api/dashboard-history';
import {
  useDashboardIssueCountHistoryQuery,
  useDashboardMeasuresHistoryQuery,
} from '../dashboard-history';

jest.mock('../../api/dashboard-history', () => ({
  ...jest.requireActual<typeof import('../../api/dashboard-history')>(
    '../../api/dashboard-history',
  ),
  getDashboardIssueCountHistory: jest.fn(),
  getDashboardMeasuresHistory: jest.fn(),
}));

const historyParams = {
  entityId: 'branch-id',
  entityType: 'PROJECT_BRANCH' as const,
  startDate: '2026-01-01T00:00:00.000Z',
};

describe('dashboard history queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes nullable issue history rows and distribution entries', async () => {
    jest.mocked(getDashboardIssueCountHistory).mockResolvedValue({
      issueCountHistory: [
        {
          date: null,
          distribution: [{ key: 'BUG', value: 3 }],
        },
        {
          date: '2026-01-02',
          distribution: [
            { key: 'BUG', value: 3 },
            { key: null, value: 1 },
            { key: 'CODE_SMELL', value: null },
          ],
        },
      ],
    });

    const { result } = renderHook(() => useDashboardIssueCountHistoryQuery(historyParams), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      issueCountHistory: [{ date: '2026-01-02', distribution: [{ key: 'BUG', value: 3 }] }],
    });
  });

  it('normalizes nullable measure fields and supplies an empty type', async () => {
    jest.mocked(getDashboardMeasuresHistory).mockResolvedValue({
      measuresHistory: [
        {
          date: '2026-01-04',
          measures: [
            { metric: MetricKey.coverage, type: null, value: '80' },
            { metric: null, type: 'integer', value: '3' },
            { metric: MetricKey.bugs, type: 'integer', value: null },
          ],
        },
      ],
    });

    const { result } = renderHook(
      () =>
        useDashboardMeasuresHistoryQuery({
          ...historyParams,
          metricKeys: [MetricKey.coverage, MetricKey.bugs],
        }),
      {
        wrapper: getContextWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      measuresHistory: [
        {
          date: '2026-01-04',
          measures: [{ metric: MetricKey.coverage, type: '', value: '80' }],
        },
      ],
    });
  });
});
