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

import { useQueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import {
  getIssueCountHistory,
  getIssueDensityHistory,
  getIssueResolutionHistory,
  getProjectMeasures,
  getMeasuresHistory,
  getProjectIssueCounts,
} from '~sq-server-openapi-community';
import { axiosClient } from '~shared/helpers/axios-clients';
import { getDashboardScaResolutionHistory } from '../dashboard-history';
import { MetricKey } from '~shared/types/metrics';
import {
  getDashboardIssueCountHistoryQueryOptions,
  getDashboardIssueDensityHistoryQueryOptions,
  getDashboardIssueResolutionHistoryQueryOptions,
  useDashboardProjectMeasureQuery,
  getDashboardMeasuresHistoryQueryOptions,
  useDashboardProjectIssueCountsQuery,
} from '../../queries/dashboard-history';

jest.mock('~sq-server-openapi-community', () => ({
  getIssueCountHistory: jest.fn().mockResolvedValue({ data: {} }),
  getIssueDensityHistory: jest.fn().mockResolvedValue({ data: {} }),
  getIssueResolutionHistory: jest.fn().mockResolvedValue({ data: {} }),
  getProjectMeasures: jest.fn().mockResolvedValue({ data: {} }),
  getMeasuresHistory: jest.fn().mockResolvedValue({ data: {} }),
  getProjectIssueCounts: jest.fn().mockResolvedValue({ data: {} }),
}));

it('passes typed arrays directly to generated history and project clients', async () => {
  const { result: client } = renderHook(() => useQueryClient(), { wrapper: getContextWrapper() });
  const history = {
    entityId: 'portfolio-1',
    entityType: 'PORTFOLIO' as const,
    startDate: '2026-01-01',
  };
  const issueParams = {
    ...history,
    impacts: ['SECURITY:HIGH', 'RELIABILITY:LOW'],
    issueTypes: ['BUG', 'VULNERABILITY'],
    severities: ['HIGH', 'LOW'],
    ruleKeys: ['one', 'two'],
    statuses: ['OPEN', 'CONFIRMED'],
    typeSeverities: ['MAJOR', 'MINOR'],
  };
  await client.current.fetchQuery(getDashboardIssueCountHistoryQueryOptions(issueParams));
  await client.current.fetchQuery(getDashboardIssueDensityHistoryQueryOptions(issueParams));
  const resolutionParams = { ...issueParams, statistic: 'MTTR' as const };
  await client.current.fetchQuery(getDashboardIssueResolutionHistoryQueryOptions(resolutionParams));
  await client.current.fetchQuery(
    getDashboardMeasuresHistoryQueryOptions({
      ...history,
      metricKeys: [MetricKey.coverage, MetricKey.ncloc],
    }),
  );
  const { result } = renderHook(
    () =>
      useDashboardProjectIssueCountsQuery({ ...issueParams, sort: ['-issueCount', 'projectName'] }),
    { wrapper: getContextWrapper() },
  );
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  const measureParams = {
    ...history,
    metricKey: MetricKey.coverage,
    sort: ['-measure.currentValue', '+projectName'],
  };
  const { result: measures } = renderHook(() => useDashboardProjectMeasureQuery(measureParams), {
    wrapper: getContextWrapper(),
  });
  await waitFor(() => {
    expect(measures.current.isSuccess).toBe(true);
  });

  expect(getIssueCountHistory).toHaveBeenCalledWith({ query: issueParams });
  expect(getIssueDensityHistory).toHaveBeenCalledWith({ query: issueParams });
  expect(getIssueResolutionHistory).toHaveBeenCalledWith({ query: resolutionParams });
  expect(getMeasuresHistory).toHaveBeenCalledWith({
    query: { ...history, metricKeys: [MetricKey.coverage, MetricKey.ncloc] },
  });
  expect(getProjectIssueCounts).toHaveBeenCalledWith({
    query: { ...issueParams, sort: ['-issueCount', 'projectName'] },
  });
  expect(getProjectMeasures).toHaveBeenCalledWith({ query: measureParams });
});

it('keeps the SCA request on Axios with comma-separated severities', async () => {
  const response = { scaResolutionHistory: [], statistic: 'SCA_MTTR' };
  const get = jest.spyOn(axiosClient, 'get').mockResolvedValue(response);
  const params = {
    entityId: 'portfolio-1',
    entityType: 'PORTFOLIO' as const,
    startDate: '2026-01-01',
    statistic: 'SCA_MTTR' as const,
    severities: ['HIGH', 'LOW'],
  };
  try {
    await expect(getDashboardScaResolutionHistory(params)).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith('/api/v2/history/sca-resolution-history', {
      params: { ...params, severities: 'HIGH,LOW' },
    });
  } finally {
    get.mockRestore();
  }
});
