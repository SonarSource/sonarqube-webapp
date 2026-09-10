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
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { useLanguagesQuery } from '~shared/queries/languages';
import { useComponent } from '../../../context/componentContext/withComponentContext';
import {
  CodeScope,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartMetric,
} from '../../../helpers/dashboard-widget-data';
import { DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE } from '../../../helpers/unsupported-dashboard-widget-adapter';
import { useIssuesSearchQuery } from '../../../queries/issues';
import { useCurrentBranchQuery } from '../branch';
import { useProjectPieChartSegmentsSearchQuery } from '../project-pie-chart-widget-data';

jest.mock('../../../context/componentContext/withComponentContext', () => ({
  useComponent: jest.fn(),
}));

jest.mock('../../../queries/issues', () => ({
  useIssuesSearchQuery: jest.fn(),
}));

jest.mock('~shared/queries/languages', () => ({
  useLanguagesQuery: jest.fn(),
}));

jest.mock('../branch', () => ({
  useCurrentBranchQuery: jest.fn(),
}));

const mockUseComponent = jest.mocked(useComponent);
const mockUseIssuesSearchQuery = jest.mocked(useIssuesSearchQuery);
const mockUseLanguagesQuery = jest.mocked(useLanguagesQuery);
const mockUseCurrentBranchQuery = jest.mocked(useCurrentBranchQuery);

const widget = {
  filter: PieChartIssueFilter.Security,
  metric: PieChartMetric.IssueCount,
  scope: CodeScope.Overall,
  showLegend: true,
  slice: PieChartIssueSlice.Languages,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseComponent.mockReturnValue({
    component: undefined,
    fetchComponent: jest.fn().mockResolvedValue(undefined),
    onComponentChange: jest.fn(),
  });
  mockUseCurrentBranchQuery.mockReturnValue({
    data: { isMain: false, name: 'feature-branch' },
    error: null,
    isPending: false,
  } as ReturnType<typeof useCurrentBranchQuery>);
  mockUseLanguagesQuery.mockReturnValue({
    data: {
      java: { key: 'java', name: 'Java' },
      ts: { key: 'ts', name: 'TypeScript' },
    },
    error: null,
    isPending: false,
  } as ReturnType<typeof useLanguagesQuery>);
  mockUseIssuesSearchQuery.mockReturnValue({
    data: {
      facets: [
        {
          property: PieChartIssueSlice.Languages,
          values: [
            { count: 4, val: 'java' },
            { count: 2, val: 'ts' },
          ],
        },
      ],
    },
    error: null,
    isPending: false,
  } as ReturnType<typeof useIssuesSearchQuery>);
});

it('uses issue search to render security issues grouped by language', () => {
  const { result } = renderHook(
    () => useProjectPieChartSegmentsSearchQuery(widget, 'project-key'),
    { wrapper: getContextWrapper() },
  );

  expect(mockUseIssuesSearchQuery).toHaveBeenCalledWith(
    {
      branch: 'feature-branch',
      componentKeys: 'project-key',
      facets: PieChartIssueSlice.Languages,
      impactSoftwareQualities: 'SECURITY',
      issueStatuses: 'OPEN,CONFIRMED',
      ps: 1,
      sinceLeakPeriod: false,
    },
    { enabled: true },
  );

  expect(result.current.error).toBeNull();
  expect(result.current.isPending).toBe(false);
  expect(result.current.segments).toHaveLength(2);
  expect(result.current.segments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ count: 4, label: 'Java', percentage: '67', value: 'java' }),
      expect.objectContaining({
        count: 2,
        label: 'TypeScript',
        percentage: '33',
        value: 'ts',
      }),
    ]),
  );
});

it('keeps New-code issue language pie data unsupported', () => {
  expect(() =>
    renderHook(
      () =>
        useProjectPieChartSegmentsSearchQuery({ ...widget, scope: CodeScope.New }, 'project-key'),
      { wrapper: getContextWrapper() },
    ),
  ).toThrow(DASHBOARD_WIDGET_ADAPTER_UNAVAILABLE_MESSAGE);
});
