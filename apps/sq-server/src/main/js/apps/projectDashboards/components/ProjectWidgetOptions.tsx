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

import { type ComponentProps, type Dispatch } from 'react';
import type { WidgetMetricPickerOptions } from '~feature-dashboards/types/widget-common';
import { DashboardWidgetOptions } from '~feature-dashboards/widget-creation-modal/components/DashboardWidgetOptions';
import type { WidgetModalAccordionComponent } from '~feature-dashboards/widget-creation-modal/components/modalAccordionTypes';
import { useProjectWidgetModalAccordionOpenState } from '~feature-dashboards/widget-creation-modal/hooks/useProjectWidgetModalAccordionOpenState';
import type {
  WidgetConfigAction,
  WidgetConfigState,
} from '~feature-dashboards/widget-creation-modal/state/widgetConfigTypes';
import { Accordion } from '~shared/components/Accordion';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';

export function ProjectWidgetModalAccordion({
  children,
  isOpen,
  onToggle,
  title,
}: Readonly<ComponentProps<WidgetModalAccordionComponent>>) {
  return (
    <Accordion
      header={title}
      isOpen={isOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen !== isOpen) {
          onToggle();
        }
      }}
    >
      {children}
    </Accordion>
  );
}

interface Props {
  dispatch: Dispatch<WidgetConfigAction>;
  isEditMode?: boolean;
  metricPickerOptions: WidgetMetricPickerOptions;
  state: WidgetConfigState;
}

export function ProjectWidgetOptions({
  dispatch,
  isEditMode,
  metricPickerOptions,
  state,
}: Readonly<Props>) {
  const documentationUrl = useDocUrl(DocLink.MetricDefinitions);

  return (
    <DashboardWidgetOptions
      accordion={ProjectWidgetModalAccordion}
      accordionState={useProjectWidgetModalAccordionOpenState(state)}
      defaultDefineWidgetDocumentationUrl={documentationUrl}
      dispatch={dispatch}
      isEditMode={isEditMode}
      isPortfolioPieChartConfigurator={false}
      isPortfolioWidgetConfigurator={false}
      isRatingBadgeBreakdownEligibleForMetric={() => false}
      metricPickerOptions={metricPickerOptions}
      state={state}
    />
  );
}
