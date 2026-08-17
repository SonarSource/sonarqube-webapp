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
import { MetricKey, MetricType } from '~shared/types/metrics';
import { useSonarSourceSecurityCategoriesQuery } from '../security-standards';
import {
  usePortfolioWidgetMetricMetadataQuery,
  useWidgetMetricMetadataQuery,
} from '../widget-metric-metadata';
import { useDashboardRuleLabels } from '../widget-rule-metadata';

const mockGetAllMetrics = jest.fn();
const mockGetStandards = jest.fn();
const mockUseListRulesQuery = jest.fn();

jest.mock('../../../api/metrics', () => ({
  ...jest.requireActual<typeof import('../../../api/metrics')>('../../../api/metrics'),
  getAllMetrics: (...args: unknown[]) => mockGetAllMetrics(...args),
}));

jest.mock('~shared/helpers/security-standards', () => ({
  ...jest.requireActual<typeof import('~shared/helpers/security-standards')>(
    '~shared/helpers/security-standards',
  ),
  getStandards: (...args: unknown[]) => mockGetStandards(...args),
}));

jest.mock('../../../queries/rules', () => ({
  useListRulesQuery: (...args: unknown[]) => mockUseListRulesQuery(...args),
}));

describe('dashboard metadata queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllMetrics.mockResolvedValue([
      { direction: 1, key: MetricKey.coverage, type: MetricType.Percent },
    ]);
    mockGetStandards.mockResolvedValue({
      sonarsourceSecurity: { 'sql-injection': { title: 'SQL Injection' } },
    });
    mockUseListRulesQuery.mockReturnValue({ data: undefined, isError: false, isPending: false });
  });

  it('loads and keys widget metric metadata', async () => {
    const { result } = renderHook(() => useWidgetMetricMetadataQuery(), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual({
      [MetricKey.coverage]: { direction: 1, key: MetricKey.coverage, type: MetricType.Percent },
    });

    const portfolioResult = renderHook(() => usePortfolioWidgetMetricMetadataQuery(), {
      wrapper: getContextWrapper(),
    });
    await waitFor(() => {
      expect(portfolioResult.result.current.data).toBeDefined();
    });
    expect(portfolioResult.result.current.data).toEqual({
      metrics: [{ direction: '1', key: MetricKey.coverage, type: MetricType.Percent }],
    });
  });

  it('loads SonarSource security categories with a long stale time', async () => {
    const { result } = renderHook(() => useSonarSourceSecurityCategoriesQuery(), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual({ 'sql-injection': { title: 'SQL Injection' } });
  });

  it('filters aggregated rule labels and exposes query state', () => {
    mockUseListRulesQuery.mockImplementation(
      (_params: unknown, options: { select: (data: unknown) => unknown }) => ({
        data: options.select({ rules: [{ key: 'java:S1', langName: 'Java', name: 'Rule 1' }] }),
        isError: false,
        isPending: false,
      }),
    );

    const { result } = renderHook(
      () =>
        useDashboardRuleLabels({
          entity: { organization: '', type: 'PROJECT' },
          ruleKeys: ['java:S1', 'OTHER_2'],
        }),
      { wrapper: getContextWrapper() },
    );

    expect(result.current).toEqual({
      isError: false,
      isPending: false,
      organization: undefined,
      rulesByKey: { 'java:S1': { langName: 'Java', name: 'Rule 1' } },
    });
    expect(mockUseListRulesQuery).toHaveBeenCalledWith(
      { ps: 1, rule_key: 'java:S1' },
      expect.objectContaining({ enabled: true }),
    );
  });
});
