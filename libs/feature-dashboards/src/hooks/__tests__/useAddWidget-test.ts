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
import { MetricKey } from '~shared/types/metrics';
import { createEmptyDashboard } from '../../dashboard-layout/logic/constants';
import { HistoryRange, LineChartGroupBy } from '../../data/widgets/line-chart';
import {
  DashboardMetricType,
  RichMetricKey,
  type ProjectDashboardWidgetPropMap,
} from '../../types/dashboard-widget';
import { CodeScope, VisualizationType } from '../../types/widget-common';
import { isOutsideViewport, useAddWidget } from '../useAddWidget';

const widgetConfig = {
  metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw as const },
  scope: CodeScope.Overall,
  widgetType: VisualizationType.Count,
};

type DashboardSetter = Parameters<typeof useAddWidget>[0]['setDashboardWithUnsavedChanges'];

describe('useAddWidget', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('adds a widget to the selected section and clears the selection', () => {
    const dashboard = createEmptyDashboard<ProjectDashboardWidgetPropMap>('custom').layout;
    const setDashboardWithUnsavedChanges = jest.fn<
      ReturnType<DashboardSetter>,
      Parameters<DashboardSetter>
    >();
    const { result } = renderHook(() => useAddWidget({ setDashboardWithUnsavedChanges }));

    act(() => {
      result.current.handleAddWidgetToSection(0);
      result.current.handleAddWidget(widgetConfig);
    });

    const update = setDashboardWithUnsavedChanges.mock.calls[0][0] as (
      value: typeof dashboard,
    ) => typeof dashboard;
    const updated = update(dashboard);

    expect(updated).toEqual(
      expect.objectContaining({
        children: [
          expect.objectContaining({
            children: [
              expect.objectContaining({ position: { x: 0, y: 0 }, type: VisualizationType.Count }),
            ],
          }),
        ],
      }),
    );
    expect(result.current.targetSectionIndex).toBeNull();
  });

  it('clears the selected section when widget creation is cancelled', () => {
    const setDashboardWithUnsavedChanges = jest.fn<
      ReturnType<DashboardSetter>,
      Parameters<DashboardSetter>
    >();
    const { result } = renderHook(() => useAddWidget({ setDashboardWithUnsavedChanges }));

    act(() => {
      result.current.handleAddWidgetToSection(0);
    });
    expect(result.current.targetSectionIndex).toBe(0);

    act(() => {
      result.current.handleResetTargetSection();
    });
    expect(result.current.targetSectionIndex).toBeNull();
  });

  it('creates an implicit section when the dashboard has none', () => {
    const emptyDashboard = createEmptyDashboard<ProjectDashboardWidgetPropMap>('custom').layout;
    const dashboard = { children: [] } as typeof emptyDashboard;
    const setDashboardWithUnsavedChanges = jest.fn<
      ReturnType<DashboardSetter>,
      Parameters<DashboardSetter>
    >();
    const { result } = renderHook(() => useAddWidget({ setDashboardWithUnsavedChanges }));

    act(() => {
      result.current.handleAddWidget(widgetConfig);
    });

    const update = setDashboardWithUnsavedChanges.mock.calls[0][0] as (
      value: typeof dashboard,
    ) => typeof dashboard;
    const updated = update(dashboard);

    expect(updated).toEqual(
      expect.objectContaining({
        children: [
          expect.objectContaining({
            children: [expect.objectContaining({ type: VisualizationType.Count })],
            type: 'implicit',
          }),
        ],
      }),
    );
  });

  it('persists line chart grouping when adding a widget', () => {
    const dashboard = createEmptyDashboard<ProjectDashboardWidgetPropMap>('custom').layout;
    const setDashboardWithUnsavedChanges = jest.fn<
      ReturnType<DashboardSetter>,
      Parameters<DashboardSetter>
    >();
    const { result } = renderHook(() => useAddWidget({ setDashboardWithUnsavedChanges }));

    act(() => {
      result.current.handleAddWidget({
        groupBy: LineChartGroupBy.Severity,
        historyRange: HistoryRange.LastMonth,
        metric: { metricKey: RichMetricKey.Issues, type: DashboardMetricType.Rich },
        scope: CodeScope.Overall,
        showLegend: false,
        widgetType: VisualizationType.LineChart,
      });
    });

    const update = setDashboardWithUnsavedChanges.mock.calls[0][0] as (
      value: typeof dashboard,
    ) => typeof dashboard;

    expect(update(dashboard)).toMatchObject({
      children: [
        {
          children: [
            {
              props: {
                groupBy: LineChartGroupBy.Severity,
                historyRange: HistoryRange.LastMonth,
                scope: CodeScope.Overall,
              },
              type: VisualizationType.LineChart,
            },
          ],
        },
      ],
    });
  });

  it('scrolls an off-screen newly added widget into view', () => {
    const widgetElement = document.createElement('div');
    const scrollIntoView = jest.fn();
    widgetElement.scrollIntoView = scrollIntoView;
    jest.spyOn(widgetElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 900,
      left: 0,
      right: 300,
      top: 600,
    } as DOMRect);
    jest.spyOn(document, 'querySelector').mockReturnValue(widgetElement);
    jest.spyOn(globalThis, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);

    const setDashboardWithUnsavedChanges = jest.fn<
      ReturnType<DashboardSetter>,
      Parameters<DashboardSetter>
    >();
    const { result } = renderHook(() => useAddWidget({ setDashboardWithUnsavedChanges }));

    act(() => {
      result.current.handleAddWidgetToSection(0);
      result.current.handleAddWidget(widgetConfig);
      jest.runOnlyPendingTimers();
    });

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
  });

  it('does not scroll a newly added widget that is already visible', () => {
    const widgetElement = document.createElement('div');
    const scrollIntoView = jest.fn();
    widgetElement.scrollIntoView = scrollIntoView;
    jest.spyOn(widgetElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 300,
      left: 0,
      right: 300,
      top: 0,
    } as DOMRect);
    jest.spyOn(document, 'querySelector').mockReturnValue(widgetElement);

    const setDashboardWithUnsavedChanges = jest.fn<
      ReturnType<DashboardSetter>,
      Parameters<DashboardSetter>
    >();
    const { result } = renderHook(() => useAddWidget({ setDashboardWithUnsavedChanges }));

    act(() => {
      result.current.handleAddWidget(widgetConfig);
      jest.runOnlyPendingTimers();
    });

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('disables smooth scrolling when reduced motion is preferred', () => {
    const widgetElement = document.createElement('div');
    const scrollIntoView = jest.fn();
    widgetElement.scrollIntoView = scrollIntoView;
    jest.spyOn(widgetElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 900,
      left: 0,
      right: 300,
      top: 600,
    } as DOMRect);
    jest.spyOn(document, 'querySelector').mockReturnValue(widgetElement);
    jest.spyOn(globalThis, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);

    const setDashboardWithUnsavedChanges = jest.fn<
      ReturnType<DashboardSetter>,
      Parameters<DashboardSetter>
    >();
    const { result } = renderHook(() => useAddWidget({ setDashboardWithUnsavedChanges }));

    act(() => {
      result.current.handleAddWidget(widgetConfig);
      jest.runOnlyPendingTimers();
    });

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center',
    });
  });
});

describe('isOutsideViewport', () => {
  it.each([
    [{ top: -1, left: 0, bottom: 100, right: 100 }, true],
    [{ top: 0, left: -1, bottom: 100, right: 100 }, true],
    [{ top: 0, left: 0, bottom: 101, right: 100 }, true],
    [{ top: 0, left: 0, bottom: 100, right: 101 }, true],
    [{ top: 0, left: 0, bottom: 100, right: 100 }, false],
  ])('detects whether an element is outside the viewport', (elementRect, expected) => {
    expect(isOutsideViewport(elementRect, { height: 100, width: 100 })).toBe(expected);
  });
});
