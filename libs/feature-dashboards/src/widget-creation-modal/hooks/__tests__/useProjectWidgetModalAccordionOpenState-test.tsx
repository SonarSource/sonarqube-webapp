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

import { act, renderHook, waitFor } from '@testing-library/react';
import { MetricKey } from '~shared/types/metrics';
import { PieChartIssueSlice, PieChartMetric } from '../../../types/dashboard-widget';
import { VisualizationType } from '../../../types/widget-common';
import {
  createInitialCountConfig,
  createInitialLineChartConfig,
  createInitialPieChartConfig,
  createInitialRatingBadgeConfig,
} from '../../state/widgetConfigInitialState';
import type {
  PieChartConfig,
  RatingBadgeConfig,
  WidgetConfigState,
} from '../../state/widgetConfigTypes';
import { useProjectWidgetModalAccordionOpenState } from '../useProjectWidgetModalAccordionOpenState';

describe('useProjectWidgetModalAccordionOpenState', () => {
  it('closes apply-filters when no visualization is selected', async () => {
    const state: WidgetConfigState = { configs: {}, selectedType: null };
    const { result, rerender } = renderHook(
      ({ s }: { s: WidgetConfigState }) => useProjectWidgetModalAccordionOpenState(s),
      { initialProps: { s: state } },
    );

    await waitFor(() => {
      expect(result.current.applyFiltersAccordionOpen).toBe(false);
    });

    rerender({
      s: {
        configs: { [VisualizationType.PieChart]: createInitialPieChartConfig() },
        selectedType: VisualizationType.PieChart,
      },
    });

    await waitFor(() => {
      expect(result.current.applyFiltersAccordionOpen).toBe(false);
    });
  });

  it('opens apply-filters when pie chart has metric and slice', async () => {
    const pieConfig: PieChartConfig = {
      ...createInitialPieChartConfig(),
      complete: true,
      filter: '' as PieChartConfig['filter'],
      metric: PieChartMetric.IssueCount,
      slice: PieChartIssueSlice.ImpactSeverities,
    };
    const state: WidgetConfigState = {
      configs: { [VisualizationType.PieChart]: pieConfig },
      selectedType: VisualizationType.PieChart,
    };

    const { result } = renderHook(() => useProjectWidgetModalAccordionOpenState(state));

    await waitFor(() => {
      expect(result.current.applyFiltersAccordionOpen).toBe(true);
    });
  });

  it('opens customize visualization for quality gate rating badge', async () => {
    const ratingConfig: RatingBadgeConfig = {
      ...createInitialRatingBadgeConfig(),
      complete: true,
      metricKey: MetricKey.alert_status,
    };
    const state: WidgetConfigState = {
      configs: { [VisualizationType.RatingBadge]: ratingConfig },
      selectedType: VisualizationType.RatingBadge,
    };

    const { result } = renderHook(() => useProjectWidgetModalAccordionOpenState(state));

    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          customizeVisualizationAccordionOpen: true,
          applyFiltersAccordionOpen: true,
        }),
      );
    });
  });

  it('opens customize visualization when count widget is selected', async () => {
    const state: WidgetConfigState = {
      configs: { [VisualizationType.Count]: createInitialCountConfig() },
      selectedType: VisualizationType.Count,
    };

    const { result } = renderHook(() => useProjectWidgetModalAccordionOpenState(state));

    await waitFor(() => {
      expect(result.current.customizeVisualizationAccordionOpen).toBe(true);
    });
  });

  it('keeps customize visualization closed after user toggles it off without config changes', async () => {
    const state: WidgetConfigState = {
      configs: { [VisualizationType.Count]: createInitialCountConfig() },
      selectedType: VisualizationType.Count,
    };

    const { result, rerender } = renderHook(
      ({ s }: { s: WidgetConfigState }) => useProjectWidgetModalAccordionOpenState(s),
      { initialProps: { s: state } },
    );

    await waitFor(() => {
      expect(result.current.customizeVisualizationAccordionOpen).toBe(true);
    });

    act(() => {
      result.current.setCustomizeVisualizationAccordionOpen(false);
    });

    expect(result.current.customizeVisualizationAccordionOpen).toBe(false);

    rerender({ s: state });

    await waitFor(() => {
      expect(result.current.customizeVisualizationAccordionOpen).toBe(false);
    });
  });

  it('closes customize visualization when switching from count to line chart', async () => {
    const countState: WidgetConfigState = {
      configs: { [VisualizationType.Count]: createInitialCountConfig() },
      selectedType: VisualizationType.Count,
    };
    const { result, rerender } = renderHook(
      ({ s }: { s: WidgetConfigState }) => useProjectWidgetModalAccordionOpenState(s),
      { initialProps: { s: countState } },
    );

    await waitFor(() => {
      expect(result.current.customizeVisualizationAccordionOpen).toBe(true);
    });

    rerender({
      s: {
        configs: { [VisualizationType.LineChart]: createInitialLineChartConfig() },
        selectedType: VisualizationType.LineChart,
      },
    });

    await waitFor(() => {
      expect(result.current.customizeVisualizationAccordionOpen).toBe(false);
    });
  });
});
