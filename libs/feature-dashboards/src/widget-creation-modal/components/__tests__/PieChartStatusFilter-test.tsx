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

import { screen } from '@testing-library/react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import {
  IssueStatus,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  type PieChartWidgetProps,
} from '../../../types/dashboard-widget';
import { CodeScope, VisualizationType } from '../../../types/widget-common';
import { widgetConfigReducer } from '../../state/reducers/widgetConfigReducer';
import { extractCompleteConfig } from '../../state/selectors/widgetConfigSelectors';
import type {
  PieChartConfig,
  WidgetConfigAction,
  WidgetConfigState,
} from '../../state/widgetConfigTypes';
import { ApplyFilterAccordion } from '../ApplyFilterAccordion';
import { createTestAccordion } from './accordionTestUtils';

const statusLabel = 'dashboard.add_widget_modal.apply_filters_section.select.status.label';
const Accordion = createTestAccordion();

function setup(
  widgetType:
    | typeof VisualizationType.PieChart
    | typeof VisualizationType.DonutChart = VisualizationType.PieChart,
  overrides: Partial<PieChartWidgetProps> = {},
  isPortfolioWidgetConfigurator = false,
) {
  const pieConfig: PieChartConfig = {
    complete: true,
    filter: '',
    metric: PieChartMetric.IssueCount,
    scope: CodeScope.Overall,
    showLegend: true,
    slice: PieChartIssueSlice.ImpactSeverities,
    ...overrides,
  };
  const state: WidgetConfigState = {
    configs: { [widgetType]: pieConfig },
    selectedType: widgetType,
  };
  const dispatch = jest.fn<undefined, [WidgetConfigAction]>();
  const result = renderWithRouter(
    <ApplyFilterAccordion
      Accordion={Accordion}
      applyFiltersAccordionOpen
      dispatch={dispatch}
      isPortfolioWidgetConfigurator={isPortfolioWidgetConfigurator}
      metricPickerOptions={{ countMetrics: [], ratingBadgeMetrics: [] }}
      setApplyFiltersAccordionOpen={jest.fn()}
      state={state}
    />,
  );
  return { ...result, dispatch, state };
}

it.each([IssueStatus.Open, IssueStatus.Confirmed, IssueStatus.Accepted, IssueStatus.FalsePositive])(
  'can select and save %s for an issue pie chart',
  async (status) => {
    const { user, dispatch, state } = setup();
    await user.click(screen.getByRole('combobox', { name: statusLabel }));
    await user.click(await screen.findByRole('option', { name: `issue.status.${status}` }));
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'SET_PIE_ISSUE_STATUSES',
      issueStatuses: [status],
    });
    const next = widgetConfigReducer(state, {
      type: 'SET_PIE_ISSUE_STATUSES',
      issueStatuses: [status],
    });
    expect(extractCompleteConfig(next)).toMatchObject({ issueStatuses: [status] });
  },
);

it.each([VisualizationType.PieChart, VisualizationType.DonutChart] as const)(
  'can return a %s to All from a single status',
  async (widgetType) => {
    const { user, dispatch, state } = setup(widgetType, { issueStatuses: [IssueStatus.Accepted] });
    await user.click(screen.getByRole('combobox', { name: statusLabel }));
    expect(
      await screen.findByRole('option', { name: 'issue.status.ACCEPTED', selected: true }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('option', {
        name: 'dashboard.add_widget_modal.apply_filters_section.software_quality.all',
      }),
    );
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'SET_PIE_ISSUE_STATUSES',
      issueStatuses: undefined,
    });
    const next = widgetConfigReducer(state, {
      type: 'SET_PIE_ISSUE_STATUSES',
      issueStatuses: undefined,
    });
    expect(extractCompleteConfig(next)).not.toHaveProperty('issueStatuses');
  },
);

it('offers status filtering for portfolio issue charts', async () => {
  const { user } = setup(VisualizationType.DonutChart, {}, true);
  await user.click(screen.getByRole('combobox', { name: statusLabel }));
  expect(await screen.findByRole('option', { name: 'issue.status.OPEN' })).toBeInTheDocument();
});

