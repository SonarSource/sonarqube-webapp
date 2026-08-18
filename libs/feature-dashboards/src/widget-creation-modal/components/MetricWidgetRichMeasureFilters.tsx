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

import { Select } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { IssueStatus } from '../../types/dashboard-widget';
import type { RichMeasureFiltersSlice } from '../hooks/applyFiltersViewModelSlices';
import {
  buildImpactSeveritySelectOptions,
  buildSoftwareQualitySelectOptions,
} from './applyFilterAccordionHelpers';

interface MetricWidgetRichMeasureFiltersProps {
  slice: RichMeasureFiltersSlice;
}

export function MetricWidgetRichMeasureFilters({
  slice,
}: Readonly<MetricWidgetRichMeasureFiltersProps>) {
  const { formatMessage } = useIntl();
  const {
    filterCapability,
    isIssueStatusFilterDisabled,
    isSoftwareQualityFilterDisabled,
    issueStatusSelectOptions,
    issueStatusValue,
    setIssueStatusFilter,
    setSeverityFilter,
    setSoftwareQualityFilter,
    severityFilterValue,
    showSeverityFilter,
    softwareQualityFilterDisabledHelp,
    softwareQualityValue,
    statusFilterHelpText,
  } = slice;

  return (
    <>
      {filterCapability.supportsStatusFilter && (
        <Select
          data={issueStatusSelectOptions}
          helpText={statusFilterHelpText}
          isDisabled={isIssueStatusFilterDisabled}
          label={formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters_section.select.status.label',
          })}
          onChange={(value) => {
            setIssueStatusFilter(value as IssueStatus | '');
          }}
          value={issueStatusValue}
        />
      )}

      {filterCapability.supportsSoftwareQualityFilter && (
        <Select
          data={buildSoftwareQualitySelectOptions(formatMessage)}
          helpText={softwareQualityFilterDisabledHelp}
          isDisabled={isSoftwareQualityFilterDisabled}
          label={formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label',
          })}
          onChange={(value) => {
            setSoftwareQualityFilter(value as SoftwareQuality | '');
          }}
          value={softwareQualityValue}
        />
      )}

      {showSeverityFilter && (
        <Select
          data={buildImpactSeveritySelectOptions(formatMessage)}
          label={formatMessage({
            id: 'dashboard.add_widget_modal.apply_filters_section.select.severity.label',
          })}
          onChange={(value) => {
            setSeverityFilter(value ?? 'all');
          }}
          value={severityFilterValue}
        />
      )}
    </>
  );
}
