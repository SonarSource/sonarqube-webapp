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

import { MetricKey } from '~shared/types/metrics';
import {
  getDashboardIssueCountHistory,
  getDashboardIssueDensityHistory,
  getDashboardIssueResolutionHistory,
  getDashboardMeasuresHistory,
  getDashboardProjectIssueCounts,
  getDashboardProjectMeasures,
  getDashboardScaResolutionHistory,
} from '../dashboard-history';

const mockGet = jest.fn();

jest.mock('~shared/helpers/axios-clients', () => ({
  axiosClient: { get: (...args: unknown[]) => mockGet(...args) },
}));

describe('dashboard history API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({});
  });

  it('serializes issue history filters', async () => {
    await getDashboardIssueCountHistory({
      entityId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      impacts: ['SECURITY:HIGH'],
      issueTypes: ['CODE_SMELL'],
      ruleKeys: ['java:S100'],
      severities: ['HIGH'],
      sliceBy: 'SEVERITY',
      startDate: '2026-01-01',
      statuses: ['OPEN'],
    });

    expect(mockGet).toHaveBeenCalledWith('/api/v2/history/issue-count-history', {
      params: {
        entityId: 'portfolio-1',
        entityType: 'PORTFOLIO',
        impacts: 'SECURITY:HIGH',
        issueTypes: 'CODE_SMELL',
        ruleKeys: 'java:S100',
        severities: 'HIGH',
        sliceBy: 'SEVERITY',
        startDate: '2026-01-01',
        statuses: 'OPEN',
      },
    });
  });

  it('serializes issue-density history filters', async () => {
    await getDashboardIssueDensityHistory({
      entityId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      impacts: ['SECURITY:HIGH'],
      severities: ['HIGH'],
      startDate: '2026-01-01',
    });

    expect(mockGet).toHaveBeenCalledWith('/api/v2/history/issue-density-history', {
      params: expect.objectContaining({
        entityId: 'portfolio-1',
        impacts: 'SECURITY:HIGH',
        severities: 'HIGH',
      }),
    });
  });

  it('serializes issue-resolution history filters and statistic', async () => {
    await getDashboardIssueResolutionHistory({
      entityId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      severities: ['HIGH'],
      startDate: '2026-01-01',
      statistic: 'MTTR',
    });

    expect(mockGet).toHaveBeenCalledWith('/api/v2/history/issue-resolution-history', {
      params: expect.objectContaining({
        entityId: 'portfolio-1',
        severities: 'HIGH',
        statistic: 'MTTR',
      }),
    });
  });

  it('serializes sca-resolution history severities and statistic', async () => {
    await getDashboardScaResolutionHistory({
      entityId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      severities: ['HIGH'],
      startDate: '2026-01-01',
      statistic: 'SCA_MTTR',
    });

    expect(mockGet).toHaveBeenCalledWith('/api/v2/history/sca-resolution-history', {
      params: expect.objectContaining({
        entityId: 'portfolio-1',
        severities: 'HIGH',
        statistic: 'SCA_MTTR',
      }),
    });
  });

  it('serializes metric and project filters for the Server history endpoints', async () => {
    await getDashboardMeasuresHistory({
      entityId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      metricKeys: [MetricKey.coverage, MetricKey.ncloc],
      startDate: '2026-01-01',
    });
    await getDashboardProjectIssueCounts({
      entityId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      impacts: ['SECURITY:HIGH'],
      issueTypes: ['BUG'],
      ruleKeys: ['java:S100'],
      severities: ['HIGH'],
      sort: ['issueCount'],
      statuses: ['OPEN'],
    });
    await getDashboardProjectMeasures({
      entityId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      metricKey: MetricKey.coverage,
      sort: ['currentValue'],
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/v2/history/measures-history', {
      params: {
        entityId: 'portfolio-1',
        entityType: 'PORTFOLIO',
        metricKeys: 'coverage,ncloc',
        startDate: '2026-01-01',
      },
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/v2/history/project-issue-counts', {
      params: {
        entityId: 'portfolio-1',
        entityType: 'PORTFOLIO',
        impacts: 'SECURITY:HIGH',
        issueTypes: 'BUG',
        ruleKeys: 'java:S100',
        severities: 'HIGH',
        sort: 'issueCount',
        statuses: 'OPEN',
      },
    });
    expect(mockGet).toHaveBeenNthCalledWith(3, '/api/v2/history/project-measures', {
      params: {
        entityId: 'portfolio-1',
        entityType: 'PORTFOLIO',
        metricKey: MetricKey.coverage,
        sort: 'currentValue',
      },
    });
  });
});