it('shows a stored status list and replaces it when a single status is selected', async () => {
  const { user, dispatch } = setup(VisualizationType.PieChart, {
    issueStatuses: [IssueStatus.Open, IssueStatus.Confirmed],
  });
  await user.click(screen.getByRole('combobox', { name: statusLabel }));
  expect(
    await screen.findByRole('option', {
      name: 'issue.status.OPEN, issue.status.CONFIRMED',
      selected: true,
    }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  await user.click(screen.getByRole('option', { name: 'issue.status.FALSE_POSITIVE' }));
  expect(dispatch).toHaveBeenLastCalledWith({
    type: 'SET_PIE_ISSUE_STATUSES',
    issueStatuses: [IssueStatus.FalsePositive],
  });
});

it.each([VisualizationType.PieChart, VisualizationType.DonutChart] as const)(
  'hides and clears the status filter when a %s switches to status slices',
  (widgetType) => {
    const { state } = setup(widgetType, { slice: PieChartIssueSlice.IssueStatuses });
    expect(screen.queryByRole('combobox', { name: statusLabel })).not.toBeInTheDocument();
    const severityState = widgetConfigReducer(state, {
      type: 'SET_PIE_SLICE',
      slice: PieChartIssueSlice.ImpactSeverities,
    });
    const filtered = widgetConfigReducer(severityState, {
      type: 'SET_PIE_ISSUE_STATUSES',
      issueStatuses: [IssueStatus.Open, IssueStatus.Confirmed],
    });
    const next = widgetConfigReducer(filtered, {
      type: 'SET_PIE_SLICE',
      slice: PieChartIssueSlice.IssueStatuses,
    });
    expect(next.configs[widgetType]?.issueStatuses).toBeUndefined();
    const attemptedFilter = widgetConfigReducer(next, {
      type: 'SET_PIE_ISSUE_STATUSES',
      issueStatuses: [IssueStatus.Accepted],
    });
    expect(attemptedFilter.configs[widgetType]?.issueStatuses).toBeUndefined();
    expect(extractCompleteConfig(attemptedFilter)).not.toHaveProperty('issueStatuses');
  },
);

it('does not offer code-issue statuses for hotspot charts', () => {
  setup(VisualizationType.PieChart, {
    metric: PieChartMetric.HotspotCount,
    slice: PieChartHotspotSlice.ReviewPriority,
  });
  expect(screen.queryByRole('combobox', { name: statusLabel })).not.toBeInTheDocument();
});

it('does not offer issue filters for line-count charts', () => {
  setup(VisualizationType.PieChart, {
    metric: PieChartMetric.LineCount,
    slice: PieChartLineSlice.Language,
  });
  expect(screen.queryByRole('combobox', { name: statusLabel })).not.toBeInTheDocument();
});

it.each([
  [VisualizationType.PieChart, PieChartMetric.HotspotCount],
  [VisualizationType.PieChart, PieChartMetric.LineCount],
  [VisualizationType.PieChart, PieChartMetric.ProjectCount],
  [VisualizationType.DonutChart, PieChartMetric.HotspotCount],
  [VisualizationType.DonutChart, PieChartMetric.LineCount],
  [VisualizationType.DonutChart, PieChartMetric.ProjectCount],
] as const)('clears issue statuses when a %s switches to %s', (widgetType, metric) => {
  const state: WidgetConfigState = {
    selectedType: widgetType,
    configs: {
      [widgetType]: {
        complete: true,
        filter: '',
        issueStatuses: [IssueStatus.Open, IssueStatus.Confirmed],
        metric: PieChartMetric.IssueCount,
        scope: CodeScope.Overall,
        showLegend: true,
        slice: PieChartIssueSlice.ImpactSeverities,
      },
    },
  };
  const next = widgetConfigReducer(state, { type: 'SET_PIE_METRIC', metric });
  expect(next.configs[widgetType]).toMatchObject({ metric, issueStatuses: undefined });
  const attemptedFilter = widgetConfigReducer(next, {
    type: 'SET_PIE_ISSUE_STATUSES',
    issueStatuses: [IssueStatus.Accepted],
  });
  expect(attemptedFilter.configs[widgetType]?.issueStatuses).toBeUndefined();
});
