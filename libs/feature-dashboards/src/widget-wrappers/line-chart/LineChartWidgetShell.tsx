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

import { MessageInline, MessageInlineSize, MessageVariety } from '@sonarsource/echoes-react';
import { type ComponentProps } from 'react';
import { useIntl } from 'react-intl';
import { useFlags } from '~adapters/helpers/feature-flags';
import { LineChart } from '../../components/visualizations/line-chart/LineChart';
import { MultiLineChart } from '../../components/visualizations/multi-line-chart/MultiLineChart';
import { getLimitedHistoryStartDate } from '../../utils/lineChartHistoryUtils';

export type LineChartWidgetShellProps = Readonly<
  Omit<ComponentProps<typeof MultiLineChart>, 'ref'> & {
    metricName: string;
    requestedStartDate?: Date;
  }
>;

export function LineChartWidgetShell(props: LineChartWidgetShellProps) {
  const { organizationReportingEnableNewDashboardWidgets } = useFlags();
  const { formatDate, formatMessage } = useIntl();
  const { hasFetchError, isPending, metricName, requestedStartDate, series, ...rest } = props;
  const renderedSeries = organizationReportingEnableNewDashboardWidgets
    ? series
    : series.slice(0, 1);
  const limitedHistoryStartDate =
    !hasFetchError && !isPending && requestedStartDate !== undefined
      ? getLimitedHistoryStartDate(renderedSeries, requestedStartDate)
      : undefined;

  return (
    <div className="sw-h-full sw-min-h-0 sw-flex sw-flex-col sw-gap-4">
      <div className="sw-flex-1 sw-min-h-0">
        {organizationReportingEnableNewDashboardWidgets ? (
          <MultiLineChart
            {...rest}
            hasFetchError={hasFetchError}
            isPending={isPending}
            series={series}
          />
        ) : (
          <LineChart
            {...rest}
            data={series[0]?.data ?? []}
            hasFetchError={hasFetchError}
            isPending={isPending}
            metricName={metricName}
            showDots
          />
        )}
      </div>
      {limitedHistoryStartDate && (
        <MessageInline
          className="sw-flex-shrink-0 sw-self-start"
          size={MessageInlineSize.Small}
          variety={MessageVariety.Info}
        >
          {formatMessage(
            { id: 'dashboard.line_chart.limited_history_warning' },
            {
              date: formatDate(limitedHistoryStartDate, {
                day: 'numeric',
                month: 'long',
                timeZone: 'UTC',
                year: 'numeric',
              }),
            },
          )}
        </MessageInline>
      )}
    </div>
  );
}
