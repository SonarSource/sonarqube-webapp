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
import { FormattedMessage, useIntl } from 'react-intl';
import { HistoryRange } from '../../data/widgets/line-chart';
import type { LineChartHistorySlice } from '../hooks/applyFiltersViewModelSlices';
import { buildLineChartTimeRangeSelectData } from './applyFilterAccordionHelpers';

interface MetricWidgetLineChartHistorySelectProps {
  slice: LineChartHistorySlice;
}

export function MetricWidgetLineChartHistorySelect({
  slice,
}: Readonly<MetricWidgetLineChartHistorySelectProps>) {
  const { formatMessage } = useIntl();
  const { setValue, value } = slice;

  return (
    <Select
      data={buildLineChartTimeRangeSelectData(formatMessage)}
      isNotClearable
      label={
        <FormattedMessage id="dashboard.add_widget_modal.apply_filters_section.select.time_range.label" />
      }
      onChange={(nextValue) => {
        setValue(nextValue as HistoryRange);
      }}
      value={value}
    />
  );
}
