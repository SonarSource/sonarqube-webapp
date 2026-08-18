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

import { Dispatch, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import { IssueStatus, MeasureFilters } from '../../types/dashboard-widget';
import {
  CodeScope,
  VisualizationType,
  type WidgetMetricPickerOptions,
} from '../../types/widget-common';
import {
  applyIssueStatusMeasureFilters,
  applySeverityMeasureFilters,
  applySoftwareQualityMeasureFiltersPreservingSeverity,
  buildRichMetricIssueStatusSelectOptions,
  impactSeverityFilterValueForSelection,
} from '../components/applyFilterAccordionHelpers';
import type { TopListConfig, WidgetConfigAction } from '../state/widgetConfigTypes';
import { getMeasureFilterCapability } from '../utils/measureFilterConfig';
import {
  SCOPE_HELP_TEXT_NEW_CODE_UNAVAILABLE_ID,
  type RichMeasureFiltersSlice,
  type ScopeFilterSlice,
} from './applyFiltersViewModelSlices';

interface UseTopListApplyFiltersViewModelParams {
  dispatch: Dispatch<WidgetConfigAction>;
  metricPickerOptions: WidgetMetricPickerOptions;
  topListConfig: TopListConfig;
}

export interface TopListApplyFiltersViewModel {
  hasMetric: boolean;
  richMeasureFilters: RichMeasureFiltersSlice;
  scope: ScopeFilterSlice;
}

export function useTopListApplyFiltersViewModel({
  dispatch,
  metricPickerOptions,
  topListConfig,
}: Readonly<UseTopListApplyFiltersViewModelParams>): TopListApplyFiltersViewModel {
  const { formatMessage } = useIntl();
  const { complete, measureFilters, scope } = topListConfig;

  const filterCapability = useMemo(() => getMeasureFilterCapability(MetricKey.violations), []);

  const metricSupportsNewCodeScope =
    !metricPickerOptions.supportsNewCodeScopeForMetric ||
    metricPickerOptions.supportsNewCodeScopeForMetric(
      MetricKey.violations,
      VisualizationType.TopList,
    );

  const issueStatusSelectOptions = useMemo(
    () => buildRichMetricIssueStatusSelectOptions(formatMessage),
    [formatMessage],
  );

  const updateMeasureFilters = useCallback(
    (newMeasureFilters: MeasureFilters) => {
      dispatch({
        measureFilters: newMeasureFilters,
        type: 'SET_TOP_LIST_MEASURE_FILTERS',
      });
    },
    [dispatch],
  );

  const setScope = useCallback(
    (nextScope: CodeScope) => {
      dispatch({ scope: nextScope, type: 'SET_SCOPE' });
    },
    [dispatch],
  );

  const setIssueStatusFilter = useCallback(
    (status: IssueStatus | '') => {
      updateMeasureFilters(applyIssueStatusMeasureFilters(measureFilters, status));
    },
    [measureFilters, updateMeasureFilters],
  );

  const setSoftwareQualityFilter = useCallback(
    (quality: SoftwareQuality | '') => {
      updateMeasureFilters(
        applySoftwareQualityMeasureFiltersPreservingSeverity(measureFilters, quality),
      );
    },
    [measureFilters, updateMeasureFilters],
  );

  const setSeverityFilter = useCallback(
    (option: string) => {
      updateMeasureFilters(applySeverityMeasureFilters(measureFilters, option));
    },
    [measureFilters, updateMeasureFilters],
  );

  const isScopeSelectDisabled = !metricSupportsNewCodeScope;
  const scopeHelpText = isScopeSelectDisabled
    ? formatMessage({ id: SCOPE_HELP_TEXT_NEW_CODE_UNAVAILABLE_ID })
    : undefined;

  const scopeSlice: ScopeFilterSlice = {
    isQualityGateStatus: false,
    isScopeSelectDisabled,
    scope,
    scopeHelpText,
    setScope,
  };

  const richMeasureFiltersSlice: RichMeasureFiltersSlice = {
    filterCapability,
    isIssueStatusFilterDisabled: false,
    isSoftwareQualityFilterDisabled: false,
    issueStatusSelectOptions,
    issueStatusValue: measureFilters?.issueStatus ?? '',
    setIssueStatusFilter,
    setSeverityFilter,
    setSoftwareQualityFilter,
    severityFilterValue: impactSeverityFilterValueForSelection(measureFilters?.impactSeverities),
    showSeverityFilter: filterCapability.supportsSeverityFilter,
    softwareQualityFilterDisabledHelp: undefined,
    softwareQualityValue: measureFilters?.impactSoftwareQuality ?? '',
    statusFilterHelpText: undefined,
  };

  return {
    hasMetric: complete,
    richMeasureFilters: richMeasureFiltersSlice,
    scope: scopeSlice,
  };
}
