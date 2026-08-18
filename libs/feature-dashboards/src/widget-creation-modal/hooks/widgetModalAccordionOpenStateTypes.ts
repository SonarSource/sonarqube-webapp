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

import type { Dispatch, SetStateAction } from 'react';
import type { MetricKey } from '~shared/types/metrics';
import type { DashboardWidgetType } from '../../types/widget-common';

export interface WidgetModalAccordionOpenStateInput {
  configs: Partial<Record<DashboardWidgetType, unknown>>;
  selectedType: DashboardWidgetType | null;
}

export interface WidgetModalAccordionOpenState {
  applyFiltersAccordionOpen: boolean;
  customizeVisualizationAccordionOpen: boolean;
  defineWidgetAccordionOpen: boolean;
  setApplyFiltersAccordionOpen: Dispatch<SetStateAction<boolean>>;
  setCustomizeVisualizationAccordionOpen: Dispatch<SetStateAction<boolean>>;
  setDefineWidgetAccordionOpen: Dispatch<SetStateAction<boolean>>;
}

export interface WidgetModalAccordionSuggestions {
  applyFiltersAccordionOpen: boolean;
  customizeVisualizationAccordionOpen: boolean;
}

export type IsPortfolioRatingBadgeBreakdownMetricKey = (metricKey: MetricKey | null) => boolean;
