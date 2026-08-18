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

import { act, renderHook } from '@testing-library/react';
import type { SetStateAction } from 'react';
import { MetricKey } from '~shared/types/metrics';
import type { DashboardInstance, WidgetInstance } from '../../../dashboard-layout/logic/types';
import {
  DashboardMetricType,
  type ProjectDashboardWidgetPropMap,
} from '../../../types/dashboard-widget';
import { CodeScope, VisualizationType } from '../../../types/widget-common';
import { useEditWidget } from '../useEditWidget';

function resolveDashboardSetStateAction(
  current: DashboardInstance<ProjectDashboardWidgetPropMap>,
  updater: SetStateAction<DashboardInstance<ProjectDashboardWidgetPropMap>>,
): DashboardInstance<ProjectDashboardWidgetPropMap> {
  return typeof updater === 'function' ? updater(current) : updater;
}

describe('useEditWidget', () => {
  it('opens modal with initial props and saves updated count config', () => {
    const widget: WidgetInstance<ProjectDashboardWidgetPropMap> = {
      dimensions: { height: 2, width: 2 },
      key: 'widget-1',
      position: { x: 0, y: 0 },
      props: {
        metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
        scope: CodeScope.Overall,
      },
      type: 'count',
    };

    const dashboard: DashboardInstance<ProjectDashboardWidgetPropMap> = {
      children: [{ children: [widget], type: 'implicit' }],
    };

    let currentDashboard: DashboardInstance<ProjectDashboardWidgetPropMap> = dashboard;
    const setDashboard = jest.fn(
      (updater: SetStateAction<DashboardInstance<ProjectDashboardWidgetPropMap>>) => {
        currentDashboard = resolveDashboardSetStateAction(currentDashboard, updater);
      },
    );

    const { result } = renderHook(() =>
      useEditWidget({ setDashboardWithUnsavedChanges: setDashboard }),
    );

    act(() => {
      result.current.handleOpenEditWidget(0, widget);
    });

    expect(result.current.isEditWidgetModalOpen).toBe(true);
    expect(result.current.initialWidgetProps).toEqual({
      widgetType: VisualizationType.Count,
      metric: widget.props.metric,
      scope: CodeScope.Overall,
    });

    act(() => {
      result.current.handleSaveEditWidget({
        metric: { metricKey: MetricKey.coverage, type: DashboardMetricType.Raw },
        scope: CodeScope.New,
        showTrendIndicator: true,
        widgetType: VisualizationType.Count,
      });
    });

    expect(setDashboard).toHaveBeenCalled();
    /* DashboardInstance uses `children` for layout sections/widgets (not DOM nodes). */
    /* eslint-disable testing-library/no-node-access */
    const sections = currentDashboard.children;
    expect(sections).toHaveLength(1);
    const firstSection = sections[0];
    expect(firstSection.children).toHaveLength(1);
    const updatedWidget = firstSection.children[0];
    /* eslint-enable testing-library/no-node-access */
    expect(updatedWidget.props).toEqual(
      expect.objectContaining({
        metric: { metricKey: MetricKey.coverage, type: DashboardMetricType.Raw },
        scope: CodeScope.New,
        showTrendIndicator: true,
      }),
    );
    expect(result.current.isEditWidgetModalOpen).toBe(false);
  });
});
