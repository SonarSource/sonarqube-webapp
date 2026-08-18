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
import { VisualizationType } from '../../types/widget-common';
import type {
  IsPortfolioRatingBadgeBreakdownMetricKey,
  WidgetModalAccordionOpenStateInput,
  WidgetModalAccordionSuggestions,
} from './widgetModalAccordionOpenStateTypes';

const CLOSED: WidgetModalAccordionSuggestions = {
  applyFiltersAccordionOpen: false,
  customizeVisualizationAccordionOpen: false,
};

export function deriveWidgetModalAccordionSuggestions(
  state: WidgetModalAccordionOpenStateInput,
  isPortfolioRatingBadgeBreakdownMetricKey?: IsPortfolioRatingBadgeBreakdownMetricKey,
): WidgetModalAccordionSuggestions {
  if (state.selectedType === null) {
    return CLOSED;
  }

  const currentConfig = state.configs[state.selectedType];
  if (!currentConfig) {
    return CLOSED;
  }

  switch (state.selectedType) {
    case VisualizationType.PieChart:
    case VisualizationType.DonutChart: {
      const pieConfig = currentConfig as { metric: unknown; slice: unknown };
      return {
        applyFiltersAccordionOpen: pieConfig.metric !== null && pieConfig.slice !== null,
        customizeVisualizationAccordionOpen: false,
      };
    }
    case VisualizationType.LineChart: {
      const metricConfig = currentConfig as { metric: unknown };
      return {
        applyFiltersAccordionOpen: metricConfig.metric !== null,
        customizeVisualizationAccordionOpen: false,
      };
    }
    case VisualizationType.Count: {
      const metricConfig = currentConfig as { metric: unknown };
      return {
        applyFiltersAccordionOpen: metricConfig.metric !== null,
        customizeVisualizationAccordionOpen: true,
      };
    }
    case VisualizationType.TopList: {
      const topListConfig = currentConfig as { metric: unknown; rankBy: unknown };
      return {
        applyFiltersAccordionOpen: topListConfig.metric !== null && topListConfig.rankBy !== null,
        customizeVisualizationAccordionOpen: false,
      };
    }
    case VisualizationType.RatingBadge: {
      const ratingBadgeConfig = currentConfig as { metricKey: MetricKey | null };
      const isQualityGateBadge = ratingBadgeConfig.metricKey === MetricKey.alert_status;
      const hasPortfolioBreakdown =
        isPortfolioRatingBadgeBreakdownMetricKey?.(ratingBadgeConfig.metricKey) ?? false;
      return {
        // Scope (overall / new code) and QG copy live under Apply filters — open when a metric is chosen.
        applyFiltersAccordionOpen: ratingBadgeConfig.metricKey !== null,
        customizeVisualizationAccordionOpen: isQualityGateBadge || hasPortfolioBreakdown,
      };
    }
    default:
      return CLOSED;
  }
}
