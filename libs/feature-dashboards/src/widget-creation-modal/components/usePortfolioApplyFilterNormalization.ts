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

import { Dispatch, useEffect } from 'react';
import { HistoryRange } from '../../data/widgets/line-chart';
import { VisualizationType } from '../../types/widget-common';
import type { WidgetConfigAction, WidgetConfigState } from '../state/widgetConfigTypes';

interface UsePortfolioApplyFilterNormalizationParams {
  clampPortfolioLineChartHistoryRange?: (range: HistoryRange) => HistoryRange;
  dispatch: Dispatch<WidgetConfigAction>;
  isPortfolioWidgetConfigurator: boolean;
  state: WidgetConfigState;
}

/**
 * Keeps portfolio widget filter state within allowed values (line-chart history range).
 * No-op when {@link isPortfolioWidgetConfigurator} is false.
 */
export function usePortfolioApplyFilterNormalization({
  clampPortfolioLineChartHistoryRange,
  dispatch,
  isPortfolioWidgetConfigurator,
  state,
}: Readonly<UsePortfolioApplyFilterNormalizationParams>) {
  const lineChartConfigForPortfolioClamp =
    state.selectedType === VisualizationType.LineChart
      ? state.configs[VisualizationType.LineChart]
      : undefined;
  const portfolioLineChartRawHistoryRange = lineChartConfigForPortfolioClamp?.historyRange;
  const shouldClampPortfolioLineHistoryRange =
    isPortfolioWidgetConfigurator &&
    clampPortfolioLineChartHistoryRange !== undefined &&
    state.selectedType === VisualizationType.LineChart &&
    portfolioLineChartRawHistoryRange !== undefined;

  useEffect(() => {
    if (
      !shouldClampPortfolioLineHistoryRange ||
      portfolioLineChartRawHistoryRange === undefined ||
      !clampPortfolioLineChartHistoryRange
    ) {
      return;
    }
    const nextRange = clampPortfolioLineChartHistoryRange(portfolioLineChartRawHistoryRange);
    if (portfolioLineChartRawHistoryRange !== nextRange) {
      dispatch({
        historyRange: nextRange,
        type: 'SET_HISTORY_RANGE',
      });
    }
  }, [
    clampPortfolioLineChartHistoryRange,
    dispatch,
    portfolioLineChartRawHistoryRange,
    shouldClampPortfolioLineHistoryRange,
  ]);
}
