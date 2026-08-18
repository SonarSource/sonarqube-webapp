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

import { useEffect, useMemo, useState } from 'react';
import { deriveWidgetModalAccordionSuggestions } from './deriveWidgetModalAccordionSuggestions';
import type {
  IsPortfolioRatingBadgeBreakdownMetricKey,
  WidgetModalAccordionOpenState,
  WidgetModalAccordionOpenStateInput,
} from './widgetModalAccordionOpenStateTypes';

export type PortfolioWidgetModalAccordionOpenStateInput = WidgetModalAccordionOpenStateInput;
export type PortfolioWidgetModalAccordionOpenState = WidgetModalAccordionOpenState;

export function usePortfolioWidgetModalAccordionOpenState(
  state: PortfolioWidgetModalAccordionOpenStateInput,
  isPortfolioRatingBadgeBreakdownMetricKey: IsPortfolioRatingBadgeBreakdownMetricKey,
): PortfolioWidgetModalAccordionOpenState {
  const [defineWidgetAccordionOpen, setDefineWidgetAccordionOpen] = useState(true);
  const [applyFiltersAccordionOpen, setApplyFiltersAccordionOpen] = useState(false);
  const [customizeVisualizationAccordionOpen, setCustomizeVisualizationAccordionOpen] =
    useState(false);

  const suggestions = useMemo(
    () => deriveWidgetModalAccordionSuggestions(state, isPortfolioRatingBadgeBreakdownMetricKey),
    [isPortfolioRatingBadgeBreakdownMetricKey, state],
  );

  useEffect(() => {
    setApplyFiltersAccordionOpen(suggestions.applyFiltersAccordionOpen);
    setCustomizeVisualizationAccordionOpen(suggestions.customizeVisualizationAccordionOpen);
  }, [suggestions.applyFiltersAccordionOpen, suggestions.customizeVisualizationAccordionOpen]);

  return {
    applyFiltersAccordionOpen,
    customizeVisualizationAccordionOpen,
    defineWidgetAccordionOpen,
    setApplyFiltersAccordionOpen,
    setCustomizeVisualizationAccordionOpen,
    setDefineWidgetAccordionOpen,
  };
}
