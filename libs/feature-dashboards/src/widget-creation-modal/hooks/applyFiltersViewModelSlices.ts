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

import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { HistoryRange } from '../../data/widgets/line-chart';
import { IssueStatus } from '../../types/dashboard-widget';
import { CodeScope } from '../../types/widget-common';
import type { MeasureFilterCapability } from '../utils/measureFilterConfig';

/** Message key shown in the scope select help text when the selected metric does not support new code. */
export const SCOPE_HELP_TEXT_NEW_CODE_UNAVAILABLE_ID =
  'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.new_code_unavailable';

/**
 * Scope (Overall / New code) select used by every apply-filters child.
 *
 * `isQualityGateStatus` collapses the select into a static help line; both Top 5 List and
 * non-line-chart metric widgets always set this to `false`, but it is a genuine fact about
 * the current metric rather than a stub.
 */
export interface ScopeFilterSlice {
  isQualityGateStatus: boolean;
  isScopeSelectDisabled: boolean;
  scope: CodeScope;
  scopeHelpText: string | undefined;
  setScope: (scope: CodeScope) => void;
}

/** Line-chart-only history range picker. Present only when the visualization is a line chart. */
export interface LineChartHistorySlice {
  isPortfolio: boolean;
  setValue: (value: HistoryRange) => void;
  value: HistoryRange;
}

/**
 * Rich measure filters (status / software quality / severity).
 *
 * The slice is only present when {@link MeasureFilterCapability} indicates the metric supports
 * at least one of these filters, so `filterCapability` is non-nullable here.
 */
export interface RichMeasureFiltersSlice {
  filterCapability: MeasureFilterCapability;
  isIssueStatusFilterDisabled: boolean;
  isSoftwareQualityFilterDisabled: boolean;
  issueStatusSelectOptions: Array<{ label: string; value: IssueStatus | '' }>;
  issueStatusValue: IssueStatus | '';
  setIssueStatusFilter: (status: IssueStatus | '') => void;
  setSeverityFilter: (option: string) => void;
  setSoftwareQualityFilter: (quality: SoftwareQuality | '') => void;
  severityFilterValue: string;
  showSeverityFilter: boolean;
  softwareQualityFilterDisabledHelp: string | undefined;
  softwareQualityValue: SoftwareQuality | '';
  statusFilterHelpText: string | undefined;
}
