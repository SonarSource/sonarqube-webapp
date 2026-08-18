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
import { MetricKey } from '~shared/types/metrics';
import { VisualizationType } from '../../../types/widget-common';
import {
  createInitialCountConfig,
  createInitialRatingBadgeConfig,
} from '../../state/widgetConfigInitialState';
import type { RatingBadgeConfig, WidgetConfigState } from '../../state/widgetConfigTypes';
import { usePortfolioWidgetModalAccordionOpenState } from '../usePortfolioWidgetModalAccordionOpenState';

describe('usePortfolioWidgetModalAccordionOpenState', () => {
  const isPortfolioRatingBadgeBreakdownMetricKey = (metricKey: MetricKey | null) =>
    metricKey === MetricKey.reliability_rating;

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

    const { result } = renderHook(() =>
      usePortfolioWidgetModalAccordionOpenState(state, isPortfolioRatingBadgeBreakdownMetricKey),
    );

    await waitFor(() => {
      expect(result.current.customizeVisualizationAccordionOpen).toBe(true);
    });
  });

  it('opens customize visualization for portfolio breakdown rating badge', async () => {
    const ratingConfig: RatingBadgeConfig = {
      ...createInitialRatingBadgeConfig(),
      complete: true,
      metricKey: MetricKey.reliability_rating,
    };
    const state: WidgetConfigState = {
      configs: { [VisualizationType.RatingBadge]: ratingConfig },
      selectedType: VisualizationType.RatingBadge,
    };

    const { result } = renderHook(() =>
      usePortfolioWidgetModalAccordionOpenState(state, isPortfolioRatingBadgeBreakdownMetricKey),
    );

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

    const { result } = renderHook(() =>
      usePortfolioWidgetModalAccordionOpenState(state, isPortfolioRatingBadgeBreakdownMetricKey),
    );

    await waitFor(() => {
      expect(result.current.customizeVisualizationAccordionOpen).toBe(true);
    });
  });
});
