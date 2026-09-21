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
import { createIntl } from 'react-intl';
import { safeParse } from 'valibot';
import type {
  WidgetBodyMap,
  WidgetHeaderMap,
} from '~feature-dashboards/dashboard-layout/logic/types';
import {
  projectDashboardWidgetPropsSchemaByType,
  type ProjectDashboardWidgetPropMap,
} from '~feature-dashboards/types/dashboard-widget';
import {
  VisualizationType,
  type DashboardWidgetType,
} from '~feature-dashboards/types/widget-common';
import {
  DashboardAddWidgetModal,
  DashboardAddWidgetModalMode,
} from '~feature-dashboards/widget-creation-modal/components/DashboardAddWidgetModal';
import {
  getWidgetCreationMatrix,
  getWidgetTypeCounts,
} from '~feature-dashboards/widget-creation-modal/state/__tests__/widgetCreationMatrix';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { ProjectWidgetOptions } from '../ProjectWidgetOptions';
import { getSqsProjectWidgetMetricPickerOptions } from '../projectWidgetMetricPickerOptions';

describe.each([false, true])('project widget creation matrix with SCA %s', (isScaEnabled) => {
  it('serializes every configuration reachable from the picker', () => {
    const configs = getWidgetCreationMatrix({
      isRatingBadgeBreakdownEligibleForMetric: () => false,
      metricPickerOptions: getSqsProjectWidgetMetricPickerOptions(
        createIntl({ locale: 'en' }),
        isScaEnabled,
      ),
    });

    expect(configs).not.toHaveLength(0);
    const widgetTypeCounts = getWidgetTypeCounts(configs);
    for (const widgetType of Object.values(VisualizationType) as DashboardWidgetType[]) {
      expect(widgetTypeCounts[widgetType]).toBeGreaterThan(0);
    }

    for (const { widgetType, ...props } of configs) {
      expect(safeParse(projectDashboardWidgetPropsSchemaByType[widgetType], props).success).toBe(
        true,
      );
    }
  });
});

describe('project widget creation modal', () => {
  const widgetBodyMap: WidgetBodyMap<ProjectDashboardWidgetPropMap> = {
    count: () => null,
    donutChart: () => null,
    lineChart: () => null,
    pieChart: () => null,
    ratingBadge: () => null,
    topList: () => null,
  };
  const widgetHeaderMap: WidgetHeaderMap<ProjectDashboardWidgetPropMap> = widgetBodyMap;

  it('creates a count widget selected from the project picker', async () => {
    const metricPickerOptions = getSqsProjectWidgetMetricPickerOptions(
      createIntl({ locale: 'en' }),
    );
    const coverageOption = metricPickerOptions.countMetrics
      .flatMap(({ items }) => items)
      .find(({ value }) => value === MetricKey.coverage);
    const onSaveWidget = jest.fn();
    const { user } = renderWithRouter(
      <DashboardAddWidgetModal
        isOpen
        metricPickerOptions={metricPickerOptions}
        mode={DashboardAddWidgetModalMode.Add}
        onOpenChange={jest.fn()}
        onSaveWidget={onSaveWidget}
        reducerOptions={{
          supportsNewCodeScopeForMetric: metricPickerOptions.supportsNewCodeScopeForMetric,
          supportsNewCodeScopeForPieChart: metricPickerOptions.supportsNewCodeScopeForPieChart,
          supportsPieChartSlice: metricPickerOptions.supportsPieChartSlice,
        }}
        renderOptions={({ dispatch, isEditMode, metricPickerOptions: options, state }) => (
          <ProjectWidgetOptions
            dispatch={dispatch}
            isEditMode={isEditMode}
            metricPickerOptions={options}
            state={state}
          />
        )}
        widgetBodyMap={widgetBodyMap}
        widgetHeaderMap={widgetHeaderMap}
      />,
    );

    expect(coverageOption).toBeDefined();

    await user.click(
      screen.getByRole('combobox', {
        name: 'dashboard.add_widget_modal.define_widget.visualization',
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'dashboard.add_widget_modal.define_widget.visualization.count',
      }),
    );
    await user.click(
      screen.getByRole('combobox', { name: 'dashboard.add_widget_modal.define_widget.metric' }),
    );
    await user.click(await screen.findByRole('option', { name: coverageOption?.label }));
    await user.click(
      screen.getByRole('button', { name: 'dashboard.add_widget_modal.add_to_dashboard' }),
    );

    expect(onSaveWidget).toHaveBeenCalledWith(
      expect.objectContaining({
        metric: { metricKey: MetricKey.coverage, type: 'raw' },
        widgetType: VisualizationType.Count,
      }),
    );
  });
});
