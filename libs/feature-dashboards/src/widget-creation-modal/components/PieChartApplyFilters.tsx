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

import { Select, Text, TextSize } from '@sonarsource/echoes-react';
import { Dispatch, type ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  PieChartFilter,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartMetric,
} from '../../types/dashboard-widget';
import { CodeScope } from '../../types/widget-common';
import type { PieChartConfig, WidgetConfigAction } from '../state/widgetConfigTypes';
import {
  buildPieChartFilterSelectOptions,
  buildPieChartScopeSelectData,
} from './applyFilterAccordionHelpers';
import {
  ApplyFiltersAccordionContent,
  ApplyFiltersAccordionShell,
  type ApplyFiltersAccordionShellProps,
  ApplyFiltersWarning,
} from './ApplyFiltersAccordionShell';

interface PieChartScopeControlParams {
  dispatch: Dispatch<WidgetConfigAction>;
  formatMessage: ReturnType<typeof useIntl>['formatMessage'];
  isPortfolioWidgetConfigurator: boolean;
  pieChartMetric: PieChartMetric | null;
  pieChartScope: CodeScope;
}

function buildPieChartScopeControl({
  dispatch,
  formatMessage,
  isPortfolioWidgetConfigurator,
  pieChartMetric,
  pieChartScope,
}: PieChartScopeControlParams): ReactNode {
  if (pieChartMetric === PieChartMetric.LineCount) {
    return (
      <Text isSubtle size={TextSize.Small}>
        <FormattedMessage id="dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.line_count" />
      </Text>
    );
  }
  if (isPortfolioWidgetConfigurator && pieChartMetric === PieChartMetric.ProjectCount) {
    return (
      <Text isSubtle size={TextSize.Small}>
        <FormattedMessage id="dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.quality_gate_status" />
      </Text>
    );
  }
  if (isPortfolioWidgetConfigurator) {
    // Portfolio issue/hotspot pies are backed by issue-count-history, which has no leak-period
    // filter, so scope is locked to Overall — mirror the Top List behaviour rather than offering a
    // select that silently clamps back to Overall.
    return (
      <Text isSubtle size={TextSize.Small}>
        <FormattedMessage id="dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.issue_count_history" />
      </Text>
    );
  }
  return (
    <Select
      data={buildPieChartScopeSelectData(formatMessage)}
      isNotClearable
      label={formatMessage({
        id: 'dashboard.add_widget_modal.apply_filters_section.select.scope.label',
      })}
      onChange={(value) => {
        dispatch({ type: 'SET_PIE_SCOPE', scope: value as CodeScope });
      }}
      value={pieChartScope}
    />
  );
}

export interface PieChartApplyFiltersProps extends Omit<
  ApplyFiltersAccordionShellProps,
  'children'
> {
  dispatch: Dispatch<WidgetConfigAction>;
  isPortfolioWidgetConfigurator: boolean;
  pieConfig: PieChartConfig;
}

export function PieChartApplyFilters({
  dispatch,
  isPortfolioWidgetConfigurator,
  pieConfig,
  ...shellProps
}: Readonly<PieChartApplyFiltersProps>) {
  const { formatMessage } = useIntl();
  const {
    metric: pieChartMetric,
    slice: pieChartSlice,
    scope: pieChartScope,
    filter: pieChartFilter,
  } = pieConfig;

  const disablePieFilterSelect =
    (pieChartMetric === PieChartMetric.HotspotCount &&
      pieChartSlice === PieChartHotspotSlice.ReviewStatus) ||
    pieChartMetric === PieChartMetric.ProjectCount ||
    (pieChartMetric === PieChartMetric.IssueCount &&
      pieChartSlice === PieChartIssueSlice.ImpactSoftwareQualities);
  const pieFilterDisabledHelpMessageId =
    pieChartMetric === PieChartMetric.HotspotCount &&
    pieChartSlice === PieChartHotspotSlice.ReviewStatus
      ? 'dashboard.add_widget_modal.apply_filters.pie_hotspot_review_status_slice_filter_help'
      : 'dashboard.add_widget_modal.apply_filters.pie_software_quality_slice_help';

  const pieScopeControl = buildPieChartScopeControl({
    dispatch,
    formatMessage,
    isPortfolioWidgetConfigurator,
    pieChartMetric,
    pieChartScope,
  });

  return (
    <ApplyFiltersAccordionShell {...shellProps}>
      {!pieChartMetric || !pieChartSlice ? (
        <ApplyFiltersWarning />
      ) : (
        <ApplyFiltersAccordionContent>
          {pieScopeControl}

          {pieChartMetric !== PieChartMetric.LineCount &&
            pieChartMetric !== PieChartMetric.ProjectCount && (
              <Select
                data={buildPieChartFilterSelectOptions(pieChartMetric, formatMessage)}
                helpText={
                  disablePieFilterSelect
                    ? formatMessage({
                        id: pieFilterDisabledHelpMessageId,
                      })
                    : undefined
                }
                isDisabled={disablePieFilterSelect}
                label={formatMessage({
                  id: 'dashboard.add_widget_modal.apply_filters_section.pie_filter.label',
                })}
                onChange={(value) => {
                  dispatch({ type: 'SET_PIE_FILTER', filter: value as PieChartFilter | '' });
                }}
                value={pieChartFilter}
              />
            )}
        </ApplyFiltersAccordionContent>
      )}
    </ApplyFiltersAccordionShell>
  );
}
