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

import { Dispatch } from 'react';
import type { MetricKey } from '~shared/types/metrics';
import type { WidgetMetricPickerOptions } from '../../types/widget-common';
import type { WidgetModalAccordionOpenState } from '../hooks/widgetModalAccordionOpenStateTypes';
import type { WidgetConfigAction, WidgetConfigState } from '../state/widgetConfigTypes';
import { ApplyFilterAccordion } from './ApplyFilterAccordion';
import { CustomizeVisualizationAccordion } from './CustomizeVisualizationAccordion';
import { DefineWidgetAccordion } from './DefineWidgetAccordion';
import type { WidgetModalAccordionComponent } from './modalAccordionTypes';

interface Props {
  accordion: WidgetModalAccordionComponent;
  accordionState: WidgetModalAccordionOpenState;
  defaultDefineWidgetDocumentationUrl: string;
  dispatch: Dispatch<WidgetConfigAction>;
  isEditMode?: boolean;
  isPortfolioPieChartConfigurator: boolean;
  isPortfolioWidgetConfigurator: boolean;
  isRatingBadgeBreakdownEligibleForMetric: (metricKey: MetricKey) => boolean;
  metricPickerOptions: WidgetMetricPickerOptions;
  state: WidgetConfigState;
}

export function DashboardWidgetOptions({
  accordion: Accordion,
  accordionState,
  defaultDefineWidgetDocumentationUrl,
  dispatch,
  isEditMode,
  isPortfolioPieChartConfigurator,
  isPortfolioWidgetConfigurator,
  isRatingBadgeBreakdownEligibleForMetric,
  metricPickerOptions,
  state,
}: Readonly<Props>) {
  return (
    <div
      className="sw-basis-[40%] sw-flex-[2] sw-min-h-0 sw-min-w-0 sw-flex sw-flex-col sw-gap-3 sw-overflow-y-auto sw-overflow-x-hidden sw-p-1"
      data-testid="widget-options-pane"
    >
      <DefineWidgetAccordion
        Accordion={Accordion}
        defaultDefineWidgetDocumentationUrl={defaultDefineWidgetDocumentationUrl}
        defineWidgetAccordionOpen={accordionState.defineWidgetAccordionOpen}
        dispatch={dispatch}
        isEditMode={isEditMode}
        isPortfolioPieChartConfigurator={isPortfolioPieChartConfigurator}
        metricPickerOptions={metricPickerOptions}
        setDefineWidgetAccordionOpen={accordionState.setDefineWidgetAccordionOpen}
        state={state}
      />
      <ApplyFilterAccordion
        Accordion={Accordion}
        applyFiltersAccordionOpen={accordionState.applyFiltersAccordionOpen}
        dispatch={dispatch}
        isPortfolioWidgetConfigurator={isPortfolioWidgetConfigurator}
        metricPickerOptions={metricPickerOptions}
        setApplyFiltersAccordionOpen={accordionState.setApplyFiltersAccordionOpen}
        state={state}
      />
      <CustomizeVisualizationAccordion
        Accordion={Accordion}
        customizeVisualizationAccordionOpen={accordionState.customizeVisualizationAccordionOpen}
        dispatch={dispatch}
        isRatingBadgeBreakdownEligibleForMetric={isRatingBadgeBreakdownEligibleForMetric}
        setCustomizeVisualizationAccordionOpen={
          accordionState.setCustomizeVisualizationAccordionOpen
        }
        state={state}
      />
    </div>
  );
}
